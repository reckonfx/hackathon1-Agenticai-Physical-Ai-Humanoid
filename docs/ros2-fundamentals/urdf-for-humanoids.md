---
sidebar_label: URDF for Humanoids
title: URDF for Humanoids
---

# URDF for Humanoids

## Introduction to URDF in Humanoid Robotics

Unified Robot Description Format (URDF) is an XML-based format used in ROS to describe robot models. For humanoid robots, URDF becomes particularly important as it defines the complex kinematic structure, physical properties, and visual representation of human-like robots. Understanding URDF is crucial for humanoid robotics as it enables simulation, visualization, motion planning, and control.

## URDF Fundamentals for Humanoid Robots

### URDF Overview

URDF (Unified Robot Description Format) provides a complete description of a robot including:

- **Kinematic structure**: Joint and link relationships
- **Physical properties**: Mass, inertia, and collision properties
- **Visual properties**: Appearance for visualization
- **Actuator properties**: Joint limits and dynamics

### Humanoid-Specific Considerations

Humanoid robots have unique characteristics that require special attention in URDF:

- **Bipedal structure**: Two legs with complex foot kinematics
- **Anthropomorphic form**: Human-like proportions and joint configurations
- **Balance requirements**: Center of mass considerations
- **Multiple degrees of freedom**: Complex joint structures in hands and feet

## URDF Structure for Humanoid Robots

### Basic URDF Elements

A humanoid URDF typically follows this structure:

```xml
<?xml version="1.0"?>
<robot name="my_humanoid_robot" xmlns:xacro="http://www.ros.org/wiki/xacro">
  <!-- Materials -->
  <material name="black">
    <color rgba="0.0 0.0 0.0 1.0"/>
  </material>
  <material name="blue">
    <color rgba="0.0 0.0 0.8 1.0"/>
  </material>

  <!-- Base link (usually pelvis for humanoid) -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.2 0.1 0.1"/>
      </geometry>
      <material name="blue"/>
    </visual>
    <collision>
      <geometry>
        <box size="0.2 0.1 0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="5.0"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Joint definitions and additional links -->
  <!-- ... more joints and links ... -->

</robot>
```

### Humanoid Kinematic Chain

Humanoid robots typically follow this kinematic structure:

```
base_link (pelvis)
├── torso
│   ├── head
│   ├── left_arm
│   │   ├── left_forearm
│   │   └── left_hand
│   └── right_arm
│       ├── right_forearm
│       └── right_hand
└── left_leg
    ├── left_lower_leg
    └── left_foot
└── right_leg
    ├── right_lower_leg
    └── right_foot
```

## Link Definition for Humanoid Components

### Base Link (Pelvis)

The base link for a humanoid is typically the pelvis:

```xml
<link name="base_link">
  <visual>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <box size="0.25 0.2 0.15"/>  <!-- Approximate pelvis dimensions -->
    </geometry>
    <material name="blue"/>
  </visual>
  <collision>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <box size="0.25 0.2 0.15"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="10.0"/>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.15" iyz="0" izz="0.12"/>
  </inertial>
</link>
```

### Torso and Spine

The torso connects the pelvis to the head and arms:

```xml
<link name="torso">
  <visual>
    <origin xyz="0 0 0.25" rpy="0 0 0"/>
    <geometry>
      <box size="0.2 0.25 0.4"/>
    </geometry>
    <material name="white"/>
  </visual>
  <collision>
    <origin xyz="0 0 0.25" rpy="0 0 0"/>
    <geometry>
      <box size="0.2 0.25 0.4"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="8.0"/>
    <origin xyz="0 0 0.25" rpy="0 0 0"/>
    <inertia ixx="0.2" ixy="0" ixz="0" iyy="0.25" iyz="0" izz="0.1"/>
  </inertial>
</link>

<joint name="torso_joint" type="fixed">
  <parent link="base_link"/>
  <child link="torso"/>
  <origin xyz="0 0 0.075" rpy="0 0 0"/>
</joint>
```

### Head

The head link typically includes sensors:

