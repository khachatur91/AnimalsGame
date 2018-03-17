var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io').listen(server)

app.use(express.static('dist'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html')
})
server.listen(process.env.PORT || 3000, function () {
  console.log('Listening on ' + server.address().port)
})

var rooms = new Map()

io.on('connection', function (socket) {
  var setRoomData = function (roomInstance, data) {
    console.log(roomInstance)
    console.log(data)
    if (data.user === 'student') {
      if (roomInstance.studentSocketId && io.sockets.connected[roomInstance.studentSocketId]) {
        io.sockets.connected[roomInstance.studentSocketId].emit('disconnected', {message: 'Another student has logged in the same room', response: 300})
        io.sockets.connected[roomInstance.studentSocketId].disconnect()
      }
      roomInstance.studentSocketId = socket.id
    } else if (data.user === 'tutor') {
      if (roomInstance.tutorSocketId && io.sockets.connected[roomInstance.tutorSocketId]) {
        io.sockets.connected[roomInstance.tutorSocketId].emit('disconnected', {message: 'Another tutor has logged in the same room', response: 300})
        io.sockets.connected[roomInstance.tutorSocketId].disconnect()
      }
      roomInstance.tutorSocketId = socket.id
    }
  }

  socket.on('connectUser', function (data) {
    let roomInstance
    // retrieve a room if there is one with the room id or create a new room instance
    if (rooms.get(data.roomID)) {
      roomInstance = rooms.get(data.roomID)
      setRoomData(roomInstance, data)
    } else {
      roomInstance = {}
      setRoomData(roomInstance, data)
      rooms.set(data.roomID, roomInstance)
    }

    socket.room = roomInstance

    if (io.sockets.connected[socket.room.studentSocketId] && io.sockets.connected[socket.room.tutorSocketId]) {
      console.log('Successful Connection')
      io.sockets.connected[socket.room.tutorSocketId].emit('connected')
      io.sockets.connected[socket.room.studentSocketId].emit('connected')
    }

    socket.on('studentClick', function (data) {
      console.log(`studentClick ${data}`)
      io.sockets.connected[socket.room.tutorSocketId].emit('studentClick', data)
    })
    socket.on('tutorSelectAnimal', function (data) {
      console.log(`tutorSelectAnimal ${data}`)
      io.sockets.connected[socket.room.studentSocketId].emit('tutorSelectAnimal', data)
      io.sockets.connected[socket.room.tutorSocketId].emit('tutorSelectAnimal', data)
    })

    socket.on('disconnect', function () {
      if (socket.id === socket.room.tutorSocketId) {
        socket.room.tutorSocketId = null
        if (io.sockets.connected[socket.room.studentSocketId]) {
          io.sockets.connected[socket.room.studentSocketId].emit('disconnected', {message: 'Tutor is disconnected from the room', response: 301})
        }
      } else {
        socket.room.studentSocketId = null
        if (io.sockets.connected[socket.room.tutorSocketId]) {
          io.sockets.connected[socket.room.tutorSocketId].emit('disconnected', {message: 'Student is disconnected from the room', response: 301})
        }
      }
    })
  })
})
