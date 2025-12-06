# Physical AI & Humanoid Robotics Textbook

A comprehensive interactive textbook with RAG chatbot for Physical AI and Humanoid Robotics education.

## Prerequisites

Before starting implementation, ensure you have access to the following services and API keys:

### Required Services & API Keys
- **GitHub Account**: Personal access token with repository permissions
- **Google Gemini API Key**: For embeddings and chatbot functionality
- **Google Cloud Translation API Key**: For Urdu translation functionality
- **Qdrant Account**: Vector database for content embeddings
- **Neon Account**: PostgreSQL database for metadata storage

### Optional Services
- **Cloud Platform**: Render, Railway, or similar for backend deployment
- **Custom Domain**: For production deployment
- **Monitoring Service**: For production monitoring

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd humanoid-ai-book
   ```

2. **Install dependencies:**
   ```bash
   # Frontend dependencies
   npm install

   # Backend dependencies
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys and configuration
   ```

4. **Required Environment Variables:**
   - `GITHUB_TOKEN`: GitHub personal access token
   - `GEMINI_API_KEY`: Google Gemini API key
   - `GOOGLE_CLOUD_TRANSLATION_API_KEY`: Google Cloud Translation API key
   - `QDRANT_URL`: Qdrant cluster URL
   - `QDRANT_API_KEY`: Qdrant API key
   - `NEON_DB_URL`: Neon PostgreSQL connection string
   - `CONTEXT7_MCP_URL`: Context7 MCP server URL

## Project Structure

```
docs/                    # Textbook content (7 modules)
├── intro-physical-ai/   # Module 1
├── ros2-fundamentals/   # Module 2
├── robot-simulation/    # Module 3
├── nvidia-isaac/        # Module 4
├── humanoid-development/ # Module 5
├── vla-robotics/        # Module 6
└── capstone-project/    # Module 7

backend/                 # FastAPI RAG backend
├── main.py              # Application entry point
├── api/                 # API endpoints
├── services/            # Business logic
├── models/              # Data models
└── config/              # Configuration

src/components/          # Docusaurus components
├── ChatbotWidget/       # RAG chatbot component
└── ...
```

## Implementation Plan

The project follows a 6-phase implementation:

1. **Environment Setup** - Configure tools and dependencies
2. **Content Generation** - Create all 7 textbook modules
3. **RAG Backend** - Implement chatbot and search functionality
4. **Frontend Integration** - Integrate chatbot with Docusaurus
5. **Deployment** - Deploy to production
6. **Verification** - Test all functionality

## Getting Started

1. Ensure all required API keys are configured in `.env`
2. Run the implementation workflow: `/sp.implement`
3. Follow the task execution and address any issues

## Security Notes

- Never commit actual API keys to the repository
- Use environment variables for all sensitive configuration
- Store `.env` file securely and don't commit it to version control
- Rotate API keys regularly
- The `.env.example` file contains example values only - replace with your actual keys in a separate `.env` file
- Never share or expose your API keys in public repositories or code sharing platforms

## Architecture

- **Frontend**: Docusaurus static site generator
- **Backend**: FastAPI with RAG functionality
- **Vector DB**: Qdrant for content embeddings
- **Metadata DB**: Neon PostgreSQL
- **AI Services**: OpenAI for embeddings and chat, Google Translate for Urdu
- **Deployment**: GitHub Pages (frontend), Cloud platform (backend)