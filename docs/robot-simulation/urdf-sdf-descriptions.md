---
sidebar_label: URDF + SDF Descriptions
title: URDF + SDF Descriptions
---

# URDF + SDF Descriptions

## Introduction to URDF and SDF

URDF (Unified Robot Description Format) and SDF (Simulation Description Format) are two complementary XML-based formats used in robotics to describe robot models and simulation environments. While URDF is primarily used in ROS for robot description, SDF is used by Gazebo for simulation. Understanding both formats and how they interact is crucial for effective humanoid robot simulation.

## Understanding URDF and SDF Differences

### URDF Characteristics

URDF is designed specifically for ROS and has the following characteristics:

#### Strengths
- **ROS Integration**: Seamless integration with ROS tools and ecosystem
- **Simplicity**: Focused on robot description without simulation-specific details
- **Tool Support**: Extensive tooling for visualization, kinematics, etc.
- **Macros**: Xacro support for complex robot descriptions

#### Limitations
- **Simulation Focus**: Not designed for physics simulation details
- **Flexibility**: Limited in expressing complex simulation scenarios
- **Environment**: Cannot describe simulation environments

### SDF Characteristics

SDF is designed for Gazebo simulation and offers:

#### Strengths
- **Simulation Features**: Comprehensive physics, sensors, and simulation parameters
- **Environment Description**: Can describe entire simulation worlds
- **Modularity**: Supports complex nested models and scenarios
- **Flexibility**: Extensible for various simulation needs

#### Limitations
- **ROS Integration**: Requires additional plugins for ROS integration
- **Complexity**: More complex than URDF for simple robot descriptions
- **Tooling**: Less tooling outside of Gazebo ecosystem

## URDF to SDF Conversion Process

### The Conversion Pipeline

When a robot described in URDF is loaded into Gazebo, the following conversion occurs:

1. **URDF Parsing**: ROS parses the URDF file
2. **SDF Generation**: URDF elements are converted to SDF
3. **Gazebo Loading**: Generated SDF is loaded into Gazebo
4. **Plugin Integration**: ROS-Gazebo plugins are attached

### Conversion Example

#### Original URDF
```xml
<?xml version="1.0"?>
<robot name="my_robot">
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.5 0.25"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 0.8 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.5 0.5 0.25"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
    </inertial>
  </link>

  <joint name="base_to_wheel" type="continuous">
    <parent link="base_link"/>
    <child link="wheel_link"/>
    <axis xyz="0 1 0"/>
    <origin xyz="0 0 -0.1" rpy="0 0 0"/>
  </joint>

  <link name="wheel_link">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.2"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
    </inertial>
  </link>
</robot>
```

#### Converted SDF (Simplified)
```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <model name="my_robot">
    <link name="base_link">
      <visual name="visual">
        <geometry>
          <box>
            <size>0.5 0.5 0.25</size>
          </box>
        </geometry>
        <material>
          <ambient>0 0 0.8 1</ambient>
          <diffuse>0 0 0.8 1</diffuse>
        </material>
      </visual>
      <collision name="collision">
        <geometry>
          <box>
            <size>0.5 0.5 0.25</size>
          </box>
        </geometry>
      </collision>
      <inertial>
        <mass>1.0</mass>
        <inertia>
          <ixx>0.1</ixx>
          <ixy>0</ixy>
          <ixz>0</ixz>
          <iyy>0.1</iyy>
          <iyz>0</iyz>
          <izz>0.1</izz>
        </inertia>
      </inertial>
    </link>

    <joint name="base_to_wheel" type="continuous">
      <parent>base_link</parent>
      <child>wheel_link</child>
      <axis>
        <xyz>0 1 0</xyz>
      </axis>
      <pose>0 0 -0.1 0 0 0</pose>
    </joint>

    <link name="wheel_link">
      <visual name="visual">
        <geometry>
          <cylinder>
            <radius>0.1</radius>
            <length>0.05</length>
          </cylinder>
        </geometry>
      </visual>
      <collision name="collision">
        <geometry>
          <cylinder>
            <radius>0.1</radius>
            <length>0.05</length>
          </cylinder>
        </geometry>
      </collision>
      <inertial>
        <mass>0.2</mass>
        <inertia>
          <ixx>0.001</ixx>
          <ixy>0</ixy>
          <ixz>0</ixz>
          <iyy>0.001</iyy>
          <iyz>0</iyz>
          <izz>0.001</izz>
        </inertia>
      </inertial>
    </link>
  </model>
</sdf>
```

