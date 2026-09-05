const prayers={
 morning:{emoji:'🌅',title:'Oração da manhã',text:'Senhor, obrigado por me conceder um novo dia. Coloco diante de Ti meus planos, minha família, meu trabalho e tudo aquilo que está no meu coração. Guia meus passos, dá-me sabedoria e ajuda-me a fazer o bem. Que eu tenha fé para enfrentar cada desafio e gratidão para reconhecer cada bênção. Amém.'},
 night:{emoji:'🌙',title:'Oração da noite',text:'Meu Deus, a noite chegou e eu entrego a Ti tudo o que vivi hoje. Acalma meu coração, perdoa minhas falhas e guarda minha família. Que eu possa descansar em paz, confiando que não estou sozinho. Renova minhas forças para o amanhã e cobre meu lar com Tua paz. Amém.'},
 protection:{emoji:'🛡️',title:'Oração de proteção',text:'Senhor meu Deus, coloca Tuas mãos sobre minha vida e sobre minha família. Guarda nossa entrada e nossa saída, livra-nos de todo mal e concede-nos discernimento para reconhecer os caminhos que devemos evitar. Que Tua paz esteja em nosso lar e que nenhum medo seja maior que nossa fé. Em nome de Jesus, amém.'},
 family:{emoji:'❤️',title:'Oração pela família',text:'Senhor, abençoa minha família. Protege cada pessoa que amo, fortalece nossos laços, traz diálogo, respeito e união para o nosso lar. Nos momentos difíceis, dá-nos paciência e fé. Que nunca falte amor, esperança e a Tua presença entre nós. Amém.'},
 health:{emoji:'🕊️',title:'Oração por saúde e cuidado',text:'Deus de misericórdia, coloco diante de Ti minhas preocupações e as de quem amo. Concede força, conforto e esperança. Abençoa todos que cuidam de nós e dá sabedoria para cada decisão. Que a paz alcance o coração e que a fé permaneça firme em todos os momentos. Amém.'},
 gratitude:{emoji:'✨',title:'Oração de agradecimento',text:'Senhor, obrigado pela vida, pelo alimento, pela família, pelas oportunidades e até pelas lições dos dias difíceis. Muitas bênçãos passam despercebidas, mas hoje escolho agradecer. Ensina-me a viver com um coração grato e a reconhecer Tua bondade em cada detalhe. Amém.'},
 anxiety:{emoji:'🤍',title:'Oração para acalmar o coração',text:'Pai, quando meus pensamentos estiverem acelerados, ajuda-me a respirar e lembrar que posso entregar minhas preocupações a Ti. Dá-me serenidade para o que não posso controlar e coragem para o que posso enfrentar. Guarda meu coração e renova minha esperança. Amém.'},
 faith:{emoji:'🔥',title:'Oração por fé',text:'Senhor, fortalece minha fé quando eu estiver cansado ou não entender o que está acontecendo. Ensina-me a confiar em Ti mesmo quando não vejo a resposta. Que minha esperança permaneça viva e que eu continue caminhando com coragem, sabendo que Tu estás comigo. Amém.'},
 guidance:{emoji:'🧭',title:'Oração por direção',text:'Pai, preciso da Tua direção. Ilumina meus pensamentos, fecha as portas que não forem boas para mim e abre os caminhos que estiverem de acordo com a Tua vontade. Dá-me sabedoria para escolher, paciência para esperar e coragem para obedecer. Amém.'},
 work:{emoji:'💼',title:'Oração pelo trabalho',text:'Senhor, abençoa o trabalho das minhas mãos. Dá-me sabedoria, responsabilidade, boas oportunidades e proteção durante minha jornada. Ajuda-me a agir com honestidade, respeito e dedicação. Que nunca falte o sustento para minha casa e que eu saiba agradecer por cada conquista. Amém.'},
 children:{emoji:'👨‍👩‍👧',title:'Oração pelos filhos',text:'Deus amado, entrego meus filhos aos Teus cuidados. Guarda seus passos, suas amizades, seus sonhos e suas escolhas. Dá-lhes sabedoria, saúde, caráter e um coração cheio de amor. Que eles cresçam cercados de proteção e aprendam a confiar em Ti. Amém.'},
 peace:{emoji:'🕊️',title:'Oração por paz',text:'Senhor, aquieta meu coração. Onde houver preocupação, coloca paz; onde houver medo, coloca coragem; onde houver tristeza, coloca esperança. Ajuda-me a descansar na Tua presença e a lembrar que nem tudo precisa ser resolvido hoje. Entrego tudo em Tuas mãos. Amém.'}
};
const dialog=document.getElementById('prayerDialog'),title=document.getElementById('dialogTitle'),text=document.getElementById('dialogText'),emoji=document.getElementById('dialogEmoji');let current='';
const getFavs=()=>JSON.parse(localStorage.getItem('ora-favs')||'[]');
function isFav(k){return getFavs().includes(k)}
function openPrayer(key){const p=prayers[key];if(!p)return;current=key;emoji.textContent=p.emoji;title.textContent=p.title;text.textContent=p.text;document.getElementById('favBtn').textContent=isFav(key)?'♥ Favoritado':'♡ Favoritar';dialog.showModal()}
function toggleFav(k){let a=getFavs();a=a.includes(k)?a.filter(x=>x!==k):[...a,k];localStorage.setItem('ora-favs',JSON.stringify(a));renderFavs();updateDailyFav();}
function renderFavs(){const box=document.getElementById('favorites'),a=getFavs();if(!a.length){box.className='empty';box.textContent='Toque no coração de uma oração para salvá-la aqui.';return}box.className='grid';box.innerHTML=a.map(k=>`<button class="prayer-card small" data-open="${k}"><span>${prayers[k].emoji}</span><h3>${prayers[k].title}</h3><p>Seu favorito</p></button>`).join('');box.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openPrayer(b.dataset.open))}
function speak(content){if(!('speechSynthesis'in window)){alert('Seu navegador não oferece leitura de voz.');return}window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(content);u.lang='pt-BR';u.rate=.9;u.pitch=.9;window.speechSynthesis.speak(u)}
async function sharePrayer(key){const p=prayers[key];if(!p)return;const shareText=`${p.title}\n\n${p.text}\n\n🙏 Um momento com Deus`;try{if(navigator.share)await navigator.share({title:p.title,text:shareText});else{await navigator.clipboard.writeText(shareText);alert('Oração copiada para compartilhar.')}}catch(e){}}
function updateDailyFav(){const b=document.getElementById('dailyFav');b.textContent=isFav('protection')?'♥':'♡';b.classList.toggle('saved',isFav('protection'))}

