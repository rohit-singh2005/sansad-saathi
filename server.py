"""
SansadSaathi FastAPI Backend
============================
RAG pipeline: FAISS vector search + Google Gemini / Groq for Lok Sabha proceedings.
Falls back to Groq (free) if Gemini quota is exhausted.
"""

import os
import json
import pickle
import logging
import time
import asyncio
from pathlib import Path
from typing import Optional

import faiss
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("sansad")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
NEWS_API_KEY = os.getenv("VITE_NEWS_API_KEY", "")
SANSAD_DATA_PATH = Path(os.getenv("SANSAD_DATA_PATH", r"d:\PRJ 3\sansad_data"))

# Gemini config — try multiple models
GEMINI_MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"]
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

# Groq config (free fallback)
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

TOP_K = 40  # number of chunks to retrieve

# ---------------------------------------------------------------------------
# Global state (loaded on startup)
# ---------------------------------------------------------------------------
faiss_index: Optional[faiss.Index] = None
metadata_list: Optional[list] = None
embed_model = None  # SentenceTransformer

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title="SansadSaathi API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup: load heavy resources
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def load_resources():
    global faiss_index, metadata_list, embed_model

    logger.info("Loading sentence-transformer model (all-MiniLM-L6-v2)...")
    from sentence_transformers import SentenceTransformer
    embed_model = SentenceTransformer("all-MiniLM-L6-v2")
    logger.info("Model loaded.")

    logger.info(f"Loading FAISS index from {SANSAD_DATA_PATH / 'faiss-001.index'} ...")
    t0 = time.time()
    faiss_index = faiss.read_index(str(SANSAD_DATA_PATH / "faiss-001.index"))
    logger.info(f"FAISS index loaded: {faiss_index.ntotal} vectors in {time.time()-t0:.1f}s")

    logger.info(f"Loading metadata from {SANSAD_DATA_PATH / 'metadata.pkl'} ...")
    t0 = time.time()
    with open(SANSAD_DATA_PATH / "metadata.pkl", "rb") as f:
        metadata_list = pickle.load(f)
    logger.info(f"Metadata loaded: {len(metadata_list)} entries in {time.time()-t0:.1f}s")

    # Log which LLM backends are available
    if GEMINI_API_KEY:
        logger.info("Gemini API key configured ✓")
    if GROQ_API_KEY:
        logger.info("Groq API key configured ✓")
    if not GEMINI_API_KEY and not GROQ_API_KEY:
        logger.warning("⚠ No LLM API key configured! Set GEMINI_API_KEY or GROQ_API_KEY in .env")


# ---------------------------------------------------------------------------
# Helper: search FAISS
# ---------------------------------------------------------------------------
def search_context(query: str, top_k: int = TOP_K) -> list[dict]:
    """Encode query and search FAISS for relevant chunks."""
    if faiss_index is None or metadata_list is None or embed_model is None:
        return []

    query_vec = embed_model.encode([query], convert_to_numpy=True).astype("float32")
    distances, indices = faiss_index.search(query_vec, top_k)

    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx < 0 or idx >= len(metadata_list):
            continue
        meta = metadata_list[idx]
        results.append({
            "text": meta.get("text", ""),
            "date": meta.get("date", ""),
            "session": meta.get("session", ""),
            "year": meta.get("year", ""),
            "filename": meta.get("filename", ""),
            "source": meta.get("source", ""),
            "page": meta.get("page", ""),
            "score": float(dist),
        })
    return results


