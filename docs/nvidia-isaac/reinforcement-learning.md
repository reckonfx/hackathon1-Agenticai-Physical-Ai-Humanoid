---
sidebar_label: Reinforcement Learning
title: Reinforcement Learning
---

# Reinforcement Learning

## Introduction to Reinforcement Learning in Robotics

Reinforcement Learning (RL) has emerged as a transformative approach for developing intelligent robotic systems, particularly for humanoid robots that require complex decision-making and adaptive behaviors. Unlike traditional control methods that rely on predefined models and rules, RL enables robots to learn optimal behaviors through trial and error interaction with their environment. For humanoid robots, this capability is crucial for mastering complex tasks such as locomotion, manipulation, and navigation in dynamic environments.

## Core Concepts of Reinforcement Learning

### Mathematical Framework

#### Markov Decision Process (MDP)
Reinforcement learning problems in robotics are typically formulated as Markov Decision Processes, which provide a mathematical framework for sequential decision-making:

- **States (S)**: The complete set of possible states the robot can be in (joint positions, velocities, environmental configuration)
- **Actions (A)**: The set of possible actions the robot can take (torque commands, joint positions, movement directions)
- **Rewards (R)**: Scalar feedback signal indicating the desirability of state transitions
- **Transition probabilities (P)**: Probability of transitioning from one state to another given an action
- **Discount factor (γ)**: Factor determining the importance of future rewards versus immediate rewards

#### Policy and Value Functions
- **Policy (π)**: Strategy that maps states to actions (deterministic or stochastic)
- **Value function (V)**: Expected cumulative reward from a given state following a policy
- **Action-value function (Q)**: Expected cumulative reward for taking an action in a state and following a policy thereafter

### RL Algorithm Taxonomy

#### Model-Free vs. Model-Based
- **Model-Free**: Learns directly from interaction, no explicit model of environment
- **Model-Based**: Learns environment dynamics model to plan ahead

#### Value-Based vs. Policy-Based
- **Value-Based**: Learns optimal value functions (e.g., Q-Learning, DQN)
- **Policy-Based**: Directly optimizes policy parameters (e.g., REINFORCE, PPO)
- **Actor-Critic**: Combines both approaches

## Deep Reinforcement Learning for Robotics

### Deep Q-Network (DQN)

#### Architecture for Continuous Control
```python
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import random
from collections import deque

class DQNRobotController(nn.Module):
    def __init__(self, state_dim, action_dim, hidden_dim=512):
        super(DQNRobotController, self).__init__()

        # State processing network
        self.state_processor = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU()
        )

        # Advantage and value streams for Dueling DQN
        self.advantage_stream = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim)
        )

        self.value_stream = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1)
        )

    def forward(self, state):
        """Forward pass through the network"""
        features = self.state_processor(state)

        advantages = self.advantage_stream(features)
        values = self.value_stream(features)

        # Dueling DQN: Q(s,a) = V(s) + (A(s,a) - mean(A(s,a')))
        q_values = values + (advantages - advantages.mean(dim=1, keepdim=True))

        return q_values

class DQNAgent:
    def __init__(self, state_dim, action_dim, lr=1e-4, gamma=0.99,
                 epsilon=1.0, epsilon_decay=0.995, epsilon_min=0.01):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min

        # Neural networks
        self.q_network = DQNRobotController(state_dim, action_dim)
        self.target_network = DQNRobotController(state_dim, action_dim)
        self.optimizer = optim.Adam(self.q_network.parameters(), lr=lr)

        # Experience replay buffer
        self.replay_buffer = deque(maxlen=100000)

        # Update target network
        self.update_target_network()

    def update_target_network(self):
        """Copy weights from main network to target network"""
        self.target_network.load_state_dict(self.q_network.state_dict())

    def remember(self, state, action, reward, next_state, done):
        """Store experience in replay buffer"""
        self.replay_buffer.append((state, action, reward, next_state, done))

    def act(self, state):
        """Choose action using epsilon-greedy policy"""
        if random.random() < self.epsilon:
            return random.randrange(self.action_dim)

        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        q_values = self.q_network(state_tensor)
        return q_values.argmax().item()

    def replay(self, batch_size=32):
        """Train the network on a batch of experiences"""
        if len(self.replay_buffer) < batch_size:
            return

        batch = random.sample(self.replay_buffer, batch_size)
        state_batch, action_batch, reward_batch, next_state_batch, done_batch = zip(*batch)

        state_batch = torch.FloatTensor(state_batch)
        action_batch = torch.LongTensor(action_batch)
        reward_batch = torch.FloatTensor(reward_batch)
        next_state_batch = torch.FloatTensor(next_state_batch)
        done_batch = torch.BoolTensor(done_batch)

        # Compute current Q values
        current_q_values = self.q_network(state_batch).gather(1, action_batch.unsqueeze(1))

        # Compute next Q values using target network
        next_q_values = self.target_network(next_state_batch).max(1)[0].detach()
        target_q_values = reward_batch + (self.gamma * next_q_values * ~done_batch)

        # Compute loss
        loss = nn.MSELoss()(current_q_values.squeeze(), target_q_values)

        # Optimize
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        # Decay epsilon
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

    def save_model(self, filepath):
        """Save the trained model"""
        torch.save({
            'q_network_state_dict': self.q_network.state_dict(),
            'target_network_state_dict': self.target_network.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
        }, filepath)

    def load_model(self, filepath):
        """Load a trained model"""
        checkpoint = torch.load(filepath)
        self.q_network.load_state_dict(checkpoint['q_network_state_dict'])
        self.target_network.load_state_dict(checkpoint['target_network_state_dict'])
        self.optimizer.load_dict(checkpoint['optimizer_state_dict'])
```

### Deep Deterministic Policy Gradient (DDPG)

#### Continuous Control for Robotics
```python
class Actor(nn.Module):
    def __init__(self, state_dim, action_dim, max_action, hidden_dim=256):
        super(Actor, self).__init__()

        self.l1 = nn.Linear(state_dim, hidden_dim)
        self.l2 = nn.Linear(hidden_dim, hidden_dim)
        self.l3 = nn.Linear(hidden_dim, action_dim)

        self.max_action = max_action

    def forward(self, state):
        """Forward pass through actor network"""
        a = torch.relu(self.l1(state))
        a = torch.relu(self.l2(a))
        return self.max_action * torch.tanh(self.l3(a))

class Critic(nn.Module):
    def __init__(self, state_dim, action_dim, hidden_dim=256):
        super(Critic, self).__init__()

        # Q1 architecture
        self.l1 = nn.Linear(state_dim + action_dim, hidden_dim)
        self.l2 = nn.Linear(hidden_dim, hidden_dim)
        self.l3 = nn.Linear(hidden_dim, 1)

        # Q2 architecture
        self.l4 = nn.Linear(state_dim + action_dim, hidden_dim)
        self.l5 = nn.Linear(hidden_dim, hidden_dim)
        self.l6 = nn.Linear(hidden_dim, 1)

    def forward(self, state, action):
        """Forward pass through critic network"""
        sa = torch.cat([state, action], 1)

        q1 = torch.relu(self.l1(sa))
        q1 = torch.relu(self.l2(q1))
        q1 = self.l3(q1)

        q2 = torch.relu(self.l4(sa))
        q2 = torch.relu(self.l5(q2))
        q2 = self.l6(q2)

        return q1, q2

    def Q1(self, state, action):
        """Forward pass for Q1 only"""
        sa = torch.cat([state, action], 1)

        q1 = torch.relu(self.l1(sa))
        q1 = torch.relu(self.l2(q1))
        q1 = self.l3(q1)
        return q1

class DDPGAgent:
    def __init__(self, state_dim, action_dim, max_action, lr_actor=1e-4, lr_critic=1e-3,
                 gamma=0.99, tau=0.005, noise_std=0.2):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.max_action = max_action
        self.gamma = gamma
        self.tau = tau
        self.noise_std = noise_std

        # Networks
        self.actor = Actor(state_dim, action_dim, max_action)
        self.actor_target = Actor(state_dim, action_dim, max_action)
        self.actor_target.load_state_dict(self.actor.state_dict())
        self.actor_optimizer = optim.Adam(self.actor.parameters(), lr=lr_actor)

        self.critic = Critic(state_dim, action_dim)
        self.critic_target = Critic(state_dim, action_dim)
        self.critic_target.load_state_dict(self.critic.state_dict())
        self.critic_optimizer = optim.Adam(self.critic.parameters(), lr=lr_critic)

        # Experience replay
        self.replay_buffer = deque(maxlen=100000)

        # Noise for exploration
        self.noise = np.zeros(action_dim)

    def select_action(self, state, add_noise=True):
        """Select action with optional exploration noise"""
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        action = self.actor(state_tensor).cpu().data.numpy().flatten()

        if add_noise:
            noise = np.random.normal(0, self.noise_std, size=self.action_dim)
            action = action + noise

        return np.clip(action, -self.max_action, self.max_action)

    def train(self, batch_size=100):
        """Train the agent on a batch of experiences"""
        if len(self.replay_buffer) < batch_size:
            return

        batch = random.sample(self.replay_buffer, batch_size)
        state_batch, action_batch, reward_batch, next_state_batch, done_batch = zip(*batch)

        state_batch = torch.FloatTensor(state_batch)
        action_batch = torch.FloatTensor(action_batch)
        reward_batch = torch.FloatTensor(reward_batch).unsqueeze(1)
        next_state_batch = torch.FloatTensor(next_state_batch)
        done_batch = torch.BoolTensor(done_batch).unsqueeze(1)

        # Compute target Q values
        with torch.no_grad():
            next_actions = self.actor_target(next_state_batch)
            target_Q1, target_Q2 = self.critic_target(next_state_batch, next_actions)
            target_Q = reward_batch + (~done_batch) * self.gamma * torch.min(target_Q1, target_Q2)

        # Update critic
        current_Q1, current_Q2 = self.critic(state_batch, action_batch)
        critic_loss = nn.MSELoss()(current_Q1, target_Q) + nn.MSELoss()(current_Q2, target_Q)

        self.critic_optimizer.zero_grad()
        critic_loss.backward()
        self.critic_optimizer.step()

        # Update actor
        actor_loss = -self.critic.Q1(state_batch, self.actor(state_batch)).mean()

        self.actor_optimizer.zero_grad()
        actor_loss.backward()
        self.actor_optimizer.step()

        # Update target networks
        for param, target_param in zip(self.critic.parameters(), self.critic_target.parameters()):
            target_param.data.copy_(self.tau * param.data + (1 - self.tau) * target_param.data)

        for param, target_param in zip(self.actor.parameters(), self.actor_target.parameters()):
            target_param.data.copy_(self.tau * param.data + (1 - self.tau) * target_param.data)

    def add_experience(self, state, action, reward, next_state, done):
        """Add experience to replay buffer"""
        self.replay_buffer.append((state, action, reward, next_state, done))
```

