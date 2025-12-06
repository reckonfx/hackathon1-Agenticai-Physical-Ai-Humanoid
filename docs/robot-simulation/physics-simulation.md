---
sidebar_label: Physics Simulation
title: Physics Simulation
---

# Physics Simulation

## Introduction to Physics Simulation in Robotics

Physics simulation is fundamental to robotics development, particularly for humanoid robots where the interaction between the robot and its environment is complex and dynamic. Accurate physics simulation enables developers to test control algorithms, validate designs, and develop behaviors in a safe, controlled environment before deployment on real hardware. For humanoid robots, physics simulation must accurately model complex interactions including balance, locomotion, and manipulation.

## Physics Engine Fundamentals

### Core Physics Concepts

Physics simulation in robotics involves modeling several fundamental physical phenomena:

#### Rigid Body Dynamics
- **Position and Orientation**: 6 degrees of freedom (3 translational, 3 rotational)
- **Linear and Angular Velocity**: First derivatives of position and orientation
- **Linear and Angular Acceleration**: Second derivatives of position and orientation
- **Mass and Inertia**: Resistance to changes in motion
- **Forces and Torques**: Causes of acceleration

#### Contact Dynamics
- **Collision Detection**: Identifying when objects intersect
- **Collision Response**: Computing forces when objects contact
- **Friction**: Resistance to sliding motion
- **Restitution**: Energy conservation during impacts

#### Constraints
- **Joints**: Limiting relative motion between bodies
- **Contacts**: Preventing interpenetration
- **Actuators**: Applying forces/torques to achieve desired motion

### Physics Engine Architecture

Modern physics engines follow a typical architecture:

1. **Broad Phase**: Identify potentially colliding pairs using spatial partitioning
2. **Narrow Phase**: Compute precise collision information for pairs
3. **Constraint Solving**: Solve joint constraints and contact forces
4. **Integration**: Update positions and velocities based on forces
5. **Post-Processing**: Handle special cases and callbacks

## Gazebo Physics Engines

### Available Physics Engines

Gazebo supports multiple physics engines, each with different characteristics:

#### ODE (Open Dynamics Engine)
- **Strengths**: Stable, well-tested, good for articulated systems
- **Use Cases**: Humanoid robots, manipulators, vehicles
- **Characteristics**:
  - Impulse-based constraint solver
  - Good for joints and contacts
  - Conservative stability properties

#### Bullet Physics
- **Strengths**: Fast, good for complex collision shapes
- **Use Cases**: Games, rapid prototyping, complex environments
- **Characteristics**:
  - Fast collision detection
  - Good for static environments
  - Less stable for complex articulated systems

#### DART (Dynamic Animation and Robotics Toolkit)
- **Strengths**: Advanced constraint solving, stable for complex systems
- **Use Cases**: Bipedal robots, complex articulated systems
- **Characteristics**:
  - Generalized coordinates
  - Advanced constraint solvers
  - Good for humanoid balance simulation

#### Simbody
- **Strengths**: Biomechanics-focused, high accuracy
- **Use Cases**: Biomechanical simulation, precise control
- **Characteristics**:
  - Multibody dynamics
  - High numerical accuracy
  - Complex joint types

## Physics Configuration Parameters

### Time Step Configuration

The time step is crucial for physics simulation stability and accuracy:

#### Fixed Time Step
```xml
<physics name="ode" type="ode">
  <max_step_size>0.001</max_step_size>  <!-- 1ms time step -->
  <real_time_factor>1.0</real_time_factor>
  <real_time_update_rate>1000</real_time_update_rate>
</physics>
```

#### Time Step Considerations
- **Accuracy vs. Performance**: Smaller time steps = more accurate but slower
- **Stability**: Critical for numerical stability of integration
- **Real-time Requirements**: Balance with real-time performance needs

### Solver Configuration

