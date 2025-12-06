---
title: Bipedal Locomotion
sidebar_label: Bipedal Locomotion
---

# Bipedal Locomotion in Humanoid Robotics

## Introduction to Bipedal Locomotion

Bipedal locomotion represents one of the most challenging aspects of humanoid robotics, requiring the robot to maintain balance while moving on two legs. This complex task involves coordinated control of multiple joints, precise timing, and sophisticated balance strategies. Unlike wheeled or tracked robots, bipedal robots must manage an inherently unstable system while adapting to various terrains and disturbances.

## Fundamentals of Human Bipedal Walking

### Human Walking Patterns

Human walking is characterized by several key features:
- **Double support phase**: Both feet in contact with ground (typically 20-25% of gait cycle)
- **Single support phase**: One foot in contact, one swinging (75-80% of gait cycle)
- **Heel strike**: Initial contact with ground
- **Toe off**: Propulsive phase ending stance phase

### Biomechanical Principles

Understanding human locomotion provides insights for robot design:
- **Energy efficiency**: Humans use passive dynamics and elastic energy storage
- **Stability strategies**: Ankle, hip, and stepping strategies for balance
- **Muscle coordination**: Complex patterns of muscle activation

## Dynamic Models for Bipedal Walking

### Linear Inverted Pendulum Model (LIPM)

The LIPM is a fundamental model for bipedal walking:
- **Simplified representation**: CoM moves as an inverted pendulum
- **ZMP constraint**: Zero moment point must remain within support polygon
- **Analytical solutions**: Closed-form solutions for CoM trajectory

#### Mathematical Formulation
```
ẍ = g/h (x - x_zmp)
```
Where x is CoM position, x_zmp is ZMP position, g is gravity, and h is CoM height.

### Single Rigid Body Model

More complex than LIPM but still simplified:
- **Rigid body assumption**: Treat robot as single rigid body
- **Angular momentum**: Consider rotational dynamics
- **Capture point**: Extension of ZMP concept

### Full Multibody Dynamics

Most accurate but computationally intensive:
- **Complete model**: All links and joints included
- **Contact modeling**: Detailed contact force calculations
- **Realistic simulation**: Most accurate but slow

## Walking Pattern Generation

### ZMP-Based Walking

#### Trajectory Planning
- **ZMP reference trajectory**: Plan ZMP path within support polygon
- **CoM trajectory generation**: Calculate CoM trajectory from ZMP reference
- **Foot placement planning**: Determine footstep locations and timing

#### Pattern Generation Approaches
- **Preview control**: Use future ZMP reference to generate current CoM acceleration
- **Fifth-order polynomials**: Smooth interpolation for CoM trajectories
- **Online pattern generation**: Real-time adaptation to disturbances

### Capture Point-Based Walking

#### Capture Point Concept
- **Definition**: Point where robot can come to rest from current state
- **Stability**: Capture point must remain within support polygon
- **Step timing**: Determine when to take next step

#### Applications
- **Push recovery**: Use capture point to determine recovery steps
- **Walking control**: Plan footsteps to maintain capture point stability
- **Terrain adaptation**: Adjust step locations based on capture point

### Footstep Planning

#### Step Location Planning
- **Stability constraints**: Ensure footsteps maintain balance
- **Obstacle avoidance**: Plan around obstacles in environment
- **Terrain adaptation**: Adjust for uneven surfaces

#### Step Timing
- **Fixed timing**: Regular step intervals
- **Adaptive timing**: Adjust based on terrain or stability requirements
- **Variable cadence**: Different speeds for different situations

## Balance Control Strategies

### Ankle Strategy

#### Implementation
- **Ankle torques**: Use ankle joints to maintain balance
- **Small disturbances**: Effective for small perturbations
- **Fast response**: Quick balance correction

#### Limitations
- **Torque limits**: Limited by ankle actuator capabilities
- **Range of motion**: Limited by ankle joint range
- **Stability margin**: Only effective for small disturbances

