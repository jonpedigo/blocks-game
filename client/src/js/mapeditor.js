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

let scaleMultiplier = .3

let objectFactory = []
let editor = null
let editorState = {
  factory: objectFactory,
  world: [],
}
const keysDown = {}
function init(ctx, objects, editor) {
  editor.set({world: objects, factory: objectFactory});

  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true
    if(e.keyCode === 81) {
      scaleMultiplier += .1
    }
    if(e.keyCode === 65) {
      scaleMultiplier -= .1
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

      console.log('added', JSON.stringify(newObject))
      clickStart.x = null
      clickStart.y = null

      nameinput.value = ""
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

function render(ctx, hero, objects) {
  //reset background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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

  if(clickStart.x) {
    drawObject(ctx, { x: (clickStart.x/scaleMultiplier), y: (clickStart.y/scaleMultiplier), width: mousePos.x - (clickStart.x/scaleMultiplier), height: mousePos.y - (clickStart.y/scaleMultiplier)})
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
