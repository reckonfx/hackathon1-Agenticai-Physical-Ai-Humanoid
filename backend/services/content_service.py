import asyncio
from typing import List, Dict
import logging
import os
from pathlib import Path
import re

logger = logging.getLogger(__name__)

async def search_content_by_text(query: str, top_k: int = 5) -> List[Dict]:
    """
    Search for relevant content in the textbook by text matching
    """
    try:
        # Get the docs directory containing textbook content
        docs_dir = Path("docs")
        if not docs_dir.exists():
            logger.error("Docs directory not found")
            return []

        # Find all markdown files in the docs directory
        md_files = list(docs_dir.rglob("*.md"))

        # Simple text-based search (in a real implementation, this would use embeddings)
        results = []
        query_lower = query.lower()

        for md_file in md_files:
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Find relevant text snippets containing the query
                # This is a simple implementation - a real system would use semantic search
                content_lower = content.lower()
                if query_lower in content_lower:
                    # Extract text around the query match
                    query_idx = content_lower.find(query_lower)
                    start_idx = max(0, query_idx - 100)
                    end_idx = min(len(content), query_idx + len(query) + 100)
                    snippet = content[start_idx:end_idx]

                    # Clean up the snippet
                    snippet = re.sub(r'\s+', ' ', snippet)  # Normalize whitespace

                    results.append({
                        "text": snippet,
                        "source": str(md_file.relative_to(docs_dir)),
                        "score": 0.9  # High score for exact matches
                    })
                else:
                    # Do a more lenient search for related content
                    # Count word overlaps as a simple relevance measure
                    query_words = set(query_lower.split())
                    content_words = set(content_lower.split())
                    overlap = len(query_words.intersection(content_words))

                    if overlap > 0:
                        # Extract a representative snippet
                        lines = content.split('\n')
                        snippet = ' '.join(lines[:5])  # First few lines as snippet
                        snippet = re.sub(r'\s+', ' ', snippet)

                        score = min(0.8, overlap / len(query_words))  # Normalize score

                        results.append({
                            "text": snippet,
                            "source": str(md_file.relative_to(docs_dir)),
                            "score": score
                        })
            except Exception as e:
                logger.warning(f"Error reading file {md_file}: {str(e)}")
                continue

        # Sort results by score and return top_k
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    except Exception as e:
        logger.error(f"Error in search_content_by_text: {str(e)}")
        raise

async def get_content_by_source(source: str) -> str:
    """
    Retrieve specific content by source
    """
    docs_dir = Path("docs")
    source_path = docs_dir / source

    if source_path.exists():
        with open(source_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        return f"Content file {source} not found"