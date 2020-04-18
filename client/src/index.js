// ( Force anticipated add )
// branch edit
// reset live branch to editing branch
// merge live branch with editing branch
// save editing branch as default state
// local client events
// interpolation

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
// path 1, path 2, path 3 with conditions
// 'take it easy' tag AKA pathfind less often
// 'dont backtrack' tag where they remember where they went

///////
// EVENTS MISSING -- UNLOAD GAME ( for switching between games, and new games ) or I just need stronger defaults..
// HOST EVENT FOR RESET OBJECT STATE AKA CLEANUP? Delete objects, reset values to their initial state values
// BETTER RELATIONSHIP BETWEEN DEFAULT STATE AND initialize/load
////
// (Snap to grid Toggle)
// — bring velocity to zero for hero
// — speed up hero
// — slow down hero
// — increase speed parameter
// — decrease speed parameter
// — set Zoom to all heros
// add grid to world editor
//
// Follow whatever you are editing
// editor preferences - zoom, editing object, editing hero, current menu, etc..
// I already have world MODIFIERS, those are the worlds I have just created. Make them world modifiers instead of loaded world?
// Switch tools based on actions!
// Make default clicking actions on the canvas universal regardless of tool.
// right click -> edit object
// set editor to recently added object
// only if user has clicked a special action on the right tool bar will the map clicking behavior change

// Take up more horizontal space on the editor because right now the dimensions are just not right!
// TOP BAR

// confirmation on leaving back without saving or copying. HAve copy option

// editor UI needs to prioritize most time sensitive, most common, most SERIOUS/DANGEROUS options

// have the zoom of the editor get set to the gameBoundaries
// a button for 'zoom to where most objects are' THING WOULD BE GREAT

// JUICE IDEAS
/*Trails,
	long trail
	leaving trail ( drops )

Shakes
	Object Shakes
	Camera Shakes

FLASHES

Glow

NEON vibe?

Dust particles

Particles being sucked into the player ( POWER!!! )

Splatter

Engine trail on a car u know what I mean?
*/

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
window.w = window;

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
    window.isPlayer = true
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
  window.game = {}
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

  // window.socket.emit('saveSocket', window.heroId)

  // when you are constantly reloading the page we will constantly need to just ask the server what the truth is
  window.socket.emit('askRestoreCurrentGame')
  window.socket.on('onAskRestoreCurrentGame', (game) => {
    let currentGameExists = game && game.id
    if(currentGameExists) {
      window.changeGame(game.id)
      if(window.ghost) {
        window.loadGameNonHost(game)
        window.onGameLoaded()
        startGameLoop()
      } else if(window.host || window.usePlayEditor) {
        window.loadGame(game)
        window.onGameLoaded()
        startGameLoop()
      } else if(window.isPlayer) {
        window.socket.emit('askJoinGame', window.heroId)
        window.socket.on('onJoinGame', (hero) => {
          if(hero.id == window.heroId) {
            window.hero = hero
            window.loadGameNonHost(game)
            window.onGameLoaded()
            startGameLoop()
          }
        })
      }
    } else {

      // right now I only have something for the play editor to do if there is no current game
      if(window.usePlayEditor) {
        if(confirm('Press Ok To Load Game, Cancel to Create New')) {
          let id = prompt('Enter game id to load')
          window.socket.emit('setAndLoadCurrentGame', id)
          window.socket.on('onLoadGame', (game) => {
            window.changeGame(game.id)
            window.loadGame(game)
            window.onGameLoaded()
            startGameLoop()
          })
        } else {
          let id = prompt('Id for your new game')
          if(!id) return alert('ok aborting')
          let game = {
            id,
            gameState: JSON.parse(JSON.stringify(window.defaultGameState)),
            world: JSON.parse(JSON.stringify(window.defaultWorld)),
            hero: JSON.parse(JSON.stringify(window.defaultHero)),
            objects: [],
            grid: JSON.parse(JSON.stringify(window.defaultGrid)),
            heros: {},
          }
          window.socket.emit('saveGame', game)
          window.changeGame(game.id)
          window.loadGame(game)
          window.onGameLoaded()
          startGameLoop()
        }
      }
    }
  })
};

