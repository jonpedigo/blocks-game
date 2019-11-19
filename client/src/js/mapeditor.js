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
  SET_CAMERA_LOCK: 'setCameraLock',
  ADD_OBJECT: 'addObject',
}

let currentTool = TOOLS.SET_CAMERA_LOCK;

let scaleMultiplier = .3

let objectFactory = []
let editor = null
let editorState = {
  factory: objectFactory,
  world: [],
}

let tools = {
  setCameraLock: {
    onSecondClick: (e) => {
      //translate
      const value = {
        width: (e.offsetX - clickStart.x + camera.x)/scaleMultiplier,
        height: (e.offsetY - clickStart.y + camera.y)/scaleMultiplier,
        x: clickStart.x/scaleMultiplier,
        y: clickStart.y/scaleMultiplier,
      }
      const lockCamera = { centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: value.width/2, limitY: value.height/2 };
      window.socket.emit('updatePreferences', { lockCamera })
    },
  },
  addObject : {
    onSecondClick: (e) => {
      let nameinput = window.document.getElementById('nameinput')

      let newObject = {
        name: nameinput.value,
        width: (e.offsetX - clickStart.x + camera.x)/scaleMultiplier,
        height: (e.offsetY - clickStart.y + camera.y)/scaleMultiplier,
        x: clickStart.x/scaleMultiplier,
        y: clickStart.y/scaleMultiplier,
        color: 'white',
        obstacle: true,
      }
      // objects.unshift(newObject)
      editorState = editor.get()
      editorState.factory.push(newObject)
      editor.set(editorState)
      objectFactory.push(newObject)

      // console.log('added', JSON.stringify(newObject))
      nameinput.value = ""
    }
  }
}

function init(ctx, objects, jsonEditor) {
  editor = jsonEditor
  editor.set({world: objects, factory: objectFactory});

  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true
    if(e.keyCode === 81) {
      scaleMultiplier += .1
    }
    if(e.keyCode === 65) {
      scaleMultiplier -= .1
    }
    if(e.keyCode === 13) {
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
      if(tools[currentTool].onSecondClick) tools[currentTool].onSecondClick(e)
      clickStart.x = null
      clickStart.y = null
    } else {
      // first click
      clickStart.x = (e.offsetX + camera.x)
      clickStart.y = (e.offsetY + camera.y)
    }
  },false);

  window.document.getElementById('savebutton').addEventListener('click',function(e){
    editorState = editor.get()
    window.socket.emit('addObjects', editorState.factory)
    editorState.factory = []
    objectFactory = []
  })

  window.socket.on('onAddObjects', (objectsAdded) => {
    editorState.world = objectsAdded
    editor.set(editorState)
  })
}

function drawObject(ctx, object) {
  if(object.color) ctx.fillStyle = object.color
  ctx.fillRect((object.x * scaleMultiplier) - camera.x, (object.y * scaleMultiplier) - camera.y, (object.width * scaleMultiplier), (object.height * scaleMultiplier));
}

function drawBorder(ctx, object, thickness = 2) {
  ctx.fillRect(((object.x * scaleMultiplier) - camera.x) - (thickness), ((object.y * scaleMultiplier) - camera.y) - (thickness), (object.width * scaleMultiplier) + (thickness * 2), (object.height * scaleMultiplier) + (thickness * 2));
  ctx.fillStyle='#000';
  drawObject(ctx, object)
}

function render(ctx, hero, objects) {
  //reset background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if(clickStart.x && currentTool === TOOLS.SET_CAMERA_LOCK) {
    let possibleBox = { x: (clickStart.x/scaleMultiplier), y: (clickStart.y/scaleMultiplier), width: mousePos.x - (clickStart.x/scaleMultiplier), height: mousePos.y - (clickStart.y/scaleMultiplier)}
    if(possibleBox.width >= window.CONSTANTS.PLAYER_CANVAS_WIDTH && possibleBox.height >= window.CONSTANTS.PLAYER_CANVAS_HEIGHT) ctx.fillStyle = '#FFF'
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

}

function update(delta) {
  setCamera()
}

function setCamera() {
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

function onChangeEditorState (state) {
  objectFactory = state.factory;
  editorState.factory = state.factory
}

export default {
  init,
	drawObject,
  update,
  render,
  setCamera,
  onChangeEditorState
}
