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
import customGame from './tools/customGame.js'

//
import 'ace-builds'
import 'ace-builds/webpack-resolver';
// // then the mode, theme & extension
import 'ace-builds/src-noconflict/mode-json';
// import 'ace-builds/src-noconflict/ext-searchbox';

/////////////////////
//GLOBALS
/////////////////////
/////////////////////
window.objectFactory = []
window.heros = {}

window.TOOLS = {
  ADD_OBJECT: 'addObject',
  SIMPLE_EDITOR: 'objectEditor',
  WORLD_EDITOR: 'worldEditor',
  HERO_EDITOR: 'heroEditor',
  PROCEDURAL: 'procedural',
  GAME_MANAGER: 'gameManager',
  CUSTOM_GAME: 'codeEditor',
}

//tool select functionality
let toolSelectEl = document.getElementById("tool-select")
for(var tool in TOOLS) {
  let toolName = TOOLS[tool];
  let toolEl = document.createElement('div')
  toolEl.className = 'button';
  toolEl.innerHTML = toolName
  toolEl.onclick=function() {
    window.onChangeTool(toolName)
  }
  toolSelectEl.appendChild(toolEl)
}

window.onChangeTool = function(toolName) {
  console.log('current tool changed to ' + toolName)
  window.currentTool = toolName
  Array.from(document.getElementsByClassName("tool-feature")).forEach(e => {
    e.className = "tool-feature invisible"
  })
  document.getElementById("tool-"+toolName).className='tool-feature visible'

  // if(toolName === window.TOOLS.WORLD_EDITOR || toolName === window.TOOLS.HERO_EDITOR || toolName === window.TOOLS.SIMPLE_EDITOR || toolName === window.TOOLS.GAME_MANAGER) {
  //   // document.getElementById('game-canvas').style="left: 400px;"
  //   // ctx.canvas.width = window.innerWidth - 400 - 180;
  // } else
  if(toolName === window.TOOLS.CUSTOM_GAME) {
    let width = document.getElementById("editor").getBoundingClientRect().width
    document.getElementById('game-canvas').style=`left: ${width}px`
    ctx.canvas.width = window.innerWidth - width - 180;
  } else {
    document.getElementById('game-canvas').style="left: 400px;"
    ctx.canvas.width = window.innerWidth - 400 - 180;
    // ctx.canvas.width = window.innerWidth;
    // document.getElementById('game-canvas').style="left: 0px;"
  }

  if(toolName === window.TOOLS.ADD_OBJECT) {
    window.editingObject.i = null
    window.editingObject.id = null
    window.objecteditor.live = false
    window.updateObjectEditor()
  }

  let x=document.getElementById("objectjsoneditor");  // Find the elements
  if(toolName === window.TOOLS.ADD_OBJECT || toolName === window.TOOLS.SIMPLE_EDITOR) {
    x.style ='display:block'
  } else {
    x.style ='display:none'
  }
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

  // ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  document.getElementById('game-canvas').style="left: 400px;"
  ctx.canvas.width = window.innerWidth - 400 - 180;

  heroEditor.init()
  objectEditor.init()
  worldEditor.init()
  gameManager.init()
  addObject.init()
  customGame.init()

  window.onChangeTool(window.TOOLS.WORLD_EDITOR)

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

  let maze = procedural.genMaze(w, h, x, y).map((o) => {
    o.tags.stationary = true
    return o
  })
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
  objectEditor.loaded()
  addObject.loaded()
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
