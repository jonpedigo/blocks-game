var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/dist/index.html')
})

// Set static file location for production
app.use(express.static(require('path').resolve('./client/dist')))

let heros = {

}
let herosockets = {

}
let serverState = []
let grid = []
let gridNodeSize = 0
let gridSize = 0
let preferences = {

}

const worlds = {

}

io.on('connection', function(socket){
  //objects


  socket.on('saveWorld', (name) => {
    let data = {
      objects: serverState,
      heros,
      preferences,
      grid,
      gridNodeSize,
      gridSize,
    };

    if(!name) {
      name = Date.now()
    }
    fs.writeFile('./data/' + name + '.json', JSON.stringify(data), 'utf8', () => {
      console.log('world' + name + ' saved')
    });
  })

  // this is for when one player on a network wants to get a world
  socket.on('getWorld', (name) => {
    fs.readFile('./data/' +name+'.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
      let obj = JSON.parse(data); //now it an object
      socket.emit('onSetWorld', obj)
    }});
  })

  // this is for when we are editing and we want to send this world to all people
  socket.on('setWorld', (name) => {
    fs.readFile('./data/' +name+'.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
      let obj = JSON.parse(data); //now it an object
      io.emit('onSetWorld', obj)
    }});
  })

  socket.on('saveSocket', (hero) => {
    herosockets[hero.id] = socket
    heros[hero.id] = hero
  })

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
    if(!heros[hero.id]) {
      heros[hero.id] = hero
    }
    io.emit('onHeroPosUpdate', hero)
  })
  socket.on('updateHero', (hero) => {
    if(!heros[hero.id]) {
      heros[hero.id] = hero
    }
    io.emit('onUpdateHero', hero)
  })
  socket.on('resetHero', (hero) => {
    delete heros[hero.id]
    io.emit('onResetHero', hero)
  })
  socket.on('respawnHero', (hero) => {
    io.emit('onRespawnHero', hero)
  })
  socket.on('askHeros', () => {
    for(let heroId in heros) {
      socket.emit('onUpdateHero', heros[heroId])
    }
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
