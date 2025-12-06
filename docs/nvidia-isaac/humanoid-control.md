---
sidebar_label: Humanoid Control
title: Humanoid Control
---

# Humanoid Control

## Introduction to Humanoid Control

Humanoid control represents one of the most challenging areas in robotics, requiring sophisticated control strategies to achieve stable, dynamic, and human-like movement. Unlike wheeled or simple manipulator robots, humanoid robots must manage complex multi-link dynamics, maintain balance during locomotion, and perform diverse manipulation tasks. The control of humanoid robots involves coordinating numerous degrees of freedom (typically 20+) while ensuring stability, efficiency, and safety. Modern humanoid control systems leverage advanced control theory, machine learning, and real-time optimization to achieve these goals.

## Control Architecture for Humanoid Robots

### Hierarchical Control Structure

Humanoid control systems typically employ a hierarchical architecture with multiple control layers:

#### High-Level Task Planning
- **Trajectory Generation**: Planning desired paths and motions
- **Gait Planning**: Generating walking patterns and step sequences
- **Manipulation Planning**: Planning arm and hand movements
- **Whole-Body Planning**: Coordinating all body parts

#### Mid-Level Motion Control
- **Balance Control**: Maintaining center of mass stability
- **Inverse Kinematics**: Computing joint angles for desired end-effector positions
- **Trajectory Tracking**: Following planned trajectories with feedback control
- **Contact Planning**: Managing foot-ground and hand-object contacts

#### Low-Level Joint Control
- **Motor Control**: Direct control of actuators and motors
- **Impedance Control**: Regulating stiffness and compliance
- **Force Control**: Managing contact forces
- **Position Control**: Maintaining precise joint positions

### Control System Design Principles

#### Real-time Requirements
Humanoid robots require real-time control with strict timing constraints:
- **High-frequency control**: Joint-level control at 1-10 kHz
- **Medium-frequency planning**: Motion planning at 100-500 Hz
- **Low-frequency planning**: High-level planning at 1-10 Hz

#### Safety and Robustness
- **Saturation Limits**: Ensuring control signals stay within safe bounds
- **Fault Tolerance**: Handling sensor and actuator failures gracefully
- **Emergency Stops**: Immediate response to safety violations
- **Stability Guarantees**: Ensuring system stability under uncertainties

## Balance Control

### Center of Mass (CoM) Control

#### Zero Moment Point (ZMP) Theory
The Zero Moment Point is a fundamental concept in humanoid balance control:

```python
import numpy as np
from scipy import integrate
import matplotlib.pyplot as plt

class ZMPController:
    def __init__(self, robot_mass, gravity=9.81):
        self.mass = robot_mass
        self.gravity = gravity
        self.g = gravity

        # Robot parameters
        self.com_height = 0.8  # Height of center of mass above ground
        self.com_position = np.array([0.0, 0.0, self.com_height])  # Current CoM position
        self.com_velocity = np.zeros(3)
        self.com_acceleration = np.zeros(3)

        # ZMP parameters
        self.zmp_reference = np.array([0.0, 0.0])  # Desired ZMP position
        self.zmp_current = np.array([0.0, 0.0])    # Current ZMP position

        # Control gains
        self.kp_zmp = 10.0  # Proportional gain for ZMP tracking
        self.kd_zmp = 2.0   # Derivative gain for ZMP tracking
        self.kp_com = 5.0   # Proportional gain for CoM tracking
        self.kd_com = 1.0   # Derivative gain for CoM tracking

    def compute_zmp(self, com_pos, com_acc):
        """
        Compute Zero Moment Point from CoM position and acceleration
        ZMP_x = CoM_x - (CoM_z - z_support) * CoM_acc_x / g
        ZMP_y = CoM_y - (CoM_z - z_support) * CoM_acc_y / g
        """
        z_support = 0.0  # Ground level (z=0)

        zmp_x = com_pos[0] - ((com_pos[2] - z_support) * com_acc[0]) / self.g
        zmp_y = com_pos[1] - ((com_pos[2] - z_support) * com_acc[1]) / self.g

        return np.array([zmp_x, zmp_y])

    def compute_com_from_zmp(self, zmp_ref, com_height):
        """
        Compute desired CoM position from ZMP reference using inverted pendulum model
        """
        # For inverted pendulum model: CoM_z = zmp + (g/omega^2) * (zmp_double_dot)
        # Where omega = sqrt(g / com_height)

        omega = np.sqrt(self.g / com_height)

        # For steady-state, assume ZMP_double_dot ≈ 0
        # So CoM_x = ZMP_x and CoM_y = ZMP_y (approximately)
        com_x = zmp_ref[0]
        com_y = zmp_ref[1]

        return np.array([com_x, com_y, com_height])

    def compute_balance_control(self, current_com_pos, current_com_vel, current_com_acc):
        """
        Compute balance control based on ZMP tracking
        """
        # Compute current ZMP
        current_zmp = self.compute_zmp(current_com_pos, current_com_acc)

        # ZMP error
        zmp_error = self.zmp_reference - current_zmp

        # CoM error (for additional stabilization)
        desired_com = self.compute_com_from_zmp(self.zmp_reference, self.com_height)
        com_error = desired_com - current_com_pos

        # Compute control forces
        zmp_control = self.kp_zmp * zmp_error + self.kd_zmp * (0 - current_com_vel[:2])  # Assuming zero desired velocity
        com_control = self.kp_com * com_error[:2] + self.kd_com * (0 - current_com_vel[:2])

        # Combine controls (weight ZMP control more heavily)
        control_force = 0.7 * zmp_control + 0.3 * com_control

        # Convert to CoM acceleration command
        com_acc_command = np.array([
            control_force[0] / self.mass,
            control_force[1] / self.mass,
            0.0  # Z acceleration typically controlled separately
        ])

        return com_acc_command, current_zmp

class InvertedPendulumBalancer:
    def __init__(self, com_height=0.8, gravity=9.81):
        self.com_height = com_height
        self.g = gravity
        self.omega = np.sqrt(gravity / com_height)

        # State: [x, y, vx, vy] (CoM position and velocity in x-y plane)
        self.state = np.zeros(4)

        # Control parameters
        self.kp = 10.0
        self.kd = 2.0
        self.ki = 1.0

        # Integral term for steady-state error correction
        self.integral_error = np.zeros(2)

    def update(self, dt, current_state, reference_zmp, current_zmp):
        """
        Update inverted pendulum controller
        """
        # Extract state (x, y, vx, vy)
        com_pos = current_state[:2]  # x, y position
        com_vel = current_state[2:]  # vx, vy velocity

        # Compute ZMP error
        zmp_error = reference_zmp - current_zmp

        # Update integral term
        self.integral_error += zmp_error * dt

        # Compute control using PD + I
        control_output = (
            self.kp * zmp_error +
            self.kd * (0 - com_vel) +  # Assuming zero desired velocity
            self.ki * self.integral_error
        )

        # Convert to CoM acceleration command
        # For inverted pendulum: ẍ = ω²(x - x_zmp)
        com_acc_x = self.omega**2 * (com_pos[0] - reference_zmp[0]) + control_output[0]
        com_acc_y = self.omega**2 * (com_pos[1] - reference_zmp[1]) + control_output[1]

        # Update state derivatives
        state_deriv = np.array([
            com_vel[0],  # dx/dt = vx
            com_vel[1],  # dy/dt = vy
            com_acc_x,   # dvx/dt = ax
            com_acc_y    # dvy/dt = ay
        ])

        # Integrate state
        new_state = current_state + state_deriv * dt

        return new_state, state_deriv
```

### Capture Point and Divergent Component of Motion

#### Capture Point Control
```python
class CapturePointController:
    def __init__(self, com_height=0.8, gravity=9.81):
        self.com_height = com_height
        self.g = gravity
        self.tau = np.sqrt(com_height / gravity)  # Time constant of inverted pendulum

        # Capture point parameters
        self.capture_point = np.zeros(2)
        self.com_velocity_threshold = 0.1  # Threshold for considering stopped motion

        # Control parameters
        self.k_capture = 1.0  # Gain for capture point control
        self.k_com = 2.0      # Gain for CoM position control
        self.k_vel = 1.0      # Gain for CoM velocity control

    def compute_capture_point(self, com_pos, com_vel):
        """
        Compute capture point from current CoM state
        Capture Point = CoM_pos + CoM_vel * τ
        where τ = √(height / gravity) is the time constant
        """
        capture_point = com_pos + com_vel * self.tau
        return capture_point

    def compute_stopping_region(self, com_pos, com_vel):
        """
        Compute stopping region based on capture point theory
        """
        # Compute capture point
        cp = self.compute_capture_point(com_pos, com_vel)

        # Stopping region is centered around current CoM position
        # with radius based on current velocity
        stopping_radius = np.linalg.norm(com_vel) * self.tau

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

class FootPlacementController:
    def __init__(self, step_length=0.3, step_width=0.2, com_height=0.8):
        self.step_length = step_length
        self.step_width = step_width
        self.com_height = com_height
        self.g = 9.81
        self.tau = np.sqrt(com_height / self.g)

        # Walking parameters
        self.stride_length = 0.3  # Typical stride length for walking
        self.step_timing = 0.8    # Time per step (s)

        # Capture point controller for foot placement
        self.cp_controller = CapturePointController(com_height, self.g)

        # Foot placement parameters
        self.foot_placement_margin = 0.05  # Safety margin for foot placement

    def compute_next_foot_position(self, current_com_pos, current_com_vel, current_support_foot, is_left_support):
        """
        Compute next foot position based on capture point and walking pattern
        """
        # Compute capture point
        current_cp = self.cp_controller.compute_capture_point(
            current_com_pos[:2],
            current_com_vel[:2]
        )

        # Determine swing foot (opposite of support foot)
        swing_foot_side = 'right' if not is_left_support else 'left'

        # Compute desired foot placement based on walking pattern
        if np.linalg.norm(current_com_vel) > 0.05:  # If moving
            # Compute walking direction
            walk_direction = current_com_vel[:2] / np.linalg.norm(current_com_vel[:2])

            # Compute desired foot placement ahead of capture point
            step_offset = walk_direction * self.stride_length / 2

            # Add lateral offset for stability
            perpendicular = np.array([-walk_direction[1], walk_direction[0]])
            lateral_offset = perpendicular * (self.step_width / 2) * (1 if swing_foot_side == 'left' else -1)

            desired_foot_pos = current_cp + step_offset + lateral_offset
        else:
            # If stationary, place foot near capture point
            desired_foot_pos = current_cp

        # Add safety margin
        safety_margin = np.random.uniform(-self.foot_placement_margin, self.foot_placement_margin, 2)
        final_foot_pos = desired_foot_pos + safety_margin

        return final_foot_pos, current_cp

    def compute_foot_trajectory(self, start_pos, end_pos, step_height=0.05, num_points=20):
        """
        Compute smooth trajectory for foot placement
        """
        # Linear interpolation with parabolic lift
        t = np.linspace(0, 1, num_points)

        # X, Y trajectory (linear)
        x_traj = start_pos[0] + (end_pos[0] - start_pos[0]) * t
        y_traj = start_pos[1] + (end_pos[1] - start_pos[1]) * t

        # Z trajectory (parabolic lift)
        z_lift = step_height * np.sin(np.pi * t)**2  # Parabolic profile
        z_traj = np.full(num_points, start_pos[2]) + z_lift

        trajectory = np.column_stack([x_traj, y_traj, z_traj])
        return trajectory
```

