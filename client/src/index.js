// CURRENT PRIORITY
// Zoom out area, zoom in area
// Zoom out hero and areas
//
// ( Force anticipated add )

////////////////////////////////////////////////////

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
//
// Follow whatever you are editing
// editor preferences - zoom, editing object, editing hero, current menu, etc..
// I already have world MODIFIERS, those are the worlds I have just created. Make them world modifiers instead of loaded world?
// Switch tools based on actions!

// HOST EVENT FOR RESET OBJECT STATE AKA CLEANUP? Delete objects, reset values to their initial state values
// its very possible that iniital state could work where we just copy window.objects upon starting the game, when the game
// wants to be restarted, we just set the objects back to that initial value...
// the complicated thing is deciding where to add the objects that are being added during 'play'
// having an indicator notifying if we are adding an object during play and therefore just part of game state vs actually adding to the world...?

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

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// ON PAGE LOAD
///////////////////////////////
///////////////////////////////
window.onPageLoad = function() {
  window.pageState = {
    gameLoaded: false
  }

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
  window.host = false
  window.isPlayer = true

  if(window.usePlayEditor) {
    window.host = true
    window.isPlayer = false
  }

  if(window.getParameterByName('ghost')) {
    window.usePlayEditor = false
    window.isPlayer = false
    window.host = false
    window.ghost = true
  }

  if(!window.usePlayEditor) {
    var editor = document.getElementById("play-editor");
    editor.style = 'display:none';
  }

  if(window.host) {
    console.log('host')
  } else {
    console.log('non host')
  }

  if(window.usePlayEditor) {
    console.log('editor')
  }
  if(window.isPlayer) {
    console.log('player')
  }

  // SOCKET START
  if (window.location.origin.indexOf('localhost') > 0) {
    window.socket = io.connect('http://localhost:4000');
  } else {
    window.socket = io.connect();
  }
  window.socket = socket

  window.initializeGame()
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// ON INITIALIZE
///////////////////////////////
///////////////////////////////
window.initializeGame = function (initialGameId) {
  games.init()
  objects.init()
  world.init()
	grid.init()
  sockets.init()
  gameState.init()
  hero.init()

  if(window.usePlayEditor) {
		playEditor.init(ctx)
	}

  if(window.ghost) {
    ghost.init()
  }

  if(window.isPlayer){
    feedback.init()
    constellation.init(ctx)
    camera.init()
		input.init()
		chat.init()
	}

  // when you are constantly reloading the page we will constantly need to just ask the server what the truth is
  window.socket.emit('askRestoreCurrentGame')
  window.socket.on('onAskRestoreCurrentGame', (game) => {
    let currentGameExists = game && game.id

    if(window.isPlayer) {
      if(currentGameExists) {
        // window.socket.emit('askJoinCurrentGame')
        // window.socket.on('onJoinCurrentGame', () => {
          window.loadGame(game)
        // })
      }
      // } else {
      //   // player wait state
      // }
    } else if(window.usePlayEditor) {
      if(currentGameExists) {
        window.loadGame(game)
      } else if(confirm('Press Ok To Load Game, Cancel to Create New')) {
        let id = prompt('Enter game id to load')
        window.socket.emit('setAndLoadCurrentGame', id)
        window.socket.on('onLoadGame', (game) => {
          window.loadGame(game)
        })
      } else {
        let id = prompt('Id for your new game')
        let game = {
          id,
          gameState: JSON.parse(JSON.stringify(window.defaultGameState)),
          world: JSON.parse(JSON.stringify(window.defaultWorld)),
          hero: JSON.parse(JSON.stringify(window.defaultHero)),
          objects: JSON.parse(JSON.stringify(window.defaultObject)),
        }
        window.loadGame(game)
      }
    }
  })
};

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// LOAD GAME
///////////////////////////////
///////////////////////////////
window.loadGame = function(game) {
  window.game = game

  window.changeGame(game.id)
  /// didnt get to init because game.id wasnt set yet
  if(window.customGame) {
    window.customGame.init()
  }

  /// didnt get to init because game.id wasnt set yet
  if(window.liveCustomGame) {
    window.liveCustomGame.init()
  }

  window.grid = game.grid
  window.client.emit('onGridLoaded')

  // objects
  window.objects = game.objects
  if(!window.objectsById) window.objectsById = {}
  window.objects.forEach((object) => {
    window.objectsById[object.id] = object
    physics.addObject(object)
  })

  // world
  window.world = window.mergeDeep(JSON.parse(JSON.stringify(window.defaultWorld)), game.world)

  // grid
  window.grid = game.grid
  window.grid.nodes = grid.generateGridNodes(window.grid)
  grid.updateGridObstacles()
  if(window.host) {
    window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
  }

  handleWorldUpdate(window.world)

  // gameState
  if(game.gameState) window.gameState = game.gameState
  else window.gameState = JSON.parse(JSON.stringify(window.defaultGameState))

  if(!window.gameState.loaded && window.host) {
    /// DEFAULT GAME FX
    if(window.defaultGame) {
      window.defaultGame.loaded()
    }
    /// CUSTOM GAME FX
    if(window.customGame) {
      window.customGame.loaded()
    }

    window.gameState.loaded = true
  }

  window.onGameLoaded()
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// ON GAME LOAD
///////////////////////////////
///////////////////////////////
var then;
window.onGameLoaded = function() {
  window.pageState.gameLoaded = true

  then = Date.now()

  objects.loaded()
  if(window.ghost) ghost.loaded()
  if(window.isPlayer) {
    hero.loaded()
    input.loaded()
  }

  if(window.usePlayEditor) {
    playEditor.loaded()
  } else {
    camera.loaded()
  }

  if(!window.objects || !window.world || !window.grid.nodes || !window.heros || (window.isPlayer && !window.hero)) {
    console.log('game loaded without critical data, aborting')
    return
  }

  // begin main loop
  mainLoop()

  function networkLoop() {
    if(window.host) {
      window.socket.emit('updateObjects', window.objects)
      window.socket.emit('updateGameState', window.gameState)
    }
    if(window.isPlayer) {
      window.socket.emit('updateHeroPos', window.hero)
      localStorage.setItem('hero', JSON.stringify(window.hero));
    }

    let timeout = window.lastDelta * 7
    if(timeout > 250) {
      timeout = 250
    }
    setTimeout(networkLoop, timeout)
  }

  setTimeout(networkLoop, 100)
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// CORE LOOP
///////////////////////////////
///////////////////////////////
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
var mainLoop = function () {
	var now = Date.now();
	var delta = now - then;
  window.fps = 1000 / delta;
  window.lastDelta = delta;
	if(delta > 23) delta = 23

	if(window.usePlayEditor) {
		playEditor.update(delta)
    playEditor.render(ctx, window.hero, window.objects);
  }

	update(delta / 1000);

  if(window.isPlayer) {
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

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// UPDATE GAME OBJECTS AND RENDER
///////////////////////////////
///////////////////////////////
var update = function (delta) {
  if(!window.gameState.paused) {

    if(window.isPlayer) {
      physics.updatePosition(window.hero, delta)
      // non hosts will have to submit some sort of input, but not run the physics or ai sim
      input.update(delta)
    }

    if(window.host) {
      window.objects.forEach((object) => {
        physics.updatePosition(object, delta)
      })

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

window.onPageLoad()
