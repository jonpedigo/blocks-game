import pathfinding from '../utils/pathfinding.js'
import collisions from '../utils/collisions'
import grid from '../utils/grid.js'

function setDefault() {
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
      filled: true,
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
    },
  }

  window.local.on('onGridLoaded', () => {
    window.defaultHero.x = GAME.grid.startX + (GAME.grid.width * GAME.grid.nodeSize)/2
    window.defaultHero.y = GAME.grid.startY + (GAME.grid.height * GAME.grid.nodeSize)/2

    window.defaultHero.subObjects = {
      actionTriggerArea: {
        x: 0, y: 0, width: 40, height: 40,
        actionTriggerArea: true,
        relativeX: -GAME.grid.nodeSize,
        relativeY: -GAME.grid.nodeSize,
        relativeWidth: GAME.grid.nodeSize * 2,
        relativeHeight: GAME.grid.nodeSize * 2,
        changeWithDirection: false,
        tags: { obstacle: false, invisible: true, stationary: true },
      },
      spear: {
        x: 0, y: 0, width: 40, height: 40,
        relativeX: GAME.grid.nodeSize/5,
        relativeY: -GAME.grid.nodeSize,
        relativeWidth: -GAME.grid.nodeSize * .75,
        relativeHeight: 0,
        changeWithDirection: true,
        tags: { monsterDestroyer: true, obstacle: false },
      }
    }
  })
}

window.spawnHero = function (hero, game = GAME) {
  // hero spawn point takes precedence
  if(hero.spawnPointX && hero.spawnPointX >= 0) {
    hero.x = hero.spawnPointX
    hero.y = hero.spawnPointY
  } else if(game && game.world.worldSpawnPointX && game.world.worldSpawnPointX >= 0) {
    hero.x = game.world.worldSpawnPointX
    hero.y = game.world.worldSpawnPointY
  } else {
    hero.x = 960
    hero.y = 960
  }
}

window.respawnHero = function (hero, game = GAME) {
  hero.velocityX = 0
  hero.velocityY = 0

  /// send objects that are possibly camping at their spawn point back to their spawn point
  if(role.isHost && game && game.world && game.world.globalTags.noCamping) {
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
  Object.keys(GAME.heros).forEach((id) => {
    window.respawnHero(GAME.heros[id])
  })
}

window.updateAllHeros = function(update) {
  Object.keys(GAME.heros).forEach((id) => {
    window.mergeDeep(GAME.heros[id], update)
  })
}

window.resetHeroToDefault = function(hero, game = GAME) {
  window.removeHeroFromGame(hero)
  let newHero = JSON.parse(JSON.stringify(window.defaultHero))
  if(GAME.hero) {
    newHero = JSON.parse(JSON.stringify(window.mergeDeep(window.defaultHero, GAME.hero)))
  }
  if(!hero.id) {
    alert('hero getting reset without id')
  }
  newHero.id = hero.id
  window.spawnHero(newHero)
  window.addHeroToGame(newHero)
  return newHero
}

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
    width: window.playerCameraWidth * hero.zoomMultiplier,
    height: window.playerCameraHeight * hero.zoomMultiplier,
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
    cameraWidth: window.playerCameraWidth,
    cameraHeight: window.playerCameraHeight,
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

window.addHeroToGame = function(hero) {
  console.log('ADDDING HERO', hero)
  PHYSICS.addObject(hero)
}

window.removeHeroFromGame = function(hero) {
  if(PHYSICS.objects[hero.id]) {
    PHYSICS.removeObject(hero)
  }
}

window.forAllHeros = function (fx) {
  Object.keys(GAME.heros).forEach((id) => {
    fx(GAME.heros[id], id)
  })
}

export default {
  setDefault,
}
