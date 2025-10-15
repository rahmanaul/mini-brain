# Mini Brain - PRD / Specification

## Project Overview
**Name:** Mini Brain  
**Type:** Lightweight personal knowledge assistant  
**Stack:** Vite + React (frontend), Convex (backend & real-time DB), OpenAI API (embeddings + chat)

**Objective:** Create a minimal note-taking app where users can write notes and ask questions about their notes in natural language. The AI answers are contextually based on the user’s stored notes.

**Key Value:** Personal knowledge management with AI-powered question answering using your own notes.

---

## Features

### 1. Note Creation
- Users can write and save short notes.
- Notes are stored in Convex along with their OpenAI-generated embeddings.
- Each note has:
  - Title (first 20 characters of content)
  - Content
  - Embedding
  - Timestamp (`createdAt`)

### 2. Ask a Question
- Users can ask natural-language questions.
- Question embeddings are generated via OpenAI.
- System performs similarity search against stored note embeddings.
- Top 3 notes are selected as context.
- OpenAI chat completion generates a response based on these notes.
- Returned answer includes:
  - AI-generated response
  - References to source notes

### 3. Lightweight Frontend
- Single-page React app using Vite.
- Simple UI:
  - Textarea to write notes
  - Input field to ask questions
  - Display AI answers
- Optional: Tailwind for styling

### 4. Backend (Convex)
- **Schema:** `notes` table storing content, embedding, title, timestamp.
- **Mutations:** `addNote` (store note + embedding)
- **Queries:** `askQuestion` (compute similarity, call OpenAI, return answer)

### 5. Optional Enhancements
- List all notes
- Edit/delete notes
- Markdown support for note content
- Export notes as Markdown or JSON
- Minimal caching of embeddings for performance

---

## Technical Specifications

### Schema (Convex)
```ts
notes: {
  title: string
  content: string
  embedding: number[]
  createdAt: number
}
```

### Core Functions

**addNote**
- Input: `{ title: string, content: string }`
- Output: success confirmation
- Actions: Generate embedding → store note in Convex

**askQuestion**
- Input: `{ question: string }`
- Output: `{ answer: string, refs: string[] }`
- Actions:
  1. Generate embedding for question
  2. Compute cosine similarity with stored notes
  3. Pick top 3 notes
  4. Pass context + question to OpenAI chat
  5. Return answer + note references

### Frontend Components
- `NoteInput`: Textarea + Save button
- `QuestionInput`: Input + Ask button
- `AnswerDisplay`: Shows AI answer and references
- Optional: `NotesList` to display saved notes

---

## Environment / Setup

**Environment Variables**
```env
OPENAI_API_KEY=sk-xxx
CONVEX_DEPLOYMENT=dev
```

**Dependencies**
- React + Vite
- Convex SDK (`convex`)
- OpenAI SDK (`openai`)
- Tailwind CSS
- shadcn UI

**Run Commands**
```bash
npm install
npx convex dev &
npm run dev
```

---

## Cost Considerations
| Action | Model | Approx Cost |
|--------|-------|-------------|
| Add note | text-embedding-3-small | ~$0.0001 per note |
| Ask question | text-embedding-3-small + gpt-4o-mini | ~$0.001–0.005 per question |

---

## Milestones / Development Plan
1. **Setup** Vite + Convex project
2. **Define schema** in Convex
3. **Implement addNote** mutation with OpenAI embedding
4. **Implement askQuestion** query with similarity search and chat completion
5. **Build frontend** (note input, question input, answer display)
6. **Test end-to-end**: add notes, ask questions, verify answers
7. **Optional Enhancements**: list/edit/delete notes, markdown, export

---

## Deliverables
- Lightweight Vite + React app
- Convex backend with note storage & question-answering functions
- Working integration with OpenAI embeddings + chat
- Documentation and `.env` setup

---

## Success Metrics
- User can save notes successfully
- User can ask questions and get contextually correct answers
- Application is fast, lightweight, and deployable with minimal setup
- Stay within $5 OpenAI credit for initial usage


---

## Goals and Non-Goals

### Goals
- Provide a minimal, fast flow to capture notes and ask questions against them.
- Keep data private to the user; do not expose notes to other users.
- Deliver high-quality, grounded answers with citations to specific notes.
- Be simple to deploy locally and to a small cloud instance.
- Maintain predictable costs via low-cost embeddings and small chat models.

### Non-Goals
- Multi-tenant team collaboration and shared workspaces (future enhancement).
- Full-featured document management (folders, complex formatting, images).
- Advanced RAG features like chunking large files or vector DB integration beyond Convex.
- Long-form content generation; this app focuses on Q&A over short notes.

---

## Personas
- Casual Planner: Captures quick snippets, queries later for reminders and tasks.
- Researcher/Student: Saves definitions and references; asks clarifying questions.
- Developer: Stores code snippets/commands; queries for usage and quick recall.

---

