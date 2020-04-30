import cameraTool from './camera.js'
import collisions from '../utils/collisions.js'
import playEditor from '../playeditor/playeditor.js'
import shadow from '../map/shadow.js'
import grid from '../utils/grid.js'
import sockets from './sockets.js'
import utils from '../utils/utils.js'
import events from './events.js'
import arcade from '../arcade/index'
import testArcade from '../arcade/arcade/platformer'
import gameManager from '../game'
import physics from '../physics/index'
import loop from './loop.js'
import map from '../map/index.js'
import ghost from './ghost'
import constellation from '../map/constellation.js'
import mapEditor from '../mapeditor/index.js'

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

    // Canvas SETUP
    window.canvas = document.createElement("canvas");
    window.ctx = window.canvas.getContext("2d");
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
  window.playerCameraWidth = 640
  window.playerCameraHeight = 320
}

function getHeroId() {
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
  getHeroId()
  if(role.isPlayEditor) {
    playEditor.onPageLoad()
  } else {
    mapEditor.onPageLoad(window.canvas)
    constellation.init(window.ctx)
  }
  if(role.isGhost) {
    ghost.init()
  }
  gameManager.onPageLoad()
  arcade.onPageLoad()
  events.init()
  sockets.init()

  askCurrentGame((game) => {
    window.changeGame(game.id)
    window.loadGame(game)
    window.startGameLoop()
  })
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// ON INITIALIZE
///////////////////////////////
///////////////////////////////
function askCurrentGame(cb) {
  if(role.isArcadeMode) {
    let game = testArcade
    window.hero = window.findHeroInNewGame(game, { id: window.heroId })
    cb(game)
  } else {
    // when you are constantly reloading the page we will constantly need to just ask the server what the truth is
    window.socket.emit('askRestoreCurrentGame')
    window.socket.on('onAskRestoreCurrentGame', async (game) => {
      let currentGameExists = game && game.id
      if(currentGameExists) {
        cb(game)
      } else {
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
              cb(game)
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
              cb(game)
            }
          }
        } else {
          alert('no current game, reload after game has been chosen')
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
window.loadGame = function(game, options) {
  GAME.load(game, options)
  let isFirstLoad = !GAME.gameState.loaded
  GAME.gameState.loaded = true

  // if you are a player and you dont already have a hero from the server ask for one
  if(role.isPlayer && !role.isGhost && !window.hero) {
    window.socket.on('onJoinGame', (hero) => {
      if(hero.id == window.heroId) {
        window.hero = hero
      }
      GAME.loadHeros(game, options)
      window.onGameLoad(isFirstLoad)
    })
    setTimeout(function() { window.socket.emit('askJoinGame', window.heroId) }, 1000)
  } else {
    GAME.loadHeros(game, options)
    if(role.isGhost) ghost.getHero()
    window.onGameLoad(isFirstLoad)
  }
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// ON GAME LOAD
///////////////////////////////
///////////////////////////////
window.onGameLoad = function(isFirstLoad) {
  window.pageState.gameLoaded = true
  if(role.isPlayEditor) {
    playEditor.onGameLoad()
  } else {
    mapEditor.onGameLoad(window.ctx, GAME, camera)
  }

  if(isFirstLoad) {
    /// DEFAULT GAME FX
    if(window.defaultCustomGame) {
      window.defaultCustomGame.onGameLoaded()
    }
    /// CUSTOM GAME FX
    if(window.customGame) {
      window.customGame.onGameLoaded()
    }

    /// CUSTOM GAME FX
    if(window.liveCustomGame) {
      window.liveCustomGame.onGameLoaded()
    }
  }
}

export {
  onPageLoad
}
