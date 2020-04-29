import chat from './chat.js'
import physics from './physics'
import input from './input.js'
import camera from './camera.js'
import collisions from './collisions.js'
import playEditor from './playeditor/playeditor.js'
import mapEditor from './mapeditor/index.js'
import shadow from './shadow.js'
import intelligence from './intelligence.js'
import grid from './grid.js'
import feedback from './feedback.js'
import sockets from './sockets.js'
import constellation from './constellation.js'
import pathfinding from './pathfinding.js'
import utils from './utils.js'
import objects from './objects.js'
import hero from './hero.js'
import world from './world.js'
import render from './render.js'
import gameState from './gameState.js'
import events from './events.js'
import arcade from './arcade/index'
import ghost from './ghost.js'
import testArcade from './arcade/arcade/platformer'
import timeouts from './timeouts'
window.w = window;

function establishRoleFromQuery() {
  // ROLE SETUP
  const { getParameterByName } = window
  window.role = {}
  role.isHost = false
  role.isPlayer = true

  if(window.getParameterByName('playEditor')) {
    role.isPlayEditor = true
    role.isPlayer = false
  }

  if(window.getParameterByName('host')) {
    role.isHost = true
  }

  if(window.getParameterByName('mapEditor')) {
    role.isMapEditor = true
  }

  if(window.getParameterByName('arcadeMode')) {
    role.isHost = true
    role.isArcadeMode = true
    role.isPlayer = true
  }

  if(window.getParameterByName('ghost')) {
    role.isPlayEditor = false
    role.isPlayer = true
    role.isGhost = true
  }
}

function logRole() {
  const { role } = window

  if(role.isHost) {
    if(role.isArcadeMode) console.log('host-local')
    else console.log('host')
  } else {
    console.log('non host')
  }

  if(role.isPlayEditor) {
    console.log('editor')
  }
  if(role.isPlayer) {
    if(role.isGhost){
      console.log('player-ghost')
    } else console.log('player')
  }
}

function initializeCanvas() {
  if(!role.isPlayEditor) {
    var editor = document.getElementById("play-editor");
    editor.style = 'display:none';
  }

  // Canvas SETUP
  window.canvas = document.createElement("canvas");
  window.ctx = window.canvas.getContext("2d");
  window.playerCameraWidth = 640
  window.playerCameraHeight = 320

  if(role.isPlayer) {
    function onResize() {
      window.canvasMultiplier = window.innerWidth/640;
      window.playerCanvasWidth = 640 * window.canvasMultiplier
      window.playerCanvasHeight = 320 * window.canvasMultiplier
      window.canvas.width = window.playerCanvasWidth;
      window.canvas.height = window.playerCanvasHeight;
    }
    window.addEventListener("resize", onResize);
    onResize()
  }

  window.canvas.id = 'game-canvas'
  document.body.appendChild(window.canvas);
}


