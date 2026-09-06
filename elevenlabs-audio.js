// Player dos 20 audios ElevenLabs
(function(){
const base='./audio/elevenlabs/';
const map={'Oração da Manhã':'morning','Oração da Noite':'night','Oração nos Momentos Difíceis':'difficult','Oração pela Família':'family','Oração de Proteção':'protection','Oração de Agradecimento':'gratitude','Oração para Acalmar o Coração':'peace','Oração por Trabalho e Prosperidade':'work','Oração para Recomeçar':'restart','Oração para Entregar o Amanhã':'tomorrow','Oração pela Cura':'cura','Oração contra a Ansiedade':'ansiedade','Oração pelos Filhos':'filhos','Oração pelo Casamento':'casamento','Oração de Proteção pelos Filhos':'protecaoFilhos','Oração da Madrugada':'madrugada','Oração por Portas Abertas':'portas','Oração por Livramento':'livramento','Oração pelo Perdão':'perdao','Oração para Fortalecer a Fé':'fe'};
let audio=null,key=null,state='stopped';
function label(t){const b=document.getElementById('speakBtn');if(b)b.innerHTML=t;}
function stop(){if(audio){audio.pause();audio.currentTime=0;}state='stopped';key=null;label('🔊 Ouvir');}
function play(k){if(key!==k)stop();if(!audio||key!==k){audio=new Audio(base+k+'.mp3');audio.preload='metadata';key=k;audio.onended=stop;audio.onerror=function(){stop();const t=document.getElementById('dialogText')?.textContent||'';if(window.speak&&t)window.speak(t);};}if(state==='stopped'){audio.currentTime=0;audio.play().then(()=>{state='playing';label('⏸ Pausar');}).catch(()=>label('🔊 Ouvir'));}else if(state==='playing'){audio.pause();state='paused';label('⏹ Parar');}else stop();}
document.addEventListener('click',function(e){const b=e.target.closest('#speakBtn');if(!b)return;const t=document.getElementById('dialogTitle')?.textContent?.trim();const k=map[t];if(!k||t==='Pai Nosso')return;e.preventDefault();e.stopImmediatePropagation();play(k);},true);
window.addEventListener('beforeunload',stop);
})();
