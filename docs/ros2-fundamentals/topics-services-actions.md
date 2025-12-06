---
sidebar_label: Topics, Services, Actions
title: Topics, Services, Actions
---

# Topics, Services, Actions in ROS 2

## Introduction to Communication Patterns

ROS 2 provides three primary communication patterns for nodes to interact with each other: topics for asynchronous communication, services for synchronous request-response interactions, and actions for asynchronous long-running operations with feedback. Each pattern serves different use cases and provides distinct advantages for various robotic applications.

## Topics - Asynchronous Communication

### Topic Fundamentals

Topics provide unidirectional, asynchronous communication between nodes through a publish-subscribe pattern:

#### Publisher-Subscriber Model
- **Publishers**: Send messages to topics without knowing subscribers
- **Subscribers**: Receive messages from topics without knowing publishers
- **Decoupling**: Publishers and subscribers don't need to know about each other
- **Scalability**: Multiple publishers and subscribers can use the same topic

#### Topic Characteristics
- **Anonymous**: Publishers and subscribers are anonymous to each other
- **Many-to-many**: Multiple publishers can send to one topic, multiple subscribers can receive
- **Asynchronous**: Communication doesn't block either party
- **Broadcast**: Messages are broadcast to all subscribers

### Creating and Using Topics

#### Python Implementation
```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class Talker(Node):
    def __init__(self):
        super().__init__('talker')
        self.publisher = self.create_publisher(String, 'chatter', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = 'Hello World: %d' % self.i
        self.publisher.publish(msg)
        self.get_logger().info('Publishing: "%s"' % msg.data)
        self.i += 1

class Listener(Node):
    def __init__(self):
        super().__init__('listener')
        self.subscription = self.create_subscription(
            String,
            'chatter',
            self.listener_callback,
            10)
        self.subscription  # prevent unused variable warning

    def listener_callback(self, msg):
        self.get_logger().info('I heard: "%s"' % msg.data)
```

#### C++ Implementation
```cpp
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

class Talker : public rclcpp::Node
{
public:
    Talker() : Node("talker")
    {
        publisher_ = this->create_publisher<std_msgs::msg::String>("chatter", 10);
        timer_ = this->create_wall_timer(
            500ms, std::bind(&Talker::timer_callback, this));
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
    size_t count_ = 0;
};
```

### Quality of Service (QoS) for Topics

QoS profiles allow fine-tuning of topic communication behavior:

#### Reliability Policy
```python
from rclpy.qos import QoSProfile, ReliabilityPolicy

# Reliable - all messages guaranteed to be delivered
qos_reliable = QoSProfile(
    depth=10,
    reliability=ReliabilityPolicy.RELIABLE
)

# Best effort - messages may be dropped but with lower latency
qos_best_effort = QoSProfile(
    depth=10,
    reliability=ReliabilityPolicy.BEST_EFFORT
)
```

#### Durability Policy
```python
from rclpy.qos import DurabilityPolicy

# Volatile - only new messages sent to subscribers
qos_volatile = QoSProfile(
    depth=10,
    durability=DurabilityPolicy.VOLATILE
)

# Transient local - late-joining subscribers get previous messages
qos_transient = QoSProfile(
    depth=10,
    durability=DurabilityPolicy.TRANSIENT_LOCAL
)
```

#### History Policy
```python
from rclpy.qos import HistoryPolicy

# Keep last N messages
qos_keep_last = QoSProfile(
    depth=10,  # Keep last 10 messages
    history=HistoryPolicy.KEEP_LAST
)

# Keep all messages (use with caution)
qos_keep_all = QoSProfile(
    history=HistoryPolicy.KEEP_ALL
)
```

### Topic Best Practices

#### Message Design
- **Efficiency**: Keep messages small and efficient
- **Versioning**: Design for backward compatibility
- **Validation**: Include appropriate data validation
- **Documentation**: Document message semantics clearly

#### Performance Considerations
- **Frequency**: Match publishing frequency to application needs
- **Buffer sizes**: Configure appropriate queue depths
- **Threading**: Consider callback execution models

## Services - Synchronous Request-Response

### Service Fundamentals

Services provide synchronous, bidirectional communication with request-response semantics:

#### Service Characteristics
- **Synchronous**: Client blocks until response is received
- **Bidirectional**: Request and response messages
- **One-to-one**: One client communicates with one server
- **Request-response**: Clear transaction model

#### Service vs. Topic
- **Topics**: Asynchronous, broadcast, many-to-many
- **Services**: Synchronous, request-response, one-to-one

