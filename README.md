# Portfolio

A work-first portfolio: visitors land directly inside a continuous, full-screen showcase of client projects, with a persistent tab-styled nav whose active item tracks scroll position. Built with Astro, Tailwind v4, React islands, and shadcn/ui.

See `/Users/anton/.claude/plans/federated-wondering-sifakis.md` for the full design rationale (the scroll/active-nav algorithm in particular).

## Commands

| Command | Action |
| --- | --- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the dev server at `localhost:4321` |
| `pnpm build` | Build the static site to `./dist/` |
| `pnpm preview` | Preview the production build locally |
| `pnpm astro check` | Type-check `.astro` files |

## Architecture

- **`src/pages/index.astro`** — the single route. Renders `<SiteNav>` plus every project's `<ProjectSection>`, in order, from `getAdapter().getProjects()`.
- **`src/components/nav/`** — `SiteNav.astro` + `NavLink.astro` render the persistent nav; `ActiveNavController.ts` is a dependency-free script (not a React island) that drives active-project tracking, scroll-snap-safe click navigation, and per-section nav contrast from two `IntersectionObserver`s.
- **`src/components/project/`** — `ProjectSection.astro` is the scroll-snap target (one per project); `SectionRenderer.astro` switches on section type and delegates to `src/components/sections/*`.
- **`src/lib/content/`** — `types.ts` is the shared `Project`/`Section` content model. `adapter.ts` defines the `ContentAdapter` interface and picks an implementation via `CONTENT_SOURCE`. `fixture-adapter.ts` and `payload-adapter.ts` are the two implementations; nothing outside `adapter.ts` knows which one is active.
- **`src/lib/validate.ts`** — zod schemas validating all content at the adapter boundary (fixtures today, Payload later), excluding non-published items from production output.

Default to plain `.astro` components. `@astrojs/react` is wired up (shadcn/ui needs it), but it's for isolated interactive islands only, not the core scroll/nav logic.

## Content: fixture mode vs. Payload CMS

The site currently runs entirely on **fixture content** — three sample projects in `src/content/fixtures/`, not real client work. This is the default and requires no backend.

To connect a real [Payload CMS](https://payloadcms.com) instance instead:

1. Set `CONTENT_SOURCE=payload` and `PAYLOAD_API_URL=<your instance URL>` (see `.env.example`).
2. Create a `projects` collection in Payload whose fields mirror `src/lib/content/types.ts` — in particular, model `sections` as a Payload `blocks` field with one block type per `Section["type"]` (`hero`, `image`, `video`, `text`, `image-grid`).
3. `src/lib/content/payload-adapter.ts` fetches from Payload's REST API (`GET /api/projects?where[_status][equals]=published&depth=2`) and maps each doc into our `Project`/`Section` shape. **This mapping is written against Payload's documented REST conventions but has not been verified against a live instance** — if your actual collection schema differs from the assumption above, `mapPayloadDocToProject` (the one function in that file that knows Payload's shape) is what needs to change.

### Publishing → rebuild

Content is fetched **at build time** (static output), so a Payload publish doesn't update the live site until a new build runs. The recommended wiring, once a real instance exists: add an `afterChange` hook to the `projects` collection in Payload's config that `POST`s to a [Netlify build hook URL](https://docs.netlify.com/configure-builds/build-hooks/) whenever a document's `_status` becomes `published`. This is documented here as the intended approach — it is not implemented, since there's no live Payload config to add it to yet.

```ts
// payload.config.ts (on the Payload side, once it exists) — illustrative only
{
  slug: "projects",
  hooks: {
    afterChange: [
      async ({ doc, previousDoc }) => {
        if (doc._status === "published" && previousDoc?._status !== "published") {
          await fetch(process.env.NETLIFY_BUILD_HOOK_URL!, { method: "POST" });
        }
      },
    ],
  },
}
```

## Environment variables

See `.env.example`. No secrets are required for fixture mode.
