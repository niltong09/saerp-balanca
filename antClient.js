const connClient = require('./connClient')

class antClient extends connClient {

    processingTags = []

    convertDecHexWiegand(strdec) {
        if (strdec.length < 8) {
            return ""
        }
        const strnorm = strdec.substr(-8)
        const parte1 = strnorm.substr(0, 3) * 1
        const parte2 = strnorm.substr(-5) * 1
        return `${parte1.toString(16)}${parte2.toString(16)}`
    }

    startAntMonitor(tagCallback) {
        const self = this
        self.addReadWatcher(async tag => {
            //console.log(`tag ${tag.toString().length}`)
            if (tag.toString().length > 3) {
                if (tag.length == 65) {
                    // Tag de antena henry
                    // TODO: Descobrir como transformar provavelmente Wiegard para outro formato
                    // Dados: <79+REON+000+0]00000000000013658925]14/04/2020 10:07:07]1]0]2F
                    const parsedTag = this.convertDecHexWiegand(tag.toString().split("]")[1])
                    if (self.processingTags.indexOf(parsedTag) == -1) {
                        self.processingTags.push(parsedTag)
                        try {
                            console.log('teste 1')
                            await tagCallback(parsedTag)
                        } catch (e) {
                            console.log(`Error ocurred on processing the tag ${parsedTag} ${e}`)
                        }
                        self.processingTags.splice(self.processingTags.indexOf(parsedTag), 1)
                    }
                } else {
                    const parsedTag = tag.toString().replace("\r", "").replace("\n", "").replace("0x", "")
                    if (self.processingTags.indexOf(parsedTag) == -1) {
                        self.processingTags.push(parsedTag)
                        try {
                            console.log('teste 1')
                            await tagCallback(parsedTag)
                        } catch (e) {
                            console.log(`Error ocurred on processing the tag ${parsedTag} ${e}`)
                        }
                        self.processingTags.splice(self.processingTags.indexOf(parsedTag), 1)
                    }
                }
            }
        })
        return this.connect()
    }

    _createComandFrame(comand) {
        let eventbytes = comand.split('')
        eventbytes = eventbytes.map(v => v.charCodeAt(0))
        let size = eventbytes.length
        let checksum = [size, 0, ...eventbytes].reduce((a, p) => a ^ p)
        return Buffer.from([0x02, size, 0, ...eventbytes, checksum, 0x03])
    }

    sendComand(comand) {
        const frameCmd = this._createComandFrame(comand)
        return this.writeData(frameCmd)
    }
}
/*
const ant = new antClient('192.168.111.12', 8081)
ant.startAntMonitor(tag => {
    console.log(`Readed ${tag}`)
})*/

/*
function connect(host, port, onReceiveTag) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket()

        client.on('error', err => {
            reject(err)
        })

        client.on('data', data => {
            if (data.toString().length < 5) {
                return;
            }
            console.log('data received', data)
            //console.log('data len', data.toString().length)
            if (data.length == 65) {
                // Antena henry leitura decimal
                // Dados: <79+REON+000+0]00000000000013658925]14/04/2020 10:07:07]1]0]2F
                const splitedData = data.toString('ascii').split(']')
                console.log('matricula', splitedData[1], (splitedData[1] * 1).toString(16))
                onReceiveTag(splitedData[1])
            } else {
                onReceiveTag(data.toString().replace("\r", "").replace("\n", ""))
            }
        })

        client.on('close', () => {
            console.log(`closing connection ${host}:${port}`)
        })

        client.connect(port, host, () => {
            console.log(`connected to ${host}:${port}`)
            resolve(client)
            //let eventdata = `00+RR+00+T]00000001]50`
        })
    })
}

function sendComand(client, comand) {
    let eventbytes = comand.split('')
    eventbytes = eventbytes.map(v => v.charCodeAt(0))
    let size = eventbytes.length
    let checksum = [size, 0, ...eventbytes].reduce((a, p) => a ^ p)
    const dataSend = Buffer.from([0x02, size, 0, ...eventbytes, checksum, 0x03])
    return client.write(dataSend)
}*/

/*
const host = '192.168.111.12'
const port = 8081
connect(host, port, tag => {
    console.log('Readed tag', tag)

}).then(client => {
    //sendComand(client, "00+RR+00+T]00000001]50")
})*/
module.exports = antClient
