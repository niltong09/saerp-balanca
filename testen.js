const maClient = require('./maClient')
const balancaClient = require('./balancaClient')
const antClient = require('./antClient')
const sleep = require('./sleep')
const net = require('net')

const taglidos = []

const ma = new maClient('192.168.111.10', 5000)
ma.monitorState() // Start monitoring state
async function monitorAntena() {
    const ant = new antClient('192.168.111.12', 8081)
    ant.startAntMonitor(tag => {
        if (taglidos.indexOf(tag) === -1) {
            taglidos.push(tag)
            //return fluxoPortaria(tag)
            return fluxoPesagem()
        }
    })
}

async function fluxoPortaria(tag) {
    //const balanca = new balancaClient('192.168.111.11', 4001)
    console.log('Pesando tag', tag)
    try {
        // Action cancela
        await ma.onPin(3)
        await ma.pulsePin(1)
        //await sleep(5000) // Wait for 5 seconds
        await ma.waitForPassing(3, 600)
        await ma.waitState(3, 1)
        await sleep(5000) // Wait for 5 seconds
        // Action cancela
        await ma.pulsePin(1)
        await ma.offPin(3)
        ma.close()
    } catch (e) {
        ma.close()
        console.log('error on fluxoPesagem', e)
    }
}

async function fluxoPesagem(tag) {
    //const ma = new maClient('192.168.0.103', 5000)
    const balanca = new balancaClient('192.168.111.11', 4001)
    console.log('Pesando tag', tag)
    try {
        await ma.monitorState() // Start monitoring state
        // Zera balanca
        await ma.pulsePin(5)
        await ma.pulsePin(6)
        // Action cancela
        await ma.execAction(1, 3)
        //await sleep(5000) // Wait for 5 seconds
        await ma.waitForPassing([1, 2], 90)
        await ma.waitState([1, 2], 1)
        await sleep(5000) // Wait for 5 seconds
        // Action cancela
        await ma.execAction(2, 4)
        await sleep(5000) // Wait for 5 seconds
        // Tries to weight
        let validPeso = await balanca.getValidPeso()
        if (validPeso.peso < 20) {
            throw new Error(`O peso de ${validPeso.peso} é invalido!`)
        }
        console.log(`got valid weight ${validPeso.peso}`)
        // Got the weight then continues to close open and close cancela
        await ma.execAction(3, 7)
        //await sleep(5000) // Wait for 5 seconds
        await ma.waitForPassing([5, 6], 120)
        await ma.waitState([5, 6], 1)
        await sleep(5000) // Wait for 5 seconds
        // Action cancela
        await ma.execAction(4, 8)
        ma.close()
    } catch (e) {
        ma.close()
        console.log('error on fluxoPesagem', e)
    }
}

monitorAntena()
/*
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
})*/