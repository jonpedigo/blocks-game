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
  var newGameButton = document.getElementById("new-game")
  newGameButton.addEventListener('click', () => {
    window.resetObjects()
    window.socket.emit('resetWorld')
    window.socket.emit('updateGrid', { width: 50, height: 50, startX: 0, startY: 0, nodeSize: 40})
    for(var heroId in window.heros) {
      window.socket.emit('resetHero', window.heros[heroId])
    }
    window.socket.emit('resetGameState')
  })
  var resetObjectsButton = document.getElementById("reset-objects");
  resetObjectsButton.addEventListener('click', () => {
    window.resetObjects()
  })

  var resetSpawnAreasAndObjects = document.getElementById("reset-spawn-and-objects");
  resetSpawnAreasAndObjects.addEventListener('click', function(){
    window.resetSpawnAreasAndObjects()
  })

  window.syncGameStateToggle = document.getElementById('sync-game-state')

  window.resetSpawnAreasAndObjects = function() {
    window.objects.forEach((object) => {
      if(object.removed) return
      if(object.tags.spawnZone) {
        object.spawnedIds.forEach((id) => {
          window.socket.emit('deleteObject', window.objectsById[id])
        })
        object.spawnedIds = []
        object.spawnPool = object.initialSpawnPool
      }
    })
  }

  window.resetObjects = function() {
    window.socket.emit('resetObjects')
  }
  window.saveGame = function() {
    window.socket.emit('saveGame', document.getElementById('game-name').value)
  }
  window.setGame = function() {
    window.socket.emit('setGame', document.getElementById('game-name').value)
  }

  function emitEditorGameState (gameState) {
    window.socket.emit('editGameState', gameState)
  }
}

export default {
  init
}
