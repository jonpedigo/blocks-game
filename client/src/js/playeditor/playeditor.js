import JSONEditor from 'jsoneditor'
import collisions from '../collisions'
import gridTool from '../grid.js'
import procedural from './procedural.js'
import camera from './camera.js'
import click from './click.js'
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
  let toolEl = document.createElement('button')
  toolEl.className = 'button tool-selectors';
  toolEl.innerHTML = toolName
  toolEl.id = toolName + '-selector'
  toolEl.onclick=function() {
    window.onChangeTool(toolName)
  }
  toolSelectEl.appendChild(toolEl)
}

window.onChangeTool = function(toolName) {
  // console.log('current tool changed to ' + toolName)
  Array.from(document.getElementsByClassName("tool-feature")).forEach(e => {
    e.className = "tool-feature invisible"
  })
  Array.from(document.getElementsByClassName("tool-selectors")).forEach(e => {
    e.className = "button  tool-selectors"
  })
  document.getElementById("tool-"+toolName).className='tool-feature visible tool-selectors'
  document.getElementById(toolName + '-selector').className='button selected tool-selectors'

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

  if(window.currentTool && window.currentTool === window.TOOLS.SIMPLE_EDITOR && toolName === window.TOOLS.ADD_OBJECT) {
    let editorState = window.objecteditor.get()
    // if we are switching from a live object to a dead object
    if(editorState.id) {
      if(editorState.compendiumId) delete editorState.compendiumId
      delete editorState.id
      editorState.i = null
      window.removeObjectState(editorState)
      window.objecteditor.saved = true
      window.objecteditor.update(editorState)
      window.updateObjectEditorNotifier()
    }
  }

  let x=document.getElementById("objectjsoneditor");  // Find the elements
  if(toolName === window.TOOLS.ADD_OBJECT || toolName === window.TOOLS.SIMPLE_EDITOR) {
    x.style ='display:block'
  } else {
    x.style ='display:none'
  }

  window.currentTool = toolName
}


/////////////////////
//DOM
/////////////////////
/////////////////////
function onPageLoad() {
  input.init()
  camera.init()
  click.init()

  window.canvas.height = window.innerHeight;
  window.canvas.style="left: 400px;"
  window.canvas.width = window.innerWidth - 400 - 180;

  heroEditor.init()
  objectEditor.init()
  worldEditor.init()
  gameManager.init()
  addObject.init()
  customGame.init()

  window.onChangeTool(window.TOOLS.ADD_OBJECT)

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
    createArena(w.editingGame.world.proceduralBoundaries)
  }
}

function createGrid() {
  let { width, height } = w.editingGame.world.proceduralBoundaries
  const { x, y } = gridTool.snapXYToGrid(w.editingGame.world.proceduralBoundaries.x, w.editingGame.world.proceduralBoundaries.y);
  width = Math.floor(width / (w.editingGame.grid.nodeSize))
  let h = Math.floor(height / (w.editingGame.grid.nodeSize))
  w.editingGame.grid.width = width
  w.editingGame.grid.height = h
  w.editingGame.grid.startX = x
  w.editingGame.grid.startY = y
  window.socket.emit('updateGrid', {...w.editingGame.grid, nodes: null})
  w.editingGame.grid.nodes = gridTool.generateGridNodes(w.editingGame.grid)
}

function createMaze() {
  let { width, height } = w.editingGame.world.proceduralBoundaries
  const { x, y } = gridTool.snapXYToGrid(w.editingGame.world.proceduralBoundaries.x, w.editingGame.world.proceduralBoundaries.y);
  width = Math.floor(width / (w.editingGame.grid.nodeSize * window.mazeWidthMultiplier)/2)
  let h = Math.floor(height / (w.editingGame.grid.nodeSize * window.mazeWidthMultiplier)/2)

  let maze = procedural.genMaze(width, h, x, y).map((o) => {
    o.tags.stationary = true
    return o
  })
  window.addObjects(maze)
}

function createArena(boundaries) {
  // let boundaries = {x: window.editingHero.x - (window.CONSTANTS.PLAYER_CAMERA_WIDTH * window.editingHero.zoomMultiplier)/2 + window.editingHero.width/2, y: window.editingHero.y - (window.playerCameraHeight * window.editingHero.zoomMultiplier)/2 + window.editingHero.height/2, width: (window.CONSTANTS.PLAYER_CAMERA_WIDTH * window.editingHero.zoomMultiplier), height: (window.playerCameraHeight * window.editingHero.zoomMultiplier)}

  let parent = {
    id: 'parent-' + window.uniqueID(),
    width: boundaries.width,
    height: boundaries.height,
    x: boundaries.x,
    y: boundaries.y,
    tags: {obstacle: false, invisible: true},
  }

  let wallLeft = {
    id: 'wall-l-' + window.uniqueID(),
    width: boundaries.thickness,
    height: boundaries.height,
    x: boundaries.x,
    y: boundaries.y,
    tags: {'obstacle':true, 'stationary': true},
    parentId: parent.id,
  }

  let wallTop = {
    id: 'wall-t-' + window.uniqueID(),
    width: boundaries.width,
    height: boundaries.thickness,
    x: boundaries.x,
    y: boundaries.y,
    tags: {'obstacle':true, 'stationary': true},
    parentId: parent.id,
  }

  let wallRight = {
    id: 'wall-r-' + window.uniqueID(),
    width: boundaries.thickness,
    height: boundaries.height,
    x: boundaries.x + (boundaries.width) - boundaries.thickness,
    y: boundaries.y,
    tags: {'obstacle':true, 'stationary': true},
    parentId: parent.id,
  }

  let wallBottom = {
    id: 'wall-b-' + window.uniqueID(),
    width: boundaries.width,
    height: boundaries.thickness,
    x: boundaries.x,
    y: boundaries.y + (boundaries.height) - boundaries.thickness,
    tags: {'obstacle':true, 'stationary': true},
    parentId: parent.id,
  }

  window.addObjects([parent, wallTop, wallRight, wallLeft, wallBottom])
}
window.createArena = createArena

function onGameLoad() {
  window.editingGame = window.game
  // window.setEditorToAnyHero()
  objectEditor.loaded()
  addObject.loaded()
  worldEditor.loaded()
}

function update(delta) {
  input.update(delta)
  if(window.editingGame.branch) {
    w.editingGame.objects.forEach((object) => {
      w.editingGame.objectsById[object.id] = object
    })
  }
  if(!window.editingHero.id) {
    window.setEditorToAnyHero()
  }
}

function render(ctx) {
  camera.render(ctx)
}

export default {
  onPageLoad,
  onGameLoad,
  render,
  update,
}
