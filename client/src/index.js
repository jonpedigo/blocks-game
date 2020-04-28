// ( Force anticipated add )
// local client events
// interpolation

////////////////////////////////////////////////////

// attack button ( like papa bear spears!! )
// set game boundaries to delete objects
// TRUE zelda camera work
// death by jump

// Pathfinding for something larger than one grid node
// Perhaps not PATHFINDING but… targeting.

// satisfying death animations? satisfing death states or idk.. things?

// switch tag fresh to an _fresh ( actually just go through all object state and make sure its consistent, there are others such as !!!target!!!<---( please make _ ) that could be an underscore property )
// lastPowerUpId, velocity? , i gridX, width, etc
//--------
// spencer wants the world to slowly build itself infront of them.... interesintg, npt sure how to do
// Smarter rendering
// INVERT GAME, for example, when you get pacman powers
// planet gravity! Would be cool to have..
// Send player to... x, y ( have them like start to move really fast and possibly pathfind)
// stop player (velocity)
// controlling X or Y scroll. For example. allow X croll, but not Y scroll
// lazy scroll that is not not immediate! Smoother...
// leveling up
// optimize shadow feature, not all vertices!
// striped object!
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
// CENTER ALL OBJECTS ON GRID ( calculate first and last object ( x and y ) and therefore how much room you can spare
// a try catch that if theres an error, the editor asks for a version of the game from like 1 minute ago
// everytime I switch out of a menu, I want the selected radio buttons to be reset to default

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
/*
——
!!!!!!!!!!!!!!
REGARDING PHYSICS, SOMETHING EARLIER ON THE i LIST ( objects ) loose the battle for corrections. They correct for everything else first
just make sure to set something to stationary if its not supposed to be move, or else it will be subject to spawn ( i ) order
*/

