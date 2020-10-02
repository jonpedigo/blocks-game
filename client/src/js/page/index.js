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

  establishRoleFromQueryOnly() {
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
  }

  establishRoleFromQueryAndHero(hero) {
    if(PAGE.getParameterByName('admin') || hero.flags.isAdmin) {
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
    let gameServerUrl = 'http://ha-game.herokuapp.com'
    if(window.location.hostname.indexOf('localhost') >= 0) {
      gameServerUrl = 'http://localhost:4000'
    }
    window.HAGameServerUrl = gameServerUrl

    let gameClientUrl = 'http://ha-game.herokuapp.com'
    if(window.location.hostname.indexOf('localhost') >= 0) {
      gameClientUrl = 'http://localhost:8080'
    }
    window.HAGameClientUrl = gameClientUrl

    let socialClientUrl = 'http://ha-social.herokuapp.com'
    if(window.location.hostname.indexOf('localhost') >= 0) {
      socialClientUrl = 'http://localhost:3005'
    }
    window.HASocialClientUrl = socialClientUrl

    let socialServerUrl = 'http://ha-social.herokuapp.com'
    if(window.location.hostname.indexOf('localhost') >= 0) {
      socialServerUrl = 'http://localhost:5000'
    }
    window.HASocialServerUrl = socialServerUrl

    let landingUrl = 'http://ha-landing.herokuapp.com'
    if(window.location.hostname.indexOf('localhost') >= 0) {
      landingUrl = 'http://localhost:3000'
    }
    window.HALandingUrl = landingUrl


    if(PAGE.getParameterByName('arcadeMode')) {
      events.establishALocalHost()
      PAGE.establishRoleFromQueryOnly()
      HERO.getHeroId()
      window.local.emit('onUserIdentified')
      window.local.emit('onPlayerIdentified')
      PAGE.askCurrentGame()
    } else {
      const container = document.createElement('div')
      container.id = 'HomemadeArcade'
      document.body.appendChild(container)
      // Mount React App
      ReactDOM.render(
        React.createElement(App),
        container
      )
    }
  }

  async userIdentified() {
    window.local.emit('onUserIdentified')

    const heroOptions = Object.keys(window.heroLibrary)
    if(localStorage.getItem('hero')) heroOptions.unshift('resume')

    const { value: heroLibraryNameIndex } = await Swal.fire({
      title: 'Select your hero',
      showClass: {
        popup: 'animated fadeInDown faster'
      },
      hideClass: {
        popup: 'animated fadeOutUp faster'
      },
      input: 'select',
      inputOptions: heroOptions,
      allowOutsideClick: false,
    })

    const heroSummonType = heroOptions[heroLibraryNameIndex]

    if(document.hasFocus()) {
      PAGE.playerIdentified(heroSummonType)
    } else {
      window.onfocus = () => {
        PAGE.playerIdentified(heroSummonType)
      }
    }
  }

  playerIdentified(heroSummonType) {
    window.onfocus = null
    PAGE.setupRemoteLogging()
    PAGE.establishRoleFromQueryOnly()
    HERO.getHeroId(heroSummonType === 'resume')

    window.onbeforeunload = function (event) {
      if(PAGE.role.isHost && GAME.gameState && GAME.gameState.started) {
        return "Please stop game before leaving page"
      }
    }

    if(PAGE.role.isHost) {
      window.socket.on('onAskJoinGame', (heroId, role, userId) => {
        window.local.emit('onAskJoinGame', heroId, role, userId)
      })
    }

    window.socket.on('onHeroJoinedGame', (hero) => {
      window.local.emit('onHeroJoinedGame', hero)
    })

    window.local.emit('onPlayerIdentified')

    PAGE.askCurrentGame((game) => {
      ARCADE.changeGame(game.id)
      GAME.loadAndJoin(game, heroSummonType)
    })
  }


  loadGameSave(gameSaveId, cb) {
    function handleResponse(response) {
      return response.text().then((text) => {
        const data = text && JSON.parse(text);
        return data;
      });
    }

    const gameSaveRequestOptions = {
     method: "POST",
     mode: 'cors',
     body: JSON.stringify({
       gameSaveId
     }),
     headers: {
       'Content-Type': 'application/json',
       'Access-Control-Allow-Origin': '*',
     }
    };
    fetch(window.HASocialServerUrl + "/api/game/getGameSave/", gameSaveRequestOptions).then(handleResponse).then(res => {
      cb(res)
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
      let gameId = 'ha-prologue'

      if(PAGE.getParameterByName('gameSaveId')) {
        PAGE.loadGameSave(PAGE.getParameterByName('gameSaveId'), (res) => {
          GAME.loadGridWorldObjectsCompendiumState(JSON.parse(res.gameSave))
          GAME.heros = []
          HERO.addHero(HERO.summonFromGameData({ id: HERO.id, heroSummonType: 'singlePlayer' }))
          window.local.emit('onGameLoaded')
        })
        return
      }
      if(PAGE.getParameterByName('gameId')) {
        gameId = PAGE.getParameterByName('gameId')
      }
      if(gameId === 'load') {
        modals.openEditCodeModal('Paste JSON code here', {}, (result) => {
          const game = JSON.parse(result.value)
          GAME.loadGridWorldObjectsCompendiumState(game)
          GAME.heros = []
          HERO.addHero(HERO.summonFromGameData({ id: HERO.id, heroSummonType: 'singlePlayer' }))
          window.local.emit('onGameLoaded')
        })
        return
      }

      const options = {
        params: {
          gameId
        }
      };

      axios.get(window.HAGameServerUrl + '/game', options).then(res => {
        GAME.loadGridWorldObjectsCompendiumState(res.data.game)
        GAME.heros = []
        HERO.addHero(HERO.summonFromGameData({ id: HERO.id, heroSummonType: 'singlePlayer' }))
        window.local.emit('onGameLoaded')
      })
    } else {
      // when you are constantly reloading the page we will constantly need to just ask the server what the truth is
      window.socket.emit('askRestoreCurrentGame')
      window.socket.on('onAskRestoreCurrentGame', async (game) => {
        let currentGameExists = game && game.id
        if(currentGameExists) {
          cb(game)
        } else {
          const response  = await axios.get(window.HAGameServerUrl + '/gamesmetadata')
          const gamesMetadata = response.data.games

          const { value: gamesMetadataIndex } = await Swal.fire({
            title: 'Load Game',
            text: "Select id of game",
            input: 'select',
            inputAttributes: {
              autocapitalize: 'off'
            },
            inputOptions: gamesMetadata.map(({id}) => id),
            showCancelButton: true,
            confirmButtonText: 'Load Game',
            cancelButtonText: 'New Game',
          })
          if(gamesMetadataIndex) {
            const id = gamesMetadata[gamesMetadataIndex].id
            window.socket.on('onLoadGame', (game) => {
              cb(game)
            })
            window.socket.emit('setAndLoadCurrentGame', id)
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
         //  else {
         //   alert('host has not chosen game, become host or reload when game has been chosen')
         // }
        }
      })
    }
  };

  onGameReady() {
    PAGE.isGameReady = true

    PAGE.initializeGameDragAndDrop()
  }

  onGameLoaded() {
    if(!PAGE.loopStarted) {
      window.startGameLoop()
      window.local.emit('onGameLoopStarted')
      PAGE.loopStarted = true
    }
    if(!PAGE.gameLoaded) {
      sockets.init()
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

  initializeGameDragAndDrop() {
    document.body.addEventListener('dragstart', handleDragStart)
    document.body.addEventListener('dragover', (e) => e.preventDefault())

    document.body.addEventListener('drop', handleDrop)
    document.body.draggable=true
    document.body.droppable=true

    let dragSrcEl
    function handleDragStart(e) {
      dragSrcEl = this;

      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.type = 'game'
      e.dataTransfer.setData('text/plain', JSON.stringify(GAME));
    }

    async function handleDrop(e) {
      const draggedGame = JSON.parse(e.dataTransfer.getData('text/plain'))
      if (dragSrcEl !== this && draggedGame.heros) {
        const integrationOptions = [
          'cancel',
          'addNewObjects',
          'mergeAndAddNewObjects',
          'mergeObjects',
          'replace',
        ]
        const { value: integrationStrategyIndex } = await Swal.fire({
          title: 'Choose how to integrate this game',
          showClass: {
            popup: 'animated fadeInDown faster'
          },
          hideClass: {
            popup: 'animated fadeOutUp faster'
          },
          input: 'select',
          inputOptions: integrationOptions
        })

        if(!integrationStrategyIndex || integrationOptions[integrationStrategyIndex] == 'cancel') {
          return
        }

        const integrationChoice = integrationOptions[integrationStrategyIndex]

        e.stopPropagation();

        if(integrationChoice === 'replace') {
          draggedGame.heros[HERO.id] = GAME.heros[HERO.id]
          draggedGame.gameState.started = false
          draggedGame.gameState.loaded = false
          window.socket.emit('setGameJSON', draggedGame)
          return
        }

        if(integrationChoice === 'addNewObjects' || integrationChoice === 'mergeAndAddNewObjects') {
          let adding = []
          draggedGame.objects.forEach((obj) => {
            if(!GAME.objectsById[obj.id]) {
              adding.push(obj)
            }
          })
          window.socket.emit('addObjects', adding)
        }

        if(integrationChoice == 'mergeObjects' || integrationChoice == 'mergeAndAddNewObjects') {
          let editing = []
          draggedGame.objects.forEach((obj) => {
            let currentObj = GAME.objectsById[obj.id]
            if(currentObj) {
              const currentObjProperties = OBJECTS.getProperties(currentObj)
              const newObjProperties = OBJECTS.getProperties(obj)
              if(!_.isEqual(currentObjProperties, newObjProperties)) {
                editing.push(newObjProperties)
              }
            }
          })
          window.socket.emit('editObjects', editing)
        }


        // Object.keys(draggedGame.heros).forEach((id) => {
        //   let hero = draggedGame.heros[id]
        //   delete hero.x
        //   delete hero.y
        //   delete hero.velocityY
        //   delete hero.velocityX
        // })
        //
        // window.mergeDeep(GAME.heros, draggedGame.heros)
        // window.mergeDeep(GAME.world, draggedGame.world)
        // window.mergeDeep(GAME.gameState, draggedGame.gameState)
      }
    }
  }


  publishGame({ name, description, imageUrl }) {
    function handleResponse(response) {
      return response.text().then((text) => {
        const data = text && JSON.parse(text);
        return data;
      });
    }

    const gameSaveRequestOptions = {
     method: "POST",
     mode: 'cors',
     body: JSON.stringify({
       gameSave: JSON.stringify(GAME.cleanForSave(GAME)),
       userData: window.user,
     }),
     headers: {
       'Content-Type': 'application/json',
       'Access-Control-Allow-Origin': '*',
       Authorization: 'Bearer ' + window.getUserCookie()
     }
    };
    fetch(window.HASocialServerUrl + "/api/game/addGameSave", gameSaveRequestOptions).then(handleResponse).then(res => {
      const requestOptions = {
        method: "POST",
        mode: 'cors',
        body: JSON.stringify({
          gameSaveId: res.gameSaveId,
          userData: window.user,
          description: name + ' - ' + description,
          photo: imageUrl,
          tags: JSON.stringify([])
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          Authorization: 'Bearer ' + window.getUserCookie()
        }
      };

      return fetch(window.HASocialServerUrl + "/api/post/addPost/", requestOptions)
        .then(res => {
          window.local.emit('onSendNotification', { playerUIHeroId: HERO.id, toast: true, text: 'Game Published!'})
        });
    })
  }
}

window.PAGE = new Page()
