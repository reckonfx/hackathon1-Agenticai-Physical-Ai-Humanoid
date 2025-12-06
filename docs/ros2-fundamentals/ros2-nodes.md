---
sidebar_label: ROS 2 Nodes
title: ROS 2 Nodes
---

# ROS 2 Nodes

## Understanding Nodes in ROS 2

Nodes are the fundamental building blocks of any ROS 2 system. They represent individual processes that perform specific functions and communicate with other nodes through the ROS 2 communication infrastructure. Unlike ROS 1, where nodes were typically implemented as objects within a single process, ROS 2 nodes are designed to be independent processes that can run on different machines and communicate over networks.

## Node Fundamentals

### Node Definition and Purpose

A node in ROS 2 is:

- **An execution unit**: A process that performs a specific task
- **A communication entity**: Contains publishers, subscribers, services, and clients
- **A parameter container**: Manages configuration parameters
- **A lifecycle manager**: Can have explicit lifecycle states

### Node Naming and Uniqueness

Each node in a ROS 2 system must have a unique name within its namespace:

#### Name Requirements
- **Uniqueness**: Node names must be unique across all nodes in the system
- **Namespace awareness**: Names can include namespaces for organization
- **Validation**: Names must follow specific naming conventions

#### Node Namespaces
- **Organization**: Group related nodes under common namespaces
- **Scoping**: Prevent naming conflicts between different systems
- **Flexibility**: Allow parameter and topic remapping

## Creating Nodes

### Python Implementation

Creating a basic ROS 2 node in Python involves inheriting from the Node class:

```python
import rclpy
from rclpy.node import Node

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = 'Hello World: %d' % self.i
        self.publisher_.publish(msg)
        self.get_logger().info('Publishing: "%s"' % msg.data)
        self.i += 1

def main(args=None):
    rclpy.init(args=args)
    minimal_publisher = MinimalPublisher()
    rclpy.spin(minimal_publisher)
    minimal_publisher.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### C++ Implementation

Creating a node in C++ follows a similar pattern:

```cpp
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

using namespace std::chrono_literals;

class MinimalPublisher : public rclpy::Node
{
public:
    MinimalPublisher()
    : Node("minimal_publisher"), count_(0)
    {
        publisher_ = this->create_publisher<std_msgs::msg::String>("topic", 10);
        timer_ = this->create_wall_timer(
            500ms, std::bind(&MinimalPublisher::timer_callback, this));
    }

private:
    void timer_callback()
    {
        auto message = std_msgs::msg::String();
        message.data = "Hello, world! " + std::to_string(count_++);
        RCLCPP_INFO(this->get_logger(), "Publishing: '%s'", message.data.c_str());
        publisher_->publish(message);
    }
    rclcpp::TimerBase::SharedPtr timer_;
    rclcpp::Publisher<std_msgs::msg::String>::SharedPtr publisher_;
    size_t count_;
};
```

## Node Communication Entities

### Publishers

Publishers enable nodes to send messages to topics:

#### Publisher Creation
```python
publisher = self.create_publisher(
    msg_type=String,
    topic='topic_name',
    qos_profile=10  # or QoSProfile object
)
```

#### Publisher Configuration
- **Message type**: Strongly typed messages defined in .msg files
- **QoS profile**: Quality of Service settings for communication
- **Buffer size**: Number of messages to buffer before sending

### Subscribers

Subscribers enable nodes to receive messages from topics:

#### Subscriber Creation
```python
subscriber = self.create_subscription(
    msg_type=String,
    topic='topic_name',
    callback=self.subscription_callback,
    qos_profile=10
)
```

#### Callback Functions
- **Asynchronous execution**: Callbacks run in separate threads
- **Message handling**: Process incoming messages
- **Error handling**: Manage callback execution errors

### Services

Services provide synchronous request-response communication:

#### Service Server
```python
service = self.create_service(
    srv_type=AddTwoInts,
    srv_name='add_two_ints',
    callback=self.add_two_ints_callback
)

def add_two_ints_callback(self, request, response):
    response.sum = request.a + request.b
    self.get_logger().info(f'Returning {response.sum}')
    return response