## Advanced URDF Features for Simulation

### Gazebo-Specific Tags in URDF

While URDF is primarily for robot description, it can include Gazebo-specific tags:

#### Material Definitions
```xml
<robot name="my_robot">
  <!-- URDF content -->

  <!-- Gazebo-specific material definition -->
  <gazebo reference="base_link">
    <material>Gazebo/Blue</material>
  </gazebo>
</robot>
```

#### Inertial Properties
```xml
<gazebo reference="base_link">
  <mu1>0.2</mu1>        <!-- Primary friction coefficient -->
  <mu2>0.2</mu2>        <!-- Secondary friction coefficient -->
  <kp>1000000.0</kp>     <!-- Contact stiffness -->
  <kd>1.0</kd>          <!-- Damping coefficient -->
  <material>Gazebo/White</material>
</gazebo>
```

### Sensor Integration in URDF

#### Camera Sensor
```xml
<link name="camera_link">
  <visual>
    <geometry>
      <box size="0.05 0.05 0.05"/>
    </geometry>
  </visual>
  <collision>
    <geometry>
      <box size="0.05 0.05 0.05"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="0.01"/>
    <inertia ixx="0.0001" ixy="0" ixz="0" iyy="0.0001" iyz="0" izz="0.0001"/>
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
    <camera name="head_camera">
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
      <topic_name>image_raw</topic_name>
      <camera_info_topic_name>camera_info</camera_info_topic_name>
    </plugin>
  </sensor>
</gazebo>
```

#### IMU Sensor
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
    <visualize>false</visualize>
    <topic>__default_topic__</topic>
    <plugin name="imu_plugin" filename="libgazebo_ros_imu.so">
      <ros>
        <namespace>/my_robot</namespace>
        <remapping>~/out:=imu/data</remapping>
      </ros>
      <initial_orientation_as_reference>false</initial_orientation_as_reference>
      <body_name>imu_link</body_name>
    </plugin>
  </sensor>
</gazebo>
```

#### LIDAR Sensor
```xml
<link name="lidar_link">
  <visual>
    <geometry>
      <cylinder radius="0.05" length="0.05"/>
    </geometry>
  </visual>
  <collision>
    <geometry>
      <cylinder radius="0.05" length="0.05"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="0.1"/>
    <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
  </inertial>
</link>

<joint name="lidar_joint" type="fixed">
  <parent link="base_link"/>
  <child link="lidar_link"/>
  <origin xyz="0 0 0.2" rpy="0 0 0"/>
</joint>

<gazebo reference="lidar_link">
  <sensor name="lidar_sensor" type="ray">
    <ray>
      <scan>
        <horizontal>
          <samples>720</samples>
          <resolution>1</resolution>
          <min_angle>-1.570796</min_angle>
          <max_angle>1.570796</max_angle>
        </horizontal>
      </scan>
      <range>
        <min>0.1</min>
        <max>30.0</max>
        <resolution>0.01</resolution>
      </range>
    </ray>
    <plugin name="lidar_plugin" filename="libgazebo_ros_ray_sensor.so">
      <ros>
        <namespace>/my_robot</namespace>
        <remapping>~/out:=scan</remapping>
      </ros>
      <output_type>sensor_msgs/LaserScan</output_type>
      <frame_name>lidar_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

## SDF-Only Models

### When to Use SDF Directly

Some scenarios require direct SDF usage:

#### Complex Simulation Scenarios
- Multi-robot simulations
- Complex sensor configurations
- Custom physics properties
- Environment models

