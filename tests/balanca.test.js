const lePeso = require('../balancaClient')

test("Le um peso da balanca", done => {
    lePeso('192.168.111.11', 4001).then(pesoFinal => {
        expect(pesoFinal).toBeDefined()
        done()
    })
})