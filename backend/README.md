# Backend do Voz do Pai — pedidos de oração

O GitHub Pages do `ora-es` é apenas o aplicativo estático. Para **envio automático pelo WhatsApp**, o projeto agora possui um backend de referência em `whatsapp-webhook.example.js`.

## Fluxo

1. A pessoa informa nome, WhatsApp e pedido no app.
2. O app envia os dados por HTTPS para `POST /pedido-oracao`.
3. O backend valida o consentimento e o número.
4. O backend usa a WhatsApp Business Platform/Cloud API para enviar a resposta.
5. O token fica somente no servidor, nunca no JavaScript do app.

## Para ativar

Será necessário hospedar o backend em um serviço que execute Node.js e configurar as variáveis de ambiente:

- `WHATSAPP_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_API_VERSION` (opcional)

Depois, no app, definir `window.ORACAO_API_URL` apontando para o endereço HTTPS do backend.

**Importante:** não coloque `WHATSAPP_TOKEN` em `index.html`, `pedido-oracao.js`, GitHub Pages ou qualquer arquivo público do repositório.

O envio de mensagens pelo WhatsApp depende da configuração e das regras da conta WhatsApp Business/Meta, incluindo modelos de mensagem quando aplicáveis.