#### SDF Model Example
```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <model name="humanoid_robot">
    <!-- Model-level properties -->
    <static>false</static>
    <self_collide>false</self_collide>
    <enable_wind>false</enable_wind>
    <pose>0 0 1.0 0 0 0</pose>

    <!-- Links -->
    <link name="base_link">
      <inertial>
        <mass>10.0</mass>
        <inertia>
          <ixx>0.1</ixx>
          <ixy>0</ixy>
          <ixz>0</ixz>
          <iyy>0.15</iyy>
          <iyz>0</iyz>
          <izz>0.12</izz>
        </inertia>
      </inertial>

      <visual name="visual">
        <geometry>
          <box>
            <size>0.25 0.2 0.15</size>
          </box>
        </geometry>
        <material>
          <script>
            <uri>file://media/materials/scripts/gazebo.material</uri>
            <name>Gazebo/Blue</name>
          </script>
        </material>
      </visual>

      <collision name="collision">
        <geometry>
          <box>
            <size>0.25 0.2 0.15</size>
          </box>
        </geometry>
        <surface>
          <friction>
            <ode>
              <mu>0.5</mu>
              <mu2>0.5</mu2>
            </ode>
          </friction>
        </surface>
      </collision>
    </link>

    <!-- Joints -->
    <joint name="left_hip_joint" type="revolute">
      <parent>base_link</parent>
      <child>left_thigh</child>
      <axis>
        <xyz>0 1 0</xyz>
        <limit>
          <lower>-1.57</lower>
          <upper>0.7</upper>
          <effort>200</effort>
          <velocity>2</velocity>
        </limit>
        <dynamics>
          <damping>1.0</damping>
          <friction>0.1</friction>
        </dynamics>
      </axis>
      <pose>0 -0.1 -0.1 0 0 0</pose>
    </joint>

    <!-- Additional links and joints -->
    <link name="left_thigh">
      <inertial>
        <mass>5.0</mass>
        <inertia>
          <ixx>0.1</ixx>
          <ixy>0</ixy>
          <ixz>0</ixz>
          <iyy>0.1</iyy>
          <iyz>0</iyz>
          <izz>0.02</izz>
        </inertia>
      </inertial>
      <visual name="visual">
        <geometry>
          <cylinder>
            <radius>0.07</radius>
            <length>0.4</length>
          </cylinder>
        </geometry>
      </visual>
      <collision name="collision">
        <geometry>
          <cylinder>
            <radius>0.07</radius>
            <length>0.4</length>
          </cylinder>
        </geometry>
      </collision>
    </link>
  </model>
</sdf>
```

## Advanced SDF Features for Humanoid Simulation

### Physics Properties

#### Complex Joint Dynamics
```xml
<joint name="knee_joint" type="revolute">
  <parent>thigh</parent>
  <child>lower_leg</child>
  <axis>
    <xyz>0 1 0</xyz>
    <limit>
      <lower>0</lower>
      <upper>2.3</upper>
      <effort>200</effort>
      <velocity>2</velocity>
    </limit>
    <dynamics>
      <damping>2.0</damping>
      <friction>0.5</friction>
      <spring_reference>0.0</spring_reference>
      <spring_stiffness>0.0</spring_stiffness>
    </dynamics>
  </axis>
</joint>
```

#### Surface Properties for Feet
```xml
<collision name="foot_collision">
  <geometry>
    <box>
      <size>0.25 0.1 0.02</size>
    </box>
  </geometry>
  <surface>
    <friction>
      <ode>
        <mu>0.8</mu>    <!-- High friction for stability -->
        <mu2>0.8</mu2>
        <fdir1>0 0 0</fdir1>
      </ode>
      <torsional>
        <coefficient>1.0</coefficient>
        <patch_radius>0.02</patch_radius>
      </torsional>
    </friction>
    <bounce>
      <restitution_coefficient>0.1</restitution_coefficient>
      <threshold>100000</threshold>
    </bounce>
    <contact>
      <ode>
        <soft_cfm>0</soft_cfm>
        <soft_erp>0.2</soft_erp>
        <kp>1e+13</kp>
        <kd>1</kd>
      </ode>
    </contact>
  </surface>
</collision>
```

### Custom Plugins for Humanoid Control

#### Joint Control Plugin
```xml
<model name="humanoid_robot">
  <!-- ... links and joints ... -->

  <plugin name="humanoid_controller" filename="libmy_humanoid_controller.so">
    <robot_param>robot_description</robot_param>
    <robot_namespace>/my_humanoid</robot_namespace>
    <control_rate>100</control_rate>
    <joints>
      <joint>left_hip_yaw</joint>
      <joint>left_hip_roll</joint>
      <joint>left_hip_pitch</joint>
      <!-- ... more joints ... -->
    </joints>
  </plugin>
</model>
```

