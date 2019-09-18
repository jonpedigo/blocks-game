const camera = {
  x: 0,
  y: 0,
}

const clickStart = {
  x: null,
  y: null,
}

const scaleMultiplier = .3

const objectFactory = []

const keysDown = {}
function init(ctx, objects) {
  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true
  }, false)

  window.addEventListener("keyup", function (e) {
     delete keysDown[e.keyCode]
  }, false)

  window.document.getElementById('game').addEventListener('click',function(e){
    if(keysDown['32']){
      console.log('x: ' + e.offsetX/scaleMultiplier, ', y: ' + e.offsetY/scaleMultiplier)
      return
    }
    if(clickStart.x && clickStart.y) {
      let nameinput = window.document.getElementById('nameinput')

      let newObject = {
        name: nameinput.value,
        width: (e.offsetX - clickStart.x)/scaleMultiplier,
        height: (e.offsetY - clickStart.y)/scaleMultiplier,
        x: clickStart.x/scaleMultiplier,
        y: clickStart.y/scaleMultiplier,
        color: '#154880 ',
        obstacle: true,
      }
      objects.unshift(newObject)
      objectFactory.unshift(newObject)
      console.log('added', JSON.stringify(newObject))
      clickStart.x = null
      clickStart.y = null

      nameinput.value = ""
    } else {
      clickStart.x = e.offsetX
      clickStart.y = e.offsetY
    }
  },false);

  window.document.getElementById('savebutton').addEventListener('click',function(e){
    console.log(objectFactory)
  })


}

function drawObject(ctx, object) {
  ctx.fillRect((object.x * scaleMultiplier) - camera.x, (object.y * scaleMultiplier) - camera.y, (object.width * scaleMultiplier), (object.height * scaleMultiplier));
}

function render(ctx) {
  for(let i = 0; i < objectFactory.length; i++){
    // drawObject(ctx, objectFactory[i])
	}
}

export default {
  init,
	drawObject,
  render,
}
