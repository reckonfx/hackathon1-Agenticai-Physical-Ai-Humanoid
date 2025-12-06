---
sidebar_label: ROS 2 Architecture
title: ROS 2 Architecture
---

# ROS 2 Architecture

## Introduction to ROS 2

Robot Operating System 2 (ROS 2) represents a significant evolution from its predecessor, designed to address the limitations of ROS 1 and meet the requirements of modern robotics applications. Unlike ROS 1, which was built around a centralized master architecture, ROS 2 employs a distributed architecture based on the Data Distribution Service (DDS) standard, making it suitable for commercial and safety-critical applications.

## Core Architecture Concepts

### DDS Foundation

ROS 2's architecture is built on the Data Distribution Service (DDS) standard, which provides:

- **Decentralized communication**: No single point of failure
- **Real-time capabilities**: Deterministic communication with QoS controls
- **Language independence**: Support for multiple programming languages
- **Platform portability**: Cross-platform communication support

### Nodes in ROS 2

In ROS 2, nodes are fundamental computational units that perform specific functions:

#### Node Characteristics
- **Process-based**: Each node typically runs in its own process
- **Communication entities**: Nodes contain publishers, subscribers, services, and clients
- **Lifecycle management**: Nodes can have explicit lifecycle states
- **Parameters**: Nodes can have configurable parameters

#### Node Implementation
```python
import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        super().__init__('my_node_name')
        # Node initialization code here
```

## Communication Patterns

### Topics and Publishers/Subscribers

Topics provide unidirectional, asynchronous communication:

#### Publisher
- **Publishes messages**: Sends data to a topic
- **QoS configuration**: Quality of Service settings for reliability and performance
- **Message types**: Strongly typed messages defined in .msg files

#### Subscriber
- **Receives messages**: Subscribes to topics of interest
- **Callback functions**: Executes when new messages arrive
- **Message filtering**: Can apply filters and selectors

### Services and Clients

Services provide bidirectional, synchronous communication:

#### Service Server
- **Request handling**: Processes incoming requests
- **Response generation**: Sends responses back to clients
- **Blocking operations**: Can perform long-running operations

#### Service Client
- **Request initiation**: Sends requests to service servers
- **Response waiting**: Blocks until response is received
- **Timeout handling**: Manages communication timeouts

### Actions

Actions provide bidirectional, asynchronous communication for long-running tasks:

#### Action Server
- **Goal processing**: Handles goal requests from clients
- **Feedback publishing**: Provides ongoing feedback during execution
- **Result reporting**: Reports final results when complete

#### Action Client
- **Goal sending**: Sends goals to action servers
- **Feedback receiving**: Receives ongoing feedback
- **Result receiving**: Gets final results when available

## Quality of Service (QoS)

QoS profiles allow fine-tuning of communication behavior:

### Reliability Policy
- **Reliable**: All messages are guaranteed to be delivered
- **Best effort**: Messages may be dropped but with lower latency

### Durability Policy
- **Transient local**: Late-joining subscribers receive previous messages
- **Volatile**: Only new messages are sent to subscribers

### History Policy
- **Keep last**: Only the most recent messages are kept
- **Keep all**: All messages are kept (memory intensive)

### Rate Limiting
- **Depth**: Maximum number of messages in queue
- **Deadline**: Time constraints for message delivery

## Middleware and DDS Implementations

### Available DDS Implementations

ROS 2 supports multiple DDS implementations:

#### Fast DDS (eProsima)
- **Performance**: High-performance implementation
- **Features**: Full DDS specification support
- **Use cases**: Performance-critical applications

#### Cyclone DDS (Eclipse)
- **Open source**: Fully open-source implementation
- **Lightweight**: Minimal resource usage
- **Standards compliant**: Strict DDS compliance

#### RTI Connext DDS
- **Commercial**: Enterprise-grade implementation
- **Features**: Advanced monitoring and tools
- **Support**: Professional support available

## Launch System

### Launch Files

ROS 2 uses launch files to manage complex system deployments:

#### Python Launch Files
```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='my_package',
            executable='my_node',
            name='my_node_name'
        )
    ])
```

#### Composition
- **Component loading**: Loading multiple nodes in a single process
- **Resource efficiency**: Reduced overhead and improved performance
- **Memory sharing**: Direct memory access between components

## Parameters System

### Parameter Management

ROS 2 provides a unified parameter system:

