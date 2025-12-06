---
sidebar_label: Sim-to-Real Transfer
title: Sim-to-Real Transfer
---

# Sim-to-Real Transfer

## Introduction to Sim-to-Real Transfer

Sim-to-Real transfer, also known as sim2real, is the critical challenge of transferring policies and behaviors learned in simulation to real-world robotic systems. This process is fundamental to robotics development as simulation provides a safe, fast, and cost-effective environment for testing and training, while real-world deployment is the ultimate goal. For humanoid robots, sim-to-real transfer is particularly challenging due to the complex dynamics, rich sensory feedback, and intricate control requirements inherent in human-like robotic systems.

## The Reality Gap Challenge

### Understanding the Reality Gap

The "reality gap" refers to the fundamental differences between simulated and real environments that can cause policies trained in simulation to fail when deployed on real robots:

#### Physical Discrepancies
- **Inertial Properties**: Differences in mass, center of mass, and moments of inertia
- **Friction Models**: Simulation often uses simplified friction models compared to real-world interactions
- **Actuator Dynamics**: Differences in motor response, delays, and power limitations
- **Material Properties**: Variations in elasticity, damping, and surface characteristics

#### Sensory Differences
- **Camera Calibration**: Differences in intrinsic and extrinsic camera parameters
- **Sensor Noise**: Real sensors have different noise characteristics than simulated ones
- **Latency**: Real sensors and actuators have communication delays
- **Resolution**: Differences in sensor resolution and dynamic range

#### Environmental Factors
- **Gravity Variations**: Local gravitational differences or robot orientation
- **Air Resistance**: Often neglected in simulation but present in reality
- **Temperature Effects**: Changes in material properties and sensor behavior
- **Electromagnetic Interference**: Real-world electromagnetic effects not modeled in simulation

### Quantifying the Reality Gap

#### Gap Measurement Techniques
```python
import numpy as np
from scipy.spatial.distance import euclidean
from sklearn.metrics.pairwise import cosine_similarity

class RealityGapQuantifier:
    def __init__(self):
        self.sim_data_buffer = []
        self.real_data_buffer = []

    def measure_dynamics_gap(self, sim_trajectory, real_trajectory):
        """Measure gap in dynamics between simulation and reality"""
        # Compare position, velocity, and acceleration profiles
        position_error = np.mean([
            euclidean(sim_pos, real_pos)
            for sim_pos, real_pos in zip(sim_trajectory.positions, real_trajectory.positions)
        ])

        velocity_error = np.mean([
            euclidean(sim_vel, real_vel)
            for sim_vel, real_vel in zip(sim_trajectory.velocities, real_trajectory.velocities)
        ])

        acceleration_error = np.mean([
            euclidean(sim_acc, real_acc)
            for sim_acc, real_acc in zip(sim_trajectory.accelerations, real_trajectory.accelerations)
        ])

        return {
            'position_error': position_error,
            'velocity_error': velocity_error,
            'acceleration_error': acceleration_error,
            'overall_dynamics_gap': (position_error + velocity_error + acceleration_error) / 3
        }

    def measure_sensor_gap(self, sim_sensor_data, real_sensor_data):
        """Measure gap in sensor data between simulation and reality"""
        # For camera data - compare image statistics
        if hasattr(sim_sensor_data, 'image') and hasattr(real_sensor_data, 'image'):
            sim_mean = np.mean(sim_sensor_data.image)
            real_mean = np.mean(real_sensor_data.image)

            sim_std = np.std(sim_sensor_data.image)
            real_std = np.std(real_sensor_data.image)

            mean_gap = abs(sim_mean - real_mean)
            std_gap = abs(sim_std - real_std)

            return {
                'mean_gap': mean_gap,
                'std_gap': std_gap,
                'sensor_fidelity': 1.0 - (mean_gap + std_gap) / 2.0
            }

        # For IMU data - compare orientation and acceleration
        elif hasattr(sim_sensor_data, 'orientation') and hasattr(real_sensor_data, 'orientation'):
            # Calculate orientation difference
            sim_quat = sim_sensor_data.orientation
            real_quat = real_sensor_data.orientation

            # Quaternion distance
            quat_diff = 1 - np.dot(sim_quat, real_quat)**2

            return {
                'orientation_gap': quat_diff,
                'acceleration_gap': np.linalg.norm(
                    sim_sensor_data.linear_acceleration - real_sensor_data.linear_acceleration
                )
            }

    def measure_control_gap(self, sim_commands, real_commands):
        """Measure gap in control responses"""
        # Compare command execution
        command_error = np.mean([
            np.linalg.norm(sim_cmd - real_cmd)
            for sim_cmd, real_cmd in zip(sim_commands, real_commands)
        ])

        # Compare timing
        timing_error = np.std([
            sim_time - real_time
            for sim_time, real_time in zip(sim_commands.times, real_commands.times)
        ])

        return {
            'command_error': command_error,
            'timing_error': timing_error
        }

    def calculate_overall_gap(self, dynamics_gap, sensor_gap, control_gap):
        """Calculate overall reality gap metric"""
        # Weighted combination of different gap metrics
        weights = {
            'dynamics': 0.4,
            'sensor': 0.4,
            'control': 0.2
        }

        overall_gap = (
            weights['dynamics'] * dynamics_gap['overall_dynamics_gap'] +
            weights['sensor'] * (1 - sensor_gap.get('sensor_fidelity', 0)) +
            weights['control'] * (control_gap['command_error'] + control_gap['timing_error']) / 2
        )

        return overall_gap
```

## Domain Randomization

### Theory and Implementation

Domain randomization is a key technique for improving sim-to-real transfer by training policies on diverse randomized simulation environments:

#### Randomization Parameters
```python
class DomainRandomizer:
    def __init__(self):
        self.randomization_params = {
            # Physical properties
            'robot_mass_range': [0.8, 1.2],  # ±20% mass variation
            'robot_com_offset_range': [-0.05, 0.05],  # Center of mass offset (m)
            'inertia_scaling_range': [0.9, 1.1],  # Inertia scaling
            'friction_range': [0.5, 1.5],  # Friction coefficient range

            # Actuator properties
            'motor_delay_range': [0.001, 0.01],  # Motor delay (s)
            'motor_noise_range': [0.0, 0.05],  # Motor noise (fraction of command)
            'motor_saturation_range': [0.8, 1.0],  # Motor saturation threshold

            # Sensor properties
            'camera_noise_range': [0.0, 0.02],  # Camera noise level
            'imu_drift_range': [0.0, 0.001],  # IMU drift (rad/s)
            'sensor_bias_range': [-0.01, 0.01],  # Sensor bias

            # Environmental properties
            'gravity_range': [-10.2, -9.4],  # Gravity range (m/s²)
            'air_resistance_range': [0.0, 0.1],  # Air resistance coefficient
            'surface_roughness_range': [0.0, 0.2],  # Surface roughness
        }

    def randomize_robot_properties(self, robot):
        """Randomize robot physical properties"""
        # Randomize mass
        mass_multiplier = np.random.uniform(
            self.randomization_params['robot_mass_range'][0],
            self.randomization_params['robot_mass_range'][1]
        )
        self.multiply_robot_mass(robot, mass_multiplier)

        # Randomize center of mass
        com_offset = np.random.uniform(
            self.randomization_params['robot_com_offset_range'][0],
            self.randomization_params['robot_com_offset_range'][1],
            size=3
        )
        self.offset_center_of_mass(robot, com_offset)

        # Randomize friction
        friction_coeff = np.random.uniform(
            self.randomization_params['friction_range'][0],
            self.randomization_params['friction_range'][1]
        )
        self.set_friction_coefficient(robot, friction_coeff)

        # Randomize inertias
        inertia_scaling = np.random.uniform(
            self.randomization_params['inertia_scaling_range'][0],
            self.randomization_params['inertia_scaling_range'][1]
        )
        self.scale_inertias(robot, inertia_scaling)

    def randomize_actuator_properties(self, robot):
        """Randomize actuator properties"""
        # Randomize motor delays
        for joint in robot.joints:
            delay = np.random.uniform(
                self.randomization_params['motor_delay_range'][0],
                self.randomization_params['motor_delay_range'][1]
            )
            self.set_motor_delay(joint, delay)

        # Randomize motor noise
        for joint in robot.joints:
            noise_level = np.random.uniform(
                self.randomization_params['motor_noise_range'][0],
                self.randomization_params['motor_noise_range'][1]
            )
            self.set_motor_noise(joint, noise_level)

    def randomize_sensor_properties(self, robot):
        """Randomize sensor properties"""
        # Randomize camera properties
        for camera in robot.cameras:
            noise_level = np.random.uniform(
                self.randomization_params['camera_noise_range'][0],
                self.randomization_params['camera_noise_range'][1]
            )
            self.set_camera_noise(camera, noise_level)

        # Randomize IMU properties
        for imu in robot.imus:
            drift_rate = np.random.uniform(
                self.randomization_params['imu_drift_range'][0],
                self.randomization_params['imu_drift_range'][1]
            )
            self.set_imu_drift(imu, drift_rate)

            bias = np.random.uniform(
                self.randomization_params['sensor_bias_range'][0],
                self.randomization_params['sensor_bias_range'][1]
            )
            self.set_sensor_bias(imu, bias)

    def randomize_environment_properties(self):
        """Randomize environmental properties"""
        # Randomize gravity
        gravity = np.random.uniform(
            self.randomization_params['gravity_range'][0],
            self.randomization_params['gravity_range'][1]
        )
        self.set_gravity(gravity)

        # Randomize air resistance
        air_resistance = np.random.uniform(
            self.randomization_params['air_resistance_range'][0],
            self.randomization_params['air_resistance_range'][1]
        )
        self.set_air_resistance(air_resistance)

        # Randomize surface properties
        surface_roughness = np.random.uniform(
            self.randomization_params['surface_roughness_range'][0],
            self.randomization_params['surface_roughness_range'][1]
        )
        self.set_surface_roughness(surface_roughness)

    def apply_randomization(self, robot):
        """Apply all randomizations to the robot"""
        self.randomize_robot_properties(robot)
        self.randomize_actuator_properties(robot)
        self.randomize_sensor_properties(robot)
        self.randomize_environment_properties()

        # Store randomization parameters for later analysis
        self.store_randomization_parameters()

    def store_randomization_parameters(self):
        """Store current randomization parameters"""
        self.current_params = {}
        for param_name, param_range in self.randomization_params.items():
            if isinstance(param_range, list):
                self.current_params[param_name] = np.random.uniform(param_range[0], param_range[1])
            else:
                self.current_params[param_name] = param_range
```

