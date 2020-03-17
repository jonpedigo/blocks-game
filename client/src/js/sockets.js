import grid from './grid.js'
import physics from './physics.js'
import camera from './camera.js'

function init() {

  ///////////////////////////////
  ///////////////////////////////
  //just for clients
  ///////////////////////////////
  if(!window.usePlayEditor) {
  	window.socket.on('onAddObjects', (objectsAdded) => {
      if(!window.objects) window.objects = []

  		if(window.hero.arrowKeysBehavior === 'grid') {
  			objectsAdded.forEach((object) => {
  				grid.snapObjectToGrid(object)
  			})
  		}
  		window.objects.push(...objectsAdded)
  		objectsAdded.forEach((object) => {
  			physics.addObject(object)
  		})
  	})
  	window.socket.on('onResetObjects', (updatedObjects) => {
  		window.objects.forEach((object) => {
  			physics.removeObject(object)
  		})
  		window.objects = []
  	})
  	window.socket.on('onEditObjects', (editedObjects) => {
  		Object.assign(window.objects, editedObjects)
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

    window.socket.emit('askObjects')
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
      window.objects = objectsUpdated
    })
  }

  ///////////////////////////////
  ///////////////////////////////
  //shared events
  ///////////////////////////////
  window.socket.on('onResetPreferences', (hero) => {
    window.preferences = {}
  })

  window.socket.on('onHeroPosUpdate', (heroUpdated) => {
    if(!window.heros[heroUpdated.id]){
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
      console.log(window.hero.id, heroUpdated.id)
      if(!window.hero.id === heroUpdated.id) {
        console.log('doing')
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
        for(var heroId in window.heros) {
          if(window.heros[heroId].tags && window.heros[heroId].tags.isPlayer) {
            window.setEditingHero(window.heros[heroId])
            break;
          }
        }
      }
  	}
  })

  window.socket.on('onRemoveObject', (id) => {
    if(window.usePlayEditor && window.editingObject.id === id) {
      window.editingObject = {}
      window.simpleeditor.set({})
    }
    window.removeObject(id)
  })

  window.socket.on('onSetWorld', (world) => {
    window.objects = world.objects
    window.objects.forEach((object) => {
      physics.addObject(object)
    })

    window.heros = world.heros
    window.preferences = world.preferences
    window.grid = world.grid || []
    window.gridNodeSize = world.gridNodeSize || 40
    window.gridSize = world.gridSize || { x: 50, y: 50 }
    if(window.hero && !window.usePlayEditor){
      findHeroInNewWorld(world)
      window.socket.emit('updateHero', window.hero)
    }
    if(window.usePlayEditor) {
      window.socket.emit('updateGrid', window.grid, window.gridNodeSize, window.gridSize)
    }

    window.socket.emit('updatePreferences', window.preferences)
  })
  window.socket.on('onUpdateGrid', (grid, gridNodeSize, gridSize) => {
    window.grid = grid
    window.gridSize = gridSize
    window.gridNodeSize = gridNodeSize
  })

  window.socket.on('onDeleteHero', (id) => {
    delete window.heros[id]
    if(window.usePlayEditor && window.editingHero.id == id) {
      window.setEditingHero({})
    }
  })

  window.socket.emit('askGrid');
  window.socket.emit('askHeros');
  window.socket.emit('askPreferences')
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
