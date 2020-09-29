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
    fs.readFile('./data/game/' +id+'.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
      let game = JSON.parse(data); //now it an gameect
      delete game.heros
      delete game.gameState
      return cb(game)
    }});
  }

  function getSpriteSheet(id, cb) {
    fs.readFile('./data/sprite/' +id+'.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
      let spritesheet = JSON.parse(data); //now it an spritesheetect
      return cb(spritesheet)
    }});
  }

  function saveSpriteSheet(id, json) {
    fs.writeFile('data/sprite/' + id + '.json', JSON.stringify(json), 'utf8', (e) => {
      if(e) return console.log(e)
      else console.log('spritesheet: ' + id + ' saved')
    });
  }

  // socket.on('getSpriteSheetJSON', (id) => {
  //   getSpriteSheet(id, (spriteSheet) => {
  //     socket.emit('onGetSpriteSheetJSON', spriteSheet)
  //   })
  // })

  socket.on('getSpriteSheetsJSON', (ids) => {
    const sss = []

    ids.forEach((id) => {
      getSpriteSheet(id, (spriteSheet) => {
        sss.push(spriteSheet)
        if(sss.length === ids.length) socket.emit('onGetSpriteSheetsJSON', sss)
      })
    })
  })

  socket.on('saveSpriteSheetJSON', (id, json) => {
    saveSpriteSheet(id, json)
  })


  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  ///////////////////////////
  // Game
  ///////////////////////////
  ///////////////////////////
  socket.on('saveGame', (game) => {
    fs.writeFile('data/game/' + game.id + '.json', JSON.stringify(game), 'utf8', (e) => {
      if(e) return console.log(e)
      else console.log('game: ' + game.id + ' saved')
    });
    io.emit('onGameSaved', game.id)
    currentGame = JSON.parse(JSON.stringify(game))
  })

  // this is for when one player on a network wants to get a currentGame... should all be 1 -hero worlds?
  socket.on('getGame', (id) => {
    fs.readFile('data/game/' +id+'.json', 'utf8', function readFileCallback(err, data){
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
    fs.readFile('./data/game/' +id+'.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
      let obj = JSON.parse(data); //now it an object
      currentGame = obj
      currentGame.id = id
      socket.emit('onLoadGame', currentGame)
    }});
  })

  socket.on('askJoinGame', (heroId, role) => {
    io.emit('onAskJoinGame', heroId, role)
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
    // if(!currentGame.gameState) currentGame.gameState = gameState
    // Object.assign(currentGame.gameState, gameState)
    io.emit('onUpdateGameState', gameState)
  })

  socket.on('resetGameState', (gameState) => {
    io.emit('onResetGameState', gameState)
  })

  socket.on('editGameState', (gameState) => {
    io.emit('onEditGameState', gameState)
  })

  socket.on('addGameTag', (tagName) => {
    if(!currentGame.library.tags) {
      currentGame.library.tags = {}
    }
    currentGame.library.tags[tagName] = false
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
    io.emit('onGameStart')
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
  socket.on('updateObjectsComplete', (updatedObjects) => {
    io.emit('onUpdateObjectsComplete', updatedObjects)
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
  socket.on('addSubObject', (owner, subObject, subObjectName, options) => {
    io.emit('onAddSubObject', owner, subObject, subObjectName, options)
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
    io.emit('onUpdateWorld', updatedWorld)
  })
  socket.on('updateLibrary', (updatedLibrary) => {
    io.emit('onUpdateLibrary', updatedLibrary)
  })
  socket.on('resetWorld', () => {
    io.emit('onResetWorld')
  })
  socket.on('updateGameOnServerOnly', (game) => {
    currentGame = game
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
  socket.on('sendHeroKeyUp', (keyCode, hero) => {
    io.emit('onSendHeroKeyUp', keyCode, hero)
  })
  socket.on('sendNotification', (data) => {
    data.dateMilliseconds = Date.now()
    io.emit('onSendNotification', data)
  })

  socket.on('updateHero', (hero) => {
    io.emit('onUpdateHero', hero)
  })
  socket.on('updateHeros', (heros) => {
    Object.keys(heros).forEach((id) => {
      io.emit('onUpdateHero', heros[id])
    })
  })
  socket.on('updateHerosPos', (heros) => {
    io.emit('onUpdateHerosPos', heros)
  })
  socket.on('updateHerosComplete', (heros) => {
    Object.keys(heros).forEach((id) => {
      io.emit('onUpdateHero', heros[id])
    })
  })
  socket.on('editHero', (hero) => {
    // window.mergeDeep(heros[hero.id], hero)
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
  // socket.on('askHeros', () => {
  //   for(let heroId in currentGame.heros) {
  //     socket.emit('onUpdateHero', currentGame.heros[heroId])
  //   }
  // })
  socket.on('deleteHero', (heroId) => {
    io.emit('onDeleteHero', heroId)
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

  socket.on('updateGridNode', (x, y, update) => {
    const key = 'x:'+x+'y:'+y
    if(!currentGame.grid.nodeData) currentGame.grid.nodeData = {}
    if(!currentGame.grid.nodeData[key]) currentGame.grid.nodeData[key] = {}
    Object.assign(currentGame.grid.nodeData[key], update)

    if(currentGame.grid && currentGame.grid.nodes && currentGame.grid.nodes[x] && currentGame.grid.nodes[x][y]) {
      Object.assign(currentGame.grid.nodes[x][y], update)
    }
    io.emit('onUpdateGridNode', x, y, update)
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

  socket.on('customFxEvent', (eventName) => {
    io.emit('onCustomFxEvent', eventName)
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

  socket.on('heroChooseOption', (heroId, optionId) => {
    io.emit('onHeroChooseOption', heroId, optionId)
  })

  socket.on('heroCameraEffect', (type, heroId, options) => {
    io.emit('onHeroCameraEffect', type, heroId, options)
  })

  socket.on('objectAnimation', (type, objectId, options) => {
    io.emit('onObjectAnimation', type, objectId, options)
  })

  socket.on('hostLog', (msg, arg1, arg2, arg3) => {
    let args = [msg, arg1, arg2, arg3].filter(i => !!i)
    io.emit('onHostLog', ...args)
  })

  //// HOOKS
  socket.on('deleteHook', (ownerId, hookId) => {
    io.emit('onDeleteHook', ownerId, hookId)
  })
  socket.on('addHook', (ownerId, hook) => {
    io.emit('onAddHook', ownerId, hook)
  })
  socket.on('editHook', (ownerId, hookId, hook) => {
    io.emit('onEditHook', ownerId, hookId, hook)
  })

  socket.on('spawnAllNow', (objectId) => {
    io.emit('onSpawnAllNow', objectId)
  })
  socket.on('destroySpawnIds', (objectId) => {
    io.emit('onDestroySpawnIds', objectId)
  })

  socket.on('deleteSubObjectChance', (ownerId, subObjectName) => {
    io.emit('onDeleteSubObjectChance', ownerId, subObjectName)
  })

  socket.on('openHeroModal', (heroId, title, body) => {
    io.emit('onOpenHeroModal', heroId, title, body)
  })

  socket.on('showHeroToast', (heroId, body) => {
    io.emit('onShowHeroToast', heroId, body)
  })


  socket.on('dropObject', (objectId, subObjectName) => {
    io.emit('onDropObject', objectId, subObjectName)
  })
  socket.on('deleteQuest', (heroId, questId) => {
    io.emit('onDeleteQuest', heroId, questId)
  })
  socket.on('startQuest', (heroId, questId) => {
    io.emit('onHeroStartQuest', heroId, questId)
  })
  socket.on('completeQuest', (heroId, questId) => {
    io.emit('onHeroCompleteQuest', heroId, questId)
  })

  socket.on('emitGameEvent', (eventName, arg1, arg2, arg3, arg4) => {
    io.emit('onEmitGameEvent', eventName, arg1, arg2, arg3, arg4)
  })

  socket.on('addLog', (data) => {
    io.emit('onAddLog', data)
  })

  socket.on('addAnimation', (name, animationData) => {
    io.emit('onAddAnimation', name, animationData)
  })

  socket.on('resetLiveParticle', (objectId) => {
    io.emit('onResetLiveParticle', objectId)
  })

  socket.on('startMod', (mod) => {
    io.emit('onStartMod', mod)
  })
  socket.on('endMod', (manualRevertId) => {
    io.emit('onEndMod', manualRevertId)
  })

  socket.on('startSequence', (sequenceId, ownerId) => {
    io.emit('onStartSequence', sequenceId, ownerId)
  })
  socket.on('togglePauseSequence', (sequenceId) => {
    io.emit('onTogglePauseSequence', sequenceId)
  })
  socket.on('stopSequence', (sequenceId) => {
    io.emit('onStopSequence', sequenceId)
  })

  socket.on('resetPhysicsProperties', (objectId) => {
    io.emit('onResetPhysicsProperties', objectId)
  })

  socket.on('editGameHeroJSON', (gameHeroName, json) => {
    io.emit('onEditGameHeroJSON', gameHeroName, json)
  })

  socket.on('requestAdminApproval', (action, data) => {
    io.emit('onRequestAdminApproval', action, data)
  })
  socket.on('resolveAdminApproval', (action, data) => {
    io.emit('onResolveAdminApproval', action, data)
  })

  socket.on('resolveSequenceItem', (id) => {
    io.emit('onResolveSequenceItem', id)
  })

  socket.on('branchGame', (id) => {
    io.emit('onBranchGame', id)
  })
  socket.on('branchGameSave', () => {
    io.emit('onBranchGameSave')
  })
  socket.on('branchApply', (id, mod) => {
    io.emit('onBranchApply', id, mod)
  })
  socket.on('branchGameCancel', () => {
    io.emit('onBranchGameCancel')
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
