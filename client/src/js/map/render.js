import chat from './chat.js'
import feedback from './feedback.js'
import drawTools from '../mapeditor/drawTools.js'

function drawNameCenter(ctx, object, camera) {
  ctx.fillStyle = "rgb(250, 250, 250)";
  let fontSize = 20*(camera.multiplier)
  if(fontSize < 12) fontSize = 12
  ctx.font = `${fontSize}px Courier New`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  let lineWidth = (object.width - fontSize)*camera.multiplier
  let { width, height } = window.measureWrapText(ctx, object.name, 0, 0, lineWidth, fontSize)
  window.wrapText(ctx, object.name, (object.x+(object.width/2))*camera.multiplier - camera.x, ((object.y+(object.height/2))*camera.multiplier - camera.y - (height/2)), lineWidth, fontSize)
}

function drawNameAbove(ctx, object, camera) {
  ctx.fillStyle = "rgb(250, 250, 250)";
  let fontSize = 20*(camera.multiplier)
  if(fontSize < 12) fontSize = 12
  ctx.font = `${fontSize}px Courier New`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  let lineWidth = (object.width - fontSize)*camera.multiplier
  let { width, height } = window.measureWrapText(ctx, object.name, 0, 0, lineWidth, fontSize)
  window.wrapText(ctx, object.name, (object.x + (object.width/2))*camera.multiplier - camera.x, object.y*camera.multiplier - camera.y - height, lineWidth, fontSize)
}

function drawObject(ctx, object, withNames = false) {
  if(object.color) ctx.fillStyle = object.color
  ctx.fillRect((object.x*camera.multiplier - camera.x), (object.y*camera.multiplier - camera.y), (object.width*camera.multiplier), (object.height*camera.multiplier));
  // ctx.fillStyle = 'white';
  if(withNames) {
    drawName(ctx, object)
  }
}

function update() {
  //set camera so we render everything in the right place
  camera.set(ctx, window.hero)

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'none';

  ctx.filter = "drop-shadow(4px 4px 8px #fff)";
  ctx.filter = "none"

  //reset background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);


  w.game.objects.forEach((object) => {
    drawTools.drawObject(ctx, object, camera)
  })

  for(var heroId in w.game.heros) {
    let currentHero = w.game.heros[heroId];
    drawTools.drawObject(ctx, currentHero, camera);
    if(currentHero.subObjects) {
      window.forAllSubObjects(currentHero.subObjects, (subObject) => {
        drawTools.drawObject(ctx, subObject, camera)
      })
    }
  }

  w.game.objects.forEach((obj) => {
    if(obj.name) {
      if(obj.namePosition === "center") drawNameCenter(ctx, obj, camera)
      if(obj.namePosition === "above") drawNameAbove(ctx, obj, camera)
    }
  })

  ctx.font =`24pt Arial`
	ctx.fillStyle="rgba(255,255,255,0.3)"
  ctx.fillText(Math.ceil(window.fps), window.playerCanvasWidth - 50, 40)

  if(role.isGhost) {
    ctx.font =`24pt Arial`
    ctx.fillStyle="rgba(255,255,255,0.3)"
    ctx.fillText('Ghost View Id: ' + window.hero.id, 10, 40)
  }

  chat.render(ctx);
	feedback.draw(ctx);

  if(window.hero && window.hero._interactableObject && !window.hero.flags.showChat) {
    const { _interactableObject } = window.hero

    if(_interactableObject.tags.invisible) {
      ctx.fillStyle = "rgb(255, 255, 255)";
      let text = "Press X to interact"
      ctx.textAlign = 'center'
      // ctx.textBaseline = 'alphabetic'
      ctx.font =`${18 * window.canvasMultiplier}pt Courier New`
      // console.log(window.playerCanvasWidth/2 - (200 * window.canvasMultiplier), 240 * window.canvasMultiplier)
      ctx.fillText(text, window.playerCanvasWidth/2, window.playerCanvasHeight - (36 * window.canvasMultiplier))

    } else {
      let thickness = 3
      drawTools.drawBorder(ctx, {x: _interactableObject.x-thickness, y: _interactableObject.y - thickness, width: _interactableObject.width + (thickness*2), height: _interactableObject.height + (thickness*2)}, camera, { thickness })
    }
  }
}

export default {
  update
}
