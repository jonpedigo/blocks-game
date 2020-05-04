import collisions from '../utils/collisions.js'
import playEditor from '../playeditor/playeditor.js'
import grid from '../utils/grid.js'
import sockets from './sockets.js'
import utils from '../utils/utils.js'
import events from './events.js'
import testArcade from '../arcade/arcade/platformer'
import loop from './loop.js'
import mapEditor from '../mapeditor/index.js'

class Page{
  constructor() {
    this.role = {}
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

  //////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////
  /////// ON PAGE LOAD
  ///////////////////////////////
  ///////////////////////////////
  load() {
    PAGE.establishRoleFromQuery()
    PAGE.logRole()
    HERO.getHeroId()

    events.init()
    sockets.init()
    window.local.emit('onPageLoaded')

    PAGE.askCurrentGame((game) => {
      ARCADE.changeGame(game.id)
      GAME.loadAndJoin(game)
      window.startGameLoop()
    })
  }

  //////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////
  /////// ON INITIALIZE GAME
  ///////////////////////////////
  ///////////////////////////////
  askCurrentGame(cb) {
    if(PAGE.role.isArcadeMode) {
      let game = testArcade
      GAME.heros[HERO.id] = HERO.summonFromGameData({ id: HERO.id })
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
                  world: JSON.parse(JSON.stringify(window.defaultWorld)),
                  hero: JSON.parse(JSON.stringify(window.defaultHero)),
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