#### ODE Solver Parameters
```xml
<ode>
  <solver>
    <type>quick</type>      <!-- Solver type: quick, world, or pgsp */
    <iters>100</iters>      <!-- Number of constraint solver iterations */
    <sor>1.3</sor>          <!-- Successive over-relaxation parameter */
  </solver>
  <constraints>
    <cfm>0.000001</cfm>     <!-- Constraint Force Mixing parameter */
    <erp>0.2</erp>          <!-- Error Reduction Parameter */
    <contact_max_correcting_vel>100</contact_max_correcting_vel>
    <contact_surface_layer>0.001</contact_surface_layer>
  </constraints>
</ode>
```

#### Solver Parameter Impact
- **Iterations**: More iterations = more accurate but slower
- **SOR**: Higher values = faster convergence but potential instability
- **CFM**: Higher values = softer constraints, more stable
- **ERP**: Higher values = faster error correction, potentially unstable

## Collision Detection and Response

### Collision Geometry Types

#### Primitive Shapes
- **Box**: Fast, simple, good for simple objects
- **Sphere**: Fast, rotationally invariant
- **Cylinder**: Good for limbs, wheels, etc.

#### Complex Shapes
- **Mesh**: Accurate representation of complex geometry
- **Heightmap**: Terrain representation
- **Polyline**: 2D shapes

#### Collision Optimization
```xml
<link name="complex_link">
  <collision name="collision_approx">
    <!-- Use simplified collision geometry -->
    <geometry>
      <box size="0.3 0.2 0.4"/>  <!-- Approximate complex shape */
    </geometry>
  </collision>

  <visual name="visual_exact">
    <!-- Use detailed visual geometry -->
    <geometry>
      <mesh filename="complex_shape.dae"/>
    </geometry>
  </visual>
</link>
```

### Surface Properties

Surface properties define how objects interact when they contact:

#### Friction Models
```xml
<collision name="foot_collision">
  <surface>
    <friction>
      <ode>
        <mu>0.8</mu>        <!-- Primary friction coefficient -->
        <mu2>0.8</mu2>      <!-- Secondary friction coefficient -->
        <fdir1>0 0 0</fdir1> <!-- Friction direction (for anisotropic friction) */
      </ode>
      <torsional>
        <coefficient>1.0</coefficient>
        <patch_radius>0.02</patch_radius>
        <surface_radius>0.02</surface_radius>
      </torsional>
    </friction>
  </surface>
</collision>
```

#### Contact Properties
```xml
<collision name="contact_properties">
  <surface>
    <contact>
      <ode>
        <soft_cfm>0.0</soft_cfm>           <!-- Soft constraint force mixing */
        <soft_erp>0.2</soft_erp>           <!-- Soft error reduction parameter */
        <kp>1e+13</kp>                    <!-- Contact stiffness -->
        <kd>1.0</kd>                      <!-- Contact damping */
        <max_vel>100.0</max_vel>          <!-- Maximum contact correction velocity */
        <min_depth>0.001</min_depth>      <!-- Minimum contact depth */
      </ode>
    </contact>
    <bounce>
      <restitution_coefficient>0.1</restitution_coefficient>  <!-- Bounciness */
      <threshold>100000</threshold>                            <!-- Velocity threshold */
    </bounce>
  </surface>
</collision>
```

## Humanoid-Specific Physics Considerations

### Balance and Stability

#### Center of Mass
The center of mass is critical for humanoid balance:

```xml
<!-- Proper mass distribution is essential -->
<link name="torso">
  <inertial>
    <mass value="8.0"/>  <!-- Realistic mass -->
    <origin xyz="0 0 0.1" rpy="0 0 0"/>  <!-- CoM position -->
    <inertia ixx="0.2" ixy="0" ixz="0" iyy="0.25" iyz="0" izz="0.1"/>  <!-- Realistic inertia -->
  </inertial>
</link>
```

#### Zero Moment Point (ZMP)
For stable bipedal locomotion, physics simulation should support ZMP analysis:

