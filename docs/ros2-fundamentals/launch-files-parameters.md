---
sidebar_label: Launch Files & Parameters
title: Launch Files & Parameters
---

# Launch Files & Parameters in ROS 2

## Introduction to Launch Systems

The launch system in ROS 2 provides a powerful mechanism for starting multiple nodes simultaneously with specific configurations. Unlike ROS 1, ROS 2 uses a Python-based launch system that offers greater flexibility, better error handling, and more sophisticated configuration management. This system is essential for deploying complex robotic systems with multiple interconnected nodes.

## Launch System Architecture

### Evolution from ROS 1

The ROS 2 launch system addresses several limitations of ROS 1:

#### ROS 1 Limitations
- **XML-based**: Limited programmability and complex logic
- **Centralized**: Required a master node to coordinate
- **Inflexible**: Difficult to handle conditional launches
- **Error-prone**: Limited error handling and recovery

#### ROS 2 Advantages
- **Python-based**: Full programmability with conditional logic
- **Decentralized**: No dependency on a central master
- **Flexible**: Support for complex launch scenarios
- **Robust**: Better error handling and debugging

### Core Components

#### Launch Description
- **LaunchDescription**: The root container for launch entities
- **LaunchContext**: Runtime context for launch execution
- **LaunchService**: The main service that executes launch descriptions

#### Launch Actions
- **Node**: Launch a ROS 2 node
- **ExecuteProcess**: Launch any executable process
- **TimerAction**: Delayed execution of actions
- **LogInfo**: Log messages during launch

## Launch File Structure

### Basic Launch File

A minimal launch file follows this structure:

```python
# launch/basic_launch.py
from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    """
    Generate the launch description for the system.

    Returns:
        LaunchDescription: The launch description containing all launch entities
    """
    # Create nodes
    talker_node = Node(
        package='demo_nodes_py',
        executable='talker',
        name='talker_node'
    )

    listener_node = Node(
        package='demo_nodes_py',
        executable='listener',
        name='listener_node'
    )

    # Return launch description
    return LaunchDescription([
        talker_node,
        listener_node
    ])
```

### Advanced Launch File Structure

A more complex launch file with arguments and conditional logic:

```python
# launch/advanced_launch.py
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, TimerAction
from launch.substitutions import LaunchConfiguration, TextSubstitution
from launch.conditions import IfCondition
from launch_ros.actions import Node


def generate_launch_description():
    """
    Advanced launch file with arguments and conditional logic.
    """
    # Declare launch arguments
    namespace_arg = DeclareLaunchArgument(
        'namespace',
        default_value='robot1',
        description='Robot namespace'
    )

    use_sim_time_arg = DeclareLaunchArgument(
        'use_sim_time',
        default_value='false',
        choices=['true', 'false'],
        description='Use simulation time'
    )

    debug_arg = DeclareLaunchArgument(
        'debug',
        default_value='false',
        choices=['true', 'false'],
        description='Enable debug mode'
    )

    # Get launch configurations
    namespace = LaunchConfiguration('namespace')
    use_sim_time = LaunchConfiguration('use_sim_time')
    debug = LaunchConfiguration('debug')

    # Create nodes
    robot_controller = Node(
        package='my_robot_package',
        executable='robot_controller',
        name='robot_controller',
        namespace=namespace,
        parameters=[
            {'use_sim_time': use_sim_time},
            {'robot_namespace': namespace}
        ],
        output='screen'
    )

    sensor_driver = Node(
        package='my_robot_package',
        executable='sensor_driver',
        name='sensor_driver',
        namespace=namespace,
        parameters=[
            {'use_sim_time': use_sim_time}
        ],
        condition=IfCondition(debug)  # Only launch if debug is true
    )

    # Create launch description
    ld = LaunchDescription()

    # Add arguments
    ld.add_action(namespace_arg)
    ld.add_action(use_sim_time_arg)
    ld.add_action(debug_arg)

    # Add nodes
    ld.add_action(robot_controller)
    ld.add_action(sensor_driver)

    return ld
```

## Launch Arguments and Substitutions

### Launch Arguments

Launch arguments allow runtime configuration of launch files:

