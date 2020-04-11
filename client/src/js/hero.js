import physics from './physics.js'
import pathfinding from './pathfinding.js'
import collisions from './collisions'
import grid from './grid.js'
import ghost from './ghost.js'

function init() {
  window.defaultHero = {
  	width: 40,
  	height: 40,
  	velocityX: 0,
  	velocityY: 0,
  	velocityMax: 200,
    color: 'white',
  	// accY: 0,
  	// accX: 0,
  	// accDecayX: 0,
  	// accDecayY: 0,
  	speed: 150,
  	arrowKeysBehavior: 'flatDiagonal',
    actionButtonBehavior: 'dropWall',
  	jumpVelocity: -480,
  	// spawnPointX: (40) * 20,
  	// spawnPointY: (40) * 20,
  	tags: {
      hero: true,
      isPlayer: true,
      monsterDestroyer: false,
      gravity: false,
    },
  	zoomMultiplier: 1.875,
    x: window.grid.startX + (window.grid.width * window.grid.nodeSize)/2,
    y: window.grid.startY + (window.grid.height * window.grid.nodeSize)/2,
    lives: 10,
    score: 0,
    chat: [],
    flags : {
      showChat: false,
      showScore: false,
      showLives: false,
      paused: false,
    },
    directions: {
      up: false,
      down: false,
      right: false,
      left: false,
    }
  }

  window.client.on('onGridLoaded', () => {
    window.defaultHero.x = window.grid.startX + (window.grid.width * window.grid.nodeSize)/2
    window.defaultHero.y = window.grid.startY + (window.grid.height * window.grid.nodeSize)/2

    if(window.ghost) {
      ghost.init()
    }
    if(window.isPlayer) {
    	let savedHero = localStorage.getItem('hero');
    	if(savedHero !== 'undefined' && savedHero !== 'null' && savedHero && JSON.parse(savedHero).id){
    		window.hero = JSON.parse(savedHero)
        // in case we need to reset
        window.defaultHero.id = savedHero.id
    	} else {
        window.defaultHero.id = 'hero-'+Date.now()
    		window.hero = JSON.parse(JSON.stringify(window.defaultHero))
    		window.spawnHero()
        localStorage.setItem('hero', JSON.stringify(window.hero));
    	}
    	window.hero.reachablePlatformHeight = window.resetReachablePlatformHeight(window.hero)
    	window.hero.reachablePlatformWidth = window.resetReachablePlatformWidth(window.hero)

    	window.socket.emit('saveSocket', hero)

    	// fuckin window.heros...
    	window.heros = {
    		[window.hero.id]:window.hero,
    	}
    }

    if(window.hero && window.host) {
      physics.addObject(window.hero)
    }
  })
}

function loaded() {

}

window.spawnHero = function () {
  // hero spawn point takes precedence
  if(window.hero.spawnPointX && window.hero.spawnPointX >= 0) {
    window.hero.x = window.hero.spawnPointX;
    window.hero.y = window.hero.spawnPointY;
  } else if(window.world.worldSpawnPointX && window.world.worldSpawnPointX >= 0) {
    window.hero.x = window.world.worldSpawnPointX
    window.hero.y = window.world.worldSpawnPointY
  } else {
    // default pos
    window.hero.x = 960;
    window.hero.y = 960;
  }
}

window.respawnHero = function () {
  window.hero.velocityX = 0
  window.hero.velocityY = 0
  window.client.emit('onRespawnHero')
  window.spawnHero()
}

window.resetHero = function(updatedHero) {
	physics.removeObject(window.hero)
	if(updatedHero) {
		window.mergeDeep(window.hero, updatedHero)
	} else {
    let newHero = {}
    window.defaultHero.id = window.hero.id
		Object.assign(newHero, JSON.parse(JSON.stringify(window.defaultHero)))
    window.hero = newHero
    window.heros[window.hero.id] = window.hero
	}
	localStorage.setItem('hero', JSON.stringify(window.hero));
	physics.addObject(window.hero)
}

window.heroZoomAnimation = function() {
  if(window.hero.animationZoomTarget > window.hero.animationZoomMultiplier) {
    window.hero.animationZoomMultiplier = window.hero.animationZoomMultiplier/.97
    if(window.hero.animationZoomTarget < window.hero.animationZoomMultiplier) {
      if(window.hero.endAnimation) window.hero.animationZoomMultiplier = null
      else {
        window.hero.animationZoomMultiplier = window.hero.animationZoomTarget
      }
      window.socket.emit('updateHero', window.hero)
    }
  }

  if(window.hero.animationZoomTarget < window.hero.animationZoomMultiplier) {
    window.hero.animationZoomMultiplier = window.hero.animationZoomMultiplier/1.03
    if(window.hero.animationZoomTarget > window.hero.animationZoomMultiplier) {
      if(window.hero.endAnimation) window.hero.animationZoomMultiplier = null
      else {
        window.hero.animationZoomMultiplier = window.hero.animationZoomTarget
      }
      window.socket.emit('updateHero', window.hero)
    }
  }
}

