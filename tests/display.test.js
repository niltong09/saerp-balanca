const enviarMensagemDisplay = require('../displayClient')

test("Send some message to display", done => {
    // 12 caracteres por vez
    enviarMensagemDisplay("192.168.111.8", 2101, "TESTE").then(ret => {
        expect(ret).toBe(true)
        done()
    })
})