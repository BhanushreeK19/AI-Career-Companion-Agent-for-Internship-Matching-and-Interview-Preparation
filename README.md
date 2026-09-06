# AI Career Companion

An AI-powered internship and career companion application that helps students discover relevant internships, analyze their resumes, build a career profile, match their skills against internship opportunities, and generate tailored cover letters.

The project is organized into a **FastAPI backend**, a **React/Vite frontend**, and an **AI/RAG-based matching and resume-processing layer**.

---

## ✨ Key Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Password reset/change flow
- Protected application routes
- Secure user-specific data access

### 📄 Resume Management
- Upload PDF and DOCX resumes
- Extract resume text
- Regex-based information extraction
- LLM-assisted semantic extraction
- Structured resume information
- Resume history / latest parsed resume
- Resume information used for internship matching and cover letters

### 👤 Career Profile (now fully user-managed — see Extension section)
- Personal details
- Education
- Skills
- Experience
- Projects
- Achievements
- Custom, user-named sections
- LinkedIn, GitHub and portfolio information
- Profile photo upload
- Interactive profile-photo cropping and zoom before saving

### 💼 Internship Discovery
- Internship catalog
- Search and filtering
- Internship details
- Role/company information
- Internship matching based on candidate profile

### 🤖 AI Internship Matching
- RAG-based internship matching
- Match percentage
- Match label
- Matched skills
- Skill gaps
- AI-generated matching insights
- Candidate profile/resume used as the primary context

### ✉️ AI Cover Letter Generation
- Select an internship
- Use the parsed resume as candidate context
- Generate a concise, internship-specific cover letter
- Prevent unsupported candidate information from being invented
- Save generated cover letters for later viewing

---

## 🏗️ Architecture

```text
                         ┌──────────────────────────┐
                         │        React UI          │
                         │     Vite + JavaScript    │
                         └────────────┬─────────────┘
                                      │
                                      │ REST API / JWT
                                      ▼
                         ┌──────────────────────────┐
                         │      FastAPI Backend     │
                         │                          │
                         │ Auth                     │
                         │ Resume Processing        │
                         │ Career Profile           │
                         │ Internship APIs           │
                         │ Matching APIs             │
                         │ Cover Letters             │
                         └────────────┬─────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
             ┌────────────┐   ┌──────────────┐  ┌──────────────┐
             │  Database  │   │  Groq / LLM  │  │ RAG / Index  │
             │  SQLAlchemy│   │  Extraction  │  │ Matching     │
             └────────────┘   └──────────────┘  └──────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- React
- Vite
- JavaScript
- React Router
- `react-easy-crop`
- CSS
- REST API integration

### Backend
- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- JWT authentication
- Multipart file uploads

### AI / NLP
- Groq API
- LLM-based resume extraction
- Prompt engineering
- RAG-based internship matching
- Semantic career/internship analysis

### Data
- SQL database through SQLAlchemy
- Structured parsed-resume JSON
- Internship posting/index data

---

## 📁 Project Structure

```text
AI_Career_Companion/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── utils/
│   │   ├── config.py
│   │   └── main.py
│   │
│   ├── uploads/
│   ├── profile_photos/
│   ├── .env
│   ├── .env.example
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

> Do not commit `venv`, `node_modules`, uploaded resumes, profile photos, database files containing personal information, or `.env` files containing secrets.

---

# 🚀 Setup and Installation

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd AI_Career_Companion
```

---

# ⚙️ Backend Setup

Open a terminal in the project root.

### Create a virtual environment

Windows PowerShell:

```powershell
python -m venv venv
```

Activate it:

```powershell
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, use:

```powershell
venv\Scripts\activate
```

### Install dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### Configure environment variables

Create:

```text
backend/.env
```

using:

```text
backend/.env.example
```

Set the required values, including your Groq API key and database configuration.

