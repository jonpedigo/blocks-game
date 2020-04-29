import cameraTool from './camera.js'
import collisions from './collisions.js'
import playEditor from './playeditor/playeditor.js'
import mapEditor from './mapeditor/index.js'
import shadow from './shadow.js'
import grid from './grid.js'
import sockets from './sockets.js'
import constellation from './constellation.js'
import utils from './utils.js'
import map from './map/index.js'
import events from './events.js'
import arcade from './arcade/index'
import testArcade from './arcade/arcade/platformer'
import game from './game'

window.w = window;
window.camera = new cameraTool()

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

  if(role.isPlayEditor) {
    playEditor.onPageLoad()
  }
  game.onPageLoad()
  arcade.onPageLoad()
  events.init()
  sockets.init()
  constellation.init(ctx)

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

  if(role.isArcadeMode) {
    let game = testArcade
    w.game = game
    window.hero = window.findHeroInNewGame(game, { id: window.heroId })
    window.loadGame(game)
    window.onGameLoaded()
    startGameLoop()
  } else {

    // GET HERO ID
    if(role.isGhost) {
      window.heroId = 'ghost'
    } if(role.isPlayer) {
      let savedHero = localStorage.getItem('hero');
      if(savedHero && JSON.parse(savedHero).id){
        window.heroId = JSON.parse(savedHero).id
      } else {
        window.heroId = 'hero-'+window.uniqueID()
      }
    }

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
              window.loadGame(game)
              startGameLoop()
            }
          })
          setTimeout(function() { window.socket.emit('askJoinGame', window.heroId) }, 1000)
        } else {
          window.loadGame(game)
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

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// LOAD GAME
///////////////////////////////
///////////////////////////////
window.loadGame = function(game) {
  GAME.load(game)
  window.onGameLoad()
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// ON GAME LOAD
///////////////////////////////
///////////////////////////////
window.onGameLoad = function() {
  window.pageState.gameLoaded = true

  game.onGameLoad()
  if(role.isPlayEditor) {
    playEditor.onGameLoad()
  } else {
    mapEditor.onGameLoad(window.ctx, w.game, camera)
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
      render(deltaRender / 1000)

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

function update(delta) {
  GAME.update(delta)
  if(window.remoteHeroMapEditorState) {
    mapEditor.update(delta, window.remoteHeroMapEditorState)
  } else {
    mapEditor.update(delta)
  }
}

function render(delta) {
  if(role.isPlayEditor) {
    playEditor.update(delta)
    playEditor.render(ctx, window.hero, w.game.objects);
  }

  if(role.isPlayer) {
    map.render(ctx, delta);
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

  if(!window.isPlayEditor) {
    mapEditor.render(ctx, w.game)
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