### Hip Strategy

#### Implementation
- **Hip torques**: Use hip joints to move CoM
- **Larger disturbances**: Effective for larger perturbations
- **CoM movement**: Move CoM to maintain balance

#### Trade-offs
- **Response time**: Slower than ankle strategy
- **Energy consumption**: Higher energy usage
- **Coordination**: Requires coordination with other joints

### Stepping Strategy

#### Implementation
- **Recovery steps**: Take additional steps to recover balance
- **Largest disturbances**: For disturbances beyond other strategies
- **Dynamic recovery**: Most effective for large perturbations

#### Planning Considerations
- **Step timing**: When to initiate recovery step
- **Step location**: Where to place recovery foot
- **Step speed**: How quickly to execute step

## Walking Control Algorithms

### Walking State Machine

#### States
- **Standing**: Both feet in contact
- **Single support**: One foot in contact
- **Double support**: Both feet in contact
- **Swing phase**: Foot in motion

#### Transitions
- **Event-based**: Trigger transitions based on sensor events
- **Time-based**: Use predetermined timing
- **Adaptive**: Adjust based on current state

### Model Predictive Control (MPC) for Walking

#### Implementation
- **Prediction horizon**: Plan walking pattern over future time steps
- **Optimization**: Minimize cost function (stability, energy, etc.)
- **Constraints**: Include system and environment constraints

#### Advantages
- **Optimal solutions**: Find optimal walking patterns
- **Constraint handling**: Explicitly handle constraints
- **Adaptation**: Adjust to changing conditions

### Virtual Model Control (VMC)

#### Concept
- **Virtual mechanisms**: Create virtual mechanical systems
- **Force control**: Control forces rather than positions
- **Natural compliance**: Inherent compliance in control

#### Applications
- **Balance control**: Natural balance response
- **Compliance**: Safe interaction with environment
- **Energy efficiency**: Natural dynamics utilization

## Terrain Adaptation

### Flat Ground Walking

#### Characteristics
- **Predictable surface**: Known and stable terrain
- **Regular gait**: Consistent step patterns
- **Optimized patterns**: Highly efficient walking

#### Control Considerations
- **Stability**: Maintain balance with minimal energy
- **Efficiency**: Optimize for energy consumption
- **Speed**: Achieve desired walking speed

### Uneven Terrain

#### Challenges
- **Surface variations**: Unknown or changing terrain
- **Foot placement**: Adjust foot placement for stability
- **Balance**: Maintain balance on uneven surfaces

#### Adaptation Strategies
- **Online planning**: Adjust gait in real-time
- **Foot orientation**: Adjust foot orientation for surface
- **Step height**: Adjust step height for obstacles

### Stair Climbing and Descending

#### Stair Climbing
- **Step height**: Navigate step height changes
- **Balance**: Maintain balance during transitions
- **Power**: Provide sufficient power for lifting

#### Stair Descending
- **Controlled descent**: Safely descend steps
- **Impact reduction**: Minimize impact forces
- **Balance**: Maintain balance during descent

## Disturbance Handling

### External Pushes and Pulls

#### Detection
- **IMU sensors**: Detect unexpected accelerations
- **Force sensors**: Detect external forces
- **State deviation**: Monitor departure from expected state

#### Response Strategies
- **Immediate response**: Quick balance recovery
- **Step adjustment**: Modify upcoming steps
- **Gait modification**: Adjust walking pattern

### Surface Disturbances

#### Slip and Slide
- **Detection**: Identify slip conditions
- **Recovery**: Adjust gait to prevent falls
- **Adaptation**: Modify future steps

#### Obstacle Interaction
- **Detection**: Identify unexpected obstacles
- **Avoidance**: Plan around obstacles
- **Recovery**: Handle contact with obstacles

## Energy Efficiency in Walking

### Passive Dynamics

#### Concept
- **Natural motion**: Exploit natural dynamics
- **Minimal actuation**: Reduce active control
- **Energy efficiency**: Lower power consumption

