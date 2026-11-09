# Brand polish: logo, favicon/app icons, metadata

Scope: `apps/web` only. No API, schema or route changes. No new runtime dependencies.

## What I found

**Logo** (`public/logo.png`, `public/logo-dark-mode.png`, rendered by `components/ui/Logo.tsx`)
- Both files are 1081×747 with transparent padding, and the padding differs between the two:
  - light: content box `12,40 → 1072,739` (thin margins)
  - dark: content box `70,89 → 1052,730` (about 70px left and 89px top of empty space)
  - So at the same CSS height the dark logo looks smaller and shifted than the light one.
- The dark variant (a white block with purple text) is visibly softer, as if it was upscaled. The light one is crisp. The two share the same block shape, just with colours swapped.
- `Logo.tsx` declares `width={1000} height={1000}` (wrong aspect ratio) and passes `unoptimized`. The browser downloads 46 KB + 67 KB of PNG to show a logo that's 48–80px tall.
- Heights in use: Navbar `h-14` in an `h-16` bar, StudentNavbar `h-14` in `h-16`, AdminSidebar `h-12`, courses/challenges/legal headers `h-12`, footer `h-16`, auth pages `h-20` (verify-email `h-16`), PageLoader `h-20`.
- `/logo.png` is also used by `components/Certificate.tsx` (fixed height, `width: auto`) and by the admin students PDF export (`app/admin/students/page.tsx`, read through `fetch`). Trimming the padding only makes the logo fill its box a bit more in both places. Neither has hard-coded aspect maths.

**Favicon / icons**
- `public/favicon.ico` has a single 48×48 frame: an outlined purple "W" with an orange peak on a near-white rounded tile. There is no larger or vector source in the repo (the copies in `docs/assets/brand` and `video/public` are the same logo files, with no W mark).
- `public/icons/*` holds social/contact icons used by the PDF export. These are not app icons, so I leave them alone.
- No `app/icon.*`, `app/apple-icon.*`, manifest, OG image or `theme-color`.

**Metadata** (`app/layout.tsx`)
- `title.template` is `%s`, which gives no brand suffix. Titles actually come from the client-side `components/system/PageTitleSync.tsx` (hardcoded `APP_NAME`), which already uses "Page | WithinTech Learn".
- `twitter.card: "summary"` and there's no image. The brand name is hardcoded in about 6 places. `NEXT_PUBLIC_BRAND_NAME` is only read in the students export (empty in local `.env`, set through a GH secret in deploy).

**Caching**: `next.config.ts` sets `no-store` on `/favicon.ico` and `no-cache` on `/logo.png`. nginx (`infra/nginx/nginx.conf`) adds nothing for these paths.

## Plan

### 1. Regenerate logo assets (a one-off sharp script in the scratchpad; only the output PNGs are committed)
- Trim `logo.png` to its alpha bounding box (plus a 2px safety margin).
- **Rebuild the dark variant from the light master** instead of trimming the soft file. Inside the purple block, map each pixel's purple↔white mix to white↔purple (`#350066`). The orange "Learn" box stays untouched. The result has identical geometry and sharpness, so both variants line up exactly at any height.
- Export both at 480px tall (about 728px wide, enough for an 80px render at 6× DPR), as palette-quantised PNG. Target under 25 KB each. Keep the filenames `logo.png` / `logo-dark-mode.png` so Certificate, the PDF export and the docs links keep working.
- I'll show you before/after previews (light on white, dark on `#0f0f0f`) before committing.