#### Parameter Types
- **Static parameters**: Set at startup and remain constant
- **Dynamic parameters**: Can be changed during runtime
- **Private parameters**: Node-specific configuration

#### Parameter Declaration
```python
self.declare_parameter('my_param', 'default_value')
param_value = self.get_parameter('my_param').value
```

### Parameter Files
- **YAML configuration**: Human-readable parameter files
- **Namespacing**: Organized parameter management
- **Validation**: Parameter value validation and constraints

## Security Framework

### ROS 2 Security

ROS 2 includes security capabilities:

#### Authentication
- **Identity verification**: Confirming node identity
- **Certificate management**: PKI-based authentication
- **Access control**: Limiting node communication

#### Encryption
- **Message encryption**: Protecting data in transit
- **Key management**: Secure key distribution and rotation
- **Secure communication**: End-to-end encryption

## Lifecycle Nodes

### Node State Management

Lifecycle nodes provide explicit state management:

#### State Transitions
- **Unconfigured**: Node created but not configured
- **Inactive**: Configured but not active
- **Active**: Fully operational
- **Finalized**: Node is shutting down

#### Transition Callbacks
- **on_configure**: Called when transitioning to inactive
- **on_activate**: Called when transitioning to active
- **on_deactivate**: Called when transitioning from active
- **on_cleanup**: Called when transitioning from inactive to unconfigured

## Tools and Utilities

### Command Line Tools

ROS 2 provides extensive command-line tools:

#### ros2 topic
- **ros2 topic list**: Show available topics
- **ros2 topic echo**: Display topic data
- **ros2 topic pub**: Publish to topics

#### ros2 service
- **ros2 service list**: Show available services
- **ros2 service call**: Call services from command line

#### ros2 node
- **ros2 node list**: Show active nodes
- **ros2 node info**: Get detailed node information

### Visualization Tools

#### rviz2
- **3D visualization**: Real-time robot and environment visualization
- **Plugin architecture**: Extensible with custom displays
- **ROS 2 native**: Built for ROS 2 architecture

## Performance Considerations

### Real-time Capabilities

ROS 2 is designed with real-time systems in mind:

#### Real-time scheduling
- **SCHED_FIFO**: Real-time scheduling policies
- **Memory locking**: Preventing page faults during execution
- **Deterministic behavior**: Predictable execution times

#### Low-latency communication
- **Shared memory**: Zero-copy communication within processes
- **DDS optimization**: Configurable transport layers
- **Message serialization**: Efficient serialization algorithms

### Resource Management

#### Memory usage
- **Zero-copy**: Minimizing memory copies in communication
- **Memory pools**: Pre-allocated memory for predictable usage
- **Garbage collection**: Integration with real-time garbage collectors

#### CPU utilization
- **Thread management**: Configurable threading models
- **Callback groups**: Organizing callbacks for performance
- **Executor optimization**: Efficient event processing

## Migration from ROS 1

### Key Differences

#### Architecture
- **Master removal**: No central master node
- **DDS foundation**: Decentralized communication
- **Process isolation**: Better fault isolation

#### API Changes
- **rclpy/rclcpp**: New client library APIs
- **Future-based**: Asynchronous operations with futures
- **Parameter system**: Unified parameter management

## Best Practices

### Design Patterns

#### Node Design
- **Single responsibility**: Each node should have one clear purpose
- **Modularity**: Design nodes to be reusable
- **Error handling**: Robust error handling and recovery

#### Communication Design
- **Message design**: Well-defined message structures
- **QoS selection**: Appropriate QoS for application requirements
- **Naming conventions**: Consistent and descriptive names

### Performance Optimization
- **Efficient serialization**: Minimize message size and complexity
- **Appropriate QoS**: Match QoS to application requirements
- **Resource monitoring**: Monitor CPU, memory, and network usage

## Summary

ROS 2's architecture represents a significant advancement over ROS 1, providing a robust, scalable, and secure foundation for modern robotics applications. The DDS-based communication system enables decentralized, real-time communication suitable for both research and commercial applications. The architecture's modularity, security features, and performance optimizations make it well-suited for the complex requirements of Physical AI and humanoid robotics applications.

---

## Further Reading

- Lalanda, P., Hugues, J., & Kermarrec, S. (2019). Engineering ROS 2 applications: Architecture, tools and techniques
- Quigley, M., et al. (2009). ROS: an open-source robot operating system
- DDS specification: Object Management Group DDS standard