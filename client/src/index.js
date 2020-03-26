// console log saved world so I can copy it to a file - dont save grid, regenerate grid
// attack button ( like papa bear spears!! )
// set game boundaries to delete objects - default game boundaries with a default grid..
// make it easier for admin to move objects
// TRUE zelda camera work

// death by jump

// satisfying death animations? satisfing death states or idk.. things?

//--------
// spencer wants the world to slowly build itself infront of them.... interesintg, npt sure how to do
// push block
// Smarter rendering
// INVERT GAME, for example, when you get pacman powers
// planet gravity! Would be cool to have..
// Send player to... x, y ( have them like start to move really fast and possibly pathfind)
// stop player (velocity)
// objects that are children of other objects and therefore follow them??
// toggle for score
// toggle for show grid, show names, show camera area... stc
// controlling X or Y scroll. For example. allow X croll, but not Y scroll
// lazy scroll that is not not immediate! Smoother...
// leveling up
// optimize shadow feature, not all vertices!

import './styles/index.scss'
import './styles/jsoneditor.css'
import chat from './js/chat.js'
import physics from './js/physics.js'
import input from './js/input.js'
import camera from './js/camera.js'
import collisions from './js/collisions.js'
import playEditor from './js/playeditor/index.js'
import shadow from './js/shadow.js'
import action from './js/action.js'
import intelligence from './js/intelligence.js'
import grid from './js/grid.js'
import battle from './js/battle.js'
import feedback from './js/feedback.js'
import io from 'socket.io-client'
import sockets from './js/sockets.js'
import constellation from './js/constellation.js'
import pathfinding from './js/pathfinding.js'
import utils from './js/utils.js'
// SOCKET START
if (window.location.origin.indexOf('localhost') > 0) {
  window.socket = io.connect('http://localhost:4000');
} else {
  window.socket = io.connect();
}
window.socket = socket

// DOM
window.canvasMultiplier = 1;
window.CONSTANTS = {
	PLAYER_CANVAS_WIDTH: 640 * window.canvasMultiplier,
	PLAYER_CANVAS_HEIGHT: 360 * window.canvasMultiplier,
  PLAYER_CAMERA_WIDTH: 640,
  PLAYER_CAMERA_HEIGHT: 360,
}

var canvas = document.createElement("canvas");
window.ctx = canvas.getContext("2d");
canvas.width = window.CONSTANTS.PLAYER_CANVAS_WIDTH;
canvas.height = window.CONSTANTS.PLAYER_CANVAS_HEIGHT;
canvas.id = 'game'
document.body.appendChild(canvas);

window.usePlayEditor = localStorage.getItem('useMapEditor') === 'true'
if(!window.usePlayEditor) {
  var editor = document.getElementById("play-editor");
  editor.style = 'display:none';
}

/// GLOBAL FX
// window.objects = []
window.defaultObject = {
  velocityX: 0,
  velocityY: 0,
  velocityMax: 0,
  speed: 100,
  color: 'white',
  tags: {},
  heroUpdate: {},
}

window.respawnHero = function () {
  // hero spawn point takes precedence
  if(window.preferences.worldSpawnPointX >= 0) {
    window.hero.x = window.preferences.worldSpawnPointX
    window.hero.y = window.preferences.worldSpawnPointY
    return
  }

  if(window.hero.spawnPointX >= 0) {
    window.hero.x = window.hero.spawnPointX;
    window.hero.y = window.hero.spawnPointY;
    return
  }

  // default pos
  window.hero.x = 960;
  window.hero.y = 960;
}