document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openPrayer(b.dataset.open)));
document.querySelectorAll('[data-scroll]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.scroll).scrollIntoView({behavior:'smooth'})));
document.getElementById('closeDialog').onclick=()=>dialog.close();
document.getElementById('favBtn').onclick=()=>{toggleFav(current);document.getElementById('favBtn').textContent=isFav(current)?'♥ Favoritado':'♡ Favoritar'};
document.getElementById('speakBtn').onclick=()=>speak(text.textContent);
document.getElementById('shareBtn').onclick=()=>sharePrayer(current);
document.getElementById('dailySpeak').onclick=()=>speak(document.getElementById('dailyText').textContent);
document.getElementById('dailyFav').onclick=()=>toggleFav('protection');
document.getElementById('dailyShare').onclick=()=>sharePrayer('protection');
document.getElementById('themeBtn').onclick=()=>{document.body.classList.toggle('light');localStorage.setItem('ora-theme',document.body.classList.contains('light')?'light':'dark')};
if(localStorage.getItem('ora-theme')==='light')document.body.classList.add('light');
document.querySelector('[data-nav="favorites"]').onclick=()=>document.querySelector('.favorites-section').scrollIntoView({behavior:'smooth'});
document.querySelector('[data-nav="home"]').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
const d=new Date();document.getElementById('dateLabel').textContent=d.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
const search=document.getElementById('searchInput'),grid=document.getElementById('categoryGrid'),noResults=document.getElementById('noResults');
search.addEventListener('input',()=>{const q=search.value.toLowerCase().trim();let count=0;grid.querySelectorAll('[data-open]').forEach(card=>{const p=prayers[card.dataset.open];const ok=!q||`${p.title} ${p.text}`.toLowerCase().includes(q);card.classList.toggle('hidden',!ok);if(ok)count++});noResults.classList.toggle('hidden',count>0)});
renderFavs();updateDailyFav();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