```python
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration

def generate_launch_description():
    # Declare arguments with default values
    robot_name_arg = DeclareLaunchArgument(
        'robot_name',
        default_value='my_robot',
        description='Name of the robot'
    )

    max_velocity_arg = DeclareLaunchArgument(
        'max_velocity',
        default_value='0.5',
        description='Maximum linear velocity'
    )

    # Use launch configurations in nodes
    robot_node = Node(
        package='my_robot_package',
        executable='robot_controller',
        name='robot_controller',
        parameters=[
            {'robot_name': LaunchConfiguration('robot_name')},
            {'max_velocity': LaunchConfiguration('max_velocity')}
        ]
    )

    return LaunchDescription([
        robot_name_arg,
        max_velocity_arg,
        robot_node
    ])
```

### Common Substitutions

#### Text Substitution
```python
from launch.substitutions import TextSubstitution

# Combine text with launch configurations
combined_name = [LaunchConfiguration('namespace'), '_', TextSubstitution(text='controller')]
```

#### Path Substitution
```python
from launch.substitutions import PathJoinSubstitution
from ament_index_python.packages import get_package_share_directory

# Get package share directory
config_file_path = PathJoinSubstitution([
    get_package_share_directory('my_robot_package'),
    'config',
    'robot_params.yaml'
])
```

#### Environment Substitution
```python
from launch.substitutions import EnvironmentVariable

# Use environment variables
home_dir = EnvironmentVariable('HOME')
```

## Node Configuration in Launch Files

### Basic Node Launch

```python
from launch_ros.actions import Node

basic_node = Node(
    package='demo_nodes_py',           # Package name
    executable='talker',               # Executable name (matches setup.py entry point)
    name='talker_node',                # Node name in ROS graph
    namespace='my_namespace',          # Node namespace
    parameters=[{'param1': 'value1'}], # Parameter values
    remappings=[('/original_topic', '/remapped_topic')],  # Topic remappings
    output='screen',                   # Output destination
    respawn=True,                      # Restart if node dies
    respawn_delay=5.0                  # Delay before restart
)
```

### Advanced Node Configuration

```python
from launch_ros.actions import Node
from launch.substitutions import LaunchConfiguration

advanced_node = Node(
    package='my_robot_package',
    executable='robot_controller',
    name='robot_controller',
    namespace=LaunchConfiguration('namespace'),
    parameters=[
        # From launch configuration
        {'use_sim_time': LaunchConfiguration('use_sim_time')},

        # From YAML file
        PathJoinSubstitution([
            get_package_share_directory('my_robot_package'),
            'config',
            'robot_params.yaml'
        ]),

        # Inline parameters
        {
            'robot_name': 'advanced_robot',
            'max_linear_vel': 1.0,
            'max_angular_vel': 2.0
        }
    ],
    remappings=[
        ('/cmd_vel', 'cmd_vel'),
        ('/scan', 'scan'),
        ('/odom', 'odom')
    ],
    output='both',  # Both log file and screen
    respawn=True,
    respawn_delay=2.0,
    arguments=['--ros-args', '--log-level', 'info'],  # Additional arguments
    on_exit=[]  # Actions to perform when node exits
)
```

## Parameter Management

### Parameter Sources

ROS 2 parameters can come from multiple sources with the following priority:

1. **Command line**: Parameters passed directly to the node
2. **Launch file**: Parameters specified in the launch file
3. **Parameter file**: YAML files loaded by the node
4. **Node defaults**: Default values declared in the node

### Parameter Files

#### YAML Parameter File Structure
```yaml
# config/robot_params.yaml
/**:  # Applies to all nodes
  ros__parameters:
    use_sim_time: false
    global_param: "global_value"

my_robot:  # Applies to nodes with name 'my_robot'
  ros__parameters:
    robot_specific_param: 123

my_robot.robot_controller:  # Applies to specific node
  ros__parameters:
    controller_frequency: 50.0
    max_velocity: 0.5
    safety_distance: 0.8
    sensors:
      laser_topic: "/scan"
      camera_topic: "/camera/image_raw"
    navigation:
      goal_tolerance: 0.1
      rotation_threshold: 0.2
```

### Loading Parameters in Launch Files

