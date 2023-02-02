const displayClient = require('./displayClient')

const ip_display = '192.168.111.9';
const msg_a_enviar = 'Placa AAA-1920';

const dc = new displayClient(ip_display, 2101);

dc.quickMessage(msg_a_enviar, 20)
  .then((err) => {
     console.log("mensagem enviada", err);
     // setTimeout(() => dc.quickMessage("Teste 2"), 5000);
     setTimeout(() => dc.disconnect(), 3000);
     //dc.disconnect()
   })
   .catch((err) => {
     console.log("erro no display", err);
   });

