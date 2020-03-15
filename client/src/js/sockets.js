import grid from './grid.js'
import physics from './physics.js'

function init() {

  ///////////////////////////////
  ///////////////////////////////
  //just for clients
  ///////////////////////////////
  if(!window.usePlayEditor) {
  	window.socket.on('onAddObjects', (objectsAdded) => {
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
  		window.objects.length = 0
  		window.location.reload()
  	})
  	window.socket.on('onEditObjects', (editedObjects) => {
  		Object.assign(window.objects, editedObjects)
  	})

  	window.socket.on('onUpdateHeroPos', (updatedHero) => {
  		window.resetHero(updatedHero)
  	})

  	window.socket.on('onSnapAllObjectsToGrid', () => {
  		window.snapAllObjectsToGrid()
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
      window.location.reload()
    })
    window.socket.on('onUpdateObjects', (objectsUpdated) => {
      window.objects = objectsUpdated
    })
  }

  ///////////////////////////////
  ///////////////////////////////
  //shared events
  ///////////////////////////////
  window.socket.on('onHeroPosUpdate', (heroUpdated) => {
    if(!window.heros[heroUpdated.id]){
      window.heros[heroUpdated.id] = {}
    }
    Object.assign(window.heros[heroUpdated.id], heroUpdated)
    if(window.usePlayEditor && window.preferences.syncHero && window.editingHero.id === heroUpdated.id) window.getHero()
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
  	if(window.hero && updatedHero.id === window.hero.id){
  		window.resetHero(updatedHero)
  	} else {
  		Object.assign(window.heros[updatedHero.id], updatedHero)
  	}
  })

  window.socket.on('onResetHero', (hero) => {
  	if(hero.id === window.hero.id) {
  		window.resetHero()
  	}
  })

  window.socket.on('onRemoveObject', (id) => {
    if(window.usePlayEditor && window.editingObject.id === id) {
      window.editingObject = {}
      window.simpleeditor.set({})
    }
    window.removeObject(id)
  })

  window.socket.emit('askHeros');
  window.socket.emit('askPreferences')
}

export default {
  init
}
