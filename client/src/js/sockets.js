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
    // EDITOR CALLS THIS
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
  		window.objects = []
      window.objectsById = {}

      if(!window.world.globalTags.calculatePathCollisions) {
        gridTool.updateGridObstacles()
        window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
      }
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
    window.socket.on('onStartGame', () => {
      if(window.defaultGame) {
        window.defaultGame.start()
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
  /// for players
  ///////////////////////////////
  // EDITOR CALLS THIS
  if(window.isPlayer) {
    window.socket.on('onResetHeroToDefault', (hero) => {
      if(hero.id === window.hero.id) {
        window.resetHeroToDefault()
      }
    })

    // EDITOR CALLS THIS
    window.socket.on('onRespawnHero', (hero) => {
      if(hero.id === window.hero.id) {
        window.respawnHero()
      }
    })
  }

  ///////////////////////////////
  ///////////////////////////////
  /// only events for non hosts
  ///////////////////////////////
  if(!window.host) {
    // EDITOR CALLS THIS
    window.socket.on('onResetObjects', () => {
      window.objects = []
      window.objectsById = {}
    })

    // client host calls this
    window.socket.on('onUpdateGameState', (gameState) => {
      window.gameState = gameState
      if(window.usePlayEditor && window.syncGameStateToggle.checked) {
        window.gamestateeditor.set(gameState)
      }
    })
  }

  if(window.editorPlayer || window.usePlayEditor) {
    // CLIENT HOST CALLS THIS
    window.socket.on('onUpdateObjects', (objectsUpdated) => {
      window.objects = objectsUpdated
      window.objectsById = window.objects.reduce((prev, next) => {
        prev[next.id] = next
        return prev
      }, {})

      if(window.usePlayEditor && window.objecteditor.get().id) {
        if(window.syncObjectsToggle.checked) {
          window.objecteditor.update(window.objectsById[window.objecteditor.get().id])
        }
      }
    })
  }

  ///////////////////////////////
  ///////////////////////////////
  //shared events
  ///////////////////////////////

  // EDITOR CALLS THIS
  window.socket.on('onResetWorld', () => {
    window.world = JSON.parse(JSON.stringify(window.defaultWorld))
    if(!window.playEditor) camera.clearLimit()
    gridTool.updateGridObstacles()
    if(window.host) window.resetPaths = true
    if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    handleWorldUpdate(window.world)
  })

  // CLIENT HOST CALLS THIS
  window.socket.on('onHeroPosUpdate', (heroUpdated) => {
    if(!window.heros) {
      window.heros = {}
    }
    if(!window.heros[heroUpdated.id]) {
      window.heros[heroUpdated.id] = {}
    }

    if(window.pageState.gameLoaded) {
      if(window.usePlayEditor) {
        window.mergeDeep(window.heros[heroUpdated.id], heroUpdated)
        if(window.editingHero.id === heroUpdated.id) {
          window.editingHero = heroUpdated
          if(window.world.syncHero) {
            window.setEditingHero(heroUpdated)
          }
        }
        if(!window.editingHero.id) {
          window.setEditorToAnyHero()
        }
      } else {
        if(window.hero.id !== heroUpdated.id || window.ghost) {
          window.mergeDeep(window.heros[heroUpdated.id], heroUpdated)
        }
      }
    }
  })

  // EDITOR CALLS THIS
  window.socket.on('onUpdateWorld', (updatedWorld) => {
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
  })

  // CLIENT HOST AND EDITOR CALLS THIS
  window.socket.on('onUpdateHero', (updatedHero) => {
  	if(!window.heros[updatedHero.id]) window.heros[updatedHero.id] = {}
  	if(updatedHero.jumpVelocity !== window.heros[updatedHero.id].jumpVelocity) {
  		updatedHero.reachablePlatformHeight = window.resetReachablePlatformHeight(window.heros[updatedHero.id])
  	}
  	if(updatedHero.jumpVelocity !== window.heros[updatedHero.id].jumpVelocity || updatedHero.speed !== window.heros[updatedHero.id].speed) {
  		updatedHero.reachablePlatformWidth = window.resetReachablePlatformWidth(window.heros[updatedHero.id])
  	}

    window.mergeDeep(window.heros[updatedHero.id], updatedHero)

  	if(window.hero && updatedHero.id === window.hero.id){
  		window.updateHero(updatedHero)
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
      window.objecteditor.set({})
      window.objecteditor.saved = true
      window.updateObjectEditorNotifier()
    }

    if(!window.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }

    window.objects = window.objects.filter((obj) => obj.id !== object.id)
    delete window.objectsById[object.id]

    if(window.host) {
      physics.removeObjectById(object.id)
    }
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
    delete window.heros[id]
    if(window.usePlayEditor && window.editingHero.id == id) {
      window.setEditingHero({})
    }
  })

  // this is switching between games
  window.socket.on('onSetGame', (game) => {
    window.game = game
    window.game.grid = game.grid
    window.client.emit('onGridLoaded')

    // if theres already a game going on, need to unload it
    if(window.objects.length) {
      if(window.usePlayEditor) {
        window.editingObject = {
          id: null,
          i: null,
        }
        window.objecteditor.saved = true
        window.objecteditor.set({})
      } else {
        window.objects.forEach((object) => {
          physics.removeObjectById(object.id)
        })
      }
    }
    if(window.hero) {
      physics.removeObject(window.hero)
    }

    // objects
    window.objects = game.objects
    if(!window.objectsById) window.objectsById = {}
    window.objects.forEach((object) => {
      window.objectsById[object.id] = object
      if(window.host) physics.addObject(object)
    })

    // world
    window.world = window.mergeDeep(JSON.parse(JSON.stringify(window.defaultWorld)), game.world)

    // grid
    window.grid = game.grid
    window.grid.nodes = gridTool.generateGridNodes(grid)
    gridTool.updateGridObstacles()
    if(window.host) {
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }

    window.handleWorldUpdate(window.world)

    // heros
    // reset to initial positions and state
    if(window.host && window.isPlayer) {
      window.findHeroInNewWorld(game)
      physics.addObject(window.hero)
      window.hero.currentGameId = game.id
    }
    if(window.isPlayer) window.heros = {[window.hero.id] : window.hero}

    // reset game state
    if(window.host){
      // by default we reset all spawned objects
      window.resetSpawnAreasAndObjects()
    }

    /// CUSTOM GAME FX
    window.changeGame(game.id)
    if(window.customGame) {
      // if we've set the game it means it didnt happen on page load.
      // so we need to init it as well..
      window.customGame.init()
      if(window.host) {
        window.customGame.loaded()
      }
    }
    if(window.liveCustomGame) {
      // if we've set the game it means it didnt happen on page load.
      // so we need to init it as well..
      window.liveCustomGame.init()
      if(window.host) {
        window.liveCustomGame.loaded()
      }
    }
    window.gameState.loaded = true
  })

  window.socket.on('onNewGame', () => {
    window.changeGame(null)
    window.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
  })

  window.socket.on('onGameSaved', (id) => {
    window.changeGame(id)
  })


  window.socket.on('onUpdateCustomGameFx', (customFx) => {
    if(window.host) {
      try {
        customFx = eval(`(function a(pathfinding, gridTool, camera, collisions, particles) {
          const w = window
          ${customFx} return { init, loaded, start, onKeyDown, input, onCollide, intelligence, update, render } })`)
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
