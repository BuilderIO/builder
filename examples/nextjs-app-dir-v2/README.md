# Builder.io + Next.js 16 (App Router)

Example of the [Builder.io Gen 2 React SDK](https://www.builder.io/c/docs/developers) (`@builder.io/sdk-react`) with the Next.js App Router and React 19. Requires Node 22+ (`.nvmrc` pins 24; run `nvm use`).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The example uses a public demo API key by default. To use your own space, copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_BUILDER_API_KEY`.

## Try it

1. In [Builder](https://builder.io), create a `page` entry with URL `/`.
2. Set the model's preview URL to `http://localhost:3000`.
3. In the Visual Editor, drag **MyFunComponent** in from the Insert menu.
4. Publish and reload. If nothing is published for a URL, the page shows a 404 message.

## What's here

- `src/app/[[...slug]]/page.tsx`: catch-all route that fetches the entry with `fetchOneEntry` and renders it with `<Content />`. `params` and `searchParams` are Promises in Next.js 15+.
- `src/app/components/register.ts`: registers custom components. With this SDK they must be client components (hence `'use client'`), but they are still server-rendered, then hydrated.
- `src/app/components/MyFunComponent.tsx`: sample component to drag into Builder content.
- `next.config.mjs`: marks `isolated-vm` (used by the SDK on the server) as a server external package.

## Rendering

The page awaits `searchParams`, which Builder preview and the Visual Editor rely on, so it renders on every request.

For static or cached pages, a possible approach (**not implemented or tested here**):

- Fetch published content without `searchParams`, using [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) with a [`revalidate`](https://nextjs.org/docs/app/guides/incremental-static-regeneration) interval or a Builder webhook that calls `revalidatePath()`.
- Serve editing and previews from a separate dynamic route and point the model's Preview URL at it with [dynamic preview URLs](https://www.builder.io/c/docs/dynamic-preview-urls).

## Builder CMS MCP server (optional)

Connect AI tools to your Builder Content space to query and edit content from your editor. See the [setup guide](https://www.builder.io/c/docs/mcp-builder-server#integrate-the-builder-cms-mcp-server).
