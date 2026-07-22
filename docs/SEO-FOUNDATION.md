# SEO foundation — setup

## Assumptions
- Next.js 15 App Router, TypeScript, `@/*` path alias mapped to project root.
  If your alias points at `src/`, move `lib/`, `components/`, `data/`, `app/` accordingly.
- Add `resolveJsonModule: true` in tsconfig if not already set (needed for JSON imports).

## What to configure
1. Edit `lib/site.ts` — verify RUC, phone, email, founding year, and add real social URLs to `sameAs`.
2. GitHub → repo → Settings → Secrets and variables → Actions:
   - Variable `SITE_URL` = your production URL.
   - Secret `INDEXNOW_KEY` = a UUID-like string. Also create `public/<INDEXNOW_KEY>.txt`
     whose only content is that same key (IndexNow ownership proof).
3. Add to package.json scripts: `"prebuild": "node scripts/generate-llms.mjs"`.
4. Google Search Console + Bing Webmaster Tools: verify the domain, submit `/sitemap.xml`.

## What is intentionally NOT here (and why)
- Google Indexing API for normal pages — restricted to JobPosting/BroadcastEvent; misuse
  risks losing API access. Use sitemaps + `lastmod` + GSC "Request indexing".
- Invented statistics, fake reviews/ratings, unverifiable certifications — kill your EEAT
  and violate this repo's honesty principle. City pages use only true public facts.
- Competitor scraping, automated outreach/comment spam, cloaking, doorway pages.
  Local pages are a curated set with `dynamicParams=false` so no thin pages get generated.

## Legitimate high-leverage next steps
- Add real product `Product`/`FAQPage` JSON-LD on `/productos/[slug]` via `lib/schema.ts`.
- Write 3–5 genuine pillar guides; interlink to product + local pages.
- Set up a Google Business Profile with accurate NAP; request reviews only from real customers.
