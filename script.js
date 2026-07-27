// ============================================================
// JD Decoration | Event Management — Shared Behaviour
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile drawer ---------- */
  const burger = document.querySelector('.burger');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.drawer-overlay');
  const drawerClose = document.querySelector('.drawer-close');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('show');
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
  }
  if (burger) burger.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);
  document.querySelectorAll('.mobile-drawer a').forEach(a => a.addEventListener('click', closeDrawer));

  /* ---------- Reveal on scroll (progressive enhancement, never hides content) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    document.documentElement.classList.add('js-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => io.observe(el));
    // Failsafe: if anything is somehow never observed as intersecting, reveal it anyway.
    setTimeout(() => revealEls.forEach(el => el.classList.add('in-view')), 2500);
  }

  /* ---------- Enquiry form ---------- */
  const form = document.getElementById('enquiry-form');
  if (form) {
    const note = document.getElementById('form-note');
    const WHATSAPP_NUMBER = '917812824129';
    const EMAIL = 'jdeventsdecoration@gmail.com';

    function buildMessage() {
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const eventType = form.eventType.value;
      const eventDate = form.eventDate.value;
      const guests = form.guests.value.trim();
      const details = form.details.value.trim();

      let msg = `Hello JD Decoration, I'd like to enquire about an event.%0A%0A`;
      msg += `*Name:* ${name}%0A`;
      msg += `*Phone:* ${phone}%0A`;
      msg += `*Event Type:* ${eventType}%0A`;
      if (eventDate) msg += `*Date:* ${eventDate}%0A`;
      if (guests) msg += `*Guest Count:* ${guests}%0A`;
      if (details) msg += `*Details:* ${details}%0A`;
      return msg;
    }

    function validate() {
      if (!form.name.value.trim() || !form.phone.value.trim() || !form.eventType.value) {
        note.textContent = 'Please fill in your name, phone number and event type.';
        note.style.color = '#a13a3a';
        return false;
      }
      return true;
    }

    const waBtn = document.getElementById('send-whatsapp');
    const mailBtn = document.getElementById('send-email');

    if (waBtn) {
      waBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!validate()) return;
        const message = buildMessage();
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
        note.style.color = 'var(--mocha)';
        note.textContent = 'Opening WhatsApp with your enquiry filled in…';
      });
    }

    if (mailBtn) {
      mailBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!validate()) return;
        const subject = encodeURIComponent(`Event Enquiry — ${form.eventType.value}`);
        const bodyText = buildMessage().replace(/%0A/g, '\n').replace(/\*/g, '');
        window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
        note.style.color = 'var(--mocha)';
        note.textContent = 'Opening your email app with the enquiry ready to send…';
      });
    }
  }

  /* ---------- Gallery filter (gallery.html) ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const tiles = document.querySelectorAll('.full-gallery .g-tile');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        tiles.forEach(tile => {
          if (cat === 'all' || tile.dataset.cat === cat) {
            tile.style.display = '';
          } else {
            tile.style.display = 'none';
          }
        });
      });
    });
  }

  /* ---------- Gallery lightbox (gallery.html) ---------- */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox && tiles.length) {
    const media = lightbox.querySelector('.lightbox-media');
    const caption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    let currentIndex = 0;

    function visibleTiles() {
      return Array.from(tiles).filter(t => t.style.display !== 'none');
    }

    function renderTile(tile) {
      media.innerHTML = '';
      const img = tile.querySelector('img');
      if (img) {
        const clone = img.cloneNode(true);
        media.appendChild(clone);
      } else {
        const svg = tile.querySelector('svg');
        if (svg) media.appendChild(svg.cloneNode(true));
      }
      caption.textContent = tile.dataset.label || '';
    }

    function openLightbox(tile) {
      const list = visibleTiles();
      currentIndex = list.indexOf(tile);
      if (currentIndex === -1) currentIndex = 0;
      renderTile(list[currentIndex]);
      lightbox.classList.add('open');
      document.body.classList.add('lightbox-locked');
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.classList.remove('lightbox-locked');
    }

    function step(delta) {
      const list = visibleTiles();
      if (!list.length) return;
      currentIndex = (currentIndex + delta + list.length) % list.length;
      renderTile(list[currentIndex]);
    }

    tiles.forEach(tile => {
      tile.addEventListener('click', () => openLightbox(tile));
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(tile);
        }
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
  }

  /* ---------- Active nav link on scroll (index only) ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('nav.links a[href^="#"]');
  if (sections.length && navLinks.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        const link = document.querySelector(`nav.links a[href="#${id}"]`);
        if (entry.isIntersecting && link) {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

});