```xml
<!-- Sensors for balance analysis -->
<gazebo reference="left_foot">
  <sensor name="left_foot_force" type="force_torque">
    <always_on>true</always_on>
    <update_rate>1000</update_rate>
    <plugin name="left_ft_plugin" filename="libgazebo_ros_ft_sensor.so">
      <frame_name>left_foot</frame_name>
      <topic_name>left_foot/force_torque</topic_name>
    </plugin>
  </sensor>
</gazebo>
```

### Joint Dynamics

#### Realistic Joint Properties
```xml
<joint name="left_knee" type="revolute">
  <parent link="left_thigh"/>
  <child link="left_lower_leg"/>
  <axis xyz="0 1 0">
    <limit lower="0" upper="2.3" effort="200" velocity="2"/>
    <dynamics damping="2.0" friction="0.5"/>  <!-- Realistic damping and friction -->
  </axis>
</joint>
```

#### Actuator Modeling
```xml
<!-- Model actuator dynamics -->
<gazebo>
  <plugin name="joint_control" filename="libgazebo_ros_control.so">
    <robotNamespace>/my_humanoid</robotNamespace>
    <robotParam>robot_description</robotParam>
    <controlPeriod>0.001</controlPeriod>  <!-- Match physics time step -->
  </plugin>
</gazebo>
```

### Ground Contact for Humanoids

#### Foot Contact Modeling
```xml
<link name="left_foot">
  <collision name="foot_contact">
    <geometry>
      <box size="0.25 0.1 0.02"/>  <!-- Foot dimensions -->
    </geometry>
    <surface>
      <friction>
        <ode>
          <mu>0.8</mu>    <!-- High friction for stability -->
          <mu2>0.8</mu2>
        </ode>
      </friction>
      <contact>
        <ode>
          <soft_erp>0.2</soft_erp>    <!-- Soft contacts for stability */
          <soft_cfm>0.0001</soft_cfm>
          <kp>1000000</kp>           <!-- High stiffness -->
          <kd>100</kd>               <!-- Damping for shock absorption */
        </ode>
      </contact>
    </surface>
  </collision>
</link>
```

## Advanced Physics Features

### Soft Body Simulation

For more realistic human-like motion:

```xml
<!-- Soft body properties (if supported by physics engine) -->
<model name="soft_robot">
  <link name="soft_link">
    <collision name="collision">
      <geometry>
        <box size="0.1 0.1 0.1"/>
      </geometry>
      <surface>
        <contact>
          <ode>
            <soft_erp>0.5</soft_erp>    <!-- More compliant than rigid bodies */
            <soft_cfm>0.001</soft_cfm>
          </ode>
        </contact>
      </surface>
    </collision>
  </link>
</model>
```

### Fluid Simulation

For underwater or fluid interaction:

```xml
<!-- Fluid properties -->
<world name="fluid_world">
  <physics name="fluid_physics" type="ode">
    <gravity>0 0 -9.8</gravity>
    <!-- Fluid density and viscosity parameters -->
  </physics>

  <!-- Buoyancy plugin -->
  <gazebo>
    <plugin name="buoyancy" filename="libbuoyancy_plugin.so">
      <fluid_density>1000.0</fluid_density>  <!-- Water density -->
    </plugin>
  </gazebo>
</world>
```

### Custom Force Fields

For simulating environmental effects:

```xml
<!-- Wind simulation -->
<gazebo>
  <plugin name="wind" filename="libwind_plugin.so">
    <linear_force>0.1 0 0</linear_force>    <!-- Constant wind force -->
    <variance>0.05</variance>              <!-- Wind variation -->
    <update_rate>10</update_rate>
  </plugin>
</gazebo>
```

## Performance Optimization

### Physics Performance Considerations

#### Broad Phase Optimization
- Use appropriate collision masks to reduce unnecessary collision checks
- Organize models to minimize collision pairs
- Use simplified collision geometry where possible

#### Narrow Phase Optimization
- Use primitive shapes instead of complex meshes for collision
- Limit the number of contact points per collision
- Adjust contact surface layer appropriately

