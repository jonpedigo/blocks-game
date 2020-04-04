import physics from './physics.js'

function init() {
  window.defaultHero = {
  	width: 40,
  	height: 40,
  	velocityX: 0,
  	velocityY: 0,
  	velocityMax: 200,
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
    x: 960,
    y: 960,
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

  if(!window.usePlayEditor) {
  	let savedHero = JSON.parse(localStorage.getItem('hero'));
  	if(savedHero){
  		window.hero = savedHero
      // in case we need to reset
      window.defaultHero.id = savedHero.id
  	} else if(!window.hero) {
      window.defaultHero.id = 'hero-'+Date.now()
  		window.hero = JSON.parse(JSON.stringify(window.defaultHero))
  		window.respawnHero()
  	}
  	window.hero.reachablePlatformHeight = window.resetReachablePlatformHeight(window.hero)
  	window.hero.reachablePlatformWidth = window.resetReachablePlatformWidth(window.hero)

  	window.socket.emit('saveSocket', hero)

  	// fuckin window.heros...
  	window.heros = {
  		[window.hero.id]:window.hero,
  	}

  	physics.addObject(window.hero)
  }
}

window.respawnHero = function () {
  // hero spawn point takes precedence
  window.client.emit('onRespawnHero')

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

window.resetHero = function(updatedHero) {
	physics.removeObject(window.hero)
	if(updatedHero) {
		window.mergeDeep(window.hero, updatedHero)
	} else {
    let newHero = {}
		Object.assign(newHero, JSON.parse(JSON.stringify(defaultHero)))
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

export default {
  init
}