## Locomotion Control

### Walking Pattern Generation

#### Bipedal Walking Controllers
```python
class WalkingPatternGenerator:
    def __init__(self, com_height=0.8, step_length=0.3, step_width=0.2, step_height=0.05, dt=0.01):
        self.com_height = com_height
        self.step_length = step_length
        self.step_width = step_width
        self.step_height = step_height
        self.dt = dt
        self.g = 9.81
        self.omega = np.sqrt(self.g / self.com_height)

        # Walking parameters
        self.step_timing = 0.8  # Time per step
        self.double_support_ratio = 0.1  # 10% of step time in double support
        self.walk_speed = 0.5  # Desired walking speed (m/s)

        # State variables
        self.current_phase = 0.0  # Current phase in gait cycle (0 to 1)
        self.support_foot = 'left'  # Current support foot
        self.step_counter = 0

        # Trajectory planning
        self.left_foot_trajectory = np.zeros(3)
        self.right_foot_trajectory = np.zeros(3)
        self.com_trajectory = np.array([0.0, 0.0, self.com_height])

        # Timing control
        self.phase_timer = 0.0
        self.step_duration = self.step_timing
        self.double_support_duration = self.step_duration * self.double_support_ratio
        self.single_support_duration = self.step_duration - self.double_support_duration

    def generate_step_trajectory(self, start_pos, end_pos, step_height, phase):
        """
        Generate trajectory for a single step
        """
        # Phase ranges from 0 (start of step) to 1 (end of step)
        if phase < 0:
            phase = 0.0
        elif phase > 1:
            phase = 1.0

        # Horizontal trajectory (linear interpolation)
        x = start_pos[0] + (end_pos[0] - start_pos[0]) * phase
        y = start_pos[1] + (end_pos[1] - start_pos[1]) * phase

        # Vertical trajectory (parabolic lift)
        if phase < 0.5:
            # Lift phase
            lift_phase = phase * 2  # Scale to 0-1 for lift
            z = start_pos[2] + step_height * np.sin(np.pi * lift_phase)**2
        else:
            # Lower phase
            lower_phase = (phase - 0.5) * 2  # Scale to 0-1 for lower
            z = start_pos[2] + step_height * np.sin(np.pi * (lower_phase + 1))**2

        return np.array([x, y, z])

    def update_gait_phase(self):
        """
        Update gait phase and timing
        """
        self.phase_timer += self.dt

        # Update current phase (0 to 1 within current step)
        self.current_phase = (self.phase_timer % self.step_duration) / self.step_duration

        # Check if new step should start
        if self.phase_timer >= self.step_duration:
            self.phase_timer = 0.0
            self.step_counter += 1

            # Switch support foot
            self.support_foot = 'right' if self.support_foot == 'left' else 'left'

    def compute_walking_pattern(self, current_pos, current_vel, desired_velocity):
        """
        Compute walking pattern based on desired velocity
        """
        # Update gait phase
        self.update_gait_phase()

        # Compute step destinations based on desired velocity
        current_support_pos = self.get_support_foot_position()
        desired_step = desired_velocity * self.step_timing

        # Compute next step position
        next_step_pos = current_support_pos + np.array([desired_step[0], desired_step[1], 0])

        # Add step width offset for stability
        step_width_offset = self.step_width / 2
        if self.support_foot == 'left':
            next_step_pos[1] += step_width_offset
        else:
            next_step_pos[1] -= step_width_offset

        # Generate trajectories for feet
        if self.support_foot == 'left':
            # Left foot is support, right foot is swing
            self.left_foot_trajectory = current_support_pos  # Support foot stays in place
            self.right_foot_trajectory = self.generate_step_trajectory(
                self.right_foot_trajectory,  # Current position
                next_step_pos,               # Next position
                self.step_height,
                self.current_phase
            )
        else:
            # Right foot is support, left foot is swing
            self.right_foot_trajectory = current_support_pos  # Support foot stays in place
            self.left_foot_trajectory = self.generate_step_trajectory(
                self.left_foot_trajectory,   # Current position
                next_step_pos,               # Next position
                self.step_height,
                self.current_phase
            )

        # Update CoM trajectory for balance
        self.update_com_trajectory(current_pos, current_vel)

        return {
            'left_foot': self.left_foot_trajectory,
            'right_foot': self.right_foot_trajectory,
            'com_trajectory': self.com_trajectory,
            'support_foot': self.support_foot,
            'gait_phase': self.current_phase
        }

    def get_support_foot_position(self):
        """
        Get current position of support foot
        """
        if self.support_foot == 'left':
            return self.left_foot_trajectory
        else:
            return self.right_foot_trajectory

    def update_com_trajectory(self, current_pos, current_vel):
        """
        Update CoM trajectory for balance during walking
        """
        # Use inverted pendulum model to compute CoM trajectory
        # CoM should follow a smooth path between feet

        # Compute desired CoM position based on foot positions
        avg_foot_pos = (self.left_foot_trajectory + self.right_foot_trajectory) / 2.0

        # Add slight forward progression
        walk_progress = self.walk_speed * self.phase_timer
        desired_com_x = avg_foot_pos[0] + walk_progress * 0.1  # Small forward offset

        # Smooth transition in Y to stay between feet
        desired_com_y = avg_foot_pos[1] * 0.8 + current_pos[1] * 0.2  # Blend with current

        # Maintain height
        desired_com_z = self.com_height

        self.com_trajectory = np.array([desired_com_x, desired_com_y, desired_com_z])

class ZMPPatternGenerator:
    def __init__(self, com_height=0.8, dt=0.001):
        self.com_height = com_height
        self.dt = dt
        self.g = 9.81
        self.omega = np.sqrt(self.g / self.com_height)

        # ZMP trajectory planning
        self.zmp_reference_trajectory = []
        self.com_reference_trajectory = []

        # Gait parameters
        self.step_length = 0.3
        self.step_width = 0.2
        self.step_timing = 0.8
        self.double_support_ratio = 0.1

        # Support polygon
        self.support_polygon = self.define_support_polygon()

    def define_support_polygon(self):
        """
        Define support polygon based on foot positions
        """
        # For two feet in stance phase
        # This is a simplified rectangle based on foot positions
        support_width = self.step_width
        support_length = self.step_length * 0.8  # Effective length under foot

        return {
            'width': support_width,
            'length': support_length,
            'margin': 0.02  # Safety margin
        }

    def generate_zmp_trajectory(self, walk_pattern):
        """
        Generate ZMP trajectory for walking pattern
        """
        num_steps = len(walk_pattern)
        zmp_trajectory = []

        for i, step in enumerate(walk_pattern):
            # Compute ZMP reference based on gait phase and foot positions
            support_foot_pos = step['support_foot_pos']
            swing_foot_pos = step['swing_foot_pos']
            gait_phase = step['phase']

            # ZMP reference should be in support polygon
            if gait_phase < self.double_support_ratio:
                # Double support phase - ZMP moves from old to new support foot
                zmp_ref = self.interpolate_between_feet(
                    step['prev_support_pos'],
                    support_foot_pos,
                    gait_phase / self.double_support_ratio
                )
            else:
                # Single support phase - ZMP stays near support foot
                phase_in_single = (gait_phase - self.double_support_ratio) / (1 - self.double_support_ratio)

                # Smooth transition to next support foot
                next_support_pos = self.compute_next_support_position(swing_foot_pos)

                if phase_in_single < 0.7:  # Early in single support
                    zmp_ref = support_foot_pos + np.array([0.02, 0.0])  # Slightly forward
                else:  # Late in single support (preparation for next step)
                    zmp_ref = self.interpolate_between_feet(
                        support_foot_pos,
                        next_support_pos,
                        (phase_in_single - 0.7) / 0.3
                    )

            zmp_trajectory.append(zmp_ref)

        return np.array(zmp_trajectory)

    def interpolate_between_feet(self, foot1_pos, foot2_pos, t):
        """
        Interpolate ZMP between two foot positions
        """
        return foot1_pos * (1 - t) + foot2_pos * t

    def compute_next_support_position(self, swing_foot_pos):
        """
        Compute where next support foot will be placed
        """
        # This would be computed based on walking pattern
        # For now, return a position based on swing foot
        return swing_foot_pos

    def compute_com_trajectory_from_zmp(self, zmp_trajectory):
        """
        Compute CoM trajectory from ZMP reference using inverted pendulum model
        """
        com_trajectory = []

        for zmp_ref in zmp_trajectory:
            # For inverted pendulum: CoM_z = ZMP + (g/omega^2) * (ZMP_double_dot)
            # In steady state: CoM ≈ ZMP (approximately)
            # But we need to account for dynamics

            # Use preview control approach or model predictive control
            # For simplicity, we'll use a first-order approximation
            if len(com_trajectory) == 0:
                prev_com = np.array([zmp_ref[0], zmp_ref[1], self.com_height])
            else:
                prev_com = com_trajectory[-1]

            # Simple low-pass filter approach
            alpha = 0.1  # Smoothing factor
            new_com = alpha * np.array([zmp_ref[0], zmp_ref[1], self.com_height]) + (1 - alpha) * prev_com
            com_trajectory.append(new_com)

        return np.array(com_trajectory)
```

