---
sidebar_label: Creating ROS 2 Packages (Python)
title: Creating ROS 2 Packages (Python)
---

# Creating ROS 2 Packages (Python)

## Introduction to ROS 2 Packages

ROS 2 packages are the fundamental units of code organization in the Robot Operating System 2. A package contains nodes, libraries, configuration files, and other resources needed for a specific functionality. Creating well-structured ROS 2 packages is essential for developing maintainable, reusable, and shareable robotic software. This lesson focuses on creating packages specifically for Python-based ROS 2 applications.

## Package Structure and Organization

### Standard Package Layout

A typical ROS 2 Python package follows this structure:

```
my_robot_package/
├── CMakeLists.txt          # Build configuration for C++ packages
├── package.xml             # Package metadata and dependencies
├── setup.py                # Python package setup
├── setup.cfg               # Installation configuration
├── my_robot_package/       # Main Python package directory
│   ├── __init__.py         # Python package initialization
│   ├── my_node.py          # Python node implementation
│   ├── my_library.py       # Reusable Python library code
│   └── msg/                # Custom message definitions (if any)
│       ├── MyMessage.msg
│       └── CMakeLists.txt
├── launch/                 # Launch files
│   └── my_launch_file.launch.py
├── config/                 # Configuration files
│   └── params.yaml
├── test/                   # Test files
│   └── test_my_node.py
└── README.md               # Package documentation
```

### Essential Files

#### package.xml

The `package.xml` file contains metadata about the package:

```xml
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>my_robot_package</name>
  <version>0.0.0</version>
  <description>Example ROS 2 package for robot functionality</description>
  <maintainer email="user@example.com">Your Name</maintainer>
  <license>Apache License 2.0</license>

  <depend>rclpy</depend>
  <depend>std_msgs</depend>
  <depend>geometry_msgs</depend>

  <test_depend>ament_copyright</test_depend>
  <test_depend>ament_flake8</test_depend>
  <test_depend>ament_pep257</test_depend>
  <test_depend>python3-pytest</test_depend>

  <export>
    <build_type>ament_python</build_type>
  </export>
</package>
```

#### setup.py

The `setup.py` file configures the Python package:

```python
from setuptools import setup
from glob import glob
import os

package_name = 'my_robot_package'

setup(
    name=package_name,
    version='0.0.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        # Include launch files
        (os.path.join('share', package_name, 'launch'), glob('launch/*.py')),
        # Include config files
        (os.path.join('share', package_name, 'config'), glob('config/*.yaml')),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Your Name',
    maintainer_email='your.email@example.com',
    description='Example ROS 2 package for robot functionality',
    license='Apache License 2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'my_node = my_robot_package.my_node:main',
            'another_node = my_robot_package.another_node:main',
        ],
    },
)
```

#### setup.cfg

The `setup.cfg` file specifies installation settings:

```ini
[develop]
script-dir=$base/lib/my_robot_package
[install]
install-scripts=$base/lib/my_robot_package
```

## Creating a Package with colcon

### Using colcon create-pkg

The recommended way to create a new ROS 2 package is using the `ros2 pkg create` command:

```bash
# Create a Python package
ros2 pkg create --build-type ament_python my_robot_package

# Create with additional dependencies
ros2 pkg create --build-type ament_python --dependencies rclpy std_msgs geometry_msgs my_robot_package
```

### Manual Package Creation

If creating manually, ensure all necessary files are present:

```bash
# Create directory structure
mkdir -p my_robot_package/my_robot_package
mkdir -p my_robot_package/launch
mkdir -p my_robot_package/config
mkdir -p my_robot_package/test

# Create essential files
touch my_robot_package/my_robot_package/__init__.py
touch my_robot_package/setup.py
touch my_robot_package/setup.cfg
touch my_robot_package/README.md
```

## Python Node Implementation

### Basic Node Structure

A well-structured Python node should follow this pattern:

