// Instalação do Voz do Pai (PWA)
(function(){
  let deferredPrompt=null;
  const btn=()=>document.getElementById('installBtn');

  function updateButton(){
    const b=btn();
    if(!b)return;
    const standalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
    b.classList.toggle('hidden',standalone||!deferredPrompt);
  }

  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();
    deferredPrompt=e;
    updateButton();
  });

  document.addEventListener('click',async e=>{
    const b=e.target.closest('#installBtn');
    if(!b||!deferredPrompt)return;
    deferredPrompt.prompt();
    try{await deferredPrompt.userChoice}catch(err){}
    deferredPrompt=null;
    updateButton();
  });

  window.addEventListener('appinstalled',()=>{
    deferredPrompt=null;
    updateButton();
  });

  window.addEventListener('load',updateButton);
  setTimeout(updateButton,1500);
})();