### Advanced Randomization Techniques

#### Curriculum-based Domain Randomization
```python
class CurriculumDomainRandomizer:
    def __init__(self):
        self.stage = 0
        self.max_stages = 5

        # Define randomization ranges for each stage
        self.randomization_schedules = {
            'robot_mass_range': [(0.95, 1.05), (0.9, 1.1), (0.85, 1.15), (0.8, 1.2), (0.7, 1.3)],
            'friction_range': [(0.9, 1.1), (0.8, 1.2), (0.7, 1.3), (0.6, 1.4), (0.5, 1.5)],
            'sensor_noise_range': [(0.0, 0.005), (0.0, 0.01), (0.0, 0.015), (0.0, 0.02), (0.0, 0.025)],
            'motor_delay_range': [(0.001, 0.002), (0.001, 0.005), (0.001, 0.008), (0.001, 0.01), (0.001, 0.015)]
        }

    def advance_curriculum(self, performance_threshold=0.8):
        """Advance curriculum if performance is above threshold"""
        if self.current_performance >= performance_threshold and self.stage < self.max_stages - 1:
            self.stage += 1
            return True
        return False

    def get_current_randomization_params(self):
        """Get randomization parameters for current curriculum stage"""
        params = {}
        for param_name, schedules in self.randomization_schedules.items():
            if self.stage < len(schedules):
                params[param_name] = schedules[self.stage]
            else:
                params[param_name] = schedules[-1]  # Use final stage if beyond
        return params

    def randomize_with_curriculum(self, robot):
        """Apply randomization according to current curriculum stage"""
        current_params = self.get_current_randomization_params()

        # Temporarily store original parameters
        original_params = self.randomization_params.copy()

        # Update with current stage parameters
        self.randomization_params.update(current_params)

        # Apply randomization
        self.apply_randomization(robot)

        # Restore original parameters
        self.randomization_params = original_params
```

## Isaac Sim Implementation for Sim-to-Real

### Isaac Sim Domain Randomization

#### Advanced Isaac Sim Randomization
```python
import omni
import carb
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.prims import get_prim_at_path
from omni.isaac.core.robots import Robot
from omni.isaac.core.utils.semantics import add_semantics
import numpy as np

class IsaacSimDomainRandomizer:
    def __init__(self, world):
        self.world = world
        self.robot = None
        self.randomization_params = self.initialize_randomization_params()
        self.stage = 0

    def initialize_randomization_params(self):
        """Initialize Isaac Sim specific randomization parameters"""
        return {
            # Robot properties
            'robot_mass_range': [0.8, 1.2],
            'friction_range': [0.5, 1.5],
            'restitution_range': [0.0, 0.2],

            # Joint properties
            'joint_damping_range': [0.01, 0.1],
            'joint_friction_range': [0.0, 0.01],
            'joint_stiffness_range': [100, 1000],

            # Material properties
            'material_roughness_range': [0.0, 1.0],
            'material_metallic_range': [0.0, 1.0],
            'material_specular_range': [0.0, 1.0],

            # Environmental properties
            'gravity_range': [-10.2, -9.4],
            'wind_force_range': [0.0, 1.0],
            'temperature_range': [15, 35],  # Celsius

            # Sensor properties
            'camera_noise_range': [0.0, 0.02],
            'lidar_noise_range': [0.0, 0.01],
            'imu_noise_range': [0.0, 0.001]
        }

    def randomize_robot_mass(self, robot_prim_path):
        """Randomize robot mass properties"""
        robot_prim = get_prim_at_path(robot_prim_path)

        # Randomize mass for each link
        for link_path in self.get_robot_links(robot_prim_path):
            link_prim = get_prim_at_path(link_path)

            # Get current mass
            current_mass = self.get_link_mass(link_prim)

            # Apply randomization
            mass_multiplier = np.random.uniform(
                self.randomization_params['robot_mass_range'][0],
                self.randomization_params['robot_mass_range'][1]
            )
            new_mass = current_mass * mass_multiplier

            self.set_link_mass(link_prim, new_mass)

    def randomize_friction_properties(self, robot_prim_path):
        """Randomize friction properties"""
        robot_prim = get_prim_at_path(robot_prim_path)

        for link_path in self.get_robot_links(robot_prim_path):
            link_prim = get_prim_at_path(link_path)

            # Randomize static friction
            static_friction = np.random.uniform(
                self.randomization_params['friction_range'][0],
                self.randomization_params['friction_range'][1]
            )

            # Randomize dynamic friction
            dynamic_friction = np.random.uniform(
                self.randomization_params['friction_range'][0],
                self.randomization_params['friction_range'][1]
            )

            self.set_link_friction(link_prim, static_friction, dynamic_friction)

    def randomize_joint_properties(self, robot_prim_path):
        """Randomize joint properties"""
        robot_prim = get_prim_at_path(robot_prim_path)

        for joint_path in self.get_robot_joints(robot_prim_path):
            joint_prim = get_prim_at_path(joint_path)

            # Randomize damping
            damping = np.random.uniform(
                self.randomization_params['joint_damping_range'][0],
                self.randomization_params['joint_damping_range'][1]
            )
            self.set_joint_damping(joint_prim, damping)

            # Randomize friction
            friction = np.random.uniform(
                self.randomization_params['joint_friction_range'][0],
                self.randomization_params['joint_friction_range'][1]
            )
            self.set_joint_friction(joint_prim, friction)

            # Randomize stiffness
            stiffness = np.random.uniform(
                self.randomization_params['joint_stiffness_range'][0],
                self.randomization_params['joint_stiffness_range'][1]
            )
            self.set_joint_stiffness(joint_prim, stiffness)

    def randomize_material_properties(self, robot_prim_path):
        """Randomize material properties"""
        robot_prim = get_prim_at_path(robot_prim_path)

        for visual_path in self.get_robot_visual_meshes(robot_prim_path):
            material_path = f"{visual_path}/material"

            # Randomize roughness
            roughness = np.random.uniform(
                self.randomization_params['material_roughness_range'][0],
                self.randomization_params['material_roughness_range'][1]
            )

            # Randomize metallic
            metallic = np.random.uniform(
                self.randomization_params['material_metallic_range'][0],
                self.randomization_params['material_metallic_range'][1]
            )

            # Randomize specular
            specular = np.random.uniform(
                self.randomization_params['material_specular_range'][0],
                self.randomization_params['material_specular_range'][1]
            )

            self.set_material_properties(material_path, roughness, metallic, specular)

    def randomize_environment(self):
        """Randomize environmental properties"""
        # Randomize gravity
        gravity_magnitude = np.random.uniform(
            abs(self.randomization_params['gravity_range'][0]),
            abs(self.randomization_params['gravity_range'][1])
        )
        gravity_direction = np.array([0.0, 0.0, -gravity_magnitude])
        self.set_gravity(gravity_direction)

        # Randomize wind
        wind_force = np.random.uniform(
            self.randomization_params['wind_force_range'][0],
            self.randomization_params['wind_force_range'][1]
        )
        wind_direction = np.random.uniform(-1, 1, 3)
        wind_direction = wind_direction / np.linalg.norm(wind_direction)
        self.set_wind_force(wind_force, wind_direction)

        # Randomize temperature (affects material properties)
        temperature = np.random.uniform(
            self.randomization_params['temperature_range'][0],
            self.randomization_params['temperature_range'][1]
        )
        self.set_environment_temperature(temperature)

    def randomize_sensors(self, robot_prim_path):
        """Randomize sensor properties"""
        # Randomize camera properties
        for camera_path in self.get_robot_cameras(robot_prim_path):
            noise_level = np.random.uniform(
                self.randomization_params['camera_noise_range'][0],
                self.randomization_params['camera_noise_range'][1]
            )
            self.set_camera_noise(camera_path, noise_level)

        # Randomize LIDAR properties
        for lidar_path in self.get_robot_lidars(robot_prim_path):
            noise_level = np.random.uniform(
                self.randomization_params['lidar_noise_range'][0],
                self.randomization_params['lidar_noise_range'][1]
            )
            self.set_lidar_noise(lidar_path, noise_level)

        # Randomize IMU properties
        for imu_path in self.get_robot_imus(robot_prim_path):
            noise_level = np.random.uniform(
                self.randomization_params['imu_noise_range'][0],
                self.randomization_params['imu_noise_range'][1]
            )
            self.set_imu_noise(imu_path, noise_level)

    def apply_full_randomization(self, robot_prim_path):
        """Apply complete domain randomization"""
        # Apply all randomizations
        self.randomize_robot_mass(robot_prim_path)
        self.randomize_friction_properties(robot_prim_path)
        self.randomize_joint_properties(robot_prim_path)
        self.randomize_material_properties(robot_prim_path)
        self.randomize_environment()
        self.randomize_sensors(robot_prim_path)

    def get_robot_links(self, robot_prim_path):
        """Get all link paths for a robot"""
        # This would traverse the robot hierarchy to find all links
        # Implementation depends on robot structure
        links = []
        # ... implementation to find all links
        return links

    def get_robot_joints(self, robot_prim_path):
        """Get all joint paths for a robot"""
        # This would traverse the robot hierarchy to find all joints
        joints = []
        # ... implementation to find all joints
        return joints

    def get_robot_visual_meshes(self, robot_prim_path):
        """Get all visual mesh paths for a robot"""
        visual_meshes = []
        # ... implementation to find all visual meshes
        return visual_meshes

    def get_robot_cameras(self, robot_prim_path):
        """Get all camera paths for a robot"""
        cameras = []
        # ... implementation to find all cameras
        return cameras

    def get_robot_lidars(self, robot_prim_path):
        """Get all LIDAR paths for a robot"""
        lidars = []
        # ... implementation to find all LIDARs
        return lidars

    def get_robot_imus(self, robot_prim_path):
        """Get all IMU paths for a robot"""
        imus = []
        # ... implementation to find all IMUs
        return imus

    # Helper methods for setting properties (these would interface with Isaac Sim API)
    def get_link_mass(self, link_prim):
        """Get mass of a link"""
        # Interface with Isaac Sim to get mass
        pass

    def set_link_mass(self, link_prim, mass):
        """Set mass of a link"""
        # Interface with Isaac Sim to set mass
        pass

    def set_link_friction(self, link_prim, static_friction, dynamic_friction):
        """Set friction properties of a link"""
        # Interface with Isaac Sim to set friction
        pass

    def set_joint_damping(self, joint_prim, damping):
        """Set damping of a joint"""
        # Interface with Isaac Sim to set damping
        pass

    def set_joint_friction(self, joint_prim, friction):
        """Set friction of a joint"""
        # Interface with Isaac Sim to set joint friction
        pass

    def set_joint_stiffness(self, joint_prim, stiffness):
        """Set stiffness of a joint"""
        # Interface with Isaac Sim to set stiffness
        pass

    def set_material_properties(self, material_path, roughness, metallic, specular):
        """Set material properties"""
        # Interface with Isaac Sim to set material properties
        pass

    def set_gravity(self, gravity_vector):
        """Set gravity vector"""
        # Interface with Isaac Sim physics scene
        pass

    def set_wind_force(self, force_magnitude, direction):
        """Set wind force"""
        # Interface with Isaac Sim environment
        pass

    def set_environment_temperature(self, temperature):
        """Set environment temperature"""
        # Interface with Isaac Sim environment
        pass

    def set_camera_noise(self, camera_path, noise_level):
        """Set camera noise level"""
        # Interface with Isaac Sim camera
        pass

    def set_lidar_noise(self, lidar_path, noise_level):
        """Set LIDAR noise level"""
        # Interface with Isaac Sim LIDAR
        pass

    def set_imu_noise(self, imu_path, noise_level):
        """Set IMU noise level"""
        # Interface with Isaac Sim IMU
        pass
```

