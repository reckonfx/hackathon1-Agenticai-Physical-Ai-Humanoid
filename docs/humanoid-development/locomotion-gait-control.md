---
sidebar_label: Locomotion and Gait Control
title: Locomotion and Gait Control
---

# Locomotion and Gait Control

## Introduction to Humanoid Locomotion

Humanoid locomotion represents one of the most challenging and fascinating aspects of robotics, requiring the integration of complex control systems, dynamic modeling, and biomechanical principles to achieve stable, efficient, and natural-looking movement. Unlike wheeled or tracked robots, humanoid robots must manage complex multi-link dynamics, maintain balance during locomotion, and adapt to varying terrains and environmental conditions. Successful locomotion in humanoid robots requires sophisticated control strategies that can handle the inherent instability of bipedal walking while achieving human-like movement patterns.

## Fundamentals of Bipedal Locomotion

### Biomechanics of Human Walking

Human walking is a complex dynamic process involving coordinated movement of multiple body segments. Understanding human biomechanics provides crucial insights for developing effective humanoid locomotion controllers:

#### Gait Cycle Phases
The human gait cycle consists of two main phases:
- **Stance Phase (60%)**: The foot is in contact with the ground
  - Initial contact (heel strike)
  - Loading response
  - Mid-stance
  - Terminal stance
  - Pre-swing

- **Swing Phase (40%)**: The foot is off the ground
  - Initial swing
  - Mid-swing
  - Terminal swing

#### Center of Mass (CoM) Dynamics
During walking, the human CoM exhibits characteristic patterns:
- Vertical oscillation of approximately 2-3 cm
- Lateral sway of 2-4 cm
- Forward progression with controlled falling and catching

### Mathematical Models for Bipedal Locomotion

#### Inverted Pendulum Model
The simplest model for bipedal walking treats the robot as an inverted pendulum:

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint

class InvertedPendulumModel:
    def __init__(self, height=0.8, gravity=9.81):
        self.height = height  # Height of CoM above ground
        self.gravity = gravity
        self.omega = np.sqrt(gravity / height)  # Natural frequency

    def compute_dynamics(self, state, t, zmp_position):
        """
        Compute inverted pendulum dynamics
        state = [x, y, vx, vy] where (x,y) is CoM position and (vx,vy) is velocity
        """
        x, y, vx, vy = state

        # Inverted pendulum equations:
        # ẍ = ω²(x - zmp_x)
        # ÿ = ω²(y - zmp_y)
        ddx = self.omega**2 * (x - zmp_position[0])
        ddy = self.omega**2 * (y - zmp_position[1])

        return [vx, vy, ddx, ddy]

    def simulate_step(self, initial_state, zmp_trajectory, dt=0.001):
        """
        Simulate a single step with given ZMP trajectory
        """
        states = []
        times = np.arange(0, len(zmp_trajectory) * dt, dt)

        current_state = initial_state
        states.append(current_state.copy())

        for i in range(len(zmp_trajectory) - 1):
            zmp = zmp_trajectory[i]

            # Integrate dynamics
            k1 = np.array(self.compute_dynamics(current_state, 0, zmp))
            k2 = np.array(self.compute_dynamics(current_state + dt/2 * k1, 0, zmp))
            k3 = np.array(self.compute_dynamics(current_state + dt/2 * k2, 0, zmp))
            k4 = np.array(self.compute_dynamics(current_state + dt * k3, 0, zmp))

            current_state += dt/6 * (k1 + 2*k2 + 2*k3 + k4)
            states.append(current_state.copy())

        return np.array(states)

    def compute_capture_point(self, com_pos, com_vel):
        """
        Compute capture point from current CoM state
        Capture point = CoM_pos + CoM_vel / ω
        """
        cp_x = com_pos[0] + com_vel[0] / self.omega
        cp_y = com_pos[1] + com_vel[1] / self.omega
        return np.array([cp_x, cp_y])

    def compute_zmp_from_com(self, com_pos, com_vel, com_acc):
        """
        Compute ZMP from CoM position, velocity, and acceleration
        ZMP_x = CoM_x - h * CoM_acc_x / g
        ZMP_y = CoM_y - h * CoM_acc_y / g
        """
        zmp_x = com_pos[0] - self.height * com_acc[0] / self.gravity
        zmp_y = com_pos[1] - self.height * com_acc[1] / self.gravity
        return np.array([zmp_x, zmp_y])
```

#### Linear Inverted Pendulum Model (LIPM)
The Linear Inverted Pendulum Model is a widely used simplification where the CoM height remains constant:

```python
class LinearInvertedPendulumModel:
    def __init__(self, com_height=0.8, gravity=9.81):
        self.com_height = com_height
        self.gravity = gravity
        self.omega = np.sqrt(gravity / com_height)

    def compute_com_trajectory(self, zmp_trajectory, dt=0.001):
        """
        Compute CoM trajectory from ZMP reference using LIPM
        """
        num_steps = len(zmp_trajectory)
        com_trajectory = np.zeros((num_steps, 4))  # [x, y, vx, vy] for each step

        # Initialize with first ZMP as starting point
        com_trajectory[0, :2] = zmp_trajectory[0]  # Start near ZMP
        com_trajectory[0, 2:] = 0.0  # Zero initial velocity

        for i in range(1, num_steps):
            # LIPM dynamics: ẍ = ω²(x - zmp_x)
            prev_com = com_trajectory[i-1, :2]
            prev_vel = com_trajectory[i-1, 2:]
            current_zmp = zmp_trajectory[i]

            # Compute acceleration
            acc_x = self.omega**2 * (prev_com[0] - current_zmp[0])
            acc_y = self.omega**2 * (prev_com[1] - current_zmp[1])

            # Integrate: v = v0 + a*dt, x = x0 + v*dt
            new_vel_x = prev_vel[0] + acc_x * dt
            new_vel_y = prev_vel[1] + acc_y * dt

            new_pos_x = prev_com[0] + new_vel_x * dt
            new_pos_y = prev_com[1] + new_vel_y * dt

            com_trajectory[i, :] = [new_pos_x, new_pos_y, new_vel_x, new_vel_y]

        return com_trajectory

    def compute_analytical_solution(self, zmp_constant, initial_com, initial_vel, t):
        """
        Compute analytical solution for constant ZMP
        """
        x0, y0 = initial_com
        vx0, vy0 = initial_vel

        # Analytical solution for LIPM with constant ZMP
        # x(t) = zmp_x + A*cos(ω*t) + B*sin(ω*t)
        # where A and B are determined by initial conditions

        A_x = x0 - zmp_constant[0]
        B_x = vx0 / self.omega

        A_y = y0 - zmp_constant[1]
        B_y = vy0 / self.omega

        x_t = zmp_constant[0] + A_x * np.cos(self.omega * t) + B_x * np.sin(self.omega * t)
        y_t = zmp_constant[1] + A_y * np.cos(self.omega * t) + B_y * np.sin(self.omega * t)

        vx_t = -A_x * self.omega * np.sin(self.omega * t) + B_x * self.omega * np.cos(self.omega * t)
        vy_t = -A_y * self.omega * np.sin(self.omega * t) + B_y * self.omega * np.cos(self.omega * t)

        return np.array([x_t, y_t, vx_t, vy_t])
```

### Three-Dimensional Linear Inverted Pendulum Model (3DLIPM)

For more realistic humanoid locomotion, the 3D LIPM extends the model to include sagittal, coronal, and vertical motions:

```python
class ThreeDLIPM:
    def __init__(self, com_height=0.8, gravity=9.81):
        self.com_height = com_height
        self.gravity = gravity
        self.omega = np.sqrt(gravity / com_height)

    def compute_3d_com_trajectory(self, zmp_trajectory, initial_com, initial_com_vel, dt=0.001):
        """
        Compute 3D CoM trajectory from ZMP reference
        """
        num_steps = len(zmp_trajectory)
        com_trajectory = np.zeros((num_steps, 6))  # [x, y, z, vx, vy, vz]

        com_trajectory[0, :3] = initial_com
        com_trajectory[0, 3:] = initial_com_vel

        for i in range(1, num_steps):
            prev_com = com_trajectory[i-1, :3]
            prev_vel = com_trajectory[i-1, 3:]
            current_zmp = zmp_trajectory[i]

            # Horizontal dynamics (LIPM)
            acc_x = self.omega**2 * (prev_com[0] - current_zmp[0])
            acc_y = self.omega**2 * (prev_com[1] - current_zmp[1])

            # Vertical dynamics (constant height assumption)
            acc_z = 0.0  # Height remains constant in LIPM

            # Integrate
            new_vel = prev_vel + np.array([acc_x, acc_y, acc_z]) * dt
            new_pos = prev_com + new_vel * dt

            com_trajectory[i, :] = np.concatenate([new_pos, new_vel])

        return com_trajectory
```

## Gait Pattern Generation

### Footstep Planning

#### Static Footstep Planning
```python
class FootstepPlanner:
    def __init__(self, step_length=0.3, step_width=0.2, step_height=0.05):
        self.step_length = step_length  # Forward step length
        self.step_width = step_width    # Lateral step width
        self.step_height = step_height  # Maximum foot lift height

        # Walking parameters
        self.stride_length = 0.3  # Distance per step
        self.step_timing = 0.8    # Time per step (s)
        self.double_support_ratio = 0.1  # Ratio of double support phase

    def plan_forward_walk(self, start_pos, num_steps, step_length=None):
        """
        Plan footstep sequence for forward walking
        """
        if step_length is None:
            step_length = self.step_length

        footsteps = []

        # Determine starting support foot
        current_support_foot = 'left'  # Assume left foot starts in support
        current_pos = start_pos.copy()

        for step_idx in range(num_steps):
            # Determine swing foot
            swing_foot = 'right' if current_support_foot == 'left' else 'left'

            # Calculate swing foot position
            if current_support_foot == 'left':
                # Swing right foot forward and slightly to the right
                swing_pos = current_pos + np.array([step_length, -self.step_width/2, 0])
            else:
                # Swing left foot forward and slightly to the left
                swing_pos = current_pos + np.array([step_length, self.step_width/2, 0])

            # Add footstep to plan
            footstep = {
                'step_number': step_idx,
                'swing_foot': swing_foot,
                'support_foot': current_support_foot,
                'position': swing_pos,
                'timing': (step_idx + 1) * self.step_timing,
                'height': self.step_height
            }
            footsteps.append(footstep)

            # Update for next step
            current_pos = swing_pos.copy()  # Move to new swing foot position
            current_support_foot = swing_foot  # New support foot becomes previous swing foot

        return footsteps

    def plan_turning_walk(self, start_pos, turn_angle, num_steps):
        """
        Plan footstep sequence for turning
        """
        footsteps = []
        current_pos = start_pos.copy()
        current_yaw = 0.0
        current_support_foot = 'left'

        # Calculate incremental turn per step
        delta_yaw = turn_angle / num_steps

        for step_idx in range(num_steps):
            swing_foot = 'right' if current_support_foot == 'left' else 'left'

            # Calculate turning offset
            turn_offset = self.step_width / 2 if current_support_foot == 'left' else -self.step_width / 2

            # Apply rotation transformation
            cos_yaw = np.cos(current_yaw + delta_yaw)
            sin_yaw = np.sin(current_yaw + delta_yaw)

            # Calculate new position with rotation
            forward_offset = np.array([self.step_length * cos_yaw, self.step_length * sin_yaw, 0])
            lateral_offset = np.array([-turn_offset * sin_yaw, turn_offset * cos_yaw, 0])

            swing_pos = current_pos + forward_offset + lateral_offset

            footstep = {
                'step_number': step_idx,
                'swing_foot': swing_foot,
                'support_foot': current_support_foot,
                'position': swing_pos,
                'yaw': current_yaw + delta_yaw,
                'timing': (step_idx + 1) * self.step_timing,
                'height': self.step_height
            }
            footsteps.append(footstep)

            # Update for next step
            current_pos = swing_pos.copy()
            current_yaw += delta_yaw
            current_support_foot = swing_foot

        return footsteps

    def plan_sideways_walk(self, start_pos, distance, num_steps):
        """
        Plan footstep sequence for sideways walking
        """
        footsteps = []
        current_pos = start_pos.copy()
        current_support_foot = 'left'

        # Calculate lateral step size
        lateral_step = distance / num_steps
        step_sign = 1.0 if distance > 0 else -1.0

        for step_idx in range(num_steps):
            swing_foot = 'right' if current_support_foot == 'left' else 'left'

            # Calculate swing foot position with alternating lateral offset
            if step_idx % 2 == 0:
                # Move in intended direction
                lateral_offset = step_sign * self.step_width / 2
            else:
                # Return to center line
                lateral_offset = 0.0

            swing_pos = current_pos + np.array([0, lateral_step + lateral_offset, 0])

            footstep = {
                'step_number': step_idx,
                'swing_foot': swing_foot,
                'support_foot': current_support_foot,
                'position': swing_pos,
                'timing': (step_idx + 1) * self.step_timing,
                'height': self.step_height
            }
            footsteps.append(footstep)

            # Update for next step
            current_pos = swing_pos.copy()
            current_support_foot = swing_foot

        return footsteps

    def plan_terrain_adaptive_walk(self, start_pos, terrain_map, path, step_height_adjustment=True):
        """
        Plan footstep sequence adapted to terrain
        """
        footsteps = []
        current_support_foot = 'left'
        current_pos = start_pos.copy()

        # Plan footsteps along path
        for i in range(len(path) - 1):
            swing_foot = 'right' if current_support_foot == 'left' else 'left'

            # Calculate next position along path
            next_pos = path[i + 1].copy()

            # Adjust height based on terrain
            if step_height_adjustment:
                terrain_height = self.get_terrain_height(terrain_map, next_pos[:2])
                next_pos[2] = terrain_height + 0.02  # Slight clearance above terrain

            footstep = {
                'step_number': i,
                'swing_foot': swing_foot,
                'support_foot': current_support_foot,
                'position': next_pos,
                'timing': (i + 1) * self.step_timing,
                'height': self.get_adaptive_step_height(terrain_map, current_pos, next_pos)
            }
            footsteps.append(footstep)

            # Update for next step
            current_pos = next_pos.copy()
            current_support_foot = swing_foot

        return footsteps

    def get_terrain_height(self, terrain_map, xy_pos):
        """
        Get terrain height at given position
        """
        # This would interface with actual terrain height map
        # For now, return flat ground
        return 0.0

    def get_adaptive_step_height(self, terrain_map, current_pos, next_pos):
        """
        Get adaptive step height based on terrain
        """
        # Calculate required clearance based on terrain variation
        current_height = self.get_terrain_height(terrain_map, current_pos[:2])
        next_height = self.get_terrain_height(terrain_map, next_pos[:2])

        height_difference = abs(next_height - current_height)

        # Return step height adjusted for terrain
        return max(self.step_height, height_difference + 0.05)  # Add safety margin
