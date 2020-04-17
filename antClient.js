const net = require('net')

function leTag(host, port) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket()
        let allData = ''

        client.on('error', err => {
            reject(err)
        })

        client.on('data', data => {
            console.log('data len', data.toString().length)
            console.log('data received', data.toString())
            console.dir(data)
            let dataHex = ''
            for (let val of data.values()) {
                dataHex += ('00' + val.toString(16)).slice(-2)
            }
            console.log('hex string', dataHex)
            if (data.toString().length == 65) {
                // Antena henry leitura decimal
                // Dados: <79+REON+000+0]00000000000013658925]14/04/2020 10:07:07]1]0]2F
                const splitedData = data.toString().split(']')
            }
            allData += data
            if (allData.length > 15000) {
                client.end()
            }
        })

        client.on('close', () => {
            try {
                console.log('Received ', allData)
                resolve(allData)
            } catch (err) {
                reject(err)
            }
        })

        client.connect(port, host)
    })
}

leTag('192.168.111.4', 3000)
