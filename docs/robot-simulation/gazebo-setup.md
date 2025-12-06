---
sidebar_label: Gazebo Setup
title: Gazebo Setup
---

# Gazebo Setup

## Introduction to Gazebo Simulation

Gazebo is a powerful 3D simulation environment that plays a crucial role in robotics development, particularly for humanoid robots. It provides realistic physics simulation, high-quality graphics, and seamless integration with ROS 2, making it an essential tool for testing, validation, and development of robotic systems before deployment on real hardware.

## Gazebo Architecture and Components

### Core Components

Gazebo consists of several key components that work together to provide a comprehensive simulation environment:

#### Physics Engine
- **ODE (Open Dynamics Engine)**: Default physics engine for realistic rigid body dynamics
- **Bullet**: Alternative physics engine with different performance characteristics
- **DART**: Dynamic Animation and Robotics Toolkit for complex articulated systems
- **Simbody**: Multibody dynamics engine for biomechanics and robotics

#### Rendering Engine
- **OGRE**: High-quality 3D graphics rendering
- **OpenGL**: Hardware-accelerated graphics
- **Realistic lighting**: Shadows, reflections, and environmental effects

#### Sensor Simulation
- **Camera sensors**: RGB, depth, and stereo vision
- **LIDAR**: 2D and 3D laser range finders
- **IMU**: Inertial measurement units
- **Force/Torque**: Joint and contact force sensors
- **GPS**: Global positioning system simulation

### Gazebo Versions

#### Gazebo Classic vs. Gazebo Garden/Harmonic
- **Gazebo Classic**: Traditional standalone application
- **Gazebo Garden/Harmonic**: Modern, modular architecture
- **ROS 2 Integration**: Both support ROS 2 interfaces, but with different plugin systems

## Installing Gazebo

### Installation Methods

#### Ubuntu/Debian
```bash
# For ROS 2 Humble Hawksbill
sudo apt update
sudo apt install ros-humble-gazebo-ros-pkgs
sudo apt install ros-humble-gazebo-dev

# For other ROS 2 distributions, replace 'humble' with your distribution name
```

#### From Source (Advanced Users)
```bash
# Install dependencies
sudo apt install cmake pkg-config libtinyxml2-dev libtbb-dev \
    libgts-dev libboost-regex-dev libboost-system-dev \
    libboost-thread-dev libprotobuf-dev protobuf-compiler \
    libprotoc-dev libignition-transport-dev libignition-msgs-dev \
    libignition-common-dev libignition-fuel-tools-dev

# Clone and build (for the latest features)
git clone https://github.com/gazebosim/gazebo
cd gazebo
mkdir build && cd build
cmake ..
make -j4
sudo make install
```

### Verification of Installation

```bash
# Check Gazebo version
gazebo --version

# Launch Gazebo GUI
gazebo

# For Gazebo Garden/Harmonic
gz sim --version
```

## Gazebo Configuration and Environment

### Environment Variables

#### Gazebo Model Path
```bash
# Add custom models to Gazebo's search path
export GZ_SIM_RESOURCE_PATH=$GZ_SIM_RESOURCE_PATH:/path/to/custom/models
export GAZEBO_MODEL_PATH=$GAZEBO_MODEL_PATH:/path/to/custom/models
```

#### Plugin Path
```bash
# Set plugin search paths
export GZ_SIM_SYSTEM_PLUGIN_PATH=$GZ_SIM_SYSTEM_PLUGIN_PATH:/path/to/plugins
export GAZEBO_PLUGIN_PATH=$GAZEBO_PLUGIN_PATH:/path/to/plugins
```

### Configuration Files

#### ~/.gazebo/config
```xml
<gazebo>
  <cache_location>~/.gazebo/cache</cache_location>
  <http_proxy></http_proxy>
  <https_proxy></https_proxy>
  <plugins_path>~/.gazebo/plugins</plugins_path>
  <models_path>~/.gazebo/models</models_path>
  <materials_path>~/.gazebo/materials</materials_path>
  <worlds_path>~/.gazebo/worlds</worlds_path>
  <default_gui_camera_pose>-1.0 -1.0 1.5 0.0 0.3 1.57</default_gui_camera_pose>
</gazebo>
```

## Basic Gazebo Usage

### Launching Gazebo

#### Simple Launch
```bash
# Launch Gazebo with empty world
gazebo

# Launch with specific world
gazebo worlds/empty.world

# Launch with GUI disabled (headless)
gazebo -s libgazebo_ros_factory.so worlds/empty.world
```

