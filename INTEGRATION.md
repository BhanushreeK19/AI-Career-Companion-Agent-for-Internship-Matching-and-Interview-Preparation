# Integration Notes - Milestone 2 (RAG Internship Matching) into AI Career Companion

This document explains how the Milestone 2 prototype (`Milestone_2_basics.zip`)
was integrated into the existing `AI_Career_Companion` project (Assignment 1),
what conflicted between the two, and exactly how each conflict was resolved.
Nothing in Assignment 1 was overwritten - everything below was either
**added** as a new file or **appended** to an existing one.

## 1. What each project was, before integration

| | AI_Career_Companion (Assignment 1, kept as source of truth) | Milestone_2_basics (prototype, source of the RAG logic) |
|---|---|---|
| Auth | JWT access tokens + a `token_blacklist` table for logout | JWT access **+ refresh** tokens, no blacklist |
| DB layer | `app/models/database.py`, `Base.metadata.create_all()` on startup | `app/database.py`, Alembic migrations |
| Resume storage | `resumes` + `parsed_resumes` (1:1), parsed data as **one JSON blob** (`ParsedResume.parsed_json`) | `resumes` table with **flat columns** (`skills`, `education`, `location`, ... directly on the row) |
| Resume parsing | Hybrid Regex + LangChain/Groq LLM, merged into `ParsedResumeData` | Also hybrid regex+LLM, but written to those flat columns |
| Config | `app.config.get_settings()` (`lru_cache`) | `app.config.settings` (module-level singleton) |
| Internship matching | *(didn't exist)* | FAISS vector index + weighted composite re-ranking (**this is what we wanted**) |

Assignment 1 is the better-fitted foundation for a real product (proper
token revocation, cleaner JSON-first resume schema), so it was kept as-is.
Only the RAG matching logic was pulled out of Milestone 2.

## 2. Conflicts identified, and how each was resolved

### 2.1 Resume schema mismatch (the main conflict)

Milestone 2's matcher (`internship_matcher.py`, `internship_index.py`) is
written against `resume.skills`, `resume.education`, `resume.location`,
`resume.professional_summary`, `resume.extracted_text` as **plain
attributes on the ORM row**. Assignment 1 has none of these columns - it
stores everything as nested JSON in `ParsedResume.parsed_json`
(`skills: List[str]`, `education: List[Education]`, etc.).

**Resolution - adapter, not a migration.** Rather than adding those columns
to Assignment 1's `Resume` table (which would mean an Alembic migration,
touching the upload endpoint, and duplicating data already present in
`parsed_json`), a new module was added:

- **`app/services/resume_profile.py`** - `build_resume_match_profile(resume)`
  reads `resume.parsed_resume.parsed_json` and flattens it into a
  `ResumeMatchProfile` dataclass with exactly the attributes the ported
  matcher expects (`skills`, `education`, `professional_summary`,
  `location`, `extracted_text`), plus a `supporting_text` field (projects +
  experience, folded into the embedding query for better project-based
  matching than the original Milestone 2 version had).

The matcher and index code were then ported with **zero changes to their
scoring/ranking logic** - only the input type changed from an ORM `Resume`
row to a `ResumeMatchProfile`. This keeps Assignment 1's storage model
completely untouched.

### 2.2 Config pattern mismatch

Milestone 2's services import a module-level `settings` object; Assignment
1 uses `get_settings()` (an `lru_cache`'d factory). Resolution: the ported
`internship_index.py` / `internship_matcher.py` call `get_settings()`
instead, and the new fields (`embedding_model`, `internship_data_path`,
`internship_index_dir`, `auto_build_internship_index`) were **appended** to
the existing `Settings` class in `app/config.py` - nothing else in that
class was touched.

### 2.3 Import path mismatch

Milestone 2 imports `from app.database import Base`, `from app.models import
User`; Assignment 1 uses `app.models.database` and `app.models.models`.
All ported files were updated to Assignment 1's paths.

### 2.4 Dependency version mismatch

Milestone 2's `requirements.txt` pins `langchain==1.3.14` /
`langchain-community==0.4.2` / `langchain-huggingface==1.2.2`, a major
version ahead of what Assignment 1 already runs
(`langchain==0.3.7`, `langchain-groq==0.2.1`, `langchain-core==0.3.15`).
Installing the newer LangChain would have forced an upgrade of packages
Part 2's resume parser already depends on, risking breaking it.

**Resolution:** added `langchain-community==0.3.7`, `langchain-huggingface==0.1.2`,
`faiss-cpu==1.9.0`, `sentence-transformers==3.3.1`, `groq==0.13.0` - the
0.3.x-line siblings that match what's already installed, instead of copying
Milestone 2's `requirements.txt` wholesale.

### 2.5 Prebuilt FAISS index

The zip included a prebuilt `app/data/faiss_internship_index/` folder. It
was **not copied** - a FAISS index serialized with one embedding
model/library version isn't guaranteed to deserialize cleanly with another,
and silently loading a stale/incompatible index is worse than rebuilding
it. Instead:

- `internships.json` (180 synthetic postings) and the generator script were
  copied as-is (pure data, no conflict).
- The app **auto-builds the index on startup** if it's missing
  (`app/main.py` startup hook, guarded by `AUTO_BUILD_INTERNSHIP_INDEX`),
  and `python -m app.services.internship_index` remains available for a
  manual rebuild whenever `internships.json` changes.

### 2.6 Route / URL prefix conflict check

Assignment 1's routes are unprefixed (`/register`, `/login`,
`/upload-resume`, ...). Milestone 2's internship routes are prefixed with
`/internships`. No collisions - the new router was mounted alongside the
existing two with `app.include_router(internships.router)` in `main.py`,
right after `auth.router` and `resume.router`. No existing route,
response model, or path was changed.

