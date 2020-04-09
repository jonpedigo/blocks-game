import JSONEditor from 'jsoneditor'

function init() {
  var gamestateeditor = document.createElement("div")
  gamestateeditor.id = 'gamestateeditor'
  document.getElementById('tool-'+TOOLS.GAME_MANAGER).appendChild(gamestateeditor);
  window.gamestateeditor = new JSONEditor(gamestateeditor, { modes: ['tree', 'code'], search: false, onChangeJSON: (gameState) => {
    emitEditorGameState(gameState)
  }});
  window.gamestateeditor.set(window.gameState)

  var zoomToUniverseButton = document.getElementById("zoom-out-to-universe");
  zoomToUniverseButton.addEventListener('click', () => {
    window.socket.emit('updateHero', { id: window.editingHero.id, animationZoomTarget: window.constellationDistance, animationZoomMultiplier: window.editingHero.zoomMultiplier, endAnimation: false })
  })
  var zoomToWorldButton = document.getElementById("zoom-in-to-world");
  zoomToWorldButton.addEventListener('click', () => {
    window.socket.emit('updateHero', { id: window.editingHero.id, animationZoomTarget: window.editingHero.zoomMultiplier, endAnimation: true, })
  })
  var saveGameButton = document.getElementById("save-game")
  saveGameButton.addEventListener('click', () => {
    window.saveGame()
  })
  var setGameButton = document.getElementById("set-game")
  setGameButton.addEventListener('click', () => {
    window.setGame()
  })
  var resetObjectsButton = document.getElementById("reset-objects");
  resetObjectsButton.addEventListener('click', () => {
    window.resetObjects()
  })

  var resetSpawnAreasAndObjects = document.getElementById("reset-spawn-and-objects");
  resetSpawnAreasAndObjects.addEventListener('click', function(){
    window.resetSpawnAreasAndObjects()
  })

  var resetGameStateButton = document.getElementById("reset-game-state");
  resetGameStateButton.addEventListener('click', () => {
    window.socket.emit('resetGameState')
  })

  var startGameButton = document.getElementById("start-game");
  startGameButton.addEventListener('click', () => {
    window.startGame()
  })


  var pauseResumeGameToggle = document.getElementById("pause-resume-game");
  pauseResumeGameToggle.addEventListener('click', () => {
    emitEditorGameState({ paused: !window.gameState.paused })
  })

  var copyGameToClipBoard = document.getElementById("copy-game-to-clipboard");
  copyGameToClipBoard.addEventListener('click', () => {
    var copyText = JSON.stringify(window.game);
    window.copyToClipBoard(copyText)
  })


  window.syncGameStateToggle = document.getElementById('sync-game-state')

  window.resetObjects = function() {
    window.socket.emit('resetObjects')
  }
  window.saveGame = function() {
    window.game = {
      heros: window.heros,
      objects: window.objects,
      world: window.world,
      grid: window.grid,
      id: document.getElementById('game-id').value,
      compendium: window.compendium,
    }
    window.socket.emit('saveGame', window.game)
  }
  window.setGame = function() {
    window.socket.emit('setGame', document.getElementById('game-id').value)
  }
  window.startGame = function() {
    window.socket.emit('startGame')
  }

  function emitEditorGameState (gameStateUpdate) {
    window.socket.emit('editGameState', {...window.gameState, ...gameStateUpdate})
  }

  window.copyToClipBoard = function(copyText) {
    navigator.permissions.query({name: "clipboard-write"}).then(result => {
      if (result.state == "granted" || result.state == "prompt") {
        /* write to the clipboard now */
        navigator.clipboard.writeText(copyText).then(function() {
          console.log('copied', window.game.id, 'to clipboard')
        }, function() {
          console.log('copy failed')
          /* clipboard write failed */
        });
      }
    });
  }

  function resetDefaults() {
    window.resetObjects()
    window.socket.emit('resetWorld')
    window.socket.emit('updateGrid', window.defaultGrid)
    for(var heroId in window.heros) {
      window.socket.emit('resetHero', window.heros[heroId])
    }
    window.socket.emit('resetGameState')
  }

  document.body.addEventListener('click', function(e) {
    if(!e.target) return
       //when the document body is clicked

    if (e.target.className && e.target.className.indexOf('new-game') != -1) {
     resetDefaults()
     window.socket.emit('setGame', 'default')
    }
    if (e.target.className && e.target.className.indexOf('load-game-purgatory') != -1) {
      resetDefaults()
      window.socket.emit('setGame', 'purgatory')
    }
    if (e.target.className && e.target.className.indexOf('load-game-smasharena') != -1) {
      resetDefaults()
      window.socket.emit('setGame', 'smasharena')
    }
    if (e.target.className && e.target.className.indexOf('load-game-fliparena') != -1) {
      resetDefaults()
      window.socket.emit('setGame', 'fliparena')
    }
    if (e.target.className && e.target.className.indexOf('load-game-adventure') != -1) {
      resetDefaults()
      window.socket.emit('setGame', 'adventure')
    }
    if (e.target.className && e.target.className.indexOf('load-game-platformer') != -1) {
      resetDefaults()
      window.socket.emit('setGame', 'platformer')
    }
  })
}

// client uses this sometimes
window.resetSpawnAreasAndObjects = function() {
  window.objects.forEach((object) => {
    if(object.removed) return
    if(object.tags.spawnZone) {
      object.spawnedIds.forEach((id) => {
        if(!window.objectsById[id]) return
        window.socket.emit('deleteObject', window.objectsById[id])
      })
      object.spawnedIds = []
      object.spawnPool = object.initialSpawnPool
      object.spawnWait = false
    }
  })
}

// client uses this sometimes
window.resetSpawnAreasAndObjects = function() {
  window.objects.forEach((object) => {
    if(object.spawned || (!object.spawnPointX && object.spawnPointX !== 0) || (!object.spawnPointY && object.spawnPointY !== 0) ){
      window.socket.emit('deleteObject', object)
    }
    window.removeObjectState(object)
    window.respawnObject(object)
  })
}

export default {
  init
}