```

### Dynamic Walking Pattern Generation

#### Preview Control for ZMP Tracking
```python
class PreviewController:
    def __init__(self, com_height=0.8, gravity=9.81, preview_horizon=20, dt=0.01):
        self.com_height = com_height
        self.gravity = gravity
        self.omega = np.sqrt(gravity / com_height)
        self.preview_horizon = preview_horizon
        self.dt = dt

        # Compute preview control gains
        self.Kx, self.Kp = self.compute_preview_gains()

    def compute_preview_gains(self):
        """
        Compute preview control gains for ZMP tracking
        """
        # System matrices for LIPM
        A = np.array([[1, self.dt, self.dt**2/2],
                      [0, 1, self.dt],
                      [0, 0, 1]])

        B = np.array([self.dt**3/6, self.dt**2/2, self.dt])

        C = np.array([1, 0, -self.com_height/self.gravity])

        # Solve discrete-time Riccati equation for optimal control
        # This is a simplified version - in practice, use more sophisticated methods
        Q = np.array([[100, 0, 0],
                      [0, 10, 0],
                      [0, 0, 1]])  # State cost matrix
        R = 0.1  # Control cost

        # Compute LQR gains (simplified computation)
        K = np.array([1.0, 10.0, 100.0])  # Simplified gains

        # Compute preview gains
        Kx = K[:3]  # State feedback gains
        Kp = []  # Preview gains for future ZMP references

        # Compute preview gains for each time step in horizon
        for i in range(self.preview_horizon):
            # Simplified preview gain computation
            ki = K[2] * (self.omega * self.dt)**i * np.exp(-self.omega * i * self.dt)
            Kp.append(ki)

        return Kx, np.array(Kp)

    def compute_com_trajectory(self, zmp_reference, initial_state):
        """
        Compute CoM trajectory using preview control
        """
        num_steps = len(zmp_reference)
        com_trajectory = np.zeros((num_steps, 3))  # [x, y, z]
        com_velocity = np.zeros((num_steps, 3))
        com_acceleration = np.zeros((num_steps, 3))

        # Initialize with initial state
        com_trajectory[0] = initial_state[:3]
        com_velocity[0] = initial_state[3:6]

        for i in range(1, num_steps):
            # Get preview of future ZMP references
            zmp_preview = []
            for j in range(min(self.preview_horizon, num_steps - i)):
                zmp_preview.append(zmp_reference[min(i + j, num_steps - 1)])

            # Compute control using preview
            current_com = com_trajectory[i-1]
            current_vel = com_velocity[i-1]

            # State feedback
            state_error = np.array([
                current_com[0] - zmp_reference[i-1][0],
                current_vel[0],
                0  # Acceleration error term
            ])
            feedback_control = -self.Kx @ state_error

            # Preview control
            preview_control = 0.0
            for k, (zmp_k, gain_k) in enumerate(zip(zmp_preview, self.Kp)):
                if i + k < num_steps:
                    preview_control += gain_k * (zmp_k[0] - zmp_reference[i-1][0])

            # Total control
            total_control = feedback_control + preview_control

            # Integrate dynamics
            com_acc_x = self.omega**2 * (current_com[0] - zmp_reference[i-1][0]) + total_control
            com_acc_y = self.omega**2 * (current_com[1] - zmp_reference[i-1][1])

            # Update velocity and position
            com_velocity[i, 0] = com_velocity[i-1, 0] + com_acc_x * self.dt
            com_velocity[i, 1] = com_velocity[i-1, 1] + com_acc_y * self.dt
            com_velocity[i, 2] = 0  # Z velocity remains zero (constant height)

            com_trajectory[i, 0] = com_trajectory[i-1, 0] + com_velocity[i, 0] * self.dt
            com_trajectory[i, 1] = com_trajectory[i-1, 1] + com_velocity[i, 1] * self.dt
            com_trajectory[i, 2] = self.com_height  # Maintain constant height

            com_acceleration[i, 0] = com_acc_x
            com_acceleration[i, 1] = com_acc_y
            com_acceleration[i, 2] = 0

        return com_trajectory, com_velocity, com_acceleration

    def generate_zmp_trajectory(self, footsteps, gait_timing):
        """
        Generate ZMP trajectory from footstep plan
        """
        # This generates ZMP reference that moves from one foot to another
        # following the footstep plan
        zmp_trajectory = []

        for i in range(len(footsteps)):
            footstep = footsteps[i]
            timing_info = gait_timing[i]

            # Generate ZMP trajectory for this step
            step_duration = timing_info['duration']
            num_points = int(step_duration / self.dt)

            # For single support phase, ZMP moves from previous foot to current foot
            if i > 0:
                prev_foot_pos = footsteps[i-1]['position']
            else:
                # Starting position
                prev_foot_pos = np.array([0, 0, 0])

            current_foot_pos = footstep['position']

            # Generate smooth transition from previous foot to current foot
            for j in range(num_points):
                t = j / num_points  # Normalized time (0 to 1)

                # Use cubic spline for smooth transition
                # ZMP moves from previous foot to current foot
                alpha = 3*t**2 - 2*t**3  # Cubic spline interpolation
                zmp_pos = (1 - alpha) * prev_foot_pos[:2] + alpha * current_foot_pos[:2]

                zmp_trajectory.append(zmp_pos)

        return np.array(zmp_trajectory)
```

## Balance Control Strategies

### Zero Moment Point (ZMP) Control

#### ZMP-Based Balance Control
```python
class ZMPBalanceController:
    def __init__(self, com_height=0.8, gravity=9.81, control_dt=0.005):
        self.com_height = com_height
        self.gravity = gravity
        self.omega = np.sqrt(gravity / com_height)
        self.control_dt = control_dt

        # Control gains
        self.kp_com = 50.0   # Proportional gain for CoM position
        self.kd_com = 10.0   # Derivative gain for CoM velocity
        self.kp_zmp = 100.0  # Proportional gain for ZMP tracking
        self.kd_zmp = 20.0   # Derivative gain for ZMP velocity

        # Support polygon parameters
        self.foot_length = 0.25  # Length of foot
        self.foot_width = 0.15   # Width of foot
        self.support_margin = 0.02  # Safety margin within foot

        # State estimation
        self.com_position = np.zeros(3)
        self.com_velocity = np.zeros(3)
        self.com_acceleration = np.zeros(3)
        self.zmp_measured = np.zeros(2)
        self.zmp_reference = np.zeros(2)

    def compute_balance_control(self, current_state, zmp_reference, dt=None):
        """
        Compute balance control torques based on ZMP tracking
        """
        if dt is None:
            dt = self.control_dt

        # Extract state information
        self.com_position = current_state['com_position']
        self.com_velocity = current_state['com_velocity']
        self.zmp_measured = current_state['zmp_measured']
        self.zmp_reference = zmp_reference

        # Compute ZMP error
        zmp_error = self.zmp_reference - self.zmp_measured

        # Compute CoM position error
        com_pos_error = self.zmp_reference - self.com_position[:2]

        # Compute control using ZMP-based approach
        # For LIPM: τ = Kp*(ZMP_ref - ZMP_measured) + Kd*(0 - ZMP_vel_measured)
        zmp_control = self.kp_zmp * zmp_error

        # Additional CoM position control
        com_control = self.kp_com * com_pos_error

        # Combine controls
        combined_control = 0.7 * zmp_control + 0.3 * com_control

        # Convert to joint torques using whole-body control
        joint_torques = self.compute_joint_torques_from_zmp_control(combined_control)

        return joint_torques, zmp_error, com_pos_error

    def compute_joint_torques_from_zmp_control(self, zmp_control):
        """
        Convert ZMP control to joint torques using whole-body control
        """
        # This is a simplified approach - in practice, use full whole-body control
        # with Jacobians and null-space projections

        # For now, return a simplified mapping
        # In real implementation, this would use:
        # 1. Inverse kinematics to determine desired CoM motion
        # 2. Whole-body controller to compute joint torques
        # 3. Torque distribution based on joint priorities

        num_joints = 32  # Example number of joints
        joint_torques = np.zeros(num_joints)

        # Distribute ZMP control to relevant joints (simplified)
        # Legs and torso joints are most relevant for balance
        leg_joints = [6, 7, 8, 9, 10, 11, 18, 19, 20, 21, 22, 23]  # Example leg joint indices

        for joint_idx in leg_joints:
            if joint_idx < num_joints:
                # Distribute control proportionally
                joint_torques[joint_idx] = zmp_control[0] * 0.1 + zmp_control[1] * 0.1

        return joint_torques

    def compute_support_polygon(self, left_foot_pos, right_foot_pos):
        """
        Compute support polygon from foot positions
        """
        # For double support, support polygon is convex hull of both feet
        # For single support, it's the supporting foot
        support_vertices = []

        # Simplified rectangular foot model
        foot_half_length = self.foot_length / 2
        foot_half_width = self.foot_width / 2

        # Left foot vertices
        left_foot_center = left_foot_pos[:2]
        left_vertices = [
            left_foot_center + np.array([foot_half_length, foot_half_width]),
            left_foot_center + np.array([foot_half_length, -foot_half_width]),
            left_foot_center + np.array([-foot_half_length, -foot_half_width]),
            left_foot_center + np.array([-foot_half_length, foot_half_width])
        ]

        # Right foot vertices
        right_foot_center = right_foot_pos[:2]
        right_vertices = [
            right_foot_center + np.array([foot_half_length, foot_half_width]),
            right_foot_center + np.array([foot_half_length, -foot_half_width]),
            right_foot_center + np.array([-foot_half_length, -foot_half_width]),
            right_foot_center + np.array([-foot_half_length, foot_half_width])
        ]

        # Combine all vertices and compute convex hull
        all_vertices = left_vertices + right_vertices

        # For now, return simplified bounding box
        min_x = min(v[0] for v in all_vertices)
        max_x = max(v[0] for v in all_vertices)
        min_y = min(v[1] for v in all_vertices)
        max_y = max(v[1] for v in all_vertices)

        return np.array([[min_x, min_y], [max_x, min_y], [max_x, max_y], [min_x, max_y]])

    def is_zmp_in_support_polygon(self, zmp_pos, support_polygon):
        """
        Check if ZMP is within support polygon
        """
        # Use point-in-polygon test
        x, y = zmp_pos
        n = len(support_polygon)
        inside = False

        p1x, p1y = support_polygon[0]
        for i in range(1, n + 1):
            p2x, p2y = support_polygon[i % n]
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y

        return inside

    def compute_balance_metrics(self, zmp_reference, zmp_measured, support_polygon):
        """
        Compute balance metrics for evaluation
        """
        zmp_error = np.linalg.norm(zmp_reference - zmp_measured)

        # Distance to support polygon boundary
        zmp_to_boundary = self.distance_to_polygon_boundary(zmp_measured, support_polygon)

        # Capture point (for future fall prediction)
        com_pos = self.com_position[:2]
        com_vel = self.com_velocity[:2]
        capture_point = com_pos + com_vel / self.omega

        # Distance to capture point
        cp_distance = np.linalg.norm(zmp_measured - capture_point)

        return {
            'zmp_error': zmp_error,
            'boundary_distance': zmp_to_boundary,
            'capture_point_distance': cp_distance,
            'is_stable': zmp_to_boundary > 0.02,  # At least 2cm from boundary
            'capture_point_valid': cp_distance < 0.3  # Within 30cm of capture point
        }

    def distance_to_polygon_boundary(self, point, polygon):
        """
        Compute minimum distance from point to polygon boundary
        """
        min_dist = float('inf')

        for i in range(len(polygon)):
            p1 = polygon[i]
            p2 = polygon[(i + 1) % len(polygon)]

            # Distance from point to line segment
            dist = self.distance_point_to_segment(point, p1, p2)
            min_dist = min(min_dist, dist)

        return min_dist

    def distance_point_to_segment(self, point, seg_start, seg_end):
        """
        Compute distance from point to line segment
        """
        # Vector from segment start to end
        seg_vec = seg_end - seg_start
        seg_len_sq = np.dot(seg_vec, seg_vec)

        if seg_len_sq == 0:
            # Segment is actually a point
            return np.linalg.norm(point - seg_start)

        # Parameter of closest point on infinite line
        t = max(0, min(1, np.dot(point - seg_start, seg_vec) / seg_len_sq))

        # Closest point on segment
        closest = seg_start + t * seg_vec

        return np.linalg.norm(point - closest)