### Twin Delayed DDPG (TD3)

#### Addressing Overestimation Bias
```python
class TD3Agent:
    def __init__(self, state_dim, action_dim, max_action, lr_actor=1e-4, lr_critic=1e-3,
                 gamma=0.99, tau=0.005, policy_noise=0.2, noise_clip=0.5, policy_freq=2):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.max_action = max_action
        self.gamma = gamma
        self.tau = tau
        self.policy_noise = policy_noise
        self.noise_clip = noise_clip
        self.policy_freq = policy_freq
        self.total_it = 0

        # Actor and critics
        self.actor = Actor(state_dim, action_dim, max_action)
        self.actor_target = Actor(state_dim, action_dim, max_action)
        self.actor_target.load_state_dict(self.actor.state_dict())
        self.actor_optimizer = optim.Adam(self.actor.parameters(), lr=lr_actor)

        self.critic = Critic(state_dim, action_dim)
        self.critic_target = Critic(state_dim, action_dim)
        self.critic_target.load_state_dict(self.critic.state_dict())
        self.critic_optimizer = optim.Adam(self.critic.parameters(), lr=lr_critic)

        self.replay_buffer = deque(maxlen=100000)

    def select_action(self, state):
        """Select action with exploration noise"""
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        action = self.actor(state_tensor).cpu().data.numpy().flatten()
        noise = np.random.normal(0, self.max_action * 0.1, size=self.action_dim)
        return np.clip(action + noise, -self.max_action, self.max_action)

    def train(self, batch_size=100):
        """Train the TD3 agent"""
        self.total_it += 1

        if len(self.replay_buffer) < batch_size:
            return

        batch = random.sample(self.replay_buffer, batch_size)
        state_batch, action_batch, reward_batch, next_state_batch, done_batch = zip(*batch)

        state_batch = torch.FloatTensor(state_batch)
        action_batch = torch.FloatTensor(action_batch)
        reward_batch = torch.FloatTensor(reward_batch).unsqueeze(1)
        next_state_batch = torch.FloatTensor(next_state_batch)
        done_batch = torch.BoolTensor(done_batch).unsqueeze(1)

        # Select action according to policy and add clipped noise
        noise = torch.FloatTensor(action_batch).data.normal_(0, self.policy_noise)
        noise = noise.clamp(-self.noise_clip, self.noise_clip)

        next_action = (self.actor_target(next_state_batch) + noise).clamp(-self.max_action, self.max_action)

        # Compute target Q-value
        target_Q1, target_Q2 = self.critic_target(next_state_batch, next_action)
        target_Q = reward_batch + (~done_batch) * self.gamma * torch.min(target_Q1, target_Q2)

        # Get current Q estimates
        current_Q1, current_Q2 = self.critic(state_batch, action_batch)

        # Compute critic loss
        critic_loss = nn.MSELoss()(current_Q1, target_Q) + nn.MSELoss()(current_Q2, target_Q)

        # Optimize critic
        self.critic_optimizer.zero_grad()
        critic_loss.backward()
        self.critic_optimizer.step()

        # Delayed policy updates
        if self.total_it % self.policy_freq == 0:
            # Compute actor loss
            actor_loss = -self.critic.Q1(state_batch, self.actor(state_batch)).mean()

            # Optimize actor
            self.actor_optimizer.zero_grad()
            actor_loss.backward()
            self.actor_optimizer.step()

            # Update target networks
            for param, target_param in zip(self.critic.parameters(), self.critic_target.parameters()):
                target_param.data.copy_(self.tau * param.data + (1 - self.tau) * target_param.data)

            for param, target_param in zip(self.actor.parameters(), self.actor_target.parameters()):
                target_param.data.copy_(self.tau * param.data + (1 - self.tau) * target_param.data)
```

## Isaac Sim for RL Training

### Isaac Gym Integration

