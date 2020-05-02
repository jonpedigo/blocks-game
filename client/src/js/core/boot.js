import collisions from '../utils/collisions.js'
import playEditor from '../playeditor/playeditor.js'
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
import mapEditor from '../mapeditor/index.js'

function establishRoleFromQuery() {
  // ROLE SETUP
  const { getParameterByName } = window
  PAGE.role = {}
  PAGE.role.isHost = false
  PAGE.role.isPlayer = true

  if(window.getParameterByName('playEditor')) {
    PAGE.role.isPlayEditor = true
    PAGE.role.isPlayer = false
  }

  if(window.getParameterByName('host')) {
    PAGE.role.isHost = true
  }

  if(window.getParameterByName('mapEditor')) {
    PAGE.role.isMapEditor = true
  }

  if(window.getParameterByName('arcadeMode')) {
    PAGE.role.isHost = true
    PAGE.role.isArcadeMode = true
    PAGE.role.isPlayer = true
  }

  if(window.getParameterByName('ghost')) {
    PAGE.role.isPlayEditor = false
    PAGE.role.isPlayer = true
    PAGE.role.isGhost = true
  }
}

function logRole() {
  if(PAGE.role.isHost) {
    if(PAGE.role.isArcadeMode) console.log('host-local')
    else console.log('host')
  } else {
    console.log('non host')
  }

  if(PAGE.role.isPlayEditor) {
    console.log('editor')
  }
  if(PAGE.role.isPlayer) {
    if(PAGE.role.isGhost){
      console.log('player-ghost')
    } else console.log('player')
  }
}

function getHeroId() {
  // GET HERO.hero ID
  if(PAGE.role.isGhost) {
    HERO.id = 'ghost'
  } if(PAGE.role.isPlayer) {
    let savedHero = localStorage.getItem('hero');
    if(savedHero && JSON.parse(savedHero).id){
      HERO.id = JSON.parse(savedHero).id
    } else {
      HERO.id = 'hero-'+window.uniqueID()
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
  window.PAGE = {
    gameLoaded: false,
  }
  establishRoleFromQuery()
  logRole()
  getHeroId()
  if(PAGE.role.isPlayEditor) {
    playEditor.onPageLoad()
  } else {
    map.onPageLoad()
    mapEditor.onPageLoad(MAP.canvas)
  }

  if(PAGE.role.isGhost) {
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
  if(PAGE.role.isArcadeMode) {
    let game = testArcade
    HERO.hero = window.findHeroInNewGame({ id: HERO.id })
    cb(game)
  } else {
    // when you are constantly reloading the page we will constantly need to just ask the server what the truth is
    window.socket.emit('askRestoreCurrentGame')
    window.socket.on('onAskRestoreCurrentGame', async (game) => {
      let currentGameExists = game && game.id
      if(currentGameExists) {
        cb(game)
      } else {
        if(PAGE.role.isPlayEditor) {
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
  if(PAGE.role.isPlayer && !PAGE.role.isGhost && !HERO.hero) {
    window.socket.on('onJoinGame', (hero) => {
      if(hero.id == HERO.id) {
        HERO.hero = hero
      }
      GAME.loadHeros(game, options)
      window.onGameLoad(isFirstLoad)
    })
    setTimeout(function() { window.socket.emit('askJoinGame', HERO.id) }, 1000)
  } else {
    GAME.loadHeros(game, options)
    if(PAGE.role.isGhost) ghost.getHero()
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
  PAGE.gameLoaded = true
  if(PAGE.role.isPlayEditor) {
    playEditor.onGameLoad()
  } else {
    mapEditor.onGameLoad(MAP.ctx, GAME, MAP.camera)
  }

  if(isFirstLoad) {
    /// DEFAULT GAME FX
    if(GAME.defaultCustomGame) {
      GAME.defaultCustomGame.onGameLoaded()
    }
    /// CUSTOM GAME FX
    if(GAME.customGame) {
      GAME.customGame.onGameLoaded()
    }

    /// CUSTOM GAME FX
    if(GAME.liveCustomGame) {
      GAME.liveCustomGame.onGameLoaded()
    }
  }
}

export {
  onPageLoad
}
