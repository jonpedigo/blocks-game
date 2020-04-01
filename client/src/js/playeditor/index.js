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
window.scaleMultiplier = .2
window.objectFactory = []

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


window.tags = {

  // COLLISIONS
  obstacle: true,
  stationary: false,
  monster: false,
  coin: false,
  powerup: false,
  deleteAfter: false,

  // PHYSICS
  gravity: false,
  movingPlatform: false,

  // UI
  chatter: false,

  // GRAPHICAL
  glowing: false,

  // INTELLIGENCE
  wander: false,
  goomba: false,
  goombaSideways: false,
  homing: false,
  zombie: false,

  // TEMPORARY STATE
  fresh: false,

}
window.editingObject = {
  i: null,
  id: null,
}
window.heros = {}
window.editingHero = {
  id: null,
}

window.objecteditor = null
window.heroeditor = null

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

      if(window.clickToSetHeroSpawnToggle.checked) {
        window.socket.emit('updateHero', {id: window.editingHero.id, spawnPointX: click.x, spawnPointY: click.y})
      } else {
        Object.keys(window.heros).map((key) => window.heros[key])
        .forEach((hero, i) => {
          collisions.checkObject(click, hero, () => {
            window.editingHero = hero
            window.heroeditor.set(window.heros[window.editingHero.id])
            window.heroeditor.expandAll()
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
        sendObjectUpdate({spawnPointX: click.x, spawnPointY: click.y})
      } else if(window.setObjectPathfindingLimitToggle.checked) {
        defaultFirstClick(e)
      } else if(window.selectorObjectToggle.checked){
        window.objects
        .forEach((object, i) => {
          collisions.checkObject(click, object, () => {
            window.objecteditor.set(Object.assign({}, object))
            window.objecteditor.expandAll()
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
        sendObjectUpdate({ pathfindingLimit: { x, y , width, height }})
      }
    }
  },
  [TOOLS.AREA_SELECTOR]: {
    onFirstClick: (e) => {
      if(window.selectorSpawnToggle.checked) {
        const click = {
          x: (e.offsetX + window.camera.x)/window.scaleMultiplier,
          y: (e.offsetY + window.camera.y)/window.scaleMultiplier,
        }

        window.socket.emit('updateGame', {worldSpawnPointX: click.x, worldSpawnPointY: click.y})
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

      gridTool.snapDragToGrid(value, {dragging: true})

      const {x, y, width, height} = value;
      if(window.currentTool === TOOLS.PROCEDURAL || selectorProceduralToggle.checked) {
        const proceduralBoundaries = { x, y, width, height };
        window.socket.emit('updateGame', { proceduralBoundaries })
      } else if(selectorCameraToggle.checked) {
        const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
        window.socket.emit('updateGame', { lockCamera })
      } else if(selectorGameToggle.checked) {
        const gameBoundaries = { x, y, width, height };
        window.socket.emit('updateGame', { gameBoundaries })
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
          width: window.grid.nodeSize,
          height: window.grid.nodeSize,
          x: x,
          y: y,
        }

        if(window.dotAddToggle.checked) {
          newObject.width = Number(document.getElementById('add-dot-size').value)
          newObject.height = Number(document.getElementById('add-dot-size').value)
          newObject.x += (window.grid.nodeSize/2 - newObject.width/2)
          newObject.y += (window.grid.nodeSize/2 - newObject.height/2)
        }

        window.addObjects(newObject)
      }
    },
    onSecondClick: (e) => {
      let newObject = {
        width: (e.offsetX - window.clickStart.x + window.camera.x)/window.scaleMultiplier,
        height: (e.offsetY - window.clickStart.y + window.camera.y)/window.scaleMultiplier,
        x: window.clickStart.x/window.scaleMultiplier,
        y: window.clickStart.y/window.scaleMultiplier,
      }

      gridTool.snapDragToGrid(newObject, { dragging: true })
      window.addObjects(newObject)
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
      sendHeroUpdate(modifiers[modifierName])
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
      if(true) sendObjectUpdate({ heroUpdate : modifiers[modifierName]})
    }
    modSelectEl.appendChild(modEl)
  }

  /////////////////////
  //EDITORs
  /////////////////////
  /////////////////////
  var objectjsoneditor = document.createElement("div")
  objectjsoneditor.id = 'objectjsoneditor'
  document.getElementById('tool-'+TOOLS.SIMPLE_EDITOR).appendChild(objectjsoneditor);
  window.objecteditor = new JSONEditor(objectjsoneditor, { onChangeJSON: (objectEdited) => {
    let object = window.objects[window.editingObject.i]

    if((object.tags.obstacle == true && objectEdited.tags.obstacle == false) || (object.tags.stationary == true && objectEdited.tags.stationary == false)) {
      gridTool.removeObstacle({...object, tags: objectEdited.tags})
    }

    if((object.tags.obstacle == false && objectEdited.tags.obstacle == true) || (object.tags.stationary == false && objectEdited.tags.stationary == true)) {
      gridTool.addObstacle({...object, tags: objectEdited.tags})
    }

    sendObjectUpdate({ tags: objectEdited.tags })
  }});

  var herojsoneditor = document.createElement("div")
  herojsoneditor.id = 'herojsoneditor'
  document.getElementById('tool-'+TOOLS.HERO_EDITOR).appendChild(herojsoneditor);
  window.heroeditor = new JSONEditor(herojsoneditor, { onChangeJSON: (object) => {
    // this is what sync should mean. Does every edit send immediately?
    sendHeroUpdate({ tags: object.tags, flags: object.flags })
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
    if(!shouldRestoreHeroToggle.checked && !window.game.worldSpawnPointX) {
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
    window.socket.emit('resetGame')
    window.socket.emit('updateGrid', { width: 50, height: 50, startX: 0, startY: 0, nodeSize: 40})
    for(var heroId in window.heros) {
      window.socket.emit('resetHero', window.heros[heroId])
    }
  })
  var resetObjectsButton = document.getElementById("reset-objects");
  resetObjectsButton.addEventListener('click', () => {
    window.resetObjects()
  })

  window.shouldRestoreHeroToggle = document.getElementById('should-restore-hero')
  window.shouldRestoreHeroToggle.onclick = (e) => {
    if(e.srcElement.checked) {
      window.socket.emit('updateGame', { shouldRestoreHero: true })
    } else {
      window.socket.emit('updateGame', { shouldRestoreHero: false })
    }
  }
  window.isAsymmetricToggle = document.getElementById('is-asymmetric')
  window.isAsymmetricToggle.onclick = (e) => {
    if(e.srcElement.checked) {
      window.socket.emit('updateGame', { isAsymmetric: true })
    } else {
      window.socket.emit('updateGame', { isAsymmetric: false })
    }
  }

  window.calculatePathCollisionsToggle = document.getElementById('calculate-path-collisions')
  window.calculatePathCollisionsToggle.onclick = (e) => {
    if(e.srcElement.checked) {
      window.socket.emit('updateGame', { calculatePathCollisions: true })
    } else {
      window.socket.emit('updateGame', { calculatePathCollisions: false })
    }
  }

  window.resetObjects = function() {
    window.socket.emit('resetObjects')
  }
  window.saveWorld = function() {
    window.socket.emit('saveWorld', document.getElementById('world-name').value)
  }
  window.setWorld = function() {
    window.socket.emit('setWorld', document.getElementById('world-name').value)
  }

  /////////////////////
  //HERO EDITOR BUTTONS
  /////////////////////
  /////////////////////
  var sendHeroButton = document.getElementById("send-hero")
  sendHeroButton.addEventListener('click', sendEditorHeroOther)
  var sendHeroPosButton = document.getElementById("send-hero-pos")
  sendHeroPosButton.addEventListener('click', sendEditorHeroPos)
  var findHeroButton = document.getElementById("find-hero");
  findHeroButton.addEventListener('click', window.findHero)
  var respawnHeroButton = document.getElementById("respawn-hero");
  respawnHeroButton.addEventListener('click', respawnHero)
  var resetHeroButton = document.getElementById("reset-hero");
  resetHeroButton.addEventListener('click', resetHero)
  var deleteButton = document.getElementById("delete-hero");
  deleteButton.addEventListener('click', () => {
    window.socket.emit('deleteHero', editingHero.id)
  })

  window.clickToSetHeroSpawnToggle = document.getElementById('click-to-set-spawn-hero')
  window.syncHeroToggle = document.getElementById('sync-hero')
  window.syncHeroToggle.onclick = (e) => {
    if(e.srcElement.checked) {
      window.socket.emit('updateGame', { syncHero: true })
    } else {
      window.socket.emit('updateGame', { syncHero: false })
    }
  }
  if(window.game.syncHero) {
    window.syncHeroToggle.checked = true;
  }
  var zoomOutButton = document.getElementById("hero-zoomOut");
  zoomOutButton.addEventListener('click', () => window.socket.emit('updateHero', { id: window.editingHero.id, zoomMultiplier: window.editingHero.zoomMultiplier + .0625 }))
  var zoomInButton = document.getElementById("hero-zoomIn");
  zoomInButton.addEventListener('click', () => window.socket.emit('updateHero', { id: window.editingHero.id, zoomMultiplier: window.editingHero.zoomMultiplier - .0625 }))

  function sendHeroUpdate(update) {
    window.mergeDeep(window.editingHero, update)
    window.socket.emit('updateHero', window.editingHero)
  }

  function sendEditorHeroOther(update) {
    // get the hero from the editor, everything except for the x, y values
    let hero = window.heroeditor.get()
    const heroCopy = Object.assign({}, hero)
    delete heroCopy.x
    delete heroCopy.y
    window.socket.emit('updateHero', heroCopy)
  }
  function sendEditorHeroPos() {
    let hero = window.heroeditor.get()
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

  window.findObject = function() {
    camera.setCamera(ctx, window.editingObject)
  }

  window.setEditingHero = function(hero) {
    window.editingHero = hero
    window.heroeditor.set(window.editingHero)
    window.heroeditor.expandAll()
  }

  window.getEditingHero = function() {
    window.heroeditor.set(window.heros[window.editingHero.id])
    window.heroeditor.expandAll()
  }

  /////////////////////
  // OBJECT EDITOR
  /////////////////////
  /////////////////////
  var sendObjectPos = document.getElementById("send-object-pos");
  sendObjectPos.addEventListener('click', () => {
    let editingObj = window.objecteditor.get();
    sendObjectUpdate({ x: editingObj.x, y: editingObj.y })
  })

  var sendObjectOther = document.getElementById("send-object-other");
  sendObjectOther.addEventListener('click', () => {
    let editingObj = window.objecteditor.get();
    delete editingObj.x
    delete editingObj.y
    sendObjectUpdate(editingObj)
  })

  var deleteObjectButton = document.getElementById("delete-object");
  deleteObjectButton.addEventListener('click', () => window.socket.emit('removeObject', window.editingObject))
  window.syncObjectsToggle = document.getElementById('sync-objects')
  window.syncObjectsToggle.onclick = (e) => {
    if(e.srcElement.checked) {
      window.socket.emit('updateGame', { syncObjects: true })
    } else {
      window.socket.emit('updateGame', { syncObjects: false })
    }
  }
  if(window.game.syncObjects) {
    syncObjectsToggle.checked = true;
  }
  window.setObjectSpawnToggle = document.getElementById('set-spawn-object')
  window.selectorObjectToggle = document.getElementById('select-object')
  window.setObjectPathfindingLimitToggle = document.getElementById('set-pathfinding-limit')

  /////////////////////
  // ADD OBJECT BUTTONS
  /////////////////////
  /////////////////////
  var saveObjects = document.getElementById("save-factory");
  saveObjects.addEventListener('click', function(e){
    window.socket.emit('addObjects', window.objectFactory)
    window.objectFactory = []
  })

  var anticipatedObjectAdd = document.getElementById("anticipated-object-add");
  anticipatedObjectAdd.addEventListener('click', function(e){
    window.socket.emit('anticipateObject', {tags: getCheckedTags()});
  })

  var anticipatedObjectAdd = document.getElementById("anticipated-wall-add");
  anticipatedObjectAdd.addEventListener('click', function(e){
    window.socket.emit('anticipateObject', {wall: true, tags: getCheckedTags()});
  })

  function getCheckedTags() {
    return Object.keys(window.tags).reduce((acc, tag) => {
      acc[tag] = window.tags[tag].checked
      return acc
    }, {})
  }

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

  var cleararea = document.getElementById("clear-area-selected")
  cleararea.addEventListener('click', (e) => {
    if(window.selectorGameToggle.checked) {
      window.socket.emit('updateGame', { gameBoundaries: {} })
    }
    if(window.selectorCameraToggle.checked) {
      window.socket.emit('updateGame', { lockCamera: {} })
    }
    if(window.selectorSpawnToggle.checked) {
      window.socket.emit('updateGame', { worldSpawnPointX: null, worldSpawnPointY: null })
    }
    if(window.selectorProceduralToggle.checked) {
      window.socket.emit('updateGame', { proceduralBoundaries: {} })
    }
  })

  var setGameBoundaryDefault = document.getElementById("set-game-boundary-default")
  setGameBoundaryDefault.addEventListener('click', (e) => {
    window.socket.emit('updateGame', { gameBoundaries: { ...window.game.gameBoundaries, behavior: 'default' } })
  })
  var setGameBoundaryAll = document.getElementById("set-game-boundary-all")
  setGameBoundaryAll.addEventListener('click', (e) => {
    window.socket.emit('updateGame', { gameBoundaries: { ...window.game.gameBoundaries, behavior: 'boundaryAll' } })
  })
  var setGameBoundaryPacmanFlip = document.getElementById("set-pacman-flip")
  setGameBoundaryPacmanFlip.addEventListener('click', (e) => {
    window.socket.emit('updateGame', { gameBoundaries: { ...window.game.gameBoundaries, behavior: 'pacmanFlip' } })
  })
  var setGameBoundaryPurgatory = document.getElementById("set-purgatory")
  setGameBoundaryPurgatory.addEventListener('click', (e) => {
    window.socket.emit('updateGame', { gameBoundaries: { ...window.game.gameBoundaries, behavior: 'purgatory' } })
  })

  var setGameToSelected = document.getElementById("match-game-boundary-to-selected")
  setGameToSelected.addEventListener('click', (e) => {
    if(window.selectorCameraToggle.checked) {
      window.socket.emit('updateGame', { gameBoundaries: window.game.lockCamera })
    }
    if(window.selectorProceduralToggle.checked) {
      window.socket.emit('updateGame', { gameBoundaries: window.game.proceduralBoundaries })
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
      window.socket.emit('updateGame', { gameBoundaries: value })
    }
    if(window.selectorCameraToggle.checked) {
      window.socket.emit('updateGame', { lockCamera: value })
    }
    if(window.selectorSpawnToggle.checked) {
      window.socket.emit('updateGame', { worldSpawnPointX: value.x, worldSpawnPointY: value.y })
    }
    if(window.selectorProceduralToggle.checked) {
      window.socket.emit('updateGame', { proceduralBoundaries: value })
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
      window.socket.emit('updateGame', { gameBoundaries: value })
    }
    if(window.selectorCameraToggle.checked) {
      const { x, y, width, height} = value
      const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      window.socket.emit('updateGame', { lockCamera })
    }
    if(window.selectorSpawnToggle.checked) {
      window.socket.emit('updateGame', { worldSpawnPointX: value.x, worldSpawnPointY: value.y })
    }
    if(window.selectorProceduralToggle.checked) {
      window.socket.emit('updateGame', { proceduralBoundaries: value })
    }
  })

  var setSelectedToGameBoundary = document.getElementById("set-selected-to-game-boundary");
  setSelectedToGameBoundary.addEventListener('click', function(){
    const value = window.game.gameBoundaries
    if(window.game.gameBoundaries.x >= 0) {
      if(window.selectorCameraToggle.checked) {
        const { x, y, width, height} = value
        const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
        window.socket.emit('updateGame', { lockCamera })
      }
      if(window.selectorSpawnToggle.checked) {
        window.socket.emit('updateGame', { worldSpawnArea: value })
      }
      if(window.selectorProceduralToggle.checked) {
        window.socket.emit('updateGame', { proceduralBoundaries: value })
      }
    }
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
    createGrid()
  }
  var createArenaButton = document.getElementById("create-arena");
  createArenaButton.onclick = (e) => {
    createArena(window.game.proceduralBoundaries)
  }
}

function createGrid() {
  const { width, height } = window.game.proceduralBoundaries
  const { x, y } = gridTool.snapXYToGrid(window.game.proceduralBoundaries.x, window.game.proceduralBoundaries.y);
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
  const { width, height } = window.game.proceduralBoundaries
  const { x, y } = gridTool.snapXYToGrid(window.game.proceduralBoundaries.x, window.game.proceduralBoundaries.y);
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


function sendObjectUpdate(objectUpdate) {
  let objectCopy = { ...objectUpdate }
  Object.assign(window.editingObject, objectCopy)
  Object.assign(window.objects[window.editingObject.i], objectCopy)
  window.socket.emit('editObjects', window.objects)
  window.objecteditor.set(window.editingObject)
  window.objecteditor.expandAll()
}

function update(delta) {
  input.update(delta)
}

function render(ctx) {
  camera.render(ctx)
}

export default {
  init,
  render,
  update,
}
