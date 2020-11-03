var io = {};

module.exports = (server, serveradmin) => {
  io = require('socket.io')(server);
  io.on('connection', function (socket) {
    console.log(socket + ' a user connected');
  });
}