```

### Capture Point Control

#### Capture Point-Based Balance Strategy
```python
class CapturePointController:
    def __init__(self, com_height=0.8, gravity=9.81):
        self.com_height = com_height
        self.gravity = gravity
        self.omega = np.sqrt(gravity / com_height)

        # Control parameters
        self.k_capture = 1.0  # Gain for capture point control
        self.k_com = 2.0      # Gain for CoM position control
        self.k_vel = 1.0      # Gain for CoM velocity control

        # Stabilization parameters
        self.com_velocity_threshold = 0.1  # Threshold for considering stopped motion
        self.capture_point_tolerance = 0.05  # 5cm tolerance

    def compute_capture_point(self, com_pos, com_vel):
        """
        Compute capture point from current CoM state
        Capture Point = CoM_pos + CoM_vel / ω
        """
        cp_x = com_pos[0] + com_vel[0] / self.omega
        cp_y = com_pos[1] + com_vel[1] / self.omega
        return np.array([cp_x, cp_y])

    def compute_stopping_region(self, com_pos, com_vel):
        """
        Compute stopping region based on capture point theory
        """
        # Compute capture point
        cp = self.compute_capture_point(com_pos, com_vel)

        # Stopping region is centered around current CoM position
        # with radius based on current velocity
        stopping_radius = np.linalg.norm(com_vel) / self.omega

        return cp, stopping_radius

    def compute_balance_control(self, current_com_pos, current_com_vel, desired_com_pos=None):
        """
        Compute balance control using capture point approach
        """
        current_cp = self.compute_capture_point(current_com_pos[:2], current_com_vel[:2])

        if desired_com_pos is not None:
            # If a desired CoM position is specified, compute desired capture point
            desired_cp = self.compute_capture_point(desired_com_pos[:2], np.zeros(2))
        else:
            # Otherwise, use current position as reference
            desired_cp = current_com_pos[:2]

        # Capture point error
        cp_error = desired_cp - current_cp

        # CoM position error
        com_pos_error = desired_com_pos[:2] - current_com_pos[:2] if desired_com_pos is not None else np.zeros(2)

        # Velocity error (desire zero velocity)
        vel_error = -current_com_vel[:2]

        # Combine control terms
        control_output = (
            self.k_capture * cp_error +
            self.k_com * com_pos_error +
            self.k_vel * vel_error
        )

        # Limit control output to prevent excessive forces
        max_control = 1.0  # Maximum control output (m/s²)
        control_output = np.clip(control_output, -max_control, max_control)

        return control_output, current_cp

    def compute_foot_placement_for_balance(self, current_com_state, target_com_state, support_foot_pos):
        """
        Compute optimal foot placement for balance recovery
        """
        current_com_pos = current_com_state[:2]
        current_com_vel = current_com_state[2:4]

        # Compute current capture point
        current_cp = self.compute_capture_point(current_com_pos, current_com_vel)

        # Determine where to place foot to achieve target state
        if target_com_state is not None:
            target_com_pos = target_com_state[:2]
            target_com_vel = target_com_state[2:4]
            target_cp = self.compute_capture_point(target_com_pos, target_com_vel)
        else:
            # Target is to stop at current position
            target_cp = current_com_pos

        # Compute foot placement
        # Rule: Place foot at or beyond the capture point to arrest motion
        foot_placement = current_cp.copy()

        # Add safety margin in direction of motion
        if np.linalg.norm(current_com_vel) > 0.05:  # If moving significantly
            vel_direction = current_com_vel / np.linalg.norm(current_com_vel)
            foot_placement += vel_direction * 0.1  # 10cm safety margin

        # Ensure foot placement is reasonable (not too far)
        max_step = 0.3  # Maximum step length
        step_to_support = foot_placement - support_foot_pos[:2]
        if np.linalg.norm(step_to_support) > max_step:
            # Limit step length
            step_direction = step_to_support / np.linalg.norm(step_to_support)
            foot_placement = support_foot_pos[:2] + step_direction * max_step

        return foot_placement, current_cp

    def compute_balance_recovery_sequence(self, current_state, support_foot_pos, swing_foot_pos):
        """
        Compute sequence of actions for balance recovery
        """
        com_pos = current_state['com_position'][:2]
        com_vel = current_state['com_velocity'][:2]

        current_cp = self.compute_capture_point(com_pos, com_vel)

        # Determine recovery strategy based on capture point location
        cp_to_support = current_cp - support_foot_pos[:2]
        distance_to_support = np.linalg.norm(cp_to_support)

        recovery_strategy = {
            'type': 'steady',  # Default
            'foot_placement': swing_foot_pos[:2],
            'torso_control': np.zeros(2),
            'timing': 0.8  # Default step timing
        }

        if distance_to_support > 0.15:  # 15cm from support foot
            # Need urgent recovery - step toward capture point
            recovery_strategy['type'] = 'urgent_step'
            recovery_strategy['foot_placement'] = current_cp
            recovery_strategy['timing'] = 0.5  # Faster step

        elif distance_to_support > 0.08:  # 8cm from support foot
            # Moderate recovery needed
            recovery_strategy['type'] = 'moderate_step'
            # Place foot halfway between current position and capture point
            recovery_strategy['foot_placement'] = 0.5 * (support_foot_pos[:2] + current_cp)
            recovery_strategy['timing'] = 0.6

        elif np.linalg.norm(com_vel) > 0.3:  # High velocity
            # Need to arrest momentum
            recovery_strategy['type'] = 'momentum_arrest'
            vel_direction = com_vel / np.linalg.norm(com_vel) if np.linalg.norm(com_vel) > 0 else np.array([0, 0])
            recovery_strategy['foot_placement'] = support_foot_pos[:2] + vel_direction * 0.1
            recovery_strategy['torso_control'] = -com_vel * 2.0  # Counteract velocity

        return recovery_strategy

    def is_balance_recoverable(self, com_pos, com_vel, support_polygon):
        """
        Determine if balance is recoverable based on capture point
        """
        cp = self.compute_capture_point(com_pos[:2], com_vel[:2])

        # Check if capture point is within support polygon (eventually stable)
        is_recoverable = self.is_point_in_polygon(cp, support_polygon)

        # Additional check: if velocity is too high, may not be recoverable
        vel_magnitude = np.linalg.norm(com_vel[:2])
        if vel_magnitude > 1.0:  # Too fast to recover
            is_recoverable = False

        return is_recoverable

    def is_point_in_polygon(self, point, polygon):
        """
        Check if point is inside polygon using ray casting algorithm
        """
        x, y = point
        n = len(polygon)
        inside = False

        p1x, p1y = polygon[0]
        for i in range(1, n + 1):
            p2x, p2y = polygon[i % n]
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y

        return inside
