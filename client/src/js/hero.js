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
    // x: window.grid.startX + (window.grid.width * window.grid.nodeSize)/2,
    // y: window.grid.startY + (window.grid.height * window.grid.nodeSize)/2,
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

  window.heros = {}

  window.client.on('onGridLoaded', () => {
    window.defaultHero.x = window.grid.startX + (window.grid.width * window.grid.nodeSize)/2
    window.defaultHero.y = window.grid.startY + (window.grid.height * window.grid.nodeSize)/2
  })
}

function loaded() {
  //hero
  let savedHero = localStorage.getItem('hero');
  if(savedHero !== 'undefined' && savedHero !== 'null' && savedHero && JSON.parse(savedHero).id){
    window.hero = JSON.parse(savedHero)
    // in case we need to reset
    window.defaultHero.id = window.hero.id
  } else {
    window.defaultHero.id = 'hero-'+Date.now()
    window.hero = JSON.parse(JSON.stringify(window.defaultHero))
    localStorage.setItem('hero', JSON.stringify(window.hero));
  }
  findHeroInNewWorld(window.game)
  window.hero.reachablePlatformHeight = window.resetReachablePlatformHeight(window.hero)
  window.hero.reachablePlatformWidth = window.resetReachablePlatformWidth(window.hero)
  // fuckin window.heros...
  window.heros[window.hero.id] = window.hero
  physics.addObject(window.hero)
  window.socket.emit('saveSocket', hero)
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

window.resetHeroToDefault = function(updatedHero) {
	physics.removeObject(window.hero)
  let newHero = {}
  window.defaultHero.id = window.hero.id
	Object.assign(newHero, JSON.parse(JSON.stringify(window.defaultHero)))
  window.hero = newHero
  window.heros[window.hero.id] = window.hero
	localStorage.setItem('hero', JSON.stringify(window.hero));
	physics.addObject(window.hero)
}

window.updateHero = function(updatedHero) {
  window.mergeDeep(window.hero, updatedHero)
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
    if(hero.tags['monsterDestroyer']) {
      if(collider.spawnPointX >= 0 && collider.tags['respawn']) {
        respawnObjects.push(collider)
      } else {
        removeObjects.push(collider)
      }
    } else {
      if(hero.lives == 0) {
        window.client.emit('gameOver')
      }
      hero.lives--
      respawnObjects.push(hero)
      return
    }
  }

  if(collider.tags && collider.tags['coin']) {
    hero.score++
  }

  if(collider.tags && collider.tags['chatter'] && collider.heroUpdate && collider.heroUpdate.chat) {
    if(colliderid !== hero.lastChatId) {
      hero.chat = collider.heroUpdate.chat.slice()
      // hero.chat.name = body.id
      hero.lastChatId = collider.id
    }
  }

  if(collider.tags && collider.tags['heroUpdate'] && collider.heroUpdate) {
    heroUpdate(hero, collider)
  } else {
    hero.lastPowerUpId = null
  }

  if(collider.tags && collider.tags.deleteAfter) {
    removeObjects.push(collider)
  }
}

function heroUpdate (hero, collider) {
  if(collider.id !== hero.lastPowerUpId) {
    if(!hero.timeouts) hero.timeouts = {}
    if(!hero.updateHistory) {
      hero.updateHistory = []
    }

    if(hero.timeouts[collider.fromCompendiumId] && collider.tags['revertAfterTimeout']) {
      clearTimeout(hero.timeouts[collider.fromCompendiumId])
      delete hero.timeouts[collider.fromCompendiumId]
      setRevertUpdateTimeout(hero, collider)
      return
    }

    // only have 4 edits in the history at a time
    if(hero.updateHistory.length >= 4) {
      hero.updateHistory.shift()
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
    hero.updateHistory.push(update)
    window.mergeDeep(window.hero, {...collider.heroUpdate})
    hero.lastPowerUpId = collider.id

    if(collider.tags['revertAfterTimeout']) {
      setRevertUpdateTimeout(collider)
    }
  }
}

function setRevertUpdateTimeout(hero, collider) {
  let timeout = window.setTimeout(() => {
    hero.updateHistory = hero.updateHistory.filter((update) => {
      if(collider.fromCompendiumId) {
        delete hero.timeouts[collider.fromCompendiumId]
        if(collider.fromCompendiumId === update.id) {
          window.mergeDeep(hero, {...update.prev})
          return false
        }
      }

      if(collider.id === update.id) {
        window.mergeDeep(hero, {...update.prev})
        return false
      }

      return true
    })
  }, collider.powerUpTimer || 10000)
  if(collider.fromCompendiumId) {
    hero.timeouts[collider.fromCompendiumId] = timeout
  }
}

window.findHeroInNewWorld = function(game) {
  // if we have decided to restore position, find hero in hero list
  if(game.world.globalTags.shouldRestoreHero && window.hero && window.hero.id && game.heros) {
    for(var heroId in game.heros) {
      let currentHero = game.heros[heroId]
      if(currentHero.id == window.hero.id) {
        window.hero = currentHero
        return
      }
    }
    console.log('failed to find hero with id' + window.hero.id)
  }

  if(!game.world.globalTags.isAsymmetric && game.hero) {
    // save current users id to the world.hero object and then store all other variables as the new hero
    if(window.hero && window.hero.id) game.hero.id = window.hero.id
    window.hero = game.hero
    if(!window.hero.id) window.hero.id = 'hero-'+Date.now()
    // but then also respawn the hero
    window.respawnHero()
    return
  }

  // other random bullshit if theres two different versions of the hero
  if(!Object.keys(game.heros).length) {
    window.resetHeroToDefault()
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

  window.resetHeroToDefault()
}

export default {
  init,
  onCollide,
  loaded,
}
