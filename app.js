(function () {
  const data = window.PROFILE_DATA;
  if (!data) return;

  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const nameEl = document.getElementById('profile-name');
  const bioEl  = document.getElementById('profile-bio');
  if (nameEl) nameEl.textContent = data.profile.name;
  if (bioEl)  bioEl.textContent  = data.profile.bio;
  // Page title is set in index.html — don't override here

  const track = document.getElementById('carousel-track');

  // ===== Icon library =====
  // Inline SVGs keyed by slug. Sized 16px for pill use; CSS scales as needed.
  const ICONS = {
    globe: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    news: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><line x1="18" y1="14" x2="10" y2="14"/><line x1="15" y1="18" x2="10" y2="18"/><line x1="10" y1="6" x2="18" y2="6"/><line x1="10" y1="10" x2="18" y2="10"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>`,
    mic: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  };

  function buildTile(tile, index, isClone) {
    const el = document.createElement('article');
    el.className = 'tile';
    el.setAttribute('role', 'listitem');
    if (isClone) el.setAttribute('aria-hidden', 'true');

    // Render media as either <img> or <video> based on the file extension.
    // Videos must be muted+playsinline+autoplay+loop to autoplay on mobile.
    const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(tile.media || '');
    let media;
    if (isVideo) {
      media = document.createElement('video');
      // CRITICAL: iOS Safari decides whether to allow autoplay based on
      // attributes present BEFORE the src is set. Set them first.
      media.setAttribute('muted', '');
      media.setAttribute('playsinline', '');
      media.setAttribute('webkit-playsinline', '');
      media.setAttribute('autoplay', '');
      media.setAttribute('loop', '');
      media.setAttribute('disablepictureinpicture', '');
      media.setAttribute('disableremoteplayback', '');
      media.muted = true;          // property too, belt and braces
      media.defaultMuted = true;
      media.loop = true;
      media.playsInline = true;
      media.autoplay = true;
      media.controls = false;
      media.preload = 'auto';
      media.className = 'tile-media';
      // Now set src — only AFTER the muted/playsinline attrs exist
      media.src = tile.media;

      // Nudge play() — Safari sometimes won't autoplay without an explicit call
      const tryPlay = () => {
        const p = media.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            // If autoplay was refused, try again on first user interaction
            const retry = () => {
              media.play().catch(() => {});
              document.removeEventListener('touchstart', retry);
              document.removeEventListener('click', retry);
            };
            document.addEventListener('touchstart', retry, { once: true, passive: true });
            document.addEventListener('click', retry, { once: true });
          });
        }
      };
      media.addEventListener('loadedmetadata', tryPlay);
      media.addEventListener('canplay', tryPlay);
      // Also try when added to DOM
      requestAnimationFrame(tryPlay);
    } else {
      media = document.createElement('img');
      media.className = 'tile-media';
      media.src = tile.media;
      media.alt = '';
      media.loading = 'lazy';
      media.decoding = 'async';
    }
    el.appendChild(media);

    // Optional overlay (currently supports 'waveform' for podcast-style tiles)
    if (tile.overlay === 'waveform') {
      const wave = document.createElement('div');
      wave.className = 'tile-waveform';
      wave.innerHTML = `
        <svg viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
          <path class="wave-path wave-1" d="M0,30 Q25,30 50,30 T100,30 T150,30 T200,30 T250,30 T300,30 T350,30 T400,30" />
          <path class="wave-path wave-2" d="M0,30 Q25,30 50,30 T100,30 T150,30 T200,30 T250,30 T300,30 T350,30 T400,30" />
        </svg>`;
      el.appendChild(wave);
    }

    const pills = document.createElement('div');
    pills.className = 'tile-pills';
    const labelPill = document.createElement('span');
    labelPill.className = 'pill pill-label';
    const iconSvg = tile.icon && ICONS[tile.icon];
    if (iconSvg) {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'pill-icon';
      iconSpan.innerHTML = iconSvg;
      labelPill.appendChild(iconSpan);
    }
    const labelText = document.createElement('span');
    labelText.textContent = tile.label || '';
    labelPill.appendChild(labelText);
    pills.appendChild(labelPill);

    const seeMore = document.createElement('button');
    seeMore.className = 'pill';
    seeMore.textContent = 'See More';
    seeMore.addEventListener('click', (e) => {
      e.stopPropagation();
      if (tile.link && tile.link !== '#') window.open(tile.link, '_blank', 'noopener');
    });
    pills.appendChild(seeMore);
    el.appendChild(pills);

    const cap = document.createElement('div');
    cap.className = 'tile-caption';
    const t = document.createElement('h3');
    t.className = 'tile-title';
    t.textContent = tile.title || '';
    const d = document.createElement('p');
    d.className = 'tile-desc';
    d.textContent = tile.description || '';
    cap.append(t, d);
    el.appendChild(cap);

    el.addEventListener('click', () => {
      if (tile.link && tile.link !== '#') window.open(tile.link, '_blank', 'noopener');
    });
    return el;
  }

  // Render tiles THREE TIMES so the user is always in the middle copy.
  // This means we can wrap invisibly in either direction without ever
  // running out of content on the side they're swiping toward.
  data.tiles.forEach((t, i) => track.appendChild(buildTile(t, i, true)));  // copy A (clone, on the left)
  data.tiles.forEach((t, i) => track.appendChild(buildTile(t, i, false))); // copy B (the visible one user starts on)
  data.tiles.forEach((t, i) => track.appendChild(buildTile(t, i, true)));  // copy C (clone, on the right)

  // ---- Animated waveform driver ----
  // Generates a smooth pseudo-audio waveform path and updates all .wave-path
  // elements on a shared rAF loop. One loop, all tiles, low CPU.
  const wavePaths = document.querySelectorAll('.tile-waveform .wave-path');
  if (wavePaths.length > 0) {
    const POINTS = 40;        // resolution of the wave
    const W = 400, H = 60, MID = 30;
    const AMP = 14;           // peak amplitude

    function buildPath(t, phaseOffset, ampScale) {
      // Layered sine waves at different frequencies for an organic look
      const pts = [];
      for (let i = 0; i <= POINTS; i++) {
        const x = (i / POINTS) * W;
        const fx = i / POINTS;
        const y = MID
          + Math.sin(fx * 6.28 * 2 + t * 1.8 + phaseOffset) * AMP * 0.6 * ampScale
          + Math.sin(fx * 6.28 * 4.7 + t * 2.7 + phaseOffset * 1.3) * AMP * 0.35 * ampScale
          + Math.sin(fx * 6.28 * 1.3 + t * 1.05) * AMP * 0.25 * ampScale;
        // Envelope: dampen toward edges so the line tapers naturally
        const envelope = Math.sin(fx * Math.PI);
        pts.push([x, MID + (y - MID) * envelope]);
      }
      // Build a smooth path using quadratic curves through midpoints
      let d = `M${pts[0][0]},${pts[0][1]}`;
      for (let i = 1; i < pts.length - 1; i++) {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[i + 1];
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        d += ` Q${x1},${y1} ${mx},${my}`;
      }
      const last = pts[pts.length - 1];
      d += ` T${last[0]},${last[1]}`;
      return d;
    }

    let waveStart = performance.now();
    function waveTick() {
      const t = (performance.now() - waveStart) / 1000;
      // Update both wave layers; wave-2 is offset for parallax
      wavePaths.forEach((p) => {
        if (p.classList.contains('wave-2')) {
          p.setAttribute('d', buildPath(t, 1.8, 0.7));
        } else {
          p.setAttribute('d', buildPath(t, 0, 1));
        }
      });
      requestAnimationFrame(waveTick);
    }
    requestAnimationFrame(waveTick);
  }

  // ---- Carousel positioning + infinite wrap (no auto-scroll) ----
  function getCopyWidth() {
    return track.scrollWidth / 3;
  }
  function parkInMiddle() {
    track.scrollLeft = getCopyWidth();
  }
  requestAnimationFrame(parkInMiddle);
  window.addEventListener('load', parkInMiddle);

  // No auto-drift — user controls everything via swipe / drag / arrows.
  // Wrap invisibly when crossing copy boundaries
  track.addEventListener('scroll', () => {
    const copyW = getCopyWidth();
    if (copyW <= 0) return;
    if (track.scrollLeft >= copyW * 2) {
      track.scrollLeft -= copyW;
    } else if (track.scrollLeft < copyW * 0.5) {
      track.scrollLeft += copyW;
    }
  });

  // ---- Desktop arrows (Option 1) ----
  // Inject prev/next buttons into the carousel-wrap (CSS hides them on touch devices).
  const carouselWrap = document.querySelector('.carousel-wrap');
  if (carouselWrap) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-arrow prev';
    prevBtn.setAttribute('aria-label', 'Previous tiles');
    prevBtn.innerHTML = '‹';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-arrow next';
    nextBtn.setAttribute('aria-label', 'Next tiles');
    nextBtn.innerHTML = '›';

    carouselWrap.appendChild(prevBtn);
    carouselWrap.appendChild(nextBtn);

    function getTileWidth() {
      const tile = track.querySelector('.tile');
      if (!tile) return 320;
      // tile width + gap
      return tile.getBoundingClientRect().width + 14;
    }

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -getTileWidth(), behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: getTileWidth(), behavior: 'smooth' });
    });
  }

  // ---- Click-and-drag for desktop (Option 3) ----
  // Mouse-down + drag scrolls the track, like swiping on mobile.
  let isDragging = false;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;
  let dragMoved = false;

  track.addEventListener('mousedown', (e) => {
    // Only main button, and skip if clicking on an arrow or pill
    if (e.button !== 0) return;
    if (e.target.closest('.carousel-arrow') || e.target.closest('.pill')) return;
    isDragging = true;
    dragMoved = false;
    dragStartX = e.pageX;
    dragStartScrollLeft = track.scrollLeft;
    track.style.cursor = 'grabbing';
    // Prevent text selection during drag
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.pageX - dragStartX;
    if (Math.abs(dx) > 4) dragMoved = true;
    track.scrollLeft = dragStartScrollLeft - dx;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = '';
  });

  // If the user dragged, suppress the click that would otherwise open the tile's link
  track.addEventListener('click', (e) => {
    if (dragMoved) {
      e.stopPropagation();
      e.preventDefault();
      dragMoved = false;
    }
  }, true); // capture phase, runs before tile's own click handler


  const modal = document.getElementById('modal');
  const modalMedia = document.getElementById('modal-media');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc  = document.getElementById('modal-desc');
  const modalLink  = document.getElementById('modal-link');

  function openModal(index) {
    const tile = data.tiles[index];
    if (!tile) return;
    modalMedia.innerHTML = '';

    const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(tile.media || '');
    let mediaEl;
    if (isVideo) {
      mediaEl = document.createElement('video');
      mediaEl.src = tile.media;
      mediaEl.muted = true;
      mediaEl.loop = true;
      mediaEl.playsInline = true;
      mediaEl.autoplay = true;
      mediaEl.setAttribute('muted', '');
      mediaEl.setAttribute('playsinline', '');
      mediaEl.setAttribute('webkit-playsinline', '');
      mediaEl.setAttribute('autoplay', '');
      mediaEl.setAttribute('loop', '');
      const tryPlay = () => {
        const p = mediaEl.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      };
      mediaEl.addEventListener('loadedmetadata', tryPlay);
      mediaEl.addEventListener('canplay', tryPlay);
    } else {
      mediaEl = document.createElement('img');
      mediaEl.src = tile.media;
      mediaEl.alt = tile.title || '';
    }
    modalMedia.appendChild(mediaEl);

    modalTitle.textContent = tile.title || '';
    modalDesc.textContent  = tile.description || '';
    modalLink.href = tile.link || '#';

    // Render icon-only CTA. Falls back to "Open link →" if no icon defined.
    const iconSvg = tile.icon && ICONS[tile.icon];
    if (iconSvg) {
      modalLink.innerHTML = iconSvg;
      modalLink.classList.add('icon-only');
      modalLink.setAttribute('aria-label', `Open ${tile.label || 'link'}`);
    } else {
      modalLink.textContent = 'Open link →';
      modalLink.classList.remove('icon-only');
      modalLink.removeAttribute('aria-label');
    }

    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalMedia.innerHTML = '';
  }

  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
  });
})();