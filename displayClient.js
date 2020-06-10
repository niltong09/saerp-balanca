const crc = require('crc')
const connClient = require('./connClient')

class displayClient extends connClient {

    async quickMessage(message) {
        const crcMessage = this._createCrcFrame(message, 0x50, 0xAA, 0x01, 0x01, 0x01, 0x01, 0x82, 0x01, 0x01)
        //const outQuick = this._createCrcFrame("", 0x50, 0xAA, 0x01, 0x01, 0x01, 0x01, 0x83, 0x01, 0x01)
        console.log('sending message')
        console.dir(crcMessage)
        await this.writeData(crcMessage)
        //await this.writeData(outQuick)
        return this
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
    _createCrcFrame(message, computador, msg, group, origDevice, destDevice, idDest, cmd, frame, nFrames) {
        const SOH = 0x01 // inicio do frame
        const STX = 0x02 // inicio do texto
        const ETX = 0x03 // fim do texto
        const messageBytes = message.split("").map(v => v.charCodeAt(0))
        const messageLen = []
        if (messageLen < 256) {
            messageLen.push(0)
            messageLen.push(messageBytes.length)
        } else {
            messageLen.push(Math.floor(messageBytes.length / 256))
            messageLen.push(messageBytes.length % 256)
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
            ...messageBytes, // A mensagem
            ETX
        ]
        const crcM = crc.crc16ccitt(bufferMsg)
        if (crcM < 256) {
            bufferMsg.push(0)
            bufferMsg.push(crcM)
        } else {
            bufferMsg.push(Math.floor(crcM / 256))
            bufferMsg.push(crcM % 256)
        }
        //bufferMsg.push(crcM)
        return Buffer.from(bufferMsg)
    }
}

//module.exports = displayClient

const dc = new displayClient("192.168.111.8", 2101)
dc.quickMessage("TESTE").then((err) => {
    console.log('Sent message', err)
    setTimeout(() => dc.disconnect(), 3000)
    //dc.disconnect()
})

