from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import API routes
from backend.api import chatbot

# Initialize FastAPI app
app = FastAPI(
    title="Physical AI & Humanoid Robotics Textbook RAG API",
    description="API for RAG chatbot functionality for the Physical AI & Humanoid Robotics textbook",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(chatbot.router, prefix="/api/v1", tags=["chatbot"])

@app.get("/")
async def root():
    return {"message": "Physical AI & Humanoid Robotics Textbook RAG API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "RAG API"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)