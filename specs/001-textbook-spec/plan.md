# Implementation Plan: Physical AI & Humanoid Robotics Textbook

**Branch**: `001-textbook-spec` | **Date**: 2025-12-06 | **Spec**: [specs/001-textbook-spec/spec.md](../001-textbook-spec/spec.md)
**Input**: Feature specification from `/specs/001-textbook-spec/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of a comprehensive Physical AI & Humanoid Robotics textbook using Docusaurus for UI, with integrated RAG chatbot backend using FastAPI, Qdrant, Neon, and Google Gemini 1.5 Flash API. The plan includes environment setup, content generation for all 7 modules following the exact hierarchy, RAG backend development with security measures, Docusaurus integration with chatbot widget, and deployment. The system will use Context7 MCP for content generation and GitHub auto-commit for version control.

## Technical Context

**Language/Version**: Python 3.11, JavaScript/TypeScript, Node.js 18+
**Primary Dependencies**: Docusaurus, FastAPI, Qdrant, Neon, Google Gemini 1.5 Flash API, Google Cloud Translation API, Context7 MCP, Spec-Kit Plus, Claude CLI
**Storage**: Qdrant vector database, Neon PostgreSQL, GitHub for version control
**Testing**: pytest for backend, Jest for frontend components
**Target Platform**: Web application (Linux server) with GitHub Pages deployment
**Project Type**: Web application - determines source structure
**Performance Goals**: Support 1000+ concurrent users, page load <3s, chatbot response <5s
**Constraints**: Must follow 7-module hierarchy exactly, Docusaurus compatibility required, Urdu translation using verified Google Cloud Translation API
**Scale/Scope**: 7 textbook modules with multiple lessons each, RAG chatbot serving textbook content

## Technology Verification
*GATE: All technologies mentioned must be verified as existing real technology before implementation*

### Verified Technologies:
- **Docusaurus**: Confirmed existing static site generator with documentation and community support
- **FastAPI**: Confirmed existing Python web framework with async support and automatic API documentation
- **Qdrant**: Confirmed existing vector database with similarity search capabilities and Python SDK
- **Neon**: Confirmed existing serverless PostgreSQL provider with branching and pooling features
- **Google Gemini 1.5 Flash API**: Confirmed existing service with embeddings and chat capabilities (requires API key)
- **Context7 MCP**: Confirmed existing service for content retrieval from project files and PDFs
- **Google Cloud Translation API**: Confirmed existing service supporting Urdu translation with technical terminology capabilities
- **Spec-Kit Plus**: Confirmed existing toolset for specification-driven development
- **Claude CLI**: Confirmed existing tool for content generation and editing

### Compliance Verification:
All technologies listed above have been verified as existing, real products/services with proper documentation and are not invented or hypothetical tools. Google Gemini 1.5 Flash API and Google Cloud Translation API have been specifically verified as existing services with the capabilities required for this project. This ensures compliance with the "No Hallucination Policy" from the project constitution.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Physical AI & Humanoid Robotics Constitution Compliance:
- Course Structure Adherence: Implementation must follow the exact module hierarchy (Modules 1-7) with no modifications
- No Hallucination: All tools, APIs, and technologies must be real and existing; no invented features
- Technical Accuracy: All content must be factual and based on proven concepts
- Docusaurus Compatibility: All outputs must be compatible with Docusaurus
- Spec-Kit Plus Workflow: All tasks must follow established patterns
- Context7-First: Prioritize Context7 for information retrieval over assumptions

## Project Structure

### Documentation (this feature)
```text
specs/001-textbook-spec/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)
```text
# Web application: Docusaurus frontend + FastAPI backend
docs/
├── intro-physical-ai/      # Module 1 content
├── ros2-fundamentals/      # Module 2 content
├── robot-simulation/       # Module 3 content
├── nvidia-isaac/           # Module 4 content
├── humanoid-development/   # Module 5 content
├── vla-robotics/           # Module 6 content
└── capstone-project/       # Module 7 content

src/
├── components/             # Custom React components (chatbot widget, etc.)
│   └── ChatbotWidget/
│       ├── ChatbotWidget.jsx
│       ├── ChatbotWidget.css
│       └── ChatbotAPI.js
├── pages/                  # Custom pages if needed
└── css/                    # Custom styles

backend/
├── main.py                 # FastAPI application entry point
├── api/
│   ├── __init__.py
│   ├── chatbot.py          # /ask endpoint
│   └── models.py           # Request/response models
├── services/
│   ├── __init__.py
│   ├── embedding_service.py # Embedding generation and management
│   ├── rag_service.py      # RAG logic
│   └── content_service.py  # Content retrieval
├── models/
│   ├── __init__.py
│   └── database.py         # Database models
├── config/
│   ├── __init__.py
│   └── settings.py         # Configuration management
├── utils/
│   ├── __init__.py
│   └── helpers.py
├── requirements.txt
└── Dockerfile

sidebars.js                 # Navigation structure for all modules
docusaurus.config.js        # Docusaurus configuration
package.json               # Frontend dependencies
requirements.txt           # Backend dependencies
```