#### GPU-Acclederated RL Environments
```python
import isaacgym
from isaacgym import gymapi, gymtorch
from isaacgym.torch_utils import *
import torch
import numpy as np

class IsaacGymRLEnvironment:
    def __init__(self, cfg):
        self.cfg = cfg
        self.device = cfg.device

        # Initialize Isaac Gym
        self.gym = gymapi.acquire_gym()
        self.sim = None
        self.envs = []
        self.actors = []

        # RL parameters
        self.num_envs = cfg.num_envs
        self.num_obs = cfg.num_obs
        self.num_actions = cfg.num_actions
        self.max_episode_length = cfg.max_episode_length

        # Create sim
        self.create_sim()

    def create_sim(self):
        """Create the simulation"""
        # Configure sim
        sim_params = gymapi.SimParams()
        sim_params.up_axis = gymapi.UP_AXIS_Z
        sim_params.gravity = gymapi.Vec3(0.0, 0.0, -9.81)

        # Set physics engine parameters
        sim_params.physx.solver_type = 1
        sim_params.physx.num_position_iterations = 8
        sim_params.physx.num_velocity_iterations = 1
        sim_params.physx.max_gpu_contact_pairs = 2**23 - 1
        sim_params.physx.num_threads = 4
        sim_params.physx.rest_offset = 0.0
        sim_params.physx.contact_offset = 0.001
        sim_params.physx.friction_offset_threshold = 0.001
        sim_params.physx.friction_correlation_distance = 0.0005
        sim_params.physx.num_subscenes = 4
        sim_params.physx.max_gpu_contacts = 2**23 - 1

        # Create sim
        self.sim = self.gym.create_sim(
            self.cfg.gpu_id, self.cfg.gpu_id,
            gymapi.SIM_PHYSX, sim_params
        )

        if self.sim is None:
            print("*** Failed to create sim")
            quit()

        # Create ground plane
        plane_params = gymapi.PlaneParams()
        plane_params.normal = gymapi.Vec3(0.0, 0.0, 1.0)
        self.gym.add_ground(self.sim, plane_params)

        # Create environments
        self.create_environments()

    def create_environments(self):
        """Create multiple environments for parallel training"""
        # Set up environment spacing
        env_spacing = self.cfg.env_spacing
        env_lower = gymapi.Vec3(-env_spacing, -env_spacing, 0.0)
        env_upper = gymapi.Vec3(env_spacing, env_spacing, env_spacing)

        # Load robot asset
        asset_root = self.cfg.asset_root
        asset_file = self.cfg.asset_file

        asset_options = gymapi.AssetOptions()
        asset_options.fix_base_link = self.cfg.fix_base
        asset_options.disable_gravity = False
        asset_options.thickness = 0.001
        asset_options.angular_damping = 0.01
        asset_options.linear_damping = 0.01

        print("Loading asset '%s' from '%s'" % (asset_file, asset_root))
        robot_asset = self.gym.load_asset(self.sim, asset_root, asset_file, asset_options)

        # Create environment
        for i in range(self.num_envs):
            # Create environment
            env_ptr = self.gym.create_env(self.sim, env_lower, env_upper, 1)
            self.envs.append(env_ptr)

            # Add robot to environment
            pose = gymapi.Transform()
            pose.p = gymapi.Vec3(0.0, 0.0, 1.0)
            pose.r = gymapi.Quat(0.0, 0.0, 0.0, 1.0)

            # Use default property values for the robot
            robot_actor = self.gym.create_actor(
                env_ptr, robot_asset, pose, "robot", i, 1
            )
            self.actors.append(robot_actor)

            # Set robot DOF properties
            dof_props = self.gym.get_actor_dof_properties(env_ptr, robot_actor)
            dof_props["driveMode"].fill(gymapi.DOF_MODE_POS)
            dof_props["stiffness"].fill(800.0)
            dof_props["damping"].fill(50.0)
            self.gym.set_actor_dof_properties(env_ptr, robot_actor, dof_props)

        # Get actor handles
        self.actor_handles = []
        for i in range(self.num_envs):
            env_ptr = self.envs[i]
            actor_handle = self.gym.get_actor_handle(env_ptr, 0)
            self.actor_handles.append(actor_handle)

    def reset(self):
        """Reset all environments"""
        # Reset DOF states
        self.dof_states = self.gym.acquire_dof_state_tensor(self.sim)
        dof_states = gymtorch.wrap_tensor(self.dof_states).view(self.num_envs, -1, 2)

        # Reset positions and velocities
        dof_states[:, :, 0] = torch_rand_float(-0.2, 0.2, (self.num_envs, self.num_dofs), device=self.device)
        dof_states[:, :, 1] = torch_rand_float(-0.1, 0.1, (self.num_envs, self.num_dofs), device=self.device)

        # Reset root states
        self.root_tensor = self.gym.acquire_actor_root_state_tensor(self.sim)
        self.root_states = gymtorch.wrap_tensor(self.root_tensor).view(-1, 13)

        # Reset root positions and orientations
        self.root_states[:, 0:3] = torch_rand_float(-0.5, 0.5, (self.num_envs, 3), device=self.device)
        self.root_states[:, 0:2] += self.env_origins.view(-1, 3)[:, 0:2]
        self.root_states[:, 2] = torch_rand_float(1.0, 1.5, (self.num_envs, 1), device=self.device)

        # Reset root velocities
        self.root_states[:, 7:10] = torch_rand_float(-0.1, 0.1, (self.num_envs, 3), device=self.device)
        self.root_states[:, 10:13] = torch_rand_float(-0.1, 0.1, (self.num_envs, 3), device=self.device)

        self.gym.refresh_dof_state_tensor(self.sim)
        self.gym.refresh_actor_root_state_tensor(self.sim)

        # Reset episode lengths
        self.episode_lengths = torch.zeros(self.num_envs, device=self.device, dtype=torch.long)

        return self.compute_observations()

    def step(self, actions):
        """Step the simulation with given actions"""
        # Set actions
        actions_tensor = gymtorch.unwrap_tensor(actions)
        self.gym.set_dof_position_target_tensor(self.sim, gymtorch.unwrap_tensor(actions_tensor))

        # Step simulation
        self.gym.simulate(self.sim)
        self.gym.fetch_results(self.sim, True)

        # Refresh tensors
        self.gym.refresh_dof_state_tensor(self.sim)
        self.gym.refresh_actor_root_state_tensor(self.sim)
        self.gym.refresh_rigid_body_state_tensor(self.sim)

        # Compute observations, rewards, resets
        obs = self.compute_observations()
        rew = self.compute_rewards()
        reset = self.compute_resets()

        # Update episode lengths
        self.episode_lengths += 1
        reset = torch.where(self.episode_lengths >= self.max_episode_length, torch.ones_like(reset), reset)

        return obs, rew, reset, {}

    def compute_observations(self):
        """Compute observations for all environments"""
        # Get current DOF states
        dof_pos = self.dof_states[:, 0]  # positions
        dof_vel = self.dof_states[:, 1]  # velocities

        # Get root states
        root_pos = self.root_states[:, 0:3]
        root_rot = self.root_states[:, 3:7]
        root_vel = self.root_states[:, 7:10]
        root_ang_vel = self.root_states[:, 10:13]

        # Compute observations
        obs = torch.cat([
            dof_pos.flatten(start_dim=1),  # Joint positions
            dof_vel.flatten(start_dim=1),  # Joint velocities
            root_pos,                      # Root position
            root_rot,                      # Root rotation
            root_vel,                      # Root linear velocity
            root_ang_vel                   # Root angular velocity
        ], dim=-1)

        return obs

    def compute_rewards(self):
        """Compute rewards for all environments"""
        # Example reward function - customize based on task
        root_pos = self.root_states[:, 0:3]
        root_vel = self.root_states[:, 7:10]

        # Reward for forward movement
        forward_reward = root_vel[:, 0]  # x-axis velocity

        # Penalty for high action magnitude
        actions = self.prev_actions  # Assuming previous actions are stored
        action_penalty = torch.sum(actions**2, dim=-1)

        # Reward for staying upright
        up_reward = torch.abs(root_rot[:, 2])  # z-component of rotation

        # Combine rewards
        total_reward = forward_reward - 0.1 * action_penalty + 0.5 * up_reward

        return total_reward

    def compute_resets(self):
        """Compute resets for all environments"""
        # Example reset conditions - customize based on task
        root_pos = self.root_states[:, 0:3]
        root_rot = self.root_states[:, 3:7]

        # Reset if robot falls over (based on orientation)
        rot_z = root_rot[:, 2]  # z-component of rotation
        fall_reset = torch.abs(rot_z) < 0.5  # Reset if not upright

        # Reset if robot moves too far
        far_reset = torch.norm(root_pos[:, 0:2], dim=1) > 5.0

        # Combine reset conditions
        reset = torch.logical_or(fall_reset, far_reset)

        return reset
```

### Isaac Sim RL Training Loop

#### GPU-Accelerated Training Example
```python
class IsaacSimRLTrainer:
    def __init__(self, cfg):
        self.cfg = cfg
        self.device = cfg.device

        # Initialize Isaac Sim environment
        self.env = IsaacGymRLEnvironment(cfg)

        # Initialize RL agent
        self.agent = self.initialize_agent()

        # Training parameters
        self.max_training_timesteps = cfg.max_training_timesteps
        self.print_freq = cfg.print_freq
        self.save_model_freq = cfg.save_model_freq

        # Statistics
        self.running_reward = 0
        self.avg_length = 0
        self.time_step = 0
        self.i_episode = 0

    def initialize_agent(self):
        """Initialize RL agent based on configuration"""
        if self.cfg.algo == 'td3':
            return TD3Agent(
                state_dim=self.env.num_obs,
                action_dim=self.env.num_actions,
                max_action=self.cfg.max_action
            )
        elif self.cfg.algo == 'ddpg':
            return DDPGAgent(
                state_dim=self.env.num_obs,
                action_dim=self.env.num_actions,
                max_action=self.cfg.max_action
            )
        else:
            raise ValueError(f"Unsupported algorithm: {self.cfg.algo}")

    def train(self):
        """Main training loop"""
        print("Starting RL training...")

        # Initialize environment
        obs = self.env.reset()

        while self.time_step <= self.max_training_timesteps:
            # Select action
            action = self.agent.select_action(obs)

            # Add noise for exploration
            if self.cfg.exploration_noise:
                noise = torch.randn_like(action) * self.cfg.exploration_noise
                action = torch.clamp(action + noise, -self.cfg.max_action, self.cfg.max_action)

            # Store previous actions for reward computation
            self.agent.prev_actions = action

            # Step environment
            new_obs, reward, done, _ = self.env.step(action)

            # Store experience
            self.agent.add_experience(obs, action, reward, new_obs, done)

            # Train agent
            if self.time_step % self.cfg.train_freq == 0:
                self.agent.train(batch_size=self.cfg.batch_size)

            # Update if environment is done
            if done.any():
                self.i_episode += 1
                self.running_reward = 0.5 * self.running_reward + 0.5 * reward.mean()

            # Print average reward till last episode
            if self.time_step % self.print_freq == 0:
                print(f'Timestep: {self.time_step}, Average Reward: {self.running_reward:.2f}')

            # Save model periodically
            if self.time_step % self.save_model_freq == 0:
                self.agent.save_model(f"model_{self.time_step}.pth")

            # Update observation
            obs = new_obs
            self.time_step += 1

        # Print total number of episodes
        print(f"Total episodes: {self.i_episode}")

    def evaluate(self, num_episodes=10):
        """Evaluate trained policy"""
        print("Evaluating trained policy...")

        total_reward = 0
        episode_count = 0

        obs = self.env.reset()

        while episode_count < num_episodes:
            # Select action (no exploration noise during evaluation)
            action = self.agent.select_action(obs, add_noise=False)

            # Step environment
            obs, reward, done, _ = self.env.step(action)

            total_reward += reward.mean().item()

            if done.any():
                episode_count += 1

        avg_reward = total_reward / num_episodes
        print(f"Average evaluation reward: {avg_reward:.2f}")
        return avg_reward
```

