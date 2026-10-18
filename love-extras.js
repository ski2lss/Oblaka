// Музей, записки и мини-игра. Тексты редактируются в love-content.js.
(() => {
  const c = window.LOVE_EXTRAS;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const img = name => 'images/us/' + encodeURIComponent(name) + '.webp';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dialog = $('#extra-dialog');
  let focusBack, savedY;
  function openExtra(title, text, image) {
    focusBack = document.activeElement; savedY = scrollY;
    $('#extra-content').innerHTML = (image ? '<img src="'+img(image)+'" alt="'+esc(title)+'">' : '<span class="note-heart" aria-hidden="true">♡</span>') + '<h2 id="extra-title">'+esc(title)+'</h2><p>'+esc(text)+'</p><span class="handwritten">от меня — тебе</span>';
    document.body.style.position='fixed'; document.body.style.top=-savedY+'px'; document.body.style.width='100%';
    dialog.showModal(); $('.extra-close').focus();
  }
  $('.extra-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.style.position='';document.body.style.top='';document.body.style.width='';scrollTo({top:savedY,behavior:'instant'});focusBack?.focus({preventScroll:true});});
  $('#pocket-grid').innerHTML=c.pockets.map((m,i)=>'<button type="button" class="pocket" data-pocket="'+i+'"><span class="pocket-mark" aria-hidden="true">'+m.mark+'</span><span class="eyebrow">ОТКРОЙ, КОГДА</span><span class="pocket-title">'+esc(m.title)+'</span><span class="pocket-open">Письмо для тебя ↗</span></button>').join('');
  document.querySelectorAll('[data-pocket]').forEach(b=>b.addEventListener('click',()=>{const m=c.pockets[Number(b.dataset.pocket)];openExtra(m.title,m.text);}));
  function picker(items, output, button) {let previous=-1;$(button).addEventListener('click',()=>{let choices=items.map((_,i)=>i).filter(i=>i!==previous);if(!choices.length)choices=[0];previous=choices[Math.floor(Math.random()*choices.length)];$(output).textContent=items[previous];});}
  picker(c.compliments,'#compliment','#compliment-button');
  let hearts=0;
  $('#secret-heart').addEventListener('click',()=>{hearts++;$('#secret-hint').textContent=hearts<5?'Еще '+(5-hearts)+'':'Наш маленький секрет ♡';if(hearts>=5){hearts=0;openExtra('Ты нашла секретный архив',c.secret,'monkey');}});
  // Игра: шесть пар, перемешивание Fisher–Yates, сброс отменяет отложенный ход.
  let first=null, busy=false, pairs=0, moves=0, resetTimer;
  const game=$('#memory-game');
  function score() {$('#game-score').textContent='Пары: '+pairs+' / 6 · Ходы: '+moves;}
  function resetGame() {
    clearTimeout(resetTimer);first=null;busy=false;pairs=0;moves=0;score();$('#game-win').hidden=true;
    const cards=['mirror','clay','sunset','kitty','monkey','close'].flatMap(name=>[name,name]);
    for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
    game.innerHTML=cards.map((name,i)=>'<button type="button" class="memory-tile" data-pair="'+name+'" aria-label="Карточка '+(i+1)+', открыть" aria-pressed="false"><span aria-hidden="true">♡</span><img src="'+img(name)+'" alt="" aria-hidden="true"></button>').join('');
  }
  function flip(b, open) {b.classList.toggle('flipped',open);b.setAttribute('aria-pressed',String(open));b.setAttribute('aria-label',open?'Открыта: '+({mirror:'фото в зеркале',clay:'керамика',sunset:'закат',kitty:'Hello Kitty',monkey:'обезьянка',close:'поцелуй'}[b.dataset.pair]):'Карточка '+([...game.children].indexOf(b)+1)+', открыть');}
  game.addEventListener('click',e=>{
    const b=e.target.closest('[data-pair]');if(!b||busy||b===first||b.classList.contains('matched'))return;
    flip(b,true);if(!first){first=b;return;}moves++;
    if(first.dataset.pair===b.dataset.pair){for(const card of [first,b]){card.classList.add('matched');card.setAttribute('aria-disabled','true');}pairs++;first=null;score();if(pairs===6)$('#game-win').hidden=false;}
    else {busy=true;score();const previous=first;resetTimer=setTimeout(()=>{flip(previous,false);flip(b,false);first=null;busy=false;},1000);}
  });
  $('#game-reset').addEventListener('click',resetGame);resetGame();

  const photoButtons = [...document.querySelectorAll('[data-photo]')];
  const uniquePhotos = [...new Map(photoButtons.map(button => [button.dataset.photo, button])).values()];
  let photoBag = [], previousPhoto;
  $('#random-photo').addEventListener('click', () => {
    if (!photoBag.length) {
      photoBag = [...uniquePhotos];
      for (let i = photoBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [photoBag[i], photoBag[j]] = [photoBag[j], photoBag[i]];
      }
      if (photoBag.length > 1 && photoBag[photoBag.length - 1] === previousPhoto) {
        [photoBag[0], photoBag[photoBag.length - 1]] = [photoBag[photoBag.length - 1], photoBag[0]];
      }
    }
    previousPhoto = photoBag.pop();
    if (!previousPhoto) return;
    previousPhoto.click();
    $('#viewer').addEventListener('close', () => $('#random-photo').focus({preventScroll:true}), {once:true});
  });
})();
