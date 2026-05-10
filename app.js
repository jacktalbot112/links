(function () {
  const data = window.PROFILE_DATA;
  if (!data) return;

  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const nameEl = document.getElementById('profile-name');
  const bioEl  = document.getElementById('profile-bio');
  if (nameEl) nameEl.textContent = data.profile.name;
  if (bioEl)  bioEl.textContent  = ' ' + data.profile.bio;
  document.title = data.profile.name;

  const track = document.getElementById('carousel-track');

  function buildTile(tile, index, isClone) {
    const el = document.createElement('article');
    el.className = 'tile';
    el.setAttribute('role', 'listitem');
    if (isClone) el.setAttribute('aria-hidden', 'true');

    const img = document.createElement('img');
    img.className = 'tile-media';
    img.src = tile.media;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    el.appendChild(img);

    const pills = document.createElement('div');
    pills.className = 'tile-pills';
    const labelPill = document.createElement('span');
    labelPill.className = 'pill';
    labelPill.textContent = tile.label || '';
    pills.appendChild(labelPill);

    const seeMore = document.createElement('button');
    seeMore.className = 'pill';
    seeMore.textContent = 'See More';
    seeMore.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(index);
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
  data.tiles.forEach((t, i) => track.appendChild(buildTile(t, i, false))); // copy A
  data.tiles.forEach((t, i) => track.appendChild(buildTile(t, i, true)));  // copy B (the "real" one user sees)
  data.tiles.forEach((t, i) => track.appendChild(buildTile(t, i, true)));  // copy C

  // ---- Infinite auto-scroll + swipe ----
  let autoScrollPaused = true;  // start paused; un-pause once parked
  let lastTimestamp = null;
  const PIXELS_PER_SECOND = 40;
  let isTouching = false;
  let lastScrollTime = 0;

  function getCopyWidth() {
    return track.scrollWidth / 3;
  }
  function parkInMiddle() {
    track.scrollLeft = getCopyWidth();
    autoScrollPaused = false;
  }
  requestAnimationFrame(parkInMiddle);
  window.addEventListener('load', parkInMiddle);

  // Auto-drift loop. Only writes scrollLeft when:
  //  - not paused
  //  - user isn't touching
  //  - momentum scroll has settled (no scroll event for 200ms)
  function tick(ts) {
    if (lastTimestamp === null) lastTimestamp = ts;
    const dt = (ts - lastTimestamp) / 1000;
    lastTimestamp = ts;

    const settled = (performance.now() - lastScrollTime) > 200;
    if (!autoScrollPaused && !isTouching && settled) {
      track.scrollLeft = track.scrollLeft + PIXELS_PER_SECOND * dt;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Wrap invisibly when crossing copy boundaries
  track.addEventListener('scroll', () => {
    lastScrollTime = performance.now();
    const copyW = getCopyWidth();
    if (copyW <= 0) return;
    if (track.scrollLeft >= copyW * 2) {
      track.scrollLeft -= copyW;
    } else if (track.scrollLeft < copyW * 0.5) {
      track.scrollLeft += copyW;
    }
  });

  // Touch — pause flag only; momentum is allowed to coast freely
  track.addEventListener('touchstart', () => {
    isTouching = true;
    lastTimestamp = null;
  }, { passive: true });
  track.addEventListener('touchend', () => {
    isTouching = false;
    lastTimestamp = null;
  }, { passive: true });

  // Desktop hover
  track.addEventListener('mouseenter', () => { isTouching = true; });
  track.addEventListener('mouseleave', () => { isTouching = false; lastTimestamp = null; });


  const modal = document.getElementById('modal');
  const modalMedia = document.getElementById('modal-media');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc  = document.getElementById('modal-desc');
  const modalLink  = document.getElementById('modal-link');

  function openModal(index) {
    const tile = data.tiles[index];
    if (!tile) return;
    modalMedia.innerHTML = '';
    const img = document.createElement('img');
    img.src = tile.media;
    img.alt = tile.title || '';
    modalMedia.appendChild(img);
    modalTitle.textContent = tile.title || '';
    modalDesc.textContent  = tile.description || '';
    modalLink.href = tile.link || '#';
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