```xml
<link name="head">
  <visual>
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
    <geometry>
      <sphere radius="0.1"/>
    </geometry>
    <material name="white"/>
  </visual>
  <collision>
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
    <geometry>
      <sphere radius="0.1"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="2.0"/>
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
    <inertia ixx="0.02" ixy="0" ixz="0" iyy="0.02" iyz="0" izz="0.02"/>
  </inertial>
</link>

<joint name="neck_joint" type="revolute">
  <parent link="torso"/>
  <child link="head"/>
  <origin xyz="0 0 0.45" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="-0.5" upper="0.5" effort="10" velocity="2"/>
</joint>
```

## Joint Definitions for Humanoid Robots

### Joint Types in Humanoids

Humanoid robots use various joint types to achieve human-like motion:

#### Fixed Joints
For rigid connections (e.g., sensors to links):
```xml
<joint name="camera_joint" type="fixed">
  <parent link="head"/>
  <child link="camera_link"/>
  <origin xyz="0.05 0 0.05" rpy="0 0 0"/>
</joint>
```

#### Revolute Joints
For single-axis rotation (e.g., elbow, knee):
```xml
<joint name="left_elbow_joint" type="revolute">
  <parent link="left_upper_arm"/>
  <child link="left_forearm"/>
  <origin xyz="0 0 -0.3" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="-2.3" upper="0" effort="50" velocity="3"/>
  <dynamics damping="1.0" friction="0.1"/>
</joint>
```

#### Continuous Joints
For unlimited rotation (e.g., some neck joints):
```xml
<joint name="head_pan_joint" type="continuous">
  <parent link="torso"/>
  <child link="head"/>
  <origin xyz="0 0 0.45" rpy="0 0 0"/>
  <axis xyz="0 0 1"/>
  <dynamics damping="0.5" friction="0.1"/>
</joint>
```

#### Spherical Joints
For ball-and-socket joints (hip, shoulder):
```xml
<joint name="left_shoulder_joint" type="ball">
  <parent link="torso"/>
  <child link="left_upper_arm"/>
  <origin xyz="0.05 0.15 0.3" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
</joint>
```

### Complex Joint Configurations

#### 3-DOF Joint (Hip/Shoulder)
For complex joints, multiple single-DOF joints are often used:

```xml
<!-- Left hip - 3 DOF: flexion/extension, abduction/adduction, internal/external rotation -->
<joint name="left_hip_yaw" type="revolute">
  <parent link="base_link"/>
  <child link="left_thigh"/>
  <origin xyz="0 -0.1 -0.1" rpy="0 0 0"/>
  <axis xyz="0 0 1"/>
  <limit lower="-0.5" upper="0.5" effort="100" velocity="2"/>
</joint>

<joint name="left_hip_roll" type="revolute">
  <parent link="left_thigh"/>
  <child link="left_thigh_middle"/>
  <origin xyz="0 0 -0.1" rpy="0 0 0"/>
  <axis xyz="1 0 0"/>
  <limit lower="-0.4" upper="1.0" effort="100" velocity="2"/>
</joint>

<joint name="left_hip_pitch" type="revolute">
  <parent link="left_thigh_middle"/>
  <child link="left_lower_leg"/>
  <origin xyz="0 0 -0.3" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="-2.3" upper="0.7" effort="100" velocity="2"/>
</joint>
```

## Humanoid Arm Structure

### Upper Arm

```xml
<link name="left_upper_arm">
  <visual>
    <origin xyz="0 0 -0.15" rpy="0 0 0"/>
    <geometry>
      <cylinder length="0.3" radius="0.05"/>
    </geometry>
    <material name="gray"/>
  </visual>
  <collision>
    <origin xyz="0 0 -0.15" rpy="0 0 0"/>
    <geometry>
      <cylinder length="0.3" radius="0.05"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="2.0"/>
    <origin xyz="0 0 -0.15" rpy="0 0 0"/>
    <inertia ixx="0.02" ixy="0" ixz="0" iyy="0.02" iyz="0" izz="0.005"/>
  </inertial>
</link>

<joint name="left_shoulder_pitch" type="revolute">
  <parent link="torso"/>
  <child link="left_upper_arm"/>
  <origin xyz="0.05 0.15 0.3" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="-1.57" upper="1.57" effort="50" velocity="3"/>
</joint>
```

