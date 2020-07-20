var express = require('express')
var fs = require('fs');
var socketEvents = require('./sockets.js')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

io.on('connection', (socket) => {
  socketEvents(fs, io, socket)
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/dist/index.html')
})

console.log(path.join(__dirname, 'client/public'))

app.use(function(req) {
  console.log(req.path)
})

app.use('/assets', express.static(path.join(__dirname, 'client/public')))
app.use(express.static(path.join(__dirname, 'client/dist')))


server.listen(process.env.PORT || 4000, function(){
  console.log('listening on *:' + (process.env.PORT || 4000));
});
