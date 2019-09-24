var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

let serverState = []

io.on('connection', function(socket){
  socket.on('updateObjects', (objects) => {
    serverState = objects
    io.emit('onUpdateObjects', serverState)
  })
  socket.on('askObjects', () => {
    socket.emit('onAddObjects', serverState)
  })
  socket.on('addObjects', (objects) => {
    serverState.push(...objects)
    io.emit('onAddObjects', serverState)
  })

  socket.on('updateHeroPos', (hero) => {
    io.emit('onHeroPosUpdate', hero)
  })
});

http.listen(8081, function(){
  console.log('listening on *:8081');
});