window.loadGameNonHost = function (game) {
  window.changeGame(game.id)

  // world
  w.game.world = window.mergeDeep(JSON.parse(JSON.stringify(window.defaultWorld)), game.world)
  w.game.grid = game.grid
  window.client.emit('onGridLoaded')
  w.game.objects = game.objects
  w.game.grid.nodes = grid.generateGridNodes(w.game.grid)
  w.game.heros = {}
  window.handleWorldUpdate(w.game.world)
  console.log(w.game.heros)
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// LOAD GAME
///////////////////////////////
///////////////////////////////
window.loadGame = function(game) {
  window.game.grid = game.grid
  window.client.emit('onGridLoaded')

  /// didnt get to init because game.id wasnt set yet
  if(window.customGame) {
    window.customGame.init()
  }

  /// didnt get to init because game.id wasnt set yet
  if(window.liveCustomGame) {
    window.liveCustomGame.init()
  }

  if(game.compendium) window.compendium = game.compendium

  let storedGameState = localStorage.getItem('gameStates')
  if(storedGameState) storedGameState = storedGameState[game.id]
  if(game.world.storeGameState && storedGameState) {
    w.game.objects = storedGameState.objects
    w.game.world = storedGameState.world
    w.game.gameState = storedGameState.gameState
  } else {
    w.game.objects = game.objects
    w.game.world = game.world
    if(game.gameState && game.gameState.loaded) {
      if(!w.game.heros) w.game.heros = {}
      w.game.heros = game.heros
      w.game.gameState = game.gameState
    } else {
      w.game.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
      if(!w.game.heros) w.game.heros = {}
      Object.keys(w.game.heros).forEach((id) => {
        w.game.heros[id] = window.findHeroInNewGame(game, w.game.heros[id])
      })
    }
  }

  Object.keys(w.game.heros).forEach((id) => {
    physics.addObject(w.game.heros[id])
  })

  if(!w.game.objectsById) w.game.objectsById = {}
  w.game.objects.forEach((object) => {
    w.game.objectsById[object.id] = object
    physics.addObject(object)
  })

  // grid
  w.game.grid.nodes = grid.generateGridNodes(w.game.grid)
  grid.updateGridObstacles()
  window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
  handleWorldUpdate(w.game.world)

  if(window.usePlayEditor) {
    window.gamestateeditor.update(w.game.gameState)
  }

  if(!w.game.gameState.loaded) {
    /// DEFAULT GAME FX
    if(window.defaultCustomGame) {
      window.defaultCustomGame.loaded()
    }
    /// CUSTOM GAME FX
    if(window.customGame) {
      window.customGame.loaded()
    }
  }

  w.game.gameState.loaded = true
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
  if(window.usePlayEditor) {
    window.editingGame = window.game
  }

  window.pageState.gameLoaded = true

  then = Date.now()

  objects.loaded()
  if(window.isPlayer) {
    hero.loaded()
    input.loaded()
  }
  if(window.ghost) ghost.loaded()

  if(window.usePlayEditor) {
    playEditor.loaded()
  } else {
    camera.loaded()
  }
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// CORE LOOP
///////////////////////////////
///////////////////////////////
function startGameLoop() {
  if(!w.game.objects || !w.game.world || !w.game.grid || !w.game.heros || (window.isPlayer && !window.hero)) {
    console.log('game loaded without critical data, trying again soon', !w.game.objects, !w.game.world, !w.game.grid, !w.game.heros, (window.isPlayer && !window.hero))
    setTimeout(startGameLoop, 1000)
    return
  }

  // begin main loop
  mainLoop()
  setTimeout(networkLoop, 100)
}

requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
var mainLoop = function () {
	var now = Date.now();
	var delta = now - then;
  window.fps = 1000 / delta;
  window.lastDelta = delta;
	if(delta > 23) delta = 23

  update(delta / 1000);

  renderGame(delta / 1000)

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
  if(window.isPlayer && !window.ghost) {
    // if(!w.game.gameState.paused) {
    //   input.update(delta)
    //   physics.updatePosition(heroCopy, delta)
    //   physics.prepareObjectsAndHerosForCollisionsPhase()
    //   physics.heroCorrection(heroCopy)
    //   physics.containObjectWithinGridBoundaries(heroCopy)
    // }
    if(window.hero) localStorage.setItem('hero', JSON.stringify(window.hero))
    window.socket.emit('sendHeroInput', window.heroKeysDown, window.hero.id)
  }

  if(window.ghost) {
    ghost.update()
  }

  if(window.host) {
    if(!w.game.gameState.paused) {
      Object.keys(w.game.heros).forEach((id) => {
        let hero = w.game.heros[id]
        if(hero.animationZoomTarget) {
          window.heroZoomAnimation(hero)
        }
        if(window.heroInput[id]) input.update(hero, window.heroInput[id], delta)
        physics.updatePosition(hero, delta)
        window.heroInput[id] = {}
      })
      w.game.objects.forEach((object) => {
        physics.updatePosition(object, delta)
      })
      physics.prepareObjectsAndHerosForCollisionsPhase()
      physics.update(delta)
      intelligence.update(w.game.objects, delta)

      /// DEFAULT GAME FX
      if(window.defaultCustomGame) {
        window.defaultCustomGame.update(delta)
      }
      /// CUSTOM GAME FX
      if(window.customGame) {
        window.customGame.update(delta)
      }
      /// CUSTOM GAME FX
      if(window.liveCustomGame) {
        window.liveCustomGame.update(delta)
      }

      if(window.host && window.anticipatedObject) {
        let hero = window.hero
        if(window.usePlayEditor) {
          hero = window.editingHero
        }
        window.anticipateObjectAdd(window.editingHero)
      }

      if(window.host && w.game.world.globalTags.calculatePathCollisions) {
        grid.updateGridObstacles()
        window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
      }
    }
  }
};


function renderGame(delta) {
  if(window.usePlayEditor) {
    playEditor.update(delta)
    playEditor.render(ctx, window.hero, w.game.objects);
  }

  if(window.isPlayer) {
    render.update(ctx, delta);
    /// DEFAULT GAME FX

    if(window.defaultCustomGame) {
      window.defaultCustomGame.render(ctx, delta)
    }

    /// CUSTOM GAME FX
    if(window.customGame) {
      window.customGame.render(ctx, delta)
    }

    /// CUSTOM GAME FX
    if(window.liveCustomGame) {
      window.liveCustomGame.render(ctx, delta)
    }

    if(window.hero.animationZoomMultiplier) {
      constellation.animate()
    }
  }
}

function networkLoop() {
  if(window.host) {
    window.socket.emit('updateObjects', w.game.objects)
    window.socket.emit('updateGameState', w.game.gameState)
    window.socket.emit('updateWorldOnServerOnly', w.game.world)
    window.socket.emit('updateHeros', w.game.heros)
    if(w.game.gameState.started && w.game.world.storeEntireGameState) {
      let storedGameState = localStorage.getItem('gameStates')
      localStorage.setItem('gameStates', JSON.stringify({...JSON.parse(storedGameState), [w.game.id]: {...w.game, grid: {...w.game.grid, nodes: null }}}))
    }
  }
  let timeout = window.lastDelta * 3
  if(timeout > 250) {
    timeout = 250
  }
  setTimeout(networkLoop, timeout)
}

window.onPageLoad()