**Structure Decision**: Web application with separate backend API for RAG functionality and Docusaurus frontend for textbook content. This allows for proper separation of concerns between content presentation and AI-powered search capabilities.

## Implementation Phases

### PHASE 1 — Environment + Tool Setup
- [ ] Install and configure Docusaurus
- [ ] Initialize Spec-Kit Plus project structure
- [ ] Set up GitHub auto-commit workflow
- [ ] Configure Context7 MCP for PDF and project file access
- [ ] Install Python dependencies (FastAPI, Qdrant, Neon drivers, OpenAI)
- [ ] Set up development environment with proper tooling

### PHASE 2 — Content Generation
- [ ] Generate Module 1 content (Introduction & Physical AI Foundations)
  - [ ] What is Physical AI?
  - [ ] Embodied Intelligence
  - [ ] Humanoid Robotics Landscape
  - [ ] Sensor Systems
- [ ] Generate Module 2 content (ROS 2 Fundamentals)
  - [ ] ROS 2 Architecture
  - [ ] ROS 2 Nodes
  - [ ] Topics, Services, Actions
  - [ ] Creating ROS 2 Packages (Python)
  - [ ] Launch Files & Parameters
  - [ ] URDF for Humanoids
- [ ] Generate Module 3 content (Robot Simulation)
  - [ ] Gazebo Setup
  - [ ] URDF + SDF Descriptions
  - [ ] Physics Simulation
  - [ ] Sensor Simulation
  - [ ] Unity Visualization
- [ ] Generate Module 4 content (NVIDIA Isaac Platform)
  - [ ] Isaac Sim Overview
  - [ ] Isaac ROS (VSLAM, Perception, Navigation)
  - [ ] AI-Powered Manipulation
  - [ ] Reinforcement Learning
  - [ ] Sim-to-Real Transfer
- [ ] Generate Module 5 content (Humanoid Robot Development)
  - [ ] Humanoid Kinematics
  - [ ] Dynamics & Control
  - [ ] Bipedal Locomotion
  - [ ] Balance Control
  - [ ] Manipulation & Grasping
  - [ ] Human-Robot Interaction
- [ ] Generate Module 6 content (VLA Robotics)
  - [ ] What is VLA?
  - [ ] Voice-to-Action (Whisper)
  - [ ] Cognitive Planning with LLMs
  - [ ] Multi-modal Perception
  - [ ] NL → ROS 2 Action Mapping
- [ ] Generate Module 7 content (Capstone)
  - [ ] Requirements
  - [ ] System Architecture
  - [ ] Navigation & Obstacle Avoidance
  - [ ] Object Recognition
  - [ ] Grasping & Manipulation
  - [ ] Full Demo
- [ ] Use Context7 to reference PDF materials for content accuracy
- [ ] Commit all content files to GitHub with proper commit messages

### PHASE 3 — RAG Chatbot Backend
- [ ] Set up FastAPI server with proper routing
- [ ] Integrate Qdrant vector database for content embeddings
- [ ] Integrate Neon PostgreSQL for metadata storage
- [ ] Define data models for key entities (Textbook Module, Lesson Content, User Interaction, Content Source, Generated Content, RAG Query, RAG Response)
- [ ] Create embeddings pipeline for textbook content
- [ ] Implement /ask endpoint with RAG logic
- [ ] Create Dockerfile for containerization
- [ ] Set up proper error handling and logging
- [ ] Implement content retrieval and context management
- [ ] Implement security measures (authentication, rate limiting, input validation)
- [ ] Auto-commit backend code to GitHub

### PHASE 4 — Docusaurus Integration
- [ ] Add chatbot widget component to Docusaurus
- [ ] Integrate with backend RAG API
- [ ] Map all chapters to sidebar navigation
- [ ] Add personalization button with functionality
- [ ] Add Urdu translation button with core concepts translation
- [ ] Ensure responsive design and accessibility
- [ ] Test integration between frontend and backend

### PHASE 5 — Deployment
- [ ] Deploy Docusaurus frontend to GitHub Pages
- [ ] Deploy FastAPI backend to cloud platform (render.com, Railway, etc.)
- [ ] Configure domain and SSL certificates
- [ ] Set up CI/CD pipeline for automated deployments
- [ ] Configure monitoring and logging
- [ ] Perform end-to-end testing
- [ ] Document deployment process

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [None] | [N/A] | [No violations identified] |