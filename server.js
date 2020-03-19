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
let grid = require('./defaultGrid');
let gridNodeSize = 40
let gridSize = { x: 50, y: 50}
let preferences = {

}

const worlds = {

}

io.on('connection', function(socket){
  socket.on('saveSocket', (hero) => {
    herosockets[hero.id] = socket
    heros[hero.id] = hero
  })

  socket.on('saveWorld', (name) => {
    let data = {
      objects: serverState,
      heros,
      preferences,
      grid,
      gridNodeSize,
      gridSize,
    };

    if(!preferences.shouldRestoreHero && !preferences.isAsymmetric) {
      if(Object.keys(heros).length > 1) {
        console.log("ERROR, two heros sent to a non asymettric, non restoring world")
      }
      for(var heroId in heros) {
      }
      data.hero = heros[heroId]
    }

    if(!name) {
      name = Date.now()
    }
    fs.writeFile('./data/' + name + '.json', JSON.stringify(data), 'utf8', () => {
      console.log('world' + name + ' saved')
    });
  })

  // this is for when one player on a network wants to get a world... should all be 1 -hero games?
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
      serverState = obj.objects
      heros = obj.heros
      preferences = obj.preferences
      grid = obj.grid || []
      gridNodeSize = obj.gridNodeSize || 40
      gridSize = obj.gridSize || { x: 50, y: 50 }
      io.emit('onSetWorld', obj)
    }});
  })

  //objects
  socket.on('updateObjects', (objects) => {
    serverState = objects
    io.emit('onUpdateObjects', serverState)
  })
  socket.on('editObjects', (objects) => {
    Object.assign(serverState, objects)
    io.emit('onEditObjects', serverState)
  })
  socket.on('resetObjects', (objects) => {
    serverState = []
    io.emit('onResetObjects')
  })
  socket.on('removeObject', (object) => {
    for(let i = 0; i < serverState.length; i++) {
  		if(serverState[i].id === object.id){
  			serverState.splice(i, 1)
  			break;
  		}
  	}
    io.emit('onRemoveObject', object)
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
  socket.on('resetPreferences', (updatedPreferences) => {
    preferences = {}
    io.emit('onResetPreferences', updatedPreferences)
  })

  //hero
  socket.on('updateHeroPos', (hero) => {
    if(!heros[hero.id]) {
      heros[hero.id] = hero
    } else {
      heros[hero.id] = hero
      heros[hero.id] = hero
    }
    io.emit('onHeroPosUpdate', hero)
  })
  socket.on('updateHero', (hero) => {
    heros[hero.id] = hero
    io.emit('onUpdateHero', hero)
  })
  socket.on('resetHero', (hero) => {
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
  socket.on('deleteHero', (id) => {
    delete heros[id]
    io.emit('onDeleteHero', id)
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

  socket.on('updateGridNode', (gridPos, update) => {
    Object.assign(grid[gridPos.x][gridPos.y], update)
    io.emit('onUpdateGridNode', gridPos, update)
  })

  socket.on('askGrid', () => {
    io.emit('onUpdateGrid', grid, gridNodeSize, gridSize)
  })
});

http.listen(process.env.PORT || 4000, function(){
  console.log('listening on *:' + (process.env.PORT || 4000));
});
