const connClient = require("./connClient");
const net = require('net')

class antClient extends connClient {
  processingTags = [];
  bufferStr = ""

  convertDecHexWiegand(strdec) {
    if (strdec.length < 8) {
      return "";
    }
    const strnorm = strdec.substr(-8);
    const parte1 = strnorm.substr(0, 3) * 1;
    const parte2 = strnorm.substr(-5) * 1;
    return `${parte1.toString(16)}${parte2.toString(16).padStart(4, "0")}`;
  }

  startAntMonitor(tagCallback, port = 0) {
    const self = this;
    self.addReadWatcher(async (tag) => {
      // console.log(`tag ${tag.toString().length}`);
      if (self.port == 4001 || self.port == 4002) {
        // leitor de cod barras usar buffer
            if (tag.toString().substr(-1) != "\n" && tag.toString().substr(-1) != "\r") {
              self.bufferStr += tag.toString()
              return;
            } else {
              tag = self.bufferStr + tag.toString()
              self.bufferStr = ""
          }
      }

      }
      if (tag.toString().length > 3) {
        if (tag.length == 65) {
          // Tag de antena henry
          // TODO: Descobrir como transformar provavelmente Wiegard para outro formato
          // Dados: <79+REON+000+0]00000000000013658925]14/04/2020 10:07:07]1]0]2F
          const parsedTag = this.convertDecHexWiegand(
            tag.toString().split("]")[1]
          );
          //   const antPort = tag.toString().substr(-2, 1) * 1;
          console.log("tag parsed", parsedTag, tag.toString());
          // if (self.processingTags.indexOf(parsedTag) == -1) {
          //   self.processingTags.push(parsedTag);
          try {
            await tagCallback(parsedTag);
          } catch (e) {
            console.log(
              `Error ocurred on processing the tag ${parsedTag} ${e}`
            );
          }
          //   self.processingTags.splice(
          //     self.processingTags.indexOf(parsedTag),
          //     1
          //   );
          // }
        } else {
          const parsedTag = tag
            .toString()
            .replace("\r", "")
            .replace("\n", "")
            .replace("0x", "");
          // if (self.processingTags.indexOf(parsedTag) == -1) {
          //   console.log("Tag readed", parsedTag);
          //   self.processingTags.push(parsedTag);
          try {
            await tagCallback(parsedTag);
          } catch (e) {
            console.log(
              `Error ocurred on processing the tag ${parsedTag} ${e}`
            );
          }
          // self.processingTags.splice(
          //   self.processingTags.indexOf(parsedTag),
          //   1
          // );
          // }
        }
      }
    });
    return this.connect();
  }

  liberaTotem() {
    return this.sendComand("00+REON+00+1]3]LIBERADO SAIDA]13");
  }

  _createComandFrame(comand) {
    let eventbytes = comand.split("");
    eventbytes = eventbytes.map((v) => v.charCodeAt(0));
    let size = eventbytes.length;
    let checksum = [size, 0, ...eventbytes].reduce((a, p) => a ^ p);
    return Buffer.from([0x02, size, 0, ...eventbytes, checksum, 0x03]);
  }

  sendComand(comand) {
    const frameCmd = this._createComandFrame(comand);
    return this.writeData(frameCmd);
  }
}
/*
const ant = new antClient("192.168.111.51", 3000);
ant.startAntMonitor(async (tag) => {
  console.log(`Readed ${tag}`);
});
*/

function connect(host, port, onReceiveTag) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket()
        let bufferstr = "";

        client.on('error', err => {
            reject(err)
        })

        client.on('data', data => {
            console.log('data received', data, data.toString())
            if (data.toString().substr(-1) != "\n" && data.toString().substr(-1) != "\r") {
              bufferstr += data.toString()
              return;
            } else {
              bufferstr += data.toString()
      }
            if (bufferstr.length < 5) {
                return;
            }
            //console.log('data len', data.toString().length)
            if (bufferstr.length == 65) {
                // Antena henry leitura decimal
                // Dados: <79+REON+000+0]00000000000013658925]14/04/2020 10:07:07]1]0]2F
                const splitedData = bufferstr.toString('ascii').split(']')
                console.log('matricula', splitedData[1], (splitedData[1] * 1).toString(16))
                onReceiveTag(splitedData[1])
            } else {
                onReceiveTag(bufferstr.toString().replace("\r", "").replace("\n", ""))
            }
            bufferstr = "";
        })

        client.on('close', () => {
            console.log(`closing connection ${host}:${port}`)
        })

        client.connect(port, host, () => {
            console.log(`connected to ${host}:${port}`)
            resolve(client)
            //let eventdata = `00+RR+00+T]00000001]50`
        })
    })
}

function sendComand(client, comand) {
    let eventbytes = comand.split('')
    eventbytes = eventbytes.map(v => v.charCodeAt(0))
    let size = eventbytes.length
    let checksum = [size, 0, ...eventbytes].reduce((a, p) => a ^ p)
    const dataSend = Buffer.from([0x02, size, 0, ...eventbytes, checksum, 0x03])
    return client.write(dataSend)
}


const host = '192.168.111.10'
const port = 4002
connect(host, port, tag => {
    console.log('Readed tag', tag)

}).then(client => {
    //sendComand(client, "00+RR+00+T]00000001]50")
})
module.exports = antClient;
