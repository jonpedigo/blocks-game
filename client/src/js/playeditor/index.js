import JSONEditor from 'jsoneditor'
import collisions from '../collisions'
import gridTool from '../grid.js'
import procedural from './procedural.js'
import modifiers from './modifiers.js'
import camera from './camera.js'
import input from './input.js'

/////////////////////
//GLOBALS
/////////////////////
/////////////////////
window.camera = {
  x: 0,
  y: 0,
}
window.clickStart = {
  x: null,
  y: null,
}
window.mousePos = {
  x: null,
  y: null,
}
window.TOOLS = {
  ADD_OBJECT: 'addObject',
  AREA_SELECTOR: 'areaSelector',
  SIMPLE_EDITOR: 'simpleEditor',
  HERO_EDITOR: 'heroEditor',
  GAME_FEEL: 'gameFeel',
  PROCEDURAL: 'procedural',
}
window.currentTool = TOOLS.ADD_OBJECT;
window.scaleMultiplier = .3
window.objectFactory = []
window.simpleeditor = null
window.heroeditor = null
window.tags = {
  obstacle: true,
  monster: false,
  coin: false,
  powerup: false,
  once: false,
  deleteAfterPowerup: false,
}
window.editingObject = {
  i: null,
  id: null,
}
window.heros = {}
window.editingHero = {
  id: null,
}

/////////////////////
//TOOL CLICKING
/////////////////////
/////////////////////
function defaultFirstClick(e) {
  window.clickStart.x = (e.offsetX + window.camera.x)
  window.clickStart.y = (e.offsetY + window.camera.y)
}
const tools = {
  [TOOLS.HERO_EDITOR]: {
    onFirstClick: (e) => {
      const click = {
        x: (e.offsetX + window.camera.x)/window.scaleMultiplier,
        y: (e.offsetY + window.camera.y)/window.scaleMultiplier,
        width: 1,
        height: 1,
      }

      Object.keys(window.heros).map((key) => window.heros[key])
      .forEach((hero, i) => {
        collisions.checkObject(click, hero, () => {
          window.editingHero = hero
          heroeditor.update(window.heros[window.editingHero.id])
          heroeditor.expandAll()
        })
      })
    }
  },
  [TOOLS.SIMPLE_EDITOR]: {
    onFirstClick: (e) => {
      const click = {
        x: (e.offsetX + window.camera.x)/window.scaleMultiplier,
        y: (e.offsetY + window.camera.y)/window.scaleMultiplier,
        width: 1,
        height: 1,
      }

      window.objects
      .forEach((object, i) => {
        collisions.checkObject(click, object, () => {
          simpleeditor.set(Object.assign({}, object))
          simpleeditor.expandAll()
          window.editingObject = {
            i,
            id: object.id,
          }
        })
      })
    }
  },
  [TOOLS.EDITOR]: {
    onFirstClick: (e) => {
      const click = {
        x: (e.offsetX + window.camera.x)/window.scaleMultiplier,
        y: (e.offsetY + window.camera.y)/window.scaleMultiplier,
        width: 1,
        height: 1,
      }

      editor.get()
      .world
      // .sort((a, b) => 0.5 - Math.random())
      .forEach((object, i) => {
        collisions.checkObject(click, object, () => {
          const path = { path: ["world", i] }
          editor.setSelection(path)
          const selectionScrollHeight = editor.multiselection.nodes[0].dom.value.scrollHeight

          //get dom node from editor (DAMN YOU EDITOR!!)
          const domNode = editor.multiselection.nodes[0].dom.value

          //find offset
          editor.scrollableContent.scrollTop = 0
          const bodyRect = document.body.getBoundingClientRect()
          const elemRect = domNode.getBoundingClientRect()
          const offset = elemRect.top - bodyRect.top

          //scroll to offset
          editor.scrollTo(offset)
        })
      })
    }
  },
  [TOOLS.AREA_SELECTOR]: {
    onFirstClick: function(e){
      if(selectorSpawnToggle.checked) {
        const click = {
          x: (e.offsetX + window.camera.x)/window.scaleMultiplier,
          y: (e.offsetY + window.camera.y)/window.scaleMultiplier,
        }

        window.updateHero({id: window.editingHero.id, spawnPointX: click.x, spawnPointY: click.y})
      } else {
        defaultFirstClick(e)
      }
    },
    onSecondClick: (e) => {
      //translate
      const value = {
        width: (e.offsetX - window.clickStart.x + window.camera.x)/window.scaleMultiplier,
        height: (e.offsetY - window.clickStart.y + window.camera.y)/window.scaleMultiplier,
        x: window.clickStart.x/window.scaleMultiplier,
        y: window.clickStart.y/window.scaleMultiplier,
      }

      const {x, y, width, height} = value;
      if(window.currentTool === TOOLS.PROCEDURAL) {
        const proceduralBoundaries = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
        window.socket.emit('updatePreferences', { proceduralBoundaries })
      } else if(selectorCameraToggle.checked) {
        const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
        window.socket.emit('updatePreferences', { lockCamera })
      } else if(selectorGameToggle.checked) {
        const gameBoundaries = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
        window.socket.emit('updatePreferences', { gameBoundaries })
      }
    },
  },
  [TOOLS.ADD_OBJECT] : {
    onFirstClick: (e) => {
      if(instantGridAddToggle.checked) {
        const click = {
          x: (e.offsetX + window.camera.x)/window.scaleMultiplier,
          y: (e.offsetY + window.camera.y)/window.scaleMultiplier,
        }
        let object = gridTool.createGridNodeAt(click.x, click.y)
        object.tags = {}
        object.id = 'object' + Date.now()
        object.heroUpdate = {}
        for(let tag in tags) {
          if(tags[tag].checked){
            object.tags[tag] = true
          } else {
            object.tags[tag] = false
          }
        }
        window.socket.emit('addObjects', [object])
      } else {
        defaultFirstClick(e)
      }
    },
    onSecondClick: (e) => {
      let newObject = {
        id: 'object' + Date.now(),
        width: (e.offsetX - window.clickStart.x + window.camera.x)/window.scaleMultiplier,
        height: (e.offsetY - window.clickStart.y + window.camera.y)/window.scaleMultiplier,
        x: window.clickStart.x/window.scaleMultiplier,
        y: window.clickStart.y/window.scaleMultiplier,
        color: 'white',
        tags: {},
        heroUpdate: {},
      }

      for(let tag in tags) {
        if(tags[tag].checked){
          newObject.tags[tag] = true
        } else {
          newObject.tags[tag] = false
        }
      }

      if(instantAddToggle.checked) {
        window.socket.emit('addObjects', [newObject])
      } else {
        window.objectFactory.push(newObject)
      }
    },
  }
}
tools[TOOLS.PROCEDURAL] = tools[TOOLS.AREA_SELECTOR]