window.resetHero = function(updatedHero) {
	physics.removeObject(window.hero)
	if(updatedHero) {
		Object.assign(window.hero, updatedHero)
	} else {
    let newHero = {}
		Object.assign(newHero, defaultHero)
    window.hero = newHero
    window.heros[window.hero.id] = window.hero
	}
	localStorage.setItem('hero', JSON.stringify(window.hero));
	physics.addObject(window.hero)
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

window.addObjects = function(objects, options = { bypassCollisions: false, instantAdd: true }) {
  if(!objects.length) {
    objects = [objects]
  }

  let alertAboutCollision

  objects = objects.map((newObject) => {
    Object.assign(newObject, window.defaultObject)

    if(!newObject.id){
      newObject.id = 'object' + Date.now();
    }

    for(let tag in window.tags) {
      if(window.tags[tag].checked || newObject.tags[tag] === true){
        newObject.tags[tag] = true
      } else {
        newObject.tags[tag] = false
      }
    }

    newObject.spawnPointX = newObject.x
    newObject.spawnPointY = newObject.y

    if(!window.preferences.calculatePathCollisions) {
      grid.addObstacle(newObject)
    }

    if(!collisions.check(newObject, window.objects) || options.bypassCollisions) {
      return newObject
    } else {
      alertAboutCollision = true
    }
  }).filter(obj => !!obj)

  if(!window.usePlayEditor){
    console.log('?')
    window.objects.push(...objects)
    objects.forEach((object) => {
      physics.addObject(object)
    })

    if(!window.preferences.calculatePathCollisions) {
      grid.updateGridObstacles()
      window.resetPaths = true
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }
    return
  }

  if(alertAboutCollision) {
    if(confirm('already an object on this grid node..confirm to add anyways')) {
      emitNewObjects()
    }
  } else {
    emitNewObjects()
  }

  function emitNewObjects() {
    if(window.instantAddToggle.checked || options.instantAddToggle) {
      window.socket.emit('addObjects', objects)
    } else {
      window.objectFactory.push(...objects)
    }
  }
}

/////////////
//PREFERENCES
/////////////
/////////////
const defaultPreferences = {
	lockCamera: {},
	gameBoundaries: {},
}
window.preferences = defaultPreferences;

/////////////
// HERO
/////////////
/////////////
const defaultHero = {
	width: 40,
	height: 40,
  paused: false,
	velocityX: 0,
	velocityY: 0,
	velocityMax: 25,
	// accY: 0,
	// accX: 0,
	// accDecayX: 0,
	// accDecayY: 0,
	speed: 150,
	arrowKeysBehavior: 'position',
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
	zoomMultiplier: 1.8816764231589203,
  x: 960,
  y: 960,
  score: 0,
  chat: [],
  flags : {
    showChat: false,
    showScore: false,
    paused: false,
  }
}

if(!window.usePlayEditor) {
	let savedHero = JSON.parse(localStorage.getItem('hero'));
	if(savedHero){
		window.hero = savedHero
    // in case we need to reset
    defaultHero.id = savedHero.id
	} else if(!window.hero) {
    defaultHero.id = 'hero-'+Date.now()
		window.hero = {...defaultHero}
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

/////////////
//GAME LOOP
/////////////
/////////////
var start = function () {
	grid.init()
  sockets.init()

  if(usePlayEditor) {
		playEditor.init(ctx)
	} else {
    feedback.init()
    constellation.init(ctx)
    camera.init()
		input.init()
		chat.init()
		action.init()
	}
	main()
  if(!window.usePlayEditor) {
    setInterval(() => {
      if(!window.objects || !window.preferences || !window.grid.nodes || Object.keys(window.heros).length === 0) {
        return
      }
      window.socket.emit('updateObjects', window.objects)
      window.socket.emit('updateHeroPos', window.hero)
      localStorage.setItem('hero', JSON.stringify(window.hero));
    }, 100)
  }
};

// Update game objects
var update = function (delta) {
  if(!window.hero.flags.paused) {
    input.update(hero, delta)
    if(window.hero.arrowKeysBehavior !== 'grid') {
      physics.update(window.hero, window.objects, delta)
    } else {
      grid.update(window.hero, window.objects)
    }
    intelligence.update(window.hero, window.objects, delta)
    window.resetPaths = false
  }

  /// zoom targets
  if(window.hero.animationZoomTarget) {
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

  if(window.anticipateObjectAdd) {
    const { minX, maxX, minY, maxY, centerY, centerX, leftDiff, rightDiff, topDiff, bottomDiff } = window.getViewBoundaries(window.hero)

    if (leftDiff < 1 && window.hero.direction == 'left') {
      let newObject = {
        x: minX - window.grid.nodeSize,
        y: centerY,
        width: window.grid.nodeSize,
        height: window.grid.nodeSize,
      }
      window.addObjects([newObject])
      window.anticipatedObjectAdd = false
    } else if (topDiff < 1 && window.hero.direction == 'up') {
      let newObject = {
        x: centerX,
        y: minY - window.grid.nodeSize,
        width: window.grid.nodeSize,
        height: window.grid.nodeSize,
      }
      window.addObjects([newObject])
      window.anticipatedObjectAdd = false
    } else if (rightDiff > window.grid.nodeSize - 1 && window.hero.direction == 'right') {
      let newObject = {
        x: maxX,
        y: centerY,
        width: window.grid.nodeSize,
        height: window.grid.nodeSize,
      }
      window.addObjects([newObject])
      window.anticipatedObjectAdd = false
    } else if (bottomDiff > window.grid.nodeSize - 1 && window.hero.direction == 'down') {
      let newObject = {
        x: centerX,
        y: maxY,
        width: window.grid.nodeSize,
        height: window.grid.nodeSize,
      }
      window.addObjects([newObject])
      window.anticipatedObjectAdd = false
    }
  }
};

// Draw everything
var render = function () {
	let vertices = [...window.objects].reduce((prev, object) => {
    let extraProps = {}
    if(object.tags && object.tags.glowing) {
      extraProps.glow = 3
      extraProps.thickness = 2
      extraProps.color = 'white'
    }
		prev.push({a:{x:object.x,y:object.y}, b:{x:object.x + object.width,y:object.y}, ...extraProps})
		prev.push({a:{x:object.x + object.width,y:object.y}, b:{x:object.x + object.width,y:object.y + object.height}, ...extraProps})
		prev.push({a:{x:object.x + object.width,y:object.y + object.height}, b:{x:object.x,y:object.y + object.height}, ...extraProps})
		prev.push({a:{x:object.x,y:object.y + object.height}, b:{x:object.x,y:object.y}, ...extraProps})
		return prev
	}, [])

  //reset background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	//set camera so we render everything in the right place
  camera.set(ctx, window.hero)

	window.preferences.renderStyle = 'outlines'
 	if (window.preferences.renderStyle === 'outlines') {
		ctx.strokeStyle = "#999";
		for(var i=0;i<vertices.length;i++){
			camera.drawVertice(ctx, vertices[i])
		}
		ctx.fillStyle = 'white';
		camera.drawObject(ctx, window.hero)
	} else if(window.preferences.renderStyle === 'physics'){
		physics.drawSystem(ctx, vertices)
	} else {
		for(let i = 0; i < window.objects.length; i++){
			camera.drawObject(ctx, window.objects[i])
		}
	}

	window.preferences.shadows = false
	if(window.preferences.shadows === true) {
		shadow.draw(ctx, vertices, hero)
	}

  for(var heroId in window.heros) {
    let currentHero = window.heros[heroId];
    camera.drawObject(ctx, currentHero);
  }

  chat.render(ctx);
	feedback.draw(ctx);
}

// The main game loop
var main = function () {
  if(!window.objects || !window.preferences || !window.grid.nodes || Object.keys(window.heros).length === 0) {
    requestAnimationFrame(main);
    return
  }

	var now = Date.now();
	var delta = now - then;
	if(delta > 23) delta = 23

	if(window.usePlayEditor) {
		playEditor.update(delta)
    playEditor.render(ctx, window.hero, window.objects);
  }else {
		update(delta / 1000);
    render();
    if(window.hero.animationZoomMultiplier) {
      constellation.animate()
    } else {
      chat.render(ctx)
    }

		// physics.drawSystem(ctx, hero)
  }

  if(window.preferences.calculatePathCollisions) {
    grid.updateGridObstacles()
    window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
  }

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
setTimeout(start, 1000);
