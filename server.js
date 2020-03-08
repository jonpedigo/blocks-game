var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/dist/index.html')
})

// Set static file location for production
app.use(express.static(require('path').resolve('./client/dist')))

let serverState = []
let grid = []
let gridNodeSize = 0
let gridSize = 0
let preferences = {}

io.on('connection', function(socket){
  //objects
  socket.on('updateObjects', (objects) => {
    serverState = objects
    io.emit('onUpdateObjects', serverState)
  })
  socket.on('editObjects', (objects) => {
    serverState = objects
    io.emit('onEditObjects', serverState)
  })
  socket.on('resetObjects', (objects) => {
    serverState = []
    io.emit('onResetObjects')
  })
  socket.on('removeObject', (id) => {
    for(let i = 0; i < serverState.length; i++) {
  		if(serverState[i].id === id){
  			serverState.splice(i, 1)
  			break;
  		}
  	}
    io.emit('onRemoveObject', id)
  })
  socket.on('askObjects', () => {
    socket.emit('onAddObjects', serverState)
  })
  socket.on('addObjects', (objects) => {
    serverState.push(...objects)
    io.emit('onAddObjects', objects)
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
  socket.on('resetHero', (hero) => {
    io.emit('onResetHero', hero)
  })

  socket.on('respawnHero', (hero) => {
    io.emit('onRespawnHero', hero)
  })

  //onSnapAllObjectsToGrid
  socket.on('snapAllObjectsToGrid', (hero) => {
    io.emit('onSnapAllObjectsToGrid', hero)
  })

  socket.on('updateGrid', (gridIn, gridNodeSizeIn, gridSizeIn) => {
    grid = gridIn
    gridNodeSize = gridNodeSizeIn
    gridSize = gridSizeIn
    io.emit('onUpdateGrid', grid, gridNodeSize, gridSize)
  })

  socket.on('askGrid', () => {
    if(grid.length) {
      io.emit('onUpdateGrid', grid, gridNodeSize, gridSize)
    }
  })
});

http.listen(process.env.PORT || 4000, function(){
  console.log('listening on *:' + (process.env.PORT || 4000));
});
