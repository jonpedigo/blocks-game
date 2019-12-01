var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

let serverState = []
let preferences = {}

io.on('connection', function(socket){
  //objects
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

  //preferences
  socket.on('askPreferences', () => {
    socket.emit('onUpdatePreferences', preferences)
  })
  socket.on('updatePreferences', (updatedPreferences) => {
    Object.assign(preferences, updatedPreferences)
    io.emit('onUpdatePreferences', updatedPreferences)
  })

  //hero
  socket.on('updateHeroPos', (hero) => {
    io.emit('onHeroPosUpdate', hero)
  })
  socket.on('updateHero', (hero) => {
    io.emit('onUpdateHero', hero)
  })
});

http.listen(8081, function(){
  console.log('listening on *:8081');
});