### Creating and Using Services

#### Service Definition

Create a service definition file (.srv) in the srv/ directory:

```
# Request message
int64 a
int64 b
---
# Response message
int64 sum
```

#### Service Server Implementation
```python
from example_interfaces.srv import AddTwoInts
import rclpy
from rclpy.node import Node

class MinimalService(Node):
    def __init__(self):
        super().__init__('minimal_service')
        self.srv = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_two_ints_callback
        )

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Returning {response.sum}')
        return response
```

#### Service Client Implementation
```python
from example_interfaces.srv import AddTwoInts
import rclpy
from rclpy.node import Node

class MinimalClient(Node):
    def __init__(self):
        super().__init__('minimal_client')
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Service not available, waiting again...')
        self.req = AddTwoInts.Request()

    def send_request(self, a, b):
        self.req.a = a
        self.req.b = b
        self.future = self.cli.call_async(self.req)
        rclpy.spin_until_future_complete(self, self.future)
        return self.future.result()
```

### Service Best Practices

#### Error Handling
- **Timeouts**: Implement appropriate timeout handling
- **Retry logic**: Handle service unavailability gracefully
- **Error responses**: Use service response to indicate errors

#### Performance Considerations
- **Blocking**: Be aware that service calls block the calling thread
- **Long operations**: Consider using actions for long-running operations
- **Concurrency**: Design for concurrent service requests

## Actions - Asynchronous Long-Running Operations

### Action Fundamentals

Actions provide asynchronous communication for long-running operations with feedback:

#### Action Characteristics
- **Asynchronous**: Non-blocking communication
- **Long-running**: Designed for operations that take time
- **Feedback**: Continuous feedback during execution
- **Goal/Result**: Clear goal and result semantics

#### Action Components
- **Goal**: Request to start an action
- **Feedback**: Continuous updates during execution
- **Result**: Final outcome when action completes

### Creating and Using Actions

#### Action Definition

Create an action definition file (.action) in the action/ directory:

```
# Goal definition
int32 order
---
# Result definition
int32[] sequence
---
# Feedback definition
int32[] sequence
```

#### Action Server Implementation
```python
from rclpy.action import ActionServer
from rclpy.node import Node
from example_interfaces.action import Fibonacci

class FibonacciActionServer(Node):
    def __init__(self):
        super().__init__('fibonacci_action_server')
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci',
            self.execute_callback
        )

    def execute_callback(self, goal_handle):
        self.get_logger().info('Executing goal...')

        feedback_msg = Fibonacci.Feedback()
        feedback_msg.sequence = [0, 1]

        for i in range(1, goal_handle.request.order):
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                self.get_logger().info('Goal canceled')
                return Fibonacci.Result()

            feedback_msg.sequence.append(
                feedback_msg.sequence[i] + feedback_msg.sequence[i-1]
            )

            goal_handle.publish_feedback(feedback_msg)
            time.sleep(1)  # Simulate work

        goal_handle.succeed()
        result = Fibonacci.Result()
        result.sequence = feedback_msg.sequence
        self.get_logger().info('Goal succeeded')
        return result
```

#### Action Client Implementation
```python
from rclpy.action import ActionClient
from rclpy.node import Node
from example_interfaces.action import Fibonacci

class FibonacciActionClient(Node):
    def __init__(self):
        super().__init__('fibonacci_action_client')
        self._action_client = ActionClient(
            self,
            Fibonacci,
            'fibonacci'
        )

    def send_goal(self, order):
        goal_msg = Fibonacci.Goal()
        goal_msg.order = order

        self._action_client.wait_for_server()
        self._send_goal_future = self._action_client.send_goal_async(
            goal_msg,
            feedback_callback=self.feedback_callback
        )

        self._send_goal_future.add_done_callback(self.goal_response_callback)

    def goal_response_callback(self, future):
        goal_handle = future.result()
        if not goal_handle.accepted:
            self.get_logger().info('Goal rejected')
            return

        self.get_logger().info('Goal accepted')
        self._get_result_future = goal_handle.get_result_async()
        self._get_result_future.add_done_callback(self.get_result_callback)

    def feedback_callback(self, feedback_msg):
        self.get_logger().info(f'Received feedback: {feedback_msg.feedback.sequence}')

    def get_result_callback(self, future):
        result = future.result().result
        self.get_logger().info(f'Result: {result.sequence}')
```

### Action Best Practices

#### State Management
- **Goal tracking**: Properly track goal states and handle cancellation
- **Feedback frequency**: Balance feedback detail with performance
- **Result handling**: Ensure results are properly communicated