## User Stories
- As a user, I can add a short note so that I can remember it later.
- As a user, I can ask a question and get an answer grounded in my notes with references.
- As a user, I can view the notes that were used to produce an answer.
- As a user, I get a clear message if there is not enough context to answer.
- As a user, I can delete a note that I no longer want stored. (optional)
- As a user, I can edit a note to correct content. (optional)

---

## Primary Flows
1) Add Note
   - User types content → Clicks Save → System generates embedding → Stores note
2) Ask Question
   - User types question → System embeds question → Computes similarity → Picks top 3 notes → Calls chat model with context → Renders answer + citations

---

## Architecture Overview
- Frontend: Vite + React SPA. Minimal components for note input, question input, and answer display.
- Backend: Convex (queries, mutations, and actions). Real-time database for notes.
- AI Services: OpenAI for embeddings (`text-embedding-3-small`) and chat (`gpt-4o-mini` or similar).

### Data Flow
- Add Note
  1. UI calls Convex action `addNoteWithEmbedding(content)`.
  2. Action generates embedding via OpenAI → calls internal mutation to insert note.
  3. Convex returns the new note id and derived title.
- Ask Question
  1. UI calls Convex action `askQuestion(question)`.
  2. Action generates question embedding → runs similarity scoring over notes.
  3. Selects top 3 notes → Calls OpenAI chat with a system prompt + context.
  4. Returns final answer + references (note ids/titles).

---

## Data Model and Indexes (Convex)

### Notes Table
```ts
notes: {
  // Convex provides _id automatically
  userId: string            // owner of the note (single-user MVP can be static)
  title: string             // first 20 chars of content (server-derived)
  content: string           // raw note text (limit: 4–8k chars)
  embedding: number[]       // normalized embedding vector
  createdAt: number         // epoch ms
  updatedAt?: number        // epoch ms
}
```

### Indexes
- `by_user_createdAt_desc` on `(userId, createdAt desc)` for listing.
- Optional `by_user_title` on `(userId, title)` for simple textual filtering.

Note: Vector similarity is computed in application logic (not via database index).

---

## Backend API (Convex) – Function Contracts

### Public Actions
- `addNoteWithEmbedding(args: { content: string }): { id: Id<"notes">, title: string }`
  - Validates content length, derives title, requests embedding, stores note.
  - Errors: `INVALID_INPUT`, `OPENAI_ERROR`, `DB_ERROR`.

- `askQuestion(args: { question: string }): { answer: string, refs: Array<{ id: Id<"notes">, title: string }> }`
  - Validates question length, embeds question, computes cosine similarity, selects top 3 notes above a threshold, calls chat model with context.
  - If no notes meet threshold, return an answer indicating insufficient context with no hallucinations.
  - Errors: `INVALID_INPUT`, `OPENAI_ERROR`.

### Internal Mutations/Queries
- `insertNote(args: { userId: string, title: string, content: string, embedding: number[], createdAt: number }): Id<"notes">`
- `listNotesByUser(args: { userId: string, limit?: number }): Array<Note>`
- `getNotesForSimilarity(args: { userId: string, limit: number }): Array<Pick<Note, "_id" | "title" | "embedding">>`

---

## Similarity Search Details
- Embeddings: OpenAI `text-embedding-3-small` (1536 dims). Store normalized vectors to simplify cosine similarity as dot product.
- Similarity: cosine similarity; compute `score = dot(q, v)` for normalized vectors.
- Candidate set: limit to recent N notes (e.g., 500–2,000) per user for performance; configurable.
- Selection: sort by score desc, pick top K=3 with a minimum threshold (e.g., ≥ 0.15–0.25 depending on testing).
- Prompting: provide system prompt to ground answers strictly in provided notes; include references.

---

## Validation and Limits
- Note content: 1–8,000 chars (truncate beyond limit, warn user).
- Question: 1–2,000 chars (reject if empty or too long).
- Rate limiting (app level): 10 note adds/min and 10 questions/min per user (configurable).
- Timeouts: 10s for embeddings, 30s for chat; surface readable timeout errors.

---

## Security and Privacy
- Data isolation: Each note is scoped to `userId`. For single-user MVP, use a constant id; later, add auth.
- Secrets: Store `OPENAI_API_KEY` in Convex environment variables; never expose to client.
- Logging: Avoid logging note content and prompts; log only metadata and error codes.
- Deletion: Provide a mutation to delete notes (optional in MVP). Hard delete.
- Privacy: No third-party sharing of content beyond OpenAI API calls required for functionality.

---

## Error Handling and Edge Cases
- Empty content/question → `INVALID_INPUT` with friendly UI message.
- OpenAI failures/timeouts → return `OPENAI_ERROR`; UI suggests retry.
- No relevant notes (below threshold) → return "Not enough context in your notes to answer." with zero refs.
- Large notes causing token bloat → truncate context snippets by character budget per note.
- Embedding or chat model unavailable → fallback messaging and disable relevant action temporarily.

---

## Non-Functional Requirements
- Performance: local DB ops < 200ms; Q&A end-to-end 2–5s P50, < 10s P95.
- Reliability: graceful degradation on OpenAI outages; no data loss on failures.
- Accessibility: keyboard navigation for inputs and buttons; readable contrast.
- Compatibility: modern Chromium/Firefox/Safari, latest 2 major versions.
- Observability: basic request metrics and error counts in Convex logs.

