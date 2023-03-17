const displayClient = require("./displayClient");
const crc = require("crc");

const ip_display = "192.168.111.53";
const msg_a_enviar = "Placa abc";

const dc = new displayClient(ip_display, 2101);

//dc.quickMessage(msg_a_enviar, 20)
//  .then((err) => {
//    console.log("mensagem enviada", err);
//    // setTimeout(() => dc.quickMessage("Teste 2"), 5000);
//    setTimeout(() => dc.disconnect(), 3000);
//    //dc.disconnect()
//  })
//  .catch((err) => {
//    console.log("erro no display", err);
//  });
dc.enviarMensagem(msg_a_enviar)
  .then((val) => {
    console.log("Mensagem enviada", val);
    setTimeout(() => dc.disconnect(), 3000);
  })
  .catch((err) => console.log("erro", err));

// function calculaBcc(bufferMsg) {
//   let bcc = 0;
//   for (let i of bufferMsg) {
//     bcc = bcc ^ i;
//     bcc = bcc << 0x1;
//     // if (bcc > 256) {
//     //   console.log("passado de 256", bcc);
//     //   bcc = bcc % 256;
//     // }
//   }
//   return bcc;
// }

// const arrMsg = [
//   0x01, 0x02, 0x50, 0x01, 0x01, 0xaa, 0x00, 0x01, 0x82, 0x01, 0x01, 0x00, 0x12,
//   0xaa, 0x27, 0xaa, 0x70, 0xaa, 0x11, 0xaa, 0x40, 0x06, 0x50, 0x6c, 0x61, 0x63,
//   0x61, 0x20, 0x61, 0x62, 0x63, 0x03,
// ];

// console.log("bcc da mensagem", calculaBcc(arrMsg).toString(16));
//const crcFrame = _createCrcFrame(
//  "TESTE",
//  0xeb,
//  0xaa,
//  0x00,
//  0x31,
//  0x00,
//  0x01,
//  0x82,
//  0x01,
//  0x01
//);
//console.log("crcFrame", crcFrame);

//function _createCrcFrame(
//  message,
//  computador,
//  msg,
//  group,
//  origDevice,
//  destDevice,
//  idDest,
//  cmd,
//  frame,
//  nFrames
//) {
//  const SOH = 0x01; // inicio do frame
//  const STX = 0x02; // inicio do texto
//  const ETX = 0x03; // fim do texto
//  const messageBytes = message.split("").map((v) => v.charCodeAt(0));
//  const messageLen = [];
//  if (messageBytes.length < 256) {
//    messageLen.push(0);
//    messageLen.push(messageBytes.length);
//  } else {
//    messageLen.push(Math.floor(messageBytes.length / 256));
//    messageLen.push(messageBytes.length % 256);
//  }
//  const bufferMsg = [
//    SOH,
//    STX,
//    computador, // Computador como classe de origem
//    group, // ID do grupo de origem
//    origDevice, // ID do dispositivo de origem
//    msg, // Painel de mensagens como classe de destino
//    destDevice, // ID do grupo de destino
//    idDest, // ID do dispositivo de destino
//    cmd, // comando de atualizar o texto
//    frame, // Frame atual
//    nFrames, // Quantidade de frames total
//    ...messageLen, // Tamanho da mensagem
//    ...messageBytes, // A mensagem
//    ETX,
//  ];
//  const crcM = crc.crc16ccitt(bufferMsg);
//  // const crcM = calculaCrc(bufferMsg);
//  if (crcM < 256) {
//    bufferMsg.push(0);
//    bufferMsg.push(crcM);
//  } else {
//    bufferMsg.push(Math.floor(crcM / 256));
//    bufferMsg.push(crcM % 256);
//  }
//  //bufferMsg.push(crcM)
//  return Buffer.from(bufferMsg);
//}
