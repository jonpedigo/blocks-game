import gridTool from './grid.js'
import physics from './physics.js'
import camera from './camera.js'
import pathfinding from './pathfinding.js'

function init() {

  ///////////////////////////////
  ///////////////////////////////
  //just for clients
  ///////////////////////////////
  if(!window.usePlayEditor) {
  	window.socket.on('onAddObjects', (objectsAdded) => {
      if(!window.objects) {
        console.log('already set objects..?')
        window.objects = []
        window.socket.emit('askGrid');
      }

  		window.objects.push(...objectsAdded)
  		objectsAdded.forEach((object) => {
  			physics.addObject(object)
  		})

      if(window.grid.nodes && !window.preferences.calculatePathCollisions) {
        gridTool.updateGridObstacles()
        window.resetPaths = true
        window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
      }
  	})

  	window.socket.on('onResetObjects', (updatedObjects) => {
  		window.objects.forEach((object) => {
  			physics.removeObject(object)
  		})
  		window.objects = []

      if(!window.preferences.calculatePathCollisions) {
        gridTool.updateGridObstacles()
        window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
      }
  	})

  	window.socket.on('onEditObjects', (editedObjects) => {
  		Object.assign(window.objects, editedObjects)

      if(!window.preferences.calculatePathCollisions) {
        gridTool.updateGridObstacles()
        window.resetPaths = true
        window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
      }
  	})

  	window.socket.on('onSnapAllObjectsToGrid', () => {
  		window.snapAllObjectsToGrid()
  	})

    window.socket.on('onResetHero', (hero) => {
      if(hero.id === window.hero.id) {
        window.resetHero()
      }
    })

    window.socket.on('onRespawnHero', (hero) => {
      if(hero.id === window.hero.id) {
        window.respawnHero()
      }
    })

    window.socket.on('onAnticipateObjectAdd', () => {
  		window.anticipateObjectAdd = true
  	})
  }

  ///////////////////////////////
  ///////////////////////////////
  /// only events for play editor
  ///////////////////////////////
  if(window.usePlayEditor) {
    window.socket.on('onResetObjects', () => {
      window.objects = []
    })
    window.socket.on('onUpdateObjects', (objectsUpdated) => {
      if(!window.objects) {
        window.socket.emit('askGrid');
      }
      window.objects = objectsUpdated
      if(window.editingObject.i >= 0) {
        Object.assign(window.editingObject, objectsUpdated[window.editingObject.i])
        if(window.syncObjectsToggle.checked) {
          window.objecteditor.set(window.editingObject)
          window.objecteditor.expandAll()
        }
      }
    })
    window.socket.on('onAddObjects', (objects) => {
      if(!window.objects) {
        console.log('already set objects..? - editor')
        window.objects = objects
        window.socket.emit('askGrid');
      }
    })
  }

  ///////////////////////////////
  ///////////////////////////////
  //shared events
  ///////////////////////////////
  // window.socket.on('onUpdateGridNode', (gridPos, update) => {
  //   Object.assign(window.grid.nodes[gridPos.x][gridPos.y], update)
  //   if(window.pfgrid && update.hasObstacle !== undefined) {
  //     window.pfgrid.setWalkableAt(gridPos.x, gridPos.y, !update.hasObstacle);
  //     window.resetPaths = true
  //   }
  // })

  window.socket.on('onResetPreferences', (hero) => {
    window.preferences = {}
    camera.clearLimit()
    gridTool.updateGridObstacles()
    window.resetPaths = true
    window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
  })

  window.socket.on('onHeroPosUpdate', (heroUpdated) => {
    if(!window.heros[heroUpdated.id]) {
      window.heros[heroUpdated.id] = {}
    }

    if(window.usePlayEditor) {
      Object.assign(window.heros[heroUpdated.id], heroUpdated)
      if(window.editingHero.id === heroUpdated.id) {
        if(window.preferences.syncHero) {
          window.setEditingHero(heroUpdated)
        }
      }
    } else {
      if(window.hero.id !== heroUpdated.id) {
        Object.assign(window.heros[heroUpdated.id], heroUpdated)
      }
    }
  })

  window.socket.on('onUpdatePreferences', (updatedPreferences) => {
  	for(let key in updatedPreferences) {
  		const value = updatedPreferences[key]
  		window.preferences[key] = value
  		if(key === 'lockCamera' && !window.usePlayEditor) {
  			if(value.limitX) {
  				camera.setLimit(value.limitX, value.limitY, value.centerX, value.centerY)
  			} else {
  				camera.clearLimit();
  			}
  		}
      if(key === 'shouldRestoreHero' && window.usePlayEditor) {
        window.shouldRestoreHeroToggle.checked = value
      }
      if(key === 'syncHero' && window.usePlayEditor) {
        window.syncHeroToggle.checked = value
      }
      if(key === 'syncObjects' && window.usePlayEditor) {
        window.shouldRestoreHeroToggle.checked = value
      }
      if(key === 'isAsymmetric' && window.usePlayEditor) {
        window.isAsymmetricToggle.checked = value
      }
      if(key === 'calculatePathCollisions' && window.grid.nodes) {
        gridTool.updateGridObstacles()
        if(!window.usePlayEditor) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
      }
      if(key === 'gameBoundaries') {
        // breaks if game has not 'started' yet or 'loaded yet'
        // gridTool.updateGridObstacles()
        // window.resetPaths = true
        // if(!window.usePlayEditor) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
      }
  	}
  })

  window.socket.on('onUpdateHero', (updatedHero) => {
  	if(!window.heros[updatedHero.id]) window.heros[updatedHero.id] = {}
  	if(updatedHero.jumpVelocity !== window.heros[updatedHero.id].jumpVelocity) {
  		updatedHero.reachablePlatformHeight = window.resetReachablePlatformHeight(window.heros[updatedHero.id])
  	}
  	if(updatedHero.jumpVelocity !== window.heros[updatedHero.id].jumpVelocity || updatedHero.speed !== window.heros[updatedHero.id].speed) {
  		updatedHero.reachablePlatformWidth = window.resetReachablePlatformWidth(window.heros[updatedHero.id])
  	}

    Object.assign(window.heros[updatedHero.id], updatedHero)

  	if(window.hero && updatedHero.id === window.hero.id){
  		window.resetHero(updatedHero)
  	} else if(window.usePlayEditor){
      if(!window.editingHero.id) {
        // init to any hero
        if(window.heros.undefined) window.socket.emit('deleteHero', 'undefined')
        delete window.heros.undefined
        for(var heroId in window.heros) {
          if(window.heros[heroId].tags && window.heros[heroId].tags.isPlayer) {
            window.setEditingHero(window.heros[heroId])
            break;
          }
        }
      }
  	}
  })

  window.socket.on('onRemoveObject', (object) => {
    if(window.usePlayEditor && window.editingObject.id === object.id) {
      window.editingObject = {
        id: null,
        i: null,
      }
      window.objecteditor.set({})
    }

    if(!window.preferences.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      if(!window.usePlayEditor) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }

    window.objects = window.objects.filter((obj) => obj.id !== object.id)

    if(!window.usePlayEditor) {
      physics.removeObjectById(object.id)
    }
  })

  window.socket.on('onSetWorld', (world) => {
    window.objects = world.objects
    window.objects.forEach((object) => {
      physics.addObject(object)
    })

    window.heros = world.heros
    window.preferences = world.preferences
    window.grid = world.grid
    if(window.hero && !window.usePlayEditor){
      findHeroInNewWorld(world)
      window.socket.emit('updateHero', window.hero)
    }
    if(window.usePlayEditor) {
      window.socket.emit('updateGrid', window.grid)
    }

    window.socket.emit('updatePreferences', window.preferences)
  })

  window.socket.on('onUpdateGrid', (grid) => {
    window.grid = grid
    window.grid.nodes = gridTool.generateGridNodes(grid)
    gridTool.updateGridObstacles()
    if(!window.usePlayEditor) {
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }
  })

  window.socket.on('onDeleteHero', (id) => {
    delete window.heros[id]
    if(window.usePlayEditor && window.editingHero.id == id) {
      window.setEditingHero({})
    }
  })

  window.socket.emit('askObjects');
  window.socket.emit('askHeros');
  window.socket.emit('askPreferences');
}