```

## Walking Pattern Generation Algorithms

### Central Pattern Generators (CPGs)

#### Bio-inspired Walking Patterns
```python
class CentralPatternGenerator:
    def __init__(self, dt=0.001):
        self.dt = dt

        # CPG network parameters
        self.num_oscillators = 8  # 4 for each leg (hip, knee, ankle, toe)
        self.omega = 2.0 * np.pi * 0.5  # Oscillation frequency (0.5 Hz)
        self.coupling_strength = 1.0
        self.feedback_gain = 0.5

        # Initialize oscillator states
        self.phases = np.random.uniform(0, 2*np.pi, self.num_oscillators)
        self.amplitudes = np.ones(self.num_oscillators) * 0.5
        self.frequencies = np.ones(self.num_oscillators) * self.omega

        # Oscillator coupling matrix (simplified)
        self.coupling_matrix = self.create_coupling_matrix()

        # Gait pattern parameters
        self.step_frequency = 0.8  # Steps per second
        self.step_length = 0.3     # Step length in meters
        self.step_height = 0.05    # Step height in meters

    def create_coupling_matrix(self):
        """
        Create coupling matrix for CPG network
        Simplified for leg coordination
        """
        # For humanoid walking: couple left/right legs in anti-phase
        # Couple joints within each leg for coordinated movement
        coupling = np.zeros((self.num_oscillators, self.num_oscillators))

        # Intra-leg coupling (hips, knees, ankles move in coordination)
        for leg in [0, 4]:  # Left leg (0-3), Right leg (4-7)
            for i in range(4):
                for j in range(4):
                    if i != j:
                        coupling[leg+i, leg+j] = 0.3  # Moderate coupling

        # Inter-leg coupling (left-right anti-phase for walking)
        for i in range(4):
            coupling[i, i+4] = -0.5  # Anti-phase coupling (left-right)
            coupling[i+4, i] = -0.5

        return coupling

    def update_oscillators(self, feedback_signals=None):
        """
        Update CPG oscillator states
        """
        # Save current states
        current_phases = self.phases.copy()
        current_amplitudes = self.amplitudes.copy()

        # Update phases based on coupling and intrinsic frequencies
        phase_derivatives = self.frequencies.copy()

        for i in range(self.num_oscillators):
            # Coupling with other oscillators
            coupling_sum = 0
            for j in range(self.num_oscillators):
                if i != j:
                    coupling_sum += self.coupling_matrix[i, j] * np.sin(
                        current_phases[j] - current_phases[i]
                    )

            # Add coupling effect
            phase_derivatives[i] += coupling_sum

            # Add feedback if provided
            if feedback_signals is not None:
                phase_derivatives[i] += self.feedback_gain * feedback_signals[i]

        # Integrate phase
        self.phases += phase_derivatives * self.dt

        # Keep phases in [0, 2π]
        self.phases = np.mod(self.phases, 2 * np.pi)

        # Update amplitudes (simple adaptation based on phase differences)
        for i in range(self.num_oscillators):
            # Adapt amplitude based on coordination with other oscillators
            coordination_error = 0
            for j in range(self.num_oscillators):
                if i != j:
                    coordination_error += np.abs(
                        np.sin(current_phases[j] - current_phases[i])
                    )

            # Adapt amplitude to promote coordination
            self.amplitudes[i] += self.dt * (-0.1 * self.amplitudes[i] + 0.05 * coordination_error)
            self.amplitudes[i] = np.clip(self.amplitudes[i], 0.1, 1.0)

    def get_output_signals(self):
        """
        Get output signals from CPG network
        """
        # Generate sinusoidal outputs based on oscillator states
        outputs = np.zeros(self.num_oscillators)

        for i in range(self.num_oscillators):
            # Sinusoidal output scaled by amplitude
            outputs[i] = self.amplitudes[i] * np.sin(self.phases[i])

        return outputs

    def generate_joint_commands(self, walking_speed, steering_command=0.0):
        """
        Generate joint commands from CPG outputs
        """
        # Get CPG outputs
        cpg_outputs = self.get_output_signals()

        # Map CPG outputs to joint commands
        joint_commands = np.zeros(32)  # Assuming 32 joint robot

        # Map CPG outputs to leg joints
        # Left leg: joints 6-11 (hip, knee, ankle for 2 legs)
        # Right leg: joints 18-23
        left_leg_joints = [6, 7, 8, 9, 10, 11]  # Hip yaw, roll, pitch; Knee pitch; Ankle pitch, roll
        right_leg_joints = [18, 19, 20, 21, 22, 23]

        # Scale outputs based on walking speed
        speed_factor = walking_speed / 0.5  # Normalize to 0.5 m/s

        # Left leg commands
        for i, joint_idx in enumerate(left_leg_joints):
            if i < len(cpg_outputs):
                # Apply different gains to different joints for natural gait
                if joint_idx in [6, 18]:  # Hip joints
                    gain = 0.3
                    offset = 0.0
                elif joint_idx in [7, 19]:  # Knee joints
                    gain = 0.4
                    offset = -0.5  # Default flexed position
                elif joint_idx in [8, 20]:  # Ankle pitch
                    gain = 0.2
                    offset = 0.0
                else:
                    gain = 0.1
                    offset = 0.0

                joint_commands[joint_idx] = offset + gain * speed_factor * cpg_outputs[i % len(cpg_outputs)]

        # Right leg commands (apply phase shift for alternating gait)
        phase_shift = np.pi  # Anti-phase for alternating steps
        for i, joint_idx in enumerate(right_leg_joints):
            if i < len(cpg_outputs):
                if joint_idx in [6, 18]:  # Hip joints
                    gain = 0.3
                    offset = 0.0
                elif joint_idx in [7, 19]:  # Knee joints
                    gain = 0.4
                    offset = -0.5
                elif joint_idx in [8, 20]:  # Ankle pitch
                    gain = 0.2
                    offset = 0.0
                else:
                    gain = 0.1
                    offset = 0.0

                # Apply phase shift for alternating pattern
                shifted_phase = self.phases[i % len(self.phases)] + phase_shift
                output = self.amplitudes[i % len(self.amplitudes)] * np.sin(shifted_phase)

                joint_commands[joint_idx] = offset + gain * speed_factor * output

        # Add steering command to hip yaw joints
        steering_factor = 0.2
        joint_commands[6] += steering_command * steering_factor  # Left hip yaw
        joint_commands[18] += -steering_command * steering_factor  # Right hip yaw (opposite for turning)

        return joint_commands

    def adapt_to_terrain(self, terrain_feedback):
        """
        Adapt CPG parameters based on terrain feedback
        """
        # Adjust parameters based on terrain characteristics
        # This could include adjusting step height, frequency, etc.
        if terrain_feedback['slope'] > 0.1:  # Uphill
            # Increase step height and adjust phase relationships
            self.step_height = min(0.1, self.step_height + 0.01)
            self.frequencies *= 0.9  # Slow down on slopes

        elif terrain_feedback['slope'] < -0.1:  # Downhill
            # Adjust for downhill walking
            self.frequencies *= 1.1  # Speed up slightly for stability
            self.step_height = max(0.03, self.step_height - 0.005)

        if terrain_feedback['roughness'] > 0.05:  # Rough terrain
            # Increase stability parameters
            self.coupling_strength *= 1.1
            self.feedback_gain *= 1.2

    def reset_oscillators(self):
        """
        Reset oscillator states
        """
        self.phases = np.random.uniform(0, 2*np.pi, self.num_oscillators)
        self.amplitudes = np.ones(self.num_oscillators) * 0.5
```

### Model Predictive Control for Walking

#### MPC-Based Walking Controller
```python
import cvxpy as cp

class ModelPredictiveWalkingController:
    def __init__(self, com_height=0.8, gravity=9.81, horizon=20, dt=0.01):
        self.com_height = com_height
        self.gravity = gravity
        self.omega = np.sqrt(gravity / com_height)
        self.horizon = horizon  # Prediction horizon
        self.dt = dt

        # State: [x, y, z, vx, vy, vz] (CoM position and velocity)
        self.state_dim = 6
        self.control_dim = 2  # ZMP_x, ZMP_y

        # Cost matrices
        self.Q = np.diag([100, 100, 1, 10, 10, 1])  # State cost
        self.R = np.diag([1, 1])  # Control cost
        self.P = np.diag([500, 500, 10, 50, 50, 10])  # Terminal cost

        # System matrices for discrete-time LIPM
        self.A = self.compute_system_matrix()
        self.B = self.compute_input_matrix()

        # Constraints
        self.max_zmp_deviation = 0.15  # Maximum ZMP deviation from foot center

    def compute_system_matrix(self):
        """
        Compute state transition matrix A for LIPM
        State: [x, y, z, vx, vy, vz]
        Dynamics: ẍ = ω²(x - x_zmp), ÿ = ω²(y - y_zmp), z̈ = 0
        """
        dt = self.dt
        omega = self.omega

        A = np.eye(self.state_dim)

        # Position-velocity relationships
        A[0, 3] = dt  # x += vx*dt
        A[1, 4] = dt  # y += vy*dt
        A[2, 5] = dt  # z += vz*dt

        # Acceleration relationships (LIPM dynamics)
        A[3, 0] = omega**2 * dt  # vx += ω²*x*dt
        A[4, 1] = omega**2 * dt  # vy += ω²*y*dt
        # A[5, 2] = 0  # vz doesn't change due to z position directly

        return A

    def compute_input_matrix(self):
        """
        Compute input matrix B for ZMP control
        Input: [zmp_x, zmp_y]
        """
        dt = self.dt
        omega = self.omega

        B = np.zeros((self.state_dim, self.control_dim))

        # ZMP affects acceleration
        B[3, 0] = -omega**2 * dt  # vx affected by zmp_x
        B[4, 1] = -omega**2 * dt  # vy affected by zmp_y

        return B

    def solve_mpc_problem(self, current_state, reference_trajectory, support_polygons):
        """
        Solve MPC optimization problem
        """
        # Define optimization variables
        X = cp.Variable((self.state_dim, self.horizon + 1))  # State trajectory
        U = cp.Variable((self.control_dim, self.horizon))    # Control trajectory (ZMP)

        # Cost function
        cost = 0

        # Stage costs (tracking reference)
        for k in range(self.horizon):
            state_error = X[:, k] - reference_trajectory[k]
            cost += cp.quad_form(state_error, self.Q)

            control_effort = cp.quad_form(U[:, k], self.R)
            cost += control_effort

        # Terminal cost
        terminal_error = X[:, self.horizon] - reference_trajectory[self.horizon]
        cost += cp.quad_form(terminal_error, self.P)

        # Constraints
        constraints = []

        # Initial state constraint
        constraints.append(X[:, 0] == current_state)

        # System dynamics constraints
        for k in range(self.horizon):
            constraints.append(X[:, k+1] == self.A @ X[:, k] + self.B @ U[:, k])

        # ZMP constraints (must be within support polygon)
        for k in range(self.horizon):
            zmp_x = U[0, k]
            zmp_y = U[1, k]

            # Get support polygon for time step k
            support_poly = support_polygons[min(k, len(support_polygons)-1)]
            center_x, center_y = support_poly['center']
            half_length = support_poly['half_length']
            half_width = support_poly['half_width']

            # ZMP must be within support polygon
            constraints.append(zmp_x >= center_x - half_length)
            constraints.append(zmp_x <= center_x + half_length)
            constraints.append(zmp_y >= center_y - half_width)
            constraints.append(zmp_y <= center_y + half_width)

        # Formulate and solve optimization problem
        problem = cp.Problem(cp.Minimize(cost), constraints)

        try:
            problem.solve(solver=cp.ECOS, verbose=False)

            if problem.status not in ["infeasible", "unbounded"]:
                # Return optimal control sequence
                optimal_controls = U.value
                optimal_trajectory = X.value

                return optimal_controls[:, 0], optimal_trajectory  # Return first control and full trajectory
            else:
                print(f"MPC problem status: {problem.status}")
                return None, None

        except Exception as e:
            print(f"Error solving MPC: {e}")
            return None, None

    def compute_reference_trajectory(self, start_state, walking_pattern, time_offset=0):
        """
        Compute reference trajectory based on walking pattern
        """
        reference_trajectory = np.zeros((self.state_dim, self.horizon + 1))
        reference_trajectory[:, 0] = start_state

        # Generate reference based on walking pattern
        for k in range(self.horizon):
            t = (k + time_offset) * self.dt

            # Simple reference generation based on walking pattern
            # This would be replaced with more sophisticated pattern generation
            step_phase = (t * self.step_frequency) % 1.0

            # Generate smooth CoM trajectory
            ref_x = start_state[0] + self.walking_speed * t
            ref_y = start_state[1] + 0.1 * np.sin(2 * np.pi * t * self.step_frequency)  # Lateral sway
            ref_z = self.com_height  # Maintain height

            # Compute desired velocities
            ref_vx = self.walking_speed
            ref_vy = 0.1 * 2 * np.pi * self.step_frequency * np.cos(2 * np.pi * t * self.step_frequency)
            ref_vz = 0.0

            reference_trajectory[:, k+1] = [ref_x, ref_y, ref_z, ref_vx, ref_vy, ref_vz]

        return reference_trajectory

    def compute_support_polygons_from_footsteps(self, footsteps, current_time):
        """
        Compute time-varying support polygons from footstep plan
        """
        support_polygons = []

        for k in range(self.horizon):
            t = current_time + k * self.dt

            # Determine which foot is in support at time t
            support_info = self.get_support_at_time(footsteps, t)

            if support_info['double_support']:
                # Double support - polygon between both feet
                center_x = (support_info['left_foot'][0] + support_info['right_foot'][0]) / 2
                center_y = (support_info['left_foot'][1] + support_info['right_foot'][1]) / 2
                half_length = max(abs(support_info['left_foot'][0] - support_info['right_foot'][0])) / 2 + 0.05
                half_width = max(abs(support_info['left_foot'][1] - support_info['right_foot'][1])) / 2 + 0.05
            else:
                # Single support - polygon around support foot
                support_foot = support_info['support_foot_pos']
                center_x, center_y = support_foot[0], support_foot[1]
                half_length = 0.125  # Half foot length
                half_width = 0.075   # Half foot width

            support_polygons.append({
                'center': (center_x, center_y),
                'half_length': half_length,
                'half_width': half_width
            })

        return support_polygons

    def get_support_at_time(self, footsteps, time):
        """
        Determine support state at given time
        """
        # This would analyze footstep timing to determine support state
        # For now, return simplified information
        return {
            'double_support': False,
            'support_foot_pos': np.array([0.0, 0.0, 0.0]),
            'left_foot': np.array([0.0, 0.1, 0.0]),
            'right_foot': np.array([0.0, -0.1, 0.0])
        }

    def update_walking_control(self, current_state, walking_pattern, footsteps, current_time):
        """
        Update walking control using MPC
        """
        # Compute reference trajectory
        reference_trajectory = self.compute_reference_trajectory(
            current_state, walking_pattern, current_time / self.dt
        )

        # Compute support polygons
        support_polygons = self.compute_support_polygons_from_footsteps(footsteps, current_time)

        # Solve MPC problem
        optimal_zmp, predicted_trajectory = self.solve_mpc_problem(
            current_state, reference_trajectory, support_polygons
        )

        if optimal_zmp is not None:
            # Convert ZMP to joint torques using inverse dynamics
            joint_torques = self.zmp_to_joint_torques(optimal_zmp, current_state)
            return joint_torques, optimal_zmp, predicted_trajectory
        else:
            # Fallback to simple control if MPC fails
            return self.fallback_control(current_state, walking_pattern)

    def zmp_to_joint_torques(self, zmp_command, current_state):
        """
        Convert ZMP command to joint torques using whole-body control
        """
        # This would use whole-body inverse dynamics to convert ZMP to joint torques
        # For now, return a simplified mapping
        num_joints = 32
        joint_torques = np.zeros(num_joints)

        # Distribute ZMP command to relevant joints
        # This would involve complex whole-body optimization in practice
        leg_joints = [6, 7, 8, 9, 10, 11, 18, 19, 20, 21, 22, 23]  # Leg joints

        for joint_idx in leg_joints:
            if joint_idx < num_joints:
                # Simple proportional mapping
                joint_torques[joint_idx] = zmp_command[0] * 0.1 + zmp_command[1] * 0.1

        return joint_torques

    def fallback_control(self, current_state, walking_pattern):
        """
        Fallback control if MPC fails
        """
        # Simple ZMP-based control as fallback
        desired_zmp = walking_pattern.get_desired_zmp(current_state)
        current_zmp = self.estimate_current_zmp(current_state)

        zmp_error = desired_zmp - current_zmp
        zmp_control = 100.0 * zmp_error  # Simple proportional control

        joint_torques = self.zmp_to_joint_torques(zmp_control, current_state)

        return joint_torques, zmp_control, None

    def estimate_current_zmp(self, state):
        """
        Estimate current ZMP from state
        """
        com_pos = state[:3]
        com_acc = state[3:6]  # This would come from state estimation

        # ZMP_x = CoM_x - h * CoM_acc_x / g
        zmp_x = com_pos[0] - self.com_height * com_acc[0] / self.gravity
        zmp_y = com_pos[1] - self.com_height * com_acc[1] / self.gravity

        return np.array([zmp_x, zmp_y])
