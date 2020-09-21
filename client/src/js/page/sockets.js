import gridUtil from '../utils/grid.js'
import pathfinding from '../utils/pathfinding.js'
import collisions from '../utils/collisions.js'
import input from '../game/input.js'
import modals from '../mapeditor/modals.js'
import io from 'socket.io-client'

function init() {
  // EVENT SETUP
  if(PAGE.role.isArcadeMode) {
    window.networkSocket = window.socket
    window.socket = window.mockSocket
  }

  ///////////////////////////////
  ///////////////////////////////
  // just for host
  ///////////////////////////////

  if(PAGE.role.isHost) {
    // should be editor event
    window.socket.on('onStartSequence', (sequenceId, ownerId) => {
      window.local.emit('onStartSequence', sequenceId, ownerId)
    })
    window.socket.on('onTogglePauseSequence', (sequenceId) => {
      window.local.emit('onTogglePauseSequence', sequenceId)
    })
    window.socket.on('onStopSequence', (sequenceId) => {
      window.local.emit('onStopSequence', sequenceId)
    })

    // these are editor events
    window.socket.on('onSpawnAllNow', (objectId) => {
      window.local.emit('onSpawnAllNow', objectId)
    })
    window.socket.on('onDestroySpawnIds', (objectId) => {
      window.local.emit('onDestroySpawnIds', objectId)
    })

    window.socket.on('onEditSubObject', (ownerId, subObjectName, update) => {
      window.local.emit('onEditSubObject', ownerId, subObjectName, update)
    })

    window.socket.on('onAskJoinGame', (heroId, role) => {
      window.local.emit('onAskJoinGame', heroId, role)
    })

    // PLAYERS CALL THIS
    window.socket.on('onSendHeroInput', (heroInput, heroId) => {
      window.local.emit('onSendHeroInput', heroInput, heroId)
    })

    // PLAYERS CALL THIS
    window.socket.on('onSendHeroKeyDown', (keyCode, heroId) => {
      window.local.emit('onSendHeroKeyDown', keyCode, heroId)
    })
    window.socket.on('onSendHeroKeyUp', (keyCode, heroId) => {
      window.local.emit('onSendHeroKeyUp', keyCode, heroId)
    })

    // EDITOR CALLS THIS
    // OBJECT -> ID
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

    window.socket.on('onAddTrigger', (ownerId, trigger) => {
      window.local.emit('onAddTrigger', ownerId, trigger)
    })
    window.socket.on('onEditTrigger', (ownerId, triggerId, trigger) => {
      window.local.emit('onEditTrigger', ownerId, triggerId, trigger)
    })

    window.socket.on('onAddHook', (ownerId, hook) => {
      window.local.emit('onAddHook', ownerId, hook)
    })
    window.socket.on('onEditHook', (ownerId, hookId, hook) => {
      window.local.emit('onEditHook', ownerId, hookId, hook)
    })

    window.socket.on('onAddSubObject', (ownerId, subObject, subObjectName, options) => {
      window.local.emit('onAddSubObject', ownerId, subObject, subObjectName, options)
    })
  }

  window.socket.on('onEditGameHeroJSON', (gameHeroName, JSON) => {
    window.local.emit('onEditGameHeroJSON', gameHeroName, JSON)
  })

  // CLIENT HOST OR EDITOR CALL THIS
  window.socket.on('onRemoveObject', (object) => {
    OBJECTS.removeObject(object)
  })

  // CLIENT HOST OR EDITOR CALL THIS
  window.socket.on('onRemoveHero', (hero) => {
    HERO.removeHero(hero)
  })

  window.socket.on('onDeleteSubObjectChance', (ownerId, subObjectName) => {
    window.local.emit('onDeleteSubObjectChance', ownerId, subObjectName)
  })

  // EDITORS and PLAYERS call this
  window.socket.on('onEditHero', (updatedHero) => {
    window.local.emit('onEditHero', updatedHero)
  })

  window.socket.on('onDeleteTrigger', (ownerId, triggerId) => {
    window.local.emit('onDeleteTrigger', ownerId, triggerId)
  })
  window.socket.on('onDeleteHook', (ownerId, hookId) => {
    window.local.emit('onDeleteHook', ownerId, hookId)
  })

  // EDITOR CALLS THIS
  window.socket.on('onEditObjects', (editedObjects) => {
    window.local.emit('onEditObjects', editedObjects)
  })

  ///////////////////////////////
  ///////////////////////////////
  // UPDATING GAME STATE EVENTS, EDITOR UPDATES ITS OWN STATE IF SYNCED
  ///////////////////////////////

  if(!PAGE.role.isHost) {
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
    })

    window.socket.on('onUpdateHerosPos', (updatedHerosPos) => {
      window.local.emit('onNetworkUpdateHerosPos', updatedHerosPos)
    })
  }

  // EDITOR CALLS THIS
  window.socket.on('onUpdateWorld', (updatedWorld) => {
    window.local.emit('onUpdateWorld', updatedWorld)
  })

  window.socket.on('onUpdateLibrary', (updatedLibrary) => {
    window.local.emit('onUpdateLibrary', updatedLibrary)
  })

  ///////////////////////////////
  ///////////////////////////////
  //shared events
  ///////////////////////////////

  // EDITOR CALLS THIS
  window.socket.on('onStopGame', () => {
    window.local.emit('onStopGame')
  })

  // EDITOR CALLS THIS
  window.socket.on('onGameStart', () => {
    window.local.emit('onGameStart')
  })

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

  window.socket.on('onSendHeroMapEditor', (remoteState, heroId) => {
    window.local.emit('onSendHeroMapEditor', remoteState, heroId)
  })

  // CLIENT HOST OR EDITOR CALL THIS
  // OBJECT -> ID
  window.socket.on('onDeleteObject', (object) => {
    window.local.emit('onDeleteObject', object)
  })

  window.socket.on('onDeleteSubObject', (owner, subObjectName) => {
    window.local.emit('onDeleteSubObject', owner, subObjectName)
  })

  // EDITOR CALLS THIS
  window.socket.on('onUpdateGrid', (grid) => {
    window.local.emit('onLoadingScreenStart')
    setTimeout(() => {
      window.local.emit('onUpdateGrid', grid)
      window.local.emit('onLoadingScreenEnd')
    }, 100)
  })

  window.socket.on('onUpdateGridNode', (x, y, update) => {
    window.local.emit('onUpdateGridNode', x, y, update)
  })

  // EDITOR CALLS THIS
  window.socket.on('onDeleteHero', (heroId) => {
    if(PAGE.role.isPlayEditor && window.editingHero.id == heroId) {
      window.setEditingHero({})
    }
    window.local.emit('onDeleteHero', heroId)
  })

  window.socket.on('onDeleteQuest', (heroId, questId) => {
    window.local.emit('onDeleteQuest', heroId, questId)
  })

  window.socket.on('onCopyGame', (game) => {
    window.local.emit('onReloadGame', game)
  })


  // this is switching between games
  window.socket.on('onSetGame', (game) => {
    console.log('changing', game.id)
    window.local.emit('onChangeGame', game)
  })

  // this is from branch merge
  window.socket.on('onSetGameJSON', (game) => {
    window.local.emit('onChangeGame', game)
  })

  // window.socket.on('onAskHeroToNameObject', (object, heroId) => {
  //   window.local.emit('onAskHeroToNameObject', object, heroId)
  //   // let ctx = document.getElementById('swal-canvas').getContext('2d')
  //   // ctx.fillStyle = object.color
  //   // ctx.fillRect(10, 10, object.width, object.height);
  // })
  //
  // window.socket.on('onAskHeroToWriteDialogue', (object, heroId) => {
  //   window.local.emit('onAskHeroToWriteDialogue', object, heroId)
  // })

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
    if(!PAGE.role.isHost) window.local.emit(eventName, arg1, arg2, arg3, arg4)
  })

  window.socket.on('onAddLog', (data) => {
    window.local.emit('onAddLog', data)
  })

  window.socket.on('onSendNotification', (data) => {
    window.local.emit('onSendNotification', data)
  })

  if(!PAGE.role.isHost && PAGE.role.isPlayEditor) {
    window.socket.on('onHostLog', (msg, arg1, arg2, arg3) => {
      let args = [msg, arg1, arg2, arg3].filter(i => !!i)
      console.log('host -> ', ...args)
    })
  }


  // these are game events
  window.socket.on('onHeroStartQuest', (heroId, questId) => {
    window.local.emit('onHeroStartQuest', heroId, questId)
  })

  window.socket.on('onHeroCompleteQuest', (heroId, questId) => {
    window.local.emit('onHeroCompleteQuest', heroId, questId)
  })

  window.socket.on('onDropObject', (objectId, subObjectName) => {
    window.local.emit('onDropObject', objectId, subObjectName)
  })

  window.socket.on('onAddAnimation', (name, animationData) => {
    window.local.emit('onAddAnimation', name, animationData)
  })

  window.socket.on('onResetLiveParticle', (objectId) => {
    window.local.emit('onResetLiveParticle', objectId)
  })

  window.socket.on('onStartMod', (mod) => {
    window.local.emit('onStartMod', mod)
  })
  window.socket.on('onEndMod', (manualRevertId) => {
    window.local.emit('onEndMod', manualRevertId)
  })

  window.socket.on('onResetPhysicsProperties', (objectId) => {
    window.local.emit('onResetPhysicsProperties', objectId)
  })

  window.socket.on('onRequestAdminApproval', (action, data) => {
    window.local.emit('onRequestAdminApproval', action, data)
  })

  window.socket.on('onResolveAdminApproval', (action, data) => {
    window.local.emit('onResolveAdminApproval', action, data)
  })
}

export default {
  init
}