### Advanced Walking Controllers

#### Model Predictive Control for Walking
```python
import cvxpy as cp
import numpy as np

class ModelPredictiveWalkingController:
    def __init__(self, com_height=0.8, horizon=20, dt=0.01):
        self.com_height = com_height
        self.horizon = horizon  # Prediction horizon
        self.dt = dt
        self.g = 9.81
        self.omega = np.sqrt(self.g / self.com_height)

        # MPC parameters
        self.Q = np.diag([10.0, 10.0, 1.0])  # State cost matrix (x, y, z)
        self.R = np.diag([1.0, 1.0])         # Control cost matrix (ZMP_x, ZMP_y)
        self.P = np.diag([50.0, 50.0, 10.0]) # Terminal cost matrix

        # State: [x, y, z, vx, vy, vz] (CoM position and velocity)
        self.state_dim = 6
        self.control_dim = 2  # ZMP_x, ZMP_y

        # System matrices for discrete-time inverted pendulum model
        self.A = self.compute_system_matrix()
        self.B = self.compute_input_matrix()

    def compute_system_matrix(self):
        """
        Compute state transition matrix A for inverted pendulum
        State: [x, y, z, vx, vy, vz]
        """
        dt = self.dt
        omega = self.omega

        # For inverted pendulum: ẍ = ω²(x - x_zmp), ÿ = ω²(y - y_zmp), z̈ = 0
        A = np.eye(6)  # Start with identity

        # Position to velocity coupling
        A[0, 3] = dt  # x += vx * dt
        A[1, 4] = dt  # y += vy * dt
        A[2, 5] = dt  # z += vz * dt

        # Acceleration terms (simplified linearization)
        A[3, 0] = omega**2 * dt  # vx += ω²(x - x_zmp) * dt
        A[4, 1] = omega**2 * dt  # vy += ω²(y - y_zmp) * dt

        # Keep z acceleration zero (height control separate)
        A[5, 2] = 0  # vz doesn't change due to z position directly

        return A

    def compute_input_matrix(self):
        """
        Compute input matrix B for ZMP control
        """
        dt = self.dt
        omega = self.omega

        B = np.zeros((6, 2))  # State x Control

        # ZMP inputs affect CoM acceleration
        B[3, 0] = -omega**2 * dt  # vx affected by ZMP_x
        B[4, 1] = -omega**2 * dt  # vy affected by ZMP_y

        return B

    def solve_mpc(self, current_state, reference_trajectory, support_polygons):
        """
        Solve MPC optimization problem
        """
        # Define optimization variables
        X = cp.Variable((self.state_dim, self.horizon + 1))  # State trajectory
        U = cp.Variable((self.control_dim, self.horizon))    # Control trajectory (ZMP)

        # Cost function
        cost = 0

        # Stage costs
        for k in range(self.horizon):
            # State tracking cost
            state_error = X[:, k] - reference_trajectory[k]
            cost += cp.quad_form(state_error, self.Q)

            # Control effort cost
            cost += cp.quad_form(U[:, k], self.R)

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
            # This is a simplified constraint - in practice, support polygons
            # change based on foot positions and gait phase
            zmp_x, zmp_y = U[0, k], U[1, k]

            # Assume rectangular support polygon around current foot
            foot_center = self.get_current_support_center(k, support_polygons)
            support_width = 0.1  # Simplified
            support_length = 0.15  # Simplified

            constraints.append(zmp_x >= foot_center[0] - support_length/2)
            constraints.append(zmp_x <= foot_center[0] + support_length/2)
            constraints.append(zmp_y >= foot_center[1] - support_width/2)
            constraints.append(zmp_y <= foot_center[1] + support_width/2)

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

    def get_current_support_center(self, time_step, support_polygons):
        """
        Get current support polygon center based on gait phase
        """
        # This would be computed based on actual foot positions and gait timing
        # For now, return a default position
        return np.array([0.0, 0.0])

    def update_walking_control(self, current_state, desired_velocity, foot_positions, gait_phase):
        """
        Update walking control using MPC
        """
        # Generate reference trajectory
        reference_trajectory = self.generate_reference_trajectory(
            current_state, desired_velocity, self.horizon
        )

        # Define support polygons based on foot positions
        support_polygons = self.define_support_polygons(foot_positions, gait_phase)

        # Solve MPC problem
        optimal_control, predicted_trajectory = self.solve_mpc(
            current_state, reference_trajectory, support_polygons
        )

        if optimal_control is not None:
            # Extract ZMP command
            zmp_command = optimal_control

            # Convert ZMP to CoM control (this is a simplification)
            # In practice, you'd use the full MPC solution
            com_control = self.zmp_to_com_control(zmp_command, current_state)

            return com_control, zmp_command, predicted_trajectory
        else:
            # Fallback to simple control if MPC fails
            return self.fallback_control(current_state, desired_velocity)

    def generate_reference_trajectory(self, current_state, desired_velocity, horizon):
        """
        Generate reference trajectory for MPC
        """
        reference_trajectory = np.zeros((self.state_dim, horizon + 1))

        # Start from current state
        reference_trajectory[:, 0] = current_state

        # Generate trajectory based on desired velocity
        for k in range(horizon):
            # Simple extrapolation based on desired velocity
            dt_total = (k + 1) * self.dt

            # Position based on desired velocity
            ref_x = current_state[0] + desired_velocity[0] * dt_total
            ref_y = current_state[1] + desired_velocity[1] * dt_total
            ref_z = self.com_height  # Maintain height

            # Velocity (try to achieve desired velocity)
            ref_vx = desired_velocity[0] * 0.8 + current_state[3] * 0.2  # Smooth transition
            ref_vy = desired_velocity[1] * 0.8 + current_state[4] * 0.2
            ref_vz = 0.0  # Zero vertical velocity

            reference_trajectory[:, k+1] = np.array([ref_x, ref_y, ref_z, ref_vx, ref_vy, ref_vz])

        return reference_trajectory

    def define_support_polygons(self, foot_positions, gait_phase):
        """
        Define support polygons based on foot positions and gait phase
        """
        # This would define time-varying support polygons based on foot placement
        # and gait phase
        support_polygons = []

        for i in range(self.horizon):
            # Compute which foot is in support at time i*dt
            phase_at_time = (gait_phase + i * self.dt / self.step_timing) % 1.0

            if phase_at_time < self.double_support_ratio:
                # Double support - polygon between both feet
                center = (foot_positions['left'] + foot_positions['right']) / 2
                width = np.linalg.norm(foot_positions['left'] - foot_positions['right'])
                length = 0.1  # Default length
            else:
                # Single support - polygon around support foot
                support_foot = 'left' if gait_phase < 0.5 else 'right'
                center = foot_positions[support_foot]
                width = 0.1
                length = 0.15

            support_polygons.append({
                'center': center,
                'width': width,
                'length': length
            })

        return support_polygons

    def zmp_to_com_control(self, zmp_command, current_state):
        """
        Convert ZMP command to CoM control
        """
        # Use inverted pendulum relationship: CoM_accel = ω²(CoM_pos - ZMP)
        com_pos = current_state[:3]
        zmp_pos = np.array([zmp_command[0], zmp_command[1], 0.0])  # ZMP is at ground level

        com_accel = self.omega**2 * (com_pos - zmp_pos)
        com_accel[2] = 0  # Don't control height acceleration directly

        return com_accel

    def fallback_control(self, current_state, desired_velocity):
        """
        Fallback control if MPC fails
        """
        # Simple ZMP-based control
        current_com_pos = current_state[:2]
        current_com_vel = current_state[3:5]

        # Compute desired ZMP to achieve desired velocity
        desired_zmp = current_com_pos - current_com_vel / self.omega

        # Add correction for desired velocity
        zmp_correction = desired_velocity / (self.omega * 2)  # Simple correction
        desired_zmp += zmp_correction

        # Limit ZMP to reasonable bounds
        desired_zmp = np.clip(desired_zmp, -0.3, 0.3)  # Limit to 30cm from center

        com_control = self.zmp_to_com_control(desired_zmp, current_state)

        return com_control, desired_zmp, None
```