## System Identification and Parameter Estimation

### Real-World Parameter Estimation

#### Parameter Estimation for Dynamics Matching
```python
import scipy.optimize as opt
import control  # Python Control Systems Library
from scipy.signal import butter, filtfilt

class SystemIdentifier:
    def __init__(self, robot_model):
        self.robot_model = robot_model
        self.sim_model = robot_model.simulation_model
        self.real_data = []
        self.sim_data = []

    def collect_excitation_data(self, robot, excitation_signal, duration=10.0):
        """Collect data using designed excitation signal"""
        # Apply excitation signal to robot
        timestamps = []
        joint_positions = []
        joint_velocities = []
        joint_torques = []
        motor_currents = []

        start_time = robot.get_time()
        current_time = start_time

        while current_time - start_time < duration:
            # Apply excitation
            if hasattr(excitation_signal, '__call__'):
                command = excitation_signal(current_time - start_time)
            else:
                command = excitation_signal

            # Execute command
            robot.send_command(command)

            # Collect data
            timestamps.append(robot.get_time())
            joint_positions.append(robot.get_joint_positions())
            joint_velocities.append(robot.get_joint_velocities())
            joint_torques.append(robot.get_joint_torques())
            motor_currents.append(robot.get_motor_currents())

            current_time = robot.get_time()

        return {
            'timestamps': np.array(timestamps),
            'positions': np.array(joint_positions),
            'velocities': np.array(joint_velocities),
            'torques': np.array(joint_torques),
            'currents': np.array(motor_currents)
        }

    def estimate_inertial_parameters(self, excitation_data):
        """Estimate inertial parameters using least squares"""
        # Form regression matrix Y and parameter vector φ
        # Y(θ)φ = τ where θ are joint accelerations, φ are inertial parameters
        Y_matrix = self.form_regression_matrix(excitation_data)
        tau_vector = excitation_data['torques']

        # Solve for inertial parameters
        estimated_params = np.linalg.lstsq(Y_matrix, tau_vector, rcond=None)[0]

        return estimated_params

    def form_regression_matrix(self, excitation_data):
        """Form the regression matrix for inertial parameter estimation"""
        n_samples = len(excitation_data['timestamps'])
        n_joints = len(excitation_data['positions'][0])

        # Regression matrix dimensions: n_samples * n_joints x n_params
        Y = np.zeros((n_samples * n_joints, self.get_num_inertial_params()))

        for i in range(n_samples):
            q = excitation_data['positions'][i]
            q_dot = excitation_data['velocities'][i]
            q_ddot = self.compute_accelerations(excitation_data, i)

            # Fill regression matrix for each joint
            for j in range(n_joints):
                Y_row_start = i * n_joints + j
                Y[Y_row_start, :] = self.compute_inertial_regression_terms(q, q_dot, q_ddot, j)

        return Y

    def compute_accelerations(self, excitation_data, index):
        """Compute joint accelerations from position data"""
        if index == 0:
            # Forward difference for first point
            dt = excitation_data['timestamps'][1] - excitation_data['timestamps'][0]
            q_prev = excitation_data['positions'][index]
            q_next = excitation_data['positions'][index + 1]
            return (q_next - q_prev) / dt
        elif index == len(excitation_data['timestamps']) - 1:
            # Backward difference for last point
            dt = excitation_data['timestamps'][index] - excitation_data['timestamps'][index - 1]
            q_prev = excitation_data['positions'][index - 1]
            q_next = excitation_data['positions'][index]
            return (q_next - q_prev) / dt
        else:
            # Central difference for middle points
            dt = excitation_data['timestamps'][index + 1] - excitation_data['timestamps'][index - 1]
            q_prev = excitation_data['positions'][index - 1]
            q_next = excitation_data['positions'][index + 1]
            return (q_next - q_prev) / (2 * dt)

    def get_num_inertial_params(self):
        """Get number of inertial parameters for the robot"""
        # For each link: mass (1) + center of mass (3) + inertia (6) = 10 parameters
        # But due to symmetry, only 10 unique inertia parameters per link
        return self.robot_model.num_links * 10

    def compute_inertial_regression_terms(self, q, q_dot, q_ddot, joint_idx):
        """Compute regression terms for inertial parameter estimation"""
        # This is a simplified version - full implementation would be quite complex
        # and would depend on the specific robot kinematics
        terms = np.zeros(self.get_num_inertial_params())

        # Compute forward kinematics and Jacobians
        jacobian = self.compute_jacobian(q, joint_idx)
        jacobian_derivative = self.compute_jacobian_derivative(q, q_dot, joint_idx)

        # Form terms based on dynamic equations
        # τ = M(q)q_ddot + C(q,q_dot)q_dot + g(q)
        # where M is mass matrix, C is Coriolis matrix, g is gravity vector

        # This would require full dynamic model implementation
        # Simplified version for illustration:
        terms[0] = q_ddot[joint_idx]  # Mass term
        terms[1] = q_dot[joint_idx]**2  # Centrifugal term
        terms[2] = 1.0  # Gravity term

        return terms

    def estimate_friction_parameters(self, excitation_data):
        """Estimate friction parameters using velocity-based method"""
        # Coulomb + Viscous friction model: τ_friction = Fc * sign(ω) + Fv * ω
        velocities = excitation_data['velocities']
        torques = excitation_data['torques']

        friction_params = []

        for joint_idx in range(len(velocities[0])):
            joint_velocities = velocities[:, joint_idx]
            joint_torques = torques[:, joint_idx]

            # Remove driving torques to isolate friction
            # This requires knowledge of applied torques vs measured torques
            friction_torques = self.isolate_friction_torques(joint_torques, joint_velocities)

            # Estimate Coulomb and viscous friction
            coulomb, viscous = self.estimate_friction_model(joint_velocities, friction_torques)
            friction_params.append({'coulomb': coulomb, 'viscous': viscous})

        return friction_params

    def isolate_friction_torques(self, applied_torques, velocities):
        """Isolate friction torques from applied torques"""
        # This would require knowledge of the commanded torques
        # and subtraction of dynamic torques
        friction_torques = applied_torques.copy()

        # For very low velocities, torques are dominated by friction
        low_vel_indices = np.abs(velocities) < 0.01
        if np.any(low_vel_indices):
            friction_baseline = np.mean(applied_torques[low_vel_indices])
            friction_torques -= friction_baseline

        return friction_torques

    def estimate_friction_model(self, velocities, friction_torques):
        """Estimate Coulomb and viscous friction coefficients"""
        # Use least squares to fit: τ = Fc * sign(ω) + Fv * ω
        sign_velocities = np.sign(velocities)
        abs_velocities = np.abs(velocities)

        # Create regression matrix
        X = np.column_stack([sign_velocities, velocities])
        Y = friction_torques

        # Solve for parameters [F_coulomb, F_viscous]
        params = np.linalg.lstsq(X, Y, rcond=None)[0]

        return abs(params[0]), abs(params[1])  # Coulomb, Viscous

    def estimate_actuator_dynamics(self, excitation_data):
        """Estimate actuator dynamics (delays, bandwidth, etc.)"""
        # Apply step inputs and analyze response
        # Fit first or second order model to characterize dynamics
        command_timeseries = excitation_data.get('commands', np.zeros_like(excitation_data['timestamps']))
        response_timeseries = excitation_data['positions']

        # Identify time delays and system poles/zeros
        delay_estimate = self.estimate_delay(command_timeseries, response_timeseries)
        bandwidth_estimate = self.estimate_bandwidth(response_timeseries)

        return {
            'delay': delay_estimate,
            'bandwidth': bandwidth_estimate,
            'damping_ratio': self.estimate_damping(response_timeseries),
            'natural_frequency': self.estimate_natural_frequency(response_timeseries)
        }

    def estimate_delay(self, input_signal, output_signal):
        """Estimate time delay between input and output"""
        # Cross-correlation to find delay
        correlation = np.correlate(input_signal, output_signal, mode='full')
        lags = np.arange(-len(input_signal) + 1, len(output_signal))

        # Find peak of correlation
        peak_idx = np.argmax(correlation)
        delay_samples = lags[peak_idx]

        # Convert to time
        dt = 0.01  # Assume 100 Hz sampling
        return delay_samples * dt

    def estimate_bandwidth(self, signal):
        """Estimate system bandwidth from frequency response"""
        # Compute FFT
        fft = np.fft.fft(signal)
        freqs = np.fft.fftfreq(len(signal), d=0.01)  # 100 Hz sampling

        # Find frequency where response drops to -3dB
        magnitude = np.abs(fft)
        max_magnitude = np.max(magnitude)
        threshold = max_magnitude / np.sqrt(2)  # -3dB point

        # Find first frequency below threshold
        below_threshold = np.where(magnitude < threshold)[0]
        if len(below_threshold) > 0:
            bandwidth = freqs[below_threshold[0]]
        else:
            bandwidth = freqs[-1]  # Nyquist frequency

        return abs(bandwidth)

    def estimate_damping(self, signal):
        """Estimate damping ratio from oscillatory response"""
        # Analyze decay of oscillations
        peaks, properties = self.find_peaks_with_properties(signal)
        if len(peaks) < 2:
            return 0.0  # No oscillation observed

        # Calculate logarithmic decrement
        decrements = []
        for i in range(len(peaks) - 1):
            ratio = abs(signal[peaks[i]]) / abs(signal[peaks[i + 1]])
            decrement = np.log(ratio)
            decrements.append(decrement)

        mean_decrement = np.mean(decrements)
        damping_ratio = mean_decrement / np.sqrt((2 * np.pi)**2 + mean_decrement**2)

        return damping_ratio

    def estimate_natural_frequency(self, signal):
        """Estimate natural frequency from oscillation period"""
        peaks, properties = self.find_peaks_with_properties(signal)
        if len(peaks) < 2:
            return 0.0

        # Calculate average period
        periods = np.diff(peaks) * 0.01  # Convert samples to time (assuming 100 Hz)
        avg_period = np.mean(periods)
        natural_freq = 1.0 / avg_period

        return natural_freq

    def find_peaks_with_properties(self, signal):
        """Find peaks in signal with properties"""
        from scipy.signal import find_peaks
        peaks, properties = find_peaks(signal, height=np.std(signal) * 0.5)
        return peaks, properties

    def update_simulation_model(self, estimated_params):
        """Update simulation model with estimated parameters"""
        # Update inertial parameters
        self.update_inertial_parameters(estimated_params['inertial'])

        # Update friction parameters
        self.update_friction_parameters(estimated_params['friction'])

        # Update actuator dynamics
        self.update_actuator_dynamics(estimated_params['actuator'])

        # Update sensor models
        self.update_sensor_models(estimated_params['sensors'])

    def update_inertial_parameters(self, inertial_params):
        """Update simulation with estimated inertial parameters"""
        # This would modify the URDF/SDF model with new parameters
        pass

    def update_friction_parameters(self, friction_params):
        """Update simulation with estimated friction parameters"""
        # Modify friction coefficients in simulation
        pass

    def update_actuator_dynamics(self, actuator_params):
        """Update simulation with estimated actuator dynamics"""
        # Add delay elements, adjust bandwidth, etc.
        pass

    def update_sensor_models(self, sensor_params):
        """Update simulation with estimated sensor characteristics"""
        # Adjust noise models, delays, biases
        pass
```

