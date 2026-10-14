// Вся личная информация находится в love-content.js.
(() => {
  const c = window.LOVE_CONTENT;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const src = name => 'images/us/' + encodeURIComponent(name) + '.webp';
  const photo = (item) => '<button class="photo-open" type="button" data-photo="' + esc(item.image) + '" data-alt="' + esc(item.alt) + '" aria-label="Открыть: ' + esc(item.alt) + '"><img src="' + src(item.image) + '" alt="' + esc(item.alt) + '" width="1050" height="1400" loading="lazy"></button>';
  const texts = {'#invite-title':c.intro,'#invite-note':c.introNote,'#album-title':c.title,'#greeting':c.greeting,'#subtitle':c.subtitle,'#date':c.date,'#dedication':c.dedication,'#letter-title':c.letterTitle,'#signature':c.signature,'#ending':c.ending};
  Object.entries(texts).forEach(([id,text]) => $(id).textContent = text);
  document.title = c.title;
  $('#memories').innerHTML = c.memories.map((m,i) => '<article class="memory"><div class="memory__photo">' + photo(m) + '</div><span class="memory__number">' + String(i+1).padStart(2,'0') + ' / МЫ СОХРАНИМ ЭТО</span><h3>' + esc(m.title) + '</h3><p>' + esc(m.text) + '</p></article>').join('');
  $('#details').innerHTML = c.details.map(m => '<figure class="detail">' + photo(m) + '<figcaption class="handwritten">' + esc(m.caption) + '</figcaption></figure>').join('');
  $('#funny').innerHTML = c.funny.map(m => '<figure class="fun-card">' + photo(m) + '<figcaption class="handwritten">' + esc(m.caption) + '</figcaption></figure>').join('');
  $('#letter-body').innerHTML = c.letter.map(p => '<p>' + esc(p) + '</p>').join('');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function enter() { $('#invitation').hidden = true; $('#album').hidden = false; $('#album-title').focus({preventScroll:true}); window.scrollTo(0,0); }
  $('#enter').addEventListener('click', enter);
  $('.skip').addEventListener('click', event => {event.preventDefault(); enter();});
  function setLetter(open) { $('#letter-paper').hidden = !open; $('#letter-toggle').setAttribute('aria-expanded',String(open)); $('#letter-toggle').hidden = open; if(open) { $('#letter-paper').focus({preventScroll:true}); $('#letter-paper').scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'}); } else $('#letter-toggle').focus(); }
  $('#letter-toggle').addEventListener('click',()=>setLetter(true));
  $('#letter-close').addEventListener('click',()=>setLetter(false));
  for(const [id,direction] of [['#fun-prev',-1],['#fun-next',1]]) $(id).addEventListener('click',()=>$('#funny').scrollBy({left:direction * ($('#funny').querySelector('figure').getBoundingClientRect().width + 22),behavior:reduced?'instant':'smooth'}));
  const viewer=$('#viewer'); let lastFocus,savedScroll=0;
  document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{
    lastFocus=button; savedScroll=scrollY; $('#viewer-image').src=src(button.dataset.photo); $('#viewer-image').alt=button.dataset.alt; $('#viewer-caption').textContent=button.dataset.alt;
    document.body.style.position='fixed';document.body.style.top=-savedScroll+'px';document.body.style.width='100%';viewer.showModal(); $('.viewer-close').focus();
  }));
  $('.viewer-close').addEventListener('click',()=>viewer.close());
  viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close();});
  viewer.addEventListener('close',()=>{document.body.style.position='';document.body.style.top='';document.body.style.width='';window.scrollTo({top:savedScroll,behavior:'instant'});lastFocus?.focus({preventScroll:true});});
})();
