const maClient = require('./maClient')
const balancaClient = require('./balancaClient')
const antClient = require('./antClient')
const sleep = require('./sleep')
const net = require('net')

async function monitorAntena() {
    const ant = new antClient('192.168.111.12', 8081)
    ant.startAntMonitor(tag => {
        return fluxoPesagem(tag)
    })
}

async function fluxoPesagem(tag) {
    const ma = new maClient('192.168.0.103', 5000)
    const balanca = new balancaClient('192.168.111.11', 4001)
    console.log('Pesando tag', tag)
    try {
        await ma.monitorState() // Start monitoring state
        // Action cancela
        await ma.execAction(1, 1)
        //await sleep(5000) // Wait for 5 seconds
        await ma.waitForPassing(3, 35)
        await ma.waitState(3, 1)
        await sleep(5000) // Wait for 5 seconds
        // Action cancela
        await ma.execAction(2, 2)
        await sleep(5000) // Wait for 5 seconds
        // Tries to weight
        let validPeso = await balanca.getValidPeso()
        if (validPeso.peso < 60) {
            throw new Error(`O peso de ${validPeso.peso} é invalido!`)
        }
        console.log(`got valid weight ${validPeso.peso}`)
        // Got the weight then continues to close open and close cancela
        await ma.execAction(1, 1)
        //await sleep(5000) // Wait for 5 seconds
        await ma.waitForPassing(3, 35)
        await ma.waitState(3, 1)
        await sleep(5000) // Wait for 5 seconds
        // Action cancela
        await ma.execAction(2, 2)
        ma.close()
    } catch (e) {
        ma.close()
        console.log('error on fluxoPesagem', e)
    }
}

//monitorAntena()

const mockServer = net.createServer(c => {
    c.on('data', dt => {
        console.log('received data', dt)
        console.log('dt string', dt.toString())
    })
    c.on('end', dt => {
        console.log('ending conn', dt)
    })
})

mockServer.on('error', err => {
    console.log('error on server', err)
})

mockServer.on('close', () => {
    console.log('server finished')
})

mockServer.listen(2101, () => {
    console.log('listening')
})