## 3. New request flow

```
POST /upload-resume (existing, unchanged)
        |
        v
resumes + parsed_resumes rows in Postgres (existing, unchanged)
        |
        v
GET /internships/match/{resume_id}   <-- new
        |
        v
build_resume_match_profile(resume)          [app/services/resume_profile.py]
        |
        v
match_resume_to_internships(profile, k)      [app/services/internship_matcher.py]
   |-- build_query_text(profile)              -> one embeddable string
   |-- search_similar_internships(query, ~4k) [app/services/internship_index.py, FAISS]
   |-- re-rank: 0.50*skill + 0.20*semantic + 0.15*education + 0.15*location
   |-- optional Groq one-paragraph summary (best-effort, never blocks)
        |
        v
InternshipMatchResponse  (resume_id, query_profile, results[], summary)
```

## 4. Files added vs. files touched

**Added (new files, no conflict possible):**
- `app/data/internships.json`, `app/data/generate_internships.py`
- `app/services/internship_index.py`
- `app/services/internship_matcher.py`
- `app/services/resume_profile.py`
- `app/routers/internships.py`
- `postman_collection.json`
- `test_matching_scenarios.py`
- `INTEGRATION.md` (this file)

**Touched (existing files, changes are additive only):**
- `app/main.py` - added `internships` to the router import, one
  `app.include_router(internships.router)` line, and an index-auto-build
  step inside the existing `on_startup()` hook. Nothing removed.
- `app/config.py` - four new fields appended to `Settings`. Nothing removed.
- `app/models/schemas.py` - `InternshipPosting`, `InternshipMatch`,
  `InternshipMatchResponse` appended as a new "Section 3" at the end of the
  file. Sections 1 and 2 (auth + resume schemas) untouched.
- `requirements.txt` - RAG dependencies appended under a new
  `# --- Internship Matching / RAG (Milestone 2) ---` block. Existing
  pins untouched.
- `.env.example` - new `EMBEDDING_MODEL` / `INTERNSHIP_DATA_PATH` /
  `INTERNSHIP_INDEX_DIR` / `AUTO_BUILD_INTERNSHIP_INDEX` keys appended.
- `README.md` - one new subsection under "API Overview" describing the two
  new endpoints, linking here.

**Not touched at all:** `app/models/models.py`, `app/models/database.py`,
`app/routers/auth.py`, `app/routers/resume.py`, `app/services/docx_parser.py`,
`app/services/llm_parser.py`, `app/services/merge_parser.py`,
`app/services/pdf_parser.py`, `app/services/regex_parser.py`,
`app/utils/*`.

## 5. Running it

```bash
pip install -r requirements.txt --break-system-packages   # or in a venv without that flag
cp .env.example .env   # fill in DATABASE_URL / JWT_SECRET_KEY / GROQ_API_KEY
uvicorn app.main:app --reload
```

On first startup, if `app/data/faiss_internship_index/` doesn't exist yet,
the app downloads the embedding model (`sentence-transformers/all-MiniLM-L6-v2`,
~90MB, one-time, requires internet) and builds the index automatically -
you'll see `No internship FAISS index found - building one now...` in the
logs. Subsequent restarts reuse the saved index.

**Swagger UI:** `http://localhost:8000/docs` - both the existing
Part 1/2 endpoints and the new `Internship Matching` tag are visible there.

**Postman:** import `postman_collection.json`. Flow: `Register` -> `Login`
(captures `access_token`) -> `Upload Resume` (captures `resume_id`) ->
`Match Resume to Internships`. `Browse Internship Catalog` needs no auth.

**Test scenarios (deliverable #7):**
```bash
python test_matching_scenarios.py
```
Runs 9 synthetic candidate profiles directly through the matcher (no DB/auth
needed) covering: skill-based, education-based, experience-based,
project-based, and multiple-skill matching, plus AI/ML, backend, data
science, and generative-AI internship seekers - one per the mentor's list.

## 6. Known limitations / honest caveats

- The composite score's weights (`0.50/0.20/0.15/0.15`) are the ones from
  the Milestone 2 prototype, carried over as-is. They're reasonable
  defaults, not empirically tuned against real outcome data.
- `_education_score` and `_location_score` do coarse string/regex matching
  (degree-level buckets, city-name equality) rather than true semantic
  comparison - documented in-line in `internship_matcher.py`.
- The Groq match-summary call is best-effort and silently returns `None` on
  any failure (missing key, rate limit, timeout) by design, so a summary is
  never a hard requirement for the endpoint to succeed.
- First-run index build requires outbound internet access (to download the
  embedding model from Hugging Face). If your deployment environment has no
  internet access, build the index once in an environment that does, then
  ship the resulting `app/data/faiss_internship_index/` folder alongside the
  app and set `AUTO_BUILD_INTERNSHIP_INDEX=false`.
