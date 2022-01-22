const net = require("net");
const sleep = require("./sleep");
const connClient = require("./connClient");

function checkArrGE(arr1, arr2, arrv) {
  let checkArr = false;
  for (let i of arrv) {
    checkArr = checkArr || arr1[i] >= arr2[i];
  }
  return checkArr;
}

function checkArrE(arr1, arr2, arrv) {
  let checkArr = false;
  for (let i of arrv) {
    checkArr = checkArr || arr1[i] * 1 == arr2[i] * 1;
  }
  return checkArr;
}

function checkArrNE(arr1, arr2, arrv) {
  let checkArr = false;
  for (let i of arrv) {
    checkArr = checkArr || arr1[i] * 1 != arr2[i] * 1;
  }
  return checkArr;
}

class maClient extends connClient {
  state = new Array(16).fill("0");
  timesChanged = new Array(16).fill(0);

  onPin(pinno) {
    if (pinno < 0 || pinno > 16) {
      throw new Error(`The pin to turn on ${pinno} is invalid`);
    }
    console.log(`SET ${pinno}`);
    return this.writeData(`SET ${pinno}\n`);
  }

  query() {
    return this.writeData(`QUERY\n`); // Get state of the pins now
  }

  offPin(pinno) {
    if (pinno < 0 || pinno > 16) {
      throw new Error(`The pin to turn on ${pinno} is invalid`);
    }
    console.log(`RESET ${pinno}`);
    return this.writeData(`RESET ${pinno}\n`);
  }

  async pulsePin(pinno, pulseSize = 1000) {
    await this.onPin(pinno);
    await sleep(pulseSize);
    await this.offPin(pinno);
  }

  async monitorState(callback) {
    const self = this;
    await self.addReadWatcher((data) => {
      const datas = data.toString().split("\n");
      datas.forEach((data) => {
        if (/^2[0-9][0-9] [0-9a-fA-F]{4}/.test(data.toString())) {
          const hexPin = data.toString().split(" ")[1];
          // console.log(hexPin);
          const pins = ("0".repeat(16) + parseInt(hexPin, 16).toString(2))
            .substr(-16)
            .split("")
            .reverse();
          for (let i = 0; i < self.timesChanged.length; i++) {
            self.timesChanged[i] += pins[i] != self.state[i] ? 1 : 0;
          }
          self.state = pins;
          if (typeof callback === "function") {
            callback(pins);
          }
          // console.log(`State updated ${pins.join(",")}`);
          // console.log(`timesChanged updated ${self.timesChanged.join(",")}`);
        }
      });
    });
    await self.writeData(`QUERY\n`); // Get the initial state
    return self.writeData(`NOTIFY ON\n`); // Set Monitoring to futher update the state
  }

  close() {
    return this.writeData(`QUIT\n`);
  }

  /// Pulse a pin and wait for an input to turn on
  async execAction(output, input) {
    await this.pulsePin(output);
    let ntries = 0;
    while (this.state[input - 1] * 1 != 1 && ntries < 20) {
      await sleep(500);
      await this.query();
      ntries++;
    }
    if (ntries > 4 && this.state[input - 1] * 1 != 1) {
      console.log("action failed");
      throw new Error(`Action out ${output} in ${input} failed`);
    }
    return this;
  }

  waitForPassing(pinno, waittime = 30) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      let ntries = 0;
      console.log("waiting for ", pinno);
      if (Array.isArray(pinno)) {
        let nch = [...self.timesChanged];
        let pinnom = pinno.map((v) => v - 1);
        while (
          checkArrGE(nch, self.timesChanged, pinnom) &&
          ntries < waittime * 2
        ) {
          console.log("waiting for ", pinno);
          await sleep(500);
          ntries++;
        }
        if (
          ntries >= waittime * 2 &&
          checkArrGE(nch, self.timesChanged, pinnom)
        ) {
          reject("Not passed");
        }
        resolve("passed");
      } else {
        let nch = self.timesChanged[pinno - 1] * 1;
        while (
          nch >= self.timesChanged[pinno - 1] * 1 &&
          ntries < waittime * 2
        ) {
          console.log("waiting for ", pinno);
          await sleep(500);
          ntries++;
        }
        if (ntries >= waittime * 2 && nch >= self.timesChanged[pinno - 1]) {
          reject("Not passed");
        }
        resolve(self.timesChanged[pinno - 1] - nch);
      }
    });
  }

  async waitState(pinno, wishState) {
    if (Array.isArray(pinno)) {
      const pinnom = pinno.map((v) => v - 1);
      const arrV = new Array(16).fill(0);
      for (let i of pinnom) {
        arrV[i] = wishState;
      }
      await this.query();
      while (checkArrNE(this.state, arrV, pinnom)) {
        console.log("waiting for", pinno, wishState);
        await this.query();
        await sleep(500);
      }
    } else {
      await this.query();
      while (this.state[pinno - 1] * 1 != wishState) {
        console.log("waiting for ", pinno, wishState);
        await this.query();
        await sleep(500);
      }
    }
    return this;
  }
}
/*
const test = new maClient('192.168.0.103', 5000)
test.monitorState().then(async () => {
    console.log(`${new Date()}`)
    await test.pulsePin(1)
    console.log(`${new Date()}`)
    /*
    await test.execAction(1, 1)
    await test.waitForPassing([3, 4], 30)
    await test.waitState([3, 4], 1)
    await sleep(5000) // Waits 5 seconds then closes the cancela
    await test.execAction(2, 2)
    test.close()
})*/

module.exports = maClient;
