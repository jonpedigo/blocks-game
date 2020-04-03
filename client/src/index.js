// console log saved world so I can copy it to a file - dont save grid, regenerate grid
// attack button ( like papa bear spears!! )
// set game boundaries to delete objects - default game boundaries with a default grid..
// make it easier for admin to move objects
// TRUE zelda camera work

// death by jump

// Pathfinding for something larger than one grid node
// Perhaps not PATHFINDING but… targeting.

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
// toggle for show grid, show names, show camera area... stc
// controlling X or Y scroll. For example. allow X croll, but not Y scroll
// lazy scroll that is not not immediate! Smoother...
// leveling up
// optimize shadow feature, not all vertices!
// Instead of creating one big block, create a bunch of small blocks, OPTION
// Maybe make a diagonal wall..

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
import './js/events.js'

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
	PLAYER_CANVAS_HEIGHT: 320 * window.canvasMultiplier,
  PLAYER_CAMERA_WIDTH: 640,
  PLAYER_CAMERA_HEIGHT: 320,
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
  velocityMax: 100,
  speed: 100,
  color: 'white',
  // cant put objects in it cuz of some pass by reference BS...
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
		Object.assign(window.hero, updatedHero)
	} else {
    let newHero = {}
		Object.assign(newHero, JSON.parse(JSON.stringify(defaultHero)))
    window.hero = newHero
    window.heros[window.hero.id] = window.hero
	}
	localStorage.setItem('hero', JSON.stringify(window.hero));
	physics.addObject(window.hero)
}

/////////////
//GAME
/////////////
/////////////
window.defaultWorld = {
  id: 'world-' + Date.now(),
	lockCamera: {},
	gameBoundaries: {},
  procedural: {},
  worldSpawnPointX: null,
  worldSpawnPointY: null,
  globalTags: {
    calculatePathCollisions: false,
    noCamping: true,
    targetOnSight: true,
    paused: false,
    isAsymmetric: false,
    shouldRestoreHero: false,
  }
}
window.world = JSON.parse(JSON.stringify(window.defaultWorld));

/////////////
// HERO
/////////////
/////////////
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
      if(!window.objects || !window.world || !window.grid.nodes || Object.keys(window.heros).length === 0) {
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
  if(!window.world.globalTags.paused) {
    input.update(hero, delta)
    if(window.hero.arrowKeysBehavior !== 'grid') {
      physics.update(delta)
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

  if(window.anticipatedObject) {
    const { minX, maxX, minY, maxY, centerY, centerX, leftDiff, rightDiff, topDiff, bottomDiff, cameraHeight, cameraWidth } = window.getViewBoundaries(window.hero)

    let isWall = window.anticipatedObject.wall

    if (leftDiff < 1 && window.hero.directions.left) {
      let newObject = {
        x: minX - window.grid.nodeSize,
        y: isWall ? minY + ( window.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minY, maxY),
        width: window.grid.nodeSize,
        height: isWall ? (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * 2) - (window.grid.nodeSize * 3) : window.grid.nodeSize,
      }
      addAnticipatedObject(newObject)
    } else if (topDiff < 1 && window.hero.directions.up) {
      let newObject = {
        x: isWall ? minX + ( window.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minX, maxX),
        y: minY - window.grid.nodeSize,
        width: isWall ? (window.CONSTANTS.PLAYER_CAMERA_WIDTH * 2) - (window.grid.nodeSize * 4) : window.grid.nodeSize,
        height: window.grid.nodeSize,
      }
      addAnticipatedObject(newObject)
    } else if (rightDiff > window.grid.nodeSize - 1 && window.hero.directions.right) {
      let newObject = {
        x: maxX + window.grid.nodeSize,
        y: isWall ? minY + ( window.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minY, maxY),
        width: window.grid.nodeSize,
        height: isWall ? (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * 2) - (window.grid.nodeSize * 4) : window.grid.nodeSize,
      }
      addAnticipatedObject(newObject)
    } else if (bottomDiff > window.grid.nodeSize - 1 && window.hero.directions.down) {
      let newObject = {
        x: isWall ? minX + ( window.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minX, maxX),
        y: maxY + window.grid.nodeSize,
        width: isWall ? (window.CONSTANTS.PLAYER_CAMERA_WIDTH * 2) - (window.grid.nodeSize * 4) : window.grid.nodeSize,
        height: window.grid.nodeSize,
      }
      addAnticipatedObject(newObject)
    }

    function addAnticipatedObject(newObject) {
      let {x , y} = grid.snapXYToGrid(newObject.x, newObject.y)
      if(grid.keepGridXYWithinBoundaries(x/window.grid.nodeSize, y/window.grid.nodeSize)) {
        window.addObjects([{...newObject, ...window.anticipatedObject}])
        window.anticipatedObject = null
      }
    }
  }
};

// Draw everything
var render = function () {
	let vertices = [...window.objects].reduce((prev, object) => {
    if(object.removed) return prev
    if(object.tags.invisible) return prev
    let extraProps = {}
    if(object.tags.glowing) {
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

	window.world.renderStyle = 'outlines'
 	if (window.world.renderStyle === 'outlines') {
		ctx.strokeStyle = "#999";
		for(var i=0;i<vertices.length;i++){
			camera.drawVertice(ctx, vertices[i])
		}
		ctx.fillStyle = 'white';
		camera.drawObject(ctx, window.hero)
	} else if(window.world.renderStyle === 'physics'){
		physics.drawSystem(ctx, vertices)
	} else {
		for(let i = 0; i < window.objects.length; i++){
      if(window.objects[i].removed) continue
      if(window.objects[i].tags.invisible) continue
			camera.drawObject(ctx, window.objects[i])
		}
	}

	window.world.shadows = false
	if(window.world.shadows === true) {
		shadow.draw(ctx, vertices, hero)
	}

  for(var heroId in window.heros) {
    if(heroId === window.hero.id) continue;
    let currentHero = window.heros[heroId];
    camera.drawObject(ctx, currentHero);
  }

  chat.render(ctx);
	feedback.draw(ctx);
}

// The main game loop
var main = function () {
  if(!window.objects || !window.world || !window.grid.nodes || Object.keys(window.heros).length === 0) {
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

  if(window.world.globalTags.calculatePathCollisions) {
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
