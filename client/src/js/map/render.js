import chat from './chat.js'
import feedback from './feedback.js'
import drawTools from '../mapeditor/drawTools.js'
import collisionsUtil from '../utils/collisions.js'

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
  const { ctx, canvas } = MAP
  let camera = MAP.camera

  //set camera so we render everything in the right place
  if(CONSTRUCTEDITOR.open) {
    camera = CONSTRUCTEDITOR.camera
  } else {
    camera.set(GAME.heros[HERO.id])
  }

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'none';

  ctx.filter = "drop-shadow(4px 4px 8px #fff)";
  ctx.filter = "none"

  //reset background
	ctx.fillStyle = 'black';
  canvas.style.backgroundColor = 'black'
  if(GAME.world.backgroundColor && GAME.gameState.started && !MAPEDITOR.paused) {
    ctx.fillStyle = GAME.world.backgroundColor
    canvas.style.backgroundColor = GAME.world.backgroundColor
  }

	ctx.fillRect(0, 0, canvas.width, canvas.height);


  let viewBoundaries = HERO.getViewBoundaries(GAME.heros[HERO.id])
  GAME.objects.forEach((object) => {
    if(object.removed) return
    if(object.id === CONSTRUCTEDITOR.objectId) return

    if(camera.hasHitLimit || !camera.allowOcclusion || collisionsUtil.checkObject(viewBoundaries, object)) {
      if(object.constructParts) {
        drawTools.drawConstructParts(ctx, camera, object)
      } else {
        drawTools.drawObject(ctx, object, camera)
      }
      if(object.subObjects) {
        OBJECTS.forAllSubObjects(object.subObjects, (subObject) => {
          if(subObject.tags.potential) return
          drawTools.drawObject(ctx, subObject, camera)
        })
      }
    }
  })

  GAME.heroList.forEach((hero) => {
    if(hero.id !== 'ghost' && !GAME.gameState.started && !MAPEDITOR.paused) {
      drawTools.drawObject(ctx, {...hero, color: 'white'}, camera);
    } else {
      drawTools.drawObject(ctx, hero, camera);
    }

    if(hero.subObjects) {
      OBJECTS.forAllSubObjects(hero.subObjects, (subObject) => {
        if(subObject.tags.potential) return
        drawTools.drawObject(ctx, subObject, camera)
      })
    }
  })

  // dont show names if we zoom to the stars
  if(!GAME.heros[HERO.id].animationZoomMultiplier) {
    GAME.objects.forEach((obj) => {
      if(obj.name && !obj.removed) {
        if(obj.namePosition === "center") drawNameCenter(ctx, obj, camera)
        if(obj.namePosition === "above") drawNameAbove(ctx, obj, camera)
      }
    })
  }

  ctx.textAlign = 'start'
	ctx.textBaseline = 'alphabetic'
  ctx.font =`24pt Arial`
	ctx.fillStyle="rgba(255,255,255,0.3)"
  ctx.fillText(Math.ceil(PAGE.fps), MAP.canvas.width - 50, 40)

  if(PAGE.role.isGhost) {
    ctx.font =`24pt Arial`
    ctx.fillStyle="rgba(255,255,255,0.3)"
    ctx.fillText('Ghost View Id: ' + HERO.id, 10, 40)
  }

  chat.render(ctx);
	feedback.draw(ctx);

  if(GAME.heros[HERO.id] && GAME.heros[HERO.id].interactableObject && !GAME.heros[HERO.id].flags.showDialogue) {
    const { interactableObject } = GAME.heros[HERO.id]

    if(interactableObject.tags.invisible) {
      ctx.fillStyle = "rgb(255, 255, 255)";
      let text = "Press X to interact"
      ctx.textAlign = 'center'
      // ctx.textBaseline = 'alphabetic'
      ctx.font =`${18 * MAP.canvasMultiplier}pt Courier New`
      // console.log(MAP.canvas.width/2 - (200 * MAP.canvasMultiplier), 240 * MAP.canvasMultiplier)
      ctx.fillText(text, MAP.canvas.width/2, MAP.canvas.height - (36 * MAP.canvasMultiplier))
    } else {
      let thickness = 3
      drawTools.drawBorder(ctx, {x: interactableObject.x-thickness, y: interactableObject.y - thickness, width: interactableObject.width + (thickness*2), height: interactableObject.height + (thickness*2)}, camera, { thickness })
    }
  }

  // PHYSICS.draw(ctx, camera)
}

export default {
  update
}