/////////////////////
//DOM
/////////////////////
/////////////////////
let instantGridAddToggle;
let instantAddToggle;
let selectorGameToggle;
let selectorProceduralToggle;
let selectorSpawnToggle;
let selectorCameraToggle;
function init(ctx, objects) {
  input.init()

  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  /////////////////////
  // Click start, MousePos events
  /////////////////////
  /////////////////////
  window.document.getElementById('game').addEventListener("mousemove", function(e) {
    window.mousePos.x = ((e.offsetX + window.camera.x)/window.scaleMultiplier)
    window.mousePos.y = ((e.offsetY + window.camera.y)/window.scaleMultiplier)
  })

  window.document.getElementById('game').addEventListener('click',function(e){
    if(window.clickStart.x && window.clickStart.y) {
      //second click
      if(tools[window.currentTool].onSecondClick) tools[window.currentTool].onSecondClick(e)
      window.clickStart.x = null
      window.clickStart.y = null
    } else {
      // first click
      if(tools[window.currentTool].onFirstClick) tools[window.currentTool].onFirstClick(e)
      else {
        defaultFirstClick(e)
      }
    }
  },false);

  /////////////////////
  //CREATE DOM LISTS
  /////////////////////
  /////////////////////
  let heroModSelectEl = document.getElementById("hero-modifier-select")
  for(let modifierName in modifiers) {
    let modEl = document.createElement('div')
    modEl.className = 'button';
    modEl.innerHTML = 'apply mod - ' + modifierName
    modEl.onclick=function() {
      let editorState = heroeditor.get()
      Object.assign(editorState, modifiers[modifierName])
      heroeditor.set(editorState)
      heroeditor.expandAll()
      setHero(editorState)
    }
    heroModSelectEl.appendChild(modEl)
  }

  let toolAddObjectEl = document.getElementById("tool-addObject")

  let tagSelectEl = document.getElementById("tag-select")
  for(var tag in tags) {
    let tagEl = document.createElement('input')
    tagEl.type ='checkbox'
    tagEl.checked = tags[tag]
    tagEl.id = 'tag-'+tag
    tags[tag] = tagEl
    let tagContainerEl = document.createElement('div')
    tagContainerEl.innerHTML = tag
    tagContainerEl.appendChild(tagEl)

    tagSelectEl.appendChild(tagContainerEl)
  }

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

  //mod select functionality
  let modSelectEl = document.getElementById("modifier-select")
  for(let modifierName in modifiers) {
    let modEl = document.createElement('div')
    modEl.className = 'button';
    modEl.innerHTML = 'heroUpdate - ' + modifierName
    modEl.onclick=function() {
      let editorState = simpleeditor.get()
      editorState.heroUpdate = modifiers[modifierName]
      simpleeditor.set(editorState)
      simpleeditor.expandAll()
      emitEditedObject(editorState)
    }
    modSelectEl.appendChild(modEl)
  }

  /////////////////////
  //EDITORs
  /////////////////////
  /////////////////////
  var simplejsoneditor = document.createElement("div")
  simplejsoneditor.id = 'simplejsoneditor'
  document.getElementById('tool-'+TOOLS.SIMPLE_EDITOR).appendChild(simplejsoneditor);
  window.simpleeditor = new JSONEditor(simplejsoneditor, { onChangeJSON: (object) => {
    emitEditedObject(object)
  }});

  var herojsoneditor = document.createElement("div")
  herojsoneditor.id = 'herojsoneditor'
  document.getElementById('tool-'+TOOLS.HERO_EDITOR).appendChild(herojsoneditor);
  window.heroeditor = new JSONEditor(herojsoneditor, { onChangeJSON: (object) => {
    setHero()
  }});


  /////////////////////
  //ALL THE OTHA BUTTONS
  /////////////////////
  /////////////////////
  var getHeroButton = document.getElementById("get-hero")
  getHeroButton.addEventListener('click', window.getHero)
  var setHeroButton = document.getElementById("set-hero")
  setHeroButton.addEventListener('click', setHero)
  var setHeroPosButton = document.getElementById("set-hero-pos")
  setHeroPosButton.addEventListener('click', setHeroPos)
  var findHeroButton = document.getElementById("find-hero");
  findHeroButton.addEventListener('click', findHero)
  var respawnHeroButton = document.getElementById("respawn-hero");
  respawnHeroButton.addEventListener('click', respawnHero)
  var resetHeroButton = document.getElementById("reset-hero-other");
  resetHeroButton.addEventListener('click', resetHero)
  var resetObjectsButton = document.getElementById("reset-objects");
  resetObjectsButton.addEventListener('click', resetObjects)
  var deleteObjectButton = document.getElementById("delete-object");
  deleteObjectButton.addEventListener('click', () => window.socket.emit('removeObject', window.editingObject.id))
  var setPresetWorldArenaBoundaryButton = document.getElementById("set-preset-world-arenaboundary");
  setPresetWorldArenaBoundaryButton.addEventListener('click', setPresetWorldArenaBoundary)
  var setPresetWorldArenaCyclicalButton = document.getElementById("set-preset-world-arenacyclical");
  setPresetWorldArenaCyclicalButton.addEventListener('click', setPresetWorldArenaCyclical)
  var setPresetWorldArenaCyclicalButton2 = document.getElementById("set-preset-world-arenacyclical-2");
  setPresetWorldArenaCyclicalButton2.addEventListener('click', setPresetWorldArenaCyclical)
  var setPresetWorldAdventureZoomedButton = document.getElementById("set-preset-world-adventurezoomed");
  setPresetWorldAdventureZoomedButton.addEventListener('click', setPresetWorldAdventureZoomed)
  var zoomOutButton = document.getElementById("hero-zoomOut");
  zoomOutButton.addEventListener('click', () => window.socket.emit('updateHero', { id: window.editingHero.id, zoomMultiplier: window.editingHero.zoomMultiplier/.9 }))
  var zoomInButton = document.getElementById("hero-zoomIn");
  zoomInButton.addEventListener('click', () => window.socket.emit('updateHero', { id: window.editingHero.id, zoomMultiplier: window.editingHero.zoomMultiplier/1.1 }))
  selectorGameToggle = document.getElementById('set-game')
  selectorCameraToggle = document.getElementById('set-camera')
  selectorSpawnToggle = document.getElementById('set-spawn')
  selectorProceduralToggle = document.getElementById('set-procedural')
  var createMazeButton = document.getElementById("create-maze");
  createMazeButton.onclick = (e) => {
    createMaze()
  }
  var createGridButton = document.getElementById("create-grid");
  createGridButton.onclick = (e) => {
    createGrid()
  }

  var syncHeroToggle = document.getElementById('sync-hero')
  syncHeroToggle.onclick = (e) => {
    if(e.srcElement.checked) {
      window.socket.emit('updatePreferences', { syncHero: true })
    } else {
      window.socket.emit('updatePreferences', { syncHero: false })
    }
  }
  if(window.preferences.syncHero) {
    syncHeroToggle.checked = true;
  }

  var syncObjectsToggle = document.getElementById('sync-objects')
  syncObjectsToggle.onclick = (e) => {
    if(e.srcElement.checked) {
      window.socket.emit('updatePreferences', { syncObjects: true })
    } else {
      window.socket.emit('updatePreferences', { syncObjects: false })
    }
  }
  if(window.preferences.syncObjects) {
    syncObjectsToggle.checked = true;
  }

  var saveObjects = document.getElementById("save-factory");
  saveObjects.addEventListener('click', function(e){
    window.socket.emit('addObjects', window.objectFactory)
    window.objectFactory = []
  })

  instantGridAddToggle = document.getElementById("instant-grid-add")
  instantAddToggle = document.getElementById("instant-add")

  var clearcameralock = document.getElementById("clear-camera-lock")
  clearcameralock.addEventListener('click', (e) => {
    window.socket.emit('updatePreferences', { lockCamera: {} })
  })

  var cleargameboundaries = document.getElementById("clear-game-boundaries")
  cleargameboundaries.addEventListener('click', (e) => {
    window.socket.emit('updatePreferences', { gameBoundaries: {} })
  })

  var setGameToCamera = document.getElementById("match-game-and-camera")
  setGameToCamera.addEventListener('click', (e) => {
    if(window.preferences.lockCamera){
      window.socket.emit('updatePreferences', { gameBoundaries: window.preferences.lockCamera })
    } else if(window.preferences.gameBoundaries) {
      window.socket.emit('updatePreferences', { lockCamera: window.preferences.gameBoundaries })
    }
  })



  /////////////////////
  /////////////////////
  // BUTTON PRESS FUNCTIONS
  /////////////////////
  /////////////////////
  /////////////////////
  /////////////////////
  function createMaze() {
    const { width, height } = window.preferences.proceduralBoundaries
    const { x, y } = gridTool.snapXYToGrid(window.preferences.proceduralBoundaries.x, window.preferences.proceduralBoundaries.y);
    let w = Math.floor(width / (window.gridNodeSize * window.mazeWidthMultiplier)/2)
    let h = Math.floor(height / (window.gridNodeSize * window.mazeWidthMultiplier)/2)

    let maze = procedural.genMaze(w, h, x, y)
    window.socket.emit('addObjects', maze)
  }

  function createGrid() {
    const { width, height } = window.preferences.proceduralBoundaries
    const { x, y } = gridTool.snapXYToGrid(window.preferences.proceduralBoundaries.x, window.preferences.proceduralBoundaries.y);
    let w = Math.floor(width / (window.gridNodeSize))
    let h = Math.floor(height / (window.gridNodeSize))

    let gridSize = { x: w, y: h };
    let grid = gridTool.createGrid(gridSize, window.gridNodeSize, { x, y })
    window.socket.emit('updateGrid', grid, window.gridNodeSize, gridSize)
  }

  function setHero() {
    let hero = heroeditor.get()
    const heroCopy = Object.assign({}, hero)
    delete heroCopy.x
    delete heroCopy.y
    window.socket.emit('updateHero', heroCopy)
  }

  function emitEditedObject(object) {
    delete object.x
    delete object.y
    Object.assign(window.objects[window.editingObject.i], object)
    window.socket.emit('editObjects', window.objects)
  }

  function setHeroPos() {
    let hero = heroeditor.get()
    window.socket.emit('updateHero', { id: hero.id, x: hero.x, y: hero.y })
  }

  function respawnHero() {
    let hero = heroeditor.get()
    window.socket.emit('updateHero', { id: hero.id, x: hero.spawnPointX, y: hero.spawnPointY })
  }
  function resetHero() {
    window.socket.emit('resetHero', hero)
  }

  function resetObjects() {
    window.socket.emit('resetObjects')
  }

  function findHero() {
    camera.setCamera(ctx, window.heros[window.editingHero.id])
  }

  window.updateHero = function(hero) {
    Object.assign(heros[hero.id], hero)
    if(hero.id == window.editingHero.id) {
      window.getHero()
      setHero()
    }
  }

  window.getHero = function() {
    if(Object.keys(window.heros).length === 1) {
      for(var heroId in window.heros) {
        window.editingHero = window.heros[heroId]
        heroeditor.update(window.heros[window.editingHero.id])
      }
    }

    heroeditor.update({})
    heroeditor.update(window.heros[window.editingHero.id])
  }

  function setPresetWorldArenaBoundary() {
    const value = {
      width: window.CONSTANTS.PLAYER_CANVAS_WIDTH * window.preferences.zoomMultiplier,
      height: window.CONSTANTS.PLAYER_CANVAS_HEIGHT * window.preferences.zoomMultiplier,
      centerX: window.editingHero.x + window.editingHero.width/2,
      centerY: window.editingHero.y + window.editingHero.height/2,
    }

    createArena()
    const {centerY, centerX, width, height} = value;
    const lockCamera = { x: centerX - width/2, y: centerY - height/2, height, width, centerX , centerY, limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
    window.socket.emit('updatePreferences', { lockCamera: lockCamera , gameBoundaries: {} })
  }

  function setPresetWorldArenaCyclical() {
    const value = {
      width: window.CONSTANTS.PLAYER_CANVAS_WIDTH * window.preferences.zoomMultiplier,
      height: window.CONSTANTS.PLAYER_CANVAS_HEIGHT * window.preferences.zoomMultiplier,
      centerX: window.editingHero.x + window.editingHero.width/2,
      centerY: window.editingHero.y + window.editingHero.height/2,
    }

    const {centerY, centerX, width, height} = value;
    const lockCamera = { x: centerX - width/2, y: centerY - height/2, height, width, centerX , centerY, limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
    window.socket.emit('updatePreferences', { lockCamera: lockCamera, gameBoundaries: lockCamera })
  }

  function setPresetWorldAdventureZoomed() {
    window.socket.emit('updatePreferences', { lockCamera: {}, gameBoundaries: {}, zoomMultiplier: 1 })
  }
}

function createArena() {
  let boundaries = {x: window.editingHero.x - (window.CONSTANTS.PLAYER_CANVAS_WIDTH * window.preferences.zoomMultiplier)/2 + window.editingHero.width/2, y: window.editingHero.y - (window.CONSTANTS.PLAYER_CANVAS_HEIGHT * window.preferences.zoomMultiplier)/2 + window.editingHero.height/2, width: (window.CONSTANTS.PLAYER_CANVAS_WIDTH * window.preferences.zoomMultiplier), height: (window.CONSTANTS.PLAYER_CANVAS_HEIGHT * window.preferences.zoomMultiplier)}

  let wallLeft = {
    id: 'wall-l' + Date.now(),
    width: 5,
    height: boundaries.height,
    x: boundaries.x,
    y: boundaries.y,
    color: 'white',
    tags: {'obstacle':true},
  }

  let wallTop = {
    id: 'wall-t' + Date.now(),
    width: boundaries.width,
    height: 5,
    x: boundaries.x,
    y: boundaries.y,
    color: 'white',
    tags: {'obstacle':true},
  }

  let wallRight = {
    id: 'wall-r' + Date.now(),
    width: 5,
    height: boundaries.height,
    x: boundaries.x + (boundaries.width) - 5,
    y: boundaries.y,
    color: 'white',
    tags: {'obstacle':true},
  }

  let wallBottom = {
    id: 'wall-b' + Date.now(),
    width: boundaries.width,
    height: 5,
    x: boundaries.x,
    y: boundaries.y + (boundaries.height) - 5,
    color: 'white',
    tags: {'obstacle':true},
  }

  window.socket.emit('addObjects', [wallTop, wallRight, wallLeft, wallBottom])
}

export default {
  init,
  render: camera.render,
  update: input.update
}
