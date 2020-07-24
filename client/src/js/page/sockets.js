import gridUtil from '../utils/grid.js'
import pathfinding from '../utils/pathfinding.js'
import collisions from '../utils/collisions.js'
import input from '../game/input.js'
import modals from '../mapeditor/modals.js'
import io from 'socket.io-client'

function init() {
  // EVENT SETUP
  if (window.location.origin.indexOf('localhost') > 0) {
    window.socket = io.connect('http://localhost:4000');
  } else {
    window.socket = io.connect();
  }

  if(PAGE.role.isArcadeMode) {
    window.networkSocket = window.socket
    window.socket = window.mockSocket
  }

  ///////////////////////////////
  ///////////////////////////////
  // just for host
  ///////////////////////////////

  // EDITOR CALLS THIS
  window.socket.on('onEditObjects', (editedObjects) => {
    window.local.emit('onEditObjects', editedObjects)
  })
  if(PAGE.role.isHost) {
    window.socket.on('onDropObject', (objectId, subObjectName) => {
      window.local.emit('onDropObject', objectId, subObjectName)
    })

    window.socket.on('onSpawnAllNow', (objectId) => {
      window.local.emit('onSpawnAllNow', objectId)
    })
    window.socket.on('onDestroySpawnIds', (objectId) => {
      window.local.emit('onDestroySpawnIds', objectId)
    })

    window.socket.on('onDeleteSubObjectChance', (ownerI, subObjectName) => {
      window.local.emit('onDeleteSubObjectChance', ownerI, subObjectName)
    })

    window.socket.on('onRemoveSubObject', (ownerId, subObjectName) => {
      window.local.emit('onRemoveSubObject', ownerId, subObjectName)
    })
    window.socket.on('onAddSubObject', (owner, subObject, subObjectName) => {
      window.local.emit('onAddSubObject', owner, subObject, subObjectName)
    })
    window.socket.on('onEditSubObject', (ownerId, subObjectName, update) => {
      window.local.emit('onEditSubObject', ownerId, subObjectName, update)
    })

    // CLIENT HOST OR EDITOR CALL THIS
    window.socket.on('onRemoveObject', (object) => {
      OBJECTS.removeObject(object)
    })

    // CLIENT HOST OR EDITOR CALL THIS
    window.socket.on('onRemoveHero', (hero) => {
      HERO.removeHero(hero)
    })

    window.socket.on('onAskJoinGame', (heroId) => {
      window.local.emit('onAskJoinGame', heroId)
    })

    // PLAYERS CALL THIS
    window.socket.on('onSendHeroInput', (heroInput, heroId) => {
      window.local.emit('onSendHeroInput', heroInput, heroId)
    })

    // PLAYERS CALL THIS
    window.socket.on('onSendHeroKeyDown', (keyCode, heroId) => {
      window.local.emit('onSendHeroKeyDown', keyCode, heroId)
    })

    // EDITOR CALLS THIS
    window.socket.on('onResetHeroToDefault', (hero) => {
      window.local.emit('onResetHeroToDefault', hero)
    })
    // EDITOR CALLS THIS
    window.socket.on('onResetHeroToGameDefault', (hero) => {
      window.local.emit('onResetHeroToGameDefault', hero)
    })

    // EDITOR CALLS THIS
    window.socket.on('onRespawnHero', (hero) => {
      window.local.emit('onRespawnHero', hero)
    })

    // EDITOR CALLS THIS
    window.socket.on('onEditGameState', (gameState) => {
      window.local.emit('onEditGameState', gameState)
      if(PAGE.role.isPlayEditor && window.syncGameStateToggle.checked) {
        window.gamestateeditor.update(gameState)
      }
    })

    // EDITOR CALLS THIS
  	window.socket.on('onSnapAllObjectsToGrid', () => {
  	   GAME.snapToGrid()
  	})

    // EDITOR CALLS THIS
    window.socket.on('onAnticipateObject', (object) => {
      window.local.emit('onAnticipateObject', object)
  	})

    // EDITOR CALLS THIS
    window.socket.on('onStopGame', () => {
      window.local.emit('onStopGame')
    })

    // EDITOR CALLS THIS
    window.socket.on('onGameStart', () => {
      window.local.emit('onGameStart')
    })

    window.socket.on('onDeleteTrigger', (ownerId, triggerId) => {
      window.local.emit('onDeleteTrigger', ownerId, triggerId)
    })
    window.socket.on('onAddTrigger', (ownerId, trigger) => {
      window.local.emit('onAddTrigger', ownerId, trigger)
    })
    window.socket.on('onEditTrigger', (ownerId, triggerId, trigger) => {
      window.local.emit('onEditTrigger', ownerId, triggerId, trigger)
    })

    window.socket.on('onDeleteHook', (ownerId, hookId) => {
      window.local.emit('onDeleteHook', ownerId, hookId)
    })
    window.socket.on('onAddHook', (ownerId, hook) => {
      window.local.emit('onAddHook', ownerId, hook)
    })
    window.socket.on('onEditHook', (ownerId, hookId, hook) => {
      window.local.emit('onEditHook', ownerId, hookId, hook)
    })
  }

  if(PAGE.role.isGhost) {
    window.socket.on('onSendHeroMapEditor', (remoteState, heroId) => {
      window.local.emit('onSendHeroMapEditor', remoteState, heroId)
    })
  }

  ///////////////////////////////
  ///////////////////////////////
  // UPDATING GAME STATE EVENTS, EDITOR UPDATES ITS OWN STATE IF SYNCED
  ///////////////////////////////
  // HOST CALLS THIS
  window.socket.on('onUpdateGameState', (gameState) => {
    window.local.emit('onUpdateGameState', gameState)
    if(PAGE.role.isPlayEditor && window.syncGameStateToggle.checked && !w.editingGame.branch) {
      window.gamestateeditor.update(gameState)
    }
  })

  // host CALLS THIS
  window.socket.on('onUpdateObjectsComplete', (objectsUpdated) => {
    window.local.emit('onNetworkUpdateObjectsComplete', objectsUpdated)
  })

  // host CALLS THIS
  window.socket.on('onUpdateObjects', (objectsUpdated) => {
    window.local.emit('onNetworkUpdateObjects', objectsUpdated)
      // old interpolation code
      // if(PAGE.role.isPlayer) {
      //   objectsUpdated.forEach((obj) => {
      //     let go = GAME.objectsById[obj.id]
      //     if(!go) {
      //       GAME.objectsById[obj.id] = obj
      //       go = obj
      //     }
      //     go._lerpX = obj.x
      //     go._lerpY = obj.y
      //     delete obj.x
      //     delete obj.y
      //     window.mergeDeep(go, obj)
      //   })
      // } else if(PAGE.role.isPlayEditor) {
      //   GAME.objects = objectsUpdated
      //   GAME.objectsById = GAME.objects.reduce((prev, next) => {
      //     prev[next.id] = next
      //     return prev
      //   }, {})
      // }

    if(PAGE.role.isPlayEditor && window.objecteditor.get().id) {
      if(window.syncObjectsToggle.checked) {
        window.objecteditor.update(GAME.objectsById[window.objecteditor.get().id])
      }
    }
  })

  // HOST CALLS THIS
  window.socket.on('onUpdateHero', (updatedHero) => {
    window.local.emit('onNetworkUpdateHero', updatedHero)
    // old interpolation code
    // } else if(PAGE.role.isPlayEditor) {
    //   window.mergeDeep(GAME.heros[updatedHero.id], updatedHero)
    // } else if(PAGE.role.isPlayer) {
    //   let hero = GAME.heros[updatedHero.id]
    //   if(!hero) GAME.heros[updatedHero.id] = updatedHero
    //   hero._lerpX = updatedHero.x
    //   hero._lerpY = updatedHero.y
    //   delete updatedHero.x
    //   delete updatedHero.y
    //   window.mergeDeep(hero, updatedHero)
    if(PAGE.gameLoaded && PAGE.role.isPlayEditor) {
      if(window.editingHero.id === updatedHero.id) {
        window.editingHero = GAME.heros[updatedHero.id]
        if(GAME.world.syncHero) {
          window.setEditingHero(GAME.heros[updatedHero.id])
        }
      }
    }
  })

  ///////////////////////////////
  ///////////////////////////////
  //shared events
  ///////////////////////////////

  // EVERYONE CALLS THIS
  window.socket.on('onAddObjects', (objectsAdded) => {
    window.local.emit('onNetworkAddObjects', objectsAdded)
  })

  window.socket.on('onHeroJoinedGame', (hero) => {
    window.local.emit('onHeroJoinedGame', hero)
  })

  // EDITOR CALLS THIS
  window.socket.on('onResetObjects', () => {
    window.local.emit('onResetObjects')
  })

  // EDITOR CALLS THIS
  window.socket.on('onResetWorld', () => {
    window.local.emit('onResetWorld')
  })

  // EDITOR CALLS THIS
  window.socket.on('onUpdateWorld', (updatedWorld) => {
    window.local.emit('onUpdateWorld', updatedWorld)
  })

  // EDITORS and PLAYERS call this
  window.socket.on('onEditHero', (updatedHero) => {
    window.local.emit('onEditHero', updatedHero)

    if(PAGE.gameLoaded && PAGE.role.isPlayEditor) {
      if(window.editingHero.id === updatedHero.id) {
        window.editingHero = GAME.heros[updatedHero.id]
        if(GAME.world.syncHero) {
          window.setEditingHero(GAME.heros[updatedHero.id])
        }
      }
      if(!window.editingHero.id) {
        window.setEditorToAnyHero()
      }
    }
  })


  // CLIENT HOST OR EDITOR CALL THIS
  window.socket.on('onDeleteObject', (object) => {
    if(PAGE.role.isPlayEditor && window.objecteditor.get().id === object.id) {
      window.objecteditor.update({})
      window.objecteditor.saved = true
      window.updateObjectEditorNotifier()
    }
    window.local.emit('onDeleteObject', object)
  })

  window.socket.on('onDeleteSubObject', (owner, subObjectName) => {
    window.local.emit('onDeleteSubObject', owner, subObjectName)
  })

  // EDITOR CALLS THIS
  window.socket.on('onUpdateGrid', (grid) => {
    window.local.emit('onUpdateGrid', grid)
  })

  window.socket.on('onUpdateGridNode', (x, y, update) => {
    window.local.emit('onUpdateGridNode', x, y, update)
  })

  // EDITOR CALLS THIS
  window.socket.on('onDeleteHero', (hero) => {
    if(PAGE.role.isPlayEditor && window.editingHero.id == hero.id) {
      window.setEditingHero({})
    }
    window.local.emit('onDeleteHero', hero)
  })

  window.socket.on('onDeleteQuest', (heroId, questId) => {
    window.local.emit('onDeleteQuest', heroId, questId)
  })

  window.socket.on('onHeroStartQuest', (hero, questId) => {
    window.local.emit('onHeroStartQuest', hero, questId)
  })

  window.socket.on('onHeroCompleteQuest', (hero, questId) => {
    window.local.emit('onHeroCompleteQuest', hero, questId)
  })

  window.socket.on('onOpenHeroModal', (hero, modalTitle, modalBody) => {
    window.local.emit('onOpenHeroModal', hero, modalTitle, modalBody)
  })

  window.socket.on('onCopyGame', (game) => {
    window.local.emit('onReloadGame', game)
  })


  // this is switching between games
  window.socket.on('onSetGame', (game) => {
    window.local.emit('onChangeGame', game)
  })

  // this is from branch merge
  window.socket.on('onSetGameJSON', (game) => {
    window.local.emit('onChangeGame', game)
  })

  window.socket.on('onAskHeroToNameObject', (object, heroId) => {
    window.local.emit('onAskHeroToNameObject', object, heroId)
    // let ctx = document.getElementById('swal-canvas').getContext('2d')
    // ctx.fillStyle = object.color
    // ctx.fillRect(10, 10, object.width, object.height);
  })

  window.socket.on('onAskHeroToWriteDialogue', (object, heroId) => {
    window.local.emit('onAskHeroToWriteDialogue', object, heroId)
  })

  window.socket.on('onHeroChooseOption', (heroId, optionId) => {
    window.local.emit('onHeroChooseOption', heroId, optionId)
  })

  window.socket.on('onAddGameTag', (tagName) => {
    window.local.emit('onAddGameTag', tagName)
  })

  window.socket.on('onUpdateGameCustomInputBehavior', (tagName) => {
    window.local.emit('onUpdateGameCustomInputBehavior', tagName)
  })

  window.socket.on('onGameSaved', (id) => {
    window.local.emit('onGameSaved', id)
  })

  window.socket.on('onUpdateCustomGameFx', (customFx) => {
    window.local.emit('onUpdateCustomGameFx', customFx)
  })

  window.socket.on('onCustomFxEvent', (eventName) => {
    window.local.emit('onCustomFxEvent', eventName)
  })

  window.socket.on('onGetCustomGameFx', (eventName) => {
    window.local.emit('onGetCustomGameFx', eventName)
  })

  window.socket.on('openHeroModal', (heroId, title, body) => {
    window.local.emit('onOpenHeroModal', heroId, title, body)
  })

  window.socket.on('showHeroToast', (heroId, body) => {
    window.local.emit('onShowHeroToast', heroId, body)
  })

  window.socket.on('onHeroCameraEffect', (type, heroId, options) => {
    window.local.emit('onHeroCameraEffect', type, heroId, options)
  })

  window.socket.on('onObjectAnimation', (type, objectId, options) => {
    window.local.emit('onObjectAnimation', type, objectId, options)
  })

  window.socket.on('onEmitGameEvent', (eventName, arg1, arg2, arg3, arg4) => {
    window.local.emit(eventName, arg1, arg2, arg3, arg4)
  })

  if(!PAGE.role.isHost && PAGE.role.isPlayEditor) {
    window.socket.on('onHostLog', (msg, arg1, arg2, arg3) => {
      let args = [msg, arg1, arg2, arg3].filter(i => !!i)
      console.log('host -> ', ...args)
    })
  }
}

export default {
  init
}
