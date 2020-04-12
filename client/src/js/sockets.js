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
    // PLAYERS CALL THIS
    window.socket.on('onSendHeroInput', (heroInput, hero) => {
      if(!window.heros[hero.id]) {
        window.heros[hero.id] = hero
        physics.addObject(hero)
      }
      window.heroInput[hero.id] = heroInput
    })

    // EDITOR CALLS THIS
    window.socket.on('onResetHeroToDefault', (hero) => {
      Object.keys(window.heros).forEach((id) => {
        if(id === hero.id) {
          window.heros[id] = window.resetHeroToDefault(hero)
        }
      })
    })

    // EDITOR CALLS THIS
    window.socket.on('onRespawnHero', (hero) => {
      Object.keys(window.heros).forEach((id) => {
        if(id === hero.id) {
          window.respawnHero(hero)
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
      // window.initialGameObjects = JSON.parse(JSON.stringify(window.objects))
      // window.initialHeros = JSON.parse(JSON.stringify(window.heros))
      // window.initialGameState = JSON.parse(JSON.stringify(window.gameState))
      // window.initialWorld = JSON.parse(JSON.stringify(window.world))

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
  /// only events for non hosts
  ///////////////////////////////
  if(!window.host) {
    // HOST CALLS THIS
    window.socket.on('onUpdateGameState', (gameState) => {
      window.gameState = gameState
      if(window.usePlayEditor && window.syncGameStateToggle.checked) {
        window.gamestateeditor.set(gameState)
      }
    })

    // host CALLS THIS
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

    // HOST CALLS THIS
    window.socket.on('onUpdateHero', (updatedHero) => {
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
          window.editingHero = updatedHero
          if(window.world.syncHero) {
            window.setEditingHero(updatedHero)
          }
        }
      }
    })
  }

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
    window.objects = []
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
    handleWorldUpdate(window.world)
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
      window.objecteditor.set({})
      window.objecteditor.saved = true
      window.updateObjectEditorNotifier()
    }

    if(!window.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
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

  // this is switching between games
  window.socket.on('onSetGame', (game) => {
    window.game = game
    window.game.grid = game.grid
    window.client.emit('onGridLoaded')

    if(game.compendium) window.compendium = game.compendium

    // if theres already a game going on, need to unload it
    if(window.objects.length) {
      if(window.usePlayEditor) {
        window.editingObject = {
          id: null,
          i: null,
        }
        window.objecteditor.saved = true
        window.objecteditor.set({})
      }
      window.objects.forEach((object) => {
        physics.removeObjectById(object.id)
      })
    }
    let allHeros = Object.keys(window.heros).map((id) => {
      return window.heros[id]
    })

    // objects
    window.objects = game.objects
    if(!window.objectsById) window.objectsById = {}
    window.objects.forEach((object) => {
      window.objectsById[object.id] = object
      physics.addObject(object)
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

    // gameState
    if(game.gameState) window.gameState = game.gameState
    else window.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
    if(window.usePlayEditor) {
      window.gamestateeditor.set(window.gameState)
    }

    // reset game state
    if(window.host){
      allHeros.forEach((hero) => {
        window.heros[hero.id] = window.findHeroInNewGame(game, hero)
      })
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