```

## Advanced Locomotion Techniques

### Adaptive Walking Control

#### Terrain-Adaptive Walking
```python
class AdaptiveWalkingController:
    def __init__(self, base_controller):
        self.base_controller = base_controller
        self.terrain_classifier = TerrainClassifier()
        self.adaptation_manager = AdaptationManager()
        self.stability_assessor = StabilityAssessmentModule()

        # Terrain-specific parameters
        self.terrain_parameters = {
            'flat': {
                'step_height': 0.05,
                'step_length': 0.3,
                'step_width': 0.2,
                'swing_speed': 1.0,
                'stance_duration': 0.8,
                'zmp_margin': 0.05
            },
            'uneven': {
                'step_height': 0.08,
                'step_length': 0.25,
                'step_width': 0.25,
                'swing_speed': 0.8,
                'stance_duration': 0.9,
                'zmp_margin': 0.08
            },
            'sloped': {
                'step_height': 0.06,
                'step_length': 0.28,
                'step_width': 0.22,
                'swing_speed': 0.9,
                'stance_duration': 0.85,
                'zmp_margin': 0.06
            },
            'slippery': {
                'step_height': 0.04,
                'step_length': 0.2,
                'step_width': 0.2,
                'swing_speed': 0.6,
                'stance_duration': 1.0,
                'zmp_margin': 0.10
            }
        }

        # Adaptation parameters
        self.adaptation_rate = 0.1
        self.stability_threshold = 0.8

    def classify_terrain(self, sensor_data):
        """
        Classify terrain type based on sensor data
        """
        return self.terrain_classifier.classify(sensor_data)

    def adapt_walking_pattern(self, terrain_type, current_state):
        """
        Adapt walking pattern based on terrain classification
        """
        if terrain_type in self.terrain_parameters:
            params = self.terrain_parameters[terrain_type]

            # Adjust walking parameters
            self.base_controller.step_height = params['step_height']
            self.base_controller.step_length = params['step_length']
            self.base_controller.step_width = params['step_width']
            self.base_controller.swing_speed = params['swing_speed']
            self.base_controller.stance_duration = params['stance_duration']

            # Adjust balance parameters
            self.base_controller.zmp_margin = params['zmp_margin']

    def compute_terrain_adaptive_control(self, current_state, sensor_data, desired_velocity):
        """
        Compute terrain-adaptive walking control
        """
        # Classify terrain
        terrain_type = self.classify_terrain(sensor_data)

        # Adapt walking parameters
        self.adapt_walking_pattern(terrain_type, current_state)

        # Assess current stability
        stability_metrics = self.stability_assessor.assess(current_state)

        # Adjust control based on stability
        if stability_metrics['stability_score'] < self.stability_threshold:
            # Reduce walking speed for stability
            desired_velocity *= 0.7
            # Increase step margins
            self.base_controller.zmp_margin *= 1.2

        # Compute base walking control with adapted parameters
        control_output = self.base_controller.compute_control(
            current_state, desired_velocity
        )

        # Apply terrain-specific modifications
        control_output = self.apply_terrain_modifications(
            control_output, terrain_type, sensor_data
        )

        return control_output, terrain_type, stability_metrics

    def apply_terrain_modifications(self, base_control, terrain_type, sensor_data):
        """
        Apply terrain-specific modifications to base control
        """
        modified_control = base_control.copy()

        if terrain_type == 'sloped':
            # Compensate for slope
            slope_angle = sensor_data.get('slope_angle', 0.0)
            slope_compensation = self.compute_slope_compensation(slope_angle)
            modified_control += slope_compensation

        elif terrain_type == 'uneven':
            # Add ankle adjustments for uneven terrain
            ankle_adjustments = self.compute_ankle_adjustments(sensor_data)
            modified_control[8:10] += ankle_adjustments  # Ankle joints
            modified_control[20:22] += ankle_adjustments  # Right ankle joints

        elif terrain_type == 'slippery':
            # Reduce aggressive movements
            modified_control *= 0.8  # Conservative scaling
            # Increase contact forces for better grip
            modified_control = self.increase_contact_stability(modified_control)

        return modified_control

    def compute_slope_compensation(self, slope_angle):
        """
        Compute compensation for sloped terrain
        """
        # Simplified compensation - in practice, this would be more complex
        compensation = np.zeros(32)  # Assuming 32 joints

        # Adjust hip and ankle angles for slope
        hip_compensation = slope_angle * 0.5
        ankle_compensation = -slope_angle * 0.3

        # Apply to both legs
        compensation[6] = hip_compensation   # Left hip pitch
        compensation[18] = hip_compensation  # Right hip pitch
        compensation[8] = ankle_compensation # Left ankle pitch
        compensation[20] = ankle_compensation # Right ankle pitch

        return compensation

    def compute_ankle_adjustments(self, sensor_data):
        """
        Compute ankle adjustments for uneven terrain
        """
        # Use force/torque sensors or IMU data to detect terrain irregularities
        foot_contact_forces = sensor_data.get('foot_forces', np.zeros(6))
        imu_measurements = sensor_data.get('imu', np.zeros(6))

        # Compute required ankle adjustments
        # This would use actual sensor feedback in practice
        adjustments = np.zeros(2)  # [pitch, roll]

        # Example: adjust based on contact forces
        if abs(foot_contact_forces[2]) < 10:  # Low vertical force indicates tip-toe
            adjustments[0] = -0.1  # Adjust ankle to flatten foot

        return adjustments

    def increase_contact_stability(self, control):
        """
        Increase stability on slippery surfaces
        """
        # Increase stance time
        # Reduce step length
        # Increase downward forces (simplified)
        stability_control = control.copy()
        stability_control[7] -= 0.1  # Left knee - increase flexion for stability
        stability_control[19] -= 0.1  # Right knee - increase flexion for stability

        return stability_control

class TerrainClassifier:
    def __init__(self):
        # Use machine learning model or rule-based classifier
        self.ml_model = self.train_classifier()
        self.feature_extractors = {
            'visual': self.extract_visual_features,
            'haptic': self.extract_haptic_features,
            'auditory': self.extract_auditory_features
        }

    def classify(self, sensor_data):
        """
        Classify terrain using multiple sensor modalities
        """
        features = []

        # Extract features from different sensors
        if 'camera' in sensor_data:
            visual_features = self.feature_extractors['visual'](sensor_data['camera'])
            features.extend(visual_features)

        if 'force_torque' in sensor_data:
            haptic_features = self.feature_extractors['haptic'](sensor_data['force_torque'])
            features.extend(haptic_features)

        if 'audio' in sensor_data:
            auditory_features = self.feature_extractors['auditory'](sensor_data['audio'])
            features.extend(auditory_features)

        # Classify using ML model
        terrain_class = self.ml_model.predict([features])[0]
        confidence = np.max(self.ml_model.predict_proba([features]))

        return {
            'class': terrain_class,
            'confidence': confidence,
            'features': features
        }

    def extract_visual_features(self, image_data):
        """
        Extract visual features for terrain classification
        """
        # Compute texture, color, and geometric features
        # This would use computer vision techniques
        features = []

        # Example: basic texture features
        texture_variance = np.var(image_data)  # Simplified
        features.append(texture_variance)

        # Example: color histogram features
        color_mean = np.mean(image_data, axis=(0, 1))
        features.extend(color_mean.tolist())

        return features

    def extract_haptic_features(self, force_data):
        """
        Extract haptic features from force/torque sensors
        """
        features = []

        # Statistical features of force signals
        features.append(np.mean(force_data))
        features.append(np.std(force_data))
        features.append(np.max(force_data) - np.min(force_data))

        return features

    def extract_auditory_features(self, audio_data):
        """
        Extract auditory features from microphone data
        """
        features = []

        # Audio spectral features
        # This would use audio processing techniques
        features.append(np.mean(audio_data))
        features.append(np.std(audio_data))

        return features

    def train_classifier(self):
        """
        Train terrain classification model
        """
        # This would train a model using labeled terrain data
        # For now, return a simple mock classifier
        from sklearn.ensemble import RandomForestClassifier
        import numpy as np

        # Mock training data
        X_train = np.random.rand(100, 10)  # 10 features
        y_train = np.random.choice(['flat', 'uneven', 'sloped', 'slippery'], 100)

        model = RandomForestClassifier(n_estimators=100)
        model.fit(X_train, y_train)

        return model

