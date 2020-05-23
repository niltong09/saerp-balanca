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
                console.log('ending connection')
                client.end()
                client.destroy()
            }, 3000)
        })
    })
}
/*
async function testa() {
    const host = '192.168.111.3'
    const port = 5000
    enviaComando('SET 1', host, port).then(res => {
        console.log('SET Open')
        setTimeout(() => {
            console.log('RESET Open')
            enviaComando('RESET 1', host, port).then(res => {
                console.log('SET Close')
                setTimeout(() => {
                    console.log('RESET Close')
                    enviaComando('SET 1', host, port).then(res => {
                        setTimeout(() => {
                            enviaComando('RESET 1', host, port).then(res => {
                                console.log('Finished')
                            })
                        }, 3000)
                    })
                }, 10000)
            })
        }, 3000)
    })
}
testa()*/

module.exports = enviaComando