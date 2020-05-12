const net = require('net')

function leTag(host, port) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket()
        let allData = ''

        client.on('error', err => {
            reject(err)
        })

        client.on('data', data => {
            //console.log('data len', data.toString().length)
            console.log('data received', data.toString())
            console.dir(data)
            let dataHex = ''
            for (let val of data.values()) {
                dataHex += ('00' + val.toString(16)).slice(-2)
            }
            //console.log('hex string', dataHex)
            if (data.length == 65) {
                // Antena henry leitura decimal
                // Dados: <79+REON+000+0]00000000000013658925]14/04/2020 10:07:07]1]0]2F
                const splitedData = data.toString('ascii').split(']')
                console.log('matricula', splitedData[1], (splitedData[1] * 1).toString(16))
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

        client.connect(port, host, () => {
            console.log('connected')
            let eventdata = `00+RR+00+T]00000001]50`
            let eventbytes = eventdata.split('')
            console.dir(eventbytes)
            eventbytes = eventbytes.map(v => v.charCodeAt(0))
            console.dir(eventbytes)
            let size = eventbytes.length
            let checksum = [size, 0, ...eventbytes].reduce((a, p) => a ^ p)
            //eventbytes.write(checksum)
            const dataSend = Buffer.from([0x02, size, 0, ...eventbytes, checksum, 0x03])
            console.log(`sending data ${dataSend}`)
            console.dir(dataSend)
            client.write(dataSend)
            //client.write("\n")
        })
    })
}

leTag('192.168.111.4', 3000)
