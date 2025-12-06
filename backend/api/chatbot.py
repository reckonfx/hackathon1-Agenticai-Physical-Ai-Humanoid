from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

# Import services
from backend.services import rag_service

router = APIRouter()

# Request/Response models
class QueryRequest(BaseModel):
    query: str
    context: Optional[str] = None

class QueryResponse(BaseModel):
    answer: str
    sources: List[str]
    confidence: float

class ChatHistoryItem(BaseModel):
    query: str
    response: str

# Main RAG endpoint
@router.post("/ask", response_model=QueryResponse)
async def ask_question(request: QueryRequest):
    """
    Main endpoint to ask questions about the textbook content
    """
    try:
        # Process the query using RAG service
        result = await rag_service.process_query(request.query, request.context)
        return QueryResponse(
            answer=result["answer"],
            sources=result["sources"],
            confidence=result["confidence"]
        )
    except Exception as e:
        logging.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing query")

# Health check for the chatbot service
@router.get("/chatbot/health")
async def chatbot_health():
    return {"status": "chatbot service healthy"}

# Additional endpoints for chat history and context management
@router.get("/chat-history")
async def get_chat_history():
    """
    Retrieve chat history (placeholder implementation)
    """
    # This would be implemented with actual storage in a real system
    return {"history": []}

@router.delete("/chat-history")
async def clear_chat_history():
    """
    Clear chat history (placeholder implementation)
    """
    # This would be implemented with actual storage in a real system
    return {"message": "Chat history cleared"}