import worldModifiers from '../modifiers/worldModifiers.js'
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
  window.worldeditor.set(window.world)
  window.worldeditor.expandAll()

  window.selectorGameToggle = document.getElementById('set-game-boundaries')
  window.selectorCameraToggle = document.getElementById('set-camera')
  window.selectorSpawnToggle = document.getElementById('set-spawn')
  window.selectorProceduralToggle = document.getElementById('set-procedural')

  var cleararea = document.getElementById("clear-area-selected")
  cleararea.addEventListener('click', (e) => {
    if(window.selectorGameToggle.checked) {
      window.socket.emit('updateWorld', { gameBoundaries: {} })
    }
    if(window.selectorCameraToggle.checked) {
      window.socket.emit('updateWorld', { lockCamera: {} })
    }
    if(window.selectorSpawnToggle.checked) {
      window.socket.emit('updateWorld', { worldSpawnPointX: null, worldSpawnPointY: null })
    }
    if(window.selectorProceduralToggle.checked) {
      window.socket.emit('updateWorld', { proceduralBoundaries: {} })
    }
  })

  var setGameBoundaryDefault = document.getElementById("set-game-boundary-default")
  setGameBoundaryDefault.addEventListener('click', (e) => {
    window.socket.emit('updateWorld', { gameBoundaries: { ...window.world.gameBoundaries, behavior: 'default' } })
  })
  var setGameBoundaryAll = document.getElementById("set-game-boundary-all")
  setGameBoundaryAll.addEventListener('click', (e) => {
    window.socket.emit('updateWorld', { gameBoundaries: { ...window.world.gameBoundaries, behavior: 'boundaryAll' } })
  })
  var setGameBoundaryPacmanFlip = document.getElementById("set-pacman-flip")
  setGameBoundaryPacmanFlip.addEventListener('click', (e) => {
    window.socket.emit('updateWorld', { gameBoundaries: { ...window.world.gameBoundaries, behavior: 'pacmanFlip' } })
  })
  var setGameBoundaryPurgatory = document.getElementById("set-purgatory")
  setGameBoundaryPurgatory.addEventListener('click', (e) => {
    window.socket.emit('updateWorld', { gameBoundaries: { ...window.world.gameBoundaries, behavior: 'purgatory' } })
  })

  var setGameToSelected = document.getElementById("match-game-boundary-to-selected")
  setGameToSelected.addEventListener('click', (e) => {
    if(window.selectorCameraToggle.checked) {
      window.socket.emit('updateWorld', { gameBoundaries: window.world.lockCamera })
    }
    if(window.selectorProceduralToggle.checked) {
      window.socket.emit('updateWorld', { gameBoundaries: window.world.proceduralBoundaries })
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
    if(window.selectorGameToggle.checked) {
      window.socket.emit('updateWorld', { gameBoundaries: value })
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
      width: window.grid.width * window.grid.nodeSize,
      height: window.grid.height * window.grid.nodeSize,
      x: window.grid.startX,
      y: window.grid.startY
    }
    if(window.selectorGameToggle.checked) {
      window.socket.emit('updateWorld', { gameBoundaries: value })
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
    const value = window.world.gameBoundaries
    if(window.world.gameBoundaries.x >= 0) {
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
}

export default {
  init
}