### 2. `components/ui/Logo.tsx`
- Use real intrinsic `width`/`height` from the new files (shared constants), keep `unoptimized` (it's a small static PNG, so no optimizer round-trip), and set `alt` from the brand constant.
- Keep the `dark:hidden` / `hidden dark:block` swap (the theme is class-based, so `<picture media>` wouldn't follow the toggle).
- Leave the unused `variant` prop alone to stay in scope.

### 3. Even out logo heights (trimming removes padding, so the logos would otherwise grow)
- Top bars (`Navbar`, `StudentNavbar`, courses/challenges/legal headers): `h-11` (44px) inside the `h-16` bar.
- AdminSidebar: `h-11`.
- Footer: `h-14`.
- Auth pages (sign-in, sign-up, forgot-password, verify-email) and PageLoader: `h-16`.

### 4. Favicon and app icon set
The only W-mark source is 48px, and upscaling it to 512 would look blurry. **Default:** I redraw the W mark as a clean SVG (`app/icon.svg`): outlined purple W, orange peak, white rounded tile, traced from the 48px original. I'll show you a preview, then rasterise everything from it with sharp:
- `app/favicon.ico` with 16/32/48 frames (using `sharp-ico`, already in the pnpm store as a transitive dependency and used only by the one-off script). Delete `public/favicon.ico`.
- `app/icon.svg` for modern browsers, plus `app/icon.png` at 32px as the fallback.
- `app/apple-icon.png` at 180px, on a solid white background (iOS ignores transparency).
- `public/icons/app/icon-192.png`, `icon-512.png`, and `icon-maskable-512.png` (W in the 80% safe zone on a white background) for the manifest.

If you have the original vector or a large PNG of the W mark, send it and I'll use it instead of my redraw.

### 5. `app/manifest.ts` (MetadataRoute.Manifest)
- `name: BRAND_NAME`, `short_name: "WT Learn"`, `description`, `start_url: "/"`, `display: "standalone"`.
- `background_color: "#ffffff"`, `theme_color: "#3d006b"` (`--primary`).
- Icons: 192, 512, and the maskable 512.

### 6. `lib/brand.ts` (new, small)
`BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || "WithinTech Learn"`, plus `SITE_URL`, `BRAND_TAGLINE` ("Study at your pace"), `BRAND_DESCRIPTION`, and the logo dimensions. Use it in:
- layout metadata and the manifest
- `PageTitleSync` (`APP_NAME`)
- the `Logo` alt text
- the Certificate alt text
- the students export (replaces the inline `|| "WithinTech Learn"`)

### 7. `app/layout.tsx` metadata
- `title: { default: "${BRAND_NAME}: Study at your pace", template: "%s | ${BRAND_NAME}" }`
- `applicationName`, `description`, `appleWebApp: { title: "WT Learn", statusBarStyle: "default" }`
- `openGraph`: add `locale: "en_US"`. The image comes from `app/opengraph-image.png`.
- `twitter.card: "summary_large_image"`. The image comes from `app/twitter-image.png` (same file).
- `export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }, { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" }] }`, matching `--background` / `.dark --background`.

### 8. Open Graph image
A static 1200×630 PNG (`app/opengraph-image.png` + `app/twitter-image.png`, with `.alt.txt` files): the trimmed light logo centred on white, with a thin purple and orange brand bar along the bottom edge. No rendered text, so there's no font dependency in sharp. Target under 100 KB.

### 9. `next.config.ts` caching
- Remove the `/favicon.ico` `no-store` rule. App Router metadata icons are emitted with a content hash query (`/favicon.ico?<hash>`, `/icon.svg?<hash>`), so browsers pick up changes without it.
- Replace the `/logo.png` `no-cache` rule with `public, max-age=3600, must-revalidate`, applied to both `/logo.png` and `/logo-dark-mode.png`. The filenames aren't hashed, so a short TTL keeps future logo swaps visible within an hour.

### Out of scope
- Redesigning the logo itself.
- PWA offline support or a service worker.
- Converting `PageTitleSync` to per-page `metadata` exports.
- Anything in `docs/` or `video/` (they keep their own copies of the old logo files).

## Checks
- `pnpm --filter web lint`
- `pnpm --filter web build` (checks that metadata routes compile under `output: "standalone"`)
- Inspect the built `<head>` (`curl` the started standalone server): favicon/icon/apple-icon/manifest links, `theme-color` ×2, `og:image`, `twitter:card`.
- Screenshots in the browser pane: landing (light/dark, desktop/375px), sign-in, footer, learn shell, admin sidebar.

## Verify steps (for you)
1. `pnpm --filter web dev`, then open http://localhost:3000. The logo is crisp, the same height in light and dark (use the theme toggle), and has no extra whitespace in the navbar or footer.
2. Visit `/sign-in`, `/learn` and `/admin`: check the logo sizing.
3. The browser tab shows the W favicon. View source shows `<link rel="icon" … sizes="16x16 32x32 48x48">`, `icon.svg`, `apple-touch-icon`, `manifest`, and two `theme-color` metas.
4. http://localhost:3000/manifest.webmanifest returns the name and colours. Chrome DevTools → Application → Manifest shows the icons with no errors.
5. After deploying: paste https://learn.withintech.org into https://www.opengraph.xyz to see the OG card. On iOS, use Add to Home Screen to see the apple icon.

Commits stay local. No push or deploy.
