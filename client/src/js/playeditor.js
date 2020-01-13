import JSONEditor from 'jsoneditor'
import collisions from './collisions'

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
  CAMERA_LOCK: 'cameraLock',
  ADD_OBJECT: 'addObject',
  EDITOR: 'editor',
}

let currentTool = TOOLS.CAMERA_LOCK;

let scaleMultiplier = .3

let objectFactory = []
let editor = null
let editorState = {
  factory: objectFactory,
  world: [],
  hero: {},
}

let tags = {
  obstacle: true,
  monster: false,
}

let tools = {
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
  [TOOLS.CAMERA_LOCK]: {
    onSecondClick: (e) => {
      //translate
      const value = {
        width: (e.offsetX - clickStart.x + camera.x)/scaleMultiplier,
        height: (e.offsetY - clickStart.y + camera.y)/scaleMultiplier,
        x: clickStart.x/scaleMultiplier,
        y: clickStart.y/scaleMultiplier,
      }
      const lockCamera = { centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      window.socket.emit('updatePreferences', { lockCamera })
    },
  },
  [TOOLS.ADD_OBJECT] : {
    onSecondClick: (e) => {
      let newObject = {
        id: 'object' + Date.now(),
        width: (e.offsetX - clickStart.x + camera.x)/scaleMultiplier,
        height: (e.offsetY - clickStart.y + camera.y)/scaleMultiplier,
        x: clickStart.x/scaleMultiplier,
        y: clickStart.y/scaleMultiplier,
        color: 'white',
        tags: [],
      }

      for(let tag in tags) {
        if(tags[tag].checked){
          newObject.tags.push(tag)
        }
      }
      // objects.unshift(newObject)
      editorState = editor.get()
      editorState.factory.push(newObject)
      editor.set(editorState)
      objectFactory.push(newObject)

      // console.log('added', JSON.stringify(newObject))
    }
  }
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

  var saveObjects = document.getElementById("save-factory");
  saveObjects.addEventListener('click', function(e){
    editorState = editor.get()
    window.socket.emit('addObjects', editorState.factory)
    editorState.factory = []
    objectFactory = []
    editor.update(editorState)
  })

  var clearcameralock = document.getElementById("clear-camera-lock")
  clearcameralock.addEventListener('click', (e) => {
    window.socket.emit('updatePreferences', { lockCamera: {} })
  })

  function getHero() {
    let editorState = editor.get()
    editorState.hero = { ...window.hero }
    editor.update(editorState)
  }

  function setPresetMario() {
    let editorState = editor.get()
    editorState.hero.gravity = 20
    editorState.hero.jumpVelocity = -500
    editorState.hero.velocityMax = 500
    editor.set(editorState)
    setHero()
  }

  function setPresetZelda() {
    let editorState = editor.get()
    editorState.hero.gravity = 0
    editor.set(editorState)
    setHero()
  }

  function setPresetAsteroids() {
    let editorState = editor.get()
    editorState.hero.gravity = 0
    editorState.hero.inputControlProp = 'velocity'
    editorState.hero.velocityMax = 400

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

  function resetHeroPos() {
    window.socket.emit('updateHero', { x: 0, y: 0})
  }
  window.socket.on('onResetObjects', () => {
    let editorState = editor.get()
    editorState.factory = []
    editorState.world = []
    objectFactory = []
    window.objects = []
    editor.set(editorState)
  })


  function resetObjects() {
    window.socket.emit('resetObjects')
  }

  function findHero() {
    setCamera(ctx, hero)
  }

  var getHeroButton = document.getElementById("get-hero")
  getHeroButton.addEventListener('click', getHero)
  var setHeroButton = document.getElementById("set-hero")
  setHeroButton.addEventListener('click', setHero)
  var setHeroPosButton = document.getElementById("set-hero-pos")
  setHeroPosButton.addEventListener('click', setHeroPos)
  var findHeroButton = document.getElementById("find-hero");
  findHeroButton.addEventListener('click', findHero)
  var resetHeroButton = document.getElementById("reset-hero-pos");
  resetHeroButton.addEventListener('click', resetHeroPos)
  var resetObjectsButton = document.getElementById("reset-objects");
  resetObjectsButton.addEventListener('click', resetObjects)
  var setPresetAsteroidsButton = document.getElementById("set-preset-asteroids");
  setPresetAsteroidsButton.addEventListener('click', setPresetAsteroids)
  var setPresetZeldaButton = document.getElementById("set-preset-zelda");
  setPresetZeldaButton.addEventListener('click', setPresetZelda)
  var setPresetMarioButton = document.getElementById("set-preset-mario");
  setPresetMarioButton.addEventListener('click', setPresetMario)

	var jsoneditor = document.createElement("div")
	jsoneditor.id = 'jsoneditor'
	document.getElementById('tool-'+TOOLS.EDITOR).appendChild(jsoneditor);
  editor = new JSONEditor(jsoneditor, { onChangeJSON: (state) => {
		window.socket.emit('updateObjects', state.world)
    objectFactory = state.factory
    editorState.factory = state.factory
	}});
  editor.set({world: objects, factory: objectFactory, hero});

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

	window.socket.on('onHeroPosUpdate', (heroUpdated) => {
		Object.assign(window.hero, heroUpdated)
    if(window.preferences.syncHero) getHero()
	})

  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true

    // q and a zoom in and out
    if(e.keyCode === 81) {
      scaleMultiplier += .1
    }
    if(e.keyCode === 65) {
      scaleMultiplier -= .1
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
        clickStart.x = (e.offsetX + camera.x)
        clickStart.y = (e.offsetY + camera.y)
      }
    }
  },false);

  window.socket.on('onAddObjects', (objectsAdded) => {
    window.objects.push(objectsAdded)
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
  })
  window.socket.emit('askObjects')
}