#### With ROS 2 Integration
```bash
# Launch Gazebo with ROS 2 plugins
gazebo --verbose worlds/empty.world \
  -s libgazebo_ros_factory.so \
  -s libgazebo_ros_init.so
```

### Gazebo GUI Interface

#### Main Components
- **Scene**: 3D visualization of the simulation
- **Tools**: Model editor, pose editor, layer manager
- **Layers**: Scene objects, models, lights, etc.
- **Properties**: Selected object properties
- **Timeline**: Simulation time control

#### Navigation Controls
- **Orbit**: Right-click + drag
- **Pan**: Middle-click + drag
- **Zoom**: Scroll wheel or right-click + drag vertically
- **Focus**: Double-click on an object

## World Files

### World File Structure

A basic Gazebo world file:

```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="my_world">
    <!-- Physics engine configuration -->
    <physics name="1ms" type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
      <gravity>0 0 -9.8</gravity>
    </physics>

    <!-- GUI configuration -->
    <gui fullscreen="0">
      <camera name="user_camera">
        <pose>-5 -5 5 0 0.5 1.5708</pose>
        <view_controller>orbit</view_controller>
        <projection_type>perspective</projection_type>
      </camera>
    </gui>

    <!-- Lighting -->
    <light name="sun" type="directional">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.8 0.8 0.8 1</diffuse>
      <specular>0.2 0.2 0.2 1</specular>
      <attenuation>
        <range>1000</range>
        <constant>0.9</constant>
        <linear>0.01</linear>
        <quadratic>0.001</quadratic>
      </attenuation>
      <direction>-0.6 -0.4 -0.8</direction>
    </light>

    <!-- Ground plane -->
    <include>
      <uri>model://ground_plane</uri>
    </include>

    <!-- Sky -->
    <include>
      <uri>model://sun</uri>
    </include>

    <!-- Your models go here -->
    <model name="my_robot">
      <!-- Model definition -->
    </model>
  </world>
</sdf>
```

### Creating Custom Worlds

#### Empty World with Custom Parameters
```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="custom_empty_world">
    <physics name="ode" type="ode">
      <gravity>0 0 -9.80665</gravity>
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
      <ode>
        <solver>
          <type>quick</type>
          <iters>10</iters>
          <sor>1.3</sor>
        </solver>
        <constraints>
          <cfm>0</cfm>
          <erp>0.2</erp>
          <contact_max_correcting_vel>100</contact_max_correcting_vel>
          <contact_surface_layer>0.001</contact_surface_layer>
        </constraints>
      </ode>
    </physics>

    <light name="sun" type="directional">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.8 0.8 0.8 1</diffuse>
      <specular>0.2 0.2 0.2 1</specular>
      <attenuation>
        <range>1000</range>
        <constant>0.9</constant>
        <linear>0.01</linear>
        <quadratic>0.001</quadratic>
      </attenuation>
      <direction>-0.6 -0.4 -0.8</direction>
    </light>

    <model name="ground_plane">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>100 100</size>
            </plane>
          </geometry>
          <surface>
            <friction>
              <ode>
                <mu>1.0</mu>
                <mu2>1.0</mu2>
              </ode>
            </friction>
          </surface>
        </collision>
        <visual name="visual">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>100 100</size>
            </plane>
          </geometry>
          <material>
            <ambient>0.7 0.7 0.7 1</ambient>
            <diffuse>0.7 0.7 0.7 1</diffuse>
            <specular>0.0 0.0 0.0 1</specular>
          </material>
        </visual>
      </link>
    </model>
  </world>
</sdf>
```

## Model Integration

### Adding Models to Gazebo

#### Using Built-in Models
```bash
# Gazebo comes with many built-in models
# They can be found in /usr/share/gazebo/models or similar
# Common models: ground_plane, sun, shapes, etc.
```

#### Custom Models Directory Structure
```
~/.gazebo/models/my_robot/
├── model.config          # Model metadata
└── model.sdf             # Model definition
```

#### model.config Example
```xml
<?xml version="1.0"?>
<model>
  <name>My Robot</name>
  <version>1.0</version>
  <sdf version="1.7">model.sdf</sdf>
  <author>
    <name>Your Name</name>
    <email>your.email@example.com</email>
  </author>
  <description>A sample robot model</description>
</model>
```

## ROS 2 Integration Setup