#### Implementation
- **Mechanical design**: Design for passive motion
- **Control strategy**: Minimize active control
- **Gait optimization**: Optimize for natural motion

### Active Control Strategies

#### Optimal Control
- **Energy minimization**: Minimize energy consumption
- **Trajectory optimization**: Optimize walking trajectories
- **Actuator efficiency**: Optimize actuator usage

#### Learning-Based Optimization
- **Gait learning**: Learn efficient walking patterns
- **Adaptive control**: Adapt to conditions
- **Personalization**: Optimize for specific tasks

## Advanced Walking Techniques

### Dynamic Walking

#### Characteristics
- **Fast walking**: Higher speeds than quasi-static
- **Flight phase**: Brief moments with both feet off ground
- **Energy efficiency**: More efficient at higher speeds

#### Control Challenges
- **Stability**: Maintain stability at higher speeds
- **Timing**: Precise timing for dynamic motion
- **Balance**: Balance during dynamic phases

### Running and Jumping

#### Running
- **Flight phase**: Extended periods with both feet off ground
- **High speeds**: Much faster than walking
- **Energy management**: Efficient energy storage and release

#### Jumping
- **Vertical motion**: Control vertical movement
- **Landing**: Safe and stable landing
- **Recovery**: Quick recovery from landing

## Control Architecture for Walking

### Hierarchical Control Structure

#### High-Level Planning
- **Path planning**: Plan overall path
- **Footstep planning**: Plan footstep locations
- **Gait selection**: Select appropriate gait pattern

#### Mid-Level Control
- **Balance control**: Maintain balance during walking
- **Trajectory generation**: Generate reference trajectories
- **Disturbance handling**: Handle unexpected disturbances

#### Low-Level Control
- **Joint control**: Control individual joints
- **Servo control**: Precise joint position/force control
- **Sensor feedback**: Process sensor data

### Sensor Integration

#### Inertial Measurement
- **IMU**: Measure orientation and acceleration
- **Attitude estimation**: Estimate robot attitude
- **Balance feedback**: Provide balance information

#### Force/Torque Sensing
- **Foot sensors**: Measure ground reaction forces
- **Balance control**: Use force feedback for balance
- **Contact detection**: Detect contact with ground

## Challenges and Future Directions

### Current Challenges

#### Computational Complexity
- **Real-time requirements**: Meet timing constraints
- **Model complexity**: Balance accuracy with speed
- **Optimization**: Solve complex optimization problems in real-time

#### Robustness
- **Model uncertainty**: Handle model inaccuracies
- **Environmental variations**: Adapt to different conditions
- **Hardware variations**: Handle different robot configurations

### Future Directions

#### Learning-Based Approaches
- **Reinforcement learning**: Learn walking policies
- **Imitation learning**: Learn from human demonstrations
- **Adaptive learning**: Adapt to new conditions

#### Bio-Inspired Approaches
- **Neural control**: Mimic biological control systems
- **Muscle-like actuators**: Use more biological-like actuators
- **Learning mechanisms**: Mimic biological learning

## Summary

Bipedal locomotion in humanoid robotics is a complex and multifaceted challenge that requires sophisticated control algorithms, dynamic modeling, and balance strategies. Success in bipedal walking requires integration of multiple control approaches, from simple ankle strategies to complex model predictive control. As the field advances, walking algorithms continue to become more robust, energy-efficient, and capable of handling diverse terrains and disturbances. The development of truly human-like walking remains an active area of research with significant potential for improving humanoid robot capabilities.

---
## Further Reading

- Kajita, S., Kanehiro, F., Kaneko, K., Fujiwara, K., & Harada, K. (2003). Biped walking pattern generation by using preview control of zero-moment point
- Pratt, J., & Goswami, A. (2007). On limit cycles and their relation to dynamic balance for humanoid robots
- Hof, A. L., van den Berg, M. G., & Buning, M. J. (2005). Balance responses to lateral perturbations in human treadmill walking