#### Constraint Solving Optimization
- Balance solver iterations with performance requirements
- Use appropriate ERP and CFM values
- Consider using different solver types for different scenarios

### Real-time Performance

#### Time Step Optimization
```xml
<!-- Balance accuracy and performance -->
<physics name="real_time_physics" type="ode">
  <max_step_size>0.002</max_step_size>    <!-- 2ms - balance performance/accuracy -->
  <real_time_factor>1.0</real_time_factor>
  <real_time_update_rate>500</real_time_update_rate>  <!-- 500 Hz update rate -->
</physics>
```

#### Parallel Processing
Modern physics engines can utilize multiple CPU cores:

```xml
<!-- Multi-threaded physics (if supported) -->
<ode>
  <thread_position_correction>true</thread_position_correction>
  <!-- Additional parallel processing parameters -->
</ode>
```

## Physics Validation and Tuning

### Validation Techniques

#### Kinematic vs. Dynamic Validation
```bash
# Validate kinematic chain
ros2 run urdf_to_graphiz my_humanoid.urdf

# Test dynamic simulation
gazebo --verbose worlds/empty.world
```

#### Parameter Sensitivity Analysis
- Test different time steps to ensure stability
- Validate mass and inertia properties
- Verify joint limits and dynamics
- Test balance controllers with realistic parameters

### Common Physics Issues

#### Interpenetration
```xml
<!-- Problem: Objects passing through each other -->
<surface>
  <contact>
    <ode>
      <soft_cfm>1.0</soft_cfm>      <!-- Too soft - allows interpenetration */
      <soft_erp>0.01</soft_erp>     <!-- Too low - slow error correction */
    </ode>
  </surface>
</surface>

<!-- Solution: Proper contact parameters -->
<surface>
  <contact>
    <ode>
      <soft_cfm>0.0001</soft_cfm>   <!-- Reasonable softness */
      <soft_erp>0.2</soft_erp>      <!-- Good error correction */
      <kp>1e+13</kp>               <!-- High stiffness */
      <kd>100</kd>                 <!-- Appropriate damping */
    </ode>
  </surface>
</surface>
```

#### Instability
```xml
<!-- Problem: Simulation becomes unstable -->
<physics name="unstable_physics" type="ode">
  <max_step_size>0.01</max_step_size>    <!-- Too large time step */
  <solver>
    <iters>10</iters>                     <!-- Too few iterations */
  </solver>
</physics>

<!-- Solution: Stable parameters -->
<physics name="stable_physics" type="ode">
  <max_step_size>0.001</max_step_size>   <!-- Smaller time step */
  <solver>
    <iters>100</iters>                    <!-- More iterations */
    <sor>1.2</sor>                        <!-- Conservative SOR */
  </solver>
  <constraints>
    <cfm>0.0001</cfm>                     <!-- Appropriate CFM */
    <erp>0.2</erp>                        <!-- Appropriate ERP */
  </constraints>
</physics>
```

#### Excessive Bouncing
```xml
<!-- Problem: Objects bounce unrealistically -->
<surface>
  <bounce>
    <restitution_coefficient>0.9</restitution_coefficient>  <!-- Too high -->
  </bounce>
</surface>

<!-- Solution: Realistic restitution -->
<surface>
  <bounce>
    <restitution_coefficient>0.1</restitution_coefficient>  <!-- More realistic -->
    <threshold>100000</threshold>
  </bounce>
</surface>
```

## Advanced Physics Concepts for Humanoids

### Impulse-Based Dynamics

For handling contact forces in humanoid locomotion:

```xml
<!-- Contact modeling for walking -->
<collision name="foot_collision">
  <surface>
    <contact>
      <ode>
        <soft_erp>0.3</soft_erp>     <!-- Allow some compliance for natural contact */
        <soft_cfm>0.0001</soft_cfm>  <!-- Prevent excessive interpenetration */
        <kp>1e+12</kp>              <!-- High stiffness for solid contact */
        <kd>50</kd>                 <!-- Damping to absorb impact */
      </ode>
    </contact>
    <friction>
      <ode>
        <mu>0.8</mu>                <!-- High friction for stable stance */
        <mu2>0.8</mu2>
      </ode>
    </friction>
  </surface>
</collision>
```

