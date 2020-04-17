const onvif = require('node-onvif')

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

/*
snapshotCamera('192.168.111.23', 'admin', 'admin').then(data => {
    fs.writeFileSync('teste.txt', data, { encoding: 'binary' })
})
*/

module.exports = snapshotCamera