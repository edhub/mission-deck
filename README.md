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

## Project plan

See [`plan.md`](./plan.md).
