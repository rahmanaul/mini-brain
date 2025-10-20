# Mini Brain – TODO

## Now
- [ ] Fix `convex/notes.ts:getNoteById` to use `ctx.db.get(id)` with auth check
- [ ] Make AI answer references clickable to `/take-note?id=...` and show short snippet
- [ ] Add autosave + restore for `/take-note` editor via `localStorage`

## Next
- [ ] Stream answers to UI (token streaming)
- [ ] Tags and filters for notes
- [ ] Full‑text + semantic search with highlighting

## Later
- [ ] Chunked embeddings + MMR citations
- [ ] Rate limiting and usage caps
- [ ] Import/export Markdown

## DX
- [ ] CI: lint, typecheck, tests on PR
- [ ] Seed/dev data script
