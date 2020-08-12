const onvif = require('node-onvif')
const connClient = require('./connClient')
const fs = require('fs')

class cameraClient extends connClient {

  user = ''
  pass = ''

  constructor(host, user, pass) {
    super(host, 0)
    this.user = user
    this.pass = pass
  }

  async snapshot() {
    let device = new onvif.OnvifDevice({
      xaddr: `http://${this.host}/onvif/device_service`,
      user: this.user,
      pass: this.pass
    })

    await device.init()
    const res = await device.fetchSnapshot()
    return res.body
  }
}

//console.log('Start the discovery process.');
// Find the ONVIF network cameras.
// It will take about 3 seconds.
/*
onvif.startProbe().then((device_info_list) => {
  console.log(device_info_list.length + ' devices were found.');
  // Show the device name and the URL of the end point.
  device_info_list.forEach((info) => {
    console.log('- ' + info.urn);
    console.log('  - ' + info.name);
    console.log('  - ' + info.xaddrs[0]);
  });
}).catch((error) => {
  console.error(error);
});
*/

/*
async function snapshotCamera(host, user, pass) {
  // Create an OnvifDevice object
  let device = new onvif.OnvifDevice({
    xaddr: `http://${host}/onvif/device_service`,
    user,
    pass
  })

  await device.init()
  const res = await device.fetchSnapshot()
  return res.body
}
*/

/*
snapshotCamera('192.168.111.23', 'admin', 'admin').then(data => {
    fs.writeFileSync('teste.txt', data, { encoding: 'binary' })
})
*/

const client = new cameraClient('192.168.111.23', 'admin', 'admin')
/*
client.snapshot().then(data => {
  fs.writeFileSync('teste.jpg', data, { encoding: 'binary' })
}).catch(e => {
  console.log('error', e)
})*/

module.exports = cameraClient