function drawName(ctx, object){
	ctx.fillStyle = "rgb(0, 0, 250)";
	ctx.font = "12px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText(object.id ? object.id : '', (object.x * scaleMultiplier) - camera.x, (object.y * scaleMultiplier) - camera.y);
  ctx.fillStyle = "#FFF";
}

function drawObject(ctx, object, withNames = true) {
  if(object.color) ctx.fillStyle = object.color
  ctx.fillRect((object.x * scaleMultiplier) - camera.x, (object.y * scaleMultiplier) - camera.y, (object.width * scaleMultiplier), (object.height * scaleMultiplier));

  if(withNames) {
    drawName(ctx, object)
  }
}

function drawBorder(ctx, object, thickness = 2) {
  let xBorderThickness = thickness;
  let yBorderThickness = thickness;
  if(object.width < 0) {
    xBorderThickness *= -1;
  }
  if(object.height < 0) {
    yBorderThickness *= -1;
  }
  ctx.fillRect(((object.x * scaleMultiplier) - camera.x) - (xBorderThickness), ((object.y * scaleMultiplier) - camera.y) - (yBorderThickness), (object.width * scaleMultiplier) + (xBorderThickness * 2), (object.height * scaleMultiplier) + (yBorderThickness * 2));
  ctx.fillStyle='#000';
  drawObject(ctx, object)
}

function render(ctx, hero, objects) {
  //reset background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = 'blue'

  if(clickStart.x && currentTool === TOOLS.CAMERA_LOCK) {
    let possibleBox = { x: (clickStart.x/scaleMultiplier), y: (clickStart.y/scaleMultiplier), width: mousePos.x - (clickStart.x/scaleMultiplier), height: mousePos.y - (clickStart.y/scaleMultiplier)}
    if(Math.abs(possibleBox.width) >= window.CONSTANTS.PLAYER_CANVAS_WIDTH && Math.abs(possibleBox.height) >= window.CONSTANTS.PLAYER_CANVAS_HEIGHT) ctx.fillStyle = '#FFF'
    else ctx.fillStyle = 'red'
    drawBorder(ctx, possibleBox)
  }

	ctx.fillStyle = 'white';
	for(let i = 0; i < objects.length; i++){
    drawObject(ctx, objects[i])
    ctx.fillStyle = 'white';
	}
  for(let i = 0; i < objectFactory.length; i++){
    drawObject(ctx, objectFactory[i])
    ctx.fillStyle = 'white';
  }
  drawObject(ctx, hero);

  if(clickStart.x && currentTool === TOOLS.ADD_OBJECT) {
    drawObject(ctx, { x: (clickStart.x/scaleMultiplier), y: (clickStart.y/scaleMultiplier), width: mousePos.x - (clickStart.x/scaleMultiplier), height: mousePos.y - (clickStart.y/scaleMultiplier)})
  }

  if(window.preferences.lockCamera) {
    let { centerX, centerY, limitX, limitY } = window.preferences.lockCamera;
    const area = {
      x: centerX - limitX,
      y: centerY - limitY,
      width: limitX * 2,
      height: limitY * 2,
    }
    ctx.globalAlpha = 0.2;
    drawObject(ctx, area);
    ctx.globalAlpha = 1.0;
  }

  drawObject(ctx, {x: window.hero.spawnPointX, y: window.hero.spawnPointY - 205, width: 5, height: 400})
  drawObject(ctx, {x: window.hero.spawnPointX - 205, y: window.hero.spawnPointY, width: 400, height: 5})
}

function update(delta) {
  if (38 in keysDown) { // Player holding up
    camera.y -= (1/scaleMultiplier)
  }
  if (40 in keysDown) { // Player holding down
    camera.y += (1/scaleMultiplier)
  }
  if (37 in keysDown) { // Player holding left
    camera.x -= (1/scaleMultiplier)
  }
  if (39 in keysDown) { // Player holding right
    camera.x += (1/scaleMultiplier)
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