Example:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=<supported-groq-model>
```

**Never commit the real API key to GitHub.**

### Start the backend

From the `backend` directory:

```powershell
uvicorn app.main:app --reload
```

The API will normally be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

# 🎨 Frontend Setup

Open another terminal.

```powershell
cd frontend
npm install
```

Create:

```text
frontend/.env
```

from:

```text
frontend/.env.example
```

Set:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the development server:

```powershell
npm run dev
```

Vite normally runs at:

```text
http://localhost:5173
```

Open that URL in your browser.

---

# 🔄 Typical Application Flow

```text
Register / Login
       ↓
Upload Resume
       ↓
Extract Resume Text
       ↓
Regex + LLM Semantic Extraction
       ↓
Structured Candidate Profile
       ↓
Internship Catalog
       ↓
RAG / AI Matching
       ↓
Matched Internships
       ↓
View Skill Matches + Skill Gaps
       ↓
Generate Cover Letter
```

---

# 📄 Resume Processing

The resume pipeline combines deterministic extraction with AI-assisted semantic extraction.

```text
PDF / DOCX
   ↓
Text Extraction
   ↓
Regex Extraction
   ↓
LLM Semantic Extraction
   ↓
Structured JSON
   ↓
Database
   ↓
Career Profile / Matching / Cover Letter
```

The system is designed so that information explicitly present in the resume can be represented in structured fields such as:

- Name
- Email
- Phone number
- Address
- LinkedIn
- GitHub
- Portfolio
- Education
- Skills
- Technical skills
- Soft skills
- Projects
- Internships / experience
- Achievements

---

# 🤖 AI Matching

The matching layer compares candidate information with internship requirements.

It can provide:

- Overall match percentage
- Match category/label
- Relevant skills
- Missing skills
- Matching reasoning/insights

The goal is to help students understand **why an internship matches their profile**, not just display a recommendation.

---

# 👤 Career Profile

> **Updated behavior (see [Extension: New Functionality](#-extension-new-functionality-added-on-top-of-the-existing-project) below):** the Career Profile is now a **fully user-managed** record. It is no longer auto-populated or merged from a parsed resume — the user manually adds/edits/deletes every section. Resume parsing and the Career Profile are treated as two separate concepts; resume parsing is used only for internship matching and cover letters.

The profile supports:

- Personal information
- Education
- Skills
- Experience
- Projects
- Achievements
- Custom, user-named sections ("+ Add section")
- Resume information (display-only link to the latest resume)
- Cover-letter history
- Profile photo

### Profile photo

The frontend uses `react-easy-crop` to allow the user to:

1. Select an image
2. Move the image
3. Zoom in/out
4. Select a square/round crop
5. Preview the selected area
6. Save the cropped image

---

# ✉️ Cover Letter Generation

A user can select an internship and generate a tailored cover letter using:

```text
Parsed Resume
      +
Selected Internship
      ↓
      LLM
      ↓
Professional Cover Letter
```

The generation prompt instructs the model to use only the supplied candidate and internship information and avoid inventing candidate facts.

Generated cover letters are stored and displayed in the user's profile.

---

# 🔑 Important Environment Variables

Do not commit secret values.

Typical configuration includes:

```env
# Backend
GROQ_API_KEY=your_secret_key
GROQ_MODEL=<supported-groq-model>
DATABASE_URL=your_database_url

# Frontend
VITE_API_BASE_URL=http://127.0.0.1:8000
```

The exact variables required by the current backend are defined in:

```text
backend/.env.example
```

---

# 🧪 Testing

### Backend

Start the backend:

```powershell
uvicorn app.main:app --reload
```

Then open:

```text
http://127.0.0.1:8000/docs
```

Use the Swagger UI to test authentication, resume, profile, internship, matching and cover-letter endpoints.

### Frontend

Run:

```powershell
npm run dev
```

Then verify:

- Registration/login
- Resume upload
- Resume parsing
- Profile loading
- Profile editing
- Profile photo cropping
- Internship listing
- Internship matching
- Cover-letter generation

---

# 🔒 Security Notes

Before publishing the project to GitHub:

- Never commit `.env`
- Never commit API keys
- Never commit JWT secrets
- Never commit personal resumes
- Never commit uploaded profile photos
- Never commit production database credentials
- Never commit `venv/`
- Never commit `node_modules/`
- Never commit generated temporary files

Use `.env.example` files containing placeholders instead.

---

# 📌 GitHub Checklist

Before the first push:

```powershell
git status
```

Make sure sensitive/generated files are ignored.

Then:

```powershell
git add .
git commit -m "Initial commit - AI Career Companion"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

