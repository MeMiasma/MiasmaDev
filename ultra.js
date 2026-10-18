/* MeMiasma Ultra — command palette, spotlight polish and keyboard navigation. */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // Pointer-aware light follows the cursor inside selected surfaces, not the whole page.
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.service-card,.review-stat-card,.process-step,.stack-item').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
      }, { passive: true });
    });
  }

  const actions = [
    { title: 'Главная', sub: 'Вернуться к началу страницы', icon: '⌂', keys: 'главная home', run: () => go('#home') },
    { title: 'Услуги', sub: 'Посмотреть направления разработки', icon: '⌘', keys: 'услуги services', run: () => go('#services') },
    { title: 'Проекты', sub: 'Открыть портфолио работ', icon: '▤', keys: 'проекты работы кейсы projects', run: () => go('#projects') },
    { title: 'Отзывы', sub: 'Мнения клиентов и рейтинг', icon: '✳', keys: 'отзывы reviews рейтинг', run: () => go('#reviews') },
    { title: 'Процесс работы', sub: 'Этапы от идеи до запуска', icon: '↗', keys: 'процесс process этапы', run: () => go('#process') },
    { title: 'Обо мне', sub: 'Опыт и технологический стек', icon: '◉', keys: 'обо мне about стек технологии', run: () => go('#about') },
    { title: 'Связаться в Telegram', sub: 'Открыть диалог с MeMiasma', icon: '↗', keys: 'связаться контакт telegram написать', run: () => window.open('https://t.me/MeMiasma', '_blank', 'noopener,noreferrer') },
    { title: 'GitHub', sub: 'Открыть профиль разработчика', icon: '⌁', keys: 'github код репозитории', run: () => window.open('https://github.com/MeMiasma', '_blank', 'noopener,noreferrer') },
    { title: 'Найти проект', sub: 'Перейти к поиску и фильтрам проектов', icon: '⌕', keys: 'поиск найти search фильтр', run: () => { go('#projects'); setTimeout(() => document.querySelector('#searchInput')?.focus(), reduceMotion ? 0 : 350); } }
  ];
  let activeIndex = 0;
  let backdrop, input, list, previousFocus;

  function go(selector) {
    const target = document.querySelector(selector);
    if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    closePalette();
  }
  function buildPalette() {
    backdrop = document.createElement('div');
    backdrop.className = 'ultra-palette-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = `<section class="ultra-palette" role="dialog" aria-modal="true" aria-label="Быстрая навигация"><div class="ultra-palette-top"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><input class="ultra-palette-input" type="text" placeholder="Куда отправимся? Начни вводить…" aria-label="Поиск по командам" autocomplete="off"/><span class="ultra-palette-hint">ESC</span></div><div class="ultra-palette-label">Быстрые действия</div><div class="ultra-palette-list" role="listbox"></div><div class="ultra-palette-footer"><span><b class="ultra-kbd">↑</b><b class="ultra-kbd">↓</b> навигация</span><span><b class="ultra-kbd">↵</b> открыть</span><span><b class="ultra-kbd">ESC</b> закрыть</span></div></section>`;
    document.body.appendChild(backdrop);
    input = backdrop.querySelector('input'); list = backdrop.querySelector('.ultra-palette-list');
    input.addEventListener('input', () => { activeIndex = 0; renderActions(); });
    input.addEventListener('keydown', onPaletteKeydown);
    backdrop.addEventListener('pointerdown', event => { if (event.target === backdrop) closePalette(); });
    renderActions();
  }
  function renderActions() {
    const query = input.value.trim().toLocaleLowerCase('ru');
    const filtered = actions.filter(a => `${a.title} ${a.sub} ${a.keys}`.toLocaleLowerCase('ru').includes(query));
    activeIndex = Math.min(activeIndex, Math.max(0, filtered.length - 1));
    list.replaceChildren();
    if (!filtered.length) { const empty = document.createElement('div'); empty.className = 'ultra-palette-empty'; empty.textContent = 'Ничего не найдено. Попробуй другой запрос.'; list.appendChild(empty); return; }
    filtered.forEach((action, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'ultra-palette-item'; button.setAttribute('role', 'option'); button.setAttribute('aria-selected', index === activeIndex ? 'true' : 'false');
      const icon = document.createElement('span'); icon.className = 'ultra-palette-icon'; icon.textContent = action.icon;
      const copy = document.createElement('span'); copy.className = 'ultra-palette-copy';
      const title = document.createElement('span'); title.className = 'ultra-palette-title'; title.textContent = action.title;
      const sub = document.createElement('span'); sub.className = 'ultra-palette-sub'; sub.textContent = action.sub;
      const enter = document.createElement('span'); enter.className = 'ultra-palette-enter'; enter.textContent = '↵';
      copy.append(title, sub); button.append(icon, copy, enter);
      button.addEventListener('mouseenter', () => { activeIndex = index; syncActive(); });
      button.addEventListener('click', () => { action.run(); closePalette(); }); list.appendChild(button);
    });
  }
  function syncActive() {
    [...list.querySelectorAll('.ultra-palette-item')].forEach((item, i) => item.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false'));
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }
  function onPaletteKeydown(event) {
    const items = [...list.querySelectorAll('.ultra-palette-item')];
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); if (items.length) { activeIndex = (activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; syncActive(); } }
    else if (event.key === 'Enter') { event.preventDefault(); items[activeIndex]?.click(); }
    else if (event.key === 'Escape') { event.preventDefault(); closePalette(); }
  }
  function openPalette() {
    if (!backdrop) buildPalette();
    previousFocus = document.activeElement;
    backdrop.classList.add('is-open'); backdrop.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
    input.value = ''; activeIndex = 0; renderActions(); requestAnimationFrame(() => input.focus());
  }
  function closePalette() {
    if (!backdrop) return;
    backdrop.classList.remove('is-open'); backdrop.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  }
  document.addEventListener('keydown', event => {
    const target = event.target;
    const typing = target && (target.matches('input,textarea,select') || target.isContentEditable);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openPalette(); }
    else if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); openPalette(); }
    else if (event.key === 'Escape' && backdrop?.classList.contains('is-open')) closePalette();
  });
  // Hint the shortcut without changing existing navigation or copy.
  const nav = document.querySelector('.nav');
  if (nav) {
    const hint = document.createElement('button'); hint.type = 'button'; hint.className = 'ultra-command-trigger'; hint.setAttribute('aria-label', 'Открыть быструю навигацию'); hint.title = 'Быстрая навигация (Ctrl/⌘ + K)'; hint.innerHTML = '<span aria-hidden="true">⌕</span><kbd>⌘ K</kbd>';
    hint.addEventListener('click', openPalette); nav.insertBefore(hint, nav.firstChild);
  }
})();