## Sensor Calibration and Alignment

### Multi-Sensor Calibration

#### Camera-LiDAR-IMU Calibration
```python
import cv2
import numpy as np
from scipy.spatial.transform import Rotation as R
from scipy.optimize import minimize

class MultiSensorCalibrator:
    def __init__(self):
        self.camera_intrinsics = None
        self.lidar_extrinsics = None  # LiDAR to camera transformation
        self.imu_extrinsics = None   # IMU to camera transformation
        self.calibration_targets = []

    def calibrate_camera_intrinsics(self, calibration_images, pattern_size=(8, 6)):
        """Calibrate camera intrinsic parameters"""
        # Prepare object points
        objp = np.zeros((pattern_size[0] * pattern_size[1], 3), np.float32)
        objp[:, :2] = np.mgrid[0:pattern_size[0], 0:pattern_size[1]].T.reshape(-1, 2)

        # Arrays to store object points and image points from all images
        objpoints = []  # 3d points in real world space
        imgpoints = []  # 2d points in image plane

        for img in calibration_images:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # Find chessboard corners
            ret, corners = cv2.findChessboardCorners(gray, pattern_size, None)

            if ret:
                objpoints.append(objp)
                refined_corners = cv2.cornerSubPix(
                    gray, corners, (11, 11), (-1, -1),
                    criteria=(cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
                )
                imgpoints.append(refined_corners)

        if len(objpoints) > 0:
            ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera(
                objpoints, imgpoints, gray.shape[::-1], None, None
            )

            self.camera_intrinsics = {
                'matrix': mtx,
                'distortion': dist,
                'rotation_vectors': rvecs,
                'translation_vectors': tvecs
            }

            return ret, mtx, dist
        else:
            return False, None, None

    def calibrate_camera_lidar_extrinsics(self, camera_images, lidar_scans, calibration_board):
        """Calibrate camera-LiDAR extrinsics using calibration board"""
        # Detect calibration board in camera images
        camera_corners = []
        lidar_points = []

        for cam_img, lidar_scan in zip(camera_images, lidar_scans):
            # Detect calibration board in camera
            gray = cv2.cvtColor(cam_img, cv2.COLOR_BGR2GRAY)
            ret, corners = cv2.findChessboardCorners(
                gray, calibration_board.pattern_size, None
            )

            if ret:
                # Refine corner detection
                corners = cv2.cornerSubPix(
                    gray, corners, (11, 11), (-1, -1),
                    criteria=(cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
                )

                # Find corresponding points in LiDAR data
                # This requires identifying the calibration board in LiDAR scan
                lidar_board_points = self.find_calibration_board_in_lidar(lidar_scan)

                if lidar_board_points is not None:
                    camera_corners.append(corners.reshape(-1, 2))
                    lidar_points.append(lidar_board_points)

        if len(camera_corners) > 0 and len(lidar_points) > 0:
            # Estimate transformation using PnP
            obj_points = self.create_object_points(calibration_board.pattern_size)
            rvec, tvec = self.estimate_pnp_multi_view(
                camera_corners, lidar_points, self.camera_intrinsics['matrix']
            )

            # Convert to transformation matrix
            rotation_matrix = cv2.Rodrigues(rvec)[0]
            transform_matrix = np.eye(4)
            transform_matrix[:3, :3] = rotation_matrix
            transform_matrix[:3, 3] = tvec.flatten()

            self.lidar_extrinsics = transform_matrix
            return transform_matrix
        else:
            return None

    def find_calibration_board_in_lidar(self, lidar_scan):
        """Find calibration board in LiDAR scan"""
        # This is a simplified approach - in practice, this is quite complex
        # Look for planar surface with known dimensions
        points = np.array(lidar_scan.points)

        # Use RANSAC to find plane
        plane_model, inliers = self.fit_plane_ransac(points)

        if plane_model is not None:
            # Extract points on the plane
            plane_points = points[inliers]

            # Check if plane has appropriate size for calibration board
            if self.is_appropriate_size(plane_points):
                return plane_points

        return None

    def fit_plane_ransac(self, points, distance_threshold=0.01, max_iterations=1000):
        """Fit plane to points using RANSAC"""
        from sklearn.linear_model import RANSACRegressor
        from sklearn.preprocessing import PolynomialFeatures

        # Use RANSAC to fit plane: ax + by + cz + d = 0
        ransac = RANSACRegressor(
            residual_threshold=distance_threshold,
            max_trials=max_iterations
        )

        X = points[:, :2]  # x, y coordinates
        y = points[:, 2]   # z coordinate

        try:
            ransac.fit(X, y)
            inlier_mask = ransac.inlier_mask_

            # Extract plane parameters: ax + by + cz + d = 0
            a, b = ransac.estimator_.coef_
            d = ransac.estimator_.intercept_
            c = -1  # Since z = ax + by + d => ax + by - z + d = 0

            plane_model = np.array([a, b, c, d])
            inliers = np.where(inlier_mask)[0]

            return plane_model, inliers
        except:
            return None, np.array([])

    def is_appropriate_size(self, plane_points, expected_size=(0.1, 0.07)):  # Chessboard size
        """Check if plane has appropriate size for calibration board"""
        if len(plane_points) < 4:
            return False

        # Calculate bounding box
        min_coords = np.min(plane_points, axis=0)
        max_coords = np.max(plane_points, axis=0)
        size = max_coords - min_coords

        # Check if size is close to expected size
        size_diff = np.abs(size[:2] - expected_size)
        return np.all(size_diff < 0.02)  # Allow 2cm tolerance

    def calibrate_imu_extrinsics(self, imu_data, visual_odometry_data):
        """Calibrate IMU extrinsics using visual-inertial alignment"""
        # Align IMU and visual odometry data temporally
        aligned_imu, aligned_vo = self.temporal_alignment(imu_data, visual_odometry_data)

        # Estimate transformation that minimizes discrepancy
        # between IMU-predicted motion and visual motion
        transformation = self.align_imu_visual_motion(aligned_imu, aligned_vo)

        self.imu_extrinsics = transformation
        return transformation

    def temporal_alignment(self, imu_data, vo_data):
        """Align IMU and visual odometry data temporally"""
        # Synchronize timestamps
        imu_ts = np.array([d['timestamp'] for d in imu_data])
        vo_ts = np.array([d['timestamp'] for d in vo_data])

        # Interpolate to common time base
        common_ts = np.linspace(max(imu_ts[0], vo_ts[0]), min(imu_ts[-1], vo_ts[-1]), 1000)

        # Interpolate IMU data
        imu_interp = self.interpolate_sensor_data(imu_data, common_ts)
        vo_interp = self.interpolate_sensor_data(vo_data, common_ts)

        return imu_interp, vo_interp

    def interpolate_sensor_data(self, sensor_data, target_timestamps):
        """Interpolate sensor data to target timestamps"""
        # Extract values and timestamps
        timestamps = np.array([d['timestamp'] for d in sensor_data])
        values = np.array([d['values'] for d in sensor_data])

        # Interpolate each dimension separately
        interpolated = np.zeros((len(target_timestamps), values.shape[1]))
        for i in range(values.shape[1]):
            interpolated[:, i] = np.interp(target_timestamps, timestamps, values[:, i])

        # Create result structure
        result = []
        for ts, vals in zip(target_timestamps, interpolated):
            result.append({'timestamp': ts, 'values': vals})

        return result

    def align_imu_visual_motion(self, imu_data, vo_data):
        """Align IMU and visual odometry motion data"""
        # Integrate IMU data to get predicted pose
        imu_poses = self.integrate_imu_to_poses(imu_data)

        # Get visual odometry poses
        vo_poses = [d['pose'] for d in vo_data]

        # Find transformation that minimizes difference
        def error_function(transform_params):
            # Convert parameters to transformation matrix
            T = self.params_to_transform(transform_params)

            # Transform IMU poses
            transformed_imu = [T @ pose for pose in imu_poses]

            # Calculate error
            error = 0
            for imu_pose, vo_pose in zip(transformed_imu, vo_poses):
                # Position error
                pos_error = np.linalg.norm(imu_pose[:3, 3] - vo_pose[:3, 3])
                # Rotation error (using quaternion distance)
                rot_error = self.rotation_distance(imu_pose[:3, :3], vo_pose[:3, :3])
                error += pos_error + rot_error

            return error

        # Optimize transformation
        initial_guess = np.zeros(6)  # [x, y, z, rx, ry, rz]
        result = minimize(error_function, initial_guess, method='BFGS')

        return self.params_to_transform(result.x)

    def integrate_imu_to_poses(self, imu_data):
        """Integrate IMU data to get poses"""
        poses = []
        current_pose = np.eye(4)  # Start at identity
        current_velocity = np.zeros(3)

        for i in range(1, len(imu_data)):
            dt = imu_data[i]['timestamp'] - imu_data[i-1]['timestamp']

            # Get IMU measurements
            accel = np.array(imu_data[i-1]['values'][:3])  # Linear acceleration
            gyro = np.array(imu_data[i-1]['values'][3:])   # Angular velocity

            # Integrate acceleration to get velocity
            current_velocity += accel * dt

            # Integrate velocity to get position
            position_delta = current_velocity * dt
            current_pose[:3, 3] += position_delta

            # Integrate angular velocity to get rotation
            rotation_vector = gyro * dt
            rotation_matrix = cv2.Rodrigues(rotation_vector.reshape(3,))[0]
            current_pose[:3, :3] = current_pose[:3, :3] @ rotation_matrix

            poses.append(current_pose.copy())

        return poses

    def params_to_transform(self, params):
        """Convert 6-parameter vector to 4x4 transformation matrix"""
        x, y, z, rx, ry, rz = params

        # Create rotation matrix from axis-angle
        angle = np.linalg.norm([rx, ry, rz])
        if angle > 1e-6:
            axis = np.array([rx, ry, rz]) / angle
            rotation_matrix = self.axis_angle_to_rotation_matrix(axis, angle)
        else:
            rotation_matrix = np.eye(3)

        # Create transformation matrix
        transform = np.eye(4)
        transform[:3, :3] = rotation_matrix
        transform[:3, 3] = [x, y, z]

        return transform

    def axis_angle_to_rotation_matrix(self, axis, angle):
        """Convert axis-angle representation to rotation matrix"""
        axis = axis / np.linalg.norm(axis)
        x, y, z = axis
        c = np.cos(angle)
        s = np.sin(angle)
        C = 1 - c

        rotation_matrix = np.array([
            [x*x*C + c, x*y*C - z*s, x*z*C + y*s],
            [y*x*C + z*s, y*y*C + c, y*z*C - x*s],
            [z*x*C - y*s, z*y*C + x*s, z*z*C + c]
        ])

        return rotation_matrix

    def rotation_distance(self, R1, R2):
        """Calculate distance between two rotation matrices"""
        # Use rotation matrix logarithm to get rotation angle
        R_rel = R1.T @ R2
        trace = np.trace(R_rel)
        angle = np.arccos(np.clip((trace - 1) / 2, -1, 1))
        return angle

    def create_object_points(self, pattern_size, square_size=0.025):
        """Create object points for calibration pattern"""
        objp = np.zeros((pattern_size[0] * pattern_size[1], 3), np.float32)
        objp[:, :2] = np.mgrid[0:pattern_size[0], 0:pattern_size[1]].T.reshape(-1, 2)
        objp *= square_size
        return objp

    def estimate_pnp_multi_view(self, image_points_list, object_points_list, camera_matrix):
        """Estimate PnP across multiple views"""
        all_rvecs = []
        all_tvecs = []

        for img_points, obj_points in zip(image_points_list, object_points_list):
            # Estimate pose for each view
            ret, rvec, tvec = cv2.solvePnP(
                obj_points.reshape(-1, 1, 3),
                img_points.reshape(-1, 1, 2),
                camera_matrix,
                None
            )
            if ret:
                all_rvecs.append(rvec)
                all_tvecs.append(tvec)

        # Average the results
        if all_rvecs:
            avg_rvec = np.mean(all_rvecs, axis=0)
            avg_tvec = np.mean(all_tvecs, axis=0)
            return avg_rvec, avg_tvec

        return None, None
```