```python
#!/usr/bin/env python3
"""
Example ROS 2 node implementation
"""

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan
import math


class MyRobotNode(Node):
    """
    Example robot node implementation
    """

    def __init__(self):
        super().__init__('my_robot_node')

        # Declare parameters with default values
        self.declare_parameter('robot_name', 'my_robot')
        self.declare_parameter('loop_rate', 10)
        self.declare_parameter('safety_distance', 0.5)

        # Get parameter values
        self.robot_name = self.get_parameter('robot_name').value
        self.loop_rate = self.get_parameter('loop_rate').value
        self.safety_distance = self.get_parameter('safety_distance').value

        # Create publishers
        self.cmd_vel_pub = self.create_publisher(Twist, 'cmd_vel', 10)

        # Create subscribers
        self.laser_sub = self.create_subscription(
            LaserScan,
            'scan',
            self.laser_callback,
            10
        )

        # Create timers
        self.timer = self.create_timer(1.0/self.loop_rate, self.control_loop)

        # Initialize node-specific variables
        self.obstacle_distance = float('inf')
        self.linear_velocity = 0.0
        self.angular_velocity = 0.0

        self.get_logger().info(f'{self.robot_name} node initialized')

    def laser_callback(self, msg):
        """
        Callback function for laser scan data
        """
        # Process laser scan data to detect obstacles
        if len(msg.ranges) > 0:
            # Find minimum distance in front of robot
            front_ranges = msg.ranges[len(msg.ranges)//2-30:len(msg.ranges)//2+30]
            self.obstacle_distance = min(front_ranges) if front_ranges else float('inf')

    def control_loop(self):
        """
        Main control loop
        """
        msg = Twist()

        # Simple obstacle avoidance logic
        if self.obstacle_distance > self.safety_distance:
            msg.linear.x = 0.2  # Move forward
            msg.angular.z = 0.0
        else:
            msg.linear.x = 0.0
            msg.angular.z = 0.5  # Turn right

        self.cmd_vel_pub.publish(msg)


def main(args=None):
    """
    Main function
    """
    rclpy.init(args=args)

    try:
        robot_node = MyRobotNode()
        rclpy.spin(robot_node)
    except KeyboardInterrupt:
        pass
    finally:
        robot_node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### Node Best Practices

#### Parameter Management
```python
# Use parameter descriptors for validation
from rclpy.parameter import ParameterType
from rcl_interfaces.msg import ParameterDescriptor, FloatingPointRange

# Define parameter descriptor
velocity_descriptor = ParameterDescriptor(
    type=ParameterType.PARAMETER_DOUBLE,
    description='Maximum linear velocity',
    floating_point_range=[FloatingPointRange(from_value=0.0, to_value=2.0, step=0.1)]
)

# Declare parameter with descriptor
self.declare_parameter('max_velocity', 0.5, velocity_descriptor)
```

#### Error Handling
```python
def safe_publish(self, publisher, msg):
    """
    Safely publish a message with error handling
    """
    try:
        publisher.publish(msg)
    except Exception as e:
        self.get_logger().error(f'Failed to publish message: {e}')
```

## Launch Files for Python Packages

### Python Launch Files

ROS 2 uses Python-based launch files for complex system deployments:

```python
# launch/my_launch_file.launch.py
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    # Declare launch arguments
    namespace_arg = DeclareLaunchArgument(
        'namespace',
        default_value='my_robot',
        description='Robot namespace'
    )

    # Get launch configurations
    namespace = LaunchConfiguration('namespace')

    # Create nodes
    robot_node = Node(
        package='my_robot_package',
        executable='my_node',  # This matches the entry point in setup.py
        name='robot_controller',
        namespace=namespace,
        parameters=[
            {'robot_name': 'my_robot'},
            {'loop_rate': 20},
            {'safety_distance': 0.8}
        ],
        remappings=[
            ('/cmd_vel', 'cmd_vel'),
            ('/scan', 'scan')
        ],
        output='screen'
    )

    return LaunchDescription([
        namespace_arg,
        robot_node
    ])
