// Áudio principal — Pai Nosso
(function(){
  const AUDIO_SRC = './pai-nosso.mp3';
  let audio = null;
  let state = 'stopped';

  function getAudio(){
    if(!audio){
      audio = new Audio(AUDIO_SRC);
      audio.preload = 'metadata';
      audio.addEventListener('ended', function(){
        state = 'stopped';
        updateButtons('🔊 Ouvir');
      });
      audio.addEventListener('error', function(){
        state = 'stopped';
        updateButtons('🔊 Ouvir');
        alert('Não foi possível encontrar o arquivo pai-nosso.mp3 no repositório.');
      });
    }
    return audio;
  }

  function updateButtons(label){
    ['dailySpeak','speakBtn'].forEach(function(id){
      const btn = document.getElementById(id);
      if(btn) btn.innerHTML = label;
    });
  }

  function playPaiNosso(e){
    // A oração principal usa o MP3, não a voz nativa.
    if(e){
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    const a = getAudio();

    if(state === 'stopped'){
      a.currentTime = 0;
      a.play().then(function(){
        state = 'playing';
        updateButtons('⏸ Pausar');
      }).catch(function(){
        state = 'stopped';
        updateButtons('🔊 Ouvir');
        alert('Toque novamente para iniciar o áudio do Pai Nosso.');
      });
      return;
    }

    if(state === 'playing'){
      a.pause();
      state = 'paused';
      updateButtons('⏹ Parar');
      return;
    }

    // Terceiro toque: para e volta ao início.
    a.pause();
    a.currentTime = 0;
    state = 'stopped';
    updateButtons('🔊 Ouvir');
  }

  function init(){
    const daily = document.getElementById('dailySpeak');
    if(daily) daily.addEventListener('click', playPaiNosso, true);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.playPaiNosso = playPaiNosso;
})();