#### Balance Control Plugin
```xml
<plugin name="balance_controller" filename="libbalance_controller.so">
  <robot_namespace>/my_humanoid</robot_namespace>
  <imu_topic>/my_humanoid/imu/data</imu_topic>
  <center_of_mass_topic>/my_humanoid/com</center_of_mass_topic>
  <control_rate>500</control_rate>
  <pid_gains>
    <kp>100.0</kp>
    <ki>10.0</ki>
    <kd>5.0</kd>
  </pid_gains>
</plugin>
```

## Working with Xacro for Complex Models

### Advanced Xacro Features

#### Conditional Inclusion
```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="humanoid_robot">

  <xacro:property name="has_lidar" value="true" />
  <xacro:property name="has_camera" value="false" />

  <!-- Robot base definition -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.25 0.2 0.15"/>
      </geometry>
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

  <!-- Conditionally include LIDAR -->
  <xacro:if value="$(arg has_lidar)">
    <link name="lidar_link">
      <visual>
        <geometry>
          <cylinder radius="0.05" length="0.05"/>
        </geometry>
      </visual>
      <collision>
        <geometry>
          <cylinder radius="0.05" length="0.05"/>
        </geometry>
      </collision>
      <inertial>
        <mass value="0.1"/>
        <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
      </inertial>
    </link>

    <joint name="lidar_joint" type="fixed">
      <parent link="base_link"/>
      <child link="lidar_link"/>
      <origin xyz="0.1 0 0.1" rpy="0 0 0"/>
    </joint>

    <gazebo reference="lidar_link">
      <sensor name="lidar_sensor" type="ray">
        <ray>
          <scan>
            <horizontal>
              <samples>720</samples>
              <resolution>1</resolution>
              <min_angle>-1.570796</min_angle>
              <max_angle>1.570796</max_angle>
            </horizontal>
          </scan>
          <range>
            <min>0.1</min>
            <max>30.0</max>
            <resolution>0.01</resolution>
          </range>
        </ray>
        <plugin name="lidar_plugin" filename="libgazebo_ros_ray_sensor.so">
          <ros>
            <namespace>/my_humanoid</namespace>
            <remapping>~/out:=scan</remapping>
          </ros>
          <output_type>sensor_msgs/LaserScan</output_type>
          <frame_name>lidar_link</frame_name>
        </plugin>
      </sensor>
    </gazebo>
  </xacro:if>

  <!-- Conditionally include camera -->
  <xacro:if value="$(arg has_camera)">
    <!-- Camera definition here -->
  </xacro:if>

</robot>
```

#### Macros for Repetitive Elements
```xml
<!-- Macro for creating a leg -->
<xacro:macro name="leg" params="side prefix reflect">
  <link name="${prefix}_thigh">
    <visual>
      <origin xyz="0 0 -0.2" rpy="0 0 0"/>
      <geometry>
        <cylinder length="0.4" radius="0.07"/>
      </geometry>
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

  <joint name="${prefix}_hip_joint" type="revolute">
    <parent link="base_link"/>
    <child link="${prefix}_thigh"/>
    <origin xyz="0 ${reflect * 0.1} -0.1" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-1.57" upper="0.7" effort="200" velocity="2"/>
  </joint>

  <link name="${prefix}_lower_leg">
    <visual>
      <origin xyz="0 0 -0.2" rpy="0 0 0"/>
      <geometry>
        <cylinder length="0.4" radius="0.06"/>
      </geometry>
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

  <joint name="${prefix}_knee_joint" type="revolute">
    <parent link="${prefix}_thigh"/>
    <child link="${prefix}_lower_leg"/>
    <origin xyz="0 0 -0.4" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="0" upper="2.3" effort="200" velocity="2"/>
  </joint>
</xacro:macro>

<!-- Use the macro to create both legs -->
<xacro:leg side="left" prefix="left" reflect="-1"/>
<xacro:leg side="right" prefix="right" reflect="1"/>
```

## Validation and Debugging

### URDF Validation Tools