```

### Launch File Best Practices

#### Conditional Launch
```python
from launch.conditions import IfCondition
from launch.substitutions import LaunchConfiguration

# Conditional argument
debug_arg = DeclareLaunchArgument(
    'debug',
    default_value='false',
    description='Enable debug mode'
)

# Conditional node
debug_node = Node(
    package='my_robot_package',
    executable='debug_node',
    condition=IfCondition(LaunchConfiguration('debug'))
)
```

## Configuration Files

### YAML Parameter Files

Parameter files allow configuration without code changes:

```yaml
# config/robot_params.yaml
my_robot:
  ros__parameters:
    robot_name: "my_robot"
    loop_rate: 20
    safety_distance: 0.8
    max_linear_velocity: 0.5
    max_angular_velocity: 1.0
    sensors:
      laser_scan_topic: "/scan"
      camera_topic: "/camera/image_raw"
    navigation:
      goal_tolerance: 0.1
      rotation_threshold: 0.2
```

### Loading Parameters in Nodes

```python
def __init__(self):
    super().__init__('my_robot_node')

    # Load parameters from file
    self.declare_parameter('robot_name', 'default_robot')
    self.declare_parameter('loop_rate', 10)
    self.declare_parameter('safety_distance', 0.5)

    # Access parameters
    self.robot_name = self.get_parameter('robot_name').value
    self.loop_rate = self.get_parameter('loop_rate').value
    self.safety_distance = self.get_parameter('safety_distance').value
```

## Testing Python Packages

### Unit Tests

Create comprehensive tests for your Python nodes:

```python
# test/test_my_node.py
import unittest
import rclpy
from rclpy.executors import SingleThreadedExecutor
from my_robot_package.my_node import MyRobotNode


class TestMyRobotNode(unittest.TestCase):

    def setUp(self):
        rclpy.init()
        self.node = MyRobotNode()
        self.executor = SingleThreadedExecutor()
        self.executor.add_node(self.node)

    def tearDown(self):
        self.node.destroy_node()
        rclpy.shutdown()

    def test_node_initialization(self):
        """Test that node initializes with correct parameters"""
        self.assertEqual(self.node.robot_name, 'my_robot')
        self.assertEqual(self.node.loop_rate, 10)

    def test_parameter_declaration(self):
        """Test that all required parameters are declared"""
        params = self.node.get_parameters([
            'robot_name',
            'loop_rate',
            'safety_distance'
        ])

        self.assertIsNotNone(params['robot_name'])
        self.assertIsNotNone(params['loop_rate'])
        self.assertIsNotNone(params['safety_distance'])


def test_main():
    unittest.main()


if __name__ == '__main__':
    test_main()
```

### Integration Tests

Test the interaction between multiple nodes:

```python
# test/test_integration.py
import rclpy
from std_msgs.msg import String
from geometry_msgs.msg import Twist


class TestRobotIntegration:

    def test_communication(self):
        """Test communication between nodes"""
        # Implementation for integration testing
        pass
```

## Package Dependencies

### Managing Dependencies

#### package.xml Dependencies
```xml
<depend>rclpy</depend>                    <!-- Core ROS 2 Python client library -->
<depend>std_msgs</depend>                 <!-- Standard message types -->
<depend>geometry_msgs</depend>            <!-- Geometry message types -->
<depend>sensor_msgs</depend>              <!-- Sensor message types -->
<depend>message_runtime</depend>          <!-- Message runtime support -->

<!-- Build dependencies -->
<build_depend>ament_cmake_python</build_depend>
<build_depend>rosidl_default_generators</build_depend>

<!-- Execution dependencies -->
<exec_depend>rosidl_default_runtime</exec_depend>
```

#### Python Dependencies

For additional Python libraries, add them to your package requirements:

```python
# setup.py
setup(
    # ... other setup parameters ...
    install_requires=[
        'setuptools',
        'numpy',
        'scipy',
        'opencv-python',  # Example additional dependency
    ],
)
```

## Building and Installing

### Building the Package

```bash
# Build the package
colcon build --packages-select my_robot_package

