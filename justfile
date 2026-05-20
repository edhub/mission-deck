set shell := ['bash', '-eu', '-o', 'pipefail', '-c']

install:
	bun install

dev:
	bun run dev

check:
	bun run check

lint:
	bun run lint

format:
	bun run format

build:
	bun run build

deploy: build
	rsync -avz --delete build/ ali44:/var/www/deck.tyun.fun/