## Isaac ROS Integration for Calibrated Systems

### Sensor Fusion and Calibration Pipeline

#### Isaac ROS Calibration Node
```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, PointCloud2, Imu, JointState
from geometry_msgs.msg import TransformStamped
from tf2_ros import TransformBroadcaster
import numpy as np
import cv2
from cv_bridge import CvBridge
from scipy.spatial.transform import Rotation as R

class IsaacROSCalibrationNode(Node):
    def __init__(self):
        super().__init__('isaac_ros_calibration')

        # Initialize calibration components
        self.multi_calibrator = MultiSensorCalibrator()
        self.system_identifier = SystemIdentifier()

        # TF broadcaster for calibrated transforms
        self.tf_broadcaster = TransformBroadcaster(self)

        # CV bridge for image processing
        self.cv_bridge = CvBridge()

        # Calibration state
        self.is_calibrating = False
        self.calibration_data = {
            'images': [],
            'lidar_scans': [],
            'imu_data': [],
            'joint_states': []
        }

        # Publishers and subscribers
        self.setup_subscriptions()
        self.setup_publishers()

        # Calibration timer
        self.calibration_timer = self.create_timer(0.1, self.calibration_callback)

    def setup_subscriptions(self):
        """Setup sensor data subscriptions"""
        self.camera_subscription = self.create_subscription(
            Image,
            '/camera/rgb/image_raw',
            self.camera_callback,
            10
        )

        self.lidar_subscription = self.create_subscription(
            PointCloud2,
            '/lidar/points',
            self.lidar_callback,
            10
        )

        self.imu_subscription = self.create_subscription(
            Imu,
            '/imu/data',
            self.imu_callback,
            10
        )

        self.joint_subscription = self.create_subscription(
            JointState,
            '/joint_states',
            self.joint_callback,
            10
        )

    def setup_publishers(self):
        """Setup publishers for calibrated data"""
        # Calibrated sensor data publishers
        # Calibrated transform publishers
        pass

    def camera_callback(self, msg):
        """Process camera data for calibration"""
        if self.is_calibrating:
            try:
                cv_image = self.cv_bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')
                self.calibration_data['images'].append(cv_image)

                # Store timestamp for temporal alignment
                self.calibration_data['image_timestamps'].append(msg.header.stamp.sec + msg.header.stamp.nanosec * 1e-9)
            except Exception as e:
                self.get_logger().error(f'Error processing camera data: {str(e)}')

    def lidar_callback(self, msg):
        """Process LiDAR data for calibration"""
        if self.is_calibrating:
            try:
                # Convert PointCloud2 to numpy array
                lidar_points = self.pointcloud2_to_array(msg)
                self.calibration_data['lidar_scans'].append(lidar_points)

                # Store timestamp
                self.calibration_data['lidar_timestamps'].append(msg.header.stamp.sec + msg.header.stamp.nanosec * 1e-9)
            except Exception as e:
                self.get_logger().error(f'Error processing LiDAR data: {str(e)}')

    def imu_callback(self, msg):
        """Process IMU data for calibration"""
        if self.is_calibrating:
            try:
                imu_sample = {
                    'timestamp': msg.header.stamp.sec + msg.header.stamp.nanosec * 1e-9,
                    'linear_acceleration': [
                        msg.linear_acceleration.x,
                        msg.linear_acceleration.y,
                        msg.linear_acceleration.z
                    ],
                    'angular_velocity': [
                        msg.angular_velocity.x,
                        msg.angular_velocity.y,
                        msg.angular_velocity.z
                    ],
                    'orientation': [
                        msg.orientation.x,
                        msg.orientation.y,
                        msg.orientation.z,
                        msg.orientation.w
                    ]
                }
                self.calibration_data['imu_data'].append(imu_sample)
            except Exception as e:
                self.get_logger().error(f'Error processing IMU data: {str(e)}')

    def joint_callback(self, msg):
        """Process joint state data for calibration"""
        if self.is_calibrating:
            try:
                joint_sample = {
                    'timestamp': msg.header.stamp.sec + msg.header.stamp.nanosec * 1e-9,
                    'position': list(msg.position),
                    'velocity': list(msg.velocity),
                    'effort': list(msg.effort)
                }
                self.calibration_data['joint_states'].append(joint_sample)
            except Exception as e:
                self.get_logger().error(f'Error processing joint data: {str(e)}')

    def start_calibration_procedure(self):
        """Start the calibration procedure"""
        self.get_logger().info('Starting calibration procedure...')
        self.is_calibrating = True
        self.calibration_data = {
            'images': [],
            'lidar_scans': [],
            'imu_data': [],
            'joint_states': [],
            'image_timestamps': [],
            'lidar_timestamps': [],
            'imu_timestamps': [],
            'joint_timestamps': []
        }

        # Collect data for specified duration
        self.collection_duration = 30.0  # seconds
        self.start_time = self.get_clock().now().seconds_nanoseconds()[0]

    def calibration_callback(self):
        """Main calibration callback"""
        if not self.is_calibrating:
            return

        current_time = self.get_clock().now().seconds_nanoseconds()[0]

        # Check if we have collected enough data
        collection_time = current_time - self.start_time
        if collection_time >= self.collection_duration:
            self.perform_calibration()
            self.is_calibrating = False
            self.get_logger().info('Calibration completed!')
            return

        # Provide feedback on data collection progress
        if len(self.calibration_data['images']) % 100 == 0:
            self.get_logger().info(f'Collected {len(self.calibration_data["images"])} images for calibration')

    def perform_calibration(self):
        """Perform the actual calibration"""
        try:
            # Step 1: Camera intrinsic calibration
            self.get_logger().info('Calibrating camera intrinsics...')
            ret, camera_matrix, distortion_coeffs = self.multi_calibrator.calibrate_camera_intrinsics(
                self.calibration_data['images']
            )

            if ret:
                self.get_logger().info('Camera intrinsic calibration successful')
                self.publish_camera_calibration(camera_matrix, distortion_coeffs)
            else:
                self.get_logger().error('Camera intrinsic calibration failed')
                return

            # Step 2: Multi-sensor extrinsic calibration
            self.get_logger().info('Calibrating multi-sensor extrinsics...')

            # Calibrate camera-LiDAR extrinsics
            if len(self.calibration_data['images']) > 10 and len(self.calibration_data['lidar_scans']) > 10:
                lidar_to_camera = self.multi_calibrator.calibrate_camera_lidar_extrinsics(
                    self.calibration_data['images'],
                    self.calibration_data['lidar_scans'],
                    calibration_board=None  # Need to define calibration board
                )

                if lidar_to_camera is not None:
                    self.get_logger().info('Camera-LiDAR extrinsic calibration successful')
                    self.publish_transform('lidar_frame', 'camera_frame', lidar_to_camera)
                else:
                    self.get_logger().warning('Camera-LiDAR extrinsic calibration failed')

            # Step 3: System identification
            self.get_logger().info('Performing system identification...')

            # Collect excitation data for system identification
            excitation_data = self.prepare_excitation_data()
            if excitation_data is not None:
                # Estimate dynamic parameters
                estimated_params = self.system_identifier.estimate_inertial_parameters(excitation_data)

                if estimated_params is not None:
                    self.get_logger().info('System identification successful')
                    self.apply_system_identification_results(estimated_params)
                else:
                    self.get_logger().warning('System identification failed')

            # Step 4: Publish calibration results
            self.publish_calibration_results()

        except Exception as e:
            self.get_logger().error(f'Calibration procedure failed: {str(e)}')

    def prepare_excitation_data(self):
        """Prepare data for system identification"""
        # This would involve applying known excitation signals
        # and collecting the resulting sensor data
        # For now, return the collected joint state data
        if not self.calibration_data['joint_states']:
            return None

        # Organize data for system identification
        excitation_data = {
            'timestamps': [s['timestamp'] for s in self.calibration_data['joint_states']],
            'positions': np.array([s['position'] for s in self.calibration_data['joint_states']]),
            'velocities': np.array([s['velocity'] for s in self.calibration_data['joint_states']]),
            'torques': np.array([s['effort'] for s in self.calibration_data['joint_states']])
        }

        return excitation_data

    def apply_system_identification_results(self, estimated_params):
        """Apply system identification results to simulation"""
        # This would update the simulation model with identified parameters
        # For Isaac Sim, this might involve updating USD files or simulation parameters
        self.get_logger().info(f'Applied system identification results: {len(estimated_params)} parameters updated')

    def publish_camera_calibration(self, camera_matrix, distortion_coeffs):
        """Publish camera calibration parameters"""
        # This would publish calibration parameters to appropriate topics
        # or update camera info in ROS
        self.get_logger().info('Published camera calibration parameters')

    def publish_transform(self, parent_frame, child_frame, transform_matrix):
        """Publish static transform between frames"""
        t = TransformStamped()

        t.header.stamp = self.get_clock().now().to_msg()
        t.header.frame_id = parent_frame
        t.child_frame_id = child_frame

        # Convert 4x4 transform matrix to translation and rotation
        translation = transform_matrix[:3, 3]
        rotation_matrix = transform_matrix[:3, :3]

        # Convert rotation matrix to quaternion
        r = R.from_matrix(rotation_matrix)
        quat = r.as_quat()  # [x, y, z, w]

        t.transform.translation.x = float(translation[0])
        t.transform.translation.y = float(translation[1])
        t.transform.translation.z = float(translation[2])

        t.transform.rotation.x = float(quat[0])
        t.transform.rotation.y = float(quat[1])
        t.transform.rotation.z = float(quat[2])
        t.transform.rotation.w = float(quat[3])

        self.tf_broadcaster.sendTransform(t)

    def publish_calibration_results(self):
        """Publish all calibration results"""
        # Publish all calibration transforms
        # Update simulation parameters
        # Save calibration to file
        self.get_logger().info('All calibration results published')

    def pointcloud2_to_array(self, msg):
        """Convert PointCloud2 message to numpy array"""
        # This would use pcl or similar to convert PointCloud2 to numpy array
        # For now, return empty array
        return np.array([])

def main(args=None):
    rclpy.init(args=args)

    calibration_node = IsaacROSCalibrationNode()

    try:
        rclpy.spin(calibration_node)
    except KeyboardInterrupt:
        pass
    finally:
        calibration_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Advanced Transfer Techniques

### Domain Adaptation and Transfer Learning

#### Adversarial Domain Adaptation
```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