### Multi-body Dynamics

For complex humanoid structures:

```xml
<!-- Complex articulated system -->
<model name="humanoid_robot">
  <link name="pelvis">
    <inertial>
      <mass value="10.0"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.15" iyz="0" izz="0.12"/>
    </inertial>
  </link>

  <!-- Multiple connected links with appropriate joints -->
  <joint name="torso_joint" type="fixed">
    <parent link="pelvis"/>
    <child link="torso"/>
  </joint>

  <!-- Recursive structure for full body -->
</model>
```

### Control-Physics Integration

For realistic control simulation:

```xml
<!-- Joint control with physics feedback -->
<gazebo>
  <plugin name="control_plugin" filename="libgazebo_ros_control.so">
    <robotNamespace>/my_humanoid</robotNamespace>
    <robotSimType>gazebo_ros_control/DefaultRobotHWSim</robotSimType>
    <controlPeriod>0.001</controlPeriod>  <!-- Match physics update rate -->
  </plugin>
</gazebo>
```

## Real-world Validation

### Comparing Simulation to Reality

#### Parameter Tuning Process
1. **Start with estimates**: Use analytical models or literature values
2. **Validate behavior**: Compare simulation to expected behavior
3. **Iterate and refine**: Adjust parameters based on discrepancies
4. **Test extensively**: Validate across multiple scenarios

#### Common Validation Scenarios
- **Static balance**: Verify stable standing position
- **Simple motions**: Test basic joint movements
- **Dynamic behaviors**: Validate walking, manipulation, etc.
- **Stress tests**: Test at limits of operation

### Physics Parameter Guidelines

#### Mass Properties
- Use realistic mass values based on actual hardware
- Ensure center of mass is properly positioned
- Validate inertia tensors for stability

#### Joint Properties
- Set realistic joint limits based on hardware
- Include appropriate damping for energy dissipation
- Model friction effects for realistic motion

#### Contact Properties
- Use appropriate friction coefficients for surfaces
- Set realistic restitution values
- Configure contact parameters for stability

## Troubleshooting Physics Issues

### Common Problems and Solutions

#### Robot Falls Over Immediately
- Check mass distribution and center of mass
- Verify joint limits and positions
- Validate initial pose in simulation
- Check contact properties and friction

#### Joints Behaving Unexpectedly
- Verify joint types and axis directions
- Check joint limits and dynamics
- Validate controller commands and ranges
- Ensure proper control loop timing

#### Performance Issues
- Increase time step (with caution)
- Simplify collision geometry
- Reduce solver iterations (with caution)
- Limit the number of active objects

### Debugging Techniques

#### Visualization
- Use Gazebo's contact visualization
- Enable joint limit and force visualization
- Monitor physics statistics and performance

#### Logging
- Log joint states and forces
- Monitor center of mass position
- Track contact forces and torques
- Record simulation timing information

## Summary

Physics simulation is a complex but essential component of humanoid robot development. The choice of physics engine, configuration of parameters, and modeling of interactions all significantly impact simulation quality and realism. For humanoid robots, special attention must be paid to balance, contact modeling, and the integration of control systems with physics simulation. Proper validation and tuning ensure that simulation results are meaningful and transferable to real-world applications.

---

## Further Reading

- "Real-Time Rendering" by Tomas Akenine-Möller et al. (for graphics and physics integration)
- "Rigid Body Dynamics Algorithms" by Roy Featherstone
- "Introduction to Robotics: Mechanics and Control" by John Craig
- Gazebo physics documentation
- ODE, Bullet, and DART physics engine documentation
- "Programming Robots with ROS" by Quigley et al.