// Voz nativa aprimorada — Voz do Pai
(function(){
  let voices=[];
  let runId=0;

  function loadVoices(){
    if(!('speechSynthesis' in window)) return;
    voices=speechSynthesis.getVoices()||[];
  }
  loadVoices();
  if('speechSynthesis' in window) speechSynthesis.onvoiceschanged=loadVoices;

  function pickVoice(){
    const pt=voices.filter(v=>/^pt(-|_)?BR$/i.test(v.lang)||/^pt/i.test(v.lang));
    const maleHints=['male','masculino','homem','google português brasil','microsoft antonio','daniel','lucas','felipe'];
    const male=pt.find(v=>maleHints.some(h=>v.name.toLowerCase().includes(h)));
    return male||pt.find(v=>/google|microsoft|natural|enhanced/i.test(v.name))||pt[0]||voices.find(v=>/^pt/i.test(v.lang))||null;
  }

  window.speak=function(t){
    if(!('speechSynthesis' in window)){
      alert('Seu navegador não oferece leitura de voz.');
      return;
    }
    speechSynthesis.cancel();
    const myRun=++runId;
    const clean=String(t||'').replace(/\s+/g,' ').trim();
    if(!clean)return;
    const parts=clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[clean];
    let i=0;
    const voice=pickVoice();

    function next(){
      if(myRun!==runId||i>=parts.length)return;
      const s=parts[i++].trim();
      if(!s)return next();
      const u=new SpeechSynthesisUtterance(s);
      u.lang=voice?.lang||'pt-BR';
      if(voice)u.voice=voice;
      u.rate=s.length<55?.78:s.length<110?.82:.85;
      u.pitch=.88;
      u.volume=1;
      u.onend=()=>setTimeout(next,s.length<55?380:520);
      u.onerror=()=>setTimeout(next,250);
      speechSynthesis.speak(u);
    }
    next();
  };

  window.addEventListener('beforeunload',()=>speechSynthesis?.cancel());
})();