## Advanced RL Techniques for Humanoid Robots

### Hindsight Experience Replay (HER)

#### Goal-Conditioned RL for Manipulation
```python
import copy

class HERReplayBuffer:
    def __init__(self, capacity, k_future=4):
        self.capacity = capacity
        self.buffer = deque(maxlen=capacity)
        self.k_future = k_future  # Number of future transitions to relabel

    def add(self, state, action, reward, next_state, done, achieved_goal, desired_goal):
        """Add experience to buffer"""
        experience = {
            'state': state,
            'action': action,
            'reward': reward,
            'next_state': next_state,
            'done': done,
            'achieved_goal': achieved_goal,
            'desired_goal': desired_goal
        }
        self.buffer.append(experience)

    def sample(self, batch_size):
        """Sample batch with HER relabeling"""
        batch = random.sample(self.buffer, batch_size)

        # Apply HER to some transitions
        her_batch = []
        for experience in batch:
            her_experience = copy.deepcopy(experience)

            # With probability, relabel with future goal
            if random.random() < self.k_future / (self.k_future + 1):
                # Sample a future state from the same episode
                future_idx = random.randint(0, len(self.buffer) - 1)
                future_experience = self.buffer[future_idx]

                # Relabel with future achieved goal
                her_experience['desired_goal'] = future_experience['achieved_goal']
                her_experience['reward'] = self.compute_her_reward(
                    her_experience['next_state']['achieved_goal'],
                    her_experience['desired_goal']
                )

            her_batch.append(her_experience)

        return her_batch

    def compute_her_reward(self, achieved_goal, desired_goal):
        """Compute reward for HER"""
        # Example: sparse reward based on distance
        distance = np.linalg.norm(achieved_goal - desired_goal)
        return 0.0 if distance < 0.05 else -1.0  # 5cm threshold

class GoalConditionedDDPGAgent:
    def __init__(self, state_dim, action_dim, goal_dim, max_action, lr_actor=1e-4, lr_critic=1e-3):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.goal_dim = goal_dim
        self.max_action = max_action

        # Modify networks to accept goal as input
        self.actor = GoalConditionedActor(state_dim, action_dim, goal_dim, max_action)
        self.actor_target = GoalConditionedActor(state_dim, action_dim, goal_dim, max_action)
        self.actor_target.load_state_dict(self.actor.state_dict())
        self.actor_optimizer = optim.Adam(self.actor.parameters(), lr=lr_actor)

        self.critic = GoalConditionedCritic(state_dim, action_dim, goal_dim)
        self.critic_target = GoalConditionedCritic(state_dim, action_dim, goal_dim)
        self.critic_target.load_state_dict(self.critic.state_dict())
        self.critic_optimizer = optim.Adam(self.critic.parameters(), lr=lr_critic)

        # HER replay buffer
        self.her_buffer = HERReplayBuffer(capacity=100000)

    def select_action(self, state, goal):
        """Select action with goal conditioning"""
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        goal_tensor = torch.FloatTensor(goal).unsqueeze(0)

        action = self.actor(state_tensor, goal_tensor).cpu().data.numpy().flatten()
        noise = np.random.normal(0, self.max_action * 0.1, size=self.action_dim)
        return np.clip(action + noise, -self.max_action, self.max_action)

    def train(self, batch_size=100):
        """Train with HER"""
        if len(self.her_buffer.buffer) < batch_size:
            return

        # Sample with HER
        batch = self.her_buffer.sample(batch_size)

        # Process batch
        states = torch.FloatTensor([exp['state'] for exp in batch])
        actions = torch.FloatTensor([exp['action'] for exp in batch])
        rewards = torch.FloatTensor([exp['reward'] for exp in batch]).unsqueeze(1)
        next_states = torch.FloatTensor([exp['next_state'] for exp in batch])
        dones = torch.BoolTensor([exp['done'] for exp in batch]).unsqueeze(1)
        goals = torch.FloatTensor([exp['desired_goal'] for exp in batch])

        # Compute target Q values
        with torch.no_grad():
            next_actions = self.actor_target(next_states, goals)
            target_Q1, target_Q2 = self.critic_target(next_states, next_actions, goals)
            target_Q = rewards + (~dones) * 0.99 * torch.min(target_Q1, target_Q2)

        # Update critic
        current_Q1, current_Q2 = self.critic(states, actions, goals)
        critic_loss = nn.MSELoss()(current_Q1, target_Q) + nn.MSELoss()(current_Q2, target_Q)

        self.critic_optimizer.zero_grad()
        critic_loss.backward()
        self.critic_optimizer.step()

        # Update actor
        actor_loss = -self.critic.Q1(states, self.actor(states, goals), goals).mean()

        self.actor_optimizer.zero_grad()
        actor_loss.backward()
        self.actor_optimizer.step()

        # Update target networks
        tau = 0.005
        for param, target_param in zip(self.critic.parameters(), self.critic_target.parameters()):
            target_param.data.copy_(tau * param.data + (1 - tau) * target_param.data)

        for param, target_param in zip(self.actor.parameters(), self.actor_target.parameters()):
            target_param.data.copy_(tau * param.data + (1 - tau) * target_param.data)

class GoalConditionedActor(nn.Module):
    def __init__(self, state_dim, action_dim, goal_dim, max_action, hidden_dim=256):
        super(GoalConditionedActor, self).__init__()
        self.max_action = max_action

        # Concatenate state and goal
        total_input_dim = state_dim + goal_dim

        self.network = nn.Sequential(
            nn.Linear(total_input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim),
            nn.Tanh()
        )

    def forward(self, state, goal):
        """Forward pass with goal conditioning"""
        inputs = torch.cat([state, goal], dim=1)
        return self.max_action * self.network(inputs)

class GoalConditionedCritic(nn.Module):
    def __init__(self, state_dim, action_dim, goal_dim, hidden_dim=256):
        super(GoalConditionedCritic, self).__init__()

        # Q1 architecture
        self.l1 = nn.Linear(state_dim + action_dim + goal_dim, hidden_dim)
        self.l2 = nn.Linear(hidden_dim, hidden_dim)
        self.l3 = nn.Linear(hidden_dim, 1)

        # Q2 architecture
        self.l4 = nn.Linear(state_dim + action_dim + goal_dim, hidden_dim)
        self.l5 = nn.Linear(hidden_dim, hidden_dim)
        self.l6 = nn.Linear(hidden_dim, 1)

    def forward(self, state, action, goal):
        """Forward pass with goal conditioning"""
        sa_g = torch.cat([state, action, goal], 1)

        q1 = torch.relu(self.l1(sa_g))
        q1 = torch.relu(self.l2(q1))
        q1 = self.l3(q1)

        q2 = torch.relu(self.l4(sa_g))
        q2 = torch.relu(self.l5(q2))
        q2 = self.l6(q2)

        return q1, q2

    def Q1(self, state, action, goal):
        """Forward pass for Q1 only"""
        sa_g = torch.cat([state, action, goal], 1)

        q1 = torch.relu(self.l1(sa_g))
        q1 = torch.relu(self.l2(q1))
        q1 = self.l3(q1)
        return q1
```

### Soft Actor-Critic (SAC) for Continuous Control