---

# 📜 License

This project is intended for educational, internship and portfolio purposes.

If you add an open-source license, update this section with the chosen license.

---

# 👩‍💻 Author

**Bhanushree K**

AI Career Companion — an AI-powered career companion for resume analysis, internship discovery, intelligent matching and cover-letter generation.

---

# 🧩 Extension: New Functionality Added on Top of the Existing Project

Everything below was added as an **extension** of the working project above — the existing stack (React/Vite frontend, FastAPI/SQLAlchemy backend, Groq LLM, FAISS internship matching), routes, database models, and UI were preserved and reused wherever possible. No existing feature was removed or rebuilt.

## 1. User-Managed Career Profile (behavior change)

The Career Profile is now a **true, persistent, user-managed profile** instead of being auto-populated/merged from parsed resumes:

- The user manually adds, edits, and deletes: Personal Details, Education, Skills, **Experience** (new section), Projects, Achievements.
- A **"+ Add section"** button lets the user create arbitrarily named custom sections (e.g. "Certifications", "Volunteering") with free-text content.
- Resume parsing and the Career Profile are explicit, separate concepts: uploading/parsing a resume never silently overwrites anything the user typed into their profile.
- `GET /career-profile` still surfaces the latest resume's filename/parsed status for convenience, but purely as a read-only reference — never merged into the profile fields.

## 2. Parsed Resumes Page

A new **"Parsed Resumes"** sidebar page lists every resume a user has uploaded (filename, upload date/time, resume ID, parsed status), reusing the existing `resumes` / `parsed_resumes` tables (no new resume storage). Each entry has:
- **Reuse** — makes that resume the active one for internship matching and cover-letter generation.
- **Parse again** — re-runs the existing hybrid Regex + LLM parsing pipeline on the already-stored file.

New endpoints: `GET /parsed-resumes`, `POST /parsed-resumes/{resume_id}/reparse`.

## 3. Dark Mode / Light Mode

A theme toggle (top-right of the header, on every page) switches between the original dark theme (preserved pixel-for-pixel as the default) and a newly designed, professional light theme. Implementation:
- A small set of CSS custom properties (`--bg`, `--panel`, `--surface`, `--text`, `--muted`, `--border`, etc.) drive every surface/text/border color across the whole stylesheet.
- `:root[data-theme="light"]` overrides just those variables — no component duplication.
- The theme is stored in `localStorage` and applied via a `data-theme` attribute on `<html>`, so it persists across refresh, navigation, and login/logout.
- All pages, including Login/Register, Dashboard, Resume, Parsed Resumes, Internships, My Matches, Applied Internships, Cover Letter, Profile, and AI Assistant, use the same shared components/styles and therefore support both themes automatically.

## 4. Applied Internships (no external redirect)

Clicking **"Apply Now"** no longer opens Google or any external site. Instead:
- The backend records an application (`applied_internships` table: user, internship id/role/company, applied date, status), with a unique `(user_id, internship_id)` constraint that prevents duplicate applications.
- The button switches to **"Applied ✓"** immediately and stays that way on reload.
- A new **"Applied Internships"** sidebar page lists every application.

New endpoints: `POST /internships/{internship_id}/apply`, `GET /internships/applied/me`.

## 5. Internship Matching (unchanged behavior, reconfirmed)