### Forearm and Hand

```xml
<link name="left_forearm">
  <visual>
    <origin xyz="0 0 -0.12" rpy="0 0 0"/>
    <geometry>
      <cylinder length="0.24" radius="0.04"/>
    </geometry>
    <material name="gray"/>
  </visual>
  <collision>
    <origin xyz="0 0 -0.12" rpy="0 0 0"/>
    <geometry>
      <cylinder length="0.24" radius="0.04"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="1.0"/>
    <origin xyz="0 0 -0.12" rpy="0 0 0"/>
    <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.002"/>
  </inertial>
</link>

<joint name="left_elbow_joint" type="revolute">
  <parent link="left_upper_arm"/>
  <child link="left_forearm"/>
  <origin xyz="0 0 -0.3" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="-2.3" upper="0" effort="30" velocity="4"/>
</joint>

<link name="left_hand">
  <visual>
    <origin xyz="0 0 -0.08" rpy="0 0 0"/>
    <geometry>
      <box size="0.1 0.08 0.16"/>
    </geometry>
    <material name="flesh"/>
  </visual>
  <collision>
    <origin xyz="0 0 -0.08" rpy="0 0 0"/>
    <geometry>
      <box size="0.1 0.08 0.16"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="0.5"/>
    <origin xyz="0 0 -0.08" rpy="0 0 0"/>
    <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
  </inertial>
</link>

<joint name="left_wrist_joint" type="revolute">
  <parent link="left_forearm"/>
  <child link="left_hand"/>
  <origin xyz="0 0 -0.24" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="-1.57" upper="1.57" effort="10" velocity="5"/>
</joint>
```

## Humanoid Leg Structure

### Thigh and Lower Leg

```xml
<link name="left_thigh">
  <visual>
    <origin xyz="0 0 -0.2" rpy="0 0 0"/>
    <geometry>
      <cylinder length="0.4" radius="0.07"/>
    </geometry>
    <material name="blue"/>
  </visual>
  <collision>
    <origin xyz="0 0 -0.2" rpy="0 0 0"/>
    <geometry>
      <cylinder length="0.4" radius="0.07"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="5.0"/>
    <origin xyz="0 0 -0.2" rpy="0 0 0"/>
    <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.02"/>
  </inertial>
</link>

<joint name="left_hip_joint" type="revolute">
  <parent link="base_link"/>
  <child link="left_thigh"/>
  <origin xyz="0 -0.1 -0.1" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="-1.57" upper="0.7" effort="200" velocity="2"/>
</joint>

<link name="left_lower_leg">
  <visual>
    <origin xyz="0 0 -0.2" rpy="0 0 0"/>
    <geometry>
      <cylinder length="0.4" radius="0.06"/>
    </geometry>
    <material name="blue"/>
  </visual>
  <collision>
    <origin xyz="0 0 -0.2" rpy="0 0 0"/>
    <geometry>
      <cylinder length="0.4" radius="0.06"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="3.0"/>
    <origin xyz="0 0 -0.2" rpy="0 0 0"/>
    <inertia ixx="0.05" ixy="0" ixz="0" iyy="0.05" iyz="0" izz="0.01"/>
  </inertial>
</link>

<joint name="left_knee_joint" type="revolute">
  <parent link="left_thigh"/>
  <child link="left_lower_leg"/>
  <origin xyz="0 0 -0.4" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="0" upper="2.3" effort="200" velocity="2"/>
</joint>
```

### Foot

