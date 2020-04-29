import gridTool from './grid.js'
import camera from './camera.js'
import pathfinding from './pathfinding.js'
import collisions from './collisions.js'
import particles from './particles.js'
import input from './input.js'
import modals from './mapeditor/modals.js'
import io from 'socket.io-client'

function init() {
  // EVENT SETUP
  if(role.isArcadeMode) {
    window.socket = window.local
  } else if (window.location.origin.indexOf('localhost') > 0) {
    window.socket = io.connect('http://localhost:4000');
  } else {
    window.socket = io.connect();
  }

  ///////////////////////////////
  ///////////////////////////////
  // just for host
  ///////////////////////////////

  if(role.isHost) {
    window.socket.on('onAskJoinGame', (heroId) => {
      if(w.game.gameState && w.game.gameState.loaded) {
        let hero = w.game.heros[heroId]
        if(!hero) {
          hero = window.findHeroInNewGame(window.game, {id: heroId})
          hero.id = heroId
          w.game.heros[hero.id] = hero
          PHYSICS.addObject(hero)
        } else {
          PHYSICS.addObject(hero)
          hero.id = heroId
        }
        window.local.emit('onHeroJoined', hero)
        window.socket.emit('addHeroToGame', hero)
      }
    })

    // PLAYERS CALL THIS
    window.socket.on('onSendHeroInput', (heroInput, heroId) => {
      // dont update input for hosts hero since we've already locally updated
      if(role.isPlayer && window.hero && heroId == window.hero.id) {
        return
      }
      window.heroInput[heroId] = heroInput
    })

    // PLAYERS CALL THIS
    window.socket.on('onSendHeroKeyDown', (keyCode, heroId) => {
      // dont do keydown event for hosts hero since we've already done locally
      if(role.isPlayer && heroId == window.hero.id) return
      let hero = w.game.heros[heroId]
      input.onKeyDown(keyCode, hero)
    })

    // EDITOR CALLS THIS
    window.socket.on('onResetHeroToDefault', (hero) => {
      Object.keys(w.game.heros).forEach((id) => {
        if(id === hero.id) {
          w.game.heros[id] = window.resetHeroToDefault(w.game.heros[id])
          if(role.isPlayer && window.hero.id === hero.id) window.hero = w.game.heros[id]
        }
      })
    })

    // EDITOR CALLS THIS
    window.socket.on('onRespawnHero', (hero) => {
      Object.keys(w.game.heros).forEach((id) => {
        if(id === hero.id) {
          window.respawnHero(w.game.heros[id])
        }
      })
    })

    // EDITOR CALLS THIS
  	window.socket.on('onEditObjects', (editedObjects) => {
      editedObjects.forEach((obj) => {
        // slow down that gravity boi!
        if(w.game.objectsById[obj.id].tags.gravity && !obj.tags.gravity) {
          obj.velocityY = 0
        }
        let objectById = w.game.objectsById[obj.id]
        // if(!obj.x) {
        //   obj.x = objectById.x
        // }
        // if(!obj.y) {
        //   obj.y = objectById.y
        // }
        obj.path = null
        window.mergeDeep(objectById, obj)
      })
      if(!w.game.world.globalTags.calculatePathCollisions) {
        gridTool.updateGridObstacles()
        window.resetPaths = true
        window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
      }
  	})

    // EDITOR CALLS THIS
    window.socket.on('onEditGameState', (gameState) => {
      window.mergeDeep(w.game.gameState, gameState)
      if(role.isPlayEditor && window.syncGameStateToggle.checked) {
        window.gamestateeditor.update(gameState)
      }
    })

    // EDITOR CALLS THIS
  	window.socket.on('onSnapAllObjectsToGrid', () => {
  		window.snapAllObjectsToGrid()
  	})

    // EDITOR CALLS THIS
    window.socket.on('onAnticipateObject', (object) => {
  		window.anticipatedObject = object
  	})

    // EDITOR CALLS THIS
    window.socket.on('onStopGame', () => {
      if(!w.game.gameState.started) {
        return console.log('trying to stop game that aint even started yet')
      }

      let initialGameState = localStorage.getItem('initialGameState')
      if(!initialGameState) {
        console.log('game stopped, but no initial game state set')
      }

      if(initialGameState) {
        initialGameState = JSON.parse(initialGameState)
        w.game.objects = initialGameState.objects
        w.game.heros = initialGameState.heros
        w.game.world = initialGameState.world
        w.game.gameState = initialGameState.gameState
        w.game.grid = initialGameState.grid
        w.game.grid.nodes = gridTool.generateGridNodes(w.game.grid)
        gridTool.updateGridObstacles()
        window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
      }

      // w.game.gameState.paused = true
      w.game.gameState.started = false
      w.game.gameState.loaded = true
    })

    // EDITOR CALLS THIS
    window.socket.on('onStartGame', () => {
      if(w.game.gameState.started) {
        return console.log('trying to start game that has already started')
      }

      // remove all references to the objects, state, heros, world, etc so we can consider them state while the game is running!
      localStorage.setItem('initialGameState', JSON.stringify({...window.game, grid: {...window.game.grid, nodes: null }}))
      w.game.gameState.paused = false
      w.game.gameState.started = true

      if(window.defaultCustomGame) {
        window.defaultCustomGame.onGameStart()
      }
      if(window.customGame) {
        window.customGame.onGameStart()
      }
      if(window.liveCustomGame) {
        window.liveCustomGame.onGameStart()
      }
    })
  }

  if(role.isGhost) {
    window.socket.on('onSendHeroMapEditor', (mapEditor, heroId) => {
      if(window.hero.id === heroId) {
        window.remoteHeroMapEditorState = mapEditor
      }
    })
  }

  ///////////////////////////////
  ///////////////////////////////
  // UPDATING GAME STATE EVENTS, EDITOR UPDATES ITS OWN STATE IF SYNCED
  ///////////////////////////////
  // HOST CALLS THIS
  window.socket.on('onUpdateGameState', (gameState) => {
    if(!window.pageState.gameLoaded) return
    if(!role.isHost) w.game.gameState = gameState
    if(role.isPlayEditor && window.syncGameStateToggle.checked && !w.editingGame.branch) {
      window.gamestateeditor.update(gameState)
    }
  })

  // host CALLS THIS
  window.socket.on('onUpdateObjects', (objectsUpdated) => {
    if(!window.pageState.gameLoaded) return
    if(!role.isHost) {
      w.game.objects = objectsUpdated
      w.game.objectsById = w.game.objects.reduce((prev, next) => {
        prev[next.id] = next
        return prev
      }, {})

      // old interpolation code
      // if(role.isPlayer) {
      //   objectsUpdated.forEach((obj) => {
      //     let go = w.game.objectsById[obj.id]
      //     if(!go) {
      //       w.game.objectsById[obj.id] = obj
      //       go = obj
      //     }
      //     go._lerpX = obj.x
      //     go._lerpY = obj.y
      //     delete obj.x
      //     delete obj.y
      //     window.mergeDeep(go, obj)
      //   })
      // } else if(role.isPlayEditor) {
      //   w.game.objects = objectsUpdated
      //   w.game.objectsById = w.game.objects.reduce((prev, next) => {
      //     prev[next.id] = next
      //     return prev
      //   }, {})
      // }
    }

    if(role.isPlayEditor && window.objecteditor.get().id) {
      if(window.syncObjectsToggle.checked) {
        window.objecteditor.update(w.game.objectsById[window.objecteditor.get().id])
      }
    }
  })

  // HOST CALLS THIS
  window.socket.on('onUpdateHero', (updatedHero) => {
    if(!window.pageState.gameLoaded) return

    if(!role.isHost) {
      if(!w.game.heros[updatedHero.id]) {
        w.game.heros[updatedHero.id] = updatedHero
        PHYSICS.addObject(updatedHero)
        // you need to reset the reference... really just for NON HOST PLAYER MODE ( because it loads non host )
      }
      window.mergeDeep(w.game.heros[updatedHero.id], updatedHero)
      if(role.isPlayer && window.hero.id === updatedHero.id) {
        window.mergeDeep(window.hero, updatedHero)
      }
      // old interpolation code
      // } else if(role.isPlayEditor) {
      //   window.mergeDeep(w.game.heros[updatedHero.id], updatedHero)
      // } else if(role.isPlayer) {
      //   let hero = w.game.heros[updatedHero.id]
      //   if(!hero) w.game.heros[updatedHero.id] = updatedHero
      //   hero._lerpX = updatedHero.x
      //   hero._lerpY = updatedHero.y
      //   delete updatedHero.x
      //   delete updatedHero.y
      //   window.mergeDeep(hero, updatedHero)
    }

    if(window.pageState.gameLoaded && role.isPlayEditor) {
      if(window.editingHero.id === updatedHero.id) {
        if(updatedHero.jumpVelocity !== w.game.heros[updatedHero.id].jumpVelocity) {
          updatedHero.reachablePlatformHeight = window.resetReachablePlatformHeight(w.game.heros[updatedHero.id])
        }
        if(updatedHero.jumpVelocity !== w.game.heros[updatedHero.id].jumpVelocity || updatedHero.speed !== w.game.heros[updatedHero.id].speed) {
          updatedHero.reachablePlatformWidth = window.resetReachablePlatformWidth(w.game.heros[updatedHero.id])
        }

        window.editingHero = updatedHero
        if(w.game.world.syncHero) {
          window.setEditingHero(updatedHero)
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
    w.game.objects.push(...objectsAdded)
    objectsAdded.forEach((object) => {
      PHYSICS.addObject(object)
      w.game.objectsById[object.id] = object
    })

    if(w.game.grid.nodes && !w.game.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      window.resetPaths = true
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
    }
  })

  // EDITOR CALLS THIS
  window.socket.on('onResetObjects', (updatedObjects) => {
    w.game.objects = w.game.objects.reduce((arr, object) => {
      if(object.removed) return arr
      PHYSICS.removeObject(object)
      return arr
    }, [])

    w.game.objectsById = w.game.objects.reduce((prev, next) => {
      prev[next.id] = next
      return prev
    }, {})

    if(!w.game.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
    }
  })

  // EDITOR CALLS THIS
  window.socket.on('onResetWorld', () => {
    w.game.world = JSON.parse(JSON.stringify(window.defaultWorld))
    if(!window.playEditor) camera.clearLimit()
    gridTool.updateGridObstacles()
    if(role.isHost) window.resetPaths = true
    if(role.isHost) window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
    window.handleWorldUpdate(w.game.world)
  })

  // EDITOR CALLS THIS
  window.socket.on('onUpdateWorld', (updatedWorld) => {
    if(w.game.world) {
      for(let key in updatedWorld) {
        const value = updatedWorld[key]

        if(value instanceof Object) {
          w.game.world[key] = {}
          window.mergeDeep(w.game.world[key], value)
        } else {
          w.game.world[key] = value
        }
      }
      window.handleWorldUpdate(updatedWorld)
    }
  })

  // EDITORS and PLAYERS call this
  window.socket.on('onEditHero', (updatedHero) => {
  	if(updatedHero.jumpVelocity !== w.game.heros[updatedHero.id].jumpVelocity) {
  		updatedHero.reachablePlatformHeight = window.resetReachablePlatformHeight(w.game.heros[updatedHero.id])
  	}
  	if(updatedHero.jumpVelocity !== w.game.heros[updatedHero.id].jumpVelocity || updatedHero.speed !== w.game.heros[updatedHero.id].speed) {
  		updatedHero.reachablePlatformWidth = window.resetReachablePlatformWidth(w.game.heros[updatedHero.id])
  	}

    window.mergeDeep(w.game.heros[updatedHero.id], updatedHero)

    if(window.pageState.gameLoaded && role.isPlayEditor) {
      if(window.editingHero.id === updatedHero.id) {
        window.editingHero = w.game.heros[updatedHero.id]
        if(w.game.world.syncHero) {
          window.setEditingHero(w.game.heros[updatedHero.id])
        }
      }
      if(!window.editingHero.id) {
        window.setEditorToAnyHero()
      }
    }
  })

  // CLIENT HOST OR EDITOR CALL THIS
  window.socket.on('onRemoveObject', (object) => {
    if(!w.game.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      if(role.isHost) window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
    }

    w.game.objectsById[object.id].removed = true
  })

  // CLIENT HOST OR EDITOR CALL THIS
  window.socket.on('onDeleteObject', (object) => {
    if(role.isPlayEditor && window.objecteditor.get().id === object.id) {
      window.objecteditor.update({})
      window.objecteditor.saved = true
      window.updateObjectEditorNotifier()
    }

    if(!w.game.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      if(role.isHost) window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
    }

    let spliceIndex
    w.game.objects.forEach((obj, i) => {
      if(obj.id == object.id) {
        spliceIndex
      }
    })

    if(spliceIndex >= 0) {
      w.game.objects.splice(spliceIndex, 1)
    }

    w.game.objects = w.game.objects.filter((obj) => obj.id !== object.id)
    PHYSICS.removeObject(object)
    delete w.game.objectsById[object.id]
  })

  // EDITOR CALLS THIS
  window.socket.on('onUpdateGrid', (grid) => {
    w.game.grid = grid
    w.game.grid.nodes = gridTool.generateGridNodes(grid)
    gridTool.updateGridObstacles()
    if(role.isHost) {
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
    }
  })

  // EDITOR CALLS THIS
  window.socket.on('onDeleteHero', (id) => {
    if(role.isHost) {
      PHYSICS.removeObject(w.game.heros[id])
    }
    delete w.game.heros[id]
    if(role.isPlayEditor && window.editingHero.id == id) {
      window.setEditingHero({})
    }
  })

  window.socket.on('onCopyGame', (game) => {
    GAME.unload()
    if(role.isHost || role.isPlayEditor) window.loadGame(game)
    else {
      window.loadGameNonHost(game)
    }
  })


  // this is switching between games
  window.socket.on('onSetGame', (game) => {
    if(role.isHost || role.isPlayEditor) window.loadGame(game)
    else {
      window.loadGameNonHost(game)
    }
    window.changeGame(game.id)
  })

  // window.socket.on('onNewGame', () => {
  //   window.changeGame(null)
  //   w.game.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
  // })

  window.socket.on('onGameSaved', (id) => {
    window.changeGame(id)
  })

  window.socket.on('onUpdateCustomGameFx', (customFx) => {
    if(role.isHost) {
      try {
        window.setLiveCustomFx(customFx)
      } catch (e) {
        console.log(e)
      }
    }

    if(role.isPlayEditor) {
      window.customFx = customFx
    }
  })

  window.socket.on('onCustomFxEvent', (event) => {
    if(role.isHost && window.liveCustomGame && window.liveCustomGame[event]) {
      window.liveCustomGame[event]()
    }
  })

  window.socket.on('onAskHeroToNameObject', async (object, heroId) => {
    if(role.isPlayer && !role.isGhost && window.hero.id === heroId) {
      modals.nameObject(object)
    }

    // let ctx = document.getElementById('swal-canvas').getContext('2d')
    // ctx.fillStyle = object.color
    // ctx.fillRect(10, 10, object.width, object.height);
  })

  window.socket.on('onAskHeroToWriteChat', async (object, heroId) => {
    if(role.isPlayer && !role.isGhost && window.hero.id === heroId) {
      modals.writeDialogue(object)
    }
  })
}

export default {
  init
}
