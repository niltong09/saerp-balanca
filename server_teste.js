var net = require("net");

var server = net.createServer(function (socket) {
  socket.write("Echo server\r\n");
  socket.on("data", (data) => {
    console.log("data received", data);
  });
  socket.pipe(socket);
});

server.listen(2101, "192.168.111.25");
///// Mensagem Teste 1
///// <Buffer 01 02 02 82 0a 30 c5 54 45 53 54 45 20 31 00 03 ae>
//<Buffer 01 02 02 82 11 30 c5 54 45 53 54 45 20 31 54 45 53 54 45 20 31 00 03 ae>
//<Buffer 01 02 01 82 11 31 c5 54 45 53 54 45 20 31 54 45 53 54 45 20 31 00 03 ae>
///// OutQuick
///// <Buffer 01 02 02 83 00 03 7e>
