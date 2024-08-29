const connClient = require("./connClient");
const sleep = require("./sleep");
//const net = require('net')

function eliminateDoubleSpace(str) {
  while (str.indexOf("  ") !== -1) {
    str = str.replace("  ", " ");
  }
  return str;
}

function parsePeso(str) {
  const splStr = str.split(" ");
  const pesosParsed = [];
  for (let i = 0; i < splStr.length; i++) {
    if (splStr[i].length < 26) {
      // The string of the weight is not full ignore partial string
      continue;
    }
    const pesoParsed = {
      peso: splStr[i].substr(0, 7) * 1, // O peso
      num_equipamento: splStr[i].substr(7, 2), // Equipamento
      estavel: splStr[i].substr(9, 1), // 0 - Peso instavel, 1 - Peso estavel
      peso_liquido: splStr[i].substr(10, 7) * 1, // Peso liquido
      fotocelula: splStr[i].substr(17, 1), // 0 - Posicionado, 1 - Mal posicionado
      resto: splStr[i].substr(18), // Nao implementado
    };
    pesosParsed.push(pesoParsed);
  }
  return pesosParsed;
}

class balancaClient extends connClient {
  data = "";
  lastPesoRead = null;

  async lePeso() {
    const self = this;
    if (this.readwatchers.length < 1) {
      this.addReadWatcher((reading) => {
        reading = eliminateDoubleSpace(reading.toString());
        if (reading.length < 26) {
          const dtadd = self.data + reading;
          if (dtadd.length < 26) {
            self.data = dtadd;
          } else {
            const pesosParsed = parsePeso(dtadd);
            if (pesosParsed.length > 1) {
              self.data = "";
              self.lastPesoRead = pesosParsed.pop();
              self.lastPesoRead.timestamp = new Date();
            } else {
              self.data += reading;
            }
          }
        } else {
          const pesosParsed = parsePeso(reading);
          if (pesosParsed.length > 0) {
            self.data = "";
            self.lastPesoRead = pesosParsed.pop();
            self.lastPesoRead.timestamp = new Date();
          } else {
            self.data += reading;
          }
        }
      });
    }
    let dt = new Date();
    if (this.lastPesoRead !== null) {
      dt = this.lastPesoRead.timestamp;
    } else {
      this.lastPesoRead = {
        timestamp: dt,
      };
    }
    let tried = 0
    await this.connect();
    console.log("balanca connect")
    while (this.lastPesoRead.timestamp.getTime() <= dt.getTime() && tried < 5) {
      await sleep(900);
      tried++
      console.log("balanca trying leitura", this.lastPesoRead, tried)
    }
    try {
      console.log("balanca disconnect")
      await this.disconnect();
    } catch (e) {
      console.log("error on disconnect", e);
    }
    return this.lastPesoRead;
  }

  async getValidPeso(ntries = 30) {
    let peso = await this.lePeso();
    let tried = 0;
    while (
      tried < ntries &&
      (peso.estavel * 1 == 0 || peso.fotocelula * 1 == 1)
    ) {
      await sleep(500);
      peso = await this.lePeso();
      tried++
    }
    if (peso.estavel * 1 == 0 || peso.fotocelula * 1 == 1) {
      throw new Error("Não foi possivel buscar um peso valido");
    }
    return peso;
  }
}
/*
function lePeso(host, port) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket()
        let allData = ''

        client.on('error', err => {
            reject(err)
        })

        client.on('data', data => {
            allData += data
            if (allData.length > 100) {
                client.end()
            }
        })

        client.on('close', () => {
            try {
                while (allData.indexOf('  ') !== -1) {
                    allData = allData.replace('  ', ' ')
                }

                const pesosRecebidos = allData.split(' ').filter(v => v.length == 26)
                const pesosParsed = pesosRecebidos.map(v => {
                    if (v.length != 26) return null
                    return {
                        peso: v.substr(0, 7) * 1, // O peso
                        num_equipamento: v.substr(7, 2), // Equipamento
                        estavel: v.substr(9, 1), // 0 - Peso instavel, 1 - Peso estavel
                        peso_liquido: v.substr(10, 7) * 1, // Peso liquido
                        fotocelula: v.substr(17, 1), // 0 - Posicionado, 1 - Mal posicionado
                        resto: v.substr(18) // Nao implementado
                    }
                })
                const pesoFinal = pesosParsed.find(v => v.estavel == '1' && v.fotocelula == '0')
                resolve(pesoFinal)
            } catch (err) {
                reject(err)
            }
        })

        client.connect(port, host)
    })
}*/
/*
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
*/
//lePeso('192.168.111.11', 4001).then(peso => console.log(peso))
module.exports = balancaClient;