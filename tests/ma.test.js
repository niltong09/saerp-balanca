const enviaComando = require('../maClient')

test('Test a query on the MA', done => {
    enviaComando('QUERY', '192.168.111.2', 5000).then(data => {
        console.log('query received', data)
        expect(data).toBeDefined()
        done()
    })
})
