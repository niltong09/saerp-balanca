const snapshotCamera = require('../cameraClient')

test('try to take a camera snapshot', done => {
    snapshotCamera('192.168.111.23', 'admin', 'admin').then(data => {
        expect(data).toBeDefined()
        done()
    })
})