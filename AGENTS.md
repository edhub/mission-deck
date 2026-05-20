# AGENTS.md

## Project

Mission Deck is a personal, local-first, static SvelteKit task deck.

Core product rules:

- Project = fixed-width column.
- Projects are laid out horizontally and may scroll sideways.
- Each project column scrolls vertically.
- Unfinished tasks are grouped by handling mode: Concern, Details, Hands-on, Delegate, Other.
- Completed tasks live at the bottom, default collapsed.
- Tasks only have content, completion state, focus flag, group, order, and timestamps.
- Data is stored locally in IndexedDB via `idb`.

## Stack

- Bun
- SvelteKit / Svelte 5
- Tailwind CSS / DaisyUI
- `idb`
- `svelte-dnd-action`
- `justfile`

## Commands

- `bun run dev`
- `bun run check`
- `bun run lint`
- `bun run build`
- or `just dev|check|lint|build`

## Conventions

- Organize code by feature under `src/lib/features/`.
- Keep UI minimal and macOS-native feeling.
- Prefer small local data models over generic task-manager complexity.
- Do not add backend/auth/cloud sync unless explicitly requested.
- Do not auto-commit; provide a concise commit message when useful.