## Manipulation Control

### Whole-Body Control Framework

#### Operational Space Control
```python
class OperationalSpaceController:
    def __init__(self, robot_model, num_joints=32):
        self.robot_model = robot_model
        self.n_joints = num_joints

        # Operational tasks
        self.tasks = {}  # Dictionary of operational tasks
        self.weights = {}  # Task priority weights

        # Control parameters
        self.kp_cartesian = 100.0  # Cartesian position gain
        self.kd_cartesian = 20.0   # Cartesian velocity gain
        self.kp_nullspace = 1.0    # Nullspace gain
        self.kd_nullspace = 0.1    # Nullspace damping

        # Joint limits and constraints
        self.joint_limits_lower = np.full(num_joints, -np.pi)
        self.joint_limits_upper = np.full(num_joints, np.pi)

    def add_task(self, task_name, task_jacobian, task_error_func, priority=1.0, weight=1.0):
        """
        Add operational space task
        """
        self.tasks[task_name] = {
            'jacobian': task_jacobian,
            'error_func': task_error_func,
            'priority': priority,
            'weight': weight
        }

        # Sort tasks by priority
        sorted_tasks = sorted(self.tasks.items(), key=lambda x: x[1]['priority'], reverse=True)
        self.tasks = dict(sorted_tasks)

    def compute_operational_control(self, q, dq, dt):
        """
        Compute operational space control with priority-based task hierarchy
        """
        # Initialize control variables
        tau = np.zeros(self.n_joints)  # Joint torques
        I = np.eye(self.n_joints)     # Identity matrix
        current_nullspace_proj = I    # Start with full space

        # Process tasks in order of priority (highest first)
        for task_name, task_info in self.tasks.items():
            J_task = task_info['jacobian'](q)  # Function of current configuration
            error_task = task_info['error_func'](q)  # Task space error
            weight_task = task_info['weight']

            # Apply current nullspace projection
            J_task_proj = J_task @ current_nullspace_proj

            # Compute task space inertia
            lambda_task_inv = J_task_proj @ np.linalg.pinv(self.M(q)) @ J_task_proj.T
            lambda_task = np.linalg.pinv(lambda_task_inv + 1e-6 * np.eye(lambda_task_inv.shape[0]))

            # Compute operational space control
            ddq_des_task = (
                self.kp_cartesian * error_task[:J_task.shape[0]] -
                self.kd_cartesian * J_task_proj @ dq
            )

            # Compute joint space control for this task
            M_inv = np.linalg.pinv(self.M(q) + 1e-6 * np.eye(self.n_joints))
            J_task_pinv = M_inv @ J_task_proj.T @ lambda_task

            tau_task = J_task_pinv @ (ddq_des_task - self.C(q, dq) @ dq)

            # Apply task to total control
            tau += weight_task * tau_task

            # Update nullspace projection for lower priority tasks
            J_task_full_pinv = M_inv @ J_task.T @ np.linalg.pinv(J_task @ M_inv @ J_task.T + 1e-6 * np.eye(J_task.shape[0]))
            nullspace_proj = I - J_task_full_pinv @ J_task
            current_nullspace_proj = current_nullspace_proj @ nullspace_proj

        return tau

    def M(self, q):
        """Compute mass matrix"""
        # This would interface with robot dynamics model
        # For now, return a simplified version
        return np.eye(self.n_joints) * 0.5  # Simplified mass matrix

    def C(self, q, dq):
        """Compute Coriolis matrix"""
        # This would compute the Coriolis and centrifugal forces
        # For now, return zeros
        return np.zeros((self.n_joints, self.n_joints))

    def G(self, q):
        """Compute gravity vector"""
        # This would compute gravity terms
        # For now, return zeros
        return np.zeros(self.n_joints)

    def add_cartesian_task(self, name, end_effector_link, target_pose, priority=1, weight=1.0):
        """Add cartesian position task"""
        def jacobian_func(q):
            # Compute Jacobian for end effector
            return self.compute_jacobian(end_effector_link, q)

        def error_func(q):
            # Compute cartesian error
            current_pose = self.compute_forward_kinematics(end_effector_link, q)
            error = self.compute_pose_error(current_pose, target_pose)
            return error

        self.add_task(name, jacobian_func, error_func, priority, weight)

    def add_joint_task(self, name, joint_indices, target_positions, priority=2, weight=1.0):
        """Add joint space task"""
        def jacobian_func(q):
            # Identity for joint space
            J = np.zeros((len(joint_indices), self.n_joints))
            for i, idx in enumerate(joint_indices):
                J[i, idx] = 1.0
            return J

        def error_func(q):
            current_positions = q[joint_indices]
            error = target_positions - current_positions
            return error

        self.add_task(name, jacobian_func, error_func, priority, weight)

    def compute_jacobian(self, link_name, q):
        """Compute geometric Jacobian for a link"""
        # This would interface with robot kinematics
        # For now, return a simplified version
        J = np.zeros((6, self.n_joints))  # [linear; angular]

        # Simplified Jacobian computation
        # In practice, this would use the robot's kinematic model
        for i in range(min(6, self.n_joints)):
            J[i, i] = 1.0  # Simplified diagonal

        return J

    def compute_forward_kinematics(self, link_name, q):
        """Compute forward kinematics"""
        # This would compute the actual FK
        # For now, return identity pose
        return np.eye(4)

    def compute_pose_error(self, current_pose, target_pose):
        """Compute pose error in operational space"""
        # Position error
        pos_error = target_pose[:3, 3] - current_pose[:3, 3]

        # Orientation error (using rotation vector representation)
        R_error = target_pose[:3, :3] @ current_pose[:3, :3].T
        angle_axis = self.rotation_matrix_to_angle_axis(R_error)

        # Combine position and orientation errors
        error = np.concatenate([pos_error, angle_axis])

        return error

    def rotation_matrix_to_angle_axis(self, R):
        """Convert rotation matrix to angle-axis representation"""
        angle = np.arccos(np.clip((np.trace(R) - 1) / 2, -1, 1))

        if np.sin(angle) != 0:
            factor = angle / (2 * np.sin(angle))
            rx = factor * (R[2, 1] - R[1, 2])
            ry = factor * (R[0, 2] - R[2, 0])
            rz = factor * (R[1, 0] - R[0, 1])
        else:
            # Handle singularity at angle = 0
            rx = ry = rz = 0.0

        return np.array([rx, ry, rz])

class WholeBodyController:
    def __init__(self, robot_model):
        self.robot_model = robot_model

        # Initialize operational space controllers for different parts
        self.left_arm_controller = OperationalSpaceController(robot_model, num_joints=7)
        self.right_arm_controller = OperationalSpaceController(robot_model, num_joints=7)
        self.left_leg_controller = OperationalSpaceController(robot_model, num_joints=6)
        self.right_leg_controller = OperationalSpaceController(robot_model, num_joints=6)
        self.torso_controller = OperationalSpaceController(robot_model, num_joints=2)

        # Balance controller
        self.balance_controller = InvertedPendulumBalancer()

        # Task prioritization
        self.task_hierarchy = [
            'balance',      # Highest priority
            'contact',      # Contact constraints
            'motion',       # Motion tasks
            'posture'       # Posture tasks (lowest priority)
        ]

        # Joint limits and safety constraints
        self.safety_margin = 0.1  # Radians from joint limits
        self.max_torque = 100.0   # Maximum torque limit

    def compute_whole_body_control(self, state, tasks, dt):
        """
        Compute whole body control considering all tasks
        """
        q = state['joint_positions']
        dq = state['joint_velocities']

        # Initialize total control
        tau_total = np.zeros(len(q))

        # Process tasks in priority order
        for priority_level in self.task_hierarchy:
            if priority_level == 'balance':
                tau_balance = self.compute_balance_control(state, tasks.get('balance', {}), dt)
                tau_total += tau_balance

            elif priority_level == 'contact':
                tau_contact = self.compute_contact_control(state, tasks.get('contact', {}), dt)
                tau_total += tau_contact

            elif priority_level == 'motion':
                tau_motion = self.compute_motion_control(state, tasks.get('motion', {}), dt)
                tau_total += tau_motion

            elif priority_level == 'posture':
                tau_posture = self.compute_posture_control(state, tasks.get('posture', {}), dt)
                tau_total += tau_posture

        # Apply safety limits
        tau_total = np.clip(tau_total, -self.max_torque, self.max_torque)

        # Check for joint limit violations
        tau_total = self.apply_joint_limit_avoidance(q, tau_total)

        return tau_total

    def compute_balance_control(self, state, balance_tasks, dt):
        """
        Compute balance control torques
        """
        q = state['joint_positions']
        dq = state['joint_velocities']

        # Compute center of mass position and velocity
        com_pos, com_vel = self.compute_com_state(q, dq)

        # Use balance controller to compute CoM acceleration command
        com_acc_cmd, current_zmp = self.balance_controller.compute_balance_control(
            com_pos, com_vel, np.zeros(3)  # Assuming zero desired acceleration initially
        )

        # Convert CoM control to joint torques using Jacobian transpose
        com_jacobian = self.compute_com_jacobian(q)
        tau_balance = com_jacobian.T @ (com_acc_cmd * self.robot_model.mass)

        return tau_balance

    def compute_contact_control(self, state, contact_tasks, dt):
        """
        Compute contact constraint control
        """
        q = state['joint_positions']
        dq = state['joint_velocities']

        tau_contact = np.zeros(len(q))

        for contact_info in contact_tasks.get('contacts', []):
            link_name = contact_info['link']
            contact_point = contact_info['point']
            contact_normal = contact_info['normal']
            desired_force = contact_info.get('desired_force', 0.0)

            # Compute contact Jacobian
            contact_jacobian = self.compute_contact_jacobian(link_name, contact_point, q)

            # Project to contact normal
            normal_jacobian = contact_normal.T @ contact_jacobian

            # Compute force error
            current_force = self.compute_contact_force(link_name, q, dq)
            force_error = desired_force - current_force

            # Compute control
            tau_contact += normal_jacobian.T * force_error * 10.0  # Stiffness gain

        return tau_contact

    def compute_motion_control(self, state, motion_tasks, dt):
        """
        Compute motion control for end effectors and other parts
        """
        q = state['joint_positions']
        dq = state['joint_velocities']

        # Initialize operational space controllers with current tasks
        for task_name, task_info in motion_tasks.items():
            if task_info['type'] == 'cartesian':
                controller = self.get_appropriate_controller(task_info['end_effector'])
                controller.add_cartesian_task(
                    task_name,
                    task_info['end_effector'],
                    task_info['target_pose'],
                    priority=task_info.get('priority', 3),
                    weight=task_info.get('weight', 1.0)
                )
            elif task_info['type'] == 'joint':
                # Add joint space task
                pass

        # Compute control for each controller
        tau_motion = np.zeros(len(q))

        # Combine controls from all operational controllers
        # This would involve more sophisticated task prioritization
        # and nullspace projections in a real implementation

        return tau_motion

    def compute_posture_control(self, state, posture_tasks, dt):
        """
        Compute posture control (nullspace tasks)
        """
        q = state['joint_positions']
        dq = state['joint_velocities']

        tau_posture = np.zeros(len(q))

        # Joint centering tasks
        if 'joint_centers' in posture_tasks:
            joint_centers = posture_tasks['joint_centers']
            kp_posture = posture_tasks.get('stiffness', 1.0)

            for joint_idx, center_pos in enumerate(joint_centers):
                error = center_pos - q[joint_idx]
                tau_posture[joint_idx] += kp_posture * error

        return tau_posture

    def compute_com_state(self, q, dq):
        """
        Compute center of mass position and velocity
        """
        # This would use the robot's kinematic model to compute CoM
        # For now, return simplified calculation
        com_pos = np.array([0.0, 0.0, 0.8])  # Simplified CoM position
        com_vel = np.array([0.0, 0.0, 0.0])  # Simplified CoM velocity

        return com_pos, com_vel

    def compute_com_jacobian(self, q):
        """
        Compute CoM Jacobian
        """
        # This would compute the actual CoM Jacobian
        # For now, return simplified version
        J_com = np.zeros((3, len(q)))

        # Simplified CoM Jacobian (first few joints affect CoM significantly)
        for i in range(min(10, len(q))):
            J_com[2, i] = 0.1  # Simplified - joints affect CoM height

        return J_com

    def compute_contact_jacobian(self, link_name, contact_point, q):
        """
        Compute contact Jacobian for a specific contact
        """
        # This would compute the actual contact Jacobian
        # For now, return simplified version
        return np.zeros((3, len(q)))

    def compute_contact_force(self, link_name, q, dq):
        """
        Compute contact force at a specific contact
        """
        # This would compute actual contact force
        # For now, return simplified calculation
        return 0.0

    def get_appropriate_controller(self, end_effector_name):
        """
        Get appropriate controller for end effector
        """
        if 'left' in end_effector_name.lower():
            if 'arm' in end_effector_name.lower():
                return self.left_arm_controller
            elif 'leg' in end_effector_name.lower():
                return self.left_leg_controller
        elif 'right' in end_effector_name.lower():
            if 'arm' in end_effector_name.lower():
                return self.right_arm_controller
            elif 'leg' in end_effector_name.lower():
                return self.right_leg_controller
        elif 'torso' in end_effector_name.lower():
            return self.torso_controller

        return self.left_arm_controller  # Default

    def apply_joint_limit_avoidance(self, q, tau):
        """
        Apply joint limit avoidance to control torques
        """
        tau_limited = tau.copy()

        for i in range(len(q)):
            # Check if approaching joint limits
            if q[i] > self.joint_limits_upper[i] - self.safety_margin:
                # Near upper limit - apply torque to move away
                tau_limited[i] -= 10.0 * (q[i] - (self.joint_limits_upper[i] - self.safety_margin))
            elif q[i] < self.joint_limits_lower[i] + self.safety_margin:
                # Near lower limit - apply torque to move away
                tau_limited[i] += 10.0 * ((self.joint_limits_lower[i] + self.safety_margin) - q[i])

        return tau_limited
```

