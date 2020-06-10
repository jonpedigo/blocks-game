var express = require('express')
var fs = require('fs');
var socketEvents = require('./sockets.js')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

io.on('connection', (socket) => {
  socketEvents(fs, io, socket)
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/dist/index.html')
})

server.listen(process.env.PORT || 4000, function(){
  console.log('listening on *:' + (process.env.PORT || 4000));
});
