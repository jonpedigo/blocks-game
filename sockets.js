let herosockets = {

}

// let initialGameId = 'default'
// setGame(initialGameId, (game) => {
//   console.log('initial game set to ' + initialGameId)
// })
let currentGame = {
  heros: {},
  hero: {},
  grid: {

  },
  objects: [],
  world: {},
}

let savedCustomCode = ''

function socketEvents(fs, io, socket, options = { arcadeMode: false }){
  // socket.on('saveSocket', (heroId) => {
  //   herosockets[heroId] = socket
  // })

  function getGame(id, cb) {
    fs.readFile('./data/' +id+'.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
      let game = JSON.parse(data); //now it an gameect
      delete game.heros
      delete game.gameState
      return cb(game)
    }});
  }

  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  // Game
  ///////////////////////////
  ///////////////////////////
  socket.on('saveGame', (game) => {
    fs.writeFile('data/' + game.id + '.json', JSON.stringify(game), 'utf8', (e) => {
      if(e) return console.log(e)
      else console.log('game: ' + game.id + ' saved')
    });
    io.emit('onGameSaved', game.id)
    currentGame = JSON.parse(JSON.stringify(game))
  })

  // this is for when one player on a network wants to get a currentGame... should all be 1 -hero worlds?
  socket.on('getGame', (id) => {
    fs.readFile('data/' +id+'.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
      let obj = JSON.parse(data); //now it an object
      socket.emit('onGetGame', obj)
    }});
  })

  // this is for when we are editing and we want to send this world to all people
  socket.on('setGame', (id) => {
    getGame(id, (game) => {
      currentGame = JSON.parse(JSON.stringify(game))
      io.emit('onSetGame', game)
    })
  })

  socket.on('setGameJSON', (game) => {
    currentGame = JSON.parse(JSON.stringify(game))
    io.emit('onSetGameJSON', game)
  })

  // this is for when we are editing and we want to send this world to all people
  socket.on('copyGame', (id) => {
    getGame(id, (game) => {
      game.id = currentGame.id
      currentGame = JSON.parse(JSON.stringify(game))
      io.emit('onCopyGame', game)
    })
  })

  // this is when the editor asks to load up a game
  socket.on('setAndLoadCurrentGame', (id) => {
    fs.readFile('./data/' +id+'.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
      let obj = JSON.parse(data); //now it an object
      currentGame = obj
      socket.emit('onLoadGame', currentGame)
    }});
  })

  socket.on('askJoinGame', (heroId) => {
    io.emit('onAskJoinGame', heroId)
  })

  socket.on('heroJoinedGamed', (hero) => {
    io.emit('onHeroJoinedGame', hero)
  })

  socket.on('removeHero', (hero) => {
    io.emit('onRemoveHero', hero)
  })

  // this is really only for the live editing shit when im reloading their page all the time
  socket.on('askRestoreCurrentGame', () => {
    socket.emit('onAskRestoreCurrentGame', currentGame)
  })

  // great to have a constantly updating object shared on all computers
  socket.on('updateGameState', (gameState) => {
    currentGame.gameState = gameState
    io.emit('onUpdateGameState', gameState)
  })

  socket.on('resetGameState', (gameState) => {
    io.emit('onResetGameState', gameState)
  })

  socket.on('editGameState', (gameState) => {
    currentGame.gameState = gameState
    io.emit('onEditGameState', gameState)
  })

  socket.on('addGameTag', (tagName) => {
    if(!currentGame.tags) {
      currentGame.tags = {}
    }
    currentGame.tags[tagName] = false
    io.emit('onAddGameTag', tagName)
  })

  socket.on('updateGameCustomInputBehavior', (customInputBehavior) => {
    if(!currentGame.customInputBehavior) {
      currentGame.customInputBehavior = {}
    }
    currentGame.customInputBehavior = customInputBehavior
    io.emit('onUpdateGameCustomInputBehavior', customInputBehavior)
  })

  socket.on('startGame', () => {
    io.emit('onStartGame')
  })

  socket.on('stopGame', () => {
    io.emit('onStopGame')
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
  socket.on('updateObjectsComplete', (updatedobjects) => {
    currentGame.objects = updatedobjects
    io.emit('onUpdateObjects', currentGame.objects)
  })
  socket.on('updateObjects', (updatedobjects) => {
    io.emit('onUpdateObjects', updatedobjects)
  })
  socket.on('editObjects', (editedobjects) => {
    io.emit('onEditObjects', editedobjects)
  })
  socket.on('resetObjects', (objects) => {
    io.emit('onResetObjects')
  })
  socket.on('removeObject', (object) => {
    io.emit('onRemoveObject', object)
  })
  socket.on('deleteObject', (object) => {
    // for(let i = 0; i < currentGame.objects.length; i++) {
  	// 	if(currentGame.objects[i].id === object.id){
  	// 		currentGame.objects.splice(i, 1)
  	// 		break;
  	// 	}
  	// }
    io.emit('onDeleteObject', object)
  })
  socket.on('askObjects', () => {
    socket.emit('onAddObjects', currentGame.objects)
  })
  socket.on('addObjects', (addedobjects) => {
    currentGame.objects.push(...addedobjects)
    io.emit('onAddObjects', addedobjects)
  })


  //// TRIGGERS
  socket.on('deleteTrigger', (ownerId, triggerId) => {
    io.emit('onDeleteTrigger', ownerId, triggerId)
  })
  socket.on('addTrigger', (ownerId, trigger) => {
    io.emit('onAddTrigger', ownerId, trigger)
  })
  socket.on('editTrigger', (ownerId, triggerId, trigger) => {
    io.emit('onEditTrigger', ownerId, triggerId, trigger)
  })


  /// SUB OBJECTS
  socket.on('deleteSubObject', (owner, subObjectName) => {
    io.emit('onDeleteSubObject', owner, subObjectName)
  })
  socket.on('addSubObject', (owner, subObject, subObjectName) => {
    io.emit('onAddSubObject', owner, subObject, subObjectName)
  })
  socket.on('removeSubObject', (ownerId, subObjectName) => {
    io.emit('onRemoveSubObject', ownerId, subObjectName)
  })
  socket.on('editSubObject', (ownerId, subObjectName, update) => {
    io.emit('onEditSubObject', ownerId, subObjectName, update)
  })


  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  // World
  ///////////////////////////
  ///////////////////////////
  socket.on('askWorld', () => {
    socket.emit('onUpdateWorld', currentGame.world)
  })
  socket.on('updateWorld', (updatedWorld) => {
    mergeDeep(currentGame.world, updatedWorld)
    io.emit('onUpdateWorld', updatedWorld)
  })
  socket.on('resetWorld', () => {
    io.emit('onResetWorld')
  })
  socket.on('updateWorldOnServerOnly', (updatedWorld) => {
    mergeDeep(currentGame.world, updatedWorld)
  })


  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  //GAME.heros[HERO.id]
  ///////////////////////////
  socket.on('sendHeroInput', (input, hero) => {
    io.emit('onSendHeroInput', input, hero)
  })
  socket.on('sendHeroKeyDown', (keyCode, hero) => {
    io.emit('onSendHeroKeyDown', keyCode, hero)
  })
  socket.on('updateHero', (hero) => {
    currentGame.heros[hero.id] = hero
    io.emit('onUpdateHero', hero)
  })
  socket.on('updateHeros', (heros) => {
    Object.keys(heros).forEach((id) => {
      io.emit('onUpdateHero', heros[id])
    })
  })
  socket.on('updateHerosComplete', (heros) => {
    currentGame.heros = heros
    Object.keys(currentGame.heros).forEach((id) => {
      io.emit('onUpdateHero', currentGame.heros[id])
    })
  })
  socket.on('editHero', (hero) => {
    // window.mergeDeep(currentGame.heros[hero.id], hero)
    io.emit('onEditHero', hero)
  })
  socket.on('resetHeroToDefault', (hero) => {
    io.emit('onResetHeroToDefault', hero)
  })
  socket.on('resetHeroToGameDefault', (hero) => {
    io.emit('onResetHeroToGameDefault', hero)
  })
  socket.on('respawnHero', (hero) => {
    io.emit('onRespawnHero', hero)
  })
  socket.on('askHeros', () => {
    for(let heroId in currentGame.heros) {
      socket.emit('onUpdateHero', currentGame.heros[heroId])
    }
  })
  socket.on('deleteHero', (hero) => {
    delete currentGame.heros[hero.id]
    io.emit('onDeleteHero', hero)
  })

  socket.on('deleteQuest', (heroId, questId) => {
    io.emit('onDeleteQuest', heroId, questId)
  })

  socket.on('startQuest', (hero, questId) => {
    io.emit('onStartQuest', hero, questId)
  })

  socket.on('completeQuest', (hero, questId) => {
    io.emit('onCompleteQuest', hero, questId)
  })

  socket.on('openHeroModal', (hero, modalTitle, modalBody) => {
    io.emit('onOpenHeroModal', hero, modalTitle, modalBody)
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

  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  // CUSTOM GAME FX
  ///////////////////////////
  socket.on('getCustomGameFx', () => {
    if(savedCustomCode) {
      io.emit('onGetCustomGameFx', savedCustomCode)
    }
  })

  socket.on('updateCustomGameFx', (customGameFx) => {
    savedCustomCode = customGameFx
    io.emit('onUpdateCustomGameFx', customGameFx)
  })

  socket.on('customFxEvent', (eventIn) => {
    io.emit('onCustomFxEvent', eventIn)
  })

  socket.on('sendHeroMapEditor', (mapEditor, heroId) => {
    io.emit('onSendHeroMapEditor', mapEditor, heroId)
  })

  socket.on('updateCompendium', (compendium) => {
    currentGame.compendium = compendium
    io.emit('onUpdateCompendium', compendium)
  })

  socket.on('askHeroToNameObject', (object, heroId) => {
    io.emit('onAskHeroToNameObject', object, heroId)
  })
  socket.on('askHeroToWriteDialogue', (object, heroId) => {
    io.emit('onAskHeroToWriteDialogue', object, heroId)
  })

  socket.on('hostLog', (msg, arg1, arg2, arg3) => {
    let args = [msg, arg1, arg2, arg3].filter(i => !!i)
    io.emit('onHostLog', ...args)
  })
}

module.exports = socketEvents


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