```python
from launch.substitutions import PathJoinSubstitution
from ament_index_python.packages import get_package_share_directory

def generate_launch_description():
    # Get parameter file path
    param_file_path = PathJoinSubstitution([
        get_package_share_directory('my_robot_package'),
        'config',
        'robot_params.yaml'
    ])

    # Launch node with parameter file
    robot_node = Node(
        package='my_robot_package',
        executable='robot_controller',
        name='robot_controller',
        parameters=[param_file_path],
        output='screen'
    )

    return LaunchDescription([robot_node])
```

### Dynamic Parameter Handling

```python
from launch.actions import SetParameter

def generate_launch_description():
    # Set global parameters for all nodes in launch
    set_global_param = SetParameter(name='use_sim_time', value=True)

    robot_node = Node(
        package='my_robot_package',
        executable='robot_controller',
        name='robot_controller',
        parameters=[
            {'robot_name': 'dynamic_robot'}
        ]
    )

    return LaunchDescription([
        set_global_param,
        robot_node
    ])
```

## Conditional Launch and Logic

### Conditional Actions

```python
from launch.conditions import IfCondition, UnlessCondition
from launch.substitutions import LaunchConfiguration

def generate_launch_description():
    # Declare debug argument
    debug_arg = DeclareLaunchArgument(
        'debug',
        default_value='false',
        description='Enable debug mode'
    )

    # Conditionally launch nodes
    debug_node = Node(
        package='my_robot_package',
        executable='debug_node',
        name='debug_node',
        condition=IfCondition(LaunchConfiguration('debug'))
    )

    normal_node = Node(
        package='my_robot_package',
        executable='normal_node',
        name='normal_node',
        condition=UnlessCondition(LaunchConfiguration('debug'))
    )

    return LaunchDescription([
        debug_arg,
        debug_node,
        normal_node
    ])
```

### Multiple Conditions

```python
from launch.conditions import AndCondition, OrCondition, NotCondition

def generate_launch_description():
    sim_arg = DeclareLaunchArgument('use_sim', default_value='false')
    debug_arg = DeclareLaunchArgument('debug', default_value='false')

    # Launch if both sim and debug are true
    sim_debug_node = Node(
        package='my_robot_package',
        executable='sim_debug_node',
        condition=AndCondition([
            LaunchConfiguration('use_sim'),
            LaunchConfiguration('debug')
        ])
    )

    # Launch if either sim or debug is true
    conditional_node = Node(
        package='my_robot_package',
        executable='conditional_node',
        condition=OrCondition([
            LaunchConfiguration('use_sim'),
            LaunchConfiguration('debug')
        ])
    )

    return LaunchDescription([
        sim_arg,
        debug_arg,
        sim_debug_node,
        conditional_node
    ])
```

## Advanced Launch Patterns

### Timer Actions

Launch actions with delays:

```python
from launch.actions import TimerAction
from launch_ros.actions import Node

def generate_launch_description():
    first_node = Node(
        package='my_robot_package',
        executable='first_node',
        name='first_node'
    )

    delayed_node = TimerAction(
        period=5.0,  # Wait 5 seconds
        actions=[
            Node(
                package='my_robot_package',
                executable='delayed_node',
                name='delayed_node'
            )
        ]
    )

    return LaunchDescription([
        first_node,
        delayed_node
    ])
```

### Group Actions

Launch multiple actions together:

```python
from launch.actions import GroupAction
from launch_ros.actions import PushRosNamespace

def generate_launch_description():
    # Group nodes under a namespace
    robot_group = GroupAction(
        actions=[
            PushRosNamespace('robot1'),
            Node(
                package='my_robot_package',
                executable='robot_controller',
                name='robot_controller'
            ),
            Node(
                package='my_robot_package',
                executable='sensor_driver',
                name='sensor_driver'
            )
        ]
    )

    return LaunchDescription([robot_group])
```

### Include Other Launch Files

```python
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import PathJoinSubstitution

def generate_launch_description():
    # Include another launch file
    included_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            PathJoinSubstitution([
                get_package_share_directory('other_package'),
                'launch',
                'other_launch.py'
            ])
        ),
        launch_arguments={'param1': 'value1'}.items()
    )

    return LaunchDescription([included_launch])
```

## Parameter Validation and Types

### Parameter Descriptors

Define parameter constraints in nodes:

