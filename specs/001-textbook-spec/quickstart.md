# Quickstart Guide: Physical AI & Humanoid Robotics Textbook

**Feature**: 001-textbook-spec
**Date**: 2025-12-06

## Overview

This quickstart guide provides step-by-step instructions to set up and run the Physical AI & Humanoid Robotics textbook project with integrated RAG chatbot.

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Git
- Access to OpenAI API key
- Access to Qdrant Cloud account
- Access to Neon PostgreSQL account

## Local Development Setup

### 1. Clone and Initialize Repository

```bash
git clone <repository-url>
cd humanoid-ai-book
```

### 2. Install Frontend Dependencies

```bash
# Navigate to project root
cd /path/to/project

# Install Docusaurus dependencies
npm install
```

### 3. Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### 4. Environment Configuration

Create `.env` file in the backend directory with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
QDRANT_URL=your_qdrant_cluster_url
QDRANT_API_KEY=your_qdrant_api_key
NEON_DB_URL=your_neon_database_connection_string
CONTEXT7_MCP_PATH=path_to_context7_mcp_server
```

### 5. Initialize Vector Database

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Run the embedding pipeline to index textbook content
python -m services.embedding_service --init
```

## Running the Application

### 1. Start Backend Server

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```

Backend will be available at: `http://localhost:8000`

API documentation available at: `http://localhost:8000/docs`

### 2. Start Frontend (Docusaurus)

In a new terminal:

```bash
# From project root
npm start
```

Frontend will be available at: `http://localhost:3000`

## Key Features

### Content Navigation
- Browse textbook content organized in 7 modules
- Navigate through lessons and subtopics
- Search functionality across all content

### RAG Chatbot
- Ask questions about Physical AI and Humanoid Robotics
- Get contextually relevant answers based on textbook content
- Access through the chatbot widget on any page

### Personalization (Optional)
- Adjust learning preferences
- Track progress through modules
- Customize interface settings

### Urdu Translation (Optional)
- Toggle to Urdu translation for core concepts
- Available via translation button in header

## API Endpoints

### Backend API
- `GET /health` - Health check
- `POST /api/ask` - RAG question answering
- `GET /api/modules` - List all modules
- `GET /api/lessons/{module_id}` - Get lessons in a module

### Request Example
```bash
curl -X POST http://localhost:8000/api/ask \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explain ROS 2 architecture",
    "session_id": "unique-session-id"
  }'
```

## Building for Production

### Frontend Build
```bash
npm run build
```

### Backend Container
```bash
# From backend directory
docker build -t textbook-backend .
docker run -p 8000:8000 textbook-backend
```

## Content Generation Workflow

### Using Context7 MCP
1. Place PDF files in the `resources/` directory
2. Run content generation script:
```bash
python -m scripts.generate_content --source resources/ --target docs/
```

### Auto-commit Configuration
All content changes are automatically committed to GitHub with descriptive messages following the pattern:
```
docs: update {module}/{lesson} content

- Add new content for {topic}
- Update examples and diagrams
- Generated with Spec-Kit Plus
```

## Troubleshooting

### Common Issues

1. **Backend won't start**
   - Verify environment variables are set correctly
   - Check that required services (Qdrant, Neon) are accessible

2. **Chatbot not responding**
   - Confirm vector database has been initialized with content
   - Check OpenAI API key validity

3. **Content not displaying**
   - Verify Docusaurus sidebar configuration
   - Ensure content files follow correct naming convention

### Useful Commands
```bash
# Check backend health
curl http://localhost:8000/health

# Verify content indexing
curl http://localhost:8000/api/modules

# View available content
npm run docusaurus docs:version
```

## Next Steps

1. Customize the textbook content in the `docs/` directory
2. Fine-tune the RAG system by adjusting embedding parameters
3. Add additional modules or update existing content
4. Deploy to production using the deployment scripts