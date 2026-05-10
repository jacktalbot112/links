# Jack Talbot — personal link page

Self-hosted, fully bespoke link-in-bio page. Plain HTML/CSS/JS — no build step, no framework, no database, no monthly fees.

Live URL: **jacktalbot.com.au**

## What's here

```
index.html        ← page structure
styles.css        ← all visual styling (theme, gradient, animations)
app.js            ← carousel, infinite scroll, video, modals, icons
data.js           ← YOUR CONTENT lives here. Edit this.
portrait.jpg      ← header photo (above the name)
media/
  cocredit.mp4    ← Co.Credit tile (video)
  leverage-capital.jpg
  podcast.jpg
  linkedin.jpg
  instagram.jpg
README.md
```

## What it does

- **Hero block** — circular portrait, big black "JACK TALBOT" headline, bio paragraph
- **Carousel** of 5 tiles, auto-scrolling left at 80px/sec, infinite loop in both directions
- **Swipe** on mobile, **click + drag** on desktop, plus **hover arrows** on desktop only
- **"Scroll →" hint** above the carousel with a subtle nudge animation
- **Video tiles** — autoplay, muted, looping (currently only Co.Credit)
- **Animated waveform overlay** on the Podcast tile
- **Per-tile modal** — opens on "See More" click, shows full description and a contextual icon button (Co.Credit logo, Leverage Capital chevron, podcast mic, LinkedIn, Instagram) plus "Click to explore more." label
- **Hunter green theme** — deep emerald gradient with brass accents, subtle drift animation
- **Custom font** — Geist via Google Fonts

## How to edit content

Open `data.js`. Update:

- `profile.name` — the big headline
- `profile.bio` — the paragraph under your name
- `tiles[]` — each card

Each tile takes:

| field         | what it does                                                          |
|---------------|-----------------------------------------------------------------------|
| `label`       | small pill in the top-left of the card                                |
| `title`       | bold headline overlaid on the bottom                                  |
| `description` | smaller text under the title, also shown in modal                     |
| `media`       | path to image (.jpg, .png) or video (.mp4, .webm)                     |
| `link`        | URL the modal CTA opens                                               |
| `icon`        | optional. One of: cocredit, leverage, mic, linkedin, instagram        |
| `overlay`     | optional. Currently only "waveform" is supported                      |

## Adding a video tile

1. Drop the video file into `media/`. **Must be MP4 with H.264 codec, no audio track.** Target 720×960 portrait, 4-8 seconds, under 1.5MB.
2. Update the tile's `media:` to point at the new file (e.g. `media/leverage.mp4`)
3. Done — autoplay/loop/mute is wired up automatically

If you have a video in HEVC (H.265) or with audio, re-encode with:

```bash
ffmpeg -i source.mp4 -an -c:v libx264 -preset slow -crf 26 \
  -profile:v main -pix_fmt yuv420p -movflags +faststart \
  -vf "scale=720:960:flags=lanczos" output.mp4
```

## How to deploy

The site is hosted on Cloudflare Workers/Pages connected to a GitHub repo.

**To make changes:**
1. Edit any file in the GitHub repo (web editor works fine — pencil icon on each file)
2. Commit changes
3. Cloudflare auto-redeploys in ~30 seconds
4. Refresh jacktalbot.com.au to see live

**To replace media files:** drag and drop into the appropriate folder in GitHub, commit. Same auto-deploy.

## Local preview

```bash
cd jack-talbot-site
python3 -m http.server 8000
# visit http://localhost:8000 in browser
```

(Don't double-click index.html directly — local file:// URLs sometimes block videos and CORS for fonts.)

## Theme tweaks

- **Auto-scroll speed**: app.js, find PIXELS_PER_SECOND (currently 80). Higher = faster.
- **Background gradient**: styles.css, top of file. The four hex colours #14402e, #8a6a30, #08201a, #061410 define the Hunter palette.
- **Waveform speed**: app.js, the three time multipliers in the wave path build (currently 1.8, 2.7, 1.05). Higher = faster.

## Tile links

- Co.Credit → https://www.cocredit.com.au
- Leverage Capital → https://www.leveragecapital.com.au
- The Podcast → Apple Podcasts (Leverage Capital || Jack Talbot)
- LinkedIn → https://www.linkedin.com/in/talbotjack
- Instagram → https://www.instagram.com/jacktalbot