import './styles/index.scss'
import './styles/jsoneditor.css'
import chat from './js/chat.js'
import physics from './js/physics.js'
import input from './js/input.js'
import camera from './js/camera.js'
import collisions from './js/collisions.js'
import playEditor from './js/playeditor/playeditor.js'
import mapEditor from './js/mapeditor/index.js'
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
import events from './js/events.js'
import games from './js/games/index'
import ghost from './js/ghost.js'
import testArcade from './js/games/arcade/platformer'
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


  // ROLE SETUP
  window.host = false
  window.isPlayer = true

  if(window.getParameterByName('playEditor')) {
    window.usePlayEditor = true
    window.isPlayer = false
  }

  if(window.getParameterByName('host')) {
    window.host = true
  }

  if(window.getParameterByName('mapEditor')) {
    window.isMapEditor = true
  }

  if(window.getParameterByName('arcadeMode')) {
    window.host = true
    window.arcadeMode = true
    window.isPlayer = true
  }

  if(window.getParameterByName('ghost')) {
    window.usePlayEditor = false
    window.isPlayer = true
    window.ghost = true
  }

  if(!window.usePlayEditor) {
    var editor = document.getElementById("play-editor");
    editor.style = 'display:none';
  }

  if(window.host) {
    if(window.arcadeMode) console.log('host-local')
    else console.log('host')
  } else {
    console.log('non host')
  }

  if(window.usePlayEditor) {
    console.log('editor')
  }
  if(window.isPlayer) {
    if(window.ghost){
      console.log('player-ghost')
    } else console.log('player')
  }


  // EVENT SETUP
  if(window.arcadeMode) {
    window.socket = window.local
  } else if (window.location.origin.indexOf('localhost') > 0) {
    window.socket = io.connect('http://localhost:4000');
  } else {
    window.socket = io.connect();
  }

  // DOM SETUP
  window.canvas = document.createElement("canvas");
  window.ctx = window.canvas.getContext("2d");
  function onResize() {
    window.canvasMultiplier = window.innerWidth/640;
    window.CONSTANTS = {
      PLAYER_CANVAS_WIDTH: 640 * window.canvasMultiplier,
      PLAYER_CANVAS_HEIGHT: 320 * window.canvasMultiplier,
      PLAYER_CAMERA_WIDTH: 640,
      PLAYER_CAMERA_HEIGHT: 320,
    }
    window.canvas.width = window.CONSTANTS.PLAYER_CANVAS_WIDTH;
    window.canvas.height = window.CONSTANTS.PLAYER_CANVAS_HEIGHT;
  }
  if(window.isPlayer) window.addEventListener("resize", onResize);
  onResize()

  window.canvas.id = 'game-canvas'
  document.body.appendChild(window.canvas);

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
  events.init()
  sockets.init()
  gameState.init()
  hero.init()

  if(window.isMapEditor) {
    mapEditor.init(ctx, w.game, camera.get())
  }

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

  if(window.arcadeMode) {
    let game = testArcade
    w.game = game
    window.hero = window.findHeroInNewGame(game, { id: window.heroId })
    window.loadGame(game)
    window.onGameLoaded()
    startGameLoop()
  } else {
    // when you are constantly reloading the page we will constantly need to just ask the server what the truth is
    window.socket.emit('askRestoreCurrentGame')
    window.socket.on('onAskRestoreCurrentGame', async (game) => {
      let currentGameExists = game && game.id
      if(currentGameExists) {
        window.changeGame(game.id)
        if(window.host) {
          // join game locally
          if(window.isPlayer) {
            if(game.heros && game.heros[window.heroId]) {
              window.hero = game.heros[window.heroId]
            } else {
              window.hero = findHeroInNewGame(game, {id: window.heroId})
              window.hero.id = window.heroId
            }
          }
          // set hero reference, since we will be doing local updates on the host
          window.loadGame(game)
          startGameLoop()
        } else if(window.usePlayEditor) {
          window.loadGame(game)
          startGameLoop()
        } else if(window.isPlayer && !window.ghost) {
          window.socket.on('onJoinGame', (hero) => {
            if(hero.id == window.heroId) {
              window.hero = hero
            }
            if(!window.host) {
              window.loadGameNonHost(game)
              startGameLoop()
            }
          })
          setTimeout(function() { window.socket.emit('askJoinGame', window.heroId) }, 1000)
        } else {
          window.loadGameNonHost(game)
          startGameLoop()
        }

      } else {

        // right now I only have something for the play editor to do if there is no current game
        if(window.usePlayEditor) {
          const { value: loadGameId } = await Swal.fire({
            title: 'Load Game',
            text: "Enter id of game",
            input: 'text',
            inputAttributes: {
              autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Load Game',
            cancelButtonText: 'New Game',
          })
          if(loadGameId) {
            window.socket.on('onLoadGame', (game) => {
              window.changeGame(game.id)
              window.loadGame(game)
              startGameLoop()
            })
            window.socket.emit('setAndLoadCurrentGame', loadGameId)
          } else {
            const { value: newGameId } = await Swal.fire({
              title: 'Create Game',
              text: "Enter id you want for new game",
              input: 'text',
              inputAttributes: {
                autocapitalize: 'off'
              },
              showCancelButton: true,
              confirmButtonText: 'Create',
            })
            if(newGameId) {
              let game = {
                id: newGameId,
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
              startGameLoop()
            }
          }
        }
      }
    })
  }
};

window.loadGameNonHost = function (game) {
  window.changeGame(game.id)

  // world
  w.game.world = window.mergeDeep(JSON.parse(JSON.stringify(window.defaultWorld)), game.world)
  w.game.grid = game.grid
  window.local.emit('onGridLoaded')
  w.game.objects = game.objects
  w.game.objectsById = {}
  w.game.objects.forEach((object) => {
    w.game.objectsById[object.id] = object
    physics.addObject(object)
  })
  w.game.gameState = game.gameState
  w.game.grid.nodes = grid.generateGridNodes(w.game.grid)
  w.game.heros = {}
  if(window.isPlayer && !window.ghost) {
    w.game.heros[window.hero.id] = window.hero
    physics.addObject(window.hero)
  }
  window.handleWorldUpdate(w.game.world)
  window.onGameLoaded()
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// LOAD GAME
///////////////////////////////
///////////////////////////////
window.loadGame = function(game) {
  w.game.grid = game.grid
  window.local.emit('onGridLoaded')

  /// didnt get to init because game.id wasnt set yet
  if(window.customGame) {
    window.customGame.init()
  }

  /// didnt get to init because game.id wasnt set yet
  if(window.liveCustomGame) {
    window.liveCustomGame.init()
  }

  if(game.compendium) window.compendium = game.compendium
  window.game.hero = game.hero

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
      if(!w.game.gameState) w.game.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
    } else {
      w.game.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
      // you need to keep the heros from last time in this scenario ( you just loaded A WHOLE NEW GAME)
      // w.game.heros = {}
      if(!w.game.heros) w.game.heros = {}
      Object.keys(w.game.heros).forEach((id) => {
        w.game.heros[id] = window.findHeroInNewGame(game, w.game.heros[id])
        window.addHeroToGame(w.game.heros[id])
      })
    }
  }

  if(window.host && window.isPlayer) {
    // just gotta make sure when we reload all these crazy player bois that the reference for the host hero is reset because it doesnt get reset any other time for the host
    if(w.game.heros[window.hero.id]) {
      window.hero = w.game.heros[window.hero.id]
    } else {
      w.game.heros[window.hero.id] = window.hero
      window.addHeroToGame(window.hero)
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
window.onGameLoaded = function() {
  if(window.usePlayEditor) {
    window.editingGame = window.game
  }
  window.pageState.gameLoaded = true

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
let updateInterval = 1000/60
let renderInterval = 1000/24
let networkInterval = 1000/8
var frameCount = 0;
var fps, startTime, now, deltaRender, deltaNetwork, thenRender, thenNetwork, thenUpdate, deltaUpdate;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
function startGameLoop() {
  if(!w.game.objects || !w.game.world || !w.game.grid || !w.game.heros || (window.isPlayer && !window.hero)) {
    console.log('game loaded without critical data, trying again soon', !w.game.objects, !w.game.world, !w.game.grid, !w.game.heros, (window.isPlayer && !window.hero))
    setTimeout(startGameLoop, 1000)
    return
  }

  startTime = Date.now();
  thenNetwork = startTime;
  thenUpdate = startTime;
  thenRender = startTime;

  // begin main loop
  mainLoop()
}

var mainLoop = function () {
  // Request to do this again ASAP
  requestAnimationFrame(mainLoop);

  // calc elapsed time since last loop
  now = Date.now();
  deltaRender = now - thenRender;
  deltaNetwork = now - thenNetwork;
  deltaUpdate = now - thenUpdate;

  // if enough time has deltaRender, draw the next frame
  if (deltaRender > renderInterval) {
      // Get ready for next frame by setting then=now, but...
      // Also, adjust for gameInterval not being multiple of 16.67
      thenRender = now - (deltaRender % renderInterval);
      renderGame(deltaRender / 1000)

      // TESTING...Report #seconds since start and achieved fps.
      var sinceStart = now - startTime;
      var currentFps = Math.round(1000 / (sinceStart / ++frameCount) * 100) / 100;
      window.fps = currentFps;
      if(frameCount > 10000) {
        frameCount = 0
        startTime = Date.now()
      }
  }

  if (deltaUpdate > updateInterval) {
    if(deltaUpdate > 23) deltaUpdate = 23
    thenUpdate = now - (deltaUpdate % updateInterval);
    update(deltaUpdate / 1000);
  }

  if (window.host && deltaNetwork > networkInterval) {
    thenNetwork = now - (deltaNetwork % networkInterval);
    networkUpdate()
  }
};

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// UPDATE GAME OBJECTS AND RENDER
///////////////////////////////
///////////////////////////////
var update = function (delta) {
  if(window.isPlayer) {
    if(w.game.gameState && !w.game.gameState.paused) {
      if(!window.host) {
        // old interpolation code
        // input.update(window.hero, window.keysDown, delta)
        // Object.keys(w.game.heros).forEach((id) => {
        //   let hero = w.game.heros[id]
        //   physics.updatePosition(hero, delta)
        //   physics.lerpObject(hero, delta)
        // })
        // w.game.objects.forEach((object) => {
        //   physics.updatePosition(object, delta)
        //   physics.lerpObject(object, delta)
        // })
        // physics.prepareObjectsAndHerosForCollisionsPhase()
        // physics.updateCorrections(delta)
      }
    }
    if(window.ghost && window.hero.id === 'ghost') {
      input.update(window.hero, window.keysDown, delta)
    }

    if(!window.ghost){
      localStorage.setItem('hero', JSON.stringify(window.hero))
      // we are locally updating the hero input as host
      if(!window.host && !window.pageState.typingMode) window.socket.emit('sendHeroInput', window.keysDown, window.hero.id)
    }
  }

  if(window.ghost) {
    ghost.update()
  }

  if(window.host) {
    // remove second part when a player can host a multiplayer game
    if(!w.game.gameState.paused && (!window.isPlayer || !window.hero.flags.paused)) {
      // movement
      physics.prepareObjectsAndHerosForMovementPhase()
      Object.keys(w.game.heros).forEach((id) => {
        if(window.hero.flags.paused) return
        let hero = w.game.heros[id]
        if(hero.animationZoomTarget) {
          window.heroZoomAnimation(hero)
        }
        if(window.heroInput[id]) input.update(hero, window.heroInput[id], delta)
        physics.updatePosition(hero, delta)
        // window.heroInput[id] = {}
      })
      w.game.objects.forEach((object) => {
        physics.updatePosition(object, delta)
      })
      intelligence.update(w.game.objects, delta)

      /// physics and corrections
      physics.prepareObjectsAndHerosForCollisionsPhase()
      physics.update(delta)

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
        if(window.isPlayer) window.anticipateObjectAdd(window.hero)
        else if(window.usePlayEditor) window.anticipateObjectAdd(window.editingHero)
      }
    }
  }

  if((window.host || window.usePlayEditor) && w.game.world.globalTags.calculatePathCollisions) {
    grid.updateGridObstacles()
    window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
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

  if(window.isMapEditor) {
    mapEditor.render(ctx, w.game, camera)
  }
}

function networkUpdate() {
  window.socket.emit('updateObjects', w.game.objects)
  window.socket.emit('updateGameState', w.game.gameState)
  window.socket.emit('updateWorldOnServerOnly', w.game.world)
  window.socket.emit('updateHeros', w.game.heros)
  if(w.game.gameState.started && w.game.world.storeEntireGameState) {
    let storedGameState = localStorage.getItem('gameStates')
    localStorage.setItem('gameStates', JSON.stringify({...JSON.parse(storedGameState), [w.game.id]: {...w.game, grid: {...w.game.grid, nodes: null }}}))
  }
  let timeout = window.lastDelta * 3
  if(timeout > 250) {
    timeout = 250
  }
}

window.onPageLoad()