```xml
<link name="left_foot">
  <visual>
    <origin xyz="0 0 -0.05" rpy="0 0 0"/>
    <geometry>
      <box size="0.25 0.1 0.1"/>
    </geometry>
    <material name="black"/>
  </visual>
  <collision>
    <origin xyz="0 0 -0.05" rpy="0 0 0"/>
    <geometry>
      <box size="0.25 0.1 0.1"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="1.5"/>
    <origin xyz="0 0 -0.05" rpy="0 0 0"/>
    <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.02" iyz="0" izz="0.02"/>
  </inertial>
</link>

<joint name="left_ankle_joint" type="revolute">
  <parent link="left_lower_leg"/>
  <child link="left_foot"/>
  <origin xyz="0 0 -0.4" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="-0.5" upper="0.5" effort="50" velocity="2"/>
</joint>
```

## Using Xacro for Complex Humanoid URDFs

Xacro (XML Macros) helps manage complex humanoid URDFs:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="humanoid_robot">

  <!-- Properties -->
  <xacro:property name="M_PI" value="3.1415926535897931" />
  <xacro:property name="torso_length" value="0.4" />
  <xacro:property name="upper_arm_length" value="0.3" />
  <xacro:property name="lower_arm_length" value="0.24" />
  <xacro:property name="thigh_length" value="0.4" />
  <xacro:property name="lower_leg_length" value="0.4" />

  <!-- Materials -->
  <xacro:macro name="default_material" params="name color_rgba">
    <material name="${name}">
      <color rgba="${color_rgba}"/>
    </material>
  </xacro:macro>

  <xacro:default_material name="blue" color_rgba="0.0 0.0 0.8 1.0" />
  <xacro:default_material name="white" color_rgba="1.0 1.0 1.0 1.0" />
  <xacro:default_material name="black" color_rgba="0.0 0.0 0.0 1.0" />

  <!-- Base link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.25 0.2 0.15"/>
      </geometry>
      <material name="blue"/>
    </visual>
    <collision>
      <geometry>
        <box size="0.25 0.2 0.15"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="10.0"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.15" iyz="0" izz="0.12"/>
    </inertial>
  </link>

  <!-- Macro for creating a humanoid limb -->
  <xacro:macro name="humanoid_arm" params="side prefix reflect">
    <link name="${prefix}_upper_arm">
      <visual>
        <origin xyz="0 0 -${upper_arm_length/2}" rpy="0 0 0"/>
        <geometry>
          <cylinder length="${upper_arm_length}" radius="0.05"/>
        </geometry>
        <material name="gray"/>
      </visual>
      <collision>
        <origin xyz="0 0 -${upper_arm_length/2}" rpy="0 0 0"/>
        <geometry>
          <cylinder length="${upper_arm_length}" radius="0.05"/>
        </geometry>
      </collision>
      <inertial>
        <mass value="2.0"/>
        <origin xyz="0 0 -${upper_arm_length/2}" rpy="0 0 0"/>
        <inertia ixx="0.02" ixy="0" ixz="0" iyy="0.02" iyz="0" izz="0.005"/>
      </inertial>
    </link>

    <joint name="${prefix}_shoulder_pitch" type="revolute">
      <parent link="torso"/>
      <child link="${prefix}_upper_arm"/>
      <origin xyz="${0.05 * reflect} 0.15 0.3" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>
      <limit lower="-1.57" upper="1.57" effort="50" velocity="3"/>
    </joint>

    <link name="${prefix}_forearm">
      <visual>
        <origin xyz="0 0 -${lower_arm_length/2}" rpy="0 0 0"/>
        <geometry>
          <cylinder length="${lower_arm_length}" radius="0.04"/>
        </geometry>
        <material name="gray"/>
      </visual>
      <collision>
        <origin xyz="0 0 -${lower_arm_length/2}" rpy="0 0 0"/>
        <geometry>
          <cylinder length="${lower_arm_length}" radius="0.04"/>
        </geometry>
      </collision>
      <inertial>
        <mass value="1.0"/>
        <origin xyz="0 0 -${lower_arm_length/2}" rpy="0 0 0"/>
        <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.002"/>
      </inertial>
    </link>

    <joint name="${prefix}_elbow_joint" type="revolute">
      <parent link="${prefix}_upper_arm"/>
      <child link="${prefix}_forearm"/>
      <origin xyz="0 0 -${upper_arm_length}" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>
      <limit lower="-2.3" upper="0" effort="30" velocity="4"/>
    </joint>
  </xacro:macro>

  <!-- Use the macro to create both arms -->
  <xacro:humanoid_arm side="left" prefix="left" reflect="1"/>
  <xacro:humanoid_arm side="right" prefix="right" reflect="-1"/>