#### Maximum Entropy RL for Exploration
```python
class SACActor(nn.Module):
    def __init__(self, state_dim, action_dim, max_action, hidden_dim=256):
        super(SACActor, self).__init__()
        self.max_action = max_action

        self.l1 = nn.Linear(state_dim, hidden_dim)
        self.l2 = nn.Linear(hidden_dim, hidden_dim)

        self.mean_linear = nn.Linear(hidden_dim, action_dim)
        self.log_std_linear = nn.Linear(hidden_dim, action_dim)

    def forward(self, state):
        """Forward pass through actor network"""
        a = torch.relu(self.l1(state))
        a = torch.relu(self.l2(a))

        mean = self.mean_linear(a)
        log_std = self.log_std_linear(a)
        log_std = torch.clamp(log_std, min=-20, max=2)

        return mean, log_std

    def sample(self, state):
        """Sample action from policy"""
        mean, log_std = self.forward(state)
        std = log_std.exp()
        normal = torch.distributions.Normal(mean, std)
        x_t = normal.rsample()  # Reparameterization trick
        y_t = torch.tanh(x_t)
        action = y_t * self.max_action

        # Compute log probability
        log_prob = normal.log_prob(x_t)
        log_prob -= torch.log(self.max_action * (1 - y_t.pow(2)) + 1e-6)
        log_prob = log_prob.sum(1, keepdim=True)

        return action, log_prob

class SACCritic(nn.Module):
    def __init__(self, state_dim, action_dim, hidden_dim=256):
        super(SACCritic, self).__init__()

        # Q1 architecture
        self.l1 = nn.Linear(state_dim + action_dim, hidden_dim)
        self.l2 = nn.Linear(hidden_dim, hidden_dim)
        self.l3 = nn.Linear(hidden_dim, 1)

        # Q2 architecture
        self.l4 = nn.Linear(state_dim + action_dim, hidden_dim)
        self.l5 = nn.Linear(hidden_dim, hidden_dim)
        self.l6 = nn.Linear(hidden_dim, 1)

    def forward(self, state, action):
        """Forward pass through critic network"""
        sa = torch.cat([state, action], 1)

        q1 = torch.relu(self.l1(sa))
        q1 = torch.relu(self.l2(q1))
        q1 = self.l3(q1)

        q2 = torch.relu(self.l4(sa))
        q2 = torch.relu(self.l5(q2))
        q2 = self.l6(q2)

        return q1, q2

class SACAgent:
    def __init__(self, state_dim, action_dim, max_action, lr_actor=1e-4, lr_critic=1e-3, lr_alpha=1e-4,
                 alpha=0.2, gamma=0.99, tau=0.005):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Networks
        self.actor = SACActor(state_dim, action_dim, max_action).to(self.device)
        self.critic = SACCritic(state_dim, action_dim).to(self.device)
        self.critic_target = SACCritic(state_dim, action_dim).to(self.device)
        self.critic_target.load_state_dict(self.critic.state_dict())

        # Optimizers
        self.actor_optimizer = optim.Adam(self.actor.parameters(), lr=lr_actor)
        self.critic_optimizer = optim.Adam(self.critic.parameters(), lr=lr_critic)

        # Temperature parameter
        self.alpha = alpha
        self.automatic_entropy_tuning = True
        if self.automatic_entropy_tuning:
            self.target_entropy = -torch.prod(torch.Tensor(action_dim).to(self.device)).item()
            self.log_alpha = torch.zeros(1, requires_grad=True, device=self.device)
            self.alpha_optimizer = optim.Adam([self.log_alpha], lr=lr_alpha)

        # Hyperparameters
        self.gamma = gamma
        self.tau = tau
        self.max_action = max_action

        # Replay buffer
        self.replay_buffer = deque(maxlen=100000)

    def select_action(self, state, evaluate=False):
        """Select action from policy"""
        state = torch.FloatTensor(state).to(self.device).unsqueeze(0)
        if evaluate is False:
            action, _ = self.actor.sample(state)
        else:
            _, _, action = self.actor.forward(state)
            action = torch.tanh(action)
        return action.cpu().data.numpy().flatten()

    def train(self, batch_size=100):
        """Train the SAC agent"""
        if len(self.replay_buffer) < batch_size:
            return

        batch = random.sample(self.replay_buffer, batch_size)
        state_batch, action_batch, reward_batch, next_state_batch, done_batch = zip(*batch)

        state_batch = torch.FloatTensor(state_batch).to(self.device)
        action_batch = torch.FloatTensor(action_batch).to(self.device)
        reward_batch = torch.FloatTensor(reward_batch).unsqueeze(1).to(self.device)
        next_state_batch = torch.FloatTensor(next_state_batch).to(self.device)
        done_batch = torch.BoolTensor(done_batch).unsqueeze(1).to(self.device)

        with torch.no_grad():
            next_action, next_log_prob = self.actor.sample(next_state_batch)
            q1_next, q2_next = self.critic_target(next_state_batch, next_action)
            next_q_value = reward_batch + (1 - done_batch) * self.gamma * (torch.min(q1_next, q2_next) - self.alpha * next_log_prob)

        # Critic loss
        q1, q2 = self.critic(state_batch, action_batch)
        critic_loss = nn.MSELoss()(q1, next_q_value) + nn.MSELoss()(q2, next_q_value)

        self.critic_optimizer.zero_grad()
        critic_loss.backward()
        self.critic_optimizer.step()

        # Actor loss
        pi, log_pi = self.actor.sample(state_batch)

        q1_pi, q2_pi = self.critic(state_batch, pi)
        min_q_pi = torch.min(q1_pi, q2_pi)

        actor_loss = ((self.alpha * log_pi) - min_q_pi).mean()

        self.actor_optimizer.zero_grad()
        actor_loss.backward()
        self.actor_optimizer.step()

        # Update temperature parameter
        if self.automatic_entropy_tuning:
            alpha_loss = -(self.log_alpha * (log_pi + self.target_entropy).detach()).mean()

            self.alpha_optimizer.zero_grad()
            alpha_loss.backward()
            self.alpha_optimizer.step()

            self.alpha = self.log_alpha.exp()

        # Update target networks
        for param, target_param in zip(self.critic.parameters(), self.critic_target.parameters()):
            target_param.data.copy_(self.tau * param.data + (1 - self.tau) * target_param.data)
```

## Isaac ROS Integration for RL

### GPU-Accelerated Training Pipeline

