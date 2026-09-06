(function(){
  const KEY='vozDoPai_nome';
  const $=id=>document.getElementById(id);

  function saudacao(){
    const h=new Date().getHours();
    if(h<12) return 'Bom dia';
    if(h<18) return 'Boa tarde';
    return 'Boa noite';
  }

  function nomeValido(n){ return typeof n==='string' && n.trim().length>=2; }

  function aplicarNome(nome){
    nome=(nome||'').trim();
    if(!nomeValido(nome)) return;
    localStorage.setItem(KEY,nome);
    const greeting=$('greeting');
    if(greeting) greeting.textContent=saudacao()+', '+nome+'! Que a paz de Deus esteja com você.';

    const welcomeTitle=document.querySelector('.welcome h1');
    if(welcomeTitle) welcomeTitle.textContent=nome+', separe alguns minutos para falar com Deus.';

    const dailyTitle=document.querySelector('#daily .daily-copy h2');
    if(dailyTitle) dailyTitle.textContent='Pai Nosso por '+nome;

    const dailyText=document.querySelector('#daily .daily-copy p');
    if(dailyText) dailyText.textContent='\n'+nome+', neste momento coloque seu coração diante de Deus. Ouça o Pai Nosso e faça sua oração junto conosco. Que o Senhor fortaleça sua fé, acalme suas preocupações e abençoe sua caminhada.\n\nPai nosso, que estás nos céus, santificado seja o teu nome. Venha o teu reino. Seja feita a tua vontade, assim na terra como no céu. Dá-nos hoje o nosso pão de cada dia. Perdoa as nossas dívidas, assim como perdoamos aos nossos devedores. E não nos deixes cair em tentação, mas livra-nos do mal. Amém.';

    let btn=document.getElementById('changeNameBtn');
    if(!btn){
      btn=document.createElement('button');
      btn.id='changeNameBtn';
      btn.className='secondary personal-name-btn';
      btn.textContent='✏️ Alterar meu nome';
      const welcome=document.querySelector('.welcome');
      if(welcome) welcome.appendChild(btn);
      btn.addEventListener('click',abrirCadastro);
    }
  }

  function abrirCadastro(){
    let dialog=$('nameDialog');
    if(!dialog){
      dialog=document.createElement('dialog');
      dialog.id='nameDialog';
      dialog.innerHTML='<button class="dialog-close" id="closeNameDialog">×</button><div class="dialog-icon">🙏</div><h2>Bem-vindo à Corrente de Oração</h2><p>Como podemos chamar você durante seus momentos de oração?</p><input id="nameInput" class="name-input" maxlength="40" autocomplete="given-name" placeholder="Digite seu nome"><button id="saveNameBtn" class="pray-btn">🙏 Continuar</button>';
      document.body.appendChild(dialog);
      $('closeNameDialog').addEventListener('click',()=>dialog.close());
      $('saveNameBtn').addEventListener('click',()=>{
        const n=$('nameInput').value;
        if(nomeValido(n)){ aplicarNome(n); dialog.close(); }
        else $('nameInput').focus();
      });
    }
    const input=$('nameInput');
    input.value=localStorage.getItem(KEY)||'';
    dialog.showModal();
    setTimeout(()=>input.focus(),100);
  }

  function iniciar(){
    const nome=localStorage.getItem(KEY);
    if(nomeValido(nome)) aplicarNome(nome);
    else setTimeout(abrirCadastro,450);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',iniciar); else iniciar();
})();
