const SOURCE_PRIMARY='https://raw.githubusercontent.com/blivre/BibliaLivre/master/textos/f4/geral/';
const SOURCE_FALLBACK='https://cdn.jsdelivr.net/gh/blivre/BibliaLivre@master/textos/f4/geral/';
const BOOKS=[
['Gênesis','gen'],['Êxodo','exod'],['Levítico','lev'],['Números','num'],['Deuteronômio','deut'],['Josué','jos'],['Juízes','juiz'],['Rute','rute'],['1 Samuel','1sa'],['2 Samuel','2sa'],['1 Reis','1rs'],['2 Reis','2rs'],['1 Crônicas','1crn'],['2 Crônicas','2crn'],['Esdras','esd'],['Neemias','nee'],['Ester','est'],['Jó','jo'],['Salmos','sal'],['Provérbios','prov'],['Eclesiastes','ecl'],['Cânticos','cant'],['Isaías','isa'],['Jeremias','jer'],['Lamentações','lam'],['Ezequiel','eze'],['Daniel','dan'],['Oseias','ose'],['Joel','joel'],['Amós','amos'],['Obadias','oba'],['Jonas','jon'],['Miqueias','miq'],['Naum','naum'],['Habacuque','hab'],['Sofonias','sof'],['Ageu','ageu'],['Zacarias','zac'],['Malaquias','mal'],['Mateus','mat'],['Marcos','mar'],['Lucas','luc'],['João','joao'],['Atos','atos'],['Romanos','rom'],['1 Coríntios','1cor'],['2 Coríntios','2cor'],['Gálatas','gal'],['Efésios','efes'],['Filipenses','fil'],['Colossenses','col'],['1 Tessalonicenses','1tes'],['2 Tessalonicenses','2tes'],['1 Timóteo','1tim'],['2 Timóteo','2tim'],['Tito','tito'],['Filemom','flm'],['Hebreus','heb'],['Tiago','tiag'],['1 Pedro','1ped'],['2 Pedro','2ped'],['1 João','1joao'],['2 João','2joao'],['3 João','3joao'],['Judas','jud'],['Apocalipse','apo']
];
const BOOK_KEY='voz-do-pai-biblia-book', CHAPTER_KEY='voz-do-pai-biblia-chapter';
const bookSelect=document.getElementById('bookSelect'), chapterSelect=document.getElementById('chapterSelect'), content=document.getElementById('bibleContent');
const chapterLabel=document.getElementById('chapterLabel'), resumeLabel=document.getElementById('resumeLabel'), page=document.querySelector('.bible-page'), reader=document.getElementById('reader');
let currentBook=Math.max(0,Math.min(BOOKS.length-1,parseInt(localStorage.getItem(BOOK_KEY)||'0',10)||0));
let currentChapter=Math.max(1,parseInt(localStorage.getItem(CHAPTER_KEY)||'1',10)||1), chapters={}, bookCache={}, hideTimer=null, touchStartX=0, touchStartY=0, touchMoved=false, loadToken=0;
function savePosition(){localStorage.setItem(BOOK_KEY,String(currentBook));localStorage.setItem(CHAPTER_KEY,String(currentChapter))}
function showControls(){page.classList.remove('controls-hidden');clearTimeout(hideTimer);hideTimer=setTimeout(hideControls,4500)}
function hideControls(){clearTimeout(hideTimer);page.classList.add('controls-hidden')}
function toggleControls(){page.classList.contains('controls-hidden')?showControls():hideControls()}
function fillBooks(){bookSelect.innerHTML=BOOKS.map((b,i)=>`<option value="${i}">${b[0]}</option>`).join('');bookSelect.value=String(currentBook)}
function cleanText(text){return String(text||'').replace(/^\uFEFF/,'').replace(/\\fn[\s\S]*?\\\*fn/g,'').replace(/\\f[a-z-]*\n?/g,'').replace(/\\[a-z-]+/g,'').replace(/\n+/g,' ').replace(/\s{2,}/g,' ').trim()}
function parseBible(raw){
  const out={};
  const text=String(raw||'').replace(/^\uFEFF/,'').replace(/\r/g,'');
  const re=/\\v\s+[^\n]*?\.(\d+)\.(\d+)\s*\n([\s\S]*?)(?=\n\\v\s+[^\n]*?\.\d+\.\d+\s*\n|$)/g;
  let m;
  while((m=re.exec(text))){
    const ch=Number(m[1]),v=Number(m[2]);
    if(!out[ch])out[ch]=[];
    const value=cleanText(m[3]);
    if(value)out[ch].push({v,text:value});
  }
  return out;
}
async function fetchSource(url){
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw new Error('HTTP '+response.status+' em '+url);
  const raw=await response.text();
  if(!raw || !raw.includes('\\v '))throw new Error('Arquivo bíblico inválido ou vazio');
  return raw;
}
async function loadBook(index){
  const token=++loadToken;
  currentBook=index;
  bookSelect.value=String(index);
  chapterSelect.innerHTML='<option>Carregando…</option>';
  chapterSelect.disabled=true;
  content.innerHTML='<div id="loading">Carregando '+BOOKS[index][0]+'…</div>';
  resumeLabel.textContent='Carregando a Bíblia Livre…';
  try{
    const key=BOOKS[index][1];
    if(bookCache[key]){
      chapters=bookCache[key];
    }else{
      let raw;
      try{raw=await fetchSource(SOURCE_PRIMARY+encodeURIComponent(key)+'.txt')}catch(primaryError){
        console.warn('Fonte principal falhou, usando fonte alternativa:',primaryError);
        raw=await fetchSource(SOURCE_FALLBACK+encodeURIComponent(key)+'.txt');
      }
      chapters=parseBible(raw);
      const nums=Object.keys(chapters).map(Number).filter(Number.isFinite).sort((a,b)=>a-b);
      if(!nums.length)throw new Error('Nenhum capítulo encontrado em '+key+'.txt');
      bookCache[key]=chapters;
    }
    if(token!==loadToken)return;
    const nums=Object.keys(chapters).map(Number).filter(Number.isFinite).sort((a,b)=>a-b);
    if(!nums.length)throw new Error('Nenhum capítulo encontrado');
    if(!nums.includes(currentChapter))currentChapter=nums[0];
    chapterSelect.innerHTML=nums.map(n=>`<option value="${n}">Capítulo ${n}</option>`).join('');
    chapterSelect.disabled=false;
    chapterSelect.value=String(currentChapter);
    renderChapter();
  }catch(e){
    if(token!==loadToken)return;
    content.innerHTML='<div id="loading">Não foi possível carregar este livro da Bíblia Livre.<br><small>Tente novamente. Se continuar, o arquivo deste livro pode estar temporariamente indisponível.</small></div>';
    chapterSelect.innerHTML='<option>—</option>';
    console.error('Erro ao carregar '+BOOKS[index][0],e);
  }
}
function renderChapter(){
  const verses=chapters[currentChapter]||[];
  const name=BOOKS[currentBook][0];
  if(!verses.length){content.innerHTML='<div id="loading">Este capítulo não possui conteúdo disponível.</div>';return}
  content.innerHTML=`<div class="bible-source">BÍBLIA LIVRE</div><h1>${name}</h1><div class="chapter-number">${currentChapter}</div><div class="verses">${verses.map(x=>`<p><sup>${x.v}</sup>${x.text}</p>`).join('')}</div><div class="bible-credit">Todas as Escrituras em português são da Bíblia Livre (BLIVRE), Copyright © Diego Santos, Mario Sérgio e Marco Teles. Licença Creative Commons Atribuição 3.0 Brasil. <span>Fonte: BibliaLivre</span></div>`;
  chapterLabel.textContent=`${name} ${currentChapter}`;
  resumeLabel.textContent=`${name} ${currentChapter} · salvo automaticamente`;
  savePosition();
  reader.scrollTop=0;
}
function changeChapter(delta){
  const nums=Object.keys(chapters).map(Number).sort((a,b)=>a-b);
  if(!nums.length)return;
  let i=nums.indexOf(currentChapter);
  i=Math.max(0,Math.min(nums.length-1,i+delta));
  if(nums[i]!==currentChapter){currentChapter=nums[i];chapterSelect.value=String(currentChapter);renderChapter()}
  showControls();
}
bookSelect.addEventListener('change',()=>{currentChapter=1;savePosition();loadBook(Number(bookSelect.value));showControls()});
chapterSelect.addEventListener('change',()=>{currentChapter=Number(chapterSelect.value);renderChapter();showControls()});
document.getElementById('prevPage').onclick=e=>{e.stopPropagation();changeChapter(-1)};
document.getElementById('nextPage').onclick=e=>{e.stopPropagation();changeChapter(1)};
document.getElementById('backBible').onclick=e=>{e.stopPropagation();history.length>1?history.back():(location.href='index.html')};
document.getElementById('fullscreenBtn').onclick=async e=>{e.stopPropagation();try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();showControls()}catch(err){console.error(err)}};
reader.addEventListener('click',e=>{if(touchMoved){touchMoved=false;return}if(e.target.closest('button,select'))return;toggleControls()});
reader.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;touchStartX=e.touches[0].clientX;touchStartY=e.touches[0].clientY;touchMoved=false},{passive:true});
reader.addEventListener('touchmove',e=>{if(e.touches.length!==1)return;const dx=e.touches[0].clientX-touchStartX,dy=e.touches[0].clientY-touchStartY;if(Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)){touchMoved=true;e.preventDefault()}},{passive:false});
reader.addEventListener('touchend',e=>{if(!touchMoved)return;const dx=e.changedTouches[0].clientX-touchStartX;if(Math.abs(dx)>=Math.max(55,window.innerWidth*.14))changeChapter(dx<0?1:-1);touchMoved=false},{passive:true});
fillBooks();loadBook(currentBook);hideControls();