class StabilityAssessmentModule:
    def __init__(self):
        self.stability_thresholds = {
            'zmp_margin': 0.05,  # Minimum distance from ZMP to support polygon edge
            'com_velocity': 0.5,  # Maximum CoM velocity magnitude
            'angular_momentum': 0.3,  # Maximum angular momentum
            'contact_forces': [50, 1000]  # Min and max acceptable contact forces
        }

    def assess(self, state):
        """
        Assess current stability based on robot state
        """
        stability_metrics = {}

        # Compute ZMP and check margin to support polygon
        zmp = self.compute_zmp(state)
        support_polygon = self.compute_support_polygon(state)
        zmp_margin = self.distance_to_polygon_boundary(zmp, support_polygon)

        stability_metrics['zmp_margin'] = zmp_margin
        stability_metrics['zmp_stable'] = zmp_margin > self.stability_thresholds['zmp_margin']

        # Check CoM velocity
        com_vel = state['com_velocity']
        com_vel_mag = np.linalg.norm(com_vel[:2])  # Horizontal velocity
        stability_metrics['com_velocity'] = com_vel_mag
        stability_metrics['velocity_stable'] = com_vel_mag < self.stability_thresholds['com_velocity']

        # Check angular momentum
        angular_momentum = self.compute_angular_momentum(state)
        stability_metrics['angular_momentum'] = angular_momentum
        stability_metrics['momentum_stable'] = abs(angular_momentum) < self.stability_thresholds['angular_momentum']

        # Check contact forces
        contact_forces = state.get('contact_forces', [0, 0])
        min_force, max_force = self.stability_thresholds['contact_forces']
        stability_metrics['contact_forces'] = contact_forces
        stability_metrics['force_stable'] = all(
            min_force <= f <= max_force for f in contact_forces
        )

        # Overall stability score
        stability_score = self.compute_overall_stability_score(stability_metrics)
        stability_metrics['stability_score'] = stability_score

        return stability_metrics

    def compute_zmp(self, state):
        """
        Compute Zero Moment Point from state
        """
        com_pos = state['com_position'][:2]
        com_acc = state['com_acceleration'][:2]
        com_height = state['com_position'][2]

        gravity = 9.81
        zmp_x = com_pos[0] - (com_height * com_acc[0]) / gravity
        zmp_y = com_pos[1] - (com_height * com_acc[1]) / gravity

        return np.array([zmp_x, zmp_y])

    def compute_angular_momentum(self, state):
        """
        Compute angular momentum around CoM
        """
        # Simplified computation
        # In practice, this would use full multibody dynamics
        body_angular_vel = state['base_angular_velocity']
        inertia_tensor = state.get('inertia_tensor', np.eye(3))

        angular_momentum = inertia_tensor @ body_angular_vel
        return np.linalg.norm(angular_momentum)

    def compute_overall_stability_score(self, metrics):
        """
        Compute overall stability score from individual metrics
        """
        scores = []

        # ZMP margin contributes to stability
        zmp_contribution = min(metrics['zmp_margin'] / 0.1, 1.0)  # Normalize to [0,1]
        scores.append(zmp_contribution)

        # Low velocity is more stable
        vel_contribution = max(0, 1 - metrics['com_velocity'] / 0.5)  # Invert velocity contribution
        scores.append(vel_contribution)

        # Low angular momentum is more stable
        mom_contribution = max(0, 1 - abs(metrics['angular_momentum']) / 0.3)
        scores.append(mom_contribution)

        # Balanced contact forces are more stable
        force_contribution = 0.5  # Simplified - would be more complex in reality
        scores.append(force_contribution)

        # Average all contributions
        overall_score = sum(scores) / len(scores)
        return overall_score
```

### Learning-Based Gait Adaptation

#### Online Learning for Gait Improvement
```python
class OnlineGaitLearning:
    def __init__(self, action_dim=32, state_dim=64, learning_rate=0.001):
        self.action_dim = action_dim
        self.state_dim = state_dim
        self.learning_rate = learning_rate

        # Neural network for policy
        self.policy_network = self.build_policy_network()
        self.optimizer = optim.Adam(self.policy_network.parameters(), lr=learning_rate)

        # Experience replay buffer
        self.replay_buffer = deque(maxlen=10000)

        # Performance metrics
        self.performance_history = {
            'walking_speed': [],
            'energy_efficiency': [],
            'stability': [],
            'smoothness': []
        }

        # Exploration parameters
        self.exploration_noise = 0.1
        self.exploration_decay = 0.999

    def build_policy_network(self):
        """
        Build neural network for gait policy
        """
        return nn.Sequential(
            nn.Linear(self.state_dim, 512),
            nn.ReLU(),
            nn.Linear(512, 512),
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, self.action_dim),
            nn.Tanh()  # Actions are bounded
        )

    def select_action(self, state, add_exploration=True):
        """
        Select action using current policy
        """
        state_tensor = torch.FloatTensor(state).unsqueeze(0)

        with torch.no_grad():
            action = self.policy_network(state_tensor).squeeze(0).numpy()

        if add_exploration:
            # Add exploration noise
            noise = np.random.normal(0, self.exploration_noise, size=self.action_dim)
            action = np.clip(action + noise, -1.0, 1.0)

            # Decay exploration
            self.exploration_noise *= self.exploration_decay

        return action

    def store_experience(self, state, action, reward, next_state, done):
        """
        Store experience in replay buffer
        """
        experience = (state, action, reward, next_state, done)
        self.replay_buffer.append(experience)

    def compute_reward(self, state, action, next_state, task_info):
        """
        Compute reward for gait learning
        """
        reward = 0.0

        # Forward progress reward
        current_pos = state['base_position']
        next_pos = next_state['base_position']
        forward_progress = next_pos[0] - current_pos[0]  # X-axis is forward
        reward += forward_progress * 10.0

        # Energy efficiency reward (negative for high energy consumption)
        energy_cost = np.sum(np.abs(action))  # Simplified energy model
        reward -= energy_cost * 0.1

        # Stability reward
        com_pos = next_state['com_position']
        com_vel = next_state['com_velocity']
        stability_penalty = abs(com_pos[2] - 0.8) + np.linalg.norm(com_vel)  # Stay at height, low velocity
        reward -= stability_penalty * 2.0

        # Smoothness reward
        if 'prev_action' in task_info:
            action_smoothness = np.linalg.norm(action - task_info['prev_action'])
            reward -= action_smoothness * 0.5

        # Avoid falling
        if com_pos[2] < 0.5:  # Robot fell
            reward -= 100.0

        return reward

    def train_step(self, batch_size=64):
        """
        Train policy on batch of experiences
        """
        if len(self.replay_buffer) < batch_size:
            return

        batch = random.sample(self.replay_buffer, batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)

        states = torch.FloatTensor(states)
        actions = torch.FloatTensor(actions)
        rewards = torch.FloatTensor(rewards).unsqueeze(1)
        next_states = torch.FloatTensor(next_states)
        dones = torch.BoolTensor(dones).unsqueeze(1)

        # Compute advantage using value function (simplified)
        # In practice, use Actor-Critic or other policy gradient methods
        with torch.no_grad():
            next_actions = self.policy_network(next_states)
            # Compute target using reward + discounted future value
            target_values = rewards

        # Compute policy loss (simplified - in practice use more sophisticated methods)
        current_actions = self.policy_network(states)
        policy_loss = nn.MSELoss()(current_actions, actions)

        # Optimize
        self.optimizer.zero_grad()
        policy_loss.backward()
        self.optimizer.step()

    def evaluate_gait_performance(self, trajectory_data):
        """
        Evaluate gait performance metrics
        """
        metrics = {}

        # Compute walking speed
        positions = np.array([state['base_position'] for state in trajectory_data])
        total_distance = np.sum(np.linalg.norm(np.diff(positions[:, :2], axis=0), axis=1))
        total_time = len(trajectory_data) * 0.01  # Assuming 100 Hz control
        avg_speed = total_distance / total_time if total_time > 0 else 0
        metrics['walking_speed'] = avg_speed

        # Compute energy efficiency (average power consumption)
        actions = np.array([action for _, action, _ in trajectory_data])
        avg_power = np.mean(np.sum(np.abs(actions), axis=1))
        metrics['energy_efficiency'] = 1.0 / (avg_power + 1e-6)  # Inverse of power

        # Compute stability (average CoM height deviation)
        com_heights = np.array([state['com_position'][2] for state in trajectory_data])
        height_stability = 1.0 / (np.std(com_heights) + 1e-6)
        metrics['stability'] = height_stability

        # Compute smoothness (action variation)
        action_changes = np.diff(actions, axis=0)
        smoothness = 1.0 / (np.mean(np.abs(action_changes)) + 1e-6)
        metrics['smoothness'] = smoothness

        # Update performance history
        for key, value in metrics.items():
            self.performance_history[key].append(value)

        return metrics

    def adapt_gait_parameters(self, performance_metrics):
        """
        Adapt gait parameters based on performance
        """
        # Analyze performance trends
        recent_speeds = self.performance_history['walking_speed'][-10:]
        recent_stability = self.performance_history['stability'][-10:]

        if len(recent_speeds) >= 2:
            speed_trend = recent_speeds[-1] - recent_speeds[0]
            stability_trend = recent_stability[-1] - recent_stability[0]

            # Adjust gait parameters based on trends
            if speed_trend < 0 and stability_trend > 0:
                # Going slower but more stable - could try to increase speed
                self.increase_aggression()
            elif speed_trend > 0 and stability_trend < 0:
                # Going faster but less stable - reduce aggression
                self.reduce_aggression()

    def increase_aggression(self):
        """
        Increase gait aggressiveness (longer steps, faster)
        """
        # This would adjust gait pattern generator parameters
        # or modify policy exploration
        self.exploration_noise = min(self.exploration_noise * 1.1, 0.5)

    def reduce_aggression(self):
        """
        Reduce gait aggressiveness (shorter steps, more conservative)
        """
        # This would adjust gait pattern generator parameters
        # or modify policy exploration
        self.exploration_noise = max(self.exploration_noise * 0.9, 0.05)

    def learn_from_demonstration(self, demonstration_data):
        """
        Learn gait pattern from human demonstration
        """
        # Behavioral cloning approach
        states = torch.FloatTensor([demo['state'] for demo in demonstration_data])
        actions = torch.FloatTensor([demo['action'] for demo in demonstration_data])

        # Supervised learning on demonstrated data
        for epoch in range(100):
            pred_actions = self.policy_network(states)
            loss = nn.MSELoss()(pred_actions, actions)

            self.optimizer.zero_grad()
            loss.backward()
            self.optimizer.step()

        print("Policy learned from demonstration")

class ImitationLearningGait:
    def __init__(self):
        self.demonstration_buffer = deque(maxlen=5000)
        self.imitation_loss_fn = nn.MSELoss()
        self.disc_loss_fn = nn.BCELoss()

        # Generator (policy) network
        self.generator = nn.Sequential(
            nn.Linear(64, 256),
            nn.ReLU(),
            nn.Linear(256, 256),
            nn.ReLU(),
            nn.Linear(256, 32),  # 32 joint actions
            nn.Tanh()
        )

        # Discriminator network
        self.discriminator = nn.Sequential(
            nn.Linear(64 + 32, 256),  # State + Action
            nn.ReLU(),
            nn.Linear(256, 256),
            nn.ReLU(),
            nn.Linear(256, 1),
            nn.Sigmoid()
        )

        self.gen_optimizer = optim.Adam(self.generator.parameters(), lr=1e-4)
        self.disc_optimizer = optim.Adam(self.discriminator.parameters(), lr=1e-4)

    def add_demonstration(self, state, action):
        """Add demonstration to buffer"""
        self.demonstration_buffer.append((state, action))

    def train_imitation_learning(self, num_epochs=1000):
        """Train using imitation learning (generally adversarial imitation learning)"""
        for epoch in range(num_epochs):
            if len(self.demonstration_buffer) < 32:
                continue

            # Sample batch of demonstrations
            demo_batch = random.sample(self.demonstration_buffer, 32)
            demo_states, demo_actions = zip(*demo_batch)
            demo_states = torch.FloatTensor(demo_states)
            demo_actions = torch.FloatTensor(demo_actions)

            # Generate actions using current policy
            gen_actions = self.generator(demo_states)

            # Train discriminator
            self.disc_optimizer.zero_grad()

            # Discriminate between real and generated actions
            real_pairs = torch.cat([demo_states, demo_actions], dim=1)
            fake_pairs = torch.cat([demo_states, gen_actions.detach()], dim=1)

            real_labels = torch.ones(32, 1)
            fake_labels = torch.zeros(32, 1)

            real_output = self.discriminator(real_pairs)
            fake_output = self.discriminator(fake_pairs)

            disc_loss = (self.disc_loss_fn(real_output, real_labels) +
                        self.disc_loss_fn(fake_output, fake_labels)) / 2

            disc_loss.backward()
            self.disc_optimizer.step()

            # Train generator (policy)
            self.gen_optimizer.zero_grad()

            fake_pairs_gen = torch.cat([demo_states, self.generator(demo_states)], dim=1)
            fake_output_gen = self.discriminator(fake_pairs_gen)

            # Generator wants discriminator to think generated actions are real
            gen_loss = self.disc_loss_fn(fake_output_gen, real_labels)

            gen_loss.backward()
            self.gen_optimizer.step()

            if epoch % 100 == 0:
                print(f"Epoch {epoch}, Gen Loss: {gen_loss.item():.4f}, Disc Loss: {disc_loss.item():.4f}")

    def get_imitation_action(self, state):
        """Get action from imitation policy"""
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        action = self.generator(state_tensor).squeeze(0).numpy()
        return action
