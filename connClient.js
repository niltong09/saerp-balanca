const net = require("net");

module.exports = class {
  host = "";
  port = 0;
  sock = null;
  readwatchers = [];
  disconnectwatchers = [];
  lastError = null;

  constructor(host, port) {
    this.host = host;
    this.port = port;
  }

  connect() {
    const self = this;
    return new Promise((resolve, reject) => {
      // Check the host and port setting
      console.log("connecting", self.host, self.port);
      if (!self.host || !self.port) {
        console.log("Host invalid", self.host, self.port);
        reject(`The host ${self.host}:${self.port} is invalid!`);
      }
      // Check the if the sock is not initialized
      if (self.sock !== null && self.sock.destroyed != true) {
        // Alreeady is connected
        console.log("Already connected");
        return resolve(self);
      }
      self.sock = new net.Socket();
      self.sock.on("data", (data) => self._onReadData(data));
      self.sock.on("error", (err) => (self.lastError = err));
      self.sock.on("close", () => self.dispatchDisconnect());
      self.sock.on("timeout", () => {
        self.sock.destroy();
        self.dispatchDisconnect();
      });
      self.sock.connect(self.port, self.host, (err) => {
        if (err) {
          self.sock = null;
          self.dispatchDisconnect();
          console.log("error on connect", err);
          reject(
            `Error occurred on connect to ${self.host}:${self.port}: ${err}`
          );
        }
        console.log("Connected");
        resolve(self);
      });
    });
  }

  dispatchDisconnect() {
    this.disconnectwatchers.forEach(
      (watcher) => typeof watcher === "function" && watcher()
    );
  }

  disconnect() {
    const self = this;
    return new Promise((resolve, reject) => {
      if (!!self.sock && self.sock.destroyed != true) {
        try {
          self.sock.end((err) => {
            if (err) {
              reject(err);
            }
            self.sock.destroy(() => {
              self.sock = null;
              resolve(self);
            });
          }); // Send the FIN package
        } catch (e) {
          reject(e);
        }
      }
      resolve(self);
    });
  }

  writeData(data) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        await self.connect(); // Make sure is connected or connect if not connected
        self.sock.write(data, (err) => {
          if (err) {
            reject(err);
          }
          resolve(self);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  _onReadData(data) {
    // console.log("readed ", data.toString());
    console.log("read data ", this.host, this.readwatchers.length);
    this.readwatchers.forEach((wt) => {
      wt(data);
    });
  }

  addReadWatcher(watcher) {
    if (typeof watcher !== "function") {
      throw new Error(
        `A watcher must be a callback function with data as parameter`
      );
    }
    this.readwatchers.push(watcher);
  }
};