# ---------------------------------------------------------------------------
# Helper: build system prompt with RAG context
# ---------------------------------------------------------------------------
def build_system_prompt(context_chunks: list[dict], user_lang: str = "en") -> str:
    """Build system prompt with retrieved parliamentary context."""
    context_text = ""
    for i, chunk in enumerate(context_chunks, 1):
        context_text += f"\n--- Document {i} ---\n"
        context_text += f"Date: {chunk['date']} | Session: {chunk['session']} | Year: {chunk['year']}\n"
        context_text += f"Source: {chunk['source']} | File: {chunk['filename']} | Page: {chunk['page']}\n"
        context_text += f"Content:\n{chunk['text']}\n"

    return f"""You are SansadSaathi, an expert AI assistant specialized in the Indian Parliament (Lok Sabha).

CRITICAL INSTRUCTIONS:
1. Use ONLY the provided document context below. Do NOT hallucinate or add outside knowledge.
2. Explain in a detailed, step-by-step manner. Make the answer easy to understand (use simple English).
3. Do NOT give short summaries. Provide comprehensive details.
4. If the context does NOT contain enough information to answer, say so honestly. Do not guess.
5. Always cite which document(s) you used.
6. Reply in the user's preferred language: {user_lang}.
7. Do NOT use any Markdown formatting like asterisks (*), bold (**), or italics. Output clean, plain text only.
8. FORMAT REQUIREMENT: Your response MUST be formatted formally as a chronological "Minutes of the Meeting" (MoM). Use the exact following structure:
   - Subject / Topic: [Brief title of the discussion]
   - Meeting Dates: [List the dates from the context documents]
   - Chronological Minutes:
     - [Date from document] [Speaker Name if available]: [Detailed, step-by-step explanation of the argument, statement, or issue raised, in simple English]
     - [Date from document] [Speaker Name if available]: [Detailed, step-by-step explanation of the argument, statement, or issue raised, in simple English]
     (Continue chronologically for all relevant points)
   - Decisions / Outcomes: [Detailed explanation of any resolutions, replies from ministers, or next steps mentioned]
   - References: [List the exact documents and page numbers cited]
9. Current date: {time.strftime('%B %d, %Y')}.

=== RETRIEVED PARLIAMENTARY CONTEXT ===
{context_text if context_text else "(No relevant documents found for this query)"}
=== END OF CONTEXT ===
"""


# ---------------------------------------------------------------------------
# LLM Provider: Gemini streaming
# ---------------------------------------------------------------------------
async def stream_gemini(messages: list[dict], system_prompt: str):
    """Stream from Google Gemini API. Tries multiple models on rate limit."""
    
    contents = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg["content"]}]
        })

    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.95,
            "maxOutputTokens": 2048,
        }
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        for model_name in GEMINI_MODELS:
            url = f"{GEMINI_BASE_URL}/{model_name}:streamGenerateContent?alt=sse&key={GEMINI_API_KEY}"
            logger.info(f"Trying Gemini model: {model_name}")
            
            try:
                async with client.stream("POST", url, json=payload, headers={"Content-Type": "application/json"}) as response:
                    if response.status_code == 429:
                        error_body = await response.aread()
                        logger.warning(f"Rate limited on {model_name}, trying next model...")
                        continue
                    
                    if response.status_code != 200:
                        error_body = await response.aread()
                        logger.error(f"Gemini {model_name} error {response.status_code}: {error_body.decode()[:500]}")
                        continue

                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]
                            try:
                                data = json.loads(data_str)
                                candidates = data.get("candidates", [])
                                if candidates:
                                    parts = candidates[0].get("content", {}).get("parts", [])
                                    for part in parts:
                                        text = part.get("text", "")
                                        if text:
                                            yield text
                            except json.JSONDecodeError:
                                continue
                    return  # Success, stop trying models
            except httpx.TimeoutException:
                logger.warning(f"Timeout on {model_name}, trying next...")
                continue
    
    # If all Gemini models failed
    yield None  # Signal failure


# ---------------------------------------------------------------------------
# LLM Provider: Groq streaming (free fallback)
# ---------------------------------------------------------------------------
async def stream_groq(messages: list[dict], system_prompt: str):
    """Stream from Groq API (OpenAI-compatible). Free tier."""
    
    groq_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        groq_messages.append({"role": msg["role"], "content": msg["content"]})

    payload = {
        "model": GROQ_MODEL,
        "messages": groq_messages,
        "stream": True,
        "temperature": 0.7,
        "max_tokens": 2048,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream(
            "POST", GROQ_API_URL,
            json=payload,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            }
        ) as response:
            if response.status_code != 200:
                error_body = await response.aread()
                logger.error(f"Groq error {response.status_code}: {error_body.decode()[:500]}")
                yield None
                return

            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    data_str = line[6:]
                    if data_str.strip() == "[DONE]":
                        return
                    try:
                        data = json.loads(data_str)
                        delta = data.get("choices", [{}])[0].get("delta", {})
                        text = delta.get("content", "")
                        if text:
                            yield text
                    except json.JSONDecodeError:
                        continue


