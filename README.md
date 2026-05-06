<div align="center">

<img src="public/ashoka-chakra.svg" alt="Ashoka Chakra" width="100"/>

# 🏛️ SansadSaathi

### AI-Powered Indian Parliamentary Intelligence Platform

*Unlock 25+ years of Lok Sabha debates through Retrieval-Augmented Generation*

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![FAISS](https://img.shields.io/badge/FAISS-1.9%2B-FF6B00?logo=meta&logoColor=white)](https://github.com/facebookresearch/faiss)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📖 Overview

**SansadSaathi** (Sanskrit: *Parliament Companion*) is a production-grade, full-stack AI assistant that makes the complete transcript archive of the **Indian Lok Sabha** (lower house of Parliament) searchable and conversational. By combining Facebook AI's FAISS vector database with Google Gemini / Groq LLMs through a Retrieval-Augmented Generation (RAG) pipeline, users can ask natural-language questions and receive detailed, citation-backed answers formatted as formal **Minutes of the Meeting (MoM)** — directly sourced from **1,501,518 parliamentary text chunks** spanning the year 2000 to the present.

The platform is built for researchers, journalists, students, and citizens who need reliable, non-hallucinated information about what was debated and decided in the Indian Parliament.

---

## ✨ Key Features

| Feature | Details |
|---|---|
| 🔍 **Semantic Search** | FAISS L2-distance search across 1.5M+ parliamentary chunks |
| 🤖 **RAG Chatbot** | Context-grounded answers with zero hallucination policy |
| 📜 **MoM Formatting** | Responses structured as formal Minutes of the Meeting |
| ⚡ **SSE Streaming** | Real-time token-by-token response rendering |
| 🔄 **LLM Fallback** | Gemini → Groq cascading provider for high availability |
| 📰 **Live News Feed** | Real-time parliamentary news via NewsAPI |
| 🌐 **Multilingual UI** | i18n-ready with react-i18next |
| 📱 **PWA Ready** | Installable as native app via vite-plugin-pwa |
| 🎨 **Indian Theme** | Animated Ashoka Chakra, saffron/tricolor design tokens |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│  ┌──────────┐   ┌───────────────────┐   ┌────────────────────┐  │
│  │  Hero UI │   │  ChatPanel (SSE)  │   │  NewsSlider/Ticker │  │
│  │ (React)  │   │  (react-i18next)  │   │  (NewsAPI proxy)   │  │
│  └────┬─────┘   └────────┬──────────┘   └──────────┬─────────┘  │
└───────┼─────────────────┼──────────────────────────┼────────────┘
        │  POST /api/chat  │ SSE stream               │ GET /api/news
        ▼                  ▼                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FastAPI Backend  (server.py)                    │
│                                                                   │
│  1. Encode query → all-MiniLM-L6-v2 (384-dim vector)            │
│  2. FAISS search → Top-40 most similar chunks                    │
│  3. Lookup metadata.pkl → reconstruct text + citation            │
│  4. Build system prompt (MoM format, zero-hallucination)         │
│  5. Stream LLM response (Gemini primary / Groq fallback)         │
│  6. Yield SSE tokens → frontend                                  │
└─────────┬─────────────────────┬───────────────────────┬─────────┘
          │                     │                       │
          ▼                     ▼                       ▼
  ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
  │ faiss-001    │   │  metadata.pkl    │   │  LLM Providers   │
  │ .index       │   │  (~1.25 GB)      │   │  ┌────────────┐  │
  │ (~2.3 GB)    │   │  1,501,518 rows  │   │  │   Gemini   │  │
  │ 1.5M vectors │   │  date/session/   │   │  │ 2.0-flash  │  │
  │  384-dim     │   │  page/filename   │   │  └─────┬──────┘  │
  └──────────────┘   └──────────────────┘   │        │ fallback│
                                             │  ┌─────▼──────┐  │
                                             │  │   Groq     │  │
                                             │  │ llama-3.3  │  │
                                             │  │  70b-v     │  │
                                             │  └────────────┘  │
                                             └──────────────────┘
```

---

## 📊 Dataset Pipeline

The vector database was constructed through a multi-stage ETL pipeline:

### Stage 1 — PDF Corpus Ingestion
- **Source**: Official Lok Sabha PDF transcripts (2000–present)
- **Volume**: Hundreds of thousands of pages across thousands of session documents
- **Parser**: Custom Python PDF extractor with overlap-preserving chunker

### Stage 2 — Chunking & Metadata Tagging
- Text split into **1,501,518 unique, overlapping chunks**
- Each chunk carries structured metadata:
  ```json
  {
    "text":     "The Minister of Finance stated that...",
    "date":     "2023-07-24",
    "session":  "Monsoon Session",
    "year":     2023,
    "filename": "17_LS_24July2023.pdf",
    "source":   "Lok Sabha Debates",
    "page":     47
  }
  ```
- Persisted as **100 compressed JSON shards** (`chunks_0.json` – `chunks_99.json`) and a single `metadata.pkl` (~1.25 GB) for fast deserialization.

### Stage 3 — Embedding Generation
| Property | Value |
|---|---|
| Model | `sentence-transformers/all-MiniLM-L6-v2` |
| Dimensions | 384 |
| Batch size | 512 sentences |
| Total vectors | 1,501,518 |

### Stage 4 — FAISS Indexing
| Property | Value |
|---|---|
| Index type | `IndexFlatL2` (exact L2 distance) |
| File | `faiss-001.index` |
| Disk size | ~2.3 GB |
| Query latency | < 500 ms for top-40 search |

---

## 🤖 RAG Pipeline Deep-Dive

### Query Flow
```
User Query
    │
    ▼
all-MiniLM-L6-v2.encode(query)  → 384-dim float32 vector
    │
    ▼
faiss_index.search(query_vec, k=40)  → 40 nearest chunk IDs + distances
    │
    ▼
metadata_list[idx] for idx in results  → reconstruct text blocks
    │
    ▼
build_system_prompt(chunks)  → enforced MoM format, no markdown, citations
    │
    ▼
LLM streaming (Gemini → Groq fallback)
    │
    ▼
SSE token stream  → React frontend
```

### Anti-Hallucination Design
The system prompt enforces strict grounding rules:
1. **Context-Only Constraint** — The LLM is explicitly forbidden from using any knowledge outside the retrieved FAISS chunks.
2. **Honesty Clause** — If the retrieved context doesn't contain the answer, the model must explicitly say so.
3. **Citation Mandate** — Every answer must reference the exact source documents, page numbers, and dates.
4. **Markdown Suppression** — All Markdown formatting is disabled to prevent decorative output masking factual gaps.

### LLM Provider Strategy
```
Request → GEMINI_API_KEY set?
              │ YES → Try gemini-2.0-flash
              │           → 429 Rate Limit? → Try gemini-2.0-flash-lite
              │               → 429 Rate Limit? → Try gemini-1.5-flash
              │                   → All Gemini models failed?
              │                       ↓
              └ NO ──────────────→ GROQ_API_KEY set?
                                        │ YES → llama-3.3-70b-versatile
                                        │ NO  → Return 500 error
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Role |
|---|---|---|
| Python | 3.10+ | Runtime |
| FastAPI | Latest | Async REST API + SSE |
| Uvicorn | Latest | ASGI server |
| FAISS CPU | 1.9+ | Vector similarity search |
| sentence-transformers | Latest | Query embedding |
| httpx | Latest | Async HTTP (LLM APIs) |
| python-dotenv | Latest | Environment management |
| NumPy | Latest | Vector math |

### Frontend
| Technology | Version | Role |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 6.x | Type safety |
| Vite | 6.x | Build tool + dev server |
| Framer Motion | 12.x | Animations |
| react-i18next | 17.x | Internationalization |
| TailwindCSS | 3.x | Utility-first styling |
| Lucide React | Latest | Icon system |
| vite-plugin-pwa | Latest | Progressive Web App |
| TanStack Query | 5.x | Server state management |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- ~4 GB free disk space (for FAISS index + metadata)
- API keys for at least one LLM provider

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/sansad-saathi.git
cd sansad-saathi
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```
Edit `.env` and fill in your keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
VITE_NEWS_API_KEY=your_newsapi_key_here
SANSAD_DATA_PATH=/absolute/path/to/sansad_data
```

> **Where to get API keys:**
> - **Gemini**: [Google AI Studio](https://aistudio.google.com/app/apikey) — Free tier available
> - **Groq**: [Groq Console](https://console.groq.com/keys) — Free tier, very fast
> - **NewsAPI**: [NewsAPI.org](https://newsapi.org/register) — Free developer tier

### 3. Download the Dataset

> ⚠️ **The FAISS index and metadata files are NOT included in this repository** due to their size (~3.5 GB combined). You must either:

**Option A — Use the Pre-built Dataset** *(Recommended)*
```
📥 Download from: [Google Drive / HuggingFace Hub link — see Releases]
Place files in: /path/to/sansad_data/
Required files:
  ├── faiss-001.index   (2.3 GB)
  └── metadata.pkl      (1.25 GB)
```

**Option B — Build from Scratch**
> Requires the raw Lok Sabha PDF corpus. See `data_pipeline/` for scripts.

### 4. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 5. Install Frontend Dependencies
```bash
npm install
```

### 6. Run the Application

**Terminal 1 — Start the FastAPI backend:**
```bash
python server.py
# Server runs at http://localhost:8000
# Startup takes ~30-60s (loading FAISS + model)
```

**Terminal 2 — Start the React frontend:**
```bash
npm run dev
# Frontend runs at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 7. Verify Health
```bash
curl http://localhost:8000/api/health
```
Expected response:
```json
{
  "status": "ok",
  "faiss_loaded": true,
  "faiss_vectors": 1501518,
  "metadata_loaded": true,
  "metadata_count": 1501518,
  "gemini_key_set": true,
  "groq_key_set": true,
  "llm_provider": "gemini"
}
```

---

## 📁 Project Structure

```
sansad-saathi/
├── server.py                   # FastAPI backend (RAG pipeline, LLM, SSE)
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variable template
│
├── src/
│   ├── components/
│   │   ├── AshokaChakra.tsx    # Animated Ashoka Chakra SVG component
│   │   ├── ChatPanel.tsx       # Main chatbot UI with SSE stream consumer
│   │   ├── Hero.tsx            # Landing hero section
│   │   ├── InfoSection.tsx     # Parliament info cards
│   │   ├── LangSwitcher.tsx    # i18n language toggle
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   ├── NewsSlider.tsx      # Live news card carousel
│   │   └── NewsTicker.tsx      # Horizontal scrolling news ticker
│   ├── pages/                  # Route-level page components
│   ├── hooks/                  # Custom React hooks (e.g., useChat)
│   ├── i18n/                   # Translation files
│   ├── App.tsx                 # Root application component
│   ├── main.tsx                # Vite entry point
│   └── index.css               # Global styles
│
├── public/                     # Static assets (favicon, manifest)
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration (proxy, PWA)
├── tailwind.config.js          # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Node.js dependencies
```

---

## 🔌 API Reference

### `POST /api/chat`
Stream a RAG-powered response to a parliamentary question.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "What was debated about GST in 2017?" }
  ],
  "userLang": "en"
}
```

**Response:** `text/event-stream` (SSE)
```
data: {"content": "Subject / Topic: Goods and Services Tax (GST)..."}
data: {"content": " Implementation Debate\n"}
...
data: {"sources": [{"date": "2017-03-30", "session": "Budget Session", ...}]}
data: [DONE]
```

---

### `GET /api/news`
Proxied live parliamentary news from NewsAPI.

**Response:** Standard NewsAPI `v2/everything` JSON object filtered for Lok Sabha news.

---

### `GET /api/health`
System health check with resource load status.

---

## 🖼️ Screenshots

> *Add screenshots here after deployment*

| Feature | Screenshot |
|---|---|
| Hero Landing Page | |
| RAG Chatbot in Action | |
| Live News Slider | |
| MoM Response Format | |

---

## 🗺️ Roadmap

- [ ] **Rajya Sabha Integration** — Extend the corpus to include upper house proceedings
- [ ] **Multi-language Responses** — Hindi, Tamil, Telugu, Bengali answer generation
- [ ] **Question-Period Mode** — Dedicated view for QnA sessions with minister attribution
- [ ] **Bill Tracker** — Follow specific bills through their legislative journey
- [ ] **Member Search** — Search by MP name across all their speeches
- [ ] **Export to PDF** — Download MoM-formatted responses as official documents
- [ ] **HuggingFace Dataset** — Publish the chunked corpus as a public dataset

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure:
- No API keys or secrets in commits
- Python code follows PEP 8
- TypeScript code passes `npm run lint`
- New features include documentation updates

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- **Lok Sabha Secretariat** for publishing official parliamentary records
- **Facebook AI Research** for the [FAISS](https://github.com/facebookresearch/faiss) library
- **Hugging Face** for the [`all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) sentence transformer
- **Google DeepMind** for the Gemini API
- **Groq** for their free, blazing-fast LLM inference API

---

<div align="center">

**Built with ❤️ for Parliamentary Transparency**

*"An informed citizen is the cornerstone of a healthy democracy."*

</div>