</robot>
```

## Sensors in Humanoid URDF

### Camera Sensors

```xml
<link name="camera_link">
  <visual>
    <geometry>
      <box size="0.05 0.05 0.05"/>
    </geometry>
    <material name="black"/>
  </visual>
  <collision>
    <geometry>
      <box size="0.05 0.05 0.05"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="0.1"/>
    <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
  </inertial>
</link>

<joint name="camera_joint" type="fixed">
  <parent link="head"/>
  <child link="camera_link"/>
  <origin xyz="0.05 0 0.05" rpy="0 0 0"/>
</joint>

<gazebo reference="camera_link">
  <sensor type="camera" name="camera1">
    <update_rate>30.0</update_rate>
    <camera name="head">
      <horizontal_fov>1.3962634</horizontal_fov>
      <image>
        <width>800</width>
        <height>600</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.02</near>
        <far>300</far>
      </clip>
    </camera>
    <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
      <frame_name>camera_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

### IMU Sensors

```xml
<link name="imu_link">
  <inertial>
    <mass value="0.01"/>
    <inertia ixx="0.0001" ixy="0" ixz="0" iyy="0.0001" iyz="0" izz="0.0001"/>
  </inertial>
</link>

<joint name="imu_joint" type="fixed">
  <parent link="base_link"/>
  <child link="imu_link"/>
  <origin xyz="0 0 0" rpy="0 0 0"/>
</joint>

<gazebo reference="imu_link">
  <sensor name="imu_sensor" type="imu">
    <always_on>true</always_on>
    <update_rate>100</update_rate>
    <visualize>true</visualize>
    <imu>
      <angular_velocity>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>2e-4</stddev>
          </noise>
        </x>
        <y>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>2e-4</stddev>
          </noise>
        </y>
        <z>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>2e-4</stddev>
          </noise>
        </z>
      </angular_velocity>
      <linear_acceleration>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>1.7e-2</stddev>
          </noise>
        </x>
        <y>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>1.7e-2</stddev>
          </noise>
        </y>
        <z>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>1.7e-2</stddev>
          </noise>
        </z>
      </linear_acceleration>
    </imu>
  </sensor>
</gazebo>
```

## Gazebo Integration

### Physics Properties

```xml
<gazebo>
  <plugin name="ground_truth" filename="libgazebo_ros_p3d.so">
    <frame_name>map</frame_name>
  </plugin>
</gazebo>

<gazebo reference="base_link">
  <material>Gazebo/Blue</material>
  <mu1>0.2</mu1>
  <mu2>0.2</mu2>
  <kp>1000000.0</kp>
  <kd>1.0</kd>
</gazebo>
```

### Transmission for Joint Control

```xml
<transmission name="left_hip_trans">
  <type>transmission_interface/SimpleTransmission</type>
  <joint name="left_hip_joint">
    <hardwareInterface>hardware_interface/EffortJointInterface</hardwareInterface>
  </joint>
  <actuator name="left_hip_motor">
    <hardwareInterface>hardware_interface/EffortJointInterface</hardwareInterface>
    <mechanicalReduction>1</mechanicalReduction>
  </actuator>
</transmission>
```

## Best Practices for Humanoid URDF

### Proportions and Scaling

#### Anthropometric Data
- Use real human proportions as reference
- Consider target demographic (adult, child, etc.)
- Balance between realism and computational efficiency

#### Mass Distribution
- Ensure realistic mass distribution for stable simulation
- Consider that actual robots have different mass distributions than humans
- Account for actuators, electronics, and structural components

### Joint Limitations

