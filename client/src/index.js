// attack button ( like papa bear spears!! )
// set game boundaries to delete objects
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
// Instead of creating one big block, create a bunch of small blocks, OPTION. NO DDO NOT DDO THIS. MAybe make it a design...
// INSTEAD allow for stationary objects that are touching eachother to all be combined! This helps with physics and performance
// Maybe make a diagonal wall..
// path goals AKA patrol


///////
// Debounce editors so they submit save after a couple seconds wait or when you navigate away
// EVENTS MISSING -- UNLOAD GAME ( for switching between games, and new games ) or I just need stronger defaults..
// editor gridsnap toggle in world editorPref


////
// (Snap to grid Toggle)
//
// — bring velocity to zero for hero
// — speed up hero
// — slow down hero
// — increase speed parameter
// — decrease speed parameter
// — set Zoom to all heros
// add grid to world editor
// Set Both camera and game boundaries ( perhaps check boxes )
// START THEM OFF CHECKED..
//
// Zoom out area, zoom in area
// Zoom out hero and areas
//
// ( Force anticipated add )
//
// Follow whatever you are editing


import './styles/index.scss'
import './styles/jsoneditor.css'
import chat from './js/chat.js'
import physics from './js/physics.js'
import input from './js/input.js'
import camera from './js/camera.js'
import collisions from './js/collisions.js'
import playEditor from './js/playeditor/playeditor.js'
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
import ghost from './js/ghost.js'

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
  window.canvas.id = 'game-canvas'
  document.body.appendChild(window.canvas);

  window.usePlayEditor = localStorage.getItem('useMapEditor') === 'true'
  window.host = true
  window.isPlayer = true

  if(window.usePlayEditor) {
    window.host = false
    window.isPlayer = false
  }

  if(window.getParameterByName('editorPlayer')) {
    window.usePlayEditor = false
    // the only reason this editorPlayer flag exists is to handle the half host who only updates their own hero..
    window.editorPlayer = true
    window.isPlayer = true
    window.host = true
  }

  if(window.getParameterByName('ghost')) {
    window.usePlayEditor = false
    window.editorPlayer = true
    window.isPlayer = false
    window.host = false
    window.ghost = true
  }

  if(!window.usePlayEditor) {
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
	}

  /// DEFAULT GAME FX
  if(window.defaultGame) {
    window.defaultGame.init()
  }
};

// Update game objects
var update = function (delta) {
  if(!window.gameState.paused) {

    // non hosts will have to submit some sort of input, but not run the physics or ai sim
    input.update(delta)

    if(window.host) {
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
      /// CUSTOM GAME FX
      if(window.liveCustomGame) {
        window.liveCustomGame.update(delta)
      }

      if(window.anticipatedObject) {
        window.anticipateObjectAdd()
      }
    }

    if(window.ghost) {
      ghost.update()
    }
  }
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
// The main game loop
var mainLoop = function () {
	var now = Date.now();
	var delta = now - then;
  window.fps = 1000 / delta;
  window.lastDelta = delta;
	if(delta > 23) delta = 23

	if(window.usePlayEditor) {
		playEditor.update(delta)
    playEditor.render(ctx, window.hero, window.objects);
  }else {
		update(delta / 1000);
    render.update(ctx, delta / 1000);

    /// DEFAULT GAME FX
    if(window.defaultGame) {
      window.defaultGame.render(ctx, delta / 1000)
    }

    /// CUSTOM GAME FX
    if(window.customGame) {
      window.customGame.render(ctx, delta / 1000)
    }

    /// CUSTOM GAME FX
    if(window.liveCustomGame) {
      window.liveCustomGame.render(ctx, delta / 1000)
    }

    if(window.hero.animationZoomTarget) {
      window.heroZoomAnimation()
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
  if(!window.objects || !window.world || !window.grid.nodes || !window.heros || (window.isPlayer && !window.hero)) {
    console.log('game loaded without critical data, aborting')
    return
  }

  objects.loaded()
  if(window.isPlayer || window.editorPlayer) {
    hero.loaded()
    input.loaded()
  }
  if(window.usePlayEditor) {
    playEditor.loaded()
  } else {
    camera.loaded()
  }

  // begin main loop
  mainLoop()


  if(window.host) {
    function emitGameToEditor() {
      if(!window.editorPlayer) {
        window.socket.emit('updateObjects', window.objects)
        window.socket.emit('updateGameState', window.gameState)
      }
      window.socket.emit('updateHeroPos', window.hero)
      localStorage.setItem('hero', JSON.stringify(window.hero));
      let timeout = window.lastDelta * 7
      if(timeout > 250) {
        timeout = 250
      }
      setTimeout(emitGameToEditor, timeout)
    }

    setTimeout(emitGameToEditor, 100)
  }
}
window.init()
