import JSONEditor from 'jsoneditor'
import collisions from '../collisions'
import gridTool from '../grid.js'
import procedural from './procedural.js'
import modifiers from './modifiers.js'
import camera from './camera.js'
import input from './input.js'
import pathfinding from '../pathfinding'

/////////////////////
//GLOBALS
/////////////////////
/////////////////////
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
  SIMPLE_EDITOR: 'objectEditor',
  HERO_EDITOR: 'heroEditor',
  PROCEDURAL: 'procedural',
  UNIVERSE_VIEW: 'universeView',
}
window.currentTool = TOOLS.ADD_OBJECT;
window.scaleMultiplier = .3
window.objectFactory = []

window.tags = {
  obstacle: true,
  stationary: false,
  monster: false,
  coin: false,
  powerup: false,
  once: false,
  deleteAfter: false,
  chatter: false,
  glowing: false,
  wander: false,
  goomba: false,
  homing: false,
  zombie: false,
}
window.editingObject = {
  i: null,
  id: null,
}
window.heros = {}
window.editingHero = {
  id: null,
}

window.simpleeditor = null
window.heroeditor = null

window.gridNodeAddToggle = true
window.instantAddToggle = false
window.selectorGameToggle = false
window.selectorProceduralToggle = false
window.selectorSpawnToggle = true
window.selectorCameraToggle = false

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

      if(clickToSetHeroSpawnToggle.checked) {
        window.socket.emit('updateHero', {id: window.editingHero.id, spawnPointX: click.x, spawnPointY: click.y})
      } else {
        Object.keys(window.heros).map((key) => window.heros[key])
        .forEach((hero, i) => {
          collisions.checkObject(click, hero, () => {
            window.editingHero = hero
            heroeditor.update(window.heros[window.editingHero.id])
            heroeditor.expandAll()
          })
        })
      }
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

      if(window.setObjectSpawnToggle.checked) {
        emitEditedObject({spawnPointX: click.x, spawnPointY: click.y})
      } else if(window.setObjectPathfindingLimitToggle.checked) {
        defaultFirstClick(e)
      } else if(window.selectorObjectToggle.checked){
        window.objects
        .forEach((object, i) => {
          collisions.checkObject(click, object, () => {
            simpleeditor.set(Object.assign({}, object))
            simpleeditor.expandAll()
            window.editingObject = object
            window.editingObject.i = i
          })
        })
      }
    },
    onSecondClick: (e) => {
      const value = {
        width: (e.offsetX - window.clickStart.x + window.camera.x)/window.scaleMultiplier,
        height: (e.offsetY - window.clickStart.y + window.camera.y)/window.scaleMultiplier,
        x: window.clickStart.x/window.scaleMultiplier,
        y: window.clickStart.y/window.scaleMultiplier,
      }

      if(window.setObjectPathfindingLimitToggle.checked) {
        const {x, y, width, height} = gridTool.convertToGridXY(value);
        emitEditedObject({ pathfindingLimit: { x, y , width, height }})
      }
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
    onFirstClick: (e) => {
      if(selectorSpawnToggle.checked) {
        const click = {
          x: (e.offsetX + window.camera.x)/window.scaleMultiplier,
          y: (e.offsetY + window.camera.y)/window.scaleMultiplier,
        }

        window.socket.emit('updatePreferences', {worldSpawnPointX: click.x, worldSpawnPointY: click.y})
        // window.updateHero({id: window.editingHero.id, spawnPointX: click.x, spawnPointY: click.y})
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

      gridTool.snapObjectToGrid(value)

      const {x, y, width, height} = value;
      if(window.currentTool === TOOLS.PROCEDURAL) {
        const proceduralBoundaries = { x, y, width, height };
        window.socket.emit('updatePreferences', { proceduralBoundaries })
      } else if(selectorCameraToggle.checked) {
        const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
        window.socket.emit('updatePreferences', { lockCamera })
      } else if(selectorGameToggle.checked) {
        const gameBoundaries = { x, y, width, height };
        window.socket.emit('updatePreferences', { gameBoundaries })
      }
    },
  },
  [TOOLS.ADD_OBJECT] : {
    onFirstClick: (e) => {
      if(window.dragAddToggle.checked) {
        defaultFirstClick(e)
      } else {
        const click = {
          x: (e.offsetX + window.camera.x)/window.scaleMultiplier,
          y: (e.offsetY + window.camera.y)/window.scaleMultiplier,
        }

        const { x, y } = gridTool.createGridNodeAt(click.x, click.y)
        let newObject = {
          id: 'object' + Date.now(),
          width: window.grid.nodeSize,
          height: window.grid.nodeSize,
          x: x,
          y: y,
          color: 'white',
          tags: {},
          heroUpdate: {},
        }

        if(window.dotAddToggle.checked) {
          newObject.width = Number(document.getElementById('add-dot-size').value)
          newObject.height = Number(document.getElementById('add-dot-size').value)
          newObject.x += (window.grid.nodeSize/2 - newObject.width/2)
          newObject.y += (window.grid.nodeSize/2 - newObject.height/2)
        }

        addObjects(newObject)
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

      gridTool.snapObjectToGrid(newObject)

      addObjects(newObject)
    },
  }
}
tools[TOOLS.PROCEDURAL] = tools[TOOLS.AREA_SELECTOR]


/////////////////////
//DOM
/////////////////////
/////////////////////
function init(ctx, objects) {
  input.init()
  camera.init()

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
      // this is what sync should mean. Does every edit send immediately?
      if(true) sendHero()
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
      // this is what sync should mean. Does every edit send immediately?
      if(true) emitEditedObject({ heroUpdate : modifiers[modifierName]})
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
  window.simpleeditor = new JSONEditor(simplejsoneditor, { onChangeJSON: (objectEdited) => {
    let object = window.objects[window.editingObject.i]

    if((object.tags.obstacle == true && objectEdited.tags.obstacle == false) || (object.tags.stationary == true && objectEdited.tags.stationary == false)) {
      gridTool.removeObstacle({...object, tags: objectEdited.tags})
    }

    if((object.tags.obstacle == false && objectEdited.tags.obstacle == true) || (object.tags.stationary == false && objectEdited.tags.stationary == true)) {
      gridTool.addObstacle({...object, tags: objectEdited.tags})
    }

    emitEditedObject({ tags: objectEdited.tags})
  }});

  var herojsoneditor = document.createElement("div")
  herojsoneditor.id = 'herojsoneditor'
  document.getElementById('tool-'+TOOLS.HERO_EDITOR).appendChild(herojsoneditor);
  window.heroeditor = new JSONEditor(herojsoneditor, { onChangeJSON: (object) => {
    // this is what sync should mean. Does every edit send immediately?
    // sendHero()
  }});


  /////////////////////
  //UNIVERSE_VIEW BUTTONS
  /////////////////////
  /////////////////////
  var zoomToUniverseButton = document.getElementById("zoom-out-to-universe");
  zoomToUniverseButton.addEventListener('click', () => {
    window.socket.emit('updateHero', { id: window.editingHero.id, animationZoomTarget: window.constellationDistance, animationZoomMultiplier: window.editingHero.zoomMultiplier, endAnimation: false })
  })
  var zoomToWorldButton = document.getElementById("zoom-in-to-world");
  zoomToWorldButton.addEventListener('click', () => {
    window.socket.emit('updateHero', { id: window.editingHero.id, animationZoomTarget: window.editingHero.zoomMultiplier, endAnimation: true, })
  })
  var saveWorldButton = document.getElementById("save-world")
  saveWorldButton.addEventListener('click', () => {
    if(!shouldRestoreHeroToggle.checked && !window.preferences.worldSpawnPointX) {
      alert('no spawn point set')
      return
    }
    window.saveWorld()
  })
  var setWorldButton = document.getElementById("set-world")
  setWorldButton.addEventListener('click', () => {
    window.setWorld()
  })
  var newWorldButton = document.getElementById("new-world")
  newWorldButton.addEventListener('click', () => {
    window.resetObjects()
    window.socket.emit('resetPreferences')
    window.socket.emit('updateGrid', { width: 50, height: 50, startX: 0, startY: 0, nodeSize: 40})
    for(var heroId in window.heros) {
      window.socket.emit('resetHero', window.heros[heroId])
    }
  })
  window.resetObjects = function() {
    window.socket.emit('resetObjects')
  }
  var resetObjectsButton = document.getElementById("reset-objects");
  resetObjectsButton.addEventListener('click', window.resetObjects)

  window.shouldRestoreHeroToggle = document.getElementById('should-restore-hero')
  shouldRestoreHeroToggle.onclick = (e) => {
    if(e.srcElement.checked) {
      window.socket.emit('updatePreferences', { shouldRestoreHero: true })
    } else {
      window.socket.emit('updatePreferences', { shouldRestoreHero: false })
    }
  }
  window.isAsymmetricToggle = document.getElementById('is-asymmetric')
  isAsymmetricToggle.onclick = (e) => {
    if(e.srcElement.checked) {
      window.socket.emit('updatePreferences', { isAsymmetric: true })
    } else {
      window.socket.emit('updatePreferences', { isAsymmetric: false })
    }
  }

  window.calculatePathCollisionsToggle = document.getElementById('calculate-path-collisions')
  calculatePathCollisionsToggle.onclick = (e) => {
    if(e.srcElement.checked) {
      window.socket.emit('updatePreferences', { calculatePathCollisions: true })
    } else {
      window.socket.emit('updatePreferences', { calculatePathCollisions: false })
    }
  }


  window.saveWorld = function() {
    window.socket.emit('saveWorld', document.getElementById('world-name').value)
  }

  window.setWorld = function() {
    window.socket.emit('setWorld', document.getElementById('world-name').value)
  }

  /////////////////////
  //HERO_VIEW BUTTONS
  /////////////////////
  /////////////////////
  var sendHeroButton = document.getElementById("send-hero")
  sendHeroButton.addEventListener('click', sendHero)
  var sendHeroPosButton = document.getElementById("send-hero-pos")
  sendHeroPosButton.addEventListener('click', sendHeroPos)
  var findHeroButton = document.getElementById("find-hero");
  findHeroButton.addEventListener('click', window.findHero)
  var respawnHeroButton = document.getElementById("respawn-hero");
  respawnHeroButton.addEventListener('click', respawnHero)
  var resetHeroButton = document.getElementById("reset-hero-other");
  resetHeroButton.addEventListener('click', resetHero)
  var deleteButton = document.getElementById("delete-hero");
  deleteButton.addEventListener('click', () => {
    window.socket.emit('deleteHero', editingHero.id)
  })

  window.clickToSetHeroSpawnToggle = document.getElementById('click-to-set-spawn-hero')
  window.syncHeroToggle = document.getElementById('sync-hero')
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
  var zoomOutButton = document.getElementById("hero-zoomOut");
  zoomOutButton.addEventListener('click', () => window.socket.emit('updateHero', { id: window.editingHero.id, zoomMultiplier: window.editingHero.zoomMultiplier/.9 }))
  var zoomInButton = document.getElementById("hero-zoomIn");
  zoomInButton.addEventListener('click', () => window.socket.emit('updateHero', { id: window.editingHero.id, zoomMultiplier: window.editingHero.zoomMultiplier/1.1 }))

  function sendHero() {
    let hero = heroeditor.get()
    const heroCopy = Object.assign({}, hero)
    delete heroCopy.x
    delete heroCopy.y
    window.socket.emit('updateHero', heroCopy)
  }
  function sendHeroPos() {
    let hero = heroeditor.get()
    window.socket.emit('updateHero', { id: hero.id, x: hero.x, y: hero.y })
  }

  function respawnHero() {
    window.socket.emit('respawnHero', editingHero)
    // let hero = heroeditor.get()
    // window.socket.emit('updateHero', { id: hero.id, x: hero.spawnPointX, y: hero.spawnPointY })
  }
  function resetHero() {
    window.socket.emit('resetHero', editingHero)
  }

  window.findHero = function() {
    camera.setCamera(ctx, window.heros[window.editingHero.id])
  }

  window.setEditingHero = function(hero) {
    window.editingHero = hero
    heroeditor.update(window.editingHero)
  }

  window.getEditingHero = function() {
    heroeditor.update(window.heros[window.editingHero.id])
  }

  /////////////////////
  //OBJECT_VIEW
  /////////////////////
  /////////////////////
  var deleteObjectButton = document.getElementById("delete-object");
  deleteObjectButton.addEventListener('click', () => window.socket.emit('removeObject', window.editingObject))
  window.syncObjectsToggle = document.getElementById('sync-objects')
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
  window.setObjectSpawnToggle = document.getElementById('set-spawn-object')
  window.selectorObjectToggle = document.getElementById('select-object')
  window.setObjectPathfindingLimitToggle = document.getElementById('set-pathfinding-limit')

  var saveObjects = document.getElementById("save-factory");
  saveObjects.addEventListener('click', function(e){
    window.socket.emit('addObjects', window.objectFactory)
    window.objectFactory = []
  })

  window.gridNodeAddToggle = document.getElementById("add-object-grid-node")
  window.dragAddToggle = document.getElementById("add-object-drag")
  window.dotAddToggle = document.getElementById("add-object-dot")
  window.instantAddToggle = document.getElementById("instant-add")
  window.gridNodeAddToggle.checked = true;

  /////////////////////
  // SELECT AREA BUTTONS
  /////////////////////
  /////////////////////
  window.selectorGameToggle = document.getElementById('set-game')
  window.selectorCameraToggle = document.getElementById('set-camera')
  window.selectorSpawnToggle = document.getElementById('set-spawn')
  window.selectorProceduralToggle = document.getElementById('set-procedural')
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

  var setCameraLockToHeroCamera = document.getElementById("set-camera-lock-to-hero-camera");
  setCameraLockToHeroCamera.addEventListener('click', function(){
    const value = {
      width: window.CONSTANTS.PLAYER_CAMERA_WIDTH * window.editingHero.zoomMultiplier,
      height: window.CONSTANTS.PLAYER_CAMERA_HEIGHT * window.editingHero.zoomMultiplier,
      centerX: window.editingHero.x + window.editingHero.width/2,
      centerY: window.editingHero.y + window.editingHero.height/2,
    }
    const {centerY, centerX, width, height} = value;
    const lockCamera = { x: centerX - width/2, y: centerY - height/2, height, width, centerX , centerY, limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
    window.socket.emit('updatePreferences', { lockCamera: lockCamera })
  })

  var setCameraLockToGrid = document.getElementById("set-camera-lock-to-grid");
  setCameraLockToGrid.addEventListener('click', function(){
    const value = {
      width: window.grid.width * window.grid.nodeSize,
      height: window.grid.height * window.grid.nodeSize,
      x: window.grid.startX,
      y: window.grid.startY
    }
    const { x, y, width, height} = value
    const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
    window.socket.emit('updatePreferences', { lockCamera: lockCamera })
  })


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
    window.createGrid()
  }

  var createArenaButton = document.getElementById("create-arena");
  createArenaButton.onclick = (e) => {
    createArena(window.preferences.proceduralBoundaries)
  }

  window.createGrid = function() {
    const { width, height } = window.preferences.proceduralBoundaries
    const { x, y } = gridTool.snapXYToGrid(window.preferences.proceduralBoundaries.x, window.preferences.proceduralBoundaries.y);
    let w = Math.floor(width / (window.grid.nodeSize))
    let h = Math.floor(height / (window.grid.nodeSize))
    window.grid.width = w
    window.grid.height = h
    window.grid.startX = x
    window.grid.startY = y
    window.grid.nodes = gridTool.generateGridNodes(window.grid)
    window.socket.emit('updateGrid', window.grid)
  }

  function createMaze() {
    const { width, height } = window.preferences.proceduralBoundaries
    const { x, y } = gridTool.snapXYToGrid(window.preferences.proceduralBoundaries.x, window.preferences.proceduralBoundaries.y);
    let w = Math.floor(width / (window.grid.nodeSize * window.mazeWidthMultiplier)/2)
    let h = Math.floor(height / (window.grid.nodeSize * window.mazeWidthMultiplier)/2)

    let maze = procedural.genMaze(w, h, x, y)
    addObjects(maze)
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

    addObjects([wallTop, wallRight, wallLeft, wallBottom])
  }


  /////////////////////
  // GAME FEEL BUTTONS (OLD)
  /////////////////////
  /////////////////////
  // var setPresetWorldArenaBoundaryButton = document.getElementById("set-preset-world-arenaboundary");
  // setPresetWorldArenaBoundaryButton.addEventListener('click', setPresetWorldArenaBoundary)
  // var setPresetWorldArenaCyclicalButton = document.getElementById("set-preset-world-arenacyclical");
  // setPresetWorldArenaCyclicalButton.addEventListener('click', setPresetWorldArenaCyclical)

  // var setPresetWorldAdventureZoomedButton = document.getElementById("set-preset-world-adventurezoomed");
  // setPresetWorldAdventureZoomedButton.addEventListener('click', setPresetWorldAdventureZoomed)


  // function setPresetWorldArenaBoundary() {
  //   const value = {
  //     width: window.CONSTANTS.PLAYER_CAMERA_WIDTH * window.preferences.zoomMultiplier,
  //     height: window.CONSTANTS.PLAYER_CAMERA_HEIGHT * window.preferences.zoomMultiplier,
  //     centerX: window.editingHero.x + window.editingHero.width/2,
  //     centerY: window.editingHero.y + window.editingHero.height/2,
  //   }
  //
  //   createArena()
  //   const {centerY, centerX, width, height} = value;
  //   const lockCamera = { x: centerX - width/2, y: centerY - height/2, height, width, centerX , centerY, limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
  //   window.socket.emit('updatePreferences', { lockCamera: lockCamera , gameBoundaries: {} })
  // }
  //

  //
  // function setPresetWorldAdventureZoomed() {
  //   window.socket.emit('updatePreferences', { lockCamera: {}, gameBoundaries: {}, zoomMultiplier: 1 })
  // }
}

function emitEditedObject(objectUpdate) {
  let objectCopy = { ...objectUpdate }
  Object.assign(window.editingObject, objectCopy)
  Object.assign(window.objects[window.editingObject.i], objectCopy)
  window.socket.emit('editObjects', window.objects)
}

function addObjects(objects, options = { bypassCollisions: false, instantAdd: true }) {
  if(!objects.length) {
    objects = [objects]
  }

  let alertAboutCollision

  objects = objects.map((newObject) => {
    if(!newObject.tags) {
      newObject.tags = []
    }

    for(let tag in window.tags) {
      if(window.tags[tag].checked || newObject.tags[tag] === true){
        newObject.tags[tag] = true
      } else {
        newObject.tags[tag] = false
      }
    }

    if(!window.preferences.calculatePathCollisions) {
      gridTool.addObstacle(newObject)
    }

    if(!collisions.check(newObject, window.objects) || options.bypassCollisions) {
      return newObject
    } else {
      alertAboutCollision = true
    }
  }).filter(obj => !!obj)


  if(alertAboutCollision) {
    if(confirm('already an object on this grid node..confirm to add anyways')) {
      emitNewObjects()
    }
  } else {
    emitNewObjects()
  }

  function emitNewObjects() {
    if(instantAddToggle.checked || options.instantAddToggle) {
      window.socket.emit('addObjects', objects)
    } else {
      window.objectFactory.push(...objects)
    }
  }
}

export default {
  init,
  render: camera.render,
  update: input.update
}