#### Isaac ROS RL Training Node
```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState
from geometry_msgs.msg import PoseStamped
from std_msgs.msg import Float32
from isaac_ros_messages.msg import RLTrainingStatus
import torch
import numpy as np

class IsaacROSRLTrainingNode(Node):
    def __init__(self):
        super().__init__('isaac_ros_rl_training')

        # Publishers
        self.rl_status_publisher = self.create_publisher(
            RLTrainingStatus,
            '/rl_training/status',
            10
        )

        self.reward_publisher = self.create_publisher(
            Float32,
            '/rl_training/reward',
            10
        )

        # Subscriptions
        self.joint_state_subscription = self.create_subscription(
            JointState,
            '/joint_states',
            self.joint_state_callback,
            10
        )

        self.task_goal_subscription = self.create_subscription(
            PoseStamped,
            '/task/goal',
            self.task_goal_callback,
            10
        )

        # Initialize RL components
        self.initialize_rl_components()

        # Training parameters
        self.current_episode = 0
        self.current_step = 0
        self.episode_reward = 0.0
        self.is_training = False

        # Training timer
        self.training_timer = self.create_timer(0.01, self.training_step)  # 100 Hz

    def initialize_rl_components(self):
        """Initialize RL training components"""
        # Initialize Isaac Sim environment wrapper
        self.isaac_env = self.initialize_isaac_environment()

        # Initialize RL agent
        self.rl_agent = self.initialize_rl_agent()

        # GPU configuration
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.get_logger().info(f'Using device: {self.device}')

        # Training configuration
        self.training_config = {
            'batch_size': 128,
            'gamma': 0.99,
            'tau': 0.005,
            'learning_rate': 1e-4,
            'exploration_noise': 0.1,
            'train_freq': 1,
            'gradient_steps': 1
        }

    def initialize_isaac_environment(self):
        """Initialize Isaac Sim environment wrapper"""
        # This would interface with Isaac Sim through Isaac ROS
        # to provide GPU-accelerated parallel environments
        return IsaacSimEnvironmentWrapper()

    def initialize_rl_agent(self):
        """Initialize RL agent"""
        # Use the appropriate agent based on task requirements
        # For humanoid locomotion: TD3 or SAC
        # For manipulation: Goal-conditioned DDPG with HER
        # For complex tasks: PPO or IMPALA

        state_dim = 128  # Example state dimension
        action_dim = 32  # Example action dimension (joint torques/positions)
        max_action = 1.0  # Maximum action value

        return TD3Agent(
            state_dim=state_dim,
            action_dim=action_dim,
            max_action=max_action
        )

    def joint_state_callback(self, msg):
        """Process joint state information"""
        self.current_joint_positions = np.array(msg.position)
        self.current_joint_velocities = np.array(msg.velocity)
        self.current_joint_efforts = np.array(msg.effort)

    def task_goal_callback(self, msg):
        """Process task goal information"""
        self.current_task_goal = np.array([
            msg.pose.position.x,
            msg.pose.position.y,
            msg.pose.position.z,
            msg.pose.orientation.x,
            msg.pose.orientation.y,
            msg.pose.orientation.z,
            msg.pose.orientation.w
        ])

    def training_step(self):
        """Main training step"""
        if not self.is_training:
            return

        try:
            # Step 1: Get current state from Isaac Sim
            current_state = self.get_current_state()

            # Step 2: Select action using current policy
            action = self.rl_agent.select_action(current_state)

            # Step 3: Execute action in simulation
            next_state, reward, done, info = self.execute_action(action)

            # Step 4: Store experience in replay buffer
            self.rl_agent.add_experience(current_state, action, reward, next_state, done)

            # Step 5: Train agent periodically
            if self.current_step % self.training_config['train_freq'] == 0:
                for _ in range(self.training_config['gradient_steps']):
                    self.rl_agent.train(batch_size=self.training_config['batch_size'])

            # Step 6: Update training statistics
            self.episode_reward += reward
            self.current_step += 1

            # Step 7: Handle episode termination
            if done:
                self.end_episode()

            # Step 8: Publish training status
            self.publish_training_status()

        except Exception as e:
            self.get_logger().error(f'Error in training step: {str(e)}')

    def get_current_state(self):
        """Get current state from simulation"""
        # This would interface with Isaac Sim to get:
        # - Joint positions, velocities, efforts
        # - Robot pose and velocity
        # - Sensor readings (IMU, force/torque, etc.)
        # - Task-specific information (goal, obstacles, etc.)

        # Example state construction
        state = np.concatenate([
            self.current_joint_positions,
            self.current_joint_velocities,
            self.current_task_goal[:3],  # Task position
            # Add more state components as needed
        ])

        return state

    def execute_action(self, action):
        """Execute action in simulation and get results"""
        # This would send action commands to Isaac Sim
        # and receive the resulting state, reward, and done signal

        # In practice, this interfaces with Isaac Sim's API
        # to execute actions and get environment responses

        # Mock implementation for demonstration
        next_state = self.get_current_state()  # In practice, this would be the new state
        reward = self.compute_reward(action)  # Compute reward based on action and outcome
        done = self.check_episode_termination()  # Check if episode should end
        info = {}  # Additional information

        return next_state, reward, done, info

    def compute_reward(self, action):
        """Compute reward for current action"""
        # Implement task-specific reward function
        # Example: for reaching task
        current_pos = self.get_current_end_effector_position()
        goal_pos = self.current_task_goal[:3]

        distance_to_goal = np.linalg.norm(current_pos - goal_pos)
        reward = -distance_to_goal  # Negative distance as reward

        # Add penalty for large actions
        action_penalty = -0.01 * np.sum(np.square(action))
        reward += action_penalty

        return reward

    def check_episode_termination(self):
        """Check if episode should terminate"""
        # Implement episode termination conditions
        # Example: maximum episode length, task completion, robot falling

        # Terminate if maximum steps reached
        if self.current_step >= 1000:  # Example max steps
            return True

        # Terminate if robot falls (check orientation)
        robot_orientation = self.get_current_robot_orientation()
        if abs(robot_orientation[2]) < 0.5:  # Not upright
            return True

        return False

    def end_episode(self):
        """Handle episode termination"""
        self.current_episode += 1
        self.current_step = 0

        # Log episode statistics
        self.get_logger().info(f'Episode {self.current_episode}: Reward = {self.episode_reward:.2f}')

        # Reset episode statistics
        self.episode_reward = 0.0

        # Optionally reset environment
        self.reset_environment()

    def reset_environment(self):
        """Reset simulation environment"""
        # This would reset the Isaac Sim environment
        # to a random initial state for the next episode
        pass

    def publish_training_status(self):
        """Publish training status"""
        status_msg = RLTrainingStatus()
        status_msg.current_episode = self.current_episode
        status_msg.current_step = self.current_step
        status_msg.current_reward = self.episode_reward
        status_msg.is_training = self.is_training

        self.rl_status_publisher.publish(status_msg)

        # Publish current reward
        reward_msg = Float32()
        reward_msg.data = self.episode_reward
        self.reward_publisher.publish(reward_msg)

    def start_training(self):
        """Start RL training"""
        self.is_training = True
        self.get_logger().info('Started RL training')

    def stop_training(self):
        """Stop RL training"""
        self.is_training = False
        self.get_logger().info('Stopped RL training')

    def save_model(self, filepath):
        """Save trained model"""
        self.rl_agent.save_model(filepath)
        self.get_logger().info(f'Model saved to {filepath}')

    def load_model(self, filepath):
        """Load trained model"""
        self.rl_agent.load_model(filepath)
        self.get_logger().info(f'Model loaded from {filepath}')

def main(args=None):
    rclpy.init(args=args)

    rl_training_node = IsaacROSRLTrainingNode()

    try:
        # Start training
        rl_training_node.start_training()

        # Spin the node
        rclpy.spin(rl_training_node)
    except KeyboardInterrupt:
        pass
    finally:
        # Stop training and shutdown
        rl_training_node.stop_training()
        rl_training_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Advanced RL Techniques for Humanoid Applications

### Multi-Task Learning

#### Shared Representations for Multiple Skills
```python
class MultiTaskRLAgent:
    def __init__(self, state_dim, action_dims, task_names, max_actions, hidden_dim=512):
        self.task_names = task_names
        self.num_tasks = len(task_names)
        self.action_dims = action_dims
        self.max_actions = max_actions

        # Shared feature extractor
        self.feature_extractor = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU()
        )

        # Task-specific heads
        self.actor_heads = nn.ModuleList([
            nn.Sequential(
                nn.Linear(hidden_dim, hidden_dim // 2),
                nn.ReLU(),
                nn.Linear(hidden_dim // 2, action_dims[i]),
                nn.Tanh()
            ) for i in range(self.num_tasks)
        ])

        self.critic_heads = nn.ModuleList([
            nn.Sequential(
                nn.Linear(hidden_dim + action_dims[i], hidden_dim // 2),
                nn.ReLU(),
                nn.Linear(hidden_dim // 2, 1)
            ) for i in range(self.num_tasks)
        ])

        # Optimizers
        self.shared_optimizer = optim.Adam(list(self.feature_extractor.parameters()), lr=1e-4)
        self.task_optimizers = [
            optim.Adam(list(self.actor_heads[i].parameters()) + list(self.critic_heads[i].parameters()), lr=1e-4)
            for i in range(self.num_tasks)
        ]

    def select_action(self, state, task_idx):
        """Select action for specific task"""
        features = self.feature_extractor(torch.FloatTensor(state))
        action_raw = self.actor_heads[task_idx](features)

        # Scale action to appropriate range
        scaled_action = action_raw * self.max_actions[task_idx]

        return scaled_action.detach().numpy()

    def train_task(self, task_idx, batch_states, batch_actions, batch_rewards, batch_next_states, batch_dones):
        """Train specific task"""
        # Extract features
        current_features = self.feature_extractor(batch_states)
        next_features = self.feature_extractor(batch_next_states)

        # Actor loss for this task
        current_actions = self.actor_heads[task_idx](current_features)
        current_q_values = self.critic_heads[task_idx](torch.cat([current_features, current_actions], dim=1))
        actor_loss = -current_q_values.mean()

        # Critic loss for this task
        with torch.no_grad():
            next_actions = self.actor_heads[task_idx](next_features)
            next_q_values = self.critic_heads[task_idx](torch.cat([next_features, next_actions], dim=1))
            target_q_values = batch_rewards + (1 - batch_dones) * 0.99 * next_q_values

        current_q = self.critic_heads[task_idx](torch.cat([current_features, batch_actions], dim=1))
        critic_loss = nn.MSELoss()(current_q, target_q_values)

        # Update task-specific networks
        self.task_optimizers[task_idx].zero_grad()
        critic_loss.backward(retain_graph=True)
        actor_loss.backward()
        self.task_optimizers[task_idx].step()

        # Update shared features occasionally
        if task_idx % 2 == 0:  # Update shared network every other step
            self.shared_optimizer.zero_grad()
            # Add regularization to encourage shared representations
            shared_loss = actor_loss + critic_loss
            shared_loss.backward()
            self.shared_optimizer.step()

    def get_shared_representation(self, state):
        """Get shared feature representation"""
        return self.feature_extractor(torch.FloatTensor(state)).detach()
```

### Curriculum Learning

#### Progressive Task Difficulty
```python
class CurriculumLearningScheduler:
    def __init__(self, tasks, difficulty_thresholds):
        self.tasks = tasks
        self.difficulty_thresholds = difficulty_thresholds
        self.current_task_idx = 0
        self.performance_history = []
        self.min_performance_to_advance = 0.8  # 80% success rate
        self.consecutive_successes_needed = 10

    def evaluate_performance(self, episode_rewards, episode_lengths):
        """Evaluate current task performance"""
        # Calculate success rate based on rewards and episode lengths
        success_rate = self.calculate_success_rate(episode_rewards, episode_lengths)
        self.performance_history.append(success_rate)

        return success_rate

    def calculate_success_rate(self, episode_rewards, episode_lengths):
        """Calculate success rate for current task"""
        # This would be task-specific
        # For example: percentage of episodes that reached goal
        # or average reward above threshold
        if len(episode_rewards) == 0:
            return 0.0

        # Example: count episodes with high reward
        threshold = self.difficulty_thresholds[self.current_task_idx]
        successes = sum(1 for reward in episode_rewards if reward >= threshold)
        return successes / len(episode_rewards)

    def should_advance_curriculum(self):
        """Check if should advance to next curriculum stage"""
        if len(self.performance_history) < self.consecutive_successes_needed:
            return False

        # Check if recent performance is above threshold
        recent_performance = self.performance_history[-self.consecutive_successes_needed:]
        avg_recent_performance = sum(recent_performance) / len(recent_performance)

        return avg_recent_performance >= self.min_performance_to_advance

    def get_current_task(self):
        """Get current task configuration"""
        return self.tasks[self.current_task_idx]

    def advance_curriculum(self):
        """Advance to next curriculum stage"""
        if self.current_task_idx < len(self.tasks) - 1:
            self.current_task_idx += 1
            self.performance_history = []  # Reset history for new task
            return True
        return False

    def get_task_complexity(self):
        """Get current task complexity level"""
        return self.current_task_idx + 1

class CurriculumRLTrainer:
    def __init__(self, base_agent, curriculum_scheduler):
        self.base_agent = base_agent
        self.curriculum_scheduler = curriculum_scheduler
        self.current_env_config = None

    def train_with_curriculum(self, max_timesteps):
        """Train with curriculum learning"""
        timestep = 0

        while timestep < max_timesteps:
            # Get current task configuration
            current_task = self.curriculum_scheduler.get_current_task()

            # Update environment with current task
            self.update_environment(current_task)

            # Train on current task for a while
            task_timesteps = min(10000, max_timesteps - timestep)  # 10k timesteps per task stage
            for _ in range(task_timesteps):
                # Perform training step
                obs, action, reward, next_obs, done = self.collect_experience()
                self.base_agent.add_experience(obs, action, reward, next_obs, done)

                if timestep % 100 == 0:  # Train periodically
                    self.base_agent.train()

                timestep += 1

                # Check curriculum advancement
                if timestep % 1000 == 0:  # Check every 1k timesteps
                    episode_rewards = self.get_recent_episode_rewards()
                    current_performance = self.curriculum_scheduler.evaluate_performance(
                        episode_rewards, []
                    )

                    if self.curriculum_scheduler.should_advance_curriculum():
                        if self.curriculum_scheduler.advance_curriculum():
                            print(f"Advanced curriculum to task {self.curriculum_scheduler.get_task_complexity()}")
                        break  # Break inner loop to update task configuration

    def update_environment(self, task_config):
        """Update environment with new task configuration"""
        # This would modify the Isaac Sim environment
        # based on the current curriculum stage
        # e.g., change goal positions, obstacle layouts, etc.
        pass

    def collect_experience(self):
        """Collect experience from current environment"""
        # Implementation to collect experience
        pass

    def get_recent_episode_rewards(self):
        """Get recent episode rewards for curriculum evaluation"""
        # Implementation to return recent rewards
        pass
```

## Safety and Robustness in RL

### Safe RL with Constrained Optimization

#### Lyapunov-based Safe RL
```python
class SafeRLAgent:
    def __init__(self, state_dim, action_dim, max_action, safety_constraints):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.max_action = max_action
        self.safety_constraints = safety_constraints

        # Main policy network
        self.actor = Actor(state_dim, action_dim, max_action)
        self.critic = Critic(state_dim, action_dim)

        # Safety critic (Lyapunov function approximator)
        self.safety_critic = nn.Sequential(
            nn.Linear(state_dim, 256),
            nn.ReLU(),
            nn.Linear(256, 256),
            nn.ReLU(),
            nn.Linear(256, 1)
        )

        # Optimizers
        self.actor_optimizer = optim.Adam(self.actor.parameters(), lr=1e-4)
        self.critic_optimizer = optim.Adam(self.critic.parameters(), lr=1e-3)
        self.safety_optimizer = optim.Adam(self.safety_critic.parameters(), lr=1e-4)

    def safe_action_selection(self, state):
        """Select action that satisfies safety constraints"""
        state_tensor = torch.FloatTensor(state).unsqueeze(0)

        # Get unsafe action from main policy
        unsafe_action = self.actor(state_tensor)

        # Project action to satisfy safety constraints
        safe_action = self.project_to_safe_set(state_tensor, unsafe_action)

        return safe_action.detach().numpy().flatten()

    def project_to_safe_set(self, state, action):
        """Project action to safe set using constrained optimization"""
        # This would implement constrained optimization
        # to ensure safety constraints are satisfied
        # For example, using quadratic programming or projected gradient descent

        # Example: simple clipping based on safety function
        with torch.no_grad():
            safety_value = self.safety_critic(state)
            if safety_value > self.safety_constraints['threshold']:
                # Apply safety projection
                action = self.apply_safety_projection(state, action)

        return action

    def apply_safety_projection(self, state, action):
        """Apply safety projection to action"""
        # This would implement the specific safety projection method
        # depending on the safety constraints (Lyapunov, barrier functions, etc.)
        projected_action = torch.clamp(action, -self.max_action, self.max_action)
        return projected_action

    def update_safety_critic(self, state_batch, next_state_batch, safety_rewards):
        """Update safety critic (Lyapunov function)"""
        # Safety critic learns to approximate the Lyapunov function
        # which certifies safety (decreasing along trajectories)

        current_safety_values = self.safety_critic(state_batch)
        next_safety_values = self.safety_critic(next_state_batch)

        # Lyapunov condition: V(s_t) >= V(s_{t+1}) + safety_reward
        target_safety_values = next_safety_values + safety_rewards

        safety_critic_loss = nn.MSELoss()(current_safety_values, target_safety_values)

        self.safety_optimizer.zero_grad()
        safety_critic_loss.backward()
        self.safety_optimizer.step()

    def compute_safety_reward(self, state, action, next_state):
        """Compute safety reward based on Lyapunov condition"""
        # This would compute reward that encourages
        # the Lyapunov function to decrease
        pass
```

## Transfer Learning and Domain Randomization

### Sim-to-Real Transfer

#### Domain Randomization for Robust Policies
```python
class DomainRandomizationEnv:
    def __init__(self, base_env):
        self.base_env = base_env
        self.randomization_params = {
            'mass_range': [0.8, 1.2],  # ±20% mass variation
            'friction_range': [0.5, 1.5],  # Friction variation
            'gravity_range': [-10.8, -8.8],  # Gravity variation
            'sensor_noise_range': [0.0, 0.01],  # Sensor noise
            'actuator_delay_range': [0.0, 0.02],  # Actuator delay
        }

    def randomize_domain(self):
        """Randomize domain parameters"""
        # Randomize robot mass
        mass_multiplier = random.uniform(
            self.randomization_params['mass_range'][0],
            self.randomization_params['mass_range'][1]
        )
        self.set_robot_mass_multiplier(mass_multiplier)

        # Randomize friction
        friction = random.uniform(
            self.randomization_params['friction_range'][0],
            self.randomization_params['friction_range'][1]
        )
        self.set_friction_coefficient(friction)

        # Randomize gravity
        gravity = random.uniform(
            self.randomization_params['gravity_range'][0],
            self.randomization_params['gravity_range'][1]
        )
        self.set_gravity(gravity)

        # Add sensor noise
        sensor_noise = random.uniform(
            self.randomization_params['sensor_noise_range'][0],
            self.randomization_params['sensor_noise_range'][1]
        )
        self.set_sensor_noise(sensor_noise)

    def reset(self):
        """Reset environment with randomized parameters"""
        self.randomize_domain()
        return self.base_env.reset()

    def step(self, action):
        """Step environment with current randomization"""
        return self.base_env.step(action)

class DomainAdversarialNetwork(nn.Module):
    def __init__(self, feature_dim, num_domains):
        super(DomainAdversarialNetwork, self).__init__()

        # Domain discriminator
        self.domain_discriminator = nn.Sequential(
            nn.Linear(feature_dim, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, num_domains)
        )

    def forward(self, features):
        """Classify domain of features"""
        return self.domain_discriminator(features)

class DomainAdversarialRLAgent:
    def __init__(self, state_dim, action_dim, max_action, num_domains):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.max_action = max_action
        self.num_domains = num_domains

        # Feature extractor (shared across domains)
        self.feature_extractor = nn.Sequential(
            nn.Linear(state_dim, 512),
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.ReLU()
        )

        # Actor and critic
        self.actor = Actor(256, action_dim, max_action)  # Input is feature dimension
        self.critic = Critic(256, action_dim)

        # Domain discriminator
        self.domain_discriminator = DomainAdversarialNetwork(256, num_domains)

        # Optimizers
        self.feature_optimizer = optim.Adam(self.feature_extractor.parameters(), lr=1e-4)
        self.actor_optimizer = optim.Adam(self.actor.parameters(), lr=1e-4)
        self.critic_optimizer = optim.Adam(self.critic.parameters(), lr=1e-3)
        self.domain_optimizer = optim.Adam(self.domain_discriminator.parameters(), lr=1e-4)

    def train_with_domain_adaptation(self, sim_batch, real_batch):
        """Train with domain adversarial adaptation"""
        # Extract features for both domains
        sim_features = self.feature_extractor(sim_batch['states'])
        real_features = self.feature_extractor(real_batch['states'])

        # Domain discrimination loss (want to fool the discriminator)
        sim_domain_logits = self.domain_discriminator(sim_features)
        real_domain_logits = self.domain_discriminator(real_features)

        # Domain classification loss (try to classify correctly)
        domain_labels_sim = torch.zeros(sim_features.size(0), dtype=torch.long)
        domain_labels_real = torch.ones(real_features.size(0), dtype=torch.long)

        domain_loss = nn.CrossEntropyLoss()(
            torch.cat([sim_domain_logits, real_domain_logits], dim=0),
            torch.cat([domain_labels_sim, domain_labels_real], dim=0)
        )

        # Domain adversarial loss (try to make domains indistinguishable)
        # Flip labels to encourage domain confusion
        adv_loss = -domain_loss

        # Update domain discriminator (want to distinguish domains)
        self.domain_optimizer.zero_grad()
        domain_loss.backward()
        self.domain_optimizer.step()

        # Update feature extractor (want to fool discriminator)
        real_domain_logits_adv = self.domain_discriminator(real_features)
        real_adv_loss = nn.CrossEntropyLoss()(
            real_domain_logits_adv,
            torch.zeros(real_features.size(0), dtype=torch.long)  # Try to classify as sim
        )

        self.feature_optimizer.zero_grad()
        real_adv_loss.backward()
        self.feature_optimizer.step()

        # Continue with normal RL training using real features
        # (This trains the policy on real-like features)
```

## Performance Optimization and Best Practices

### Efficient Training Strategies

#### Parallel Training and Experience Sharing
```python
import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor
import threading

class DistributedRLTrainer:
    def __init__(self, agent_class, num_workers=4):
        self.agent_class = agent_class
        self.num_workers = num_workers
        self.global_network = None
        self.replay_buffer = deque(maxlen=1000000)
        self.lock = threading.Lock()

    def async_training_worker(self, worker_id, env_config):
        """Training worker process"""
        # Create local agent
        local_agent = self.agent_class()

        # Load initial parameters from global network
        if self.global_network is not None:
            local_agent.load_state_dict(self.global_network.state_dict())

        # Training loop
        for episode in range(1000):  # Episodes per worker
            episode_experience = []
            state = env_config.reset()

            for step in range(200):  # Steps per episode
                action = local_agent.select_action(state)
                next_state, reward, done, _ = env_config.step(action)

                # Store experience
                experience = (state, action, reward, next_state, done)
                episode_experience.append(experience)

                if done:
                    break

                state = next_state

            # Add experience to global buffer
            with self.lock:
                for exp in episode_experience:
                    self.replay_buffer.append(exp)

            # Periodically sync with global network
            if episode % 10 == 0:
                self.sync_with_global(local_agent)

    def sync_with_global(self, local_agent):
        """Sync local agent with global network"""
        # Update global network with local gradients
        if self.global_network is None:
            self.global_network = local_agent.state_dict()
        else:
            # Average parameters (simplified)
            for key in self.global_network.keys():
                if key in local_agent.state_dict():
                    self.global_network[key] = 0.9 * self.global_network[key] + 0.1 * local_agent.state_dict()[key]

    def train_distributed(self):
        """Run distributed training"""
        # Start worker processes
        with ProcessPoolExecutor(max_workers=self.num_workers) as executor:
            futures = []
            for i in range(self.num_workers):
                env_config = self.create_environment_config(i)
                future = executor.submit(self.async_training_worker, i, env_config)
                futures.append(future)

            # Wait for workers to complete
            for future in futures:
                future.result()

    def create_environment_config(self, worker_id):
        """Create environment configuration for worker"""
        # This would create different environment instances
        # with different random seeds or configurations
        pass

class PrioritizedReplayBuffer:
    def __init__(self, capacity, alpha=0.6, beta_start=0.4, beta_frames=100000):
        self.capacity = capacity
        self.alpha = alpha
        self.beta_start = beta_start
        self.beta_frames = beta_frames
        self.buffer = deque(maxlen=capacity)
        self.priorities = deque(maxlen=capacity)
        self.pos = 0

    def push(self, state, action, reward, next_state, done, error=1.0):
        """Add experience with priority"""
        max_priority = max(self.priorities) if self.priorities else 1.0
        self.buffer.append((state, action, reward, next_state, done))
        self.priorities.append(max_priority)

    def sample(self, batch_size):
        """Sample batch with prioritization"""
        if len(self.buffer) == 0:
            return [], [], [], [], [], []

        priorities = np.array(self.priorities)
        probabilities = priorities ** self.alpha
        probabilities /= probabilities.sum()
        indices = np.random.choice(len(self.buffer), batch_size, p=probabilities)

        experiences = [self.buffer[idx] for idx in indices]
        states, actions, rewards, next_states, dones = zip(*experiences)

        # Importance sampling weights
        beta = min(1.0, self.beta_start + self.pos * (1.0 - self.beta_start) / self.beta_frames)
        weights = (len(self.buffer) * probabilities[indices]) ** (-beta)
        weights /= weights.max()

        return states, actions, rewards, next_states, dones, weights

    def update_priorities(self, indices, errors):
        """Update priorities based on errors"""
        for idx, error in zip(indices, errors):
            self.priorities[idx] = (error + 1e-5) ** self.alpha
```

## Summary

Reinforcement Learning represents a revolutionary approach to developing intelligent robotic systems, particularly for humanoid robots that require complex, adaptive behaviors. Through Isaac Sim's GPU-accelerated parallel environments and Isaac ROS's integration capabilities, RL algorithms can be trained efficiently in simulation and transferred to real robots. The combination of advanced algorithms like SAC, TD3, and PPO with techniques like Hindsight Experience Replay, curriculum learning, and domain randomization enables humanoid robots to learn sophisticated behaviors that would be extremely difficult to program manually. Safety considerations, including constrained optimization and Lyapunov-based safety, ensure that RL-trained policies can be deployed safely in real-world environments. The field continues to evolve rapidly, with new algorithms and techniques emerging that promise even more capable and robust robotic systems.

---

## Further Reading

- "Reinforcement Learning: An Introduction" by Sutton & Barto
- "Deep Reinforcement Learning Hands-On" by Maxim Lapan
- NVIDIA Isaac Gym documentation and examples
- "Continuous Control with Deep Reinforcement Learning" (DDPG paper)
- "Addressing Function Approximation Error in Actor-Critic Methods" (TD3 paper)
- "Soft Actor-Critic Algorithms and Applications" (SAC paper)
- "Hindsight Experience Replay" (HER paper)
- "Curriculum Learning: A Regularization Method for Training Neural Networks"
- Isaac Sim and Isaac ROS integration tutorials