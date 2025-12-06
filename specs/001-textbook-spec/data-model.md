# Data Model: Physical AI & Humanoid Robotics Textbook

**Feature**: 001-textbook-spec
**Date**: 2025-12-06

## Overview

This document defines the data models for the Physical AI & Humanoid Robotics textbook project, including both the content management system and the RAG chatbot backend.

## Content Data Models

### Textbook Module
- `id`: UUID - Unique identifier for the module
- `title`: String - Module title (e.g., "Introduction & Physical AI Foundations")
- `number`: Integer - Sequential module number (1-7)
- `description`: String - Brief description of the module
- `lessons`: Array of Lesson objects - List of lessons in the module
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update timestamp

### Lesson
- `id`: UUID - Unique identifier for the lesson
- `moduleId`: UUID - Reference to parent module
- `title`: String - Lesson title (e.g., "What is Physical AI?")
- `slug`: String - URL-friendly identifier
- `content`: String - Markdown content of the lesson
- `order`: Integer - Sequential order within the module
- `prerequisites`: Array of String - Prerequisite concepts
- `learningObjectives`: Array of String - Learning objectives
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update timestamp

### Subtopic
- `id`: UUID - Unique identifier for the subtopic
- `lessonId`: UUID - Reference to parent lesson
- `title`: String - Subtopic title
- `content`: String - Markdown content of the subtopic
- `order`: Integer - Sequential order within the lesson
- `type`: Enum - Content type (text, code, diagram, example)
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update timestamp

## RAG Backend Models

### Content Embedding
- `id`: UUID - Unique identifier for the embedding
- `contentId`: UUID - Reference to the original content (lesson/subtopic)
- `contentType`: Enum - Type of content (lesson, subtopic, module)
- `text`: String - The text that was embedded
- `embedding`: Array of Float - Vector representation of the text
- `metadata`: JSON - Additional metadata (module, lesson, etc.)
- `createdAt`: DateTime - Creation timestamp

### Chat Query
- `id`: UUID - Unique identifier for the query
- `userId`: UUID - User identifier (nullable for anonymous)
- `queryText`: String - Original user query
- `sessionId`: String - Session identifier for conversation context
- `createdAt`: DateTime - Query timestamp

### Chat Response
- `id`: UUID - Unique identifier for the response
- `queryId`: UUID - Reference to the original query
- `responseText`: String - AI-generated response
- `sources`: Array of UUID - Content IDs used to generate response
- `confidenceScore`: Float - Confidence level of the response (0.0-1.0)
- `createdAt`: DateTime - Response timestamp

## User and Personalization Models

### User Profile (Optional)
- `id`: UUID - Unique user identifier
- `preferences`: JSON - User preferences including language, theme, etc.
- `learningProgress`: JSON - Progress tracking across modules/lessons
- `createdAt`: DateTime - Account creation timestamp
- `updatedAt`: DateTime - Last profile update

## Translation Models

### Translation
- `id`: UUID - Unique identifier for the translation
- `contentId`: UUID - Reference to original content
- `contentType`: Enum - Type of content (lesson, subtopic, etc.)
- `targetLanguage`: String - Language code (e.g., "ur" for Urdu)
- `translatedText`: String - Translated content
- `status`: Enum - Translation status (pending, completed, reviewed)
- `qualityScore`: Float - Quality score of translation (0.0-1.0)
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update timestamp

## Database Schema Relationships

```
[Module] 1 -- * [Lesson] 1 -- * [Subtopic]
[Lesson] -- * [Content Embedding]
[Subtopic] -- * [Content Embedding]
[Chat Query] 1 -- 1 [Chat Response]
[Content Embedding] -- * [Chat Response] (via sources)
```

## Vector Database Schema (Qdrant)

### Collection: content_embeddings
- Point ID: Content ID (lesson/subtopic ID)
- Vector: Embedding vector (OpenAI ada-002: 1536 dimensions)
- Payload:
  - content_id: UUID
  - content_type: String (lesson, subtopic)
  - module_id: UUID
  - lesson_id: UUID
  - text_preview: String (first 200 chars)
  - metadata: JSON (additional context)

## Constraints and Validation

### Content Integrity
- Module numbers must be sequential from 1-7
- Lesson order within modules must be unique and sequential
- Content must adhere to the predefined hierarchy
- All content must be validated through Context7 MCP

### Performance Constraints
- Embedding vectors must be normalized
- Content chunks for embedding should be 500-1000 tokens
- Translation cache should expire after 30 days