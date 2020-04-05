import JSONEditor from 'jsoneditor'
import collisions from '../collisions'
import gridTool from '../grid.js'
import procedural from './procedural.js'
import heroModifiers from './modifiers/heroModifiers.js'
import worldModifiers from './modifiers/worldModifiers.js'
import objectModifiers from './modifiers/objectModifiers.js'
import camera from './camera.js'
import click from './click.js'
import tags from './tags.js'
import input from './input.js'
import worldEditor from './tools/worldEditor.js'
import objectEditor from './tools/objectEditor.js'
import heroEditor from './tools/heroEditor.js'
import gameManager from './tools/gameManager.js'
import addObject from './tools/addObject.js'

/////////////////////
//GLOBALS
/////////////////////
/////////////////////
window.objectFactory = []
window.heros = {}

window.TOOLS = {
  ADD_OBJECT: 'addObject',
  WORLD_EDITOR: 'worldEditor',
  SIMPLE_EDITOR: 'objectEditor',
  HERO_EDITOR: 'heroEditor',
  PROCEDURAL: 'procedural',
  GAME_MANAGER: 'gameManager',
}
window.currentTool = TOOLS.ADD_OBJECT;
let toolAddObjectEl = document.getElementById("tool-addObject")
//tool select functionality
let toolSelectEl = document.getElementById("tool-select")
for(var tool in TOOLS) {
  let toolName = TOOLS[tool];
  let toolEl = document.createElement('div')
  toolEl.className = 'button';
  toolEl.innerHTML = toolName
  toolEl.onclick=function() {
    console.log('current tool changed to ' + toolName)
    window.currentTool = toolName
    Array.from(document.getElementsByClassName("tool-feature")).forEach(e => {
      e.className = "tool-feature invisible"
    })
    document.getElementById("tool-"+toolName).className='tool-feature visible'
  }
  toolSelectEl.appendChild(toolEl)
}

/////////////////////
//DOM
/////////////////////
/////////////////////
function init(ctx, objects) {
  input.init()
  camera.init()
  click.init()
  tags.init()

  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  heroEditor.init()
  objectEditor.init()
  worldEditor.init()
  gameManager.init()
  addObject.init()

  /////////////////////
  // PROCEDURAL BUTTONS
  /////////////////////
  /////////////////////
  var createMazeButton = document.getElementById("create-maze");
  createMazeButton.onclick = (e) => {
    createMaze()
  }
  var createGridButton = document.getElementById("create-grid");
  createGridButton.onclick = (e) => {
    createGrid()
  }
  var createArenaButton = document.getElementById("create-arena");
  createArenaButton.onclick = (e) => {
    createArena(window.world.proceduralBoundaries)
  }
}

function createGrid() {
  const { width, height } = window.world.proceduralBoundaries
  const { x, y } = gridTool.snapXYToGrid(window.world.proceduralBoundaries.x, window.world.proceduralBoundaries.y);
  let w = Math.floor(width / (window.grid.nodeSize))
  let h = Math.floor(height / (window.grid.nodeSize))
  window.grid.width = w
  window.grid.height = h
  window.grid.startX = x
  window.grid.startY = y
  window.socket.emit('updateGrid', {...window.grid, nodes: null})
  window.grid.nodes = gridTool.generateGridNodes(window.grid)
}

function createMaze() {
  const { width, height } = window.world.proceduralBoundaries
  const { x, y } = gridTool.snapXYToGrid(window.world.proceduralBoundaries.x, window.world.proceduralBoundaries.y);
  let w = Math.floor(width / (window.grid.nodeSize * window.mazeWidthMultiplier)/2)
  let h = Math.floor(height / (window.grid.nodeSize * window.mazeWidthMultiplier)/2)

  let maze = procedural.genMaze(w, h, x, y)
  window.addObjects(maze)
}

function createArena(boundaries) {
  // let boundaries = {x: window.editingHero.x - (window.CONSTANTS.PLAYER_CAMERA_WIDTH * window.editingHero.zoomMultiplier)/2 + window.editingHero.width/2, y: window.editingHero.y - (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * window.editingHero.zoomMultiplier)/2 + window.editingHero.height/2, width: (window.CONSTANTS.PLAYER_CAMERA_WIDTH * window.editingHero.zoomMultiplier), height: (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * window.editingHero.zoomMultiplier)}

  let wallLeft = {
    id: 'wall-l' + Date.now(),
    width: 5,
    height: boundaries.height,
    x: boundaries.x,
    y: boundaries.y,
    color: 'white',
    tags: {'obstacle':true, 'stationary': true},
  }

  let wallTop = {
    id: 'wall-t' + Date.now(),
    width: boundaries.width,
    height: 5,
    x: boundaries.x,
    y: boundaries.y,
    color: 'white',
    tags: {'obstacle':true, 'stationary': true},
  }

  let wallRight = {
    id: 'wall-r' + Date.now(),
    width: 5,
    height: boundaries.height,
    x: boundaries.x + (boundaries.width) - 5,
    y: boundaries.y,
    color: 'white',
    tags: {'obstacle':true, 'stationary': true},
  }

  let wallBottom = {
    id: 'wall-b' + Date.now(),
    width: boundaries.width,
    height: 5,
    x: boundaries.x,
    y: boundaries.y + (boundaries.height) - 5,
    color: 'white',
    tags: {'obstacle':true, 'stationary': true},
  }

  window.addObjects([wallTop, wallRight, wallLeft, wallBottom])
}

function loaded() {
  window.setEditorToAnyHero()
}

function update(delta) {
  input.update(delta)
}

function render(ctx) {
  camera.render(ctx)
}

export default {
  init,
  loaded,
  render,
  update,
}