### Gazebo ROS Packages

#### Essential Packages
```bash
# Core Gazebo ROS packages
sudo apt install ros-humble-gazebo-ros
sudo apt install ros-humble-gazebo-ros-pkgs
sudo apt install ros-humble-gazebo-plugins
sudo apt install ros-humble-gazebo-dev
```

### Launch Files for Gazebo

#### Basic Gazebo Launch
```python
# launch/gazebo.launch.py
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import PathJoinSubstitution
from launch_ros.substitutions import FindPackageShare
from launch.actions import ExecuteProcess
import os


def generate_launch_description():
    # Launch Gazebo with empty world
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            PathJoinSubstitution([
                FindPackageShare('gazebo_ros'),
                'launch',
                'gazebo.launch.py'
            ])
        ]),
        launch_arguments={
            'world': PathJoinSubstitution([
                FindPackageShare('my_robot_package'),
                'worlds',
                'my_world.world'
            ])
        }.items()
    )

    return LaunchDescription([
        gazebo
    ])
```

#### Launch with Robot Spawn
```python
# launch/robot_gazebo.launch.py
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import Command, FindExecutable, PathJoinSubstitution
from launch_ros.actions import Node, SpawnEntity
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    # Declare arguments
    use_sim_time = DeclareLaunchArgument(
        'use_sim_time',
        default_value='true',
        description='Use simulation time'
    )

    # Launch Gazebo
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            PathJoinSubstitution([
                FindPackageShare('gazebo_ros'),
                'launch',
                'gazebo.launch.py'
            ])
        ]),
    )

    # Robot State Publisher
    robot_description_content = Command([
        PathJoinSubstitution([FindExecutable(name="xacro")]),
        " ",
        PathJoinSubstitution([
            FindPackageShare("my_robot_package"),
            "urdf",
            "my_robot.urdf.xacro"
        ]),
    ])

    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        name='robot_state_publisher',
        output='screen',
        parameters=[{
            'use_sim_time': True,
            'robot_description': robot_description_content
        }]
    )

    # Spawn robot in Gazebo
    spawn_entity = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=[
            '-topic', 'robot_description',
            '-entity', 'my_robot'
        ],
        output='screen'
    )

    return LaunchDescription([
        use_sim_time,
        gazebo,
        robot_state_publisher,
        spawn_entity
    ])
```

## Gazebo Plugins for Humanoid Robots

### Essential Plugins

#### Joint State Publisher
```xml
<gazebo>
  <plugin name="joint_state_publisher" filename="libgazebo_ros_joint_state_publisher.so">
    <ros>
      <namespace>/my_robot</namespace>
      <remapping>~/out:=joint_states</remapping>
    </ros>
    <update_rate>30</update_rate>
    <joint_name>joint1</joint_name>
    <joint_name>joint2</joint_name>
    <!-- Add more joint names as needed -->
  </plugin>
</gazebo>
```

#### Joint Position/Velocity/Effort Controllers
```xml
<gazebo>
  <plugin name="joint_trajectory_controller" filename="libgazebo_ros_joint_trajectory.so">
    <ros>
      <namespace>/my_robot</namespace>
    </ros>
    <joint_name>left_hip_joint</joint_name>
    <topic>joint_trajectory</topic>
    <update_rate>100</update_rate>
  </plugin>
</gazebo>
```

#### IMU Sensor Plugin
```xml
<gazebo reference="imu_link">
  <sensor name="imu_sensor" type="imu">
    <always_on>true</always_on>
    <update_rate>100</update_rate>
    <visualize>true</visualize>
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

## Performance Optimization

### Physics Settings

#### Real-time Performance
```xml
<physics name="real_time_physics" type="ode">
  <max_step_size>0.001</max_step_size>  <!-- Smaller for accuracy, larger for speed -->
  <real_time_factor>1.0</real_time_factor>  <!-- Set to 1.0 for real-time -->
  <real_time_update_rate>1000</real_time_update_rate>
  <gravity>0 0 -9.80665</gravity>
</physics>
```

#### Solver Configuration
```xml
<ode>
  <solver>
    <type>quick</type>  <!-- quick, world, or pgsp */
    <iters>20</iters>   <!-- More iterations = more accurate but slower */
    <sor>1.3</sor>      <!-- Successive over-relaxation parameter */
  </solver>
  <constraints>
    <cfm>0.000001</cfm>  <!-- Constraint force mixing */
    <erp>0.2</erp>       <!-- Error reduction parameter */
    <contact_max_correcting_vel>100</contact_max_correcting_vel>
    <contact_surface_layer>0.001</contact_surface_layer>
  </constraints>