class DomainAdversarialNetwork(nn.Module):
    def __init__(self, input_dim, feature_dim, num_classes, num_domains):
        super(DomainAdversarialNetwork, self).__init__()

        # Feature extractor
        self.feature_extractor = nn.Sequential(
            nn.Linear(input_dim, 512),
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, feature_dim),
            nn.ReLU()
        )

        # Task-specific classifier
        self.classifier = nn.Sequential(
            nn.Linear(feature_dim, 128),
            nn.ReLU(),
            nn.Linear(128, num_classes)
        )

        # Domain discriminator
        self.domain_discriminator = nn.Sequential(
            nn.Linear(feature_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, num_domains),
            nn.Softmax(dim=1)
        )

    def forward(self, x, alpha=1.0):
        """Forward pass with gradient reversal"""
        features = self.feature_extractor(x)

        # Reverse gradients for domain adaptation
        reversed_features = GradReverse.apply(features, alpha)

        class_output = self.classifier(features)
        domain_output = self.domain_discriminator(reversed_features)

        return class_output, domain_output

class GradReverse(torch.autograd.Function):
    """Gradient reversal layer"""
    @staticmethod
    def forward(ctx, input_, alpha):
        ctx.alpha = alpha
        output = input_
        return output

    @staticmethod
    def backward(ctx, grad_output):
        output = grad_output.neg() * ctx.alpha
        return output, None

