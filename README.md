# Mission Deck

A local-first multi-project task deck for personal use.

Mission Deck lays projects out as fixed-width columns and tags unfinished tasks by handling mode: Concern, Hands-on, Details, Verify, and None. Task content and project titles are edited inline and stored locally in IndexedDB as TipTap HTML.

## Stack

- SvelteKit
- Bun
- Tailwind CSS
- DaisyUI
- IndexedDB via `idb`
- Static adapter

## Development

```sh
bun install
bun run dev
```

Or with `just`:

```sh
just dev
```

## Checks

```sh
bun run check
bun run lint
bun run build
```

Or:

```sh
just check
just lint
just build
```

## Shelf sync

Mission Deck can upload and restore local IndexedDB snapshots through `https://shelf.tyun.fun`.
The app uses GitHub OAuth through Shelf, then stores the returned `shelf_...` API token in browser `localStorage`.

Shelf server configuration for production:

```env
ALLOWED_REDIRECT_URLS=https://deck.tyun.fun
CORS_ALLOWED_ORIGIN_SUFFIXES=tyun.fun
```

Client flow:

1. Open the left sidebar.
2. Click **Sign in with GitHub** under **Shelf sync**.
3. After GitHub OAuth, Shelf redirects back to the app root with a token.
4. Use **Upload backup** or restore one of the listed `mission-deck.json` backups.

## Project plan

See [`plan.md`](./plan.md).
