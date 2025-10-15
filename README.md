## mini-brain

Your personal knowledge assistant. Capture notes, then ask natural-language questions to get AI-powered answers grounded in your own notes.

- **Frontend**: React 19, Vite 6, TanStack Router, Tailwind CSS
- **Backend**: Convex (database + server runtime), Convex Auth (email/password), OpenAI (embeddings + chat)

### Features
- **Auth (email/password)** via Convex Auth
- **Notes**: add, list, edit, delete; titles auto-derived from content
- **AI Q&A**: embeds notes with OpenAI, finds the most relevant ones, and answers using GPT
- **History**: view past questions and answers

---

## Quick start

Prereqs: Node 18+ and npm.

1) Install deps
```bash
npm install
```

2) Create `.env.local` with required variables (see Env vars). If you skip this, the first dev run will guide you.

3) Start dev (frontend + backend)
```bash
npm run dev
```

This will:
- run Vite at `http://localhost:5173`
- start Convex dev, open the Convex dashboard, and help set up Convex Auth

4) Sign up / sign in in the app (Password provider). Then start adding notes and asking questions.

---

## Environment variables

Create a `.env.local` in the project root and set:

- `VITE_CONVEX_URL` — your Convex deployment URL (dev or prod). In dev, `convex dev` will print this; you can also copy from the Convex dashboard.
- `OPENAI_API_KEY` — required for embeddings and chat completions used by server actions.
- `CONVEX_SITE_URL` — base domain used by Convex Auth (see `convex/auth.config.ts`). For dev you can set it to your Convex Cloud dev URL.

The first run of `npm run dev` invokes a setup helper that can populate and update `.env.local` for Convex Auth.

---

## Scripts

- `dev`: runs frontend (Vite) and backend (Convex) together
- `build`: type-checks and builds the frontend
- `preview`: serves the production build locally
- `lint`: type-checks and runs ESLint

See `package.json` for the full list:

```json
{
  "dev": "npm-run-all --parallel dev:frontend dev:backend",
  "dev:frontend": "vite --open",
  "dev:backend": "convex dev",
  "predev": "convex dev --until-success && convex dev --once --run-sh \"node setup.mjs --once\" && convex dashboard",
  "build": "tsc -b && vite build",
  "lint": "tsc && eslint .  --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview"
}
```

---

## How it works

### Data model (Convex)
Defined in `convex/schema.ts`:
- `notes` — `{ userId, title, content, embedding, createdAt, updatedAt? }`, index `by_user_createdAt_desc`
- `questions` — `{ userId, question, createdAt }`, index `by_user_createdAt_desc`
- `answers` — `{ userId, questionId, answer, createdAt }`, index `by_user_createdAt_desc`
- Convex Auth tables via `authTables`

### Backend functions (Convex)
- `convex/miniBrain.ts`
  - Actions: `addNoteWithEmbedding`, `askQuestion`, `updateNoteWithEmbedding`
  - Queries: `getNoteById`, `listNotes`
  - Internal: `insertNote` (mutation), `getNotesForSimilarity` (query), `getNotesContent` (query)
- `convex/notes.ts`
  - Mutations: `deleteNote`, `updateNoteWithEmbedding`
  - Query: `getNotes` (example/all notes)
- `convex/questions.ts`
  - Query: `getQuestionsAndAnswers`
  - Mutation: `addQuestion`
- `convex/user.ts`
  - Query: `getUserEmailById`
- `convex/auth.ts` + `convex/http.ts`
  - Convex Auth (Password provider) and HTTP routes

Key details:
- Embeddings via OpenAI `text-embedding-3-small`; vectors are normalized for cosine similarity
- Relevant notes are selected by threshold and top-K
- Answers are generated with `gpt-4o-mini`, constrained to provided note context

### Frontend
- Entry: `src/main.tsx` sets up Convex client with `VITE_CONVEX_URL` and TanStack Router
- App shell: `src/App.tsx` gates content on auth and renders:
  - `NoteInput` — add notes
  - `QuestionInput` — ask questions
  - `AnswerDisplay` — show answer with references
- Routes:
  - `/notes` — list, edit, delete notes (`src/routes/notes.tsx`)
  - `/questions` — view Q&A history (`src/routes/questions.tsx`)

UI: Tailwind CSS with lightweight components.

---

## Local development

1) Start everything
```bash
npm run dev
```

2) Open the app at `http://localhost:5173`

3) Sign up/sign in, then:
- Add a note with the form
- Ask a question using the notes as your knowledge base
- See references to the notes used

Troubleshooting:
- Ensure `VITE_CONVEX_URL` and `OPENAI_API_KEY` are in `.env.local`
- If auth fails, re-run the setup via `npm run dev` and follow prompts in the Convex dashboard

---

## Deployment

1) Deploy Convex (database + backend)
```bash
npx convex deploy
```
Copy the production Convex URL and set it as `VITE_CONVEX_URL` in your hosting provider.

2) Configure environment on your host
- `VITE_CONVEX_URL` — production Convex URL
- `OPENAI_API_KEY` — your OpenAI key
- `CONVEX_SITE_URL` — your site/domain for Convex Auth

3) Build and deploy frontend
```bash
npm run build
# deploy the contents of dist/ to your host (Netlify, Vercel, etc.)
```

---

## Project structure

```
mini-brain/
  convex/
    auth.ts, auth.config.ts, http.ts
    miniBrain.ts, notes.ts, questions.ts, user.ts
    schema.ts
  src/
    App.tsx, main.tsx, index.css
    components/ (NoteInput, QuestionInput, AnswerDisplay, ui/...)
    routes/ (notes.tsx, questions.tsx)
  vite.config.ts
  package.json
  README.md
```

---

## Security and privacy
- Notes are scoped per authenticated user on both read and write paths
- Server actions re-check auth on every call
- No third-party analytics are included

---

## License
See `LICENSE.txt`.
