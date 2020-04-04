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
        window.objectsById = {}
        window.socket.emit('askGrid');
      }

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

    window.socket.on('onAnticipateObject', (object) => {
  		window.anticipatedObject = object
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
      window.objectsById = window.objects.reduce((prev, next) => {
        prev[next.id] = next
      }, {})
      
      if(window.editingObject.i >= 0) {
        window.mergeDeep(window.editingObject, objectsUpdated[window.editingObject.i])
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
        window.objectsById = objects.reduce((prev, next) => {
          prev[next.id] = next
        }, {})
      }
    })
  }

  ///////////////////////////////
  ///////////////////////////////
  //shared events
  ///////////////////////////////
  // window.socket.on('onUpdateGridNode', (gridPos, update) => {
  //   window.mergeDeep(window.grid.nodes[gridPos.x][gridPos.y], update)
  //   if(window.pfgrid && update.hasObstacle !== undefined) {
  //     window.pfgrid.setWalkableAt(gridPos.x, gridPos.y, !update.hasObstacle);
  //     window.resetPaths = true
  //   }
  // })

  window.socket.on('onResetWorld', (hero) => {
    window.world = JSON.parse(JSON.stringify(window.defaultWorld))
    camera.clearLimit()
    gridTool.updateGridObstacles()
    window.resetPaths = true
    window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    window.socket.emit('updateWorld', window.world)
  })

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

  window.socket.on('onUpdateWorld', (updatedWorld) => {
  	for(let key in updatedWorld) {
  		const value = updatedWorld[key]

      if(window.world[key] instanceof Object) {
        window.mergeDeep(window.world[key], value)
      } else {
        window.world[key] = value
      }

      // no need to over write nested values ( flags, tags )
  		if(key === 'lockCamera' && !window.usePlayEditor) {
  			if(value.limitX) {
  				camera.setLimit(value.limitX, value.limitY, value.centerX, value.centerY)
  			} else {
  				camera.clearLimit();
  			}
  		}
      if(key === 'gameBoundaries') {
        // breaks if game has not 'started' yet or 'loaded yet'
        // gridTool.updateGridObstacles()
        // window.resetPaths = true
        // if(!window.usePlayEditor) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
      }

      if(key === 'globalTags') {
        for(let tag in updatedWorld.globalTags) {
          if(tag === 'syncHero' && window.usePlayEditor) {
            window.syncHeroToggle.checked = value
          }
          if(tag === 'syncObjects' && window.usePlayEditor) {
            window.shouldRestoreHeroToggle.checked = value
          }
          if(tag === 'calculatePathCollisions' && window.grid.nodes) {
            gridTool.updateGridObstacles()
            if(!window.usePlayEditor) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
          }
        }
      }
  	}

    if(window.usePlayEditor) {
      window.worldeditor.set(window.world)
      window.worldeditor.expandAll()
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

    window.mergeDeep(window.heros[updatedHero.id], updatedHero)

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
    if(!window.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      if(!window.usePlayEditor) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }

    window.objectsById[object.id].removed = true
  })

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
      if(!window.usePlayEditor) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }

    window.objects = window.objects.filter((obj) => obj.id !== object.id)
    delete window.objectsById[object.id]

    if(!window.usePlayEditor) {
      physics.removeObjectById(object.id)
    }
  })

  window.socket.on('onSetGame', (game) => {
    window.objects = game.objects
    window.objects.forEach((object) => {
      physics.addObject(object)
    })

    window.heros = game.heros
    window.world = game.world
    window.grid = game.grid
    if(window.hero && !window.usePlayEditor) {
      findHeroInNewWorld(game)
      window.socket.emit('updateHero', window.hero)
    }
    if(window.usePlayEditor) {
      window.socket.emit('updateGrid', window.grid)
    }

    window.socket.emit('updateWorld', window.world)
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
  window.socket.emit('askWorld');
}

export default {
  init
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