```python
from rclpy.parameter import ParameterType
from rcl_interfaces.msg import ParameterDescriptor, FloatingPointRange, IntegerRange

class RobotNode(Node):
    def __init__(self):
        super().__init__('robot_node')

        # Declare parameter with descriptor
        velocity_descriptor = ParameterDescriptor(
            type=ParameterType.PARAMETER_DOUBLE,
            description='Maximum linear velocity',
            floating_point_range=[FloatingPointRange(from_value=0.0, to_value=2.0, step=0.1)]
        )

        self.declare_parameter('max_velocity', 0.5, velocity_descriptor)

        # Integer parameter with range
        count_descriptor = ParameterDescriptor(
            type=ParameterType.PARAMETER_INTEGER,
            description='Number of iterations',
            integer_range=[IntegerRange(from_value=1, to_value=100, step=1)]
        )

        self.declare_parameter('iteration_count', 10, count_descriptor)
```

### Parameter Callbacks

Handle parameter changes:

```python
from rcl_interfaces.msg import SetParametersResult

def parameter_callback(self, parameters):
    """
    Callback for parameter changes.

    Args:
        parameters: List of parameters that changed

    Returns:
        SetParametersResult: Result of parameter setting
    """
    for param in parameters:
        if param.name == 'max_velocity' and param.type_ == Parameter.Type.DOUBLE:
            if 0.0 <= param.value <= 2.0:
                self.max_velocity = param.value
                self.get_logger().info(f'Max velocity updated to {param.value}')
            else:
                self.get_logger().error(f'Invalid velocity value: {param.value}')
                return SetParametersResult(successful=False)

    return SetParametersResult(successful=True)

# Add callback to node
self.add_on_set_parameters_callback(self.parameter_callback)
```

## Command Line Usage

### Launching with Arguments

```bash
# Launch with default arguments
ros2 launch my_robot_package basic_launch.py

# Launch with specific arguments
ros2 launch my_robot_package advanced_launch.py namespace:=robot2 use_sim_time:=true

# Launch with multiple arguments
ros2 launch my_robot_package advanced_launch.py \
  namespace:=robot3 \
  use_sim_time:=true \
  debug:=true \
  max_velocity:=1.0
```

### Launch File Information

```bash
# Show launch arguments
ros2 launch my_robot_package advanced_launch.py --show-args

# List all available launch files in a package
find $(ros2 pkg prefix my_robot_package)/share/my_robot_package/launch -name "*.py"

# Get information about a running launch
ros2 launch my_robot_package advanced_launch.py --print
```

## Best Practices

### Launch File Organization

#### Directory Structure
```
my_robot_package/
├── launch/
│   ├── robot_launch.py          # Main robot launch
│   ├── simulation_launch.py     # Simulation-specific launch
│   ├── hardware_launch.py       # Hardware-specific launch
│   └── include/
│       ├── common_nodes.py      # Common node definitions
│       └── robot_description.py # Robot-specific configurations
├── config/
│   ├── robot_params.yaml        # Robot parameters
│   ├── simulation_params.yaml   # Simulation parameters
│   └── hardware_params.yaml     # Hardware parameters
```

#### Modular Launch Files
```python
# launch/include/robot_nodes.py
from launch_ros.actions import Node

def get_robot_nodes(namespace, use_sim_time=False):
    """
    Get common robot nodes for a given namespace.

    Args:
        namespace: Robot namespace
        use_sim_time: Whether to use simulation time

    Returns:
        List of Node actions
    """
    nodes = []

    controller = Node(
        package='my_robot_package',
        executable='robot_controller',
        name='robot_controller',
        namespace=namespace,
        parameters=[{'use_sim_time': use_sim_time}]
    )
    nodes.append(controller)

    driver = Node(
        package='my_robot_package',
        executable='sensor_driver',
        name='sensor_driver',
        namespace=namespace,
        parameters=[{'use_sim_time': use_sim_time}]
    )
    nodes.append(driver)

    return nodes
```

### Parameter Management Best Practices

#### Hierarchical Parameters
```yaml
# config/hierarchical_params.yaml
my_robot:  # Robot namespace
  robot_controller:  # Node name
    ros__parameters:
      controller:
        frequency: 50.0
        max_velocity: 0.5
        safety:
          distance: 0.8
          enabled: true
      sensors:
        laser:
          topic: "/scan"
          range_min: 0.1
          range_max: 30.0
        camera:
          topic: "/camera/image_raw"
          frame_id: "camera_link"
```

