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

window.instantGridAddToggle = true
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

      if(clickToSetObjectSpawnToggle.checked) {
        let editingObject = simpleeditor.get()
        Object.assign(editingObject, {spawnPointX: click.x, spawnPointY: click.y})
        simpleeditor.set(editingObject)
        simpleeditor.expandAll()
        emitEditedObject(editingObject)
      } else {
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
        for(let tag in window.tags) {
          if(window.tags[tag].checked){
            object.tags[tag] = true
          } else {
            object.tags[tag] = false
          }
        }

        if(object.tags.obstacle) {
          let gridPos = gridTool.addObstacle(object)
          if(gridPos) {
            object.gridX = gridPos.x
            object.gridY = gridPos.y
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

      if(object.tags.obstacle) {
        let gridPos = gridTool.addObstacle(object)
        if(gridPos) {
          object.gridX = gridPos.x
          object.gridY = gridPos.y
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
      if(true) setHero(editorState)
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
      // this is what sync should mean. Does every edit send immediately?
      if(true) emitEditedObject(editorState)
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
    // this is what sync should mean. Does every edit send immediately?
    if(object.tags.obstacle == false && window.editingObject.tags.obstacle == true) {
      gridTool.removeObstacle(object)
    }
    if(object.tags.obstacle == true && window.editingObject.tags.obstacle == false) {
      let gridPos = gridTool.addObstacle(object)
      if(gridPos) {
        object.gridX = gridPos.x
        object.gridY = gridPos.y
      }
    }
    emitEditedObject(object)
  }});

  var herojsoneditor = document.createElement("div")
  herojsoneditor.id = 'herojsoneditor'
  document.getElementById('tool-'+TOOLS.HERO_EDITOR).appendChild(herojsoneditor);
  window.heroeditor = new JSONEditor(herojsoneditor, { onChangeJSON: (object) => {
    // this is what sync should mean. Does every edit send immediately?
    setHero()
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
    window.socket.emit('updateGrid', gridTool.createGrid({x: 50, y: 50}), window.gridNodeSize || 40, {x: 50, y: 50})
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
  var getHeroButton = document.getElementById("get-hero")
  getHeroButton.addEventListener('click', window.getEditingHero)
  var setHeroButton = document.getElementById("set-hero")
  setHeroButton.addEventListener('click', setHero)
  var setHeroPosButton = document.getElementById("set-hero-pos")
  setHeroPosButton.addEventListener('click', setHeroPos)
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

  function setHero() {
    let hero = heroeditor.get()
    const heroCopy = Object.assign({}, hero)
    delete heroCopy.x
    delete heroCopy.y
    window.socket.emit('updateHero', heroCopy)
  }
  function setHeroPos() {
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
  window.clickToSetObjectSpawnToggle = document.getElementById('click-to-set-spawn-object')

  var saveObjects = document.getElementById("save-factory");
  saveObjects.addEventListener('click', function(e){
    window.socket.emit('addObjects', window.objectFactory)
    window.objectFactory = []
  })

  window.instantGridAddToggle = document.getElementById("instant-grid-add")
  window.instantAddToggle = document.getElementById("instant-add")
  window.instantGridAddToggle.checked = true;

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

  window.createGrid = function() {
    if(!window.gridSize.x || !window.gridSize.x || !window.gridNodeSize) return
    const { width, height } = window.preferences.proceduralBoundaries
    const { x, y } = gridTool.snapXYToGrid(window.preferences.proceduralBoundaries.x, window.preferences.proceduralBoundaries.y);
    let w = Math.floor(width / (window.gridNodeSize))
    let h = Math.floor(height / (window.gridNodeSize))

    let gridSize = { x: w, y: h };
    let grid = gridTool.createGrid(gridSize, window.gridNodeSize, { x, y })
    window.socket.emit('updateGrid', grid, window.gridNodeSize, gridSize)
  }

  function createMaze() {
    const { width, height } = window.preferences.proceduralBoundaries
    const { x, y } = gridTool.snapXYToGrid(window.preferences.proceduralBoundaries.x, window.preferences.proceduralBoundaries.y);
    let w = Math.floor(width / (window.gridNodeSize * window.mazeWidthMultiplier)/2)
    let h = Math.floor(height / (window.gridNodeSize * window.mazeWidthMultiplier)/2)

    let maze = procedural.genMaze(w, h, x, y)
    window.socket.emit('addObjects', maze)
  }


  /////////////////////
  // GAME FEEL BUTTONS (OLD)
  /////////////////////
  /////////////////////
  // var setPresetWorldArenaBoundaryButton = document.getElementById("set-preset-world-arenaboundary");
  // setPresetWorldArenaBoundaryButton.addEventListener('click', setPresetWorldArenaBoundary)
  // var setPresetWorldArenaCyclicalButton = document.getElementById("set-preset-world-arenacyclical");
  // setPresetWorldArenaCyclicalButton.addEventListener('click', setPresetWorldArenaCyclical)
  // var setPresetWorldArenaCyclicalButton2 = document.getElementById("set-preset-world-arenacyclical-2");
  // setPresetWorldArenaCyclicalButton2.addEventListener('click', setPresetWorldArenaCyclical)
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
  // function setPresetWorldArenaCyclical() {
  //   const value = {
  //     width: window.CONSTANTS.PLAYER_CAMERA_WIDTH * window.preferences.zoomMultiplier,
  //     height: window.CONSTANTS.PLAYER_CAMERA_HEIGHT * window.preferences.zoomMultiplier,
  //     centerX: window.editingHero.x + window.editingHero.width/2,
  //     centerY: window.editingHero.y + window.editingHero.height/2,
  //   }
  //
  //   const {centerY, centerX, width, height} = value;
  //   const lockCamera = { x: centerX - width/2, y: centerY - height/2, height, width, centerX , centerY, limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
  //   window.socket.emit('updatePreferences', { lockCamera: lockCamera, gameBoundaries: lockCamera })
  // }
  //
  // function setPresetWorldAdventureZoomed() {
  //   window.socket.emit('updatePreferences', { lockCamera: {}, gameBoundaries: {}, zoomMultiplier: 1 })
  // }
}

// function createArena() {
//   let boundaries = {x: window.editingHero.x - (window.CONSTANTS.PLAYER_CAMERA_WIDTH * window.preferences.zoomMultiplier)/2 + window.editingHero.width/2, y: window.editingHero.y - (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * window.preferences.zoomMultiplier)/2 + window.editingHero.height/2, width: (window.CONSTANTS.PLAYER_CAMERA_WIDTH * window.preferences.zoomMultiplier), height: (window.CONSTANTS.PLAYER_CAMERA_HEIGHT * window.preferences.zoomMultiplier)}
//
//   let wallLeft = {
//     id: 'wall-l' + Date.now(),
//     width: 5,
//     height: boundaries.height,
//     x: boundaries.x,
//     y: boundaries.y,
//     color: 'white',
//     tags: {'obstacle':true},
//   }
//
//   let wallTop = {
//     id: 'wall-t' + Date.now(),
//     width: boundaries.width,
//     height: 5,
//     x: boundaries.x,
//     y: boundaries.y,
//     color: 'white',
//     tags: {'obstacle':true},
//   }
//
//   let wallRight = {
//     id: 'wall-r' + Date.now(),
//     width: 5,
//     height: boundaries.height,
//     x: boundaries.x + (boundaries.width) - 5,
//     y: boundaries.y,
//     color: 'white',
//     tags: {'obstacle':true},
//   }
//
//   let wallBottom = {
//     id: 'wall-b' + Date.now(),
//     width: boundaries.width,
//     height: 5,
//     x: boundaries.x,
//     y: boundaries.y + (boundaries.height) - 5,
//     color: 'white',
//     tags: {'obstacle':true},
//   }
//
//   window.socket.emit('addObjects', [wallTop, wallRight, wallLeft, wallBottom])
// }

function emitEditedObject(object) {
  let objectCopy = {...object}
  delete objectCopy.x
  delete objectCopy.y
  delete objectCopy.velocityX
  delete objectCopy.velocityY
  Object.assign(window.editingObject, objectCopy)
  Object.assign(window.objects[window.editingObject.i], objectCopy)
  window.socket.emit('editObjects', window.objects)
}

export default {
  init,
  render: camera.render,
  update: input.update
}