//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// ON PAGE LOAD
///////////////////////////////
///////////////////////////////
function onPageLoad() {
  window.pageState = {
    gameLoaded: false,
    pageLoaded: false,
  }
  establishRoleFromQuery()
  logRole()
  initializeCanvas()
  if(role.isMapEditor) {
    mapEditor.onPageLoad()
  }
  if(role.isPlayEditor) {
    playEditor.onPageLoad()
  }
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

  arcade.onPageLoad()
  objects.init()
  world.init()
	grid.init()
  events.init()
  sockets.init()
  gameState.init()
  hero.init()
  timeouts.init()

  if(role.isGhost) {
    ghost.init()
  }

  if(role.isPlayer){
    feedback.init()
    constellation.init(ctx)
    camera.init()
		input.init()
		chat.init()
	}

  if(role.isArcadeMode) {
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
        if(role.isHost) {
          // join game locally
          if(role.isPlayer) {
            if(game.heros && game.heros[window.heroId]) {
              window.hero = game.heros[window.heroId]
              window.hero.id = window.heroId
            } else {
              window.hero = findHeroInNewGame(game, {id: window.heroId})
              window.hero.id = window.heroId
            }
          }
          // set hero reference, since we will be doing local updates on the host
          window.loadGame(game)
          startGameLoop()
        } else if(role.isPlayEditor) {
          window.loadGame(game)
          startGameLoop()
        } else if(role.isPlayer && !role.isGhost) {
          window.socket.on('onJoinGame', (hero) => {
            if(hero.id == window.heroId) {
              window.hero = hero
            }
            if(!role.isHost) {
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
        if(role.isPlayEditor) {
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
    PHYSICS.addObject(object)
  })
  w.game.gameState = game.gameState
  w.game.grid.nodes = grid.generateGridNodes(w.game.grid)
  w.game.heros = {}
  if(role.isPlayer && !role.isGhost) {
    w.game.heros[window.hero.id] = window.hero
    PHYSICS.addObject(window.hero)
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
        w.game.heros[id].id = id
      })
    }
  }

  if(role.isHost && role.isPlayer) {
    // just gotta make sure when we reload all these crazy player bois that the reference for the host hero is reset because it doesnt get reset any other time for the host
    if(w.game.heros[window.hero.id]) {
      window.hero = w.game.heros[window.hero.id]
    } else {
      w.game.heros[window.hero.id] = window.hero
    }
  }

  Object.keys(w.game.heros).forEach((id) => {
    PHYSICS.addObject(w.game.heros[id])
  })

  if(!w.game.objectsById) w.game.objectsById = {}
  w.game.objects.forEach((object) => {
    w.game.objectsById[object.id] = object
    PHYSICS.addObject(object)
  })

  // grid
  w.game.grid.nodes = grid.generateGridNodes(w.game.grid)
  grid.updateGridObstacles()
  window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
  handleWorldUpdate(w.game.world)

  if(role.isPlayEditor) {
    window.gamestateeditor.update(w.game.gameState)
  }

  /// DEFAULT GAME FX
  if(window.defaultCustomGame) {
    window.defaultCustomGame.onGameLoaded()
  }
  /// CUSTOM GAME FX
  if(window.customGame) {
    window.customGame.onGameLoaded()
  }

  w.game.gameState.loaded = true
  window.onGameLoad()
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// ON GAME LOAD
///////////////////////////////
///////////////////////////////
window.onGameLoad = function() {
  if(role.isPlayEditor) {
    window.editingGame = window.game
  }
  window.pageState.gameLoaded = true

  objects.loaded()
  if(role.isPlayer) {
    hero.loaded()
    input.loaded()
  }
  if(role.isGhost) ghost.loaded()

  if(role.isMapEditor) {
    mapEditor.onGameLoad(window.ctx, w.game, camera.get())
  }
  if(role.isPlayEditor) {
    playEditor.onGameLoad()
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
  if(!w.game.objects || !w.game.world || !w.game.grid || !w.game.heros || (role.isPlayer && !window.hero)) {
    console.log('game loaded without critical data, trying again soon', !w.game.objects, !w.game.world, !w.game.grid, !w.game.heros, (role.isPlayer && !window.hero))
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
      if(frameCount > 10) {
        frameCount = 0
        startTime = Date.now()
      }

      window.fps = currentFps;
  }

  if (deltaUpdate > updateInterval) {
    if(deltaUpdate > 23) deltaUpdate = 23
    thenUpdate = now - (deltaUpdate % updateInterval);
    update(deltaUpdate / 1000);
  }

  if (role.isHost && deltaNetwork > networkInterval) {
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
  w.game.heroList = []
  window.forAllHeros((hero) => {
    w.game.heroList.push(hero)
  })

  if(role.isPlayer) {
    if(w.game.gameState && !w.game.gameState.paused) {
      if(!role.isHost) {
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
    if(role.isGhost) {
      if(window.hero.id === 'ghost') {
        input.update(window.hero, window.keysDown, delta)
      }
    }

    if(role.isMapEditor) {
      if(window.remoteHeroMapEditorState) {
        mapEditor.update(delta, w.game, camera.get(), window.remoteHeroMapEditorState)
      } else {
        mapEditor.update(delta, w.game, camera.get())
      }
    }

    if(!role.isGhost){
      localStorage.setItem('hero', JSON.stringify(window.hero))
      // we are locally updating the hero input as host
      if(!role.isHost && !window.pageState.typingMode) {
        window.socket.emit('sendHeroInput', window.keysDown, window.hero.id)
      }
    }
  }

  if(role.isGhost) {
    ghost.update()
  }

  if(role.isHost) {
    // remove second part when a player can host a multiplayer game
    if(!w.game.gameState.paused && (!role.isPlayer || !window.hero.flags.paused)) {
      timeouts.update(delta)
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
      physics.update(delta)

      if(role.isHost && window.anticipatedObject) {
        let hero = window.hero
        if(role.isPlayEditor) {
          hero = window.editingHero
        }
        if(role.isPlayer) window.anticipateObjectAdd(window.hero)
        else if(role.isPlayEditor) window.anticipateObjectAdd(window.editingHero)
      }
    }
  }

  if((role.isHost || role.isPlayEditor) && w.game.world.globalTags.calculatePathCollisions) {
    grid.updateGridObstacles()
    window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
  }
};


function renderGame(delta) {
  if(role.isPlayEditor) {
    playEditor.update(delta)
    playEditor.render(ctx, window.hero, w.game.objects);
  }



  if(role.isPlayer) {
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

  if(role.isMapEditor) {
    mapEditor.render(ctx, w.game, camera.get())
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

export {
  onPageLoad
}
