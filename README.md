This project is my first attempt in specs driven development
i porvided prompts filtered using chatgp are below

1. /sp.constitution Prompt (Copy–Paste)

You are generating the complete “Physical AI & Humanoid Robotics” textbook project using:

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

🟩 2. /sp.specify Prompt (Copy–Paste)
Creates the requirements specification.
Create a complete requirements SPECIFICATION for the “Physical AI & Humanoid Robotics” textbook project.

You MUST use the following:

SYSTEM COMPONENTS:
- Docusaurus for UI (docs/*.md, sidebar.js, components)
- GitHub auto-commit for every file change
- Context7 MCP to read the hackathon PDF and project files
- Spec-Kit Plus for generating chapters, tasks, plans
- Claude CLI for file generation/editing
- Backend with FastAPI + Qdrant + Neon + OpenAI Agents for RAG chatbot

REQUIREMENTS DOCUMENT MUST INCLUDE:
1. Project Overview
2. Functional Requirements
   - Modules, lessons, subtopics (full list provided below)
   - RAG chatbot integrated into Docusaurus
   - Personalization button (optional bonus)
   - Urdu translation button (optional bonus)
3. Non-functional Requirements
4. File/folder structure for:
   - Docusaurus
   - Spec-Kit
   - RAG backend
5. Constraints
6. Acceptance criteria
7. GitHub auto-commit workflow requirements
8. Context7 usage rules

ALL CONTENT MUST FOLLOW THIS EXACT COURSE STRUCTURE:
(Insert full module → lesson → content hierarchy exactly as provided in the constitution.)

Do not hallucinate. Only produce items that exist in the outline. If unclear, ask for clarification.


🟨 3. /sp.plan Prompt (Copy–Paste)
Generates the entire implementation plan.
Create a step-by-step EXECUTION PLAN for producing the full “Physical AI & Humanoid Robotics” textbook.

The plan must follow Spec-Kit Plus workflow and the official hackathon outline.

MUST INCLUDE:

PHASE 1 — Environment + Tool Setup
  - Install Docusaurus
  - Initialize Spec-Kit Plus
  - Enable GitHub auto-commit
  - Configure Context7

PHASE 2 — Content Generation
  - For EACH module and EVERY lesson:
     - Generate chapter files
     - Fill lessons based on hierarchy
     - Use Context7 to reference PDF
     - Commit files to GitHub

PHASE 3 — RAG Chatbot Backend
  - Set up FastAPI server
  - Integrate Qdrant Cloud
  - Integrate Neon DB
  - Create embeddings pipeline
  - Create /ask endpoint
  - Write Dockerfile
  - Auto-commit

PHASE 4 — Docusaurus Integration
  - Add chatbot widget
  - Map chapters to sidebar
  - Add personalize button (bonus)
  - Add Urdu translate button (bonus)

PHASE 5 — Deployment
  - Deploy Docusaurus to GitHub Pages or Vercel
  - Deploy FastAPI backend
  - Connect endpoints

PHASE 6 — Testing
  - Validate RAG answers using book text
  - Validate each module for correctness
  - Validate zero hallucination

The plan MUST use the module → lesson → topic structure EXACTLY as defined in the constitution.

Do not invent steps, content, or tools.

🟧 4. /sp.task Prompt (Copy–Paste)
Creates a single small, atomic task.
Generate a SINGLE atomic TASK for this project.

TASK REQUIREMENTS:
- Must correspond to EXACT modules/lessons listed in the constitution.
- Must write or edit ONE file only.
- Must be achievable in one commit.
- Must specify:
   - File path
   - Input context needed (use Context7)
   - Exact expected output
   - Zero hallucination guarantee
- Must end with: “This task must be auto-committed to GitHub.”

EXAMPLE ALLOWED TASKS:
- Create docs/ros2/ros2-architecture.md using lesson outline.
- Add sidebar entries for Module 2.
- Create FastAPI embeddings endpoint.
- Add chatbot React component.

DO NOT:
- Combine multiple features
- Invent new lessons or modules
- Guess missing info

Now generate a valid task.


🟥 5. /sp.implement Prompt (Copy–Paste)
Executes the selected task with real code + GitHub commit.
Implement the SELECTED TASK using the following rules:

1. Use Context7 to load any required files (PDF, markdown, code).
2. Follow the EXACT module → lesson → topic hierarchy from the constitution.
3. Produce real, executable, valid files (Markdown or code).
4. Write content directly into the correct path.
5. DO NOT hallucinate missing concepts or content.
6. If essential context is missing, stop and ask the user before writing.
7. After writing the file, perform a GitHub auto-commit with a clear commit message.
8. Ensure Docusaurus compatibility (md/mdx, headings, frontmatter).
9. For backend tasks: follow FastAPI, Qdrant, Neon, and OpenAI SDK conventions exactly.

Complete the task with accuracy, no invention, and full reproducibility.
10. Commit changes on github and publish it on github pages, don’t forget to mention you commit this at each step



