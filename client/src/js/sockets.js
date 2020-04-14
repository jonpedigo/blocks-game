import gridTool from './grid.js'
import physics from './physics.js'
import camera from './camera.js'
import pathfinding from './pathfinding.js'
import collisions from './collisions.js'
import particles from './particles.js'

function init() {
  ///////////////////////////////
  ///////////////////////////////
  // just for host
  ///////////////////////////////

  if(window.host) {
    window.socket.on('onAskJoinGame', (heroId) => {
      if(window.gameState && window.gameState.loaded) {
        let hero = window.heros[heroId]
        if(!hero) {
          hero = window.findHeroInNewGame(window.game)
          window.heros[heroId] = hero
        }
        hero.id = heroId
        physics.addObject(hero)
        console.log('?')
        window.socket.emit('addHeroToGame', hero)
      }
    })

    // PLAYERS CALL THIS
    window.socket.on('onSendHeroInput', (heroInput, heroId) => {
      window.heroInput[heroId] = heroInput
    })

    // EDITOR CALLS THIS
    window.socket.on('onResetHeroToDefault', (hero) => {
      Object.keys(window.heros).forEach((id) => {
        if(id === hero.id) {
          window.heros[id] = window.resetHeroToDefault(window.heros[id])
        }
      })
    })

    // EDITOR CALLS THIS
    window.socket.on('onRespawnHero', (hero) => {
      Object.keys(window.heros).forEach((id) => {
        if(id === hero.id) {
          window.respawnHero(window.heros[id])
        }
      })
    })

    // EDITOR CALLS THIS
  	window.socket.on('onEditObjects', (editedObjects) => {
      editedObjects.forEach((obj) => {
        // slow down that gravity boi!
        if(window.objectsById[obj.id].tags.gravity && !obj.tags.gravity) {
          obj.velocityY = 0
        }
        let objectById = window.objectsById[obj.id]
        if(!obj.x) {
          obj.x = objectById.x
        }
        if(!obj.y) {
          obj.y = objectById.y
        }
        window.mergeDeep(objectById, obj)
      })
      if(!window.world.globalTags.calculatePathCollisions) {
        gridTool.updateGridObstacles()
        window.resetPaths = true
        window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
      }
  	})

    // EDITOR CALLS THIS
    window.socket.on('onEditGameState', (gameState) => {
      window.gameState = gameState
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
      if(!window.gameState.started) {
        return console.log('trying to stop game that aint even started yet')
      }

      let initialGameState = localStorage.getItem('initialGameState')
      if(!initialGameState) {
        console.log('game stopped, but no initial game state set')
      }

      if(initialGameState) {
        initialGameState = JSON.parse(initialGameState)
        window.objects = initialGameState.objects
        window.heros = initialGameState.heros
        window.world = initialGameState.world
        window.gameState = initialGameState.gameState
        window.grid = initialGameState.grid
        window.grid.nodes = gridTool.generateGridNodes(window.grid)
        gridTool.updateGridObstacles()
        window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
      }

      // window.gameState.paused = true
      window.gameState.started = false
      window.gameState.loaded = true
    })

    // EDITOR CALLS THIS
    window.socket.on('onStartGame', () => {
      if(window.gameState.started) {
        return console.log('trying to start game that has already started')
      }

      // remove all references to the objects, state, heros, world, etc so we can consider them state while the game is running!
      localStorage.setItem('initialGameState', JSON.stringify({...window.game, grid: {...window.game.grid, nodes: null }}))
      window.gameState.paused = false
      window.gameState.started = true

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
    if(!window.host) window.gameState = gameState
    if(window.usePlayEditor && window.syncGameStateToggle.checked) {
      window.gamestateeditor.update(gameState)
    }
  })

  // host CALLS THIS
  window.socket.on('onUpdateObjects', (objectsUpdated) => {
    if(!window.host){
      window.objects = objectsUpdated
      window.objectsById = window.objects.reduce((prev, next) => {
        prev[next.id] = next
        return prev
      }, {})
    }

    if(window.usePlayEditor && window.objecteditor.get().id) {
      if(window.syncObjectsToggle.checked) {
        window.objecteditor.update(window.objectsById[window.objecteditor.get().id])
      }
    }
  })

  // HOST CALLS THIS
  window.socket.on('onUpdateHero', (updatedHero) => {
    if(window.isPlayer && window.hero && updatedHero.id == window.hero.id) {
      window.mergeDeep(window.hero, updatedHero)
    }

    if(!window.host) {
      if(!window.heros[updatedHero.id]) {
        window.heros[updatedHero.id] = updatedHero
      }
      window.mergeDeep(window.heros[updatedHero.id], updatedHero)
    }

    if(window.pageState.gameLoaded && window.usePlayEditor) {
      if(window.editingHero.id === updatedHero.id) {
        if(updatedHero.jumpVelocity !== window.heros[updatedHero.id].jumpVelocity) {
          updatedHero.reachablePlatformHeight = window.resetReachablePlatformHeight(window.heros[updatedHero.id])
        }
        if(updatedHero.jumpVelocity !== window.heros[updatedHero.id].jumpVelocity || updatedHero.speed !== window.heros[updatedHero.id].speed) {
          updatedHero.reachablePlatformWidth = window.resetReachablePlatformWidth(window.heros[updatedHero.id])
        }

        window.editingHero = updatedHero
        if(window.world.syncHero) {
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
    window.objects.push(...objectsAdded)
    objectsAdded.forEach((object) => {
      physics.addObject(object)
      window.objectsById[object.id] = object
    })

    if(window.grid.nodes && !window.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      window.resetPaths = true
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }
  })

  // EDITOR CALLS THIS
  window.socket.on('onResetObjects', (updatedObjects) => {
    window.objects.forEach((object) => {
      if(object.removed) return

      physics.removeObject(object)
    })
    window.objects.length = 0
    window.objectsById = {}

    if(!window.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }
  })

  // EDITOR CALLS THIS
  window.socket.on('onResetWorld', () => {
    window.world = JSON.parse(JSON.stringify(window.defaultWorld))
    if(!window.playEditor) camera.clearLimit()
    gridTool.updateGridObstacles()
    if(window.host) window.resetPaths = true
    if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    window.handleWorldUpdate(window.world)
  })

  // EDITOR CALLS THIS
  window.socket.on('onUpdateWorld', (updatedWorld) => {
    if(window.world) {
      for(let key in updatedWorld) {
        const value = updatedWorld[key]

        if(value instanceof Object) {
          window.world[key] = {}
          window.mergeDeep(window.world[key], value)
        } else {
          window.world[key] = value
        }
      }
      window.handleWorldUpdate(updatedWorld)
    }
  })

  // EDITORS and PLAYERS call this
  window.socket.on('onEditHero', (updatedHero) => {
    if(!window.heros[updatedHero.id]) {
      window.heros[updatedHero.id] = updatedHero
      physics.addObject(updatedHero)
    }
  	if(updatedHero.jumpVelocity !== window.heros[updatedHero.id].jumpVelocity) {
  		updatedHero.reachablePlatformHeight = window.resetReachablePlatformHeight(window.heros[updatedHero.id])
  	}
  	if(updatedHero.jumpVelocity !== window.heros[updatedHero.id].jumpVelocity || updatedHero.speed !== window.heros[updatedHero.id].speed) {
  		updatedHero.reachablePlatformWidth = window.resetReachablePlatformWidth(window.heros[updatedHero.id])
  	}

    window.mergeDeep(window.heros[updatedHero.id], updatedHero)

    if(window.pageState.gameLoaded && window.usePlayEditor) {
      if(window.editingHero.id === updatedHero.id) {
        window.editingHero = window.heros[updatedHero.id]
        if(window.world.syncHero) {
          window.setEditingHero(window.heros[updatedHero.id])
        }
      }
      if(!window.editingHero.id) {
        window.setEditorToAnyHero()
      }
    }
  })

  // CLIENT HOST OR EDITOR CALL THIS
  window.socket.on('onRemoveObject', (object) => {
    if(!window.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }

    window.objectsById[object.id].removed = true
  })

  // CLIENT HOST OR EDITOR CALL THIS
  window.socket.on('onDeleteObject', (object) => {
    if(window.usePlayEditor && window.objecteditor.get().id === object.id) {
      window.objecteditor.update({})
      window.objecteditor.saved = true
      window.updateObjectEditorNotifier()
    }

    if(!window.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }

    let spliceIndex
    window.objects.forEach((obj, i) => {
      if(obj.id == object.id) {
        spliceIndex
      }
    })

    if(spliceIndex >= 0) {
      window.objects.splice(spliceIndex, 1)
    }

    window.objects = window.objects.filter((obj) => obj.id !== object.id)
    physics.removeObjectById(object.id)
    delete window.objectsById[object.id]
  })

  // EDITOR CALLS THIS
  window.socket.on('onUpdateGrid', (grid) => {
    window.grid = grid
    window.grid.nodes = gridTool.generateGridNodes(grid)
    gridTool.updateGridObstacles()
    if(window.host) {
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }
  })

  // EDITOR CALLS THIS
  window.socket.on('onDeleteHero', (id) => {
    if(window.host) {
      physics.removeObjectById(id)
    }
    delete window.heros[id]
    if(window.usePlayEditor && window.editingHero.id == id) {
      window.setEditingHero({})
    }
  })

  window.socket.on('onCopyGame', (game) => {
    // if theres already a game going on, need to unload it
    if(window.objects.length) {
      if(window.usePlayEditor) {
        window.editingObject = {
          id: null,
          i: null,
        }
        window.objecteditor.saved = true
        window.objecteditor.update({})
      }
      window.objects.forEach((object) => {
        physics.removeObjectById(object.id)
      })
    }

    if(window.host || window.usePlayEditor) window.loadGame(game)
    else window.loadGameNonHost(game)
  })


  // this is switching between games
  window.socket.on('onSetGame', (game) => {
    // if theres already a game going on, need to unload it
    if(window.objects.length) {
      if(window.usePlayEditor) {
        window.editingObject = {
          id: null,
          i: null,
        }
        window.objecteditor.saved = true
        window.objecteditor.update({})
      }
      window.objects.forEach((object) => {
        physics.removeObjectById(object.id)
      })
    }

    if(window.host || window.usePlayEditor) window.loadGame(game)
    else window.loadGameNonHost(game)
    window.changeGame(game.id)
  })

  // window.socket.on('onNewGame', () => {
  //   window.changeGame(null)
  //   window.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
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

export default {
  init
}
