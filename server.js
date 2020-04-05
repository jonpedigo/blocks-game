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

let herosockets = {

}

let currentGame = {
  world: {},
  heros: {},
  hero: {},
  objects: [],
  grid: {
    width: 50,
    height: 50,
    nodeSize: 40,
    startX: 0,
    startY: 0,
  }
}

let initialGame = 'default'
setGame(initialGame, (game) => {
  console.log('initial game set to ' + initialGame)
})

function setGame(name, cb) {
  fs.readFile('./data/' +name+'.json', 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
    let game = JSON.parse(data); //now it an gameect
    currentGame = game
    return cb(game)
  }});
}


io.on('connection', function(socket){
  socket.on('saveSocket', (hero) => {
    herosockets[hero.id] = socket
    currentGame.heros[hero.id] = hero
  })


  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  // Game
  ///////////////////////////
  ///////////////////////////
  socket.on('saveGame', (name) => {
    currentGame.name = name

    if(!currentGame.world.globalTags.shouldRestoreHero && !currentGame.world.globalTags.isAsymmetric) {
      if(Object.keys(currentGame.heros).length > 1) {
        console.log("ERROR, two heros sent to a non asymettric, non restoring world")
      }
      for(var heroId in currentGame.heros) {
      }
      currentGame.hero = currentGame.heros[heroId]
    }

    if(!name) {
      name = Date.now()
    }
    fs.writeFile('./data/' + name + '.json', JSON.stringify(currentGame), 'utf8', () => {
      console.log('game: ' + name + ' saved')
    });
  })

  // this is for when one player on a network wants to get a currentGame... should all be 1 -hero worlds?
  socket.on('getGame', (name) => {
    fs.readFile('./data/' +name+'.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
      let obj = JSON.parse(data); //now it an object
      socket.emit('onSetGame', obj)
    }});
  })

  // this is for when we are editing and we want to send this world to all people
  socket.on('setGame', (name) => {
    setGame(name, (game) => {
      io.emit('onSetGame', game)
    })
  })

  // this is really only for the live editing shit when im reloading their page all the time
  socket.on('askRestoreCurrentGame', () => {
    socket.emit('onAskRestoreCurrentGame', currentGame)
  })

  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  // Objects
  ///////////////////////////
  ///////////////////////////
  socket.on('anticipateObject', (object) => {
    io.emit('onAnticipateObject', object)
  })

  socket.on('updateObjects', (updatedobjects) => {
    currentGame.objects = updatedobjects
    io.emit('onUpdateObjects', currentGame.objects)
  })
  socket.on('editObjects', (editedobjects) => {
    currentGame.objects = editedobjects
    io.emit('onEditObjects', currentGame.objects)
  })
  socket.on('resetObjects', (objects) => {
    currentGame.objects = []
    io.emit('onResetObjects')
  })
  socket.on('removeObject', (object) => {
    io.emit('onRemoveObject', object)
  })
  socket.on('deleteObject', (object) => {
    for(let i = 0; i < currentGame.objects.length; i++) {
  		if(currentGame.objects[i].id === object.id){
  			currentGame.objects.splice(i, 1)
  			break;
  		}
  	}
    io.emit('onDeleteObject', object)
  })
  socket.on('askObjects', () => {
    socket.emit('onAddObjects', currentGame.objects)
  })
  socket.on('addObjects', (addedobjects) => {
    currentGame.objects.push(...addedobjects)
    io.emit('onAddObjects', addedobjects)
  })

  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  // World
  ///////////////////////////
  ///////////////////////////
  socket.on('askWorld', () => {
    socket.emit('onUpdateWorld', world)
  })
  socket.on('updateWorld', (updatedWorld) => {
    mergeDeep(currentGame.world, updatedWorld)
    io.emit('onUpdateWorld', updatedWorld)
  })
  socket.on('resetWorld', () => {
    io.emit('onResetWorld')
  })


  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  //HERO
  ///////////////////////////
  socket.on('updateHeroPos', (hero) => {
    if(!currentGame.heros[hero.id]) {
      currentGame.heros[hero.id] = hero
    } else {
      currentGame.heros[hero.id] = hero
    }
    io.emit('onHeroPosUpdate', hero)
  })
  socket.on('updateHero', (hero) => {
    currentGame.heros[hero.id] = hero
    io.emit('onUpdateHero', hero)
  })
  socket.on('resetHero', (hero) => {
    io.emit('onResetHero', hero)
  })
  socket.on('respawnHero', (hero) => {
    io.emit('onRespawnHero', hero)
  })
  socket.on('askHeros', () => {
    for(let heroId in currentGame.heros) {
      socket.emit('onUpdateHero', currentGame.heros[heroId])
    }
  })
  socket.on('deleteHero', (id) => {
    delete currentGame.heros[id]
    io.emit('onDeleteHero', id)
  })

  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  // GRIDS
  ///////////////////////////
  socket.on('snapAllObjectsToGrid', (hero) => {
    io.emit('onSnapAllObjectsToGrid', hero)
  })

  socket.on('updateGrid', (gridIn) => {
    currentGame.grid = gridIn
    io.emit('onUpdateGrid', gridIn)
  })

  socket.on('askGrid', () => {
    io.emit('onUpdateGrid', currentGame.grid)
  })
});

http.listen(process.env.PORT || 4000, function(){
  console.log('listening on *:' + (process.env.PORT || 4000));
});


/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}
