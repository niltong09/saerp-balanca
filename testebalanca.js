const balancaClient = require('./balancaClient')

const cl = new balancaClient('192.168.111.21', 4001)
cl.lePeso().then(async peso => {
  console.log('Readed peso', peso)
  console.log('Last Error', cl.lastError)
  if (peso.estavel * 1 == 0 || peso.fotocelula * 1 == 1) {
    await sleep(5000)
    let peso1 = await cl.lePeso()
    console.log('New peso', peso1)
  }
}).catch(err => {
  console.log('error on read peso', err)
})
