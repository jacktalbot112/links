# Jack Talbot — personal link page

A self-hosted, fully bespoke link-in-bio page. Plain HTML/CSS/JS — no build step, no framework, no database, no monthly fees, no third-party branding.

## What's here

```
index.html        ← page structure
styles.css        ← all visual styling (theme, gradient, animations)
app.js            ← carousel, infinite scroll, modal logic
data.js           ← YOUR CONTENT lives here. Edit this.
portrait.jpg      ← header photo (above the name)
media/
  cocredit.jpg
  leverage-capital.jpg
  podcast.jpg
  linkedin.jpg
  instagram.jpg
```

Total weight: ~85KB. Loads instantly.

## How to edit content

Open `data.js` in any text editor. Update:

- `profile.name` — the big headline
- `profile.bio` — the "Information" paragraph under your name
- `tiles[]` — each card in the scrollable carousel

Each tile takes:

| field         | what it is                                                    |
|---------------|---------------------------------------------------------------|
| `label`       | small pill in the top-left of the card                        |
| `title`       | bold headline overlaid on the bottom                          |
| `description` | smaller text under the title                                  |
| `media`       | path to an image (e.g. `media/cocredit.jpg`)                  |
| `link`        | URL the card opens when tapped                                |

To add a tile, copy an existing one and change the values. Add the new image to `media/`.

To replace the header photo, drop your new photo in as `portrait.jpg` (square, at least 600×600 recommended).

To change the colour theme, open `styles.css` and look for `/* ===== Theme ===== */` near the top — the gradient is defined as a stack of radial gradients on the `html, body` selector.

## How to deploy (Cloudflare Pages — free)

1. Make a free GitHub account if you don't have one.
2. Create a new repo (call it whatever — e.g. `links`). Upload these files keeping the same folder structure (`media/` stays as a folder).
3. Go to https://dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git.
4. Pick the repo. Build command: leave blank. Output directory: `/`. Click deploy.
5. You get a free `your-name.pages.dev` URL straight away.
6. (Optional) Add a custom domain — `links.leveragecapital.com.au`, `jack.cocredit.com.au`, or whatever — under the "Custom domains" tab. Cloudflare walks you through DNS in two clicks.

That's it. Total cost: $0 (or ~$10/year if you want a fresh custom domain).

## How to test locally

```bash
cd jack-talbot-site
python3 -m http.server 8000
# then visit http://localhost:8000 in your browser
```

(You can also just double-click `index.html`, but some browsers block local image loading from file:// URLs. The Python server avoids that.)

## Notes on what's already wired up

- **Co.Credit** → https://www.cocredit.com.au
- **Leverage Capital** → https://www.leveragecapital.com.au
- **The Podcast** → https://podcasts.apple.com/us/podcast/leverage-capital-jack-talbot/id1752419438
- **LinkedIn** → https://www.linkedin.com/in/talbotjack
- **Instagram** → https://www.instagram.com/jacktalbot (update if your handle is different)

## Carousel behaviour

The bottom carousel auto-drifts to the left at ~40px/sec, infinitely loops in both directions, and is fully swipeable on touch. Pauses while you're touching it; resumes once the momentum scroll has settled. Three copies of the tile set are rendered side-by-side and the scroll position is invisibly reset when you cross a copy boundary, so it never runs out of content.

To change the auto-scroll speed: edit `PIXELS_PER_SECOND` in `app.js` (currently 40).

## Tile images

The current tile images are abstract gradient placeholders, colour-graded to suit the theme. When you have proper photography (lifestyle shots, product shots, podcast cover art, etc.), drop them into `media/` and update the paths in `data.js`. Recommended portrait orientation, ~600×800px, JPEG quality 80.