# ---------------------------------------------------------------------------
# POST /api/chat — RAG chat endpoint with SSE streaming
# ---------------------------------------------------------------------------
@app.post("/api/chat")
async def chat_endpoint(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid JSON body"}, status_code=400)

    messages = body.get("messages", [])
    user_lang = body.get("userLang", "en")

    if not messages or not isinstance(messages, list):
        return JSONResponse({"error": "Messages are required"}, status_code=400)

    if not GEMINI_API_KEY and not GROQ_API_KEY:
        return JSONResponse({"error": "No LLM API key configured. Set GEMINI_API_KEY or GROQ_API_KEY in .env"}, status_code=500)

    # Extract latest user query for vector search
    latest_query = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            latest_query = msg.get("content", "")
            break

    if not latest_query:
        return JSONResponse({"error": "No user message found"}, status_code=400)

    # 1. Search FAISS for relevant context
    logger.info(f"Searching FAISS for: '{latest_query[:80]}...'")
    context_chunks = search_context(latest_query)
    logger.info(f"Found {len(context_chunks)} relevant chunks")

    # 2. Build system prompt with context
    system_prompt = build_system_prompt(context_chunks, user_lang)

    # 3. Stream response
    async def generate():
        sources_data = [
            {
                "date": c["date"],
                "session": c["session"],
                "filename": c["filename"],
                "source": c["source"],
                "page": c["page"],
            }
            for c in context_chunks[:5]  # send top 5 sources
        ]

        got_response = False

        try:
            # Try Gemini first
            if GEMINI_API_KEY:
                logger.info("Using Gemini as LLM provider")
                async for text in stream_gemini(messages, system_prompt):
                    if text is None:
                        logger.warning("Gemini failed, falling back to Groq...")
                        break
                    got_response = True
                    yield f"data: {json.dumps({'content': text})}\n\n"

            # Fallback to Groq
            if not got_response and GROQ_API_KEY:
                logger.info("Using Groq as LLM provider")
                async for text in stream_groq(messages, system_prompt):
                    if text is None:
                        yield f"data: {json.dumps({'error': 'All LLM providers failed. Please try again later.'})}\n\n"
                        yield "data: [DONE]\n\n"
                        return
                    got_response = True
                    yield f"data: {json.dumps({'content': text})}\n\n"

            if not got_response:
                yield f"data: {json.dumps({'error': 'LLM service temporarily unavailable. Please try again in a few seconds.'})}\n\n"
                yield "data: [DONE]\n\n"
                return

            # Send sources as final event
            yield f"data: {json.dumps({'sources': sources_data})}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield f"data: {json.dumps({'error': 'An error occurred while generating the response.'})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ---------------------------------------------------------------------------
# GET /api/news — proxy for NewsAPI
# ---------------------------------------------------------------------------
@app.get("/api/news")
async def news_proxy():
    if not NEWS_API_KEY:
        return JSONResponse({"error": "NEWS_API_KEY not set"}, status_code=500)

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q": "Lok Sabha OR Indian Parliament OR Sansad",
                    "apiKey": NEWS_API_KEY,
                    "sortBy": "publishedAt",
                    "language": "en",
                    "pageSize": 10,
                },
            )
            return JSONResponse(resp.json())
    except Exception as e:
        logger.error(f"News API error: {e}")
        return JSONResponse({"error": "Failed to fetch news"}, status_code=500)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "faiss_loaded": faiss_index is not None,
        "faiss_vectors": faiss_index.ntotal if faiss_index else 0,
        "metadata_loaded": metadata_list is not None,
        "metadata_count": len(metadata_list) if metadata_list else 0,
        "gemini_key_set": bool(GEMINI_API_KEY),
        "groq_key_set": bool(GROQ_API_KEY),
        "llm_provider": "gemini" if GEMINI_API_KEY else ("groq" if GROQ_API_KEY else "none"),
    }


# ---------------------------------------------------------------------------
# Run with: python server.py
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)
