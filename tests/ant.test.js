const antClient = require('../antClient')

test("Connects send comand and receive to henry device", async done => {
    const client = await antClient.connect('192.168.111.4', 3000, tag => {
        expect(tag).toBeDefined()
    })
    //expect(antClient.sendComand(client, '00+RR+00+T]00000001]50')).toBe(true)
    client.end()
    setTimeout(() => {
        console.log('terminating')
        client.destroy()
        done()
    }, 3000)
})

test("Connects and receive data from another antena", async done => {
    const client = await antClient.connect('192.168.111.12', 8081, tag => {
        expect(tag).toBeDefined()
    })
    setTimeout(() => {
        console.log('terminating')
        client.end()
        client.destroy()
        done()
    }, 3000)
})