```

## Isaac Sim Integration for Locomotion

### GPU-Accelerated Physics Simulation

#### Parallel Environment Training
```python
import omni
from omni.isaac.core import World
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.nucleus import get_assets_root_path
from omni.isaac.core.robots import Robot
from omni.isaac.core.articulations import ArticulationView
import torch
import numpy as np

class IsaacSimLocomotionEnvironment:
    def __init__(self, num_envs=64, sim_dt=1.0/60.0, control_dt=1.0/60.0):
        self.num_envs = num_envs
        self.sim_dt = sim_dt
        self.control_dt = control_dt
        self.steps_per_control = int(control_dt / sim_dt)

        # Initialize Isaac Sim world
        self.world = World(
            stage_units_in_meters=1.0,
            physics_dt=sim_dt,
            rendering_dt=control_dt,
            sim_params={
                "use_gpu": True,
                "use_fabric": True,
                "solver_type": 1,  # 0: PGS, 1: TGS
                "num_position_iterations": 4,
                "num_velocity_iterations": 1,
                "max_depenetration_velocity": 1000.0
            }
        )

        # Setup environments
        self.setup_environments()

        # GPU tensors for parallel processing
        self.obs_buf = torch.zeros((self.num_envs, self.obs_dim), device=self.device)
        self.rew_buf = torch.zeros(self.num_envs, device=self.device, dtype=torch.float)
        self.reset_buf = torch.zeros(self.num_envs, device=self.device, dtype=torch.long)
        self.progress_buf = torch.zeros(self.num_envs, device=self.device, dtype=torch.long)

    def setup_environments(self):
        """Setup multiple parallel environments"""
        # Add ground plane
        self.world.scene.add_default_ground_plane()

        # Calculate environment spacing
        spacing = 2.0
        env_lower = np.array([-spacing, -spacing, 0.0])
        env_upper = np.array([spacing, spacing, spacing])

        # Get robot asset
        assets_root_path = get_assets_root_path()
        if assets_root_path is None:
            print("Could not find Isaac Sim assets")
            return

        robot_asset_path = assets_root_path + "/Isaac/Robots/Humanoid/humanoid_instanceable.usd"

        # Create environments
        self.humans = []
        self.human_views = []

        for i in range(self.num_envs):
            # Calculate environment position
            env_pos_x = (i % int(np.sqrt(self.num_envs))) * spacing * 2
            env_pos_y = (i // int(np.sqrt(self.num_envs))) * spacing * 2
            env_pos = np.array([env_pos_x, env_pos_y, 0.0])

            # Add robot to environment
            robot_prim_path = f"/World/env_{i}/robot"
            add_reference_to_stage(
                usd_path=robot_asset_path,
                prim_path=robot_prim_path
            )

            # Add robot to scene
            robot = self.world.scene.add(
                Robot(
                    prim_path=robot_prim_path,
                    name=f"robot_{i}",
                    position=env_pos + np.array([0, 0, 1.0]),
                    orientation=np.array([1.0, 0.0, 0.0, 0.0])
                )
            )
            self.humans.append(robot)

            # Create articulation view for joint control
            articulation_view = ArticulationView(
                prim_path_regex=f"/World/env_{i}/robot",
                name=f"articulation_view_{i}",
                reset_xform_properties=False
            )
            self.world.scene.add(articulation_view)
            self.human_views.append(articulation_view)

        # Initialize physics simulation
        self.world.reset()

        # Get joint information
        self.initial_dof_pos = self.human_views[0].get_dof_positions(clone=True)
        self.initial_dof_vel = self.human_views[0].get_dof_velocities(clone=True)
        self.dof_names = self.human_views[0].dof_names
        self.num_dofs = len(self.dof_names)

        # Observation dimension
        # [base_pos(3), base_rot(4), base_lin_vel(3), base_ang_vel(3), dof_pos(n), dof_vel(n), actions(n)]
        self.obs_dim = 13 + self.num_dofs * 2 + self.num_dofs

    def reset_idx(self, env_ids):
        """Reset specific environments"""
        indices = env_ids.to(dtype=torch.int32)

        # Reset DOF states
        pos = self.initial_dof_pos.clone()
        vel = self.initial_dof_vel.clone()

        # Add randomization to initial states
        pos[:, :] = pos + 0.2 * (torch.rand_like(pos) - 0.5)
        vel[:, :] = 0.1 * (torch.rand_like(vel) - 0.5)

        self.human_views[0].set_dof_position_targets(pos, indices=indices)
        self.human_views[0].set_dof_positions(pos, indices=indices)
        self.human_views[0].set_dof_velocities(vel, indices=indices)

        # Reset robot root states
        root_pos = self.initial_root_pos.clone()
        root_pos[env_ids, 0] += torch_rand_float(-1.0, 1.0, (len(env_ids), 1), self.device).squeeze()
        root_pos[env_ids, 1] += torch_rand_float(-1.0, 1.0, (len(env_ids), 1), self.device).squeeze()

        root_rot = self.initial_root_rot.clone()
        root_lin_vel = self.initial_root_lin_vel.clone()
        root_ang_vel = self.initial_root_ang_vel.clone()

        self.human_views[0].set_world_poses(root_pos, root_rot, indices)
        self.human_views[0].set_velocities(torch.cat([root_lin_vel, root_ang_vel], dim=1), indices)

        # Reset buffers
        self.progress_buf[env_ids] = 0
        self.reset_buf[env_ids] = 0
        self.obs_buf[env_ids] = self.compute_observations(env_ids)

    def compute_observations(self, env_ids=None):
        """Compute observations for environments"""
        if env_ids is None:
            env_ids = torch.arange(self.num_envs, dtype=torch.long, device=self.device)

        # Get root states
        root_states = self.human_views[0].get_world_poses(clone=False)
        root_positions = root_states[0]
        root_orientations = root_states[1]

        # Get DOF states
        dof_pos = self.human_views[0].get_dof_positions(clone=False)
        dof_vel = self.human_views[0].get_dof_velocities(clone=False)

        # Normalize DOF positions and velocities
        obs = torch.cat((
            root_positions[:, :3],                    # Root position
            root_orientations,                        # Root orientation
            self.human_views[0].get_linear_velocities(clone=False)[:, :],  # Root linear velocity
            self.human_views[0].get_angular_velocities(clone=False)[:, :], # Root angular velocity
            dof_pos,                                  # DOF positions
            dof_vel,                                  # DOF velocities
            self.prev_actions                         # Previous actions
        ), dim=-1)

        self.obs_buf[env_ids] = obs

        return self.obs_buf[env_ids]

    def compute_reward_and_reset(self):
        """Compute rewards and determine resets"""
        # Get root states
        root_pos = self.human_views[0].get_world_poses(clone=False)[0]
        root_vel = self.human_views[0].get_linear_velocities(clone=False)

        # Compute rewards
        # Encourage forward movement
        forward_reward = root_vel[:, 0] * 2.0  # X-axis is forward

        # Penalize energy expenditure
        actions = self.actions
        action_penalty = torch.sum(actions**2, dim=1) * 0.01

        # Penalize deviation from target height
        height_error = torch.abs(root_pos[:, 2] - 0.87)  # Target height ~0.87m
        height_penalty = height_error * 1.0

        # Total reward
        total_reward = forward_reward - action_penalty - height_penalty

        self.rew_buf[:] = total_reward

        # Determine resets
        # Reset if fallen (too low)
        fall_height = 0.5
        fall_reset = root_pos[:, 2] < fall_height

        # Reset if exceeded max episode length
        time_out = self.progress_buf >= 500  # Max episode length

        self.reset_buf = fall_reset | time_out
        self.progress_buf += 1

        # Reset environments that need it
        reset_env_ids = self.reset_buf.nonzero(as_tuple=False).squeeze(-1)
        if len(reset_env_ids) > 0:
            self.reset_idx(reset_env_ids)

    def pre_physics_step(self, actions):
        """Apply actions before physics step"""
        self.actions = actions.clone().to(self.device)

        # Apply actions to articulation views
        targets = self.human_views[0].get_dof_position_targets() + self.actions * 0.1
        self.human_views[0].set_dof_position_targets(targets)

        self.prev_actions[:] = actions

    def post_physics_step(self):
        """Process after physics step"""
        self.progress_buf += 1

        # Compute observations, rewards, and resets
        self.compute_observations()
        self.compute_reward_and_reset()

        # Get current state
        self.gym.fetch_results(self.sim, True)
        self.gym.step_graphics(self.sim)
        self.gym.render_all_camera_sensors(self.sim)
        self.gym.sync_frame_time(self.sim)

    def get_observations(self):
        """Get current observations"""
        return self.obs_buf.clone()

    def get_rewards(self):
        """Get current rewards"""
        return self.rew_buf.clone()

    def get_resets(self):
        """Get reset flags"""
        return self.reset_buf.clone()
```

## Real-time Performance Optimization

### Efficient Control Pipeline

#### Parallel Processing for Real-time Locomotion
```python
import multiprocessing as mp
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import asyncio
import queue

class RealTimeLocomotionController:
    def __init__(self, num_processes=None):
        if num_processes is None:
            num_processes = mp.cpu_count()

        self.num_processes = num_processes
        self.process_pool = ProcessPoolExecutor(max_workers=num_processes)

        # Queues for real-time processing
        self.sensor_queue = queue.Queue(maxsize=10)
        self.command_queue = queue.Queue(maxsize=10)

        # Control pipeline stages
        self.perception_pipeline = PerceptionPipeline()
        self.planning_pipeline = PlanningPipeline()
        self.control_pipeline = ControlPipeline()
        self.safety_pipeline = SafetyPipeline()

        # Timing statistics
        self.timing_stats = {
            'perception': [],
            'planning': [],
            'control': [],
            'total_cycle': []
        }

        # Real-time parameters
        self.control_frequency = 200  # Hz
        self.dt = 1.0 / self.control_frequency
        self.max_latency = 0.005  # 5ms max latency

        # Initialize control threads
        self.control_thread = None
        self.is_running = False

    def start_real_time_control(self):
        """Start real-time control loop"""
        self.is_running = True
        self.control_thread = threading.Thread(target=self.real_time_control_loop)
        self.control_thread.start()

    def stop_real_time_control(self):
        """Stop real-time control loop"""
        self.is_running = False
        if self.control_thread:
            self.control_thread.join()

    def real_time_control_loop(self):
        """Real-time control loop with timing guarantees"""
        loop_start_time = time.time()

        while self.is_running:
            cycle_start = time.time()

            try:
                # Get latest sensor data (non-blocking)
                if not self.sensor_queue.empty():
                    sensor_data = self.sensor_queue.get_nowait()
                else:
                    # Use previous data if no new data available
                    sensor_data = self.get_last_sensor_data()
                    if sensor_data is None:
                        time.sleep(0.001)
                        continue

                # Process through pipeline with timing constraints
                perception_start = time.time()
                features = self.perception_pipeline.process(sensor_data)
                perception_time = time.time() - perception_start

                planning_start = time.time()
                plan = self.planning_pipeline.generate_plan(features, sensor_data)
                planning_time = time.time() - planning_start

                control_start = time.time()
                commands = self.control_pipeline.compute_control(plan, sensor_data)
                control_time = time.time() - control_start

                # Apply safety checks
                safety_start = time.time()
                safe_commands = self.safety_pipeline.validate_commands(commands, sensor_data)
                safety_time = time.time() - safety_start

                # Publish commands (non-blocking)
                if not self.command_queue.full():
                    self.command_queue.put_nowait(safe_commands)

                # Track timing
                total_cycle_time = time.time() - cycle_start
                self.timing_stats['perception'].append(perception_time)
                self.timing_stats['planning'].append(planning_time)
                self.timing_stats['control'].append(control_time)
                self.timing_stats['total_cycle'].append(total_cycle_time)

                # Maintain control frequency
                sleep_time = max(0, self.dt - total_cycle_time)
                if sleep_time > 0:
                    time.sleep(sleep_time)

            except queue.Empty:
                # No sensor data available, briefly sleep
                time.sleep(0.001)
            except Exception as e:
                print(f"Error in real-time control: {e}")
                # Continue loop despite errors
                time.sleep(0.001)

    def process_parallel_tasks(self, tasks):
        """Process multiple tasks in parallel"""
        # Use thread pool for I/O bound tasks
        with ThreadPoolExecutor(max_workers=self.num_processes) as executor:
            futures = [executor.submit(task['func'], *task['args']) for task in tasks]
            results = [future.result() for future in futures]

        return results

    def optimize_pipeline_for_latency(self):
        """Optimize pipeline for minimal latency"""
        # Pre-allocate tensors to avoid allocation overhead
        self.pre_allocated_tensors = {
            'observations': torch.zeros((1, 128), dtype=torch.float32),
            'actions': torch.zeros((1, 32), dtype=torch.float32),
            'features': torch.zeros((1, 256), dtype=torch.float32)
        }

        # Use tensor pooling to reduce GC pressure
        self.tensor_pool = TensorPool()

        # Optimize neural networks for inference
        self.optimize_networks_for_inference()

    def optimize_networks_for_inference(self):
        """Optimize neural networks for real-time inference"""
        # Convert to TorchScript for faster inference
        for net_name, net in self.networks.items():
            if hasattr(net, 'eval'):
                net.eval()
                try:
                    scripted_net = torch.jit.script(net)
                    setattr(self, f"{net_name}_scripted", scripted_net)
                except:
                    # Fall back to regular model if scripting fails
                    setattr(self, f"{net_name}_scripted", net)

        # Use mixed precision if available
        if torch.cuda.is_available() and torch.cuda.is_bf16_supported():
            self.use_mixed_precision = True
        else:
            self.use_mixed_precision = False

    def get_performance_metrics(self):
        """Get real-time performance metrics"""
        metrics = {}

        for key, times in self.timing_stats.items():
            if times:
                metrics[f'{key}_avg_time'] = np.mean(times[-100:])  # Last 100 samples
                metrics[f'{key}_max_time'] = np.max(times[-100:])
                metrics[f'{key}_std_time'] = np.std(times[-100:])

        # Calculate utilization
        if 'total_cycle_avg_time' in metrics:
            metrics['utilization'] = (metrics['total_cycle_avg_time'] / self.dt) * 100

        # Calculate jitter (variability in timing)
        if 'total_cycle' in self.timing_stats and len(self.timing_stats['total_cycle']) > 1:
            cycle_times = self.timing_stats['total_cycle'][-100:]
            metrics['jitter'] = np.std(cycle_times) * 1000  # in ms

        return metrics

    def handle_emergency_stop(self):
        """Handle emergency stop situation"""
        # Send zero commands to all joints
        zero_commands = np.zeros(32)  # Assuming 32 joints
        self.send_commands(zero_commands)

        # Log emergency stop
        print(f"EMERGENCY STOP ACTIVATED at {time.time()}")

        # Set emergency flag
        self.emergency_stop_active = True

    def check_safety_conditions(self, sensor_data):
        """Check safety conditions and trigger emergency stop if needed"""
        # Check for dangerous joint positions
        joint_positions = sensor_data.get('joint_positions', np.zeros(32))
        joint_limits = self.get_joint_limits()

        for i, (pos, limits) in enumerate(zip(joint_positions, joint_limits)):
            if pos < limits[0] - 0.1 or pos > limits[1] + 0.1:  # 0.1 rad safety margin
                self.get_logger().warning(f"Dangerous joint position detected on joint {i}: {pos}")
                return False

        # Check for high joint velocities
        joint_velocities = sensor_data.get('joint_velocities', np.zeros(32))
        max_velocities = self.get_max_joint_velocities()

        for i, (vel, max_vel) in enumerate(zip(joint_velocities, max_velocities)):
            if abs(vel) > max_vel * 1.2:  # 20% over max
                self.get_logger().warning(f"High joint velocity detected on joint {i}: {vel}")
                return False

        # Check for dangerous CoM position (likely fall)
        com_position = sensor_data.get('com_position', np.array([0, 0, 0.8]))
        if com_position[2] < 0.3:  # Robot likely fell
            self.get_logger().warning(f"Dangerous CoM height detected: {com_position[2]}")
            return False

        return True

class TensorPool:
    """Pool of pre-allocated tensors to reduce allocation overhead"""
    def __init__(self):
        self.pool = {}
        self.default_size = (1024,)

    def get_tensor(self, size, dtype=torch.float32):
        """Get tensor of specified size from pool"""
        key = (size, dtype)

        if key not in self.pool:
            self.pool[key] = []

        if self.pool[key]:
            return self.pool[key].pop()
        else:
            # Create new tensor if pool is empty
            return torch.zeros(size, dtype=dtype)

    def return_tensor(self, tensor):
        """Return tensor to pool"""
        size = tuple(tensor.shape)
        dtype = tensor.dtype
        key = (size, dtype)

        if key not in self.pool:
            self.pool[key] = []

        # Only keep limited number of tensors in pool to prevent memory bloat
        if len(self.pool[key]) < 10:
            self.pool[key].append(tensor.zero_())  # Reset to zero before returning

class PerceptionPipeline:
    """Optimized perception pipeline for real-time processing"""
    def __init__(self):
        # Pre-load models
        self.feature_extractor = self.load_feature_extractor()
        self.object_detector = self.load_object_detector()
        self.terrain_classifier = self.load_terrain_classifier()

        # Initialize CUDA streams for parallel processing
        if torch.cuda.is_available():
            self.streams = [torch.cuda.Stream() for _ in range(4)]
        else:
            self.streams = [None] * 4

    def process(self, sensor_data):
        """Process sensor data through perception pipeline"""
        # Process different sensor modalities in parallel
        tasks = [
            {'func': self.extract_features, 'args': (sensor_data['camera'],)},
            {'func': self.detect_objects, 'args': (sensor_data['camera'],)},
            {'func': self.classify_terrain, 'args': (sensor_data['force_torque'], sensor_data['imu'])}
        ]

        # Execute in parallel using available streams
        results = []
        for i, task in enumerate(tasks):
            with torch.cuda.stream(self.streams[i % len(self.streams)]) if self.streams[i % len(self.streams)] else nullcontext():
                result = task['func'](*task['args'])
                results.append(result)

        return {
            'features': results[0],
            'objects': results[1],
            'terrain': results[2]
        }

    def extract_features(self, camera_data):
        """Extract visual features"""
        # Use pre-allocated tensors
        input_tensor = torch.from_numpy(camera_data).float().to(self.device)
        features = self.feature_extractor(input_tensor)
        return features.cpu().numpy()

    def detect_objects(self, camera_data):
        """Detect objects in camera data"""
        # Run object detection
        detections = self.object_detector(camera_data)
        return detections

    def classify_terrain(self, force_data, imu_data):
        """Classify terrain using haptic and inertial data"""
        # Combine force and IMU data for terrain classification
        terrain_type = self.terrain_classifier(force_data, imu_data)
        return terrain_type

class PlanningPipeline:
    """Optimized planning pipeline"""
    def __init__(self):
        self.footstep_planner = FootstepPlanner()
        self.trajectory_generator = TrajectoryGenerator()
        self.terrain_aware_planner = TerrainAwarePlanner()

    def generate_plan(self, perception_features, sensor_data):
        """Generate locomotion plan based on perception"""
        # Use terrain classification to select appropriate planning strategy
        terrain_type = perception_features['terrain']

        if terrain_type in ['flat', 'even']:
            # Use standard planning
            plan = self.footstep_planner.plan_flat_terrain(
                sensor_data['base_pose'],
                sensor_data['desired_velocity']
            )
        else:
            # Use terrain-aware planning
            plan = self.terrain_aware_planner.plan_rough_terrain(
                sensor_data['base_pose'],
                sensor_data['desired_velocity'],
                perception_features['objects']
            )

        # Generate smooth trajectories
        trajectory = self.trajectory_generator.generate_smooth_trajectory(plan)

        return {
            'footsteps': plan,
            'trajectory': trajectory,
            'terrain_type': terrain_type
        }

class ControlPipeline:
    """Optimized control pipeline"""
    def __init__(self):
        self.balance_controller = ZMPBalanceController()
        self.trajectory_tracker = TrajectoryTracker()
        self.whole_body_controller = WholeBodyController()

    def compute_control(self, plan, sensor_data):
        """Compute control commands"""
        # Compute balance control based on ZMP
        zmp_reference = plan['trajectory']['zmp']
        balance_control = self.balance_controller.compute_balance_control(
            sensor_data['state'], zmp_reference
        )

        # Track trajectory
        trajectory_control = self.trajectory_tracker.track(
            plan['trajectory'], sensor_data['state']
        )

        # Combine controls using whole-body control
        joint_commands = self.whole_body_controller.compute_joint_commands(
            balance_control, trajectory_control, sensor_data['state']
        )

        return joint_commands

class SafetyPipeline:
    """Safety validation pipeline"""
    def __init__(self):
        self.joint_limit_checker = JointLimitChecker()
        self.stability_checker = StabilityChecker()
        self.collision_checker = CollisionChecker()

    def validate_commands(self, commands, sensor_data):
        """Validate commands for safety"""
        # Check joint limits
        if not self.joint_limit_checker.check_limits(commands):
            return self.generate_safe_fallback(sensor_data)

        # Check stability
        if not self.stability_checker.check_stability(sensor_data):
            return self.generate_stability_recovery(sensor_data)

        # Check for collisions
        if not self.collision_checker.check_collision_free(commands, sensor_data):
            return self.generate_avoidance_commands(commands, sensor_data)

        return commands

    def generate_safe_fallback(self, sensor_data):
        """Generate safe fallback commands"""
        # Return neutral position commands
        neutral_position = np.zeros(32)  # Neutral joint positions
        return neutral_position

    def generate_stability_recovery(self, sensor_data):
        """Generate stability recovery commands"""
        # Compute commands to restore balance
        com_pos = sensor_data['com_position']
        com_vel = sensor_data['com_velocity']

        # Simple recovery: move to neutral stance
        recovery_commands = np.zeros(32)

        # Adjust hip and knee angles to lower CoM
        recovery_commands[6] = -0.2  # Left hip pitch
        recovery_commands[7] = 0.4   # Left knee pitch
        recovery_commands[8] = -0.2  # Left ankle pitch

        recovery_commands[18] = -0.2  # Right hip pitch
        recovery_commands[19] = 0.4   # Right knee pitch
        recovery_commands[20] = -0.2  # Right ankle pitch

        return recovery_commands

    def generate_avoidance_commands(self, original_commands, sensor_data):
        """Generate collision avoidance commands"""
        # Modify commands to avoid detected obstacles
        # This would use more sophisticated collision avoidance
        modified_commands = original_commands * 0.5  # Reduce command magnitude
        return modified_commands
```

## Summary

Reinforcement Learning for humanoid locomotion represents a cutting-edge approach to developing adaptive, robust, and efficient walking controllers. Through Isaac Sim's parallel simulation capabilities and GPU acceleration, we can train sophisticated RL policies that enable humanoid robots to learn complex walking patterns, adapt to various terrains, and recover from disturbances. The integration of advanced techniques like Hindsight Experience Replay, Model Predictive Control, and curriculum learning enables robots to develop human-like walking behaviors that are both stable and efficient. The real-time optimization techniques ensure that these learned policies can execute at the high frequencies required for stable humanoid control. With proper safety considerations and efficient pipeline design, RL-based locomotion controllers can provide the adaptability and robustness needed for real-world humanoid applications.

---

## Further Reading

- "Deep Reinforcement Learning for Robotic Locomotion" - Recent survey paper
- "Isaac Gym: High Performance GPU-Based Physics Simulation" - NVIDIA paper
- "Humanoid Robot Locomotion Control: A Survey" - Technical overview
- "Deep Learning for Robotics" - MIT Press book
- "Reinforcement Learning: An Introduction" by Sutton & Barto
- Isaac Sim and Isaac ROS documentation
- "Bipedal Locomotion: Models, Algorithms and Control" - Academic reference
- NVIDIA GTC robotics and AI sessions