#### Check URDF
```bash
# Basic validation
check_urdf my_robot.urdf

# With joint information
check_urdf -j my_robot.urdf

# With detailed information
check_urdf --verbose my_robot.urdf
```

#### URDF to Graphviz
```bash
# Generate a visual representation of the kinematic tree
urdf_to_graphiz my_robot.urdf
# This creates .pdf files showing the robot structure
```

### SDF Validation

#### Gazebo Model Check
```bash
# Validate SDF file
gz sdf -k model.sdf

# Convert and view SDF
gz sdf -p model.sdf
```

### Common Issues and Solutions

#### Joint Direction Issues
```xml
<!-- Problem: Joint axis is inverted -->
<joint name="wrong_joint" type="revolute">
  <axis xyz="0 -1 0"/>  <!-- Negative direction -->
</joint>

<!-- Solution: Correct the axis direction -->
<joint name="correct_joint" type="revolute">
  <axis xyz="0 1 0"/>   <!-- Positive direction -->
</joint>
```

#### Mass and Inertia Issues
```xml
<!-- Problem: Zero or negative inertia values -->
<inertial>
  <mass value="0"/>  <!-- Zero mass is invalid -->
  <inertia ixx="0" iyy="0" izz="0"/>  <!-- Zero inertia causes simulation issues -->
</inertial>

<!-- Solution: Use realistic values -->
<inertial>
  <mass value="5.0"/>
  <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.02"/>
</inertial>
```

#### Coordinate Frame Issues
```xml
<!-- Problem: Wrong coordinate frame orientation -->
<origin xyz="0 0 0.5" rpy="1.570796 0 0"/>  <!-- 90-degree rotation -->

<!-- Solution: Use correct orientation -->
<origin xyz="0 0 0.5" rpy="0 0 0"/>  <!-- No rotation -->
```

## Best Practices

### URDF Best Practices

#### Structure and Organization
- Use consistent naming conventions
- Organize links and joints logically
- Include proper mass and inertia values
- Validate the kinematic tree structure

#### Material and Visual Properties
- Use realistic materials for visualization
- Separate visual and collision geometry appropriately
- Optimize collision geometry for performance

### SDF Best Practices

#### Simulation Parameters
- Use appropriate physics parameters for your application
- Balance accuracy with performance requirements
- Include proper damping and friction values
- Consider the computational requirements

#### Plugin Configuration
- Use appropriate update rates for sensors
- Configure plugins for your specific needs
- Test plugins independently when possible
- Document plugin parameters for reproducibility

### Humanoid-Specific Considerations

#### Balance and Stability
- Ensure realistic mass distribution
- Use appropriate friction coefficients for feet
- Consider center of mass position
- Validate bipedal stability in simulation

#### Actuator Modeling
- Include realistic joint limits and velocities
- Model actuator dynamics appropriately
- Consider safety limits and constraints
- Validate actuator capabilities

## Integration with ROS 2

### Robot State Publisher
```xml
<node pkg="robot_state_publisher" exec="robot_state_publisher" name="robot_state_publisher">
  <param name="robot_description" value="...urdf content..."/>
  <param name="use_sim_time" value="true"/>
</node>
```

### Joint State Publisher
```xml
<node pkg="joint_state_publisher" exec="joint_state_publisher" name="joint_state_publisher">
  <param name="use_gui" value="false"/>
  <param name="rate" value="50"/>
</node>
```

### Gazebo Integration Node
```xml
<node pkg="gazebo_ros" exec="spawn_entity.py" name="spawn_robot"
      args="-entity my_robot -topic robot_description -x 0 -y 0 -z 1.0">
</node>
```

## Summary

URDF and SDF are complementary formats that together enable comprehensive robot description and simulation. URDF provides the robot structure for ROS integration, while SDF adds simulation-specific details for Gazebo. Understanding both formats and their integration is essential for effective humanoid robot simulation. The use of Xacro macros helps manage the complexity of full humanoid models, while proper validation ensures reliable simulation results.

---

## Further Reading

- ROS URDF tutorials and documentation
- Gazebo SDF documentation
- "Robotics, Vision and Control" by Peter Corke
- Xacro documentation and best practices
- Physics simulation in robotics literature
- Gazebo source code and examples