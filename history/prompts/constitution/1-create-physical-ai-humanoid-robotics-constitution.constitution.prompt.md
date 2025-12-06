---
id: 1
title: Create Physical AI Humanoid Robotics Constitution
stage: constitution
date: 2025-12-06
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: Claude Code
command: /sp.constitution
labels: [constitution, physical-ai, humanoid-robotics, textbook]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
 - .specify/templates/plan-template.md
 - .specify/templates/spec-template.md
 - .specify/templates/tasks-template.md
tests:
 - none
---

## Prompt

You are generating the complete "Physical AI & Humanoid Robotics" textbook project using:

- Spec-Kit Plus for book creation
- Claude CLI for editing and writing
- Docusaurus for UI and publishing
- GitHub auto-commit for version control
- Context7 MCP for context retrieval from project files and PDF

Create a strict CONSTITUTION that governs the entire project.

==================================================
PROJECT SCOPE & STRUCTURE
==================================================

The textbook MUST follow this EXACT hierarchy. You are not allowed to modify, invent, remove, add, or rename modules, lessons, or subtopics.

MODULE 1: Introduction & Physical AI Foundations
  - What is Physical AI?
  - Embodied Intelligence
  - Humanoid Robotics Landscape
  - Sensor Systems

MODULE 2: ROS 2 Fundamentals
  - ROS 2 Architecture
  - ROS 2 Nodes
  - Topics, Services, Actions
  - Creating ROS 2 Packages (Python)
  - Launch Files & Parameters
  - URDF for Humanoids

MODULE 3: Robot Simulation (Gazebo + Unity)
  - Gazebo Setup
  - URDF + SDF Descriptions
  - Physics Simulation
  - Sensor Simulation
  - Unity Visualization

MODULE 4: NVIDIA Isaac Platform
  - Isaac Sim Overview
  - Isaac ROS (VSLAM, Perception, Navigation)
  - AI-Powered Manipulation
  - Reinforcement Learning
  - Sim-to-Real Transfer

MODULE 5: Humanoid Robot Development
  - Humanoid Kinematics
  - Dynamics & Control
  - Bipedal Locomotion
  - Balance Control
  - Manipulation & Grasping
  - Human-Robot Interaction

MODULE 6: VLA Robotics (Vision-Language-Action)
  - What is VLA?
  - Voice-to-Action (Whisper)
  - Cognitive Planning with LLMs
  - Multi-modal Perception
  - NL → ROS 2 Action Mapping

MODULE 7: Capstone – The Autonomous Humanoid
  - Requirements
  - System Architecture
  - Navigation & Obstacle Avoidance
  - Object Recognition
  - Grasping & Manipulation
  - Full Demo

==================================================
STRICT RULES (NO HALLUCINATION)
==================================================

1. All content must strictly follow the course outline above.
2. No invented tools, APIs, hardware, robots, or features.
3. You must use Context7 to read files instead of creating assumptions.
4. All writing must be technical and factual.
5. All outputs must be 100% compatible with Docusaurus.
6. All generated code must be real and executable.
7. Every edit must create a valid GitHub commit.
8. All tasks must remain within the boundaries of Spec-Kit Plus workflow.
10. When in doubt: DO NOT GUESS — ask the user.

Create a constitution that enforces these rules in detail.

## Response snapshot

A constitution has been created for the Physical AI & Humanoid Robotics textbook project. The constitution enforces strict adherence to the course structure, prevents hallucination of tools or features, ensures technical accuracy, maintains Docusaurus compatibility, follows the Spec-Kit Plus workflow, and prioritizes Context7 for information retrieval. The constitution has been integrated into the project templates to ensure compliance across all development activities.

## Outcome

- ✅ Impact: Created comprehensive constitution for Physical AI & Humanoid Robotics textbook project with 6 core principles
- 🧪 Tests: none
- 📁 Files: Updated .specify/memory/constitution.md and 3 template files to enforce constitution compliance
- 🔁 Next prompts: N/A
- 🧠 Reflection: Constitution successfully enforces the strict requirements for the textbook project

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A