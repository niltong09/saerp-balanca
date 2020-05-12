const net = require('net')

function enviaComando(comando, host, port) {
    // Check the args
    if (!comando || !host || !port || typeof comando !== 'string'
        || typeof host !== 'string') {
        throw new Error('Invalid arguments on enviaComando')
    }
    const client = new net.Socket()
    let allData = ''

    client.on('error', err => {
        console.log(`error on Socket: ${err}`)
    })

    client.on('data', data => {
        console.log(`Received data`)
        allData += data
    })

    client.on('close', err => {
        console.log('Connection closed')
        console.log(allData)
    })

    client.connect(port, host, () => {
        console.log('connected')
        client.write(comando)
    })
}

module.exports = enviaComando