class DomainAdaptationTrainer:
    def __init__(self, model, learning_rate=1e-4):
        self.model = model
        self.classifier_criterion = nn.CrossEntropyLoss()
        self.domain_criterion = nn.CrossEntropyLoss()

        # Separate optimizers
        self.feature_optimizer = optim.Adam(
            list(model.feature_extractor.parameters()) + list(model.classifier.parameters()),
            lr=learning_rate
        )
        self.domain_optimizer = optim.Adam(
            model.domain_discriminator.parameters(),
            lr=learning_rate
        )

        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)

    def train_epoch(self, sim_loader, real_loader, epoch):
        """Train for one epoch with domain adaptation"""
        self.model.train()

        sim_iter = iter(sim_loader)
        real_iter = iter(real_loader)

        num_batches = min(len(sim_loader), len(real_loader))

        total_loss = 0
        total_class_loss = 0
        total_domain_loss = 0

        for i in range(num_batches):
            try:
                # Get batches
                sim_batch = next(sim_iter)
                real_batch = next(real_iter)

                # Move to device
                sim_data, sim_labels = sim_batch
                real_data, real_labels = real_batch

                sim_data, sim_labels = sim_data.to(self.device), sim_labels.to(self.device)
                real_data, real_labels = real_data.to(self.device), real_labels.to(self.device)

                # Combine batches
                combined_data = torch.cat([sim_data, real_data], dim=0)
                combined_labels = torch.cat([sim_labels, real_labels], dim=0)

                # Create domain labels (0 for sim, 1 for real)
                domain_labels = torch.cat([
                    torch.zeros(sim_data.size(0), dtype=torch.long),
                    torch.ones(real_data.size(0), dtype=torch.long)
                ]).to(self.device)

                # Train domain discriminator more frequently
                for _ in range(2):
                    self.domain_optimizer.zero_grad()

                    # Set alpha for gradient reversal (increase with training)
                    p = float(i + epoch * num_batches) / (10.0 * num_batches)
                    alpha = 2. / (1. + np.exp(-10 * p)) - 1

                    _, domain_pred = self.model(combined_data, alpha)
                    domain_loss = self.domain_criterion(domain_pred, domain_labels)

                    domain_loss.backward()
                    self.domain_optimizer.step()

                # Train feature extractor and classifier
                self.feature_optimizer.zero_grad()

                class_pred, domain_pred = self.model(combined_data, alpha)

                # Classification loss on labeled data only (simulated data)
                class_loss = self.classifier_criterion(class_pred[:sim_data.size(0)], sim_labels)

                # Domain confusion loss (want to fool discriminator)
                domain_loss_adv = self.domain_criterion(domain_pred, 1 - domain_labels)  # Flip labels

                # Total loss
                total_batch_loss = class_loss + 0.1 * domain_loss_adv

                total_batch_loss.backward()
                self.feature_optimizer.step()

                total_loss += total_batch_loss.item()
                total_class_loss += class_loss.item()
                total_domain_loss += domain_loss_adv.item()

            except StopIteration:
                break

        avg_loss = total_loss / num_batches
        avg_class_loss = total_class_loss / num_batches
        avg_domain_loss = total_domain_loss / num_batches

        return avg_loss, avg_class_loss, avg_domain_loss

    def evaluate(self, test_loader):
        """Evaluate the model on test data"""
        self.model.eval()
        correct = 0
        total = 0

        with torch.no_grad():
            for data, labels in test_loader:
                data, labels = data.to(self.device), labels.to(self.device)
                class_pred, _ = self.model(data)
                _, predicted = torch.max(class_pred.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()

        accuracy = 100 * correct / total
        return accuracy
```

### Meta-Learning for Rapid Adaptation

#### MAML for Sim-to-Real Transfer
```python
import torch
import torch.nn as nn
import torch.optim as optim

class MAMLAgent(nn.Module):
    def __init__(self, policy_network, meta_lr=0.001, inner_lr=0.01):
        super(MAMLAgent, self).__init__()
        self.policy = policy_network
        self.meta_lr = meta_lr
        self.inner_lr = inner_lr

        # Meta optimizer
        self.meta_optimizer = optim.Adam(self.parameters(), lr=meta_lr)

    def forward(self, x):
        return self.policy(x)

    def adapt(self, support_data, num_steps=5):
        """Adapt to new environment using support data"""
        # Create a copy of current parameters
        adapted_params = dict(self.named_parameters())

        for step in range(num_steps):
            # Forward pass on support data
            support_states, support_actions = support_data
            predictions = self.policy(support_states)

            # Compute loss
            loss = nn.MSELoss()(predictions, support_actions)

            # Compute gradients
            grads = torch.autograd.grad(loss, adapted_params.values(), create_graph=True)

            # Update adapted parameters
            adapted_params = {
                name: param - self.inner_lr * grad
                for ((name, param), grad) in zip(adapted_params.items(), grads)
            }

        return adapted_params

    def forward_with_params(self, x, params):
        """Forward pass with specific parameters"""
        # This would require implementing a functional version of the network
        # For now, we'll just return the normal forward pass
        return self.policy(x)

    def meta_update(self, query_losses):
        """Perform meta-update step"""
        self.meta_optimizer.zero_grad()

        # Sum query losses
        total_loss = sum(query_losses)
        total_loss.backward()

        self.meta_optimizer.step()

class MAMLTrainer:
    def __init__(self, agent, num_inner_steps=5):
        self.agent = agent
        self.num_inner_steps = num_inner_steps

    def train_meta_batch(self, tasks_batch):
        """Train on a batch of tasks"""
        meta_losses = []

        for task in tasks_batch:
            # Split task into support and query sets
            support_data = task['support']
            query_data = task['query']

            # Adapt to task using support data
            adapted_params = self.agent.adapt(support_data, self.num_inner_steps)

            # Evaluate on query data
            query_states, query_actions = query_data
            query_predictions = self.agent.forward_with_params(query_states, adapted_params)

            query_loss = nn.MSELoss()(query_predictions, query_actions)
            meta_losses.append(query_loss)

        # Meta update
        self.agent.meta_update(meta_losses)

    def adapt_to_new_task(self, new_task_support_data):
        """Adapt agent to a new task using support data"""
        adapted_params = self.agent.adapt(new_task_support_data)
        return adapted_params
```

## Validation and Performance Assessment

### Transfer Performance Metrics

#### Comprehensive Transfer Evaluation
```python
class TransferEvaluator:
    def __init__(self, sim_env, real_env):
        self.sim_env = sim_env
        self.real_env = real_env

        # Performance metrics
        self.metrics = {
            'success_rate': [],
            'task_completion_time': [],
            'tracking_accuracy': [],
            'energy_efficiency': [],
            'robustness': [],
            'generalization': []
        }

    def evaluate_policy_transfer(self, policy, num_episodes=10):
        """Comprehensive evaluation of policy transfer"""
        print("Evaluating policy transfer from simulation to reality...")

        # Test on simulation first (baseline)
        sim_results = self.evaluate_on_environment(policy, self.sim_env, num_episodes)
        print(f"Simulation performance - Success: {sim_results['success_rate']:.2f}, "
              f"Time: {sim_results['avg_completion_time']:.2f}s")

        # Test on real robot
        real_results = self.evaluate_on_environment(policy, self.real_env, num_episodes)
        print(f"Real robot performance - Success: {real_results['success_rate']:.2f}, "
              f"Time: {real_results['avg_completion_time']:.2f}s")

        # Calculate transfer metrics
        transfer_metrics = self.calculate_transfer_metrics(sim_results, real_results)

        print(f"Transfer Success Rate: {transfer_metrics['success_transfer']:.2f}")
        print(f"Performance Drop: {transfer_metrics['performance_drop']:.2f}")
        print(f"Transfer Gap: {transfer_metrics['transfer_gap']:.2f}")

        return transfer_metrics

    def evaluate_on_environment(self, policy, env, num_episodes):
        """Evaluate policy on specific environment"""
        results = {
            'success_rate': 0,
            'avg_completion_time': 0,
            'avg_tracking_error': 0,
            'avg_energy_consumption': 0,
            'episode_times': [],
            'successes': [],
            'tracking_errors': [],
            'energy_consumptions': []
        }

        total_successes = 0
        total_time = 0
        total_error = 0
        total_energy = 0

        for episode in range(num_episodes):
            state = env.reset()
            episode_time = 0
            episode_error = 0
            episode_energy = 0
            episode_steps = 0
            success = False

            while episode_steps < 1000:  # Max steps per episode
                # Get action from policy
                action = policy.get_action(state)

                # Take action in environment
                next_state, reward, done, info = env.step(action)

                # Calculate metrics
                episode_time += env.dt  # Assuming environment has time step
                episode_error += self.calculate_tracking_error(state, info.get('desired_state', state))
                episode_energy += self.calculate_energy_consumption(action)

                if info.get('success', False):
                    success = True
                    break

                if done:
                    break

                state = next_state
                episode_steps += 1

            # Accumulate episode results
            total_successes += int(success)
            total_time += episode_time
            total_error += episode_error / max(episode_steps, 1)
            total_energy += episode_energy

            results['episode_times'].append(episode_time)
            results['successes'].append(success)
            results['tracking_errors'].append(episode_error / max(episode_steps, 1))
            results['energy_consumptions'].append(episode_energy)

        # Calculate averages
        results['success_rate'] = total_successes / num_episodes
        results['avg_completion_time'] = total_time / num_episodes
        results['avg_tracking_error'] = total_error / num_episodes
        results['avg_energy_consumption'] = total_energy / num_episodes

        return results

    def calculate_tracking_error(self, current_state, desired_state):
        """Calculate tracking error between current and desired states"""
        # This is task-specific - implement based on your task
        if isinstance(current_state, dict):
            # For complex state dictionaries
            error = 0
            for key in current_state:
                if key in desired_state:
                    if isinstance(current_state[key], (list, tuple, np.ndarray)):
                        error += np.linalg.norm(
                            np.array(current_state[key]) - np.array(desired_state[key])
                        )
                    else:
                        error += abs(current_state[key] - desired_state[key])
            return error
        else:
            # For simple array states
            return np.linalg.norm(current_state - desired_state)

    def calculate_energy_consumption(self, action):
        """Calculate energy consumption based on action"""
        # Energy is proportional to squared action magnitudes
        if isinstance(action, (list, tuple, np.ndarray)):
            return np.sum(np.array(action)**2)
        else:
            return action**2

    def calculate_transfer_metrics(self, sim_results, real_results):
        """Calculate transfer-specific metrics"""
        metrics = {}

        # Success rate transfer
        metrics['success_transfer'] = real_results['success_rate'] / (sim_results['success_rate'] + 1e-8)

        # Performance drop
        metrics['performance_drop'] = sim_results['success_rate'] - real_results['success_rate']

        # Transfer gap (absolute difference)
        metrics['transfer_gap'] = abs(sim_results['success_rate'] - real_results['success_rate'])

        # Normalized transfer efficiency
        metrics['transfer_efficiency'] = real_results['success_rate'] / max(sim_results['success_rate'], 0.1)

        # Robustness metric (consistency across episodes)
        sim_std = np.std(sim_results['successes'])
        real_std = np.std(real_results['successes'])
        metrics['robustness_transfer'] = 1.0 - abs(sim_std - real_std)  # Closer to 1 is better

        return metrics

    def robustness_analysis(self, policy, num_perturbations=50):
        """Analyze robustness to environmental perturbations"""
        original_success = self.evaluate_on_environment(policy, self.real_env, 10)['success_rate']

        perturbed_successes = []

        for i in range(num_perturbations):
            # Apply random perturbation to environment
            self.real_env.apply_random_perturbation()

            # Evaluate policy under perturbation
            perturbed_success = self.evaluate_on_environment(policy, self.real_env, 5)['success_rate']
            perturbed_successes.append(perturbed_success)

            # Restore original environment
            self.real_env.restore_original_state()

        robustness = np.mean(perturbed_successes)
        robustness_variance = np.var(perturbed_successes)

        print(f"Robustness analysis:")
        print(f"  Original success rate: {original_success:.2f}")
        print(f"  Mean perturbed success: {robustness:.2f}")
        print(f"  Robustness variance: {robustness_variance:.4f}")

        return {
            'robustness': robustness,
            'variance': robustness_variance,
            'perturbation_sensitivity': robustness_variance / (original_success + 1e-8)
        }
```

## Best Practices and Guidelines

### Transfer Success Factors

#### Key Recommendations for Successful Transfer

1. **Rich Domain Randomization**: Apply extensive randomization during training to cover the expected range of real-world variations.

2. **Realistic Sensor Modeling**: Accurately model sensor noise, delays, and imperfections in simulation.

3. **System Identification**: Perform thorough system identification to match real robot dynamics.

4. **Gradual Transfer**: Start with simpler tasks and gradually increase complexity.

5. **Safety Mechanisms**: Implement safety checks and fallback behaviors for real-world deployment.

6. **Continuous Learning**: Enable online adaptation to refine policies in the real world.

7. **Validation**: Rigorously validate policies in simulation before real-world testing.

8. **Monitoring**: Continuously monitor policy performance and detect degradation.

## Summary

Sim-to-Real transfer is a complex but essential process for deploying simulation-trained policies on real robots. The success of transfer depends on minimizing the reality gap through techniques like domain randomization, system identification, and sensor calibration. Isaac Sim provides powerful tools for implementing these techniques, including GPU-accelerated simulation for diverse training scenarios and realistic sensor models. The integration with Isaac ROS enables seamless calibration and validation of sensor systems. Advanced techniques like domain adaptation and meta-learning further improve transfer performance. Success requires careful attention to physical modeling, sensor calibration, and validation procedures. With proper implementation of these techniques, policies trained in Isaac Sim can successfully transfer to real humanoid robots, accelerating development and reducing real-world testing requirements.

---

## Further Reading

- "Learning Dexterous In-Hand Manipulation" by OpenAI et al.
- "Domain Randomization for Transferring Deep Neural Networks from Simulation to the Real World"
- "Sim-to-Real Transfer of Robotic Control with Dynamics Randomization"
- "Closing the Sim-to-Real Loop: Adapting Simulation Randomization with Real World Behavior"
- Isaac Sim documentation on domain randomization
- "Transfer Learning for Robotics" - Survey paper
- NVIDIA Isaac ROS calibration and perception packages