---

## Cost Controls
- Embeddings: `text-embedding-3-small` to minimize cost.
- Chat: `gpt-4o-mini` or `gpt-4o-mini-2024-xx` with small max tokens (e.g., 512–1,024).
- Context size: supply only top 3 notes with trimmed excerpts (e.g., 400–600 chars each).
- Quotas: configurable daily caps for embeddings and Q&A per user to prevent runaway costs.

---

## Testing Strategy
- Unit: similarity scoring (normalization, cosine), title derivation, validation rules.
- Integration: actions with mocked OpenAI responses; DB insert/list flows.
- E2E (manual/Playwright optional): add notes → ask question → verify citations and threshold behavior.
- Load test (lightweight): similarity over 2,000 notes within action time budget.

---

## Acceptance Criteria (Definition of Done)
- User can add a note and see it persisted.
- Asking a question returns an answer within 5s P50 with at least one citation when relevant.
- If no relevant notes, answer clearly states insufficient context.
- Costs remain under $5 for initial testing with up to 100 notes and 200 questions.
- Documentation includes `.env` setup and basic troubleshooting.

---

## Release Plan
1. MVP (v0.1): Add notes, ask questions with citations; local/dev deployment.
2. v0.2: Edit/delete notes, list notes; basic rate limiting.
3. v0.3: Optional auth (passwordless/email or OAuth via Convex template), production deploy.

---

## Glossary
- Embedding: Numeric vector representing text semantics used for similarity.
- Cosine Similarity: A measure of similarity between two vectors defined by the cosine of the angle between them.
- RAG: Retrieval-Augmented Generation; using retrieved context to ground model outputs.
- Action (Convex): Server function allowed to access external network and call mutations.
- Mutation/Query (Convex): DB operations; queries are pure reads, mutations write.

---

## Future Enhancements Roadmap
- Note editing and deletion (UI + server), list and search notes.
- Markdown support with preview; export notes (Markdown/JSON).
- Tagging and simple filters; pin important notes.
- Streaming chat responses for faster perceived latency.
- Better retrieval: hybrid search (BM25 + embeddings), chunking longer notes.
- Multi-user workspaces and sharing, role-based access control.
- Import from files (Markdown, PDF via text extraction) and web clips.


---

## Implementation Checklist

### Project Setup
- [x] Initialize Vite + React scaffold
- [x] Add Convex client/server and configure project
- [x] Configure Tailwind CSS and shadcn UI (optional)
- [x] Create `.env` with `OPENAI_API_KEY`, `CONVEX_DEPLOYMENT`
- [x] Run `npx convex dev` and `npm run dev`

### Backend (Convex)
- [x] Define `notes` schema
- [x] Add index `by_user_createdAt_desc`
- [ ] (Optional) Add index `by_user_title`
- [x] Implement `insertNote` mutation
- [x] Implement `addNoteWithEmbedding` action (OpenAI embeddings)
- [x] Implement `getNotesForSimilarity` query
- [x] Implement `askQuestion` action (similarity + chat)
- [ ] (Optional) Implement delete/edit note mutations

### Frontend (React)
- [x] Create `NoteInput` component and wire to `addNoteWithEmbedding`
- [x] Create `QuestionInput` component and wire to `askQuestion`
- [x] Create `AnswerDisplay` with citations to source notes
- [ ] (Optional) Create `NotesList` to show saved notes

### Similarity & Prompting
- [x] Normalize and store embeddings
- [x] Compute cosine similarity; select top 3 notes with threshold
- [x] Add system prompt to ground answers and avoid hallucinations

### Validation & Limits
- [x] Enforce note content length limit
- [x] Enforce question length limit
- [ ] Add simple rate limiting for add/ask actions
- [x] Add request timeouts and user-friendly error messages

### Security & Privacy
- [x] Store `OPENAI_API_KEY` in Convex env (server-only)
- [x] Avoid logging sensitive content and prompts
- [x] Scope data by `userId` (single-user MVP allowed)
- [ ] (Optional) Add hard-delete note mutation

### Testing
- [ ] Unit tests: normalization, cosine similarity, title derivation, validation
- [ ] Integration tests: actions with mocked OpenAI; DB insert/list
- [x] E2E sanity: add notes → ask question → verify citations
- [ ] Lightweight load test: similarity over ~2,000 notes

### Cost Controls
- [x] Use `text-embedding-3-small` and `gpt-4o-mini`
- [x] Trim context to top 3 notes with short excerpts
- [ ] Configure daily quotas for embeddings and Q&A

### Documentation
- [ ] README with setup, run, and `.env` details
- [ ] Troubleshooting guide for common errors/timeouts
- [ ] Usage examples and screenshots (optional)

### Release
- [x] Tag MVP v0.1 (notes + Q&A with citations)
- [ ] Plan v0.2 (edit/delete, list, rate limiting)
- [ ] Plan v0.3 (auth and production deploy)