</ode>
```

### Graphics Settings

#### Quality vs. Performance Trade-offs
```xml
<scene>
  <ambient>0.4 0.4 0.4 1</ambient>
  <background>0.7 0.7 0.7 1</background>
  <shadows>true</shadows>  <!-- Disable for better performance -->
  <grid>false</grid>       <!-- Disable grid for better performance -->
  <origin_visual>false</origin_visual>  <!-- Disable origin visuals for better performance -->
</scene>
```

## Troubleshooting Common Issues

### Installation Issues

#### Missing Dependencies
```bash
# Check for missing dependencies
ldd $(which gazebo)

# Install common missing dependencies
sudo apt install libgazebo11-dev libsdformat9-dev libignition-math6-dev
```

#### OpenGL Issues
```bash
# Check OpenGL support
glxinfo | grep -i "direct rendering"
glxinfo | grep -i "opengl"

# For virtual machines or remote systems, consider software rendering
export LIBGL_ALWAYS_SOFTWARE=1
```

### Runtime Issues

#### Segmentation Faults
- Check for incompatible plugin versions
- Verify model SDF file syntax
- Ensure sufficient memory allocation

#### Performance Problems
- Reduce physics update rate
- Simplify collision models
- Disable unnecessary visuals
- Use simpler physics engine

### ROS 2 Integration Issues

#### Topic Connection Problems
```bash
# Check available topics
ros2 topic list

# Verify Gazebo plugins are loaded
gz topic -l  # For Gazebo Garden/Harmonic
```

## Advanced Configuration

### Custom Physics Properties

#### Material Properties for Humanoid Simulation
```xml
<surface>
  <friction>
    <ode>
      <mu>0.8</mu>    <!-- Coefficient of friction -->
      <mu2>0.8</mu2>  <!-- Secondary friction coefficient -->
      <fdir1>0 0 0</fdir1>  <!-- Friction direction -->
    </ode>
    <torsional>
      <coefficient>1.0</coefficient>
      <patch_radius>0.01</patch_radius>
      <surface_radius>0.01</surface_radius>
      <use_patch_radius>false</use_patch_radius>
      <ode>
        <slip>0.0</slip>
      </ode>
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
      <max_vel>100.0</max_vel>
      <min_depth>0.001</min_depth>
    </ode>
  </contact>
</surface>
```

### Multi-Robot Simulation

#### World with Multiple Robots
```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="multi_robot_world">
    <!-- Physics -->
    <physics name="default_physics" type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
      <real_time_update_rate>1000</real_time_update_rate>
    </physics>

    <!-- Ground plane -->
    <include>
      <uri>model://ground_plane</uri>
    </include>

    <!-- Robot 1 -->
    <model name="robot1">
      <pose>0 0 0.5 0 0 0</pose>
      <!-- Robot model definition -->
    </model>

    <!-- Robot 2 -->
    <model name="robot2">
      <pose>2 0 0.5 0 0 0</pose>
      <!-- Robot model definition -->
    </model>

    <!-- Additional models, obstacles, etc. -->
  </world>
</sdf>
```

## Best Practices

### Model Development
- Start with simple shapes and gradually add complexity
- Use appropriate collision geometry (simpler than visual geometry)
- Test models in isolation before integration
- Validate mass and inertia properties

### World Design
- Begin with simple worlds and add complexity gradually
- Use appropriate physics parameters for your application
- Consider computational requirements vs. simulation fidelity
- Document world parameters for reproducibility

### Performance Considerations
- Balance simulation quality with performance requirements
- Use appropriate update rates for your application
- Consider headless operation for automated testing
- Profile and optimize for your specific use case

## Summary

Setting up Gazebo for humanoid robot simulation requires careful attention to installation, configuration, and integration with ROS 2. The modular architecture of modern Gazebo provides flexibility for different simulation requirements, while the extensive plugin system enables sophisticated robot simulation. Proper configuration of physics parameters, graphics settings, and ROS 2 integration is essential for effective humanoid robot development and testing in simulation.

---

## Further Reading

- Gazebo documentation: http://gazebosim.org/
- ROS 2 Gazebo tutorials
- "Programming Robots with ROS" by Quigley et al.
- Physics simulation in robotics literature
- Gazebo source code and examples