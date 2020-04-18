import collisions from '../../collisions'
import gridTool from '../../grid.js'
import JSONEditor from 'jsoneditor'

function init() {
  var worldjsoneditor = document.createElement("div")
  worldjsoneditor.id = 'worldjsoneditor'
  document.getElementById('tool-'+TOOLS.WORLD_EDITOR).appendChild(worldjsoneditor);
  window.worldeditor = new JSONEditor(worldjsoneditor, { modes: ['tree', 'code'], search: false, onChangeJSON: (world) => {
    // this is what sync should mean. Does every edit send immediately?
    window.socket.emit('updateWorld', { globalTags: world.globalTags });
  }});

  window.selectorGameToggle = document.getElementById('set-game-boundaries')
  window.selectorCameraToggle = document.getElementById('set-camera')
  window.selectorSpawnToggle = document.getElementById('set-spawn')
  window.selectorProceduralToggle = document.getElementById('set-procedural')
  window.selectorHeroZoomToggle = document.getElementById('set-hero-zooms')

  var cleararea = document.getElementById("clear-area-selected")
  cleararea.addEventListener('click', (e) => {
    if(window.selectorGameToggle.checked) {
      window.socket.emit('updateWorld', { gameBoundaries: null })
    }
    if(window.selectorCameraToggle.checked) {
      window.socket.emit('updateWorld', { lockCamera: null })
    }
    if(window.selectorSpawnToggle.checked) {
      window.socket.emit('updateWorld', { worldSpawnPointX: null, worldSpawnPointY: null })
    }
    if(window.selectorProceduralToggle.checked) {
      window.socket.emit('updateWorld', { proceduralBoundaries: null })
    }
  })

  var setGameBoundaryDefault = document.getElementById("set-game-boundary-default")
  setGameBoundaryDefault.addEventListener('click', (e) => {
    window.socket.emit('updateWorld', { gameBoundaries: { ...w.game.world.gameBoundaries, behavior: 'default' } })
  })
  var setGameBoundaryAll = document.getElementById("set-game-boundary-all")
  setGameBoundaryAll.addEventListener('click', (e) => {
    window.socket.emit('updateWorld', { gameBoundaries: { ...w.game.world.gameBoundaries, behavior: 'boundaryAll' } })
  })
  var setGameBoundaryPacmanFlip = document.getElementById("set-pacman-flip")
  setGameBoundaryPacmanFlip.addEventListener('click', (e) => {
    window.socket.emit('updateWorld', { gameBoundaries: { ...w.game.world.gameBoundaries, behavior: 'pacmanFlip' } })
  })
  var setGameBoundaryPurgatory = document.getElementById("set-purgatory")
  setGameBoundaryPurgatory.addEventListener('click', (e) => {
    window.socket.emit('updateWorld', { gameBoundaries: { ...w.game.world.gameBoundaries, behavior: 'purgatory' } })
  })

  var setGameToSelected = document.getElementById("match-game-boundary-to-selected")
  setGameToSelected.addEventListener('click', (e) => {
    if(window.selectorCameraToggle.checked) {
      window.socket.emit('updateWorld', { gameBoundaries: {...w.game.world.lockCamera, behavior: w.game.world.gameBoundaries ? w.game.world.gameBoundaries.behavior : 'default' } })
    }
    if(window.selectorProceduralToggle.checked) {
      window.socket.emit('updateWorld', { gameBoundaries: {...w.game.world.proceduralBoundaries, behavior: w.game.world.gameBoundaries ? w.game.world.gameBoundaries.behavior : 'default' } })
    }
  })

  var setSelectedToHeroCamera = document.getElementById("set-selected-to-hero-camera");
  setSelectedToHeroCamera.addEventListener('click', function(){
    const value = {
      width: window.CONSTANTS.PLAYER_CAMERA_WIDTH * window.editingHero.zoomMultiplier,
      height: window.CONSTANTS.PLAYER_CAMERA_HEIGHT * window.editingHero.zoomMultiplier,
      centerX: window.editingHero.x + window.editingHero.width/2,
      centerY: window.editingHero.y + window.editingHero.height/2,
    }
    value.x = value.centerX - value.width/2
    value.y = value.centerY - value.height/2
    value.limitX = Math.abs(value.width/2)
    value.limitY = Math.abs(value.height/2)
    gridTool.snapObjectToGrid(value)
    value.width = window.CONSTANTS.PLAYER_CAMERA_WIDTH * window.editingHero.zoomMultiplier
    value.height = window.CONSTANTS.PLAYER_CAMERA_HEIGHT * window.editingHero.zoomMultiplier
    if(window.selectorGameToggle.checked) {
      window.socket.emit('updateWorld', { gameBoundaries: {...value, behavior: w.game.world.gameBoundaries ? w.game.world.gameBoundaries.behavior : 'default' }})
    }
    if(window.selectorCameraToggle.checked) {
      window.socket.emit('updateWorld', { lockCamera: value })
    }
    if(window.selectorSpawnToggle.checked) {
      window.socket.emit('updateWorld', { worldSpawnPointX: value.x, worldSpawnPointY: value.y })
    }
    if(window.selectorProceduralToggle.checked) {
      window.socket.emit('updateWorld', { proceduralBoundaries: value })
    }
  })

  var setSelectedToGrid = document.getElementById("set-selected-to-grid");
  setSelectedToGrid.addEventListener('click', function(){
    const value = {
      width: w.game.grid.width * w.game.grid.nodeSize,
      height: w.game.grid.height * w.game.grid.nodeSize,
      x: w.game.grid.startX,
      y: w.game.grid.startY
    }
    if(window.selectorGameToggle.checked) {
      window.socket.emit('updateWorld', { gameBoundaries: {...value, behavior: w.game.world.gameBoundaries ? w.game.world.gameBoundaries.behavior : 'default' } })
    }
    if(window.selectorCameraToggle.checked) {
      const { x, y, width, height} = value
      const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      window.socket.emit('updateWorld', { lockCamera })
    }
    if(window.selectorSpawnToggle.checked) {
      window.socket.emit('updateWorld', { worldSpawnPointX: value.x, worldSpawnPointY: value.y })
    }
    if(window.selectorProceduralToggle.checked) {
      window.socket.emit('updateWorld', { proceduralBoundaries: value })
    }
  })

  var setSelectedToGrid = document.getElementById("set-selected-to-grid-minus-1");
  setSelectedToGrid.addEventListener('click', function(){
    const value = {
      width: (w.game.grid.width - 2) * w.game.grid.nodeSize,
      height: (w.game.grid.height - 2) * w.game.grid.nodeSize,
      x: w.game.grid.startX + w.game.grid.nodeSize,
      y: w.game.grid.startY + w.game.grid.nodeSize
    }
    if(window.selectorGameToggle.checked) {
      window.socket.emit('updateWorld', { gameBoundaries: {...value, behavior: w.game.world.gameBoundaries ? w.game.world.gameBoundaries.behavior : 'default' } })
    }
    if(window.selectorCameraToggle.checked) {
      const { x, y, width, height} = value
      const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      window.socket.emit('updateWorld', { lockCamera })
    }
    if(window.selectorSpawnToggle.checked) {
      window.socket.emit('updateWorld', { worldSpawnPointX: value.x, worldSpawnPointY: value.y })
    }
    if(window.selectorProceduralToggle.checked) {
      window.socket.emit('updateWorld', { proceduralBoundaries: value })
    }
  })

  var setSelectedToGameBoundary = document.getElementById("set-selected-to-game-boundary");
  setSelectedToGameBoundary.addEventListener('click', function(){
    const value = w.game.world.gameBoundaries
    if(w.game.world.gameBoundaries && w.game.world.gameBoundaries.x >= 0) {
      if(window.selectorCameraToggle.checked) {
        const { x, y, width, height} = value
        const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
        window.socket.emit('updateWorld', { lockCamera })
      }
      if(window.selectorSpawnToggle.checked) {
        window.socket.emit('updateWorld', { worldSpawnArea: value })
      }
      if(window.selectorProceduralToggle.checked) {
        window.socket.emit('updateWorld', { proceduralBoundaries: value })
      }
    }
  })

  var setZoomToSelected = document.getElementById("set-zoom-to-selected");
  setZoomToSelected.addEventListener('click', function(){
    if(window.selectorGameToggle.checked) {
      let zoomMultiplier = w.game.world.gameBoundaries.width/window.CONSTANTS.PLAYER_CAMERA_WIDTH
      window.sendHeroUpdate({ zoomMultiplier })
    }
    if(window.selectorCameraToggle.checked) {
      let zoomMultiplier = w.game.world.lockCamera.width/window.CONSTANTS.PLAYER_CAMERA_WIDTH
      window.sendHeroUpdate({ zoomMultiplier })
    }
    if(window.selectorProceduralToggle.checked) {
      let zoomMultiplier = w.game.world.proceduralBoundaries.width/window.CONSTANTS.PLAYER_CAMERA_WIDTH
      window.sendHeroUpdate({ zoomMultiplier })
    }
  })

  var zoomOutSelected = document.getElementById("zoom-out-selected");
  zoomOutSelected.addEventListener('click', function(){
    if(window.selectorProceduralToggle.checked && w.game.world.proceduralBoundaries) {
      let procedural = w.game.world.proceduralBoundaries
      window.socket.emit('updateWorld', { proceduralBoundaries: { ...procedural, width: (procedural.width + (w.game.grid.nodeSize * 2)), height: (procedural.height + (w.game.grid.nodeSize)), x:  procedural.x -  w.game.grid.nodeSize, y: procedural.y  - (w.game.grid.nodeSize/2) } })
    }
    if(selectorCameraToggle.checked) {
      let lockCamera = w.game.world.lockCamera
      lockCamera.x -= w.game.grid.nodeSize
      lockCamera.y -= w.game.grid.nodeSize/2
      lockCamera.width += (w.game.grid.nodeSize * 2)
      lockCamera.height += (w.game.grid.nodeSize)
      lockCamera = { ...lockCamera, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      window.socket.emit('updateWorld', { lockCamera })
    }
    if(selectorGameToggle.checked) {
      let game = w.game.world.gameBoundaries
      window.socket.emit('updateWorld', { gameBoundaries: { ...game, width: (game.width + (w.game.grid.nodeSize * 2)), height: (game.height + (w.game.grid.nodeSize)), x:  game.x -  w.game.grid.nodeSize, y: game.y  - (w.game.grid.nodeSize/2) } })
    }
    if(window.selectorHeroZoomToggle.checked) {
      Object.keys(w.game.heros).forEach((id) => {
        let hero = w.game.heros[id]
        window.socket.emit('editHero', { id: hero.id, zoomMultiplier: hero.zoomMultiplier + .1250 })
      })
    }
  })

  var zoomInSelected = document.getElementById("zoom-in-selected");
  zoomInSelected.addEventListener('click', function(){
    if(window.selectorProceduralToggle.checked && w.game.world.proceduralBoundaries) {
      let procedural = w.game.world.proceduralBoundaries
      window.socket.emit('updateWorld', { proceduralBoundaries: { ...procedural, width: (procedural.width - (w.game.grid.nodeSize * 2)), height: (procedural.height - (w.game.grid.nodeSize)), x:  procedural.x +  w.game.grid.nodeSize, y: procedural.y  + (w.game.grid.nodeSize/2) } })
    }
    if(selectorCameraToggle.checked) {
      let lockCamera = w.game.world.lockCamera
      lockCamera.x -= w.game.grid.nodeSize
      lockCamera.y -= w.game.grid.nodeSize/2
      lockCamera.width += (w.game.grid.nodeSize * 2)
      lockCamera.height += (w.game.grid.nodeSize)
      lockCamera = { ...lockCamera, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      window.socket.emit('updateWorld', { lockCamera })
    }
    if(selectorGameToggle.checked) {
      let game = w.game.world.gameBoundaries
      window.socket.emit('updateWorld', { gameBoundaries: { ...game, width: (game.width - (w.game.grid.nodeSize * 2)), height: (game.height - (w.game.grid.nodeSize)), x:  game.x +  w.game.grid.nodeSize, y: game.y  + (w.game.grid.nodeSize/2) } })
    }
    if(window.selectorHeroZoomToggle.checked) {
      Object.keys(w.game.heros).forEach((id) => {
        let hero = w.game.heros[id]
        window.socket.emit('editHero', { id: hero.id, zoomMultiplier: hero.zoomMultiplier - .1250 })
      })
    }
  })
}

function loaded () {
  window.worldeditor.update(w.game.world)
  window.worldeditor.expandAll()
}

export default {
  init,
  loaded
}
