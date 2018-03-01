const path = require('path');
const webpack = require('webpack');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

// Phaser webpack config
const phaserModule = path.join(__dirname, '/node_modules/phaser-ce/');
const phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
const pixi = path.join(phaserModule, 'build/custom/pixi.js');
const p2 = path.join(phaserModule, 'build/custom/p2.js');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const definePlugin = new webpack.DefinePlugin({
    __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true'))
});
var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io').listen(server)

app.use(express.static('dist'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html')
})

server.lastPlayderID = 0

server.listen(process.env.PORT || 3000, function () {
  console.log('Listening on ' + server.address().port)
})

io.on('connection', function (socket) {
  socket.on('newplayer', function () {
    socket.player = {
      id: server.lastPlayderID++,
      x: randomInt(100, 400),
      y: randomInt(100, 400)
    }
    socket.emit('allplayers', getAllPlayers())
    socket.broadcast.emit('newplayer', socket.player)

    socket.on('click', function (data) {
      console.log('click to ' + data.x + ', ' + data.y)
      socket.player.x = data.x
      socket.player.y = data.y
      io.emit('move', socket.player)
    })

    socket.on('disconnect', function () {
      io.emit('remove', socket.player.id)
    })
  })

  socket.on('test', function () {
    console.log('test received')
  })
})

function getAllPlayers () {
  var players = []
  Object.keys(io.sockets.connected).forEach(function (socketID) {
    var player = io.sockets.connected[socketID].player
    if (player) players.push(player)
  })
  return players
}

function randomInt (low, high) {
  return Math.floor(Math.random() * (high - low) + low)
}

module.exports = {
    entry: {

        app: [
            'babel-polyfill',
            path.resolve(__dirname, 'src/main.js')
        ],
        vendor: ['pixi', 'p2', 'phaser', 'webfontloader']
    },

    devtool: 'cheap-source-map',

    output: {
        pathinfo: true,
        path: path.resolve(__dirname, 'dist'),
        publicPath: '',
        filename: 'bundle.js'
    },

    watch: true,

    plugins: [
        definePlugin,

        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'/* chunkName= */,
            filename: 'vendor.bundle.js'/* filename= */
        }),

        new BrowserSyncPlugin({
            host: process.env.IP || 'localhost',
            port: process.env.PORT || 3000,
            server: {
                baseDir: ['./dist', './build']
            }
        }),

        new HtmlWebpackPlugin({
            template: 'index.template.ejs',
            hash: true,
            title: 'Animals'
        }),

        new CopyWebpackPlugin([{
            from: 'assets', to: 'assets'
        }])

    ],

    module: {
        rules: [
            {test: /\.js$/, use: ['babel-loader'], include: path.join(__dirname, 'src')},
            {test: /pixi\.js/, use: ['expose-loader?PIXI']},
            {test: /phaser-split\.js$/, use: ['expose-loader?Phaser']},
            {test: /p2\.js/, use: ['expose-loader?p2']},
        ]
    },

    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    },

    resolve: {
        alias: {
            'phaser': phaser,
            'pixi': pixi,
            'p2': p2
        }
    }
};
