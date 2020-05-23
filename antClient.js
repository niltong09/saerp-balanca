const net = require('net')

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
}

/*
const host = '192.168.111.12'
const port = 8081
connect(host, port, tag => {
    console.log('Readed tag', tag)

}).then(client => {
    //sendComand(client, "00+RR+00+T]00000001]50")
})*/
module.exports = { connect, sendComand }