Internship matching continues to use the **most recently successfully parsed resume** for the logged-in user (not the manually maintained Career Profile), exactly as before — this extension only added the Parsed Resumes management UI around the existing pipeline.

## 6. AI Assistant — RAG Product Chatbot

A new **"AI Assistant"** sidebar page adds a Retrieval-Augmented Generation chatbot whose job is to help users understand and use *this* product (not a general-purpose assistant).

**Flow:** Product Knowledge Document → chunked by section → embedded (local `sentence-transformers/all-MiniLM-L6-v2`, the same model already used for internship matching) → stored in a **separate** FAISS index (`backend/app/data/faiss_product_knowledge/`, entirely independent from the existing internship-matching index) → on each question, the question is embedded, the most relevant chunks are retrieved, combined with the current chat session's recent history, and sent to the existing Groq LLM integration → the answer (plus which knowledge-document sections it used) is returned and saved.

- **Conversation memory**: each chat session keeps its own message history, which is fed back into every LLM call so follow-up questions ("why did we use it?") resolve correctly.
- **Conversation storage**: two new tables, `chat_sessions` and `chat_messages`, in the existing database — no separate database.
- **User/session isolation**: every chat endpoint verifies the requesting user owns the session (404 otherwise); one user's chats are never visible to another.
- **Multiple sessions**: users can start new chats and switch between previous ones from a session list in the sidebar of the AI Assistant page.
- **Grounding**: the chatbot is instructed not to invent product facts; if nothing relevant is retrieved, it says so explicitly rather than guessing.

New endpoints: `POST /chat/sessions`, `GET /chat/sessions`, `DELETE /chat/sessions/{id}`, `GET /chat/sessions/{id}/messages`, `POST /chat/sessions/{id}/messages`.

New backend modules: `app/services/embeddings.py` (shared embedding-model loader, used by both FAISS indices so the model is only loaded once), `app/services/product_knowledge.py` (chunking + the separate FAISS index), `app/services/chat_service.py` (RAG + memory + Groq call), `app/routers/chat.py`.

## 7. Product Knowledge Document

`docs/AI_Career_Companion_Product_Knowledge.docx` (mirrored as plain-text source at `backend/app/data/product_knowledge/product_knowledge.md`, which is what the RAG pipeline actually indexes) documents, from the real implementation:
- Product overview, problem/target users/objectives
- Every feature (purpose, how it works, how the user uses it, expected result)
- Step-by-step "How to use the product" instructions
- Architecture (User → React → FastAPI → Services → Database → LLM → Response), including both FAISS indices and the full RAG flow
- The actual technology stack and why each piece is used

## 8. New Database Models

| Model | Purpose |
|---|---|
| `AppliedInternship` | One row per (user, internship) application; unique constraint prevents duplicates. |
| `ChatSession` | One AI Assistant conversation; belongs to one user. |
| `ChatMessage` | One user/assistant turn in a `ChatSession`, with optional cited sources. |

`UserProfile.profile_json` gained two new keys: `experience` (list) and `custom_sections` (list of `{id, title, content}`).

## 9. New/Updated Environment Variables

Added to `backend/.env.example` (all have sensible defaults; no existing variables were changed):

```env
PRODUCT_KNOWLEDGE_DOC_PATH=app/data/product_knowledge/product_knowledge.md
PRODUCT_KNOWLEDGE_INDEX_DIR=app/data/faiss_product_knowledge
AUTO_BUILD_PRODUCT_KNOWLEDGE_INDEX=true
CHAT_HISTORY_LIMIT=12
CHAT_RAG_TOP_K=4
```

The AI Assistant reuses the existing `GROQ_API_KEY` / `GROQ_MODEL` — there is no second LLM configuration.

## 10. Setup Notes for the Extension

No new Python packages are required — `langchain-community`, `langchain-huggingface`, `faiss-cpu`, and `groq` were already in `backend/requirements.txt` and are reused for the Product Knowledge index and chatbot. No new frontend packages were required either.