## Adaptive Control and Learning-Based Control

### Adaptive Control for Parameter Uncertainty

#### Model Reference Adaptive Control
```python
class ModelReferenceAdaptiveController:
    def __init__(self, robot_model, num_joints=32):
        self.robot_model = robot_model
        self.n_joints = num_joints

        # Reference model parameters
        self.ref_nat_freq = 10.0  # Natural frequency of reference model
        self.ref_damping = 0.7    # Damping ratio of reference model

        # Adaptive parameters
        self.theta_hat = np.ones(3 * num_joints)  # Estimated parameters (M, C, G)
        self.P = np.eye(3 * num_joints) * 1000   # Parameter covariance matrix
        self.gamma = 0.1  # Adaptive gain

        # Control gains
        self.kp = np.eye(num_joints) * 100.0  # Proportional gain
        self.kd = np.eye(num_joints) * 20.0   # Derivative gain

        # Forgetting factor for recursive least squares
        self.lambda_rls = 0.98

    def compute_adaptive_control(self, q, dq, q_des, dq_des, ddq_des, dt):
        """
        Compute adaptive control with parameter estimation
        """
        # Compute tracking errors
        q_error = q_des - q
        dq_error = dq_des - dq

        # Compute reference model states
        s = dq_error + self.ref_damping * self.ref_nat_freq * q_error

        # Regressor matrix (depends on robot configuration)
        Y = self.compute_regressor(q, dq, ddq_des, s)

        # Compute control law: tau = Y*theta_hat + K*s
        tau_adaptive = Y @ self.theta_hat + self.kp @ q_error + self.kd @ dq_error

        # Parameter update law
        self.update_parameters(Y, s, dt)

        return tau_adaptive

    def compute_regressor(self, q, dq, ddq_des, s):
        """
        Compute regressor matrix Y such that Y*theta = M*ddq + C*dq + G
        """
        # This creates a regressor matrix where each column corresponds
        # to a basis function of the robot dynamics
        n = self.n_joints

        # For simplicity, we'll use a linear-in-parameters formulation
        # In practice, this would be more complex and robot-specific

        Y = np.zeros((n, 3 * n))

        # Mass matrix terms (first n columns)
        for i in range(n):
            Y[i, i] = ddq_des[i]  # M*q_ddot terms

        # Coriolis terms (middle n columns)
        for i in range(n):
            Y[i, n + i] = dq[i] * np.abs(dq[i])  # C*q_dot terms (simplified)

        # Gravity terms (last n columns)
        for i in range(n):
            Y[i, 2*n + i] = 1.0  # G terms (simplified as constant)

        return Y

    def update_parameters(self, Y, s, dt):
        """
        Update parameter estimates using recursive least squares
        """
        # Compute innovation: e = Y*theta_hat - desired dynamics
        # For MRAC, we want to minimize tracking error
        # So we use: theta_dot = -gamma * P * Y.T * s (gradient descent on tracking error)

        # Covariance update: P_dot = -lambda*P + gamma*P*Y.T*Y*P
        denom = self.lambda_rls * np.eye(Y.shape[1]) + Y.T @ Y
        K = self.P @ Y.T @ np.linalg.inv(denom)

        # Parameter update
        self.theta_hat += K @ s * self.gamma

        # Covariance update
        self.P = (np.eye(K.shape[0]) - K @ Y) @ self.P / self.lambda_rls

    def compute_model_based_control(self, q, dq, q_des, dq_des, ddq_des):
        """
        Compute model-based control using estimated parameters
        """
        # Use estimated parameters to compute inverse dynamics
        M_est = np.diag(self.theta_hat[:self.n_joints])  # Simplified: diagonal mass matrix
        C_est = np.diag(self.theta_hat[self.n_joints:2*self.n_joints])  # Simplified: diagonal Coriolis
        G_est = self.theta_hat[2*self.n_joints:]  # Gravity terms

        # Compute control: tau = M_est*ddq_des + C_est*dq_des + G_est + Kp*error_pos + Kd*error_vel
        tau = (M_est * ddq_des + C_est * dq_des + G_est +
               self.kp @ (q_des - q) + self.kd @ (dq_des - dq))

        return tau
```

### Learning-Based Control with Neural Networks

