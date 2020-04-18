import gridTool from './grid.js'
import physics from './physics.js'
import camera from './camera.js'
import pathfinding from './pathfinding.js'
import collisions from './collisions.js'
import particles from './particles.js'
import input from './input.js'

function init() {
  ///////////////////////////////
  ///////////////////////////////
  // just for host
  ///////////////////////////////

  if(window.host) {
    window.socket.on('onAskJoinGame', (heroId) => {
      if(w.game.gameState && w.game.gameState.loaded) {
        let hero = w.game.heros[heroId]
        if(!hero) {
          hero = window.findHeroInNewGame(window.game, {id: heroId})
          w.game.heros[heroId] = hero
        }
        hero.id = heroId
        physics.addObject(hero)
        window.socket.emit('addHeroToGame', hero)
      }
    })

    // PLAYERS CALL THIS
    window.socket.on('onSendHeroInput', (heroInput, heroId) => {
      window.heroInput[heroId] = heroInput
    })

    // PLAYERS CALL THIS
    window.socket.on('onSendHeroKeyDown', (keyCode, heroId) => {
      let hero = w.game.heros[heroId]
      input.keyDown(keyCode, hero)
      /// DEFAULT GAME FX
      if(window.defaultCustomGame) {
        window.defaultCustomGame.keyDown(keyCode, hero)
      }
      /// CUSTOM GAME FX
      if(window.customGame) {
        window.customGame.keyDown(keyCode, hero)
      }
      /// CUSTOM GAME FX
      if(window.liveCustomGame) {
        window.liveCustomGame.keyDown(keyCode, hero)
      }
    })

    // EDITOR CALLS THIS
    window.socket.on('onResetHeroToDefault', (hero) => {
      Object.keys(w.game.heros).forEach((id) => {
        if(id === hero.id) {
          w.game.heros[id] = window.resetHeroToDefault(w.game.heros[id])
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
        if(!obj.x) {
          obj.x = objectById.x
        }
        if(!obj.y) {
          obj.y = objectById.y
        }
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
      w.game.gameState = gameState
      if(window.usePlayEditor && window.syncGameStateToggle.checked) {
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
        window.defaultCustomGame.start()
      }
      if(window.customGame) {
        window.customGame.start()
      }
      if(window.liveCustomGame) {
        window.liveCustomGame.start()
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
    if(!window.host) w.game.gameState = gameState
    if(window.usePlayEditor && window.syncGameStateToggle.checked) {
      window.gamestateeditor.update(gameState)
    }
  })

  // host CALLS THIS
  window.socket.on('onUpdateObjects', (objectsUpdated) => {
    if(!window.pageState.gameLoaded) return
    if(!window.host){
      w.game.objects = objectsUpdated
      w.game.objectsById = w.game.objects.reduce((prev, next) => {
        prev[next.id] = next
        return prev
      }, {})
    }

    if(window.usePlayEditor && window.objecteditor.get().id) {
      if(window.syncObjectsToggle.checked) {
        window.objecteditor.update(w.game.objectsById[window.objecteditor.get().id])
      }
    }
  })

  // HOST CALLS THIS
  window.socket.on('onUpdateHero', (updatedHero) => {
    if(!window.pageState.gameLoaded) return
    if(window.isPlayer && window.hero && updatedHero.id == window.hero.id) {
      window.mergeDeep(window.hero, updatedHero)
    }

    if(!window.host) {
      if(!w.game.heros[updatedHero.id]) {
        w.game.heros[updatedHero.id] = updatedHero
      }
      window.mergeDeep(w.game.heros[updatedHero.id], updatedHero)
    }

    if(window.pageState.gameLoaded && window.usePlayEditor) {
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
      physics.addObject(object)
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
    w.game.objects.forEach((object) => {
      if(object.removed) return

      physics.removeObject(object)
    })
    w.game.objects.length = 0
    w.game.objectsById = {}

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
    if(window.host) window.resetPaths = true
    if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
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
    if(!w.game.heros[updatedHero.id]) {
      w.game.heros[updatedHero.id] = updatedHero
      physics.addObject(updatedHero)
    }
  	if(updatedHero.jumpVelocity !== w.game.heros[updatedHero.id].jumpVelocity) {
  		updatedHero.reachablePlatformHeight = window.resetReachablePlatformHeight(w.game.heros[updatedHero.id])
  	}
  	if(updatedHero.jumpVelocity !== w.game.heros[updatedHero.id].jumpVelocity || updatedHero.speed !== w.game.heros[updatedHero.id].speed) {
  		updatedHero.reachablePlatformWidth = window.resetReachablePlatformWidth(w.game.heros[updatedHero.id])
  	}

    window.mergeDeep(w.game.heros[updatedHero.id], updatedHero)

    if(window.pageState.gameLoaded && window.usePlayEditor) {
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
      if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
    }

    w.game.objectsById[object.id].removed = true
  })

  // CLIENT HOST OR EDITOR CALL THIS
  window.socket.on('onDeleteObject', (object) => {
    if(window.usePlayEditor && window.objecteditor.get().id === object.id) {
      window.objecteditor.update({})
      window.objecteditor.saved = true
      window.updateObjectEditorNotifier()
    }

    if(!w.game.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
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
    physics.removeObjectById(object.id)
    delete w.game.objectsById[object.id]
  })

  // EDITOR CALLS THIS
  window.socket.on('onUpdateGrid', (grid) => {
    w.game.grid = grid
    w.game.grid.nodes = gridTool.generateGridNodes(grid)
    gridTool.updateGridObstacles()
    if(window.host) {
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
    }
  })

  // EDITOR CALLS THIS
  window.socket.on('onDeleteHero', (id) => {
    if(window.host) {
      physics.removeObjectById(id)
    }
    delete w.game.heros[id]
    if(window.usePlayEditor && window.editingHero.id == id) {
      window.setEditingHero({})
    }
  })

  window.socket.on('onCopyGame', (game) => {
    window.unloadGame()
    if(window.host || window.usePlayEditor) window.loadGame(game)
    else window.loadGameNonHost(game)
  })


  // this is switching between games
  window.socket.on('onSetGame', (game) => {
    window.unloadGame()
    if(window.host || window.usePlayEditor) window.loadGame(game)
    else window.loadGameNonHost(game)
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
    if(window.host) {
      try {
        customFx = eval(`(function a(pathfinding, gridTool, camera, collisions, particles) {
          const w = window
          ${customFx} return { init, loaded, start, input, onCollide, intelligence, update, render } })`)
        customFx = customFx(pathfinding, gridTool, camera, collisions, particles)
        window.liveCustomGame = customFx
      } catch (e) {
        console.log(e)
      }
    }

    if(window.usePlayEditor) {
      window.customFx = customFx
    }
  })

  window.socket.on('onCustomFxEvent', (event) => {
    if(event !== 'loaded' && event !== 'init' && event !== 'start') return
    if(window.host && window.liveCustomGame && window.liveCustomGame[event]) {
      window.liveCustomGame[event]()
    }
  })
}

window.unloadGame = function() {
  // if theres already a game going on, need to unload it
  if(w.game.objects.length) {
    if(window.usePlayEditor) {
      window.editingObject = {
        id: null,
        i: null,
      }
      window.objecteditor.saved = true
      window.objecteditor.update({})
    }
    w.game.objects.forEach((object) => {
      physics.removeObjectById(object.id)
    })
  }
}

export default {
  init
}
