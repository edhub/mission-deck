# Mission Deck

A local-first multi-project task deck for personal use.

Mission Deck lays projects out as fixed-width columns and groups unfinished tasks by handling mode: Concern, Details, Hands-on, Delegate, and Other. Data is stored locally in IndexedDB.

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