# Source the workspace
source install/setup.bash

# Run the node
ros2 run my_robot_package my_node
```

### Installing System Dependencies

```bash
# Install Python dependencies (if any)
pip3 install -r requirements.txt

# Or install system packages
sudo apt install python3-numpy python3-opencv
```

## Advanced Package Features

### Custom Message Types

Create custom message definitions:

```
# msg/RobotStatus.msg
string robot_name
float64 battery_level
bool is_charging
int32[] joint_positions
geometry_msgs/Pose current_pose
```

### Services and Actions

Define custom services:

```
# srv/MoveToGoal.srv
geometry_msgs/Pose target_pose
float64 tolerance
---
bool success
string message
```

Define custom actions:

```
# action/Navigation.action
geometry_msgs/Pose target_pose
---
bool success
string message
---
float64 distance_remaining
geometry_msgs/Pose current_pose
```

## Documentation and Code Quality

### Python Documentation

Follow Python documentation standards:

```python
class MyRobotNode(Node):
    """
    A ROS 2 node for robot control and navigation.

    This node implements basic robot control functionality including:
    - Obstacle avoidance
    - Parameter configuration
    - Sensor data processing
    - Command publishing

    Args:
        node_name (str): Name of the ROS node
        namespace (str, optional): Node namespace

    Attributes:
        obstacle_distance (float): Distance to nearest obstacle
        linear_velocity (float): Current linear velocity
        angular_velocity (float): Current angular velocity
    """

    def laser_callback(self, msg):
        """
        Process laser scan data to detect obstacles.

        Args:
            msg (sensor_msgs.msg.LaserScan): Laser scan message

        Returns:
            None
        """
        # Implementation
        pass
```

### Code Quality Tools

#### Linting
```bash
# Use flake8 for Python linting
flake8 my_robot_package/

# Use pylint for more comprehensive analysis
pylint my_robot_package/
```

#### Formatting
```bash
# Use black for code formatting
black my_robot_package/

# Use isort for import sorting
isort my_robot_package/
```

## Common Patterns and Templates

### Publisher Node Template
```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class PublisherNode(Node):
    def __init__(self):
        super().__init__('publisher_node')
        self.publisher = self.create_publisher(String, 'topic_name', 10)
        self.timer = self.create_timer(0.5, self.publish_message)
        self.counter = 0

    def publish_message(self):
        msg = String()
        msg.data = f'Message {self.counter}'
        self.publisher.publish(msg)
        self.counter += 1
```

### Subscriber Node Template
```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class SubscriberNode(Node):
    def __init__(self):
        super().__init__('subscriber_node')
        self.subscription = self.create_subscription(
            String, 'topic_name', self.callback, 10)
        self.subscription  # prevent unused variable warning

    def callback(self, msg):
        self.get_logger().info(f'Received: {msg.data}')
```

## Troubleshooting

### Common Issues

#### Import Errors
- Ensure `__init__.py` files exist in all Python directories
- Check that package is built and sourced properly
- Verify module names match directory structure

#### Parameter Issues
- Check that parameters are properly declared before use
- Ensure parameter names match between declaration and access
- Verify launch files are correctly configured

#### Build Issues
- Check that `package.xml` has correct dependencies
- Ensure `setup.py` is properly configured
- Verify that all required files are present

## Summary

Creating ROS 2 packages in Python involves understanding the standard package structure, proper configuration files, and best practices for node implementation. A well-structured package includes proper parameter management, comprehensive testing, clear documentation, and follows ROS 2 conventions. The modular nature of packages allows for reusable and maintainable robotic software that can be easily integrated into larger systems.

---

## Further Reading

- ROS 2 documentation: Creating packages
- Python style guide for ROS 2
- "Programming Robots with ROS" by Quigley et al.
- ROS 2 Python client library (rclpy) documentation