#### Neural Network Adaptive Controller
```python
import torch
import torch.nn as nn
import torch.optim as optim

class NeuralNetworkAdaptiveController(nn.Module):
    def __init__(self, state_dim, action_dim, hidden_dim=256):
        super(NeuralNetworkAdaptiveController, self).__init__()

        self.state_dim = state_dim
        self.action_dim = action_dim

        # Neural network for dynamics approximation
        self.dynamics_net = nn.Sequential(
            nn.Linear(state_dim + action_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, state_dim)  # Predicts state derivative
        )

        # Neural network for control policy
        self.policy_net = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim)
        )

        # Additional networks for uncertainty quantification
        self.uncertainty_net = nn.Sequential(
            nn.Linear(state_dim + action_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1)  # Predicts uncertainty
        )

        # Initialize networks
        self.init_weights()

    def init_weights(self):
        """Initialize network weights"""
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight)
                nn.init.constant_(m.bias, 0)

    def forward(self, state, action=None):
        """Forward pass through the network"""
        if action is not None:
            # Predict next state given current state and action
            state_action = torch.cat([state, action], dim=-1)
            predicted_deriv = self.dynamics_net(state_action)
            return predicted_deriv
        else:
            # Predict action given current state
            action = self.policy_net(state)
            return action

    def predict_dynamics(self, state, action):
        """Predict state derivative given state and action"""
        state_action = torch.cat([state, action], dim=-1)
        return self.dynamics_net(state_action)

    def predict_uncertainty(self, state, action):
        """Predict uncertainty in dynamics prediction"""
        state_action = torch.cat([state, action], dim=-1)
        return self.uncertainty_net(state_action)

class NNAdaptiveController:
    def __init__(self, state_dim, action_dim, learning_rate=1e-4):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        self.controller = NeuralNetworkAdaptiveController(state_dim, action_dim)
        self.controller.to(self.device)

        # Optimizers
        self.dynamics_optimizer = optim.Adam(
            self.controller.dynamics_net.parameters(), lr=learning_rate
        )
        self.policy_optimizer = optim.Adam(
            self.controller.policy_net.parameters(), lr=learning_rate
        )
        self.uncertainty_optimizer = optim.Adam(
            self.controller.uncertainty_net.parameters(), lr=learning_rate
        )

        # Loss functions
        self.dynamics_criterion = nn.MSELoss()
        self.uncertainty_criterion = nn.MSELoss()

        # Replay buffer for training
        self.replay_buffer = deque(maxlen=100000)

        # Control parameters
        self.kp = 100.0  # Proportional gain
        self.kd = 20.0   # Derivative gain

    def compute_control(self, state, desired_state, dt):
        """Compute control using neural network approximation"""
        state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
        desired_tensor = torch.FloatTensor(desired_state).unsqueeze(0).to(self.device)

        # Compute tracking error
        error = desired_tensor - state_tensor
        error_pos = error[:, :len(state)//2]  # Position error
        error_vel = error[:, len(state)//2:]   # Velocity error (assuming state = [pos, vel])

        # Get neural network control action
        nn_action = self.controller(state_tensor)

        # Add PD control for tracking
        pd_control = self.kp * error_pos + self.kd * error_vel

        # Combine neural network control with PD control
        total_action = nn_action + pd_control

        return total_action.cpu().detach().numpy().flatten()

    def train_step(self, batch_size=32):
        """Train the neural networks on a batch of data"""
        if len(self.replay_buffer) < batch_size:
            return

        # Sample batch from replay buffer
        batch = random.sample(self.replay_buffer, batch_size)
        states, actions, next_states, rewards = zip(*batch)

        states = torch.FloatTensor(states).to(self.device)
        actions = torch.FloatTensor(actions).to(self.device)
        next_states = torch.FloatTensor(next_states).to(self.device)
        rewards = torch.FloatTensor(rewards).to(self.device)

        # Train dynamics network
        self.dynamics_optimizer.zero_grad()

        # Predict next state derivative
        state_action = torch.cat([states, actions], dim=1)
        predicted_deriv = self.controller.dynamics_net(state_action)

        # Compute target derivative (finite difference)
        target_deriv = (next_states - states) / 0.01  # Assuming dt = 0.01

        dynamics_loss = self.dynamics_criterion(predicted_deriv, target_deriv)
        dynamics_loss.backward()
        self.dynamics_optimizer.step()

        # Train uncertainty network
        self.uncertainty_optimizer.zero_grad()

        # Use prediction error as target for uncertainty
        prediction_error = torch.abs(predicted_deriv - target_deriv)
        uncertainty_pred = self.controller.uncertainty_net(state_action)

        uncertainty_loss = self.uncertainty_criterion(uncertainty_pred, torch.norm(prediction_error, dim=1, keepdim=True))
        uncertainty_loss.backward()
        self.uncertainty_optimizer.step()

        # Train policy network (actor-critic style)
        self.policy_optimizer.zero_grad()

        # Get policy actions
        policy_actions = self.controller.policy_net(states)

        # Predict outcomes of policy actions
        policy_state_action = torch.cat([states, policy_actions], dim=1)
        policy_deriv = self.controller.dynamics_net(policy_state_action)

        # Use uncertainty to weight the policy update
        uncertainty_weights = torch.exp(-self.controller.uncertainty_net(policy_state_action))

        # Simple policy loss (more sophisticated loss would involve value function)
        # For now, use negative reward as proxy
        policy_loss = -torch.mean(rewards * uncertainty_weights.flatten())
        policy_loss.backward()
        self.policy_optimizer.step()

    def add_experience(self, state, action, next_state, reward):
        """Add experience to replay buffer"""
        self.replay_buffer.append((state, action, next_state, reward))

    def compute_safe_control(self, state, desired_state, dt):
        """Compute control with safety considerations"""
        # Get base control
        base_action = self.compute_control(state, desired_state, dt)

        # Check uncertainty in current state
        state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
        action_tensor = torch.FloatTensor(base_action).unsqueeze(0).to(self.device)

        uncertainty = self.controller.predict_uncertainty(state_tensor, action_tensor)

        # If uncertainty is high, reduce control authority
        if uncertainty.item() > 0.5:  # Threshold for high uncertainty
            base_action *= 0.5  # Reduce control authority by 50%

        return base_action
```

## Safety and Robustness

### Safety-Critical Control

#### Control Barrier Functions
```python
class ControlBarrierFunction:
    def __init__(self, robot_model, safe_set_func, alpha_gain=1.0):
        self.robot_model = robot_model
        self.safe_set_func = safe_set_func  # Function that defines safe set
        self.alpha_gain = alpha_gain        # Class-K function gain

    def compute_barrier_value(self, state):
        """Compute barrier function value"""
        # This would compute a barrier function that is positive in safe set
        # and negative outside
        return self.safe_set_func(state)

    def compute_barrier_gradient(self, state):
        """Compute gradient of barrier function"""
        # Numerical differentiation for simplicity
        eps = 1e-6
        grad = np.zeros_like(state)

        for i in range(len(state)):
            state_plus = state.copy()
            state_minus = state.copy()
            state_plus[i] += eps
            state_minus[i] -= eps

            h_plus = self.compute_barrier_value(state_plus)
            h_minus = self.compute_barrier_value(state_minus)

            grad[i] = (h_plus - h_minus) / (2 * eps)

        return grad

    def compute_admissible_control_set(self, state, nominal_control):
        """Compute admissible control set using CBF"""
        h = self.compute_barrier_value(state)
        dh_dx = self.compute_barrier_gradient(state)

        # For control affine system: ẋ = f(x) + g(x)u
        # We want: Lfh + Lgh*u + α(h) >= 0
        # So: Lgh*u >= -(Lfh + α(h))

        # Lf h = dh/dx * f(x)
        Lf_h = dh_dx @ self.drift_dynamics(state)

        # Lg h = dh/dx * g(x)
        Lg_h = dh_dx @ self.control_matrix(state)

        # Class-K function (linear for simplicity)
        alpha_h = self.alpha_gain * h if h >= 0 else -self.alpha_gain * h

        # Constraint: Lg_h * u >= -(Lf_h + alpha_h)
        if Lg_h != 0:
            constraint_bound = -(Lf_h + alpha_h) / Lg_h
            if Lg_h > 0:
                # If Lg_h > 0, then u >= constraint_bound
                safe_control = max(nominal_control, constraint_bound)
            else:
                # If Lg_h < 0, then u <= constraint_bound
                safe_control = min(nominal_control, constraint_bound)
        else:
            # If Lg_h = 0, barrier function doesn't depend on control
            safe_control = nominal_control

        return safe_control

    def drift_dynamics(self, state):
        """Compute drift dynamics f(x) for system ẋ = f(x) + g(x)u"""
        # This would compute the actual drift dynamics
        # For now, return zeros
        return np.zeros_like(state)

    def control_matrix(self, state):
        """Compute control matrix g(x) for system ẋ = f(x) + g(x)u"""
        # This would compute the actual control matrix
        # For now, return identity
        return np.eye(len(state))

class SafetyFilter:
    def __init__(self, cbf_list, robot_model):
        self.cbf_list = cbf_list  # List of control barrier functions
        self.robot_model = robot_model

    def filter_control(self, state, nominal_control):
        """Filter control to ensure safety"""
        safe_control = nominal_control.copy()

        for cbf in self.cbf_list:
            safe_control = cbf.compute_admissible_control_set(state, safe_control)

        return safe_control

class SafeHumanoidController:
    def __init__(self, robot_model):
        self.robot_model = robot_model

        # Initialize safety components
        self.balance_cbf = self.create_balance_cbf()
        self.joint_limit_cbf = self.create_joint_limit_cbf()
        self.obstacle_cbf = self.create_obstacle_cbf()

        self.safety_filter = SafetyFilter([
            self.balance_cbf,
            self.joint_limit_cbf,
            self.obstacle_cbf
        ], robot_model)

        # Nominal controllers
        self.nominal_controller = WholeBodyController(robot_model)

    def create_balance_cbf(self):
        """Create control barrier function for balance"""
        def safe_set_func(state):
            # Define safe set based on ZMP or capture point
            # Positive inside safe set, negative outside
            com_pos = state[:2]  # x, y CoM position
            zmp_pos = self.estimate_zmp(state)

            # Safe if ZMP is within support polygon
            support_center = self.get_support_center(state)
            support_radius = 0.1  # Simplified support radius

            dist_to_center = np.linalg.norm(zmp_pos - support_center)
            return support_radius - dist_to_center  # Positive if within support

        return ControlBarrierFunction(self.robot_model, safe_set_func)

    def create_joint_limit_cbf(self):
        """Create control barrier function for joint limits"""
        def safe_set_func(state):
            # Define safe set based on joint limits
            joint_positions = state[self.joint_state_indices]  # Extract joint positions
            lower_limits = self.robot_model.joint_limits_lower
            upper_limits = self.robot_model.joint_limits_upper

            # Return minimum distance to limits (positive if within limits)
            dist_lower = joint_positions - lower_limits - 0.05  # 5 degree safety margin
            dist_upper = upper_limits - joint_positions - 0.05

            return min(np.min(dist_lower), np.min(dist_upper))

        return ControlBarrierFunction(self.robot_model, safe_set_func)

    def create_obstacle_cbf(self):
        """Create control barrier function for obstacle avoidance"""
        def safe_set_func(state):
            # Define safe set based on distance to obstacles
            robot_pos = self.get_robot_position(state)

            # Compute minimum distance to obstacles
            min_dist = float('inf')
            for obstacle in self.get_known_obstacles():
                dist = np.linalg.norm(robot_pos - obstacle['position'])
                min_dist = min(min_dist, dist - obstacle['radius'])

            # Return signed distance (positive if outside obstacles)
            return min_dist - 0.1  # 10cm safety margin

        return ControlBarrierFunction(self.robot_model, safe_set_func)

    def compute_safe_control(self, state, tasks, dt):
        """Compute safe control using safety filter"""
        # Compute nominal control
        nominal_control = self.nominal_controller.compute_whole_body_control(state, tasks, dt)

        # Filter through safety
        safe_control = self.safety_filter.filter_control(state, nominal_control)

        return safe_control

    def estimate_zmp(self, state):
        """Estimate Zero Moment Point"""
        # Simplified ZMP estimation
        com_pos = state[:2]  # x, y CoM position
        com_acc = state[6:8]  # x, y CoM acceleration (assuming state = [pos, vel, acc])
        g = 9.81
        com_height = 0.8  # Simplified CoM height

        zmp_x = com_pos[0] - (com_height * com_acc[0]) / g
        zmp_y = com_pos[1] - (com_height * com_acc[1]) / g

        return np.array([zmp_x, zmp_y])

    def get_support_center(self, state):
        """Get center of support polygon"""
        # This would determine support based on contact states
        # For now, return current CoM projection
        return state[:2]  # Simplified
```

