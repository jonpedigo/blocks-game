import JSONEditor from 'jsoneditor'
import collisions from './collisions'
import gridTool from './grid.js'
import procedural from './procedural.js'

const camera = {
  x: 0,
  y: 0,
}

const clickStart = {
  x: null,
  y: null,
}

const mousePos = {
  x: null,
  y: null,
}

const keysDown = {}

const TOOLS = {
  ADD_OBJECT: 'addObject',
  AREA_SELECTOR: 'areaSelector',
  EDITOR: 'editor',
  SIMPLE_EDITOR: 'simpleEditor',
  GAME_FEEL: 'gameFeel',
  PROCEDURAL: 'procedural',
}

let currentTool = TOOLS.ADD_OBJECT;

let scaleMultiplier = .3

let objectFactory = []
let editor = null
let editorState = {
  factory: objectFactory,
  world: [],
  hero: {},
}

let simpleeditor = null

let tags = {
  obstacle: true,
  monster: false,
  coin: false,
}
window.tags = tags

let editingObject = {
  i: null,
  id: null,
}
let tools = {
  [TOOLS.SIMPLE_EDITOR]: {
    onFirstClick: (e) => {
      const click = {
        x: (e.offsetX + camera.x)/scaleMultiplier,
        y: (e.offsetY + camera.y)/scaleMultiplier,
        width: 1,
        height: 1,
      }

      window.objects
      .forEach((object, i) => {
        collisions.checkObject(click, object, () => {
          simpleeditor.set(Object.assign({}, object))
          simpleeditor.expandAll()
          editingObject = {
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
        x: (e.offsetX + camera.x)/scaleMultiplier,
        y: (e.offsetY + camera.y)/scaleMultiplier,
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
          x: (e.offsetX + camera.x)/scaleMultiplier,
          y: (e.offsetY + camera.y)/scaleMultiplier,
        }

        window.socket.emit('updateHero', {spawnPointX: click.x, spawnPointY: click.y})
      } else {
        defaultFirstClick(e)
      }
    },
    onSecondClick: (e) => {
      //translate
      const value = {
        width: (e.offsetX - clickStart.x + camera.x)/scaleMultiplier,
        height: (e.offsetY - clickStart.y + camera.y)/scaleMultiplier,
        x: clickStart.x/scaleMultiplier,
        y: clickStart.y/scaleMultiplier,
      }

      const {x, y, width, height} = value;
      if(currentTool === TOOLS.PROCEDURAL) {
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
          x: (e.offsetX + camera.x)/scaleMultiplier,
          y: (e.offsetY + camera.y)/scaleMultiplier,
        }
        let object = gridTool.createGridNodeAt(click.x, click.y)
        object.tags = {}
        object.id = 'object' + Date.now()
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
        width: (e.offsetX - clickStart.x + camera.x)/scaleMultiplier,
        height: (e.offsetY - clickStart.y + camera.y)/scaleMultiplier,
        x: clickStart.x/scaleMultiplier,
        y: clickStart.y/scaleMultiplier,
        color: 'white',
        tags: {},
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
        // objects.unshift(newObject)
        editorState = editor.get()
        editorState.factory.push(newObject)
        editor.set(editorState)
        objectFactory.push(newObject)
      }
      // console.log('added', JSON.stringify(newObject))
    },
  }
}
tools[TOOLS.PROCEDURAL] = tools[TOOLS.AREA_SELECTOR]

let instantGridAddToggle;
let instantAddToggle;
let selectorGameToggle;
let selectorProceduralToggle;
let selectorSpawnToggle;
let selectorCameraToggle;
function defaultFirstClick(e) {
  clickStart.x = (e.offsetX + camera.x)
  clickStart.y = (e.offsetY + camera.y)
}
function init(ctx, objects, hero) {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  //tool select functionality
  let toolSelectEl = document.getElementById("tool-select")
  for(var tool in TOOLS) {
    let toolName = TOOLS[tool];
    let toolEl = document.createElement('div')
    toolEl.className = 'button';
    toolEl.innerHTML = toolName
    toolEl.onclick=function() {
      console.log('current tool changed to ' + toolName)
      currentTool = toolName
      Array.from(document.getElementsByClassName("tool-feature")).forEach(e => {
        e.className = "tool-feature invisible"
      })
      document.getElementById("tool-"+toolName).className='tool-feature visible'
    }
    toolSelectEl.appendChild(toolEl)
  }

  let toolAddObjectEl = document.getElementById("tool-addObject")
  for(var tag in tags) {
    let element = document.getElementById("tag-"+tag)
    element.checked = tags[tag]
    tags[tag] = element
  }

  var jsoneditor = document.createElement("div")
  jsoneditor.id = 'jsoneditor'
  document.getElementById('tool-'+TOOLS.EDITOR).appendChild(jsoneditor);
  editor = new JSONEditor(jsoneditor, { onChangeJSON: (state) => {
    if(!syncObjectsToggle.checked) {
      window.socket.emit('editObjects', state.world)
    }
    objectFactory = state.factory
    editorState.factory = state.factory
  }});
  editor.set({world: objects, factory: objectFactory, hero});

  var simplejsoneditor = document.createElement("div")
  simplejsoneditor.id = 'simplejsoneditor'
  document.getElementById('tool-'+TOOLS.SIMPLE_EDITOR).appendChild(simplejsoneditor);
  simpleeditor = new JSONEditor(simplejsoneditor, { onChangeJSON: (object) => {
    window.objects[editingObject.i].tags = object.tags
    window.socket.emit('editObjects', window.objects)
  }});

  var getHeroButton = document.getElementById("get-hero")
  getHeroButton.addEventListener('click', getHero)
  var setHeroButton = document.getElementById("set-hero")
  setHeroButton.addEventListener('click', setHero)
  var setHeroPosButton = document.getElementById("set-hero-pos")
  setHeroPosButton.addEventListener('click', setHeroPos)
  var findHeroButton = document.getElementById("find-hero");
  findHeroButton.addEventListener('click', findHero)
  var respawnHeroButton = document.getElementById("respawn-hero");
  respawnHeroButton.addEventListener('click', respawnHero)
  var resetHeroOtherButton = document.getElementById("reset-hero-other");
  resetHeroOtherButton.addEventListener('click', resetHeroOther)
  var resetObjectsButton = document.getElementById("reset-objects");
  resetObjectsButton.addEventListener('click', resetObjects)
  var setPresetAsteroidsButton = document.getElementById("set-preset-asteroids");
  setPresetAsteroidsButton.addEventListener('click', setPresetAsteroids)
  var setPresetZeldaButton = document.getElementById("set-preset-zelda");
  setPresetZeldaButton.addEventListener('click', setPresetZelda)
  var setPresetMarioButton = document.getElementById("set-preset-mario");
  setPresetMarioButton.addEventListener('click', setPresetMario)
  var setPresetPokemonButton = document.getElementById("set-preset-pokemon");
  setPresetPokemonButton.addEventListener('click', setPresetPokemon)
  var setPresetSnakeButton = document.getElementById("set-preset-snake");
  setPresetSnakeButton.addEventListener('click', setPresetSnake)
  var setPresetWorldArenaBoundaryButton = document.getElementById("set-preset-world-arenaboundary");
  setPresetWorldArenaBoundaryButton.addEventListener('click', setPresetWorldArenaBoundary)
  var setPresetWorldArenaCyclicalButton = document.getElementById("set-preset-world-arenacyclical");
  setPresetWorldArenaCyclicalButton.addEventListener('click', setPresetWorldArenaCyclical)
  var setPresetWorldArenaCyclicalButton2 = document.getElementById("set-preset-world-arenacyclical-2");
  setPresetWorldArenaCyclicalButton2.addEventListener('click', setPresetWorldArenaCyclical)
  var setPresetWorldAdventureZoomedButton = document.getElementById("set-preset-world-adventurezoomed");
  setPresetWorldAdventureZoomedButton.addEventListener('click', setPresetWorldAdventureZoomed)
  var zoomOutButton = document.getElementById("hero-zoomOut");
  zoomOutButton.addEventListener('click', () => window.socket.emit('updatePreferences', { zoomMultiplier: window.preferences.zoomMultiplier/.9 }))
  var zoomInButton = document.getElementById("hero-zoomIn");
  zoomInButton.addEventListener('click', () => window.socket.emit('updatePreferences', { zoomMultiplier: window.preferences.zoomMultiplier/1.1 }))
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
    editorState = editor.get()
    window.socket.emit('addObjects', editorState.factory)
    editorState.factory = []
    objectFactory = []
    editor.update(editorState)
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

  function getHero() {
    let editorState = editor.get()
    editorState.hero = { ...window.hero }
    editor.update(editorState)
  }

  function setPresetMario() {
    getHero()
    let editorState = editor.get()
    editorState.hero.arrowKeysBehavior = 'position'
    editorState.hero.gravity = true
    editorState.hero.jumpVelocity = -1200/window.divideScreenSizeBy
    editorState.hero.velocityMax = 1200/window.divideScreenSizeBy
    editorState.hero.velocityX = 0

    editor.set(editorState)
    setHero()
  }

  function setPresetZelda() {
    getHero()
    let editorState = editor.get()
    editorState.hero.arrowKeysBehavior = 'position'
    editorState.hero.gravity = false
    editorState.hero.velocityY = 0
    editorState.hero.velocityX = 0

    editor.set(editorState)
    setHero()
    window.socket.emit('updateHero', heroCopy)
  }

  function setPresetAsteroids() {
    getHero()
    let editorState = editor.get()
    editorState.hero.gravity = false
    editorState.hero.arrowKeysBehavior = 'velocity'
    editorState.hero.velocityMax = 1500/window.divideScreenSizeBy

    editor.set(editorState)
    setHero()
  }

  function setPresetPokemon() {
    getHero()
    editorState.hero.arrowKeysBehavior = 'grid'
    editorState.hero.gravity = false

    editor.set(editorState)
    setHero()
    window.socket.emit('snapAllObjectsToGrid')
  }

  function setPresetSnake() {
    editorState.hero.arrowKeysBehavior = 'skating'
    editorState.hero.gravity = false

    editor.set(editorState)
    setHero()
  }

  function setHero() {
    let editorState = editor.get()
    const heroCopy = Object.assign({}, editorState.hero)
    delete heroCopy.x
    delete heroCopy.y
    window.socket.emit('updateHero', heroCopy)
  }

  function setHeroPos() {
    let editorState = editor.get()
    window.socket.emit('updateHero', { x: editorState.hero.x, y: editorState.hero.y })
  }

  function respawnHero() {
    window.socket.emit('respawnHero')
  }
  function resetHeroOther() {
    window.socket.emit('resetHero')
  }

  function resetObjects() {
    window.socket.emit('resetObjects')
  }

  function findHero() {
    setCamera(ctx, hero)
  }

  function setPresetWorldArenaBoundary() {
    const value = {
      width: window.CONSTANTS.PLAYER_CANVAS_WIDTH * window.preferences.zoomMultiplier,
      height: window.CONSTANTS.PLAYER_CANVAS_HEIGHT * window.preferences.zoomMultiplier,
      centerX: window.hero.x + window.hero.width/2,
      centerY: window.hero.y + window.hero.height/2,
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
      centerX: window.hero.x + window.hero.width/2,
      centerY: window.hero.y + window.hero.height/2,
    }

    const {centerY, centerX, width, height} = value;
    const lockCamera = { x: centerX - width/2, y: centerY - height/2, height, width, centerX , centerY, limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
    window.socket.emit('updatePreferences', { lockCamera: lockCamera, gameBoundaries: lockCamera })
  }

  function setPresetWorldAdventureZoomed() {
    window.socket.emit('updatePreferences', { lockCamera: {}, gameBoundaries: {}, zoomMultiplier: 1 })
  }


  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true

    // q and a zoom in and out
    if(e.keyCode === 81) {
      scaleMultiplier = scaleMultiplier * 1.1
    }
    if(e.keyCode === 65) {
      scaleMultiplier = scaleMultiplier * .9
    }

    //if you press escape, cancel a drag
    if(e.keyCode === 27) {
      clickStart.x = null
      clickStart.y = null
    }
  }, false)

  window.addEventListener("keyup", function (e) {
     delete keysDown[e.keyCode]
  }, false)

  window.document.getElementById('game').addEventListener("mousemove", function(e) {
    mousePos.x = ((e.offsetX + camera.x)/scaleMultiplier)
    mousePos.y = ((e.offsetY + camera.y)/scaleMultiplier)
  })

  window.document.getElementById('game').addEventListener('click',function(e){
    if(keysDown['32']){
      console.log('x: ' + e.offsetX/scaleMultiplier, ', y: ' + e.offsetY/scaleMultiplier)
      return
    }
    if(clickStart.x && clickStart.y) {
      //second click
      if(tools[currentTool].onSecondClick) tools[currentTool].onSecondClick(e)
      clickStart.x = null
      clickStart.y = null
    } else {
      // first click
      if(tools[currentTool].onFirstClick) tools[currentTool].onFirstClick(e)
      else {
        defaultFirstClick(e)
      }
    }
  },false);

  window.socket.on('onAddObjects', (objectsAdded) => {
    window.objects.push(...objectsAdded)
    let editorState = editor.get()
    editorState.world.push(...objectsAdded)
    editor.set(editorState)
  })
  window.socket.on('onUpdateObjects', (objectsUpdated) => {
    if(window.preferences.syncObjects) {
      let editorState = editor.get()
      Object.assign(editorState.world, objectsUpdated)
      editor.update(editorState)
    }
    Object.assign(window.objects, objectsUpdated)
  })
  window.socket.on('onHeroPosUpdate', (heroUpdated) => {
    Object.assign(window.hero, heroUpdated)
    if(window.preferences.syncHero) getHero()
  })
  window.socket.on('onResetObjects', () => {
    let editorState = editor.get()
    editorState.factory = []
    editorState.world = []
    objectFactory = []
    window.objects = []
    editor.set(editorState)
    window.location.reload()
  })
  window.socket.emit('askObjects')
}

function createArena() {
  let boundaries = {x: window.hero.x - (window.CONSTANTS.PLAYER_CANVAS_WIDTH * window.preferences.zoomMultiplier)/2 + window.hero.width/2, y: window.hero.y - (window.CONSTANTS.PLAYER_CANVAS_HEIGHT * window.preferences.zoomMultiplier)/2 + window.hero.height/2, width: (window.CONSTANTS.PLAYER_CANVAS_WIDTH * window.preferences.zoomMultiplier), height: (window.CONSTANTS.PLAYER_CANVAS_HEIGHT * window.preferences.zoomMultiplier)}

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


function drawName(ctx, object){
	ctx.fillStyle = "rgb(0, 0, 250)";
	ctx.font = "12px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText(object.id ? object.id : '', (object.x * scaleMultiplier) - camera.x, (object.y * scaleMultiplier) - camera.y);
}

function drawObject(ctx, object, withNames = false) {
  if(object.color) ctx.fillStyle = object.color
  ctx.fillRect((object.x * scaleMultiplier) - camera.x, (object.y * scaleMultiplier) - camera.y, (object.width * scaleMultiplier), (object.height * scaleMultiplier));

  if(withNames) {
    drawName(ctx, object)
  }
}

function drawGrid(ctx, object) {
  let thickness = .3
  if(object.x % (window.gridNodeSize * 10) === 0 && object.y % (window.gridNodeSize * 10) === 0) {
    thickness = .8
  }
  ctx.strokeStyle = "#999";
  drawBorder(ctx, object, thickness)
}

function drawBorder(ctx, object, thickness = 2) {
  ctx.lineWidth = thickness;
  // ctx.fillRect(((object.x * scaleMultiplier) - camera.x) - (xBorderThickness), ((object.y * scaleMultiplier) - camera.y) - (yBorderThickness), (object.width * scaleMultiplier) + (xBorderThickness * 2), (object.height * scaleMultiplier) + (yBorderThickness * 2));
  [({a:{x:object.x,y:object.y}, b:{x:object.x + object.width,y:object.y}}),
  ({a:{x:object.x + object.width,y:object.y}, b:{x:object.x + object.width,y:object.y + object.height}}),
  ({a:{x:object.x + object.width,y:object.y + object.height}, b:{x:object.x,y:object.y + object.height}}),
  ({a:{x:object.x,y:object.y + object.height}, b:{x:object.x,y:object.y}})].forEach((vertice) => {
    drawVertice(ctx, vertice)
  })
}

function drawVertice(ctx, vertice) {
  ctx.beginPath();
  ctx.moveTo( (vertice.a.x * scaleMultiplier - camera.x), (vertice.a.y * scaleMultiplier - camera.y));
  ctx.lineTo( (vertice.b.x * scaleMultiplier - camera.x), (vertice.b.y * scaleMultiplier - camera.y));
  ctx.stroke();
}

function render(ctx, hero, objects) {
  //reset background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if(window.grid) {
    gridTool.forEach((grid) => {
      drawGrid(ctx, grid)
    })
  }

	ctx.fillStyle = 'white';
	for(let i = 0; i < objects.length; i++){
    drawObject(ctx, objects[i])
	}
  for(let i = 0; i < objectFactory.length; i++){
    drawObject(ctx, objectFactory[i])
  }

  drawObject(ctx, hero);

  if(clickStart.x && currentTool === TOOLS.ADD_OBJECT) {
    drawObject(ctx, { x: (clickStart.x/scaleMultiplier), y: (clickStart.y/scaleMultiplier), width: mousePos.x - (clickStart.x/scaleMultiplier), height: mousePos.y - (clickStart.y/scaleMultiplier)})
  }

  if(window.preferences.lockCamera) {
    ctx.strokeStyle='#0A0';
    drawBorder(ctx, {x: window.hero.x - (window.CONSTANTS.PLAYER_CANVAS_WIDTH * window.preferences.zoomMultiplier)/2 + window.hero.width/2, y: window.hero.y - (window.CONSTANTS.PLAYER_CANVAS_HEIGHT * window.preferences.zoomMultiplier)/2 + window.hero.height/2, width: (window.CONSTANTS.PLAYER_CANVAS_WIDTH * window.preferences.zoomMultiplier), height: (window.CONSTANTS.PLAYER_CANVAS_HEIGHT * window.preferences.zoomMultiplier)})
  }

  if(clickStart.x && currentTool === TOOLS.AREA_SELECTOR) {
    ctx.strokeStyle = '#FFF'
    let possibleBox = { x: (clickStart.x/scaleMultiplier), y: (clickStart.y/scaleMultiplier), width: mousePos.x - (clickStart.x/scaleMultiplier), height: mousePos.y - (clickStart.y/scaleMultiplier)}
    if(Math.abs(possibleBox.width) >= window.CONSTANTS.PLAYER_CANVAS_WIDTH && Math.abs(possibleBox.height) >= window.CONSTANTS.PLAYER_CANVAS_HEIGHT) ctx.strokeStyle = '#FFF'
    else ctx.strokeStyle = 'red'
    drawBorder(ctx, possibleBox)
  }

  if(window.preferences.lockCamera) {
    ctx.fillStyle='#0A0';
    ctx.globalAlpha = 0.2;
    drawObject(ctx, window.preferences.lockCamera);
    ctx.globalAlpha = 1.0;
  }

  if(window.preferences.gameBoundaries) {
    ctx.fillStyle='white';
    ctx.globalAlpha = 0.2;
    drawObject(ctx, window.preferences.gameBoundaries);
    ctx.globalAlpha = 1.0;
  }

  if(currentTool == TOOLS.PROCEDURAL && window.preferences.proceduralBoundaries) {
    ctx.fillStyle='yellow';
    ctx.globalAlpha = 0.2;
    drawObject(ctx, window.preferences.proceduralBoundaries);
    ctx.globalAlpha = 1.0;
  }

  if(window.hero.reachablePlatformHeight && window.hero.gravity) {
    let y = (window.hero.y + window.hero.height)
    let x = window.hero.x - window.hero.reachablePlatformWidth
    let width = (window.hero.reachablePlatformWidth * 2) + (window.hero.width)
    let height = window.hero.reachablePlatformHeight
    let color = 'rgba(50, 255, 50, 0.5)'

    drawObject(ctx, {x, y, width, height, color})
  }

  drawObject(ctx, {x: window.hero.spawnPointX, y: window.hero.spawnPointY - 205, width: 5, height: 400, color: 'white'})
  drawObject(ctx, {x: window.hero.spawnPointX - 205, y: window.hero.spawnPointY, width: 400, height: 5, color: 'white'})
}

function update(delta) {
  if (38 in keysDown) { // Player holding up
    camera.y -= (40 * scaleMultiplier)
  }
  if (40 in keysDown) { // Player holding down
    camera.y += (40 * scaleMultiplier)
  }
  if (37 in keysDown) { // Player holding left
    camera.x -= (40 * scaleMultiplier)
  }
  if (39 in keysDown) { // Player holding right
    camera.x += (40 * scaleMultiplier)
  }
}

function setCameraHeroX(ctx, hero) {
  camera.x = ((hero.x + hero.width/2) * scaleMultiplier) - ctx.canvas.width/2
}
function setCameraHeroY(ctx, hero) {
  camera.y = ((hero.y + hero.height/2) * scaleMultiplier) - ctx.canvas.height/2
}
function setCamera(ctx, hero) {
  setCameraHeroX(ctx, hero)
  setCameraHeroY(ctx, hero)
}

export default {
  init,
  update,
  render,
}