```

#### Service Client
```python
client = self.create_client(
    srv_type=AddTwoInts,
    srv_name='add_two_ints'
)
```

### Action Servers and Clients

Actions provide asynchronous communication for long-running tasks:

#### Action Server Implementation
```python
from rclpy.action import ActionServer
from rclpy.executors import MultiThreadedExecutor

class FibonacciActionServer(Node):
    def __init__(self):
        super().__init__('fibonacci_action_server')
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci',
            execute_callback=self.execute_callback
        )
```

## Node Parameters

### Parameter Declaration and Management

Nodes can declare and manage parameters:

#### Parameter Declaration
```python
# Declare a parameter with default value
self.declare_parameter('param_name', 'default_value')

# Declare with descriptor for validation
from rclpy.parameter import ParameterType
from rcl_interfaces.msg import ParameterDescriptor

descriptor = ParameterDescriptor(
    type=ParameterType.PARAMETER_INTEGER,
    description='An example parameter',
    additional_constraints='Must be a positive integer',
    integer_range=[0, 100, 1]
)
self.declare_parameter('positive_int', 10, descriptor)
```

#### Parameter Access
```python
# Get parameter value
param_value = self.get_parameter('param_name').value

# Get multiple parameters
params = self.get_parameters(['param1', 'param2', 'param3'])
```

### Parameter Callbacks

Nodes can respond to parameter changes:

```python
def parameter_callback(self, parameters):
    for param in parameters:
        if param.name == 'threshold' and param.type_ == Parameter.Type.DOUBLE:
            self.threshold = param.value
            self.get_logger().info(f'Updated threshold to {param.value}')
    return SetParametersResult(successful=True)

# Add callback
self.add_on_set_parameters_callback(self.parameter_callback)
```

## Node Lifecycle

### Lifecycle Nodes

ROS 2 provides lifecycle nodes for explicit state management:

#### Lifecycle Node Implementation
```python
from rclpy.lifecycle import LifecycleNode
from rclpy.lifecycle import TransitionCallbackReturn

class LifecyclePublisher(LifecycleNode):
    def __init__(self):
        super().__init__('lifecycle_publisher')
        self.timer = None
        self.pub = None

    def on_configure(self, state):
        self.get_logger().info(f'Configuring {self.get_name()}')
        self.pub = self.create_publisher(String, 'lifecycle_chatter', 10)
        return TransitionCallbackReturn.SUCCESS

    def on_activate(self, state):
        self.get_logger().info(f'Activating {self.get_name()}')
        self.timer = self.create_timer(1.0, self.timer_callback)
        return super().on_activate(state)

    def on_deactivate(self, state):
        self.get_logger().info(f'Deactivating {self.get_name()}')
        self.timer.cancel()
        return super().on_deactivate(state)
```

### Lifecycle States

#### State Transitions
- **Unconfigured**: Node created but not configured
- **Inactive**: Configured but not active (resources allocated)
- **Active**: Fully operational (resources in use)
- **Finalized**: Node is shutting down

#### Transition Callbacks
- **on_configure**: Prepare resources, configure parameters
- **on_cleanup**: Release resources, reset state
- **on_activate**: Start active operations
- **on_deactivate**: Stop active operations
- **on_shutdown**: Final cleanup before shutdown
- **on_error**: Handle errors during transitions

## Node Execution and Spinning

### Single-threaded Execution

The simplest execution model:

```python
def main(args=None):
    rclpy.init(args=args)
    node = MyNode()
    rclpy.spin(node)  # Blocks until node is shut down
    node.destroy_node()
    rclpy.shutdown()
```

### Multi-threaded Execution

For nodes with multiple callbacks:

```python
from rclpy.executors import MultiThreadedExecutor

def main(args=None):
    rclpy.init(args=args)
    node = MyNode()
    executor = MultiThreadedExecutor()
    executor.add_node(node)
    executor.spin()
    node.destroy_node()
    rclpy.shutdown()