## Implementation with Isaac Sim and Isaac ROS

### Integration with Isaac Sim Physics

#### Isaac Sim Control Interface
```python
import omni
from omni.isaac.core import World
from omni.isaac.core.robots import Robot
from omni.isaac.core.articulations import ArticulationView
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.nucleus import get_assets_root_path
import numpy as np

class IsaacSimHumanoidController:
    def __init__(self, robot_name="humanoid_robot"):
        self.world = World(stage_units_in_meters=1.0)
        self.robot_name = robot_name

        # Initialize robot in Isaac Sim
        self.setup_isaac_sim_environment()

        # Initialize control components
        self.balance_controller = InvertedPendulumBalancer()
        self.walking_controller = WalkingPatternGenerator()
        self.whole_body_controller = WholeBodyController(self.robot_model)
        self.safety_controller = SafeHumanoidController(self.robot_model)

        # Control parameters
        self.control_dt = 1.0 / 200.0  # 200 Hz control frequency
        self.sim_dt = 1.0 / 60.0       # 60 Hz simulation frequency

    def setup_isaac_sim_environment(self):
        """Setup Isaac Sim environment with humanoid robot"""
        # Add ground plane
        self.world.scene.add_default_ground_plane()

        # Get robot asset path
        assets_root_path = get_assets_root_path()
        if assets_root_path is None:
            carb.log_error("Could not find Isaac Sim assets. Please check your installation.")
            return

        # Add humanoid robot
        robot_asset_path = assets_root_path + "/Isaac/Robots/Humanoid/humanoid_instanceable.usd"

        # Add robot to stage
        add_reference_to_stage(usd_path=robot_asset_path, prim_path=f"/World/{self.robot_name}")

        # Create robot view
        self.robot = self.world.scene.add(
            Robot(
                prim_path=f"/World/{self.robot_name}",
                name=self.robot_name,
                position=np.array([0.0, 0.0, 1.0]),
                orientation=np.array([1.0, 0.0, 0.0, 0.0])
            )
        )

        # Get joint names and create articulation view
        self.joint_names = self.robot.dof_names
        self.articulation_view = ArticulationView(
            prim_path_regex=f"/World/{self.robot_name}",
            name="articulation_view"
        )
        self.world.scene.add(self.articulation_view)

    def get_robot_state(self):
        """Get current robot state from Isaac Sim"""
        # Get joint positions and velocities
        joint_positions = self.articulation_view.get_joint_positions()
        joint_velocities = self.articulation_view.get_joint_velocities()

        # Get base pose and velocity
        base_poses = self.articulation_view.get_world_poses()
        base_positions, base_orientations = base_poses

        base_linear_vels = self.articulation_view.get_linear_velocities()
        base_angular_vels = self.articulation_view.get_angular_velocities()

        # Get center of mass information
        com_pos, com_vel = self.compute_com_state()

        # Pack state into standard format
        state = {
            'joint_positions': joint_positions,
            'joint_velocities': joint_velocities,
            'base_position': base_positions[0],
            'base_orientation': base_orientations[0],
            'base_linear_velocity': base_linear_vels[0],
            'base_angular_velocity': base_angular_vels[0],
            'com_position': com_pos,
            'com_velocity': com_vel,
            'contact_states': self.get_contact_states()
        }

        return state

    def compute_com_state(self):
        """Compute center of mass position and velocity"""
        # In Isaac Sim, we can use the physics engine to compute CoM
        # This is a simplified approach - in practice, use Isaac Sim's CoM computation
        masses = self.articulation_view.get_mass_matrices()
        poses = self.articulation_view.get_world_poses()

        total_mass = np.sum(masses)
        com_pos = np.zeros(3)

        # Compute weighted average of link positions
        for i, (mass, (pos, rot)) in enumerate(zip(masses, poses)):
            com_pos += mass * pos

        com_pos /= total_mass if total_mass > 0 else 1.0

        # For velocity, we'll approximate based on joint velocities
        # In practice, use Isaac Sim's CoM velocity computation
        com_vel = np.zeros(3)

        return com_pos, com_vel

    def get_contact_states(self):
        """Get contact information"""
        # This would interface with Isaac Sim's contact sensors
        # For now, return simplified contact information
        return {
            'left_foot_contact': True,  # Simplified
            'right_foot_contact': False,  # Simplified
            'contact_forces': np.zeros(6)  # Simplified
        }

    def send_control_commands(self, joint_torques, dt):
        """Send control commands to Isaac Sim"""
        # Apply joint torques
        self.articulation_view.set_joint_efforts(joint_torques)

        # Alternatively, for position control:
        # self.articulation_view.set_joint_position_targets(desired_positions)

        # For velocity control:
        # self.articulation_view.set_joint_velocity_targets(desired_velocities)

    def control_step(self, tasks, dt):
        """Execute one control step"""
        # Get current robot state
        current_state = self.get_robot_state()

        # Compute safe control using the full control stack
        control_torques = self.safety_controller.compute_safe_control(
            current_state, tasks, dt
        )

        # Send commands to simulation
        self.send_control_commands(control_torques, dt)

        # Log control information
        self.log_control_info(current_state, control_torques)

    def log_control_info(self, state, torques):
        """Log control information for debugging"""
        # This would log to ROS topics or files
        # For now, print basic information
        com_pos = state['com_position']
        com_vel = state['com_velocity']

        print(f"CoM: pos=({com_pos[0]:.2f}, {com_pos[1]:.2f}, {com_pos[2]:.2f}), "
              f"vel=({com_vel[0]:.2f}, {com_vel[1]:.2f}, {com_vel[2]:.2f}), "
              f"torque_norm={np.linalg.norm(torques):.2f}")

    def run_control_loop(self, tasks, duration=10.0):
        """Run control loop for specified duration"""
        start_time = 0.0
        current_time = 0.0

        while current_time < duration:
            # Step simulation
            self.world.step(render=True)

            # Execute control step at control frequency
            if current_time % self.control_dt < self.sim_dt:
                self.control_step(tasks, self.control_dt)

            current_time += self.sim_dt

            # Check for emergency stops
            if self.should_emergency_stop():
                self.emergency_stop()
                break

    def should_emergency_stop(self):
        """Check if emergency stop conditions are met"""
        state = self.get_robot_state()

        # Check for dangerous conditions
        com_height = state['com_position'][2]
        if com_height < 0.3:  # Robot fell
            return True

        # Check for joint limit violations
        joint_pos = state['joint_positions']
        if np.any(np.abs(joint_pos) > 3.0):  # Extremely large joint angles
            return True

        return False

    def emergency_stop(self):
        """Execute emergency stop"""
        # Send zero torques to all joints
        zero_torques = np.zeros(len(self.joint_names))
        self.send_control_commands(zero_torques, 0.0)

        print("EMERGENCY STOP: Robot control disabled for safety")

class IsaacROSHumanoidController:
    def __init__(self):
        # Initialize ROS components
        rclpy.init()
        self.node = rclpy.create_node('isaac_ros_humanoid_controller')

        # Initialize Isaac Sim controller
        self.isaac_controller = IsaacSimHumanoidController()

        # ROS publishers and subscribers
        self.joint_command_publisher = self.node.create_publisher(
            JointState, '/joint_commands', 10
        )

        self.sensor_subscriber = self.node.create_subscription(
            JointState, '/joint_states', self.sensor_callback, 10
        )

        self.task_subscriber = self.node.create_subscription(
            HumanoidTask, '/humanoid_tasks', self.task_callback, 10
        )

        # Task management
        self.current_tasks = {}
        self.control_timer = self.node.create_timer(0.005, self.control_callback)  # 200 Hz

    def sensor_callback(self, msg):
        """Process sensor data from real robot"""
        # Update controller with sensor data
        # This would handle real robot sensor data
        pass

    def task_callback(self, msg):
        """Process task commands"""
        self.current_tasks[msg.task_type] = msg.task_data

    def control_callback(self):
        """Execute control step"""
        if self.current_tasks:
            self.isaac_controller.control_step(self.current_tasks, 0.005)

    def spin(self):
        """Spin the ROS node"""
        rclpy.spin(self.node)

    def destroy_node(self):
        """Clean up"""
        self.node.destroy_node()
        rclpy.shutdown()
```

