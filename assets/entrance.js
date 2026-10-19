'use strict';
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  try { paused = localStorage.getItem('bravo-motion-paused') === 'true'; } catch {}
  root.classList.toggle('motion-paused', paused || reduced.matches);
  reduced.addEventListener?.('change', () => root.classList.toggle('motion-paused', paused || reduced.matches));
  // Preserve old direct section links to the site root.
  const validHashes = ['#inicio', '#servicos', '#experiencia', '#detalhes', '#duvidas'];
  if (validHashes.includes(location.hash)) {
    const target = new URL('barbearia.html', location.href);
    target.search = location.search;
    target.hash = location.hash;
    location.replace(target.href);
    return;
  }
  let timer;
  let leaving = false;
  function reset() {
    clearTimeout(timer);
    leaving = false;
    root.classList.remove('entry-leaving');
    document.querySelectorAll('[aria-busy]').forEach(link => link.removeAttribute('aria-busy'));
  }
  document.querySelectorAll('a[data-enter]').forEach(link => link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    if (paused || reduced.matches || 'onpageswap' in window) return;
    event.preventDefault();
    if (leaving) return;
    leaving = true;
    root.classList.add('entry-leaving');
    link.setAttribute('aria-busy', 'true');
    timer = setTimeout(() => { location.assign(link.href); setTimeout(reset, 1200); }, 260);
  }));
  window.addEventListener('pageshow', reset);
})();
