// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Introduction & Physical AI Foundations',
      items: [
        'intro-physical-ai/what-is-physical-ai',
        'intro-physical-ai/embodied-intelligence',
        'intro-physical-ai/humanoid-robotics-landscape',
        'intro-physical-ai/sensor-systems'
      ],
    },
    {
      type: 'category',
      label: 'ROS 2 Fundamentals',
      items: [
        'ros2-fundamentals/ros2-architecture',
        'ros2-fundamentals/ros2-nodes',
        'ros2-fundamentals/topics-services-actions',
        'ros2-fundamentals/creating-ros2-packages-python',
        'ros2-fundamentals/launch-files-parameters',
        'ros2-fundamentals/urdf-for-humanoids'
      ],
    },
    {
      type: 'category',
      label: 'Robot Simulation',
      items: [
        'robot-simulation/gazebo-setup',
        'robot-simulation/urdf-sdf-descriptions',
        'robot-simulation/physics-simulation',
        'robot-simulation/sensor-simulation',
        'robot-simulation/unity-visualization'
      ],
    },
    {
      type: 'category',
      label: 'NVIDIA Isaac Platform',
      items: [
        'nvidia-isaac/isaac-sim-overview',
        'nvidia-isaac/isaac-ros',
        'nvidia-isaac/ai-powered-manipulation',
        'nvidia-isaac/reinforcement-learning',
        'nvidia-isaac/sim-to-real-transfer'
      ],
    },
    {
      type: 'category',
      label: 'Humanoid Robot Development',
      items: [
        'humanoid-development/humanoid-kinematics',
        'humanoid-development/dynamics-control',
        'humanoid-development/bipedal-locomotion',
        'humanoid-development/balance-control',
        'humanoid-development/manipulation-grasping',
        'humanoid-development/human-robot-interaction'
      ],
    },
    {
      type: 'category',
      label: 'VLA Robotics',
      items: [
        'vla-robotics/what-is-vla',
        'vla-robotics/voice-to-action',
        'vla-robotics/cognitive-planning-llms',
        'vla-robotics/multi-modal-perception',
        'vla-robotics/nl-ros2-action-mapping'
      ],
    },
    {
      type: 'category',
      label: 'Capstone Project',
      items: [
        'capstone-project/requirements',
        'capstone-project/system-architecture',
        'capstone-project/navigation-obstacle-avoidance',
        'capstone-project/object-recognition',
        'capstone-project/grasping-manipulation',
        'capstone-project/full-demo'
      ],
    },
  ],
};

module.exports = sidebars;