#### Parameter Validation
- Always validate parameter ranges in nodes
- Use parameter descriptors for constraints
- Provide meaningful default values
- Document parameter purposes clearly

### Error Handling

#### Graceful Degradation
```python
def generate_launch_description():
    try:
        # Try to get package directory
        pkg_dir = get_package_share_directory('my_robot_package')
    except PackageNotFoundError:
        # Fallback behavior
        pkg_dir = '/default/path'

    # Continue with launch description
    robot_node = Node(
        package='my_robot_package',
        executable='robot_controller',
        parameters=[
            PathJoinSubstitution([pkg_dir, 'config', 'robot_params.yaml'])
        ]
    )

    return LaunchDescription([robot_node])
```

## Common Launch Scenarios

### Simulation vs Hardware

```python
# launch/robot_launch.py
def generate_launch_description():
    # Declare mode argument
    mode_arg = DeclareLaunchArgument(
        'mode',
        default_value='simulation',
        choices=['simulation', 'hardware'],
        description='Launch mode: simulation or hardware'
    )

    # Include appropriate launch files based on mode
    simulation_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            PathJoinSubstitution([
                get_package_share_directory('my_robot_package'),
                'launch',
                'simulation_launch.py'
            ])
        ),
        condition=IfCondition(PythonExpression(["'", LaunchConfiguration('mode'), "' == 'simulation'"]))
    )

    hardware_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            PathJoinSubstitution([
                get_package_share_directory('my_robot_package'),
                'launch',
                'hardware_launch.py'
            ])
        ),
        condition=IfCondition(PythonExpression(["'", LaunchConfiguration('mode'), "' == 'hardware'"]))
    )

    return LaunchDescription([
        mode_arg,
        simulation_launch,
        hardware_launch
    ])
```

### Multi-Robot Systems

```python
# launch/multi_robot_launch.py
def generate_launch_description():
    # Declare robot count
    robot_count_arg = DeclareLaunchArgument(
        'robot_count',
        default_value='2',
        description='Number of robots to launch'
    )

    # Create launch description
    ld = LaunchDescription([robot_count_arg])

    # Add nodes for each robot
    for i in range(int(LaunchConfiguration('robot_count').perform(LaunchContext()))):
        robot_namespace = f'robot{i}'

        robot_node = Node(
            package='my_robot_package',
            executable='robot_controller',
            name=f'robot_controller_{i}',
            namespace=robot_namespace,
            parameters=[
                {'robot_id': i},
                {'robot_namespace': robot_namespace}
            ]
        )

        ld.add_action(robot_node)

    return ld
```

## Debugging Launch Files

### Launch File Debugging

#### Verbose Output
```bash
# Enable verbose output
ros2 launch my_robot_package robot_launch.py --launch-prefix 'xterm -e gdb --args'

# Debug launch file without executing
ros2 launch my_robot_package robot_launch.py --print
```

#### Common Debugging Steps
1. Check launch file syntax with Python interpreter
2. Verify package names and executable names
3. Confirm parameter file paths exist
4. Test individual nodes before launching together
5. Use `--show-args` to see available arguments

### Parameter Debugging

```bash
# List all parameters for a node
ros2 param list /robot1/robot_controller

# Get specific parameter value
ros2 param get /robot1/robot_controller max_velocity

# Set parameter at runtime
ros2 param set /robot1/robot_controller max_velocity 1.0
```

## Summary

The ROS 2 launch system provides a powerful and flexible mechanism for deploying complex robotic systems. The Python-based approach allows for sophisticated launch logic, conditional execution, and dynamic parameter management. Proper use of launch files and parameters enables maintainable, configurable robotic applications that can adapt to different environments and requirements. Understanding these concepts is crucial for effective ROS 2 development, particularly in complex systems with multiple nodes and configurations.

---

## Further Reading

- ROS 2 launch documentation and tutorials
- "Programming Robots with ROS" by Quigley et al.
- ROS 2 parameter system documentation
- Real-world launch file examples in popular ROS packages