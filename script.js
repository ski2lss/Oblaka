// Спільна логіка головної сторінки та меню. Без бібліотек і збірки.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const money = value => new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 2 }).format(value) + ' ₴';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const dialog = document.createElement('dialog');
dialog.className = 'dialog';
dialog.setAttribute('aria-labelledby', 'dialog-title');
dialog.innerHTML = '<button class="dialog__close" type="button" aria-label="Закрити">×</button><div class="dialog__content"></div>';
document.body.append(dialog);
let returnFocus, savedScroll = 0;
function openDialog(content) {
  $('.dialog__content', dialog).innerHTML = content;
  if (!dialog.open) {
    returnFocus = document.activeElement;
    savedScroll = scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScroll}px`;
    document.body.style.width = '100%';
    dialog.showModal();
    $('.dialog__close', dialog).focus();
  }
  dialog.scrollTop = 0;
}
$('.dialog__close', dialog).addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
dialog.addEventListener('close', () => {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  const previous = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo(0, savedScroll);
  document.documentElement.style.scrollBehavior = previous;
  returnFocus?.focus({ preventScroll: true });
});
const toast = document.createElement('p');
toast.className = 'toast'; toast.hidden = true; toast.setAttribute('role', 'status'); document.body.append(toast);
let toastTimer;
function notify(text) { toast.textContent = text; toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 3500); }
$$('.contact-row__copy').forEach(button => button.addEventListener('click', async () => {
  const text = $('.contact-row__value', button.closest('.contact-row')).textContent.trim();
  try { await navigator.clipboard.writeText(text); notify('Скопійовано'); }
  catch { openDialog(`<div class="dialog__body dialog__body--plain"><h2 id="dialog-title">Скопіюйте контакт</h2><p>Натисніть і утримуйте текст, щоб скопіювати його.</p><p>${escapeHTML(text)}</p></div>`); }
}));
$('[data-home-search]')?.addEventListener('click', () => { location.href = 'menu.html?search=1'; });
$$('[data-drawer]').forEach(button => button.addEventListener('click', () => openDialog(`<nav class="dialog__body dialog__body--plain" aria-labelledby="dialog-title"><h2 id="dialog-title">Облака</h2><a class="drawer-link" href="index.html">Головна</a><a class="drawer-link" href="menu.html#food">Меню</a><a class="drawer-link" href="menu.html#bar">Бар</a><a class="drawer-link" href="menu.html#cocktails">Коктейльна карта</a><a class="drawer-link" href="menu.html#wine">Винна карта</a><a class="drawer-link" href="index.html#contacts">Контакти</a></nav>`)));
$('[data-info]')?.addEventListener('click', () => openDialog('<div class="dialog__body dialog__body--plain"><h2 id="dialog-title">Ресторан «Облака»</h2><p>Одеса, вул. Катерининська, 27</p><p>Щодня: 11:00 – 23:00</p><a class="drawer-link" href="tel:+380984530404">+380 98 453 0404</a><a class="drawer-link" href="index.html#contacts">Усі контакти</a></div>'));
dialog.addEventListener('click', event => { if (event.target.closest('a')) dialog.close(); });
const photos = $$('[data-photo]');
function showPhoto(index) {
  index = (index + photos.length) % photos.length;
  openDialog(`<img class="dialog__image" src="${photos[index].dataset.photo}" alt="Фото ресторану ${index + 1}"><div class="dialog__body"><h2 id="dialog-title">Наші фотографії</h2><p>${index + 1} / ${photos.length}</p><div class="gallery-nav"><button type="button" data-photo-index="${index - 1}">← Попереднє</button><button type="button" data-photo-index="${index + 1}">Наступне →</button></div></div>`);
}
photos.forEach((button, index) => button.addEventListener('click', () => showPhoto(index)));
dialog.addEventListener('click', event => { const button = event.target.closest('[data-photo-index]'); if (button) { showPhoto(Number(button.dataset.photoIndex)); $('.dialog__close', dialog).focus(); } });

// Каталог: відкриття страв, пошук і активна категорія під час прокрутки.
if (window.MENU_DATA) {
  const dishes = new Map(MENU_DATA.flatMap(section => section.categories.flatMap(category => category.items.map(item => [item.id, item]))));
  $$('[data-open-dish]').forEach(button => button.addEventListener('click', () => {
    const item = dishes.get(button.dataset.openDish);
    if (item.surprise) {
      openDialog(`<a class="surprise-portrait-link" href="love.html" aria-label="Открыть сюрприз"><img class="dialog__image" src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}"></a><div class="dialog__body surprise-body"><h2 id="dialog-title" class="surprise-message"><img class="surprise-you" src="images/us/pointing-at-you.png" alt="Ты"><span>${escapeHTML(item.modalDescription || item.description)}</span></h2><a class="surprise-link" href="love.html">Детальніше →</a></div>`);
      return;
    }
    openDialog(`${item.image ? `<img class="dialog__image" src="${item.image}" alt="${escapeHTML(item.name)}">` : ''}<div class="dialog__body ${item.image ? '' : 'dialog__body--plain'}"><h2 id="dialog-title">${escapeHTML(item.name)}</h2><p class="dish__price">${money(item.price)}</p><p>${escapeHTML(item.description)}</p><p class="dish__weight">${escapeHTML(item.weight)}</p>${item.available === false ? '<p>Тимчасово недоступно</p>' : ''}${item.options.map(option => `<div class="dialog__options"><h3>${escapeHTML(option.name)}</h3><ul>${option.items.map(value => `<li>${escapeHTML(value.name)}${value.price ? ' · +' + money(value.price) : ''}</li>`).join('')}</ul></div>`).join('')}</div>`);
  }));
  const header = $('.menu-header');
  new ResizeObserver(() => document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px')).observe(header);
  const input = $('#dish-search'), searchForm = $('#menu-search'), searchToggle = $('[data-search-toggle]');
  function setSearch(open) { searchForm.hidden = !open; searchToggle.setAttribute('aria-expanded', String(open)); if (open) input.focus(); else { input.value = ''; filterMenu(); searchToggle.focus(); } }
  searchToggle.addEventListener('click', () => setSearch(searchForm.hidden));
  $('[data-search-clear]').addEventListener('click', () => setSearch(false));
  searchForm.addEventListener('submit', event => event.preventDefault());
  input.addEventListener('keydown', event => { if (event.key === 'Escape') setSearch(false); });
  function filterMenu() {
    const query = input.value.trim().toLocaleLowerCase('uk'); let count = 0;
    $$('[data-dish]').forEach(card => { const item = dishes.get(card.dataset.dish); card.hidden = !(item.name + ' ' + item.description).toLocaleLowerCase('uk').includes(query); if (!card.hidden) count++; });
    $$('.menu-category').forEach(category => { category.hidden = !$$('[data-dish]', category).some(card => !card.hidden); });
    $$('.menu-section').forEach(section => { section.hidden = !$$('.menu-category', section).some(category => !category.hidden); });
    const status = $('.search-status'); status.hidden = !query; status.textContent = count ? `Знайдено: ${count}` : 'Нічого не знайдено. Спробуйте іншу назву або інгредієнт.';
    $$('.category-tabs a').forEach(link => { link.dataset.empty = String(document.getElementById(link.dataset.categoryLink).hidden); });
    window.scrollTo({ top: 0, behavior: 'instant' }); updateActive();
  }
  input.addEventListener('input', filterMenu);
  let currentCategory = '', currentSection = '';
  function revealHorizontal(link) { if (!link) return; const parent = link.parentElement; const left = link.offsetLeft - parent.offsetLeft; if (left < parent.scrollLeft || left + link.offsetWidth > parent.scrollLeft + parent.clientWidth) parent.scrollTo({ left: left - 16, behavior: reducedMotion ? 'instant' : 'smooth' }); }
  function updateActive() {
    const sections = $$('.menu-section').filter(section => !section.hidden);
    let activeSection = sections[0];
    for (const section of sections) { if (section.getBoundingClientRect().top <= header.offsetHeight + 30) activeSection = section; else break; }
    const categories = activeSection ? $$('.menu-category', activeSection).filter(c => !c.hidden) : [];
    let active = categories[0];
    for (const category of categories) { if (category.getBoundingClientRect().top <= header.offsetHeight + 45) active = category; else break; }
    if (!active) return;
    const section = active.dataset.section;
    $$('.category-tabs a').forEach(link => { link.hidden = link.dataset.section !== section || link.dataset.empty === 'true'; });
    if (currentSection !== section) { currentSection = section; $$('.section-tabs a').forEach(link => { if (link.dataset.sectionLink === section) link.setAttribute('aria-current','true'); else link.removeAttribute('aria-current'); }); revealHorizontal($(`.section-tabs a[data-section-link="${section}"]`)); }
    if (currentCategory !== active.id) { currentCategory = active.id; $$('.category-tabs a').forEach(link => { if (link.dataset.categoryLink === active.id) link.setAttribute('aria-current','true'); else link.removeAttribute('aria-current'); }); revealHorizontal($(`.category-tabs a[data-category-link="${active.id}"]`)); }
    $('.back-to-top').hidden = scrollY < 600;
  }
  let pending = false;
  addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(() => { updateActive(); pending = false; }); } }, { passive: true });
  $('.back-to-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' }));
  $$('.section-tabs a, .category-tabs a').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); if (input.value) { input.value = ''; filterMenu(); }
    const target = document.getElementById(link.hash.slice(1)); history.replaceState(null, '', link.hash); target?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
  }));
  if (new URLSearchParams(location.search).has('search')) setSearch(true);
  function followHash() { const target = document.getElementById(location.hash.slice(1)); if (target) target.scrollIntoView({ behavior: 'instant' }); updateActive(); }
  addEventListener('hashchange', followHash);
  document.fonts.ready.then(followHash);
  updateActive();
}
