import JSONEditor from 'jsoneditor'

function init() {
  var gamestateeditor = document.createElement("div")
  gamestateeditor.id = 'gamestateeditor'
  document.getElementById('tool-'+TOOLS.GAME_MANAGER).appendChild(gamestateeditor);
  window.gamestateeditor = new JSONEditor(gamestateeditor, { modes: ['tree', 'code'], search: false, onChangeJSON: (gameState) => {
    emitEditorGameState(gameState)
  }});
  window.gamestateeditor.update(window.defaultGameState)

  var zoomToUniverseButton = document.getElementById("zoom-out-to-universe");
  zoomToUniverseButton.addEventListener('click', () => {
    window.socket.emit('editHero', { id: window.editingHero.id, animationZoomTarget: window.constellationDistance, animationZoomMultiplier: window.editingHero.zoomMultiplier, endAnimation: false })
  })
  var zoomToWorldButton = document.getElementById("zoom-in-to-world");
  zoomToWorldButton.addEventListener('click', () => {
    window.socket.emit('editHero', { id: window.editingHero.id, animationZoomTarget: window.editingHero.zoomMultiplier, endAnimation: true, })
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

  var copyGameToClipBoard = document.getElementById("copy-game-to-clipboard");
  copyGameToClipBoard.addEventListener('click', () => {
    if(window.game.grid && window.game.grid.nodes) delete window.game.grid.nodes
    var copyText = JSON.stringify(window.editingGame);
    window.copyToClipBoard(copyText)
  })

  var copyCompendiumToClipBoard = document.getElementById("copy-compendium-to-clipboard");
  copyCompendiumToClipBoard.addEventListener('click', () => {
    var copyText = JSON.stringify(window.compendium);
    window.copyToClipBoard(copyText)
  })

  var resetAllObjectStateButton = document.getElementById("reset-all-objects-state");
  resetAllObjectStateButton.addEventListener('click', () => {
    window.resetAllObjectState()
  })


  window.syncGameStateToggle = document.getElementById('sync-game-state')

  window.resetObjects = function() {
    window.socket.emit('resetObjects')
  }
  window.saveGame = function() {
    window.game = {
      heros: w.game.heros,
      objects: w.game.objects,
      world: w.game.world,
      grid: w.game.grid,
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
  window.stopGame = function() {
    window.socket.emit('stopGame')
  }

  var pauseResumeGameToggle = document.getElementById("pause-resume-game");
  pauseResumeGameToggle.addEventListener('click', () => {
    emitEditorGameState({ paused: !w.game.gameState.paused })
  })

  var startGameButton = document.getElementById("start-game");
  startGameButton.addEventListener('click', () => {
    window.startGame()
  })

  var stopGameButton = document.getElementById("stop-game");
  stopGameButton.addEventListener('click', () => {
    window.stopGame()
  })

  document.getElementById("branch-edit").addEventListener('click', () => {
    window.branch = JSON.parse(JSON.stringify(window.game))
    window.editingGame = window.branch
  })

  document.getElementById("merge-branch").addEventListener('click', () => {
    window.mergeDeep(window.game, window.branch)
    window.socket.emit('setGameJSON', window.game)
  })

  document.getElementById("reset-to-branch").addEventListener('click', () => {
    window.socket.emit('setGameJSON', window.branch)
  })

  document.getElementById("clear-branch").addEventListener('click', () => {
    window.unloadGame()
    window.branch = null
    window.loadGame(window.game)
  })

  function emitEditorGameState (gameStateUpdate) {
    window.socket.emit('editGameState', {...w.game.gameState, ...gameStateUpdate})
  }

  function resetDefaults() {
    window.resetObjects()
    window.socket.emit('resetWorld')
    window.socket.emit('updateGrid', window.defaultGrid)
    for(var heroId in w.game.heros) {
      window.socket.emit('resetHeroToDefault', w.game.heros[heroId])
    }
    window.socket.emit('resetGameState')
  }

  document.body.addEventListener('click', function(e) {
    if(!e.target) return
       //when the document body is clicked

    if (e.target.className && e.target.className.indexOf('new-game') != -1) {
      window.socket.emit('copyGame', 'default')
    }
    if (e.target.className && e.target.className.indexOf('load-game-purgatory') != -1) {
      window.socket.emit('copyGame', 'purgatory')
    }
    if (e.target.className && e.target.className.indexOf('load-game-smasharena') != -1) {
      window.socket.emit('copyGame', 'smasharena')
    }
    if (e.target.className && e.target.className.indexOf('load-game-fliparena') != -1) {
      window.socket.emit('copyGame', 'fliparena')
    }
    if (e.target.className && e.target.className.indexOf('load-game-adventure') != -1) {
      window.socket.emit('copyGame', 'adventure')
    }
    if (e.target.className && e.target.className.indexOf('load-game-platformer') != -1) {
      window.socket.emit('copyGame', 'platformer')
    }
  })
}


/// TURN THIS INTO HOST EVENT -- ON RESET OBJECT STATE

// client uses this sometimes
window.resetSpawnAreasAndObjects = function() {
  w.game.objects.forEach((object) => {
    if(object.removed) return
    if(object.spawned) {
      window.socket.emit('deleteObject', object)
    }
    if(object.tags.spawnZone) {
      resetSpawnZone(object)
    }
  })
  window.emitEditObjectsOther()
}

function resetSpawnZone(object) {
  object.spawnedIds = []
  object.spawnPool = object.initialSpawnPool
  object.spawnWait = false
}

// client uses this sometimes
window.resetAllObjectState = function() {
  w.game.objects.forEach((object) => {
    if(object.spawned) {
      window.socket.emit('deleteObject', object)
    }
    if(object.tags.spawnZone) {
      resetSpawnZone(object)
    }
    if((!object.spawnPointX && object.spawnPointX !== 0) || (!object.spawnPointY && object.spawnPointY !== 0) ){
      window.socket.emit('deleteObject', object)
    }
    window.removeObjectState(object)
    window.respawnObject(object)
  })
  window.socket.emit('editObjects', w.game.objects)
}

export default {
  init
}
