import Swal from 'sweetalert2/src/sweetalert2.js';
import sockets from './sockets.js'
import events from './events.js'
import loop from './loop.js'
import modals from '../mapeditor/modals.js'
import React from 'react'
import ReactDOM from 'react-dom'
import App from '../auth/App.jsx'
import axios from 'axios';

class Page{
  constructor() {
    this.role = {}
    this.loadingCount = 0

    const gameContainer = document.createElement('div')
    gameContainer.id = 'GameContainer'
    document.body.appendChild(gameContainer)
  }

  establishRoleFromQuery() {
    // ROLE SETUP
    PAGE.role.isHost = false
    PAGE.role.isPlayer = true
    PAGE.role.isHA = true

    if(PAGE.getParameterByName('playEditor')) {
      PAGE.role.isPlayEditor = true
      PAGE.role.isPlayer = false
    }

    if(PAGE.getParameterByName('host')) {
      PAGE.role.isHost = true
    }

    if(PAGE.getParameterByName('arcadeMode')) {
      PAGE.role.isHost = true
      PAGE.role.isArcadeMode = true
      PAGE.role.isPlayer = true
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
      console.log('player')
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
    const container = document.createElement('div')
    container.id = 'HomemadeArcade'
    document.body.appendChild(container)
    // Mount React App
    ReactDOM.render(
      React.createElement(App),
      container
    )
  }

  userIdentified() {
    if(document.hasFocus()) {
      PAGE.playerIdentified()
    } else {
      window.onfocus = PAGE.playerIdentified
    }
  }

  playerIdentified() {
    window.onfocus = null
    PAGE.establishRoleFromQuery()
    PAGE.logRole()
    PAGE.setupRemoteLogging()
    HERO.getHeroId()

    window.onbeforeunload = function (event) {
      if(PAGE.role.isHost && GAME.gameState && GAME.gameState.started) {
        return "Please stop game before leaving page"
      }
    }

    events.init()
    sockets.init()
    window.local.emit('onPlayerIdentified')

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
          HERO.addHero(HERO.summonFromGameData({ id: HERO.id, heroSummonType: 'default' }))
          window.local.emit('onGameLoaded')
        })
        return
      }

      window.networkSocket.on('onGetGame', (game) => {
        GAME.loadGridWorldObjectsCompendiumState(game)
        GAME.heros = []
        HERO.addHero(HERO.summonFromGameData({ id: HERO.id, heroSummonType: 'default' }))
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
          if(PAGE.role.isAdmin || PAGE.role.isPlayEditor) {
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
            alert('host has not chosen game, become host or reload when game has been chosen')
          }
        }
      })
    }
  };

  onGameReady() {
    PAGE.isGameReady = true
  }

  onGameLoaded() {
    if(!PAGE.loopStarted) {
      window.startGameLoop()
      window.local.emit('onGameLoopStarted')
      PAGE.loopStarted = true
    }
    if(!PAGE.gameLoaded) {
      window.local.emit('onFirstPageGameLoaded')
    }
    PAGE.gameLoaded = true

    if(GAME.world.tags.hasGameLog) {
      PAGE.openLog()
    }
  }

  resetStorage() {
    localStorage.removeItem('hero')
    localStorage.removeItem('ghostData')
    localStorage.removeItem('initialGameState')
    localStorage.removeItem('saveEditingGame')
    localStorage.removeItem('editorPreferences')
    window.clearUserCookie()
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

  onLoadingScreenEnd() {
    PAGE.loadingCount--
    if(PAGE.loadingCount <= 0) {
      PAGE.loadingCount = 0
      PAGE.loadingGame = false
      document.body.style.cursor = 'default'
    }
  }

  onLoadingScreenStart() {
    PAGE.loadingGame = true
    PAGE.loadingCount++
    document.body.style.cursor = 'wait'
  }

  downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  openLog() {
    PAGE.isLogOpen = true
    window.local.emit('onOpenLog')
  }
  closeLog() {
    PAGE.isLogOpen = false
    window.local.emit('onCloseLog')
  }

  showEditorTools() {
    if(PAGE.role.isHA && !PAGE.role.isAdmin && GAME.gameState.started) {
      return false
    }

    return true
  }

  uploadToAws(file, name) {
    const contentType = file.type; // eg. image/jpeg or image/svg+xml

    const generatePutUrl = window.socket.io.uri + '/generate-put-url';
    const options = {
      params: {
        Key: file.name,
        ContentType: contentType
      },
      headers: {
        'Content-Type': contentType,
        // 'Access-Control-Allow-Origin': '*'
      }
    };

    axios.get(generatePutUrl, options).then(res => {
      axios
        .put("https://cors-anywhere.herokuapp.com/" + res.data.url, file, options)
        .then(res => {
          let url = window.awsURL + file.name
          console.log('Upload Successful', url)
          if(!name) name = url
          if(!GAME.library.images) GAME.library.images = {}
          GAME.library.images[name] = {
            name,
            url
          }
          window.local.emit('onSendNotification', { playerUIHeroId: HERO.id, toast: true, text: 'Image saved'})
          window.socket.emit('updateLibrary', { images: GAME.library.images })
        })
        .catch(err => {
          console.log('Sorry, something went wrong')
          console.log('err', err);
        });
    });
  }
}

window.PAGE = new Page()
