const net = require("net");

module.exports = class {
  host = "";
  port = 0;
  sock = null;
  readwatchers = [];
  disconnectwatchers = [];
  connectwatchers = [];
  lastError = null;
  cycling_reconnect = false;

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
      // self.sock.setKeepAlive(true, 5); // testar se funciona em todos os dispositivos
      self.sock.on("data", (data) => self._onReadData(data));
      self.sock.on("error", (err) => (self.lastError = err));
      self.sock.on("close", () => self.dispatchDisconnect());
      self.sock.on("timeout", () => {
        self.sock.destroy();
        self.dispatchDisconnect();
      });
      self.sock.connect({
        port: self.port,
        host: self.host,
        noDelay: true,
        keepAlive: true,
      }, (err) => {
        if (err) {
          self.sock = null;
          self.dispatchDisconnect();
          console.log("error on connect", err);
          reject(
            `Error occurred on connect to ${self.host}:${self.port}: ${err}`
          );
        } else {
          self.dispatchConnect();
          self.reconnectTries = 0;
          console.log("Connected")
          resolve(self);
        }
      });
    });
  }

  dispatchDisconnect() {
    if (this.cycling_reconnect) {
      return;
    }
    this.disconnectwatchers.forEach(
      (watcher) => typeof watcher === "function" && watcher()
    );
  }

  dispatchConnect() {
    this.connectwatchers.forEach(
      (watcher) => typeof watcher === "function" && watcher()
    );
  }

  disconnect() {
    const self = this;
    return new Promise((resolve, reject) => {
      if (!!self.sock && self.sock.destroyed != true) {
        console.log("disconnecting 1 ")
        try {
          self.sock.end((err) => {
            console.log("disconnecting 2 ")
            if (err) {
              reject(err);
            }
            console.log("disconnecting 3 ")
            // self.sock.destroy(() => {
            //   console.log("disconnecting 4 ")
            //   self.sock = null;
            //   resolve(self);
            // });
            self.sock = null;
            resolve(self);
          }); // Send the FIN package
        } catch (e) {
          reject(e);
        }
      } else {
        resolve(self);
      }
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
    let i = 0;
    for (const wt of this.readwatchers) {
      wt(data);
      i++;
    }
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