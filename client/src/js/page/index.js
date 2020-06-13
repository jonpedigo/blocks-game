import Swal from 'sweetalert2';
import sockets from './sockets.js'
import events from './events.js'
import loop from './loop.js'
import modals from '../mapeditor/modals.js'

class Page{
  constructor() {
    this.role = {}

    const gameContainer = document.createElement('div')
    gameContainer.id = 'GameContainer'
    document.body.appendChild(gameContainer)
  }

  establishRoleFromQuery() {
    // ROLE SETUP
    PAGE.role.isHost = false
    PAGE.role.isPlayer = true

    if(PAGE.getParameterByName('playEditor')) {
      PAGE.role.isPlayEditor = true
      PAGE.role.isPlayer = false
    }

    if(PAGE.getParameterByName('host')) {
      PAGE.role.isHost = true
    }

    if(PAGE.getParameterByName('mapEditor')) {
      PAGE.role.isMapEditor = true
    }

    if(PAGE.getParameterByName('arcadeMode')) {
      PAGE.role.isHost = true
      PAGE.role.isArcadeMode = true
      PAGE.role.isPlayer = true
    }

    if(PAGE.getParameterByName('ghost')) {
      PAGE.role.isPlayEditor = false
      PAGE.role.isPlayer = true
      PAGE.role.isGhost = true
    }

    if(PAGE.getParameterByName('admin')) {
      PAGE.role.isAdmin = true
    }
  }

  logRole() {
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

  setupRemoteLogging() {
    // if(PAGE.role.isHost) {
    //   let log = console.log
    //   console.log = function(msg, arg1, arg2, arg3) {
    //     let args = [msg, arg1, arg2, arg3].filter(i => !!i)
    //     window.socket.emit('hostLog', ...args)
    //     log(...args)
    //   }
    //   let error = console.error
    //   console.error = function(msg, arg1, arg2, arg3) {
    //     let args = [msg, arg1, arg2, arg3].filter(i => !!i)
    //     window.socket.emit('hostLog', ...args)
    //     error(...args)
    //   }
    //   window.addEventListener('error', function(e) {
    //     window.socket.emit('hostLog', 'ERROR', e.message
    //           , '\n', e.filename, ':', e.lineno, (e.colno ? ':' + e.colno : '')
    //           , e.error && e.error.stack ? '\n' : '', e.error ? e.error.stack : undefined
    //       );
    //   }, false);
    // }
    PAGE.remoteLog = function(msg, arg1, arg2, arg3) {
      let args = [msg, arg1, arg2, arg3].filter(i => !!i)
      window.socket.emit('hostLog', ...args)
      console.log(...args)
    }
  }

  //////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////
  /////// ON PAGE LOAD
  ///////////////////////////////
  ///////////////////////////////
  load() {
    PAGE.establishRoleFromQuery()
    PAGE.logRole()
    PAGE.setupRemoteLogging()
    HERO.getHeroId()

    events.init()
    sockets.init()
    window.local.emit('onPageLoaded')

    PAGE.askCurrentGame((game) => {
      ARCADE.changeGame(game.id)
      GAME.loadAndJoin(game)
    })
  }

  //////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////
  /////// ON INITIALIZE GAME
  ///////////////////////////////
  ///////////////////////////////
  async askCurrentGame(cb) {
    if(PAGE.role.isArcadeMode) {
      let gameId = 'spencer1'
      if(PAGE.getParameterByName('gameId')) {
        gameId = PAGE.getParameterByName('gameId')
      }
      if(gameId === 'load') {
        modals.openEditCodeModal('Paste JSON code here', {}, (result) => {
          const game = JSON.parse(result.value)
          GAME.loadGridWorldObjectsCompendiumState(game)
          GAME.heros = []
          HERO.addHero(HERO.summonFromGameData({ id: HERO.id }))
          window.local.emit('onGameLoaded')
        })
        return
      }

      window.networkSocket.on('onGetGame', (game) => {
        GAME.loadGridWorldObjectsCompendiumState(game)
        GAME.heros = []
        HERO.addHero(HERO.summonFromGameData({ id: HERO.id }))
        window.local.emit('onGameLoaded')
      })
      window.networkSocket.emit('getGame', gameId)
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
                  world: JSON.parse(JSON.stringify(window.defaultWorld)),
                  // defaultHero: JSON.parse(JSON.stringify(window.defaultHero)),
                  objects: [],
                  grid: JSON.parse(JSON.stringify(window.defaultGrid)),
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

  onGameLoaded() {
    if(!PAGE.loopStarted) {
      window.startGameLoop()
      window.local.emit('onGameLoopStarted')
      PAGE.loopStarted = true
    }
    PAGE.gameLoaded = true
  }

  resetStorage() {
    localStorage.removeItem('hero')
    localStorage.removeItem('ghostData')
    PAGE.role.isPlayer = false
    window.location.reload()
  }

  getParameterByName(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, '\\$&');
      var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  copyToClipBoard(copyText) {
    console.log('trying to copy', copyText)
    navigator.permissions.query({name: "clipboard-write"}).then(result => {
      if (result.state == "granted" || result.state == "prompt") {
        /* write to the clipboard now */
        navigator.clipboard.writeText(copyText).then(function() {
          console.log('copied', GAME.id, 'to clipboard')
        }, function() {
          console.log('copy failed')
          /* clipboard write failed */
        });
      }
    });
  }
}

window.PAGE = new Page()
