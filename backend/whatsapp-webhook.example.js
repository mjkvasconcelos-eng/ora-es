// BACKEND DE REFERÊNCIA — NÃO COLOQUE TOKENS NO FRONT-END.
// Hospede este endpoint em um servidor/serviço compatível com Node.js.
// Configure as variáveis de ambiente:
// WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID
// e, opcionalmente, WHATSAPP_API_VERSION.

const http = require('http');

const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v23.0';
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

function send(res, code, body){
  res.writeHead(code, {'Content-Type':'application/json; charset=utf-8'});
  res.end(JSON.stringify(body));
}

function normalizePhone(phone){
  return String(phone || '').replace(/\D/g, '');
}

function escapeText(value){
  return String(value || '').slice(0, 1000);
}

async function sendWhatsApp(to, name, prayer){
  if(!TOKEN || !PHONE_NUMBER_ID) throw new Error('Credenciais do WhatsApp não configuradas');
  const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: `Olá, ${name}! 🙏\n\nRecebemos seu pedido de oração:\n“${escapeText(prayer)}”\n\nEstamos em oração por você. Que Deus fortaleça seu coração e lhe conceda paz.\n\n— Voz do Pai` }
  };
  const response = await fetch(url, {
    method:'POST',
    headers:{'Authorization':`Bearer ${TOKEN}`,'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });
  if(!response.ok) throw new Error(`WhatsApp API ${response.status}`);
  return response.json();
}

const server = http.createServer(async (req, res) => {
  if(req.method === 'OPTIONS'){
    res.writeHead(204, {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS'});
    return res.end();
  }
  if(req.method !== 'POST' || req.url !== '/pedido-oracao') return send(res, 404, {error:'not_found'});

  let raw='';
  req.on('data', chunk => { raw += chunk; if(raw.length > 15000) req.destroy(); });
  req.on('end', async () => {
    try{
      const data = JSON.parse(raw || '{}');
      if(!data.consent || !data.name || !data.phone || !data.prayer) return send(res,400,{error:'dados_incompletos'});
      const phone = normalizePhone(data.phone);
      if(phone.length < 10 || phone.length > 15) return send(res,400,{error:'whatsapp_invalido'});
      await sendWhatsApp(phone, data.name, data.prayer);
      send(res,200,{ok:true});
    }catch(error){
      console.error(error);
      send(res,500,{error:'falha_no_envio'});
    }
  });
});

server.listen(PORT, () => console.log(`Voz do Pai backend na porta ${PORT}`));