#### Error Handling
- **Cancellation**: Handle goal cancellation appropriately
- **Preemption**: Allow goals to be preempted by new requests
- **Abortion**: Handle cases where goals cannot be completed

## Comparison of Communication Patterns

### When to Use Each Pattern

#### Topics
- **Broadcast communication**: Multiple nodes need the same information
- **Real-time data**: Sensor data, robot state, etc.
- **Continuous updates**: Streaming data that doesn't require acknowledgment
- **Decoupled systems**: Publisher and subscriber don't need to coordinate

#### Services
- **Simple queries**: Request-response interactions
- **Synchronous operations**: When caller needs to wait for result
- **Short operations**: Operations that complete quickly
- **Configuration**: Setting parameters or getting current state

#### Actions
- **Long-running operations**: Operations that take significant time
- **Progress feedback**: When caller needs to know progress
- **Cancellable operations**: When operations can be cancelled
- **Complex workflows**: Multi-step operations with intermediate results

### Performance Characteristics

#### Communication Overhead
- **Topics**: Low overhead, high throughput
- **Services**: Moderate overhead due to request-response
- **Actions**: Higher overhead due to feedback mechanism

#### Latency
- **Topics**: Lowest latency for simple data transfer
- **Services**: Higher latency due to synchronous nature
- **Actions**: Variable latency based on operation duration

#### Resource Usage
- **Topics**: Minimal resource usage per message
- **Services**: Resources allocated per request
- **Actions**: Resources allocated for duration of action

## Advanced Communication Concepts

### Custom Message Types

#### Creating Custom Messages
1. Define .msg file in msg/ directory
2. Define message structure with supported types
3. Update package.xml and CMakeLists.txt
4. Build the package to generate message code

Example custom message:
```
# MyCustomMessage.msg
string name
int32 id
float64[] values
bool active
geometry_msgs/Point position
```

### Message Serialization

#### Built-in Types
- **Basic types**: bool, int8, uint8, int16, uint16, int32, uint32, int64, uint64, float32, float64, string, byte
- **Arrays**: Fixed and variable length arrays of basic types
- **Nested messages**: Messages containing other message types

#### Custom Types
- **Generated code**: Messages generate code for multiple languages
- **Serialization**: Automatic serialization/deserialization
- **Validation**: Type checking and validation

### Communication Middleware

#### DDS Implementation
- **Data Distribution Service**: Standard for real-time communication
- **Multiple implementations**: FastDDS, CycloneDDS, RTI Connext
- **Configuration**: QoS settings mapped to DDS profiles

#### Transport Mechanisms
- **Shared memory**: Intra-process communication
- **TCP/UDP**: Inter-process and network communication
- **WebSockets**: Web-based communication (with appropriate packages)

## Security Considerations

### Communication Security

#### Authentication
- **Node authentication**: Verify node identity
- **Message authentication**: Verify message integrity
- **Access control**: Limit communication to authorized nodes

#### Encryption
- **Message encryption**: Encrypt sensitive data
- **Transport encryption**: Secure communication channels
- **Key management**: Secure key distribution and rotation

## Debugging and Monitoring

### Command Line Tools

#### Topic Monitoring
```bash
# List all topics
ros2 topic list

# Echo topic data
ros2 topic echo /topic_name

# Publish to topic
ros2 topic pub /topic_name std_msgs/String "data: 'Hello'"

# Get topic info
ros2 topic info /topic_name
```

#### Service Monitoring
```bash
# List services
ros2 service list

# Call service
ros2 service call /service_name example_interfaces/srv/AddTwoInts "{a: 1, b: 2}"

# Get service info
ros2 service info /service_name
```

#### Action Monitoring
```bash
# List actions
ros2 action list

# Send action goal
ros2 action send_goal /action_name example_interfaces/action/Fibonacci "{order: 5}"
```

## Summary

ROS 2 communication patterns provide flexible and powerful mechanisms for nodes to interact. Topics enable efficient broadcast communication for real-time data, services provide synchronous request-response interactions for simple queries, and actions offer asynchronous communication with feedback for long-running operations. Understanding when and how to use each pattern is crucial for building effective robotic systems. The QoS system allows fine-tuning of communication behavior to meet specific application requirements, while the security features enable safe deployment in sensitive environments.

---

## Further Reading

- ROS 2 documentation: Topics, services, and actions
- Real-Time Systems and ROS 2 communication patterns
- "Effective ROS 2" by Open Robotics