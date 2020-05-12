const crc = require('crc')
const net = require('net')

function enviarMensagemDisplay(host, port, message) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket()
        let allData = ''

        client.on('error', err => {
            reject(err)
        })

        client.on('data', data => {
            allData += data
            if (allData.length > 15000) {
                client.end()
            }
        })

        client.on('close', () => {
            try {
                resolve(allData)
            } catch (err) {
                reject(err)
            }
        })

        client.connect(port, host, () => {
            console.log('connected')
            client.write(createCrcFrame(message), (err) => {
                console.log('data send')
                client.end()
                !!err && console.log('Message error', err)
                !err && console.log('Message sent')
                !!err ? reject(err) : resolve()
            })
        })
    })
}

function createCrcFrame(message) {
    const computador = 0x50
    const msg = 0xAA
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
        0x01, // ID do grupo de origem
        0x01, // ID do dispositivo de origem
        msg, // Painel de mensagens como classe de destino
        0x01, // ID do grupo de destino
        0x01, // ID do dispositivo de destino
        0x82, // comando de atualizar o texto
        0x01, // Frame atual
        0x01, // Quantidade de frames total
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

//buff = createCrcFrame('TESTE')
//console.dir(buff.toString('hex'))
// testa
enviarMensagemDisplay("192.168.111.8", 2101, "Mensagem de teste")