```

### Callback Groups

Organize callbacks for execution control:

```python
from rclpy.callback_groups import MutuallyExclusiveCallbackGroup
from rclpy.callback_groups import ReentrantCallbackGroup

# Mutually exclusive: only one callback runs at a time
cb_group = MutuallyExclusiveCallbackGroup()

# Reentrant: multiple callbacks can run simultaneously
reentrant_group = ReentrantCallbackGroup()

# Assign to entities
sub = self.create_subscription(String, 'topic', callback, 10, callback_group=cb_group)
```

## Node Composition

### Components and Composition

Nodes can be composed into single processes:

#### Component Implementation
```python
from rclpy.lifecycle import LifecycleNode
from rclcpp_components.register_node_macro import register_node_macro

class MyComponent(LifecycleNode):
    def __init__(self, node_options=None):
        super().__init__('my_component', node_options=node_options)
        # Component implementation

# Register component
register_node_macro(MyComponent)
```

#### Composition Benefits
- **Performance**: Reduced inter-process communication overhead
- **Memory efficiency**: Shared memory between components
- **Resource management**: Centralized resource allocation
- **Deployment**: Flexible deployment options

## Node Monitoring and Debugging

### Node Information

ROS 2 provides tools for node inspection:

#### Command Line Tools
```bash
# List all nodes
ros2 node list

# Get information about a specific node
ros2 node info /node_name

# Get node parameters
ros2 param list /node_name
```

### Logging

Built-in logging capabilities:

```python
# Different log levels
self.get_logger().debug('Debug message')
self.get_logger().info('Info message')
self.get_logger().warn('Warning message')
self.get_logger().error('Error message')
self.get_logger().fatal('Fatal message')
```

### Quality of Service (QoS) Considerations

#### Publisher QoS
```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy

qos_profile = QoSProfile(
    depth=10,
    reliability=ReliabilityPolicy.RELIABLE,
    history=HistoryPolicy.KEEP_LAST
)
publisher = self.create_publisher(String, 'topic', qos_profile)
```

## Best Practices

### Node Design Principles

#### Single Responsibility
- **Focused functionality**: Each node should have one clear purpose
- **Modularity**: Design for reuse in different systems
- **Testability**: Isolate functionality for easier testing

#### Error Handling
- **Graceful degradation**: Handle errors without crashing
- **Recovery strategies**: Implement restart or fallback mechanisms
- **Logging**: Provide informative error messages

### Performance Considerations

#### Memory Management
- **Efficient message handling**: Minimize memory allocations
- **Message reuse**: Reuse message objects when possible
- **Buffer management**: Configure appropriate buffer sizes

#### CPU Utilization
- **Callback efficiency**: Keep callbacks fast and non-blocking
- **Threading model**: Choose appropriate executor for use case
- **Timer management**: Use appropriate timer frequencies

### Security Considerations

#### Node Security
- **Authentication**: Verify node identity in secure systems
- **Access control**: Limit node communication to authorized nodes
- **Parameter protection**: Secure sensitive parameters

## Advanced Node Features

### Timers and Rate Control

#### Wall Timers
```python
# Timer based on wall clock time
timer = self.create_timer(0.1, self.timer_callback)
```

#### Rate Control
```python
# Control execution rate
rate = self.create_rate(10)  # 10 Hz
rate.sleep()
```

### Custom Message Types

#### Creating Custom Messages
1. Define .msg file in msg/ directory
2. Add message definition:
   ```
   string name
   int32 age
   float64 height
   ```
3. Update package.xml and CMakeLists.txt
4. Build the package

## Summary

ROS 2 nodes provide a robust foundation for distributed robotic systems. The architecture enables flexible communication patterns, parameter management, and lifecycle control while maintaining backward compatibility with ROS 1 concepts. Understanding node implementation and best practices is essential for building reliable and maintainable robotic systems. The enhanced security, real-time capabilities, and composition features of ROS 2 nodes make them well-suited for both research and commercial applications in Physical AI and humanoid robotics.

---

## Further Reading

- ROS 2 documentation: Nodes and parameters
- ROSCon presentations on node design patterns
- "Programming Robots with ROS" by Quigley et al.