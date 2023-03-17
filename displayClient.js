const crc = require("crc");
const connClient = require("./connClient");
const sleep = require("./sleep");

class displayClient extends connClient {
  async quickMessage(message, time = 30) {
    //const crcMessage = this._createCrcFrame(message, 0x50, 0xAA, 0x01, 0x01, 0x01, 0x01, 0x82, 0x01, 0x01)
    // const outQuick = this._createCrcFrame("", 0x50, 0xAA, 0x01, 0x01, 0x01, 0x01, 0x83, 0x01, 0x01)
    await this.connect();

    // await this.writeData(this._createBccOut());
    if (this.blocked) {
      // this.disconnect();
      this.blocked = false;
    }
    const crcMessage = this._createBccFrame(
      message,
      0x01,
      0x30,
      Math.round(time / 2)
    );
    // console.log("sending message", crcMessage, new Date());
    // console.dir(crcMessage);
    await this.writeData(crcMessage);
    // await sleep(200);
    // await this.writeData(crcMessage);
    // await this.writeData("\n");
    this.blocked = true;
    const self = this;
    await sleep(time * 1000);
    if (this.blocked) {
      console.log("bcc out", this._createBccOut(), new Date());
      await this.writeData(this._createBccOut());
      self.disconnect();
    }
    return this;
  }

  async enviarMensagem(mensagem, time = 15) {
    const crcFrame = this._createCrcFrame(
      mensagem,
      0x50,
      0xaa,
      0x00,
      0x01,
      0x01,
      0x01,
      0x82,
      0x01,
      0x01,
      [0xaa, 0x0f, time]
    );
    const crcOut = this._createCrcFrame(
      "",
      0x50,
      0xaa,
      0x01,
      0x01,
      0x00,
      0x01,
      0x83,
      0x01,
      0x01
    );
    console.log("message crc", crcFrame);
    console.log("message crc", crcOut);
    await this.writeData(crcFrame);
    this.blocked = true;
    const self = this;
    setTimeout(async () => {
      if (self.blocked) {
        await this.writeData(crcOut);
        self.disconnect();
      }
    }, time * 1000);
  }

  /* Default quick message params
        message: Text message to display
        computador: 0x50
        msg: 0xAA
        group: 0x01
        origDevice: 0x01
        destDevice: 0x01
        idDest: 0x01
        cmd: 0x82
        frame: 0x01
        nFrames: 0x01
    */
  _createCrcFrame(
    message,
    computador,
    msg,
    group,
    origDevice,
    destDevice,
    idDest,
    cmd,
    frame,
    nFrames,
    arrComandos = []
  ) {
    const SOH = 0x01; // inicio do frame
    const STX = 0x02; // inicio do texto
    const ETX = 0x03; // fim do texto
    const messageBytes = message.split("").map((v) => v.charCodeAt(0));
    const messageLen = [];
    if (messageBytes.length + arrComandos.length < 256) {
      messageLen.push(0);
      messageLen.push(messageBytes.length + arrComandos.length);
    } else {
      messageLen.push(
        Math.floor((messageBytes.length + arrComandos.length) / 256)
      );
      messageLen.push((messageBytes.length + arrComandos.length) % 256);
    }
    const bufferMsg = [
      SOH,
      STX,
      computador, // Computador como classe de origem
      group, // ID do grupo de origem
      origDevice, // ID do dispositivo de origem
      msg, // Painel de mensagens como classe de destino
      destDevice, // ID do grupo de destino
      idDest, // ID do dispositivo de destino
      cmd, // comando de atualizar o texto
      frame, // Frame atual
      nFrames, // Quantidade de frames total
      ...messageLen, // Tamanho da mensagem
      ...arrComandos,
      ...messageBytes, // A mensagem
      ETX,
    ];
    const crcM = crc.crc16ccitt(bufferMsg);
    if (crcM < 256) {
      bufferMsg.push(0);
      bufferMsg.push(crcM);
    } else {
      bufferMsg.push(Math.floor(crcM / 256));
      bufferMsg.push(crcM % 256);
    }
    //bufferMsg.push(crcM)
    return Buffer.from(bufferMsg);
  }

  _createBccOut() {
    const arrBytes = [0x02, 0x01, 0x83, 0x0, 0x03];
    let bcc = 0;
    for (let i of arrBytes) {
      bcc = bcc ^ i;
      bcc = bcc << 0x1;
      if (bcc > 256) {
        bcc = bcc % 256;
      }
    }
    return Buffer.from([0x01, ...arrBytes, bcc]);
  }

  _createBccFrame(message, dest = 0x01, tempo = 0x31, time = 2) {
    const SOH = 0x01; // inicio do frame
    const STX = 0x02; // inicio do texto
    const ETX = 0x03; // fim do texto
    const messageBytes = `${message} `
      .padEnd(16, " ")
      .toUpperCase()
      .substr(0, 240)
      .split("")
      .map((v) => v.charCodeAt(0));
    messageBytes.unshift(0xc5);
    // messageBytes.push(0xc9);
    messageBytes.push(0xc1); // Velocidade 1
    // messageBytes.unshift(0xc4); // Velocidade 4
    for (let i = 0; i < time; i++) {
      messageBytes.push(0x9c); // Pausa
    }
    messageBytes.push(0x9d); // Pisca
    messageBytes.push(0x9c); // Pausa
    messageBytes.push(0x9e); // Superposição
    // messageBytes.unshift(0x9a); // Relogio
    // messageBytes.unshift(0xa4); // Pontos
    // messageBytes.unshift(0x9b); // Calendario
    // messageBytes.unshift(0xa5); // Abre janela
    // messageBytes.unshift(0xa7); // Packman
    // messageBytes.unshift(0xa8); // Tartaruga
    // messageBytes.unshift(0x9f); // Roda para cima
    // messageBytes.unshift(0xa0); // Roda para baixo
    // messageBytes.unshift(0xa3); // Linhas
    // messageBytes.unshift(0x83); // Desativa relé

    const bufferMsg = [
      STX,
      dest,
      0x82, // CMD - Quick Message
      messageBytes.length + 2,
      tempo,
      ...messageBytes,
      0x00,
      ETX,
    ];
    let bcc = 0;
    for (let i of bufferMsg) {
      bcc = bcc ^ i;
      bcc = bcc << 0x1;
      if (bcc > 256) {
        bcc = bcc % 256;
      }
    }
    bufferMsg.unshift(SOH);
    bufferMsg.push(bcc);
    return Buffer.from(bufferMsg);
  }
}

module.exports = displayClient;

// const dc = new displayClient("192.168.111.9", 2101);

// dc.quickMessage("Placa AAA-1923", 20)
//   .then((err) => {
//     console.log("Sent message", err);
//     // setTimeout(() => dc.quickMessage("Teste 2"), 5000);
//     setTimeout(() => dc.disconnect(), 10000);
//     //dc.disconnect()
//   })
//   .catch((err) => {
//     console.log("error on display", err);
//   });
