<!--
Sync Impact Report:
- Version change: N/A -> 1.0.0
- Modified principles: N/A (new constitution)
- Added sections: All principles and sections defined below
- Removed sections: None
- Templates requiring updates: ✅ .specify/templates/plan-template.md, ✅ .specify/templates/spec-template.md, ✅ .specify/templates/tasks-template.md
- Follow-up TODOs: None
-->
# Physical AI & Humanoid Robotics Constitution

## Core Principles

### Strict Course Structure Adherence
All content must strictly follow the exact course hierarchy: Module 1 (Introduction & Physical AI Foundations), Module 2 (ROS 2 Fundamentals), Module 3 (Robot Simulation), Module 4 (NVIDIA Isaac Platform), Module 5 (Humanoid Robot Development), Module 6 (VLA Robotics), and Module 7 (Capstone). No modifications, additions, removals, or renames of modules, lessons, or subtopics are permitted.

### No Hallucination Policy
No invented tools, APIs, hardware, robots, or features are allowed. All content must be based on real, existing technology. When in doubt, DO NOT GUESS — ask the user for clarification. Use Context7 to read files instead of creating assumptions about capabilities or features.

### Technical Accuracy and Factual Content
All writing must be technical and factual. Content must be grounded in real-world implementations and proven concepts in Physical AI and Humanoid Robotics. Speculation and theoretical concepts without real-world application must be clearly labeled as such.

### Docusaurus Compatibility
All outputs must be 100% compatible with Docusaurus. Generated content, code snippets, and documentation must follow Docusaurus standards and formatting requirements. All generated code must be real and executable, with proper syntax and dependencies.

### Spec-Kit Plus Workflow Compliance
All tasks must remain within the boundaries of the Spec-Kit Plus workflow. Every edit must create a valid GitHub commit. Follow the established patterns for specifications, plans, and tasks as defined in the project templates.

### Context7-First Development
Prioritize using Context7 MCP for context retrieval from project files and PDFs instead of internal knowledge. This ensures consistency with existing project materials and prevents the introduction of conflicting information.

## Technology Stack Requirements

The project uses: Spec-Kit Plus for book creation, Claude CLI for editing and writing, Docusaurus for UI and publishing, GitHub auto-commit for version control, and Context7 MCP for context retrieval. All development must be compatible with these tools and their constraints.

## Development Workflow

Content creation must follow the Spec-Kit Plus methodology: specifications define requirements, plans detail implementation approaches, and tasks break work into testable units. Each piece of content must pass validation against the course structure before being committed. All changes must create proper GitHub commits with descriptive messages.

## Governance

This constitution supersedes all other practices and guidelines for the Physical AI & Humanoid Robotics textbook project. Any deviation from these principles requires explicit documentation and approval. All pull requests and reviews must verify compliance with these principles. Content must be reviewed for structural adherence, technical accuracy, and hallucination prevention. Use this constitution as the primary guidance for all development decisions.

**Version**: 1.0.0 | **Ratified**: 2025-12-06 | **Last Amended**: 2025-12-06