export default {
  init
}


function findHeroInNewWorld(world) {
  // if we have decided to restore position, find hero in hero list
  if(world.preferences.shouldRestoreHero) {
    for(var heroId in world.heros) {
      let currentHero = world.heros[heroId]
      if(currentHero.id == window.hero.id) {
        window.hero = currentHero
        return
      }
    }
    console.log('failed to find hero with id' + window.hero.id)
  }

  if(!world.preferences.isAsymmetric) {
    // save current users id to the world.hero object and then store all other variables as the new hero
    world.hero.id = window.hero.id
    window.hero = world.hero
    // but then also respawn the hero
    window.respawnHero()
    return
  }





  // other random bullshit if theres two different versions of the hero
  if(!Object.keys(world.heros).length) {
    window.hero.x = window.preferences.worldSpawnPointX
    window.hero.y = window.preferences.worldSpawnPointY
  }
  for(var heroId in world.heros) {
    let currentHero = world.heros[heroId]
    if(currentHero.id == window.hero.id) {
      window.hero = currentHero
      return
    }
  }
  for(var heroId in world.heros) {
    let currentHero = world.heros[heroId]
    if(currentHero.tags.isPlayer) {
      window.hero = currentHero
      return
    }
  }

  window.hero = world.heros[heroId]
}
