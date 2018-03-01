var Client = {}
Client.socket = io.connect()

Client.sendTest = function () {
  console.log('test sent')
  Client.socket.emit('test')
}

Client.askNewPlayer = function () {
  Client.socket.emit('newplayer')
}

Client.sendClick = function (x, y) {
  Client.socket.emit('click', {x: x, y: y})
}

export default Client