## Performance Optimization

### Real-time Control Considerations

#### Efficient Control Pipeline
```python
import time
import threading
from collections import deque
import multiprocessing as mp

class RealTimeHumanoidController:
    def __init__(self, robot_model, control_frequency=200):
        self.robot_model = robot_model
        self.control_frequency = control_frequency
        self.dt = 1.0 / control_frequency

        # Initialize controllers
        self.balance_controller = InvertedPendulumBalancer()
        self.walking_controller = WalkingPatternGenerator()
        self.whole_body_controller = WholeBodyController(robot_model)
        self.safety_controller = SafeHumanoidController(robot_model)

        # Real-time performance tracking
        self.control_times = deque(maxlen=100)
        self.loop_periods = deque(maxlen=100)

        # Threading for parallel processing
        self.sensor_queue = deque(maxlen=10)
        self.command_queue = deque(maxlen=10)

        # Control thread
        self.control_thread = None
        self.is_running = False

        # Priority-based task scheduling
        self.task_scheduler = PriorityTaskScheduler()

    def start_control_loop(self):
        """Start real-time control loop in separate thread"""
        self.is_running = True
        self.control_thread = threading.Thread(target=self.control_loop)
        self.control_thread.start()

    def stop_control_loop(self):
        """Stop real-time control loop"""
        self.is_running = False
        if self.control_thread:
            self.control_thread.join()

    def control_loop(self):
        """Real-time control loop"""
        period_start = time.time()

        while self.is_running:
            loop_start = time.time()

            try:
                # Get current state (non-blocking)
                current_state = self.get_current_state_nonblocking()

                if current_state is not None:
                    # Compute control
                    start_time = time.time()
                    control_commands = self.compute_real_time_control(current_state)
                    control_time = time.time() - start_time

                    # Publish commands (non-blocking)
                    self.publish_commands_nonblocking(control_commands)

                    # Track performance
                    self.control_times.append(control_time)

                # Maintain control frequency
                loop_time = time.time() - loop_start
                sleep_time = max(0, self.dt - loop_time)

                if sleep_time > 0:
                    time.sleep(sleep_time)

                # Track loop period
                loop_period = time.time() - loop_start
                self.loop_periods.append(loop_period)

            except Exception as e:
                self.node.get_logger().error(f'Control loop error: {str(e)}')
                time.sleep(0.01)  # Brief sleep to prevent busy loop

    def compute_real_time_control(self, state):
        """Compute control with real-time constraints"""
        # Prioritize critical safety tasks
        if self.is_robot_unstable(state):
            return self.compute_emergency_control(state)

        # Use cached computations where possible
        if not hasattr(self, '_cached_kinematics') or self._cache_expired():
            self._cached_kinematics = self.compute_cached_kinematics(state)

        # Compute control using cached values
        nominal_control = self.whole_body_controller.compute_whole_body_control(
            state, self.current_tasks, self.dt
        )

        # Apply safety filtering
        safe_control = self.safety_controller.compute_safe_control(
            state, nominal_control, self.dt
        )

        return safe_control

    def is_robot_unstable(self, state):
        """Quick check for robot stability"""
        # Fast stability check - avoid expensive computations
        com_pos = state.get('com_position', np.array([0, 0, 0.8]))
        com_vel = state.get('com_velocity', np.array([0, 0, 0]))

        # Check if CoM is too low (robot fell)
        if com_pos[2] < 0.3:
            return True

        # Check if CoM velocity is too high
        if np.linalg.norm(com_vel) > 2.0:
            return True

        # Check joint limits (approximate)
        joint_pos = state.get('joint_positions', np.zeros(32))
        if np.any(np.abs(joint_pos) > 2.5):  # Close to limits
            return True

        return False

    def compute_emergency_control(self, state):
        """Compute emergency control for safety"""
        # Emergency control - prioritize safety over performance
        # Typically this involves reducing torques and moving to safe configuration
        emergency_torques = np.zeros(len(state.get('joint_positions', [])))

        # Add minimal stabilizing torques
        if state.get('com_position', [0, 0, 0.8])[2] < 0.5:  # Robot has fallen
            # Try to stop movement and protect joints
            pass
        else:
            # Apply minimal stabilization
            emergency_torques = self.compute_stabilizing_control(state)

        return emergency_torques

    def compute_stabilizing_control(self, state):
        """Compute stabilizing control"""
        # Simple PD control for stabilization
        joint_pos = state.get('joint_positions', np.zeros(32))
        joint_vel = state.get('joint_velocities', np.zeros(32))

        # Move toward neutral configuration
        neutral_config = np.zeros(len(joint_pos))
        pos_error = neutral_config - joint_pos

        kp = 50.0
        kd = 5.0

        torques = kp * pos_error - kd * joint_vel

        return torques

    def get_current_state_nonblocking(self):
        """Get current state without blocking"""
        try:
            # Try to get state from queue
            if self.sensor_queue:
                return self.sensor_queue[-1]  # Most recent state
            else:
                return None
        except:
            return None

    def publish_commands_nonblocking(self, commands):
        """Publish commands without blocking"""
        try:
            # Add to command queue for publishing
            self.command_queue.append(commands)

            # Publish if possible (non-blocking)
            if len(self.command_queue) > 0:
                command = self.command_queue.popleft()
                # Actually publish command to robot
                self.send_to_robot(command)
        except:
            pass  # Don't block on publishing errors

    def get_performance_metrics(self):
        """Get real-time performance metrics"""
        if len(self.control_times) == 0:
            return {}

        avg_control_time = np.mean(self.control_times)
        max_control_time = np.max(self.control_times)
        std_control_time = np.std(self.control_times)

        avg_loop_period = np.mean(self.loop_periods) if self.loop_periods else 0
        period_std = np.std(self.loop_periods) if self.loop_periods else 0

        return {
            'avg_control_time': avg_control_time,
            'max_control_time': max_control_time,
            'std_control_time': std_control_time,
            'avg_loop_period': avg_loop_period,
            'period_std': period_std,
            'utilization': (avg_control_time / self.dt) * 100 if self.dt > 0 else 0
        }

class PriorityTaskScheduler:
    def __init__(self):
        self.tasks = []  # List of (priority, task, deadline)

    def add_task(self, task, priority, deadline=None):
        """Add task with priority and optional deadline"""
        heapq.heappush(self.tasks, (priority, time.time() + (deadline or 0), task))

    def get_next_task(self):
        """Get next highest priority task"""
        if self.tasks:
            priority, deadline, task = heapq.heappop(self.tasks)
            return task
        return None

    def execute_ready_tasks(self):
        """Execute all ready tasks"""
        current_time = time.time()
        ready_tasks = []

        # Collect all ready tasks
        temp_tasks = []
        while self.tasks:
            priority, deadline, task = heapq.heappop(self.tasks)
            if current_time >= deadline:
                ready_tasks.append((priority, task))
            else:
                temp_tasks.append((priority, deadline, task))

        # Put back unready tasks
        for priority, deadline, task in temp_tasks:
            heapq.heappush(self.tasks, (priority, deadline, task))

        # Execute ready tasks
        for priority, task in ready_tasks:
            task.execute()
```

## Summary

Humanoid control is a complex, multi-layered challenge that requires sophisticated control strategies to achieve stable, dynamic, and human-like movement. The hierarchical control architecture provides a framework for managing the complexity of controlling dozens of degrees of freedom while maintaining balance and achieving task objectives. Advanced techniques like Model Predictive Control, Operational Space Control, and adaptive control enable humanoid robots to handle the inherent uncertainties and nonlinearities of their dynamics. Safety considerations, including Control Barrier Functions and emergency stop mechanisms, are critical for reliable operation. The integration with Isaac Sim provides a powerful simulation environment for developing and testing control algorithms before deployment on real hardware. Real-time performance optimization ensures that control algorithms can execute within the tight timing constraints required for stable humanoid operation. With these control techniques, humanoid robots can achieve the complex, adaptive behaviors necessary for practical applications in dynamic environments.

---

## Further Reading

- "Humanoid Robotics: A Reference" by Veloso
- "Robotics: Modelling, Planning and Control" by Siciliano et al.
- "Feedback Systems: An Introduction for Scientists and Engineers" by Astrom & Murray
- "Nonlinear Systems" by Khalil
- "Optimal Control Theory: An Introduction" by Kirk
- Isaac Sim documentation on control systems
- "Whole-Body Dynamic Control" research papers
- "Balance Control for Humanoid Robots" - technical surveys
- NVIDIA Isaac ROS control packages documentation