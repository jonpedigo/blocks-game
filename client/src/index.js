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
// controlling X or Y scroll. For example. allow X croll, but not Y scroll
// lazy scroll that is not not immediate! Smoother...
// leveling up
// optimize shadow feature, not all vertices!
// Instead of creating one big block, create a bunch of small blocks, OPTION
// Maybe make a diagonal wall..
// Local game state saving outside of server

///////
// Debounce editors so they submit save after a couple seconds wait or when you navigate away
// set zoom multiplier to fit camera boundary
// EVENTS MISSING -- UNLOAD GAME ( for switching between games, and new games )

import './styles/index.scss'
import './styles/jsoneditor.css'
import chat from './js/chat.js'
import physics from './js/physics.js'
import input from './js/input.js'
import camera from './js/camera.js'
import collisions from './js/collisions.js'
import playEditor from './js/playeditor/index.js'
import shadow from './js/shadow.js'
import intelligence from './js/intelligence.js'
import grid from './js/grid.js'
import feedback from './js/feedback.js'
import io from 'socket.io-client'
import sockets from './js/sockets.js'
import constellation from './js/constellation.js'
import pathfinding from './js/pathfinding.js'
import utils from './js/utils.js'
import objects from './js/objects.js'
import hero from './js/hero.js'
import world from './js/world.js'
import render from './js/render.js'
import gameState from './js/gameState.js'
import './js/events.js'
import games from './js/games/index'

window.init = function () {
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

  window.canvas = document.createElement("canvas");
  window.ctx = window.canvas.getContext("2d");
  window.canvas.width = window.CONSTANTS.PLAYER_CANVAS_WIDTH;
  window.canvas.height = window.CONSTANTS.PLAYER_CANVAS_HEIGHT;
  window.canvas.id = 'game'
  document.body.appendChild(window.canvas);

  window.usePlayEditor = localStorage.getItem('useMapEditor') === 'true'
  if(!window.usePlayEditor) {
    window.host = true
    var editor = document.getElementById("play-editor");
    editor.style = 'display:none';
  }

  games.init()
  objects.init()
  world.init()
	grid.init()
  sockets.init()

  if(usePlayEditor) {
		playEditor.init(ctx)
	} else {
    hero.init()
    feedback.init()
    constellation.init(ctx)
    camera.init()
		input.init()
		chat.init()
    gameState.init()
    /// DEFAULT GAME FX
    if(window.defaultGame) {
      window.defaultGame.init()
    }
    /// CUSTOM GAME FX
    if(window.customGame) {
      window.customGame.init()
    }
	}
};

// Update game objects
var update = function (delta) {
  if(!window.gameState.paused) {
    input.update(delta)
    intelligence.update(window.hero, window.objects, delta)
    physics.update(delta)

    /// DEFAULT GAME FX
    if(window.defaultGame) {
      window.defaultGame.update(delta)
    }
    /// CUSTOM GAME FX
    if(window.customGame) {
      window.customGame.update(delta)
    }

    if(window.anticipatedObject) {
      window.anticipateObjectAdd()
    }
  }

  if(window.hero.animationZoomTarget) {
    window.heroZoomAnimation()
  }
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
// The main game loop
var mainLoop = function () {
  if(!window.objects || !window.world || !window.grid.nodes || Object.keys(window.heros).length === 0) {
    requestAnimationFrame(main);
    return
  }

	var now = Date.now();
	var delta = now - then;
  window.fps = 1000 / delta;

	if(delta > 23) delta = 23

	if(window.usePlayEditor) {
		playEditor.update(delta)
    playEditor.render(ctx, window.hero, window.objects);
  }else {
		update(delta / 1000);
    render.update();

    /// DEFAULT GAME FX
    if(window.defaultGame) {
      window.defaultGame.render(ctx)
    }

    /// CUSTOM GAME FX
    if(window.customGame) {
      window.customGame.render(ctx)
    }

    if(window.hero.animationZoomMultiplier) {
      constellation.animate()
    }
  }

  if(window.world.globalTags.calculatePathCollisions) {
    grid.updateGridObstacles()
    window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
  }

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(mainLoop);
};

var then;
window.onGameLoaded = function() {
  then = Date.now()
  if(!window.objects || !window.world || !window.grid.nodes || Object.keys(window.heros).length === 0 || (!window.usePlayEditor && !window.hero)) {
    console.log('game loaded without critical data, aborting')
    return
  }

  // begin main loop
  mainLoop()

  if(!window.usePlayEditor) {
    setInterval(() => {
      if(window.host) {
        window.socket.emit('updateObjects', window.objects)
        window.socket.emit('updateGameState', window.gameState)
      }
      window.socket.emit('updateHeroPos', window.hero)
      localStorage.setItem('hero', JSON.stringify(window.hero));
    }, 100)
  } else {
    playEditor.loaded()
  }
}
window.init()