On first backend startup, if `app/data/faiss_product_knowledge/` doesn't exist yet, it is built automatically from `product_knowledge.md` (same pattern as the existing internship index auto-build). To rebuild it manually after editing the knowledge document:

```bash
cd backend
python -m app.services.product_knowledge
```

## 12. AI Interview Preparation Agent (new navbar page, separate from the AI Assistant)

A new **"Interview Preparation"** sidebar page adds a second, completely separate AI agent whose only job is to help the candidate prepare for interviews. It is not merged with the AI Assistant / product chatbot in section 6 above — different tables, different system prompt, different purpose, and it never answers general product-knowledge questions.

**Context it uses (no duplicate parsing/extraction is introduced):**
- The candidate's **existing** extracted resume data — `ParsedResume.parsed_json`, produced by the existing hybrid Regex + LLM resume parser (`app/services/merge_parser.py`) — is re-fetched live on every reply so it always reflects the most recently parsed resume.
- An optional PDF/DOCX document uploaded to the session, extracted with the **existing** `app/services/pdf_parser.py` / `app/services/docx_parser.py` (the same extractors used by `/upload-resume`), and used as additional Q&A context for that session only.
- The session's own recent conversation history (isolated from the AI Assistant's history).

**What it can do:** resume-based role/internship recommendations with reasoning, identifying the candidate's strongest technical skills, technical and HR/behavioral interview question generation, answer guidance, an interview preparation roadmap and topics to study, a personalized learning path, and document-based Q&A / question generation from an uploaded file.

New endpoints (all under `/interview-prep`, all authenticated, all session-ownership-checked the same way as `/chat/sessions/*`):

| Endpoint | Purpose |
|---|---|
| `GET /interview-prep/context` | Resume-context-loaded indicator (name, top skills, counts) for the page header. |
| `POST /interview-prep/sessions` | Start a new preparation session (snapshots the latest parsed resume, if any). |
| `GET /interview-prep/sessions` | List the user's preparation sessions. |
| `DELETE /interview-prep/sessions/{id}` | Delete a session and its messages. |
| `GET /interview-prep/sessions/{id}/messages` | List a session's messages. |
| `POST /interview-prep/sessions/{id}/messages` | Send a message, get a resume/document-grounded reply. |
| `POST /interview-prep/sessions/{id}/document` | Upload a PDF/DOCX for that session's document-based Q&A. |

New backend modules: `app/services/interview_prep_service.py` (resume-context builder, document-context builder, memory, Groq call), `app/routers/interview_prep.py`.

New database tables: `interview_prep_sessions` (title, snapshot `resume_id`, `document_filename`, `document_text`) and `interview_prep_messages` — fully separate from `chat_sessions` / `chat_messages` so the two agents' conversations never mix.

New frontend: `frontend/src/InterviewPrep.jsx` (dedicated workspace with a resume-context banner, quick-prompt shortcuts, a session list, PDF/DOCX upload, and a chat panel), wired into the navbar between "My Matches" and "Applied Internships", and into `frontend/src/api.js`. No new npm packages were required.

No new environment variables, no new Python packages, and no new frontend packages were required — the feature reuses the existing `GROQ_API_KEY` / `GROQ_MODEL`, the existing PDF/DOCX extractors, and the existing chat UI patterns/CSS.

## 13. What Was Deliberately Left Unchanged

- The existing technology stack (React/Vite, FastAPI, SQLAlchemy, Groq, FAISS).
- The existing internship-matching FAISS index and its build process (`python -m app.services.internship_index`) — a **separate** index/directory is used for the chatbot so the two can never corrupt each other.
- Existing authentication, resume upload/parsing, internship listing, cover-letter generation, and profile-photo cropping.
- The existing floating "AI Assistant" product chatbot (`ChatAssistant.jsx`, `/chat/*`) — kept exactly as it was; the new Interview Preparation Agent is fully separate from it.
- The overall dark visual design (now the default theme, pixel-preserved).