window.getViewBoundaries = function(hero) {
  const value = {
    width: window.CONSTANTS.PLAYER_CAMERA_WIDTH * hero.zoomMultiplier,
    height: window.CONSTANTS.PLAYER_CAMERA_HEIGHT * hero.zoomMultiplier,
    centerX: hero.x + hero.width/2,
    centerY: hero.y + hero.height/2,
  }
  value.x = value.centerX - value.width/2
  value.y = value.centerY - value.height/2
  const { leftDiff, rightDiff, topDiff, bottomDiff } = grid.getAllDiffs(value)
  grid.snapDragToGrid(value)

  return {
    centerX: value.centerX,
    centerY: value.centerY,
    minX: value.x,
    minY: value.y,
    maxX: value.x + value.width,
    maxY: value.y + value.height,
    leftDiff,
    rightDiff,
    topDiff,
    bottomDiff,
    cameraWidth: window.CONSTANTS.PLAYER_CAMERA_WIDTH,
    cameraHeight: window.CONSTANTS.PLAYER_CAMERA_HEIGHT,
  }
}

window.resetReachablePlatformHeight = function(heroIn) {
	let velocity = heroIn.jumpVelocity
	let gravity = 1000
	let delta = (0 - velocity)/gravity
	let height = (velocity * delta) +  ((gravity * (delta * delta))/2)
	return height
}

window.resetReachablePlatformWidth = function(heroIn) {
	let velocity = heroIn.speed
	let gravity = 1000
	let deltaInAir = (0 - heroIn.jumpVelocity)/gravity
	let width = (velocity * deltaInAir)
	return width * 2
}

function onCollide(hero, collider, result, removeObjects, respawnObjects) {
  if(collider.tags && collider.tags['monster']) {
    if(window.hero.tags['monsterDestroyer']) {
      if(collider.spawnPointX >= 0 && collider.tags['respawn']) {
        respawnObjects.push(collider)
      } else {
        removeObjects.push(collider)
      }
    } else {
      if(window.hero.lives == 0) {
        window.client.emit('gameOver')
      }
      window.hero.lives--
      respawnObjects.push(hero)
      return
    }
  }

  if(collider.tags && collider.tags['coin']) {
    window.hero.score++
  }

  if(collider.tags && collider.tags['chatter'] && collider.heroUpdate && collider.heroUpdate.chat) {
    if(colliderid !== window.hero.lastChatId) {
      window.hero.chat = collider.heroUpdate.chat.slice()
      // window.hero.chat.name = body.id
      window.hero.lastChatId = collider.id
    }
  }

  if(collider.tags && collider.tags['heroUpdate'] && collider.heroUpdate) {
    heroUpdate(collider)
  } else {
    window.hero.lastPowerUpId = null
  }

  if(collider.tags && collider.tags.deleteAfter) {
    removeObjects.push(collider)
  }
}

function heroUpdate (collider) {
  if(collider.id !== window.hero.lastPowerUpId) {
    if(!window.hero.timeouts) window.hero.timeouts = {}
    if(!window.hero.updateHistory) {
      window.hero.updateHistory = []
    }

    if(window.hero.timeouts[collider.fromCompendiumId] && collider.tags['revertAfterTimeout']) {
      clearTimeout(window.hero.timeouts[collider.fromCompendiumId])
      delete window.hero.timeouts[collider.fromCompendiumId]
      setRevertUpdateTimeout(collider)
      return
    }

    // only have 4 edits in the history at a time
    if(window.hero.updateHistory.length >= 4) {
      window.hero.updateHistory.shift()
    }

    let heroUpdate = collider.heroUpdate
    let update = {
      update: heroUpdate,
      prev: {},
      id: collider.fromCompendiumId || collider.id,
    }
    for(var prop in heroUpdate) {
      if(prop == 'flags' || prop == 'tags') {
        let ags = heroUpdate[prop]
        update.prev[prop] = {}
        for(let ag in ags) {
          update.prev[prop][ag] = window.hero[prop][ag]
        }
      } else {
        update.prev[prop] = window.hero[prop]
      }
    }
    window.hero.updateHistory.push(update)
    window.mergeDeep(window.hero, {...collider.heroUpdate})
    window.hero.lastPowerUpId = collider.id

    if(collider.tags['revertAfterTimeout']) {
      setRevertUpdateTimeout(collider)
    }
  }
}

function setRevertUpdateTimeout(collider) {
  let timeout = window.setTimeout(() => {
    window.hero.updateHistory = window.hero.updateHistory.filter((update) => {
      if(collider.fromCompendiumId) {
        delete window.hero.timeouts[collider.fromCompendiumId]
        if(collider.fromCompendiumId === update.id) {
          window.mergeDeep(window.hero, {...update.prev})
          return false
        }
      }

      if(collider.id === update.id) {
        window.mergeDeep(window.hero, {...update.prev})
        return false
      }

      return true
    })
  }, collider.powerUpTimer || 10000)
  if(collider.fromCompendiumId) {
    window.hero.timeouts[collider.fromCompendiumId] = timeout
  }
}

export default {
  init,
  onCollide,
  loaded,
}
