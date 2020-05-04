import collisions from '../../utils/collisions'
import gridUtil from '../../utils/grid.js'
import JSONEditor from 'jsoneditor'

function init() {
  var worldjsoneditor = document.createElement("div")
  worldjsoneditor.id = 'worldjsoneditor'
  document.getElementById('tool-'+TOOLS.WORLD_EDITOR).appendChild(worldjsoneditor);
  window.worldeditor = new JSONEditor(worldjsoneditor, { modes: ['tree', 'code'], search: false, onChangeJSON: (world) => {
    // this is what sync should mean. Does every edit send immediately?
    sendWorldUpdate( { globalTags: world.globalTags }, { dontResetEditor: true });
  }});

  window.selectorGameToggle = document.getElementById('set-game-boundaries')
  window.selectorCameraToggle = document.getElementById('set-camera')
  window.selectorSpawnToggle = document.getElementById('set-spawn')
  window.selectorProceduralToggle = document.getElementById('set-procedural')
  window.selectorHeroZoomToggle = document.getElementById('set-hero-zooms')

  var cleararea = document.getElementById("clear-area-selected")
  cleararea.addEventListener('click', (e) => {
    if(window.selectorGameToggle.checked) {
      sendWorldUpdate( { gameBoundaries: null })
    }
    if(window.selectorCameraToggle.checked) {
      sendWorldUpdate( { lockCamera: null })
    }
    if(window.selectorSpawnToggle.checked) {
      sendWorldUpdate( { worldSpawnPointX: null, worldSpawnPointY: null })
    }
    if(window.selectorProceduralToggle.checked) {
      sendWorldUpdate( { proceduralBoundaries: null })
    }
  })

  var setGameBoundaryDefault = document.getElementById("set-game-boundary-default")
  setGameBoundaryDefault.addEventListener('click', (e) => {
    sendWorldUpdate( { gameBoundaries: { ...w.editingGame.world.gameBoundaries, behavior: 'default' } })
  })
  var setGameBoundaryAll = document.getElementById("set-game-boundary-all")
  setGameBoundaryAll.addEventListener('click', (e) => {
    sendWorldUpdate( { gameBoundaries: { ...w.editingGame.world.gameBoundaries, behavior: 'boundaryAll' } })
  })
  var setGameBoundaryPacmanFlip = document.getElementById("set-pacman-flip")
  setGameBoundaryPacmanFlip.addEventListener('click', (e) => {
    sendWorldUpdate( { gameBoundaries: { ...w.editingGame.world.gameBoundaries, behavior: 'pacmanFlip' } })
  })
  var setGameBoundaryPurgatory = document.getElementById("set-purgatory")
  setGameBoundaryPurgatory.addEventListener('click', (e) => {
    sendWorldUpdate( { gameBoundaries: { ...w.editingGame.world.gameBoundaries, behavior: 'purgatory' } })
  })

  var setGameToSelected = document.getElementById("match-game-boundary-to-selected")
  setGameToSelected.addEventListener('click', (e) => {
    if(window.selectorCameraToggle.checked) {
      sendWorldUpdate( { gameBoundaries: {...w.editingGame.world.lockCamera, behavior: w.editingGame.world.gameBoundaries ? w.editingGame.world.gameBoundaries.behavior : 'default' } })
    }
    if(window.selectorProceduralToggle.checked) {
      sendWorldUpdate( { gameBoundaries: {...w.editingGame.world.proceduralBoundaries, behavior: w.editingGame.world.gameBoundaries ? w.editingGame.world.gameBoundaries.behavior : 'default' } })
    }
  })

  var setSelectedToHeroCamera = document.getElementById("set-selected-to-hero-camera");
  setSelectedToHeroCamera.addEventListener('click', function(){
    const value = {
      width: HERO.cameraWidth * window.editingHero.zoomMultiplier,
      height: HERO.cameraHeight * window.editingHero.zoomMultiplier,
      centerX: window.editingHero.x + window.editingHero.width/2,
      centerY: window.editingHero.y + window.editingHero.height/2,
    }
    value.x = value.centerX - value.width/2
    value.y = value.centerY - value.height/2
    value.limitX = Math.abs(value.width/2)
    value.limitY = Math.abs(value.height/2)
    gridUtil.snapObjectToGrid(value)
    value.width = HERO.cameraWidth * window.editingHero.zoomMultiplier
    value.height = HERO.cameraHeight * window.editingHero.zoomMultiplier
    if(window.selectorGameToggle.checked) {
      sendWorldUpdate( { gameBoundaries: {...value, behavior: w.editingGame.world.gameBoundaries ? w.editingGame.world.gameBoundaries.behavior : 'default' }})
    }
    if(window.selectorCameraToggle.checked) {
      sendWorldUpdate( { lockCamera: value })
    }
    if(window.selectorSpawnToggle.checked) {
      sendWorldUpdate( { worldSpawnPointX: value.x, worldSpawnPointY: value.y })
    }
    if(window.selectorProceduralToggle.checked) {
      sendWorldUpdate( { proceduralBoundaries: value })
    }
  })

  var setSelectedToGrid = document.getElementById("set-selected-to-grid");
  setSelectedToGrid.addEventListener('click', function(){
    const value = {
      width: w.editingGame.grid.width * w.editingGame.grid.nodeSize,
      height: w.editingGame.grid.height * w.editingGame.grid.nodeSize,
      x: w.editingGame.grid.startX,
      y: w.editingGame.grid.startY
    }
    if(window.selectorGameToggle.checked) {
      sendWorldUpdate( { gameBoundaries: {...value, behavior: w.editingGame.world.gameBoundaries ? w.editingGame.world.gameBoundaries.behavior : 'default' } })
    }
    if(window.selectorCameraToggle.checked) {
      const { x, y, width, height} = value
      const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      sendWorldUpdate( { lockCamera })
    }
    if(window.selectorSpawnToggle.checked) {
      sendWorldUpdate( { worldSpawnPointX: value.x, worldSpawnPointY: value.y })
    }
    if(window.selectorProceduralToggle.checked) {
      sendWorldUpdate( { proceduralBoundaries: value })
    }
  })

  var setSelectedToGrid = document.getElementById("set-selected-to-grid-minus-1");
  setSelectedToGrid.addEventListener('click', function(){
    const value = {
      width: (w.editingGame.grid.width - 2) * w.editingGame.grid.nodeSize,
      height: (w.editingGame.grid.height - 2) * w.editingGame.grid.nodeSize,
      x: w.editingGame.grid.startX + w.editingGame.grid.nodeSize,
      y: w.editingGame.grid.startY + w.editingGame.grid.nodeSize
    }
    if(window.selectorGameToggle.checked) {
      sendWorldUpdate( { gameBoundaries: {...value, behavior: w.editingGame.world.gameBoundaries ? w.editingGame.world.gameBoundaries.behavior : 'default' } })
    }
    if(window.selectorCameraToggle.checked) {
      const { x, y, width, height} = value
      const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      sendWorldUpdate( { lockCamera })
    }
    if(window.selectorSpawnToggle.checked) {
      sendWorldUpdate( { worldSpawnPointX: value.x, worldSpawnPointY: value.y })
    }
    if(window.selectorProceduralToggle.checked) {
      sendWorldUpdate( { proceduralBoundaries: value })
    }
  })

  var setSelectedToGameBoundary = document.getElementById("set-selected-to-game-boundary");
  setSelectedToGameBoundary.addEventListener('click', function(){
    const value = w.editingGame.world.gameBoundaries
    if(w.editingGame.world.gameBoundaries && w.editingGame.world.gameBoundaries.x >= 0) {
      if(window.selectorCameraToggle.checked) {
        const { x, y, width, height} = value
        const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
        sendWorldUpdate( { lockCamera })
      }
      if(window.selectorSpawnToggle.checked) {
        sendWorldUpdate( { worldSpawnArea: value })
      }
      if(window.selectorProceduralToggle.checked) {
        sendWorldUpdate( { proceduralBoundaries: value })
      }
    }
  })

  var setZoomToSelected = document.getElementById("set-zoom-to-selected");
  setZoomToSelected.addEventListener('click', function(){
    if(window.selectorGameToggle.checked) {
      let zoomMultiplier = w.editingGame.world.gameBoundaries.width/HERO.cameraWidth
      window.sendHeroUpdate({ zoomMultiplier })
    }
    if(window.selectorCameraToggle.checked) {
      let zoomMultiplier = w.editingGame.world.lockCamera.width/HERO.cameraWidth
      window.sendHeroUpdate({ zoomMultiplier })
    }
    if(window.selectorProceduralToggle.checked) {
      let zoomMultiplier = w.editingGame.world.proceduralBoundaries.width/HERO.cameraWidth
      window.sendHeroUpdate({ zoomMultiplier })
    }
  })

  var zoomOutSelected = document.getElementById("zoom-out-selected");
  zoomOutSelected.addEventListener('click', function(){
    if(window.selectorProceduralToggle.checked && w.editingGame.world.proceduralBoundaries) {
      let procedural = w.editingGame.world.proceduralBoundaries
      sendWorldUpdate( { proceduralBoundaries: { ...procedural, width: (procedural.width + (w.editingGame.grid.nodeSize * 2)), height: (procedural.height + (w.editingGame.grid.nodeSize)), x:  procedural.x -  w.editingGame.grid.nodeSize, y: procedural.y  - (w.editingGame.grid.nodeSize/2) } })
    }
    if(selectorCameraToggle.checked) {
      let lockCamera = w.editingGame.world.lockCamera
      lockCamera.x -= w.editingGame.grid.nodeSize
      lockCamera.y -= w.editingGame.grid.nodeSize/2
      lockCamera.width += (w.editingGame.grid.nodeSize * 2)
      lockCamera.height += (w.editingGame.grid.nodeSize)
      lockCamera = { ...lockCamera, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      sendWorldUpdate( { lockCamera })
    }
    if(selectorGameToggle.checked) {
      let game = w.editingGame.world.gameBoundaries
      sendWorldUpdate( { gameBoundaries: { ...game, width: (game.width + (w.editingGame.grid.nodeSize * 2)), height: (game.height + (w.editingGame.grid.nodeSize)), x:  game.x -  w.editingGame.grid.nodeSize, y: game.y  - (w.editingGame.grid.nodeSize/2) } })
    }
    if(window.selectorHeroZoomToggle.checked) {
      Object.keys(w.editingGame.heros).forEach((id) => {
        let hero = w.editingGame.heros[id]
        window.sendHeroUpdate({ id: hero.id, zoomMultiplier: hero.zoomMultiplier + .1250 })
      })
    }
  })

  var zoomInSelected = document.getElementById("zoom-in-selected");
  zoomInSelected.addEventListener('click', function(){
    if(window.selectorProceduralToggle.checked && w.editingGame.world.proceduralBoundaries) {
      let procedural = w.editingGame.world.proceduralBoundaries
      sendWorldUpdate( { proceduralBoundaries: { ...procedural, width: (procedural.width - (w.editingGame.grid.nodeSize * 2)), height: (procedural.height - (w.editingGame.grid.nodeSize)), x:  procedural.x +  w.editingGame.grid.nodeSize, y: procedural.y  + (w.editingGame.grid.nodeSize/2) } })
    }
    if(selectorCameraToggle.checked) {
      let lockCamera = w.editingGame.world.lockCamera
      lockCamera.x -= w.editingGame.grid.nodeSize
      lockCamera.y -= w.editingGame.grid.nodeSize/2
      lockCamera.width += (w.editingGame.grid.nodeSize * 2)
      lockCamera.height += (w.editingGame.grid.nodeSize)
      lockCamera = { ...lockCamera, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      sendWorldUpdate( { lockCamera })
    }
    if(selectorGameToggle.checked) {
      let game = w.editingGame.world.gameBoundaries
      sendWorldUpdate( { gameBoundaries: { ...game, width: (game.width - (w.editingGame.grid.nodeSize * 2)), height: (game.height - (w.editingGame.grid.nodeSize)), x:  game.x +  w.editingGame.grid.nodeSize, y: game.y  + (w.editingGame.grid.nodeSize/2) } })
    }
    if(window.selectorHeroZoomToggle.checked) {
      Object.keys(w.editingGame.heros).forEach((id) => {
        let hero = w.editingGame.heros[id]
        window.sendHeroUpdate({ id: hero.id, zoomMultiplier: hero.zoomMultiplier - .1250 })
      })
    }
  })
}

function sendWorldUpdate(update, options = { dontResetEditor: false }) {
  if(window.editingGame.branch) {
    window.mergeDeep(window.editingGame.world, update)
    if(!options.dontResetEditor) window.worldeditor.update(window.editingGame.world)
  } else {
    window.socket.emit('updateWorld', update)
  }
}
window.sendWorldUpdate = sendWorldUpdate

function loaded () {
  window.worldeditor.update(w.editingGame.world)
  window.worldeditor.expandAll()
}

export default {
  init,
  loaded
}
