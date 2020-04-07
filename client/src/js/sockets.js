import gridTool from './grid.js'
import physics from './physics.js'
import camera from './camera.js'
import pathfinding from './pathfinding.js'

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
        window.mergeDeep(window.objectsById[obj.id], obj)
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
    window.socket.on('onResetHero', (hero) => {
      if(hero.id === window.hero.id) {
        window.resetHero()
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

      if(window.usePlayEditor && window.editingObject.i >= 0) {
        window.mergeDeep(window.editingObject, objectsUpdated[window.editingObject.i])
        if(window.syncObjectsToggle.checked) {
          window.objecteditor.set(window.editingObject)
          window.objecteditor.expandAll()
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
    if(!window.heros[heroUpdated.id]) {
      window.heros[heroUpdated.id] = {}
    }

    if(window.usePlayEditor) {
      window.mergeDeep(window.heros[heroUpdated.id], heroUpdated)
      if(window.editingHero.id === heroUpdated.id) {
        window.editingHero = heroUpdated
        if(window.world.syncHero) {
          window.setEditingHero(heroUpdated)
        }
      }
    } else {
      if(window.hero.id !== heroUpdated.id) {
        window.mergeDeep(window.heros[heroUpdated.id], heroUpdated)
      }
    }
  })

  // EDITOR CALLS THIS
  window.socket.on('onUpdateWorld', (updatedWorld) => {
    for(let key in updatedWorld) {
  		const value = updatedWorld[key]

      if(window.world[key] instanceof Object) {
        window.mergeDeep(window.world[key], value)
      } else {
        window.world[key] = value
      }
    }
  	handleWorldUpdate(updatedWorld)
  })

  // CLIENT HOST CALLS THIS
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
  		window.resetHero(updatedHero)
  	}

    if(window.usePlayEditor){
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
    if(window.usePlayEditor && window.editingObject.id === object.id) {
      window.editingObject = {
        id: null,
        i: null,
      }
      window.objecteditor.set({})
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

  // when you are constantly reloading the page we will constantly need to just ask the server what the truth is
  window.socket.emit('askRestoreCurrentGame')
  window.socket.on('onAskRestoreCurrentGame', (game) => {
    window.game = game
    // objects
    window.objects = game.objects
    if(!window.objectsById) window.objectsById = {}
    window.objects.forEach((object) => {
      window.objectsById[object.id] = object
      physics.addObject(object)
    })

    // hero
    // yeah I dont think we'll ever get here since well have done hero.init already
    if(!window.hero && window.isPlayer) {
      findHeroInNewWorld(game)
      window.heros = {[window.hero.id] : window.hero}
    } else {
      window.heros = {}
    }

    // grid
    window.grid = game.grid
    window.grid.nodes = gridTool.generateGridNodes(grid)
    gridTool.updateGridObstacles()
    if(window.host) {
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }

    // world
    window.world = window.mergeDeep(JSON.parse(JSON.stringify(window.defaultWorld)), game.world)
    handleWorldUpdate(window.world)

    // gameState
    // if game state is on the object it very likely means it has already been loaded..
    if(game.gameState) {
      window.gameState = game.gameState
    }

    window.tags = JSON.parse(JSON.stringify(window.defaultTags))

    window.changeGame(game.id)

    /// didnt get to init because it wasnt set yet
    if(window.customGame) {
      window.customGame.init()
    }

    if(window.liveCustomGame) {
      window.liveCustomGame.init()
    }

    if(!window.gameState.loaded && window.host) {
      /// DEFAULT GAME FX
      if(window.defaultGame) {
        window.defaultGame.loaded()
      }
      /// CUSTOM GAME FX
      if(window.customGame) {
        window.customGame.loaded()
      }

      if(window.liveCustomGame) {
        window.liveCustomGame.init()
      }

      window.gameState.loaded = true
    }

    window.onGameLoaded()


    if(window.host) {
      console.log('host')
    } else if(window.usePlayEditor) {
      console.log('editor')
    } else {
      console.log('non host')
    }
  })

  // this is switching between games
  window.socket.on('onSetGame', (game) => {
    window.game = game

    // if theres already a game going on, need to unload it
    if(window.objects.length) {
      if(window.usePlayEditor) {
        window.editingObject = {
          id: null,
          i: null,
        }
        window.objecteditor.set({})
      } else {
        window.objects.forEach((object) => {
          physics.removeObjectById(object.id)
        })
      }
    }

    // objects
    window.objects = game.objects
    if(!window.objectsById) window.objectsById = {}
    window.objects.forEach((object) => {
      window.objectsById[object.id] = object
      physics.addObject(object)
    })



    // grid
    window.grid = game.grid
    window.grid.nodes = gridTool.generateGridNodes(grid)
    gridTool.updateGridObstacles()
    if(window.host) {
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }

    // world
    window.world = window.mergeDeep(JSON.parse(JSON.stringify(window.defaultWorld)), game.world)
    handleWorldUpdate(window.world)

    // heros
    if(window.isPlayer) window.heros = {[window.hero.id] : window.hero}
    else window.heros = {}
    // reset to initial positions and state
    if(window.host) {
      physics.removeObject(window.hero)
      findHeroInNewWorld(game)
      physics.addObject(window.hero)
    }

    // reset tags to default
    window.tags = JSON.parse(JSON.stringify(window.defaultTags))
    // reset game state
    window.gameState = {}
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
    window.gameState = {}
  })
  window.socket.on('onGameSaved', (id) => {
    window.changeGame(id)
  })


  window.socket.on('onUpdateCustomGameFx', (customFx) => {
    if(window.host) {
      try {
        customFx = eval('(function a() {' + customFx + ' return { init, loaded, start, onKeyDown, input, onCollide, intelligence, update, render } })')
        customFx = customFx()
        window.liveCustomGame = customFx
      } catch (e) {
        console.log(e)
      }
    }

    if(window.usePlayEditor) {
      window.customFx = customFx
    }
  })
}

export default {
  init
}


function handleWorldUpdate(updatedWorld) {
  for(let key in updatedWorld) {
    const value = updatedWorld[key]

    if(key === 'lockCamera' && !window.usePlayEditor) {
      if(value && value.limitX) {
        camera.setLimit(value.limitX, value.limitY, value.centerX, value.centerY)
      } else {
        camera.clearLimit();
      }
    }

    if(key === 'gameBoundaries') {
      gridTool.updateGridObstacles()
      if(window.host) window.resetPaths = true
      if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }

    if(key === 'globalTags' || key === 'editorTags') {
      for(let tag in updatedWorld.globalTags) {
        if(tag === 'calculatePathCollisions' && window.grid.nodes) {
          gridTool.updateGridObstacles()
          if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
        }
      }
      if(key === 'syncHero' && window.usePlayEditor) {
        window.syncHeroToggle.checked = value
      }
      if(key === 'syncObjects' && window.usePlayEditor) {
        window.syncObjectsToggle.checked = value
      }
      if(key === 'syncGameState' && window.usePlayEditor) {
        window.syncGameStateToggle.checked = value
      }
    }
  }

  if(window.usePlayEditor) {
    window.worldeditor.set(window.world)
    window.worldeditor.expandAll()
  }
}

function findHeroInNewWorld(game) {
  // if we have decided to restore position, find hero in hero list
  if(game.world.globalTags.shouldRestoreHero) {
    for(var heroId in game.heros) {
      let currentHero = game.heros[heroId]
      if(currentHero.id == window.hero.id) {
        window.hero = currentHero
        return
      }
    }
    console.log('failed to find hero with id' + window.hero.id)
  }

  if(!game.world.globalTags.isAsymmetric) {
    // save current users id to the world.hero object and then store all other variables as the new hero
    game.hero.id = window.hero.id
    window.hero = game.hero
    // but then also respawn the hero
    window.respawnHero()
    return
  }

  // other random bullshit if theres two different versions of the hero
  if(!Object.keys(game.heros).length) {
    window.hero.x = window.world.worldSpawnPointX
    window.hero.y = window.world.worldSpawnPointY
  }
  for(var heroId in game.heros) {
    let currentHero = game.heros[heroId]
    if(currentHero.id == window.hero.id) {
      window.hero = currentHero
      return
    }
  }
  for(var heroId in game.heros) {
    let currentHero = game.heros[heroId]
    if(currentHero.tags.isPlayer) {
      window.hero = currentHero
      return
    }
  }

  window.hero = game.heros[heroId]
}
