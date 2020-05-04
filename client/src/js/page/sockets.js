import gridTool from '../utils/grid.js'
import pathfinding from '../utils/pathfinding.js'
import collisions from '../utils/collisions.js'
import input from '../game/input.js'
import modals from '../mapeditor/modals.js'
import io from 'socket.io-client'

function init() {
  // EVENT SETUP
  if(PAGE.role.isArcadeMode) {
    window.socket = window.mockSocket
  } else if (window.location.origin.indexOf('localhost') > 0) {
    window.socket = io.connect('http://localhost:4000');
  } else {
    window.socket = io.connect();
  }

  ///////////////////////////////
  ///////////////////////////////
  // just for host
  ///////////////////////////////

  if(PAGE.role.isHost) {
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
    window.socket.on('onRespawnHero', (hero) => {
      window.local.emit('onRespawnHero', hero)
    })

    // EDITOR CALLS THIS
  	window.socket.on('onEditObjects', (editedObjects) => {
      window.local.emit('onEditObjects', editedObjects)
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
    window.socket.on('onStartGame', () => {
      window.local.emit('onGameStart')
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
        if(updatedHero.jumpVelocity !== GAME.heros[updatedHero.id].jumpVelocity) {
          updatedHero.reachablePlatformHeight = HERO.resetReachablePlatformHeight(GAME.heros[updatedHero.id])
        }
        if(updatedHero.jumpVelocity !== GAME.heros[updatedHero.id].jumpVelocity || updatedHero.speed !== GAME.heros[updatedHero.id].speed) {
          updatedHero.reachablePlatformWidth = HERO.resetReachablePlatformWidth(GAME.heros[updatedHero.id])
        }

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
  window.socket.on('onRemoveObject', (object) => {
    GAME.removeObject(object)
  })

  // CLIENT HOST OR EDITOR CALL THIS
  window.socket.on('onRemoveHero', (hero) => {
    GAME.removeObject(hero)
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

  // EDITOR CALLS THIS
  window.socket.on('onUpdateGrid', (grid) => {
    window.local.emit('onUpdateGrid', grid)
  })

  // EDITOR CALLS THIS
  window.socket.on('onDeleteHero', (id) => {
    if(PAGE.role.isPlayEditor && window.editingHero.id == id) {
      window.setEditingHero({})
    }
    window.local.emit('onDeleteHero', id)
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

  window.socket.on('onAskHeroToNameObject', async (object, heroId) => {
    window.local.emit('onAskHeroToNameObject', object, heroId)
    // let ctx = document.getElementById('swal-canvas').getContext('2d')
    // ctx.fillStyle = object.color
    // ctx.fillRect(10, 10, object.width, object.height);
  })

  window.socket.on('onAskHeroToWriteChat', async (object, heroId) => {
    window.local.emit('onAskHeroToWriteChat', object, heroId)
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
