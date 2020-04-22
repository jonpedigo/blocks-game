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
      obstacle: true,
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

  window.local.on('onGridLoaded', () => {
    window.defaultHero.x = w.game.grid.startX + (w.game.grid.width * w.game.grid.nodeSize)/2
    window.defaultHero.y = w.game.grid.startY + (w.game.grid.height * w.game.grid.nodeSize)/2
  })

  let savedHero = localStorage.getItem('hero');
  if(savedHero && JSON.parse(savedHero).id){
    window.heroId = JSON.parse(savedHero).id
  } else {
    window.heroId = 'hero-'+window.uniqueID()
  }
}

function loaded() {

}

window.spawnHero = function (hero, game = w.game) {
  // hero spawn point takes precedence
  if(hero.spawnPointX && hero.spawnPointX >= 0) {
    hero.x = hero.spawnPointX;
    hero.y = hero.spawnPointY;
  } else if(game && game.world.worldSpawnPointX && game.world.worldSpawnPointX >= 0) {
    hero.x = game.world.worldSpawnPointX
    hero.y = game.world.worldSpawnPointY
  } else {
    // default pos
    hero.x = 960;
    hero.y = 960;
  }
}

window.respawnHero = function (hero, game = w.game) {
  hero.velocityX = 0
  hero.velocityY = 0

  /// send objects that are possibly camping at their spawn point back to their spawn point
  if(window.host && game && game.world && game.world.globalTags.noCamping) {
    game.objects.forEach((obj) => {
      if(obj.removed) return

      if(obj.tags.zombie || obj.tags.homing) {
        const { gridX, gridY } = grid.convertToGridXY(obj)
        obj.gridX = gridX
        obj.gridY = gridY

        const spawnGridPos = grid.convertToGridXY({x: obj.spawnPointX, y: obj.spawnPointY})

        obj.path = pathfinding.findPath({
          x: gridX,
          y: gridY,
        }, {
          x: spawnGridPos.gridX,
          y: spawnGridPos.gridY,
        }, obj.pathfindingLimit)
      }
    })
  }

  window.spawnHero(hero, game)
}

window.respawnHeros = function (hero) {
  Object.keys(w.game.heros).forEach((id) => {
    window.respawnHero(w.game.heros[id])
  })
}

window.updateAllHeros = function(update) {
  Object.keys(w.game.heros).forEach((id) => {
    window.mergeDeep(w.game.heros[id], update)
  })
}

window.resetHeroToDefault = function(hero, game = w.game) {
  let newHero = JSON.parse(JSON.stringify(window.defaultHero))
  if(window.game.hero) {
    newHero = JSON.parse(JSON.stringify(window.game.hero))
  }
  if(hero && hero.id) {
    newHero.id = hero.id
  }
  window.spawnHero(newHero)
  return newHero
}
// window.resetHeroToDefault = function(hero) {
// 	physics.removeObject(hero)
//   let newHero = {}
//   window.defaultHero.id = window.hero.id
// 	Object.assign(newHero, JSON.parse(JSON.stringify(window.defaultHero)))
//   w.game.heros[window.hero.id] = window.hero
// 	localStorage.setItem('hero', JSON.stringify(window.hero));
// 	physics.addObject(hero)
// }

window.heroZoomAnimation = function(hero) {
  if(hero.animationZoomTarget > hero.animationZoomMultiplier) {
    hero.animationZoomMultiplier = hero.animationZoomMultiplier/.97
    if(hero.animationZoomTarget < hero.animationZoomMultiplier) {
      if(hero.endAnimation) hero.animationZoomMultiplier = null
      else {
        hero.animationZoomMultiplier = hero.animationZoomTarget
      }
    }
  }

  if(hero.animationZoomTarget < hero.animationZoomMultiplier) {
    hero.animationZoomMultiplier = hero.animationZoomMultiplier/1.03
    if(hero.animationZoomTarget > hero.animationZoomMultiplier) {
      if(hero.endAnimation) hero.animationZoomMultiplier = null
      else {
        hero.animationZoomMultiplier = hero.animationZoomTarget
      }
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
        window.local.emit('gameOver')
      }
      hero.lives--
      respawnObjects.push(hero)
      return
    }
  }

  if(collider.tags && collider.tags['coin']) {
    hero.score++
  }

  if(collider.tags && collider.tags['chatter'] && collider.heroUpdate && collider.heroUpdate.chat && collider.heroUpdate.chat.length) {
    if(collider.id !== hero.lastChatId) {
      hero.chat = JSON.parse(JSON.stringify(collider.heroUpdate.chat))
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
          update.prev[prop][ag] = hero[prop][ag]
        }
      } else {
        update.prev[prop] = hero[prop]
      }
    }
    hero.updateHistory.push(update)
    window.mergeDeep(hero, JSON.parse(JSON.stringify(collider.heroUpdate)))
    hero.lastPowerUpId = collider.id

    if(collider.tags['revertAfterTimeout']) {
      setRevertUpdateTimeout(hero, collider)
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

window.findHeroInNewGame = function(game, hero) {
  // if we have decided to restore position, find hero in hero list
  if(game.world.globalTags.shouldRestoreHero && game.heros && hero) {
    for(var heroId in game.heros) {
      let currentHero = game.heros[heroId]
      if(currentHero.id == hero.id) {
        return currentHero
      }
    }
    console.log('failed to find hero with id' + window.hero.id)
  }

  if(!game.world.globalTags.isAsymmetric && game.hero) {
    // save current users id to the world.hero object and then store all other variables as the new hero
    if(hero && hero.id) game.hero.id = hero.id
    hero = game.hero
    // if(!hero.id) hero.id = 'hero-'+window.uniqueID()
    // but then also respawn the hero
    window.respawnHero(hero, game)
    return hero
  }

  return window.resetHeroToDefault(hero, game)
}

export default {
  init,
  onCollide,
  loaded,
}
