const net = require('net')

function lePeso(host, port) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket()
        let allData = ''

        client.on('error', err => {
            reject(err)
        })

        client.on('data', data => {
            allData += data
            if (allData.length > 10000) {
                client.end()
            }
        })

        client.on('close', () => {
            try {
                while (allData.indexOf('  ') !== -1) {
                    allData = allData.replace('  ', ' ')
                }

                const pesosRecebidos = allData.split(' ').filter(v => v.length == 26)
                const pesosParsed = pesosRecebidos.map(v => {
                    if (v.length != 26) return null
                    return {
                        peso: v.substr(0, 7) * 1, // O peso
                        num_equipamento: v.substr(7, 2), // Equipamento
                        estavel: v.substr(9, 1), // 0 - Peso instavel, 1 - Peso estavel
                        peso_liquido: v.substr(10, 7) * 1, // Peso liquido
                        fotocelula: v.substr(17, 1), // 0 - Posicionado, 1 - Mal posicionado
                        resto: v.substr(18) // Nao implementado
                    }
                })
                const pesoFinal = pesosParsed.find(v => v.estavel == '1' && v.fotocelula == '0')
                resolve(pesoFinal)
            } catch (err) {
                reject(err)
            }
        })

        client.connect(port, host)
    })
}

module.exports = lePeso
