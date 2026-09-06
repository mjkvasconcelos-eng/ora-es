/* Estrutura de pedidos de oração
   O formulário funciona no app e fica preparado para envio automático.
   Para ativar o envio real, configure a URL de um backend seguro em
   window.ORACAO_API_URL (não coloque tokens do WhatsApp neste arquivo).
*/
(function(){
  const card = document.createElement('section');
  card.className = 'prayer-request-card';
  card.id = 'pedidoOracao';
  card.innerHTML = `
    <div class="prayer-request-head">
      <span>🙏 PEDIR UMA ORAÇÃO</span>
      <small>Seu pedido será tratado com carinho.</small>
    </div>
    <div class="prayer-request-body">
      <label>Seu nome<input id="pedidoNome" type="text" maxlength="80" placeholder="Como podemos chamar você?"></label>
      <label>WhatsApp<input id="pedidoWhatsapp" type="tel" inputmode="tel" maxlength="20" placeholder="(11) 99999-9999"></label>
      <label>Seu pedido de oração<textarea id="pedidoTexto" maxlength="1000" rows="4" placeholder="Escreva aqui pelo que você deseja receber oração..."></textarea></label>
      <label class="pedido-consent"><input id="pedidoConsent" type="checkbox"> <span>Autorizo o uso destes dados somente para responder ao meu pedido de oração.</span></label>
      <button class="pray-btn pedido-submit" id="enviarPedido">🙏 Enviar pedido de oração</button>
      <p class="pedido-status" id="pedidoStatus" aria-live="polite"></p>
    </div>`;

  const main = document.querySelector('main');
  const encouragement = document.querySelector('.encouragement');
  if(main && encouragement) main.insertBefore(card, encouragement);
  else if(main) main.appendChild(card);

  const nome = document.getElementById('pedidoNome');
  const whatsapp = document.getElementById('pedidoWhatsapp');
  const texto = document.getElementById('pedidoTexto');
  const consent = document.getElementById('pedidoConsent');
  const status = document.getElementById('pedidoStatus');
  const btn = document.getElementById('enviarPedido');
  const API_URL = window.ORACAO_API_URL || '';

  nome.value = localStorage.getItem('vozDoPaiPedidoNome') || '';
  whatsapp.value = localStorage.getItem('vozDoPaiPedidoWhatsapp') || '';

  function setStatus(msg, ok){ status.textContent = msg; status.className = 'pedido-status ' + (ok ? 'ok' : 'error'); }

  btn.addEventListener('click', async function(){
    const data = { name: nome.value.trim(), phone: whatsapp.value.trim(), prayer: texto.value.trim(), consent: consent.checked };
    if(!data.name || !data.phone || !data.prayer){ setStatus('Preencha nome, WhatsApp e seu pedido.', false); return; }
    if(!data.consent){ setStatus('Marque a autorização para podermos responder ao pedido.', false); return; }

    localStorage.setItem('vozDoPaiPedidoNome', data.name);
    localStorage.setItem('vozDoPaiPedidoWhatsapp', data.phone);
    btn.disabled = true;
    setStatus('Enviando seu pedido...', true);

    if(!API_URL){
      setStatus('O formulário está pronto. Falta conectar o backend do WhatsApp para o envio automático.', false);
      btn.disabled = false;
      return;
    }

    try{
      const response = await fetch(API_URL, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
      if(!response.ok) throw new Error('Falha no servidor');
      texto.value = '';
      consent.checked = false;
      setStatus('Pedido recebido. A oração será enviada pelo WhatsApp.', true);
    }catch(e){
      setStatus('Não foi possível enviar agora. Tente novamente em alguns instantes.', false);
    }finally{ btn.disabled = false; }
  });
})();
