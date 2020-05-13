const net = require('net')

function enviaComando(comando, host, port) {
    return new Promise((resolve, reject) => {
        // Check the args
        if (!comando || !host || !port || typeof comando !== 'string'
            || typeof host !== 'string') {
            reject('Invalid arguments on enviaComando')
        }
        const client = new net.Socket()
        let allData = ''

        client.on('error', err => {
            console.log(`error on Socket: ${err}`)
            reject(err)
        })

        client.on('data', data => {
            console.log(`Received data`)
            allData += data
        })

        client.on('close', err => {
            console.log('Connection closed')
            console.log(allData)
            resolve(allData)
        })

        client.connect(port, host, () => {
            console.log('connected')
            client.write(`${comando}\n`)
            setTimeout(() => {
                client.end()
            }, 3000)
        })
    })
}

module.exports = enviaComando