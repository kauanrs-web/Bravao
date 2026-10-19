'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 901px)');
  let paused = false;
  try { paused = localStorage.getItem('bravo-motion-paused') === 'true'; } catch {}
  const canMove = () => !paused && !reduced.matches && !document.hidden;
  const running = new Set();
  function stopAnimations() {
    for (const stop of [...running]) stop();
    document.getAnimations?.().forEach(animation => { try { animation.finish(); } catch { animation.cancel(); } });
  }
  function updateMotion() {
    root.classList.toggle('motion-paused', paused || reduced.matches);
    $$('[data-motion-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(paused));
      button.textContent = paused ? 'Retomar animações' : 'Pausar animações';
    });
    if (!canMove()) stopAnimations();
    scheduleScroll();
  }
  $$('[data-motion-toggle]').forEach(button => button.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('bravo-motion-paused', String(paused)); } catch {}
    updateMotion();
  }));

  // The browser keeps ownership of scrolling. Only the reading indicator follows it.
  const header = $('.header');
  const progress = $('.reading-progress');
  const hero = $('.hero');
  const heroMedia = $('.hero-media');
  const mobileCta = $('.mobile-cta');
  const nav = $('#main-nav');
  const sections = ['inicio', 'servicos', 'experiencia'].map(id => document.getElementById(id)).filter(Boolean);
  let frame = 0;
  let currentSection = '';
  function placeNavIndicator() {
    const current = $('a[aria-current]', nav);
    if (!current) return;
    nav.style.setProperty('--nav-left', current.offsetLeft + 'px');
    nav.style.setProperty('--nav-width', current.offsetWidth + 'px');
  }
  function setSection(id) {
    if (id === currentSection) return;
    currentSection = id;
    $$('a[data-section]', nav).forEach(link => {
      if (link.dataset.section === id) link.setAttribute('aria-current', sections.length ? 'location' : 'page');
      else link.removeAttribute('aria-current');
    });
    placeNavIndicator();
  }
  function updateScroll() {
    frame = 0;
    const y = window.scrollY || 0;
    header.classList.toggle('scrolled', y > 30);
    const limit = Math.max(1, root.scrollHeight - window.innerHeight);
    progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, y / limit)) + ')';
    const threshold = Math.min(window.innerHeight * .28, 230);
    let id = document.body.dataset.page;
    for (const section of sections) if (section.getBoundingClientRect().top <= threshold) id = section.id;
    setSection(id);
    const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
    mobileCta?.classList.toggle('is-visible', hero ? heroBottom < 140 : y > 160);
    if (heroMedia) {
      const depth = canMove() && desktop.matches && heroBottom > 0 ? Math.min(y * .10, 70) : 0;
      heroMedia.style.setProperty('--hero-y', depth.toFixed(1) + 'px');
    }
  }
  function scheduleScroll() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', () => { placeNavIndicator(); placeTabIndicator(); scheduleScroll(); updateGallery(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAnimations(); else scheduleScroll(); });
  reduced.addEventListener?.('change', updateMotion);
  desktop.addEventListener?.('change', scheduleScroll);

  function closeMenu() {
    const menu = $('.menu-toggle');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menu');
    nav.classList.remove('is-open');
  }
  function scrollToHash(hash, smooth = true) {
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return false; }
    const target = document.getElementById(id);
    if (!target) return false;
    closeMenu();
    const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - (id === 'inicio' ? 0 : 16);
    window.scrollTo({ top: Math.max(0, top), behavior: smooth && canMove() ? 'smooth' : 'instant' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    return true;
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !url.hash) return;
    const samePage = url.pathname === location.pathname;
    const isHomeAlias = document.body.dataset.page === 'inicio' && /(?:\/|\/(?:index|barbearia)\.html)$/.test(url.pathname);
    if (!samePage && !isHomeAlias) return;
    if (!scrollToHash(url.hash)) return;
    event.preventDefault();
    if (location.hash !== url.hash) history.pushState(null, '', url.pathname + url.search + url.hash);
  });
  window.addEventListener('popstate', () => { if (location.hash) scrollToHash(location.hash, false); });
  window.addEventListener('pageshow', () => { closeMenu(); scheduleScroll(); });

  // All panels exist in HTML. Tabs enhance them only after their controls are ready.
  const tabList = $('.service-tabs');
  const tabs = $$('[data-service-tab]');
  const panels = $$('[data-service-panel]');
  let selectedService = 'corte';
  function placeTabIndicator() {
    if (!tabList) return;
    const active = $('#tab-' + selectedService);
    tabList.style.setProperty('--tab-left', active.offsetLeft + 'px');
    tabList.style.setProperty('--tab-width', active.offsetWidth + 'px');
  }
  function selectService(id, animate = true) {
    const panel = $('#panel-' + id);
    if (!panel) return;
    selectedService = id;
    tabs.forEach(tab => {
      const selected = tab.dataset.serviceTab === id;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(item => { item.hidden = item !== panel; });
    placeTabIndicator();
    if (animate && canMove() && panel.animate) {
      panel.getAnimations?.().forEach(animation => animation.cancel());
      panel.animate([{ opacity: .15, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
      const image = $('img', panel);
      image?.animate([{ transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 700, easing: 'cubic-bezier(.22,1,.36,1)' });
      const price = $('[data-price]', panel);
      animateNumber(price, Number(price.dataset.price), 650);
    }
  }
  if (tabList && tabs.length === panels.length) {
    tabList.setAttribute('role', 'tablist');
    tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      const panel = $('#panel-' + tab.dataset.serviceTab);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      tab.addEventListener('click', () => { if (tab.dataset.serviceTab !== selectedService) selectService(tab.dataset.serviceTab); });
      tab.addEventListener('keydown', event => {
        let next = null;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        selectService(tabs[next].dataset.serviceTab);
        tabs[next].focus();
      });
    });
    tabList.hidden = false;
    $('.service-panels').classList.add('tabs-ready');
    selectService('corte', false);
  }

  const numberStops = new WeakMap();
  function animateNumber(element, target, duration = 1300) {
    if (!element) return;
    numberStops.get(element)?.();
    const format = value => String(value).padStart(Number(element.dataset.pad) || 0, '0');
    if (!canMove()) { element.textContent = format(target); return; }
    element.style.display = 'inline-block';
    element.style.minWidth = element.getBoundingClientRect().width + 'px';
    let start = null, raf = 0;
    const finish = () => {
      cancelAnimationFrame(raf);
      element.textContent = format(target);
      running.delete(finish);
      numberStops.delete(element);
    };
    numberStops.set(element, finish);
    running.add(finish);
    function tick(time) {
      if (!canMove()) return finish();
      if (start === null) start = time;
      const fraction = Math.min(1, (time - start) / duration);
      element.textContent = format(Math.round(target * (1 - (1 - fraction) ** 3)));
      if (fraction < 1) raf = requestAnimationFrame(tick);
      else finish();
    }
    raf = requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        reveals.unobserve(entry.target);
      }
    }), { threshold: .08, rootMargin: '0px 0px -25px 0px' });
    $$('[data-reveal]').forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight && canMove()) element.classList.add('reveal-pending');
      reveals.observe(element);
    });
    const counters = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateNumber(entry.target, Number(entry.target.dataset.count));
      counters.unobserve(entry.target);
    }), { threshold: .6 });
    $$('[data-count]').forEach(element => counters.observe(element));
    window.addEventListener('scroll', () => {
      if (window.scrollY + window.innerHeight >= root.scrollHeight - 8) $$('[data-reveal]').forEach(el => el.classList.remove('reveal-pending'));
    }, { passive: true });
  }

  // Native horizontal scroll works with touch, trackpads, keyboard and these controls.
  const gallery = $('.gallery-track');
  const slides = $$('.gallery-item');
  const galleryPrev = $('[data-gallery-prev]');
  const galleryNext = $('[data-gallery-next]');
  let galleryIndex = 0, galleryFrame = 0;
  function updateGallery() {
    galleryFrame = 0;
    if (!gallery || !slides.length) return;
    const gap = parseFloat(getComputedStyle(gallery).gap) || 0;
    const step = slides[0].getBoundingClientRect().width + gap;
    const atEnd = gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 4;
    galleryIndex = atEnd ? slides.length - 1 : Math.min(slides.length - 1, Math.max(0, Math.round(gallery.scrollLeft / Math.max(1, step))));
    $('.gallery-current').textContent = String(galleryIndex + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    galleryPrev.disabled = galleryIndex === 0;
    galleryNext.disabled = galleryIndex === slides.length - 1;
  }
  function moveGallery(direction) {
    galleryIndex = Math.min(slides.length - 1, Math.max(0, galleryIndex + direction));
    const gap = parseFloat(getComputedStyle(gallery).gap) || 0;
    const left = galleryIndex * (slides[0].getBoundingClientRect().width + gap);
    gallery.scrollTo({ left, behavior: canMove() ? 'smooth' : 'instant' });
  }
  if (gallery) {
    $('.gallery-controls').hidden = false;
    galleryPrev.addEventListener('click', () => moveGallery(-1));
    galleryNext.addEventListener('click', () => moveGallery(1));
    gallery.addEventListener('scroll', () => { if (!galleryFrame) galleryFrame = requestAnimationFrame(updateGallery); }, { passive: true });
    gallery.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); moveGallery(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });
  }
  // A single expanded answer keeps mobile pages compact, while details remains native.
  $$('.faq-list details').forEach(detail => detail.addEventListener('toggle', () => {
    if (detail.open) $$('.faq-list details').forEach(other => { if (other !== detail) other.open = false; });
  }));

  updateMotion();
  updateScroll();
  updateGallery();
  document.fonts?.ready.then(() => { placeNavIndicator(); placeTabIndicator(); scheduleScroll(); updateGallery(); });
})();