#### Realistic Ranges
- Research actual human joint ranges of motion
- Account for safety margins in robotic implementation
- Consider mechanical limitations of robot actuators

#### Safety Margins
- Add safety margins to prevent damage during simulation
- Consider the difference between human and robotic capabilities

### Collision and Visual Models

#### Simplification
- Use simplified collision models for performance
- Balance visual fidelity with computational requirements
- Consider convex hulls for complex shapes

#### Ground Contact
- Ensure feet have appropriate contact geometry
- Consider foot sole design for stability
- Model ground contact points appropriately

## Debugging and Validation

### URDF Validation Tools

#### Check URDF
```bash
# Validate URDF syntax
check_urdf my_humanoid.urdf

# Generate joint information
check_urdf -j my_humanoid.urdf
```

#### View URDF
```bash
# Visualize the robot structure
urdf_to_graphiz my_humanoid.urdf
```

### Common Issues

#### Joint Direction
- Ensure joint axes are correctly oriented
- Check that positive/negative directions match expectations
- Verify coordinate frame conventions (right-hand rule)

#### Mass and Inertia
- Ensure all links have defined mass and inertia
- Use realistic values for stable simulation
- Check that center of mass is properly positioned

#### Kinematic Loops
- Humanoid robots typically have tree structure
- Avoid creating kinematic loops unless specifically needed
- Use appropriate constraints for closed chains

## Integration with ROS 2

### Robot State Publisher

The robot state publisher node publishes joint states to TF:

```xml
<node pkg="robot_state_publisher" exec="robot_state_publisher" name="robot_state_publisher">
  <param name="robot_description" value="$(find my_robot_package)/urdf/my_humanoid.urdf"/>
</node>
```

### Joint State Publisher

For interactive joint control:

```xml
<node pkg="joint_state_publisher_gui" exec="joint_state_publisher_gui" name="joint_state_publisher_gui"/>
```

## Advanced Humanoid Features

### Actuated Hands

Complex hand models with multiple DOF:

```xml
<!-- Thumb -->
<joint name="left_thumb_joint" type="revolute">
  <parent link="left_hand"/>
  <child link="left_thumb"/>
  <origin xyz="0.03 0.02 -0.05" rpy="0 0 0.5"/>
  <axis xyz="0 0 1"/>
  <limit lower="0" upper="1.57" effort="5" velocity="1"/>
</joint>

<!-- Fingers -->
<joint name="left_index_finger_joint" type="revolute">
  <parent link="left_hand"/>
  <child link="left_index_finger"/>
  <origin xyz="0.04 0 -0.06" rpy="0 0 0"/>
  <axis xyz="0 0 1"/>
  <limit lower="0" upper="1.57" effort="3" velocity="1"/>
</joint>
```

### Flexible Spine

For more human-like motion:

```xml
<joint name="spine_yaw" type="revolute">
  <parent link="base_link"/>
  <child link="spine_lower"/>
  <origin xyz="0 0 0.075" rpy="0 0 0"/>
  <axis xyz="0 0 1"/>
  <limit lower="-0.5" upper="0.5" effort="50" velocity="1"/>
</joint>

<joint name="spine_pitch" type="revolute">
  <parent link="spine_lower"/>
  <child link="torso"/>
  <origin xyz="0 0 0.1" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="-0.3" upper="0.3" effort="50" velocity="1"/>
</joint>
```

## Summary

URDF is fundamental to humanoid robotics in ROS 2, providing the complete description needed for simulation, visualization, and control. Creating effective humanoid URDFs requires careful attention to kinematic structure, mass properties, joint limitations, and sensor integration. The use of Xacro macros helps manage the complexity of full humanoid models with dozens of links and joints. Proper URDF design is essential for stable simulation, accurate motion planning, and successful robot deployment.

---

## Further Reading

- ROS URDF tutorials and documentation
- "Robotics, Vision and Control" by Peter Corke
- Gazebo simulation tutorials for humanoid robots
- Xacro documentation and best practices
- Biomechanics references for realistic joint limits