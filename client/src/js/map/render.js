import chat from './chat.js'
import feedback from './feedback.js'
import drawTools from '../mapeditor/drawTools.js'
import collisionsUtil from '../utils/collisions.js'

function drawArrow(ctx, fromx, fromy, tox, toy, options){
    var headlen = 10;

    let size = options.size
    if(!size) size = 1

    let angle = options.angle
    if(!angle) {
      angle = Math.atan2(toy-fromy,tox-fromx);
      // if(theta) angle = theta
      //starting path of the arrow from the start square to the end square and drawing the stroke
      ctx.beginPath();
      ctx.moveTo(fromx, fromy);
      ctx.lineTo(tox, toy);
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 22 * options.size;
      ctx.stroke();
    }

    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-(headlen)*Math.cos(angle-Math.PI/7),toy-(headlen)*Math.sin(angle-Math.PI/7));

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox-(headlen)*Math.cos(angle+Math.PI/7),toy-(headlen)*Math.sin(angle+Math.PI/7));

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox-(headlen)*Math.cos(angle-Math.PI/7),toy-(headlen)*Math.sin(angle-Math.PI/7));

    //draws the paths created above
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 22 * options.size;
    ctx.stroke();
    ctx.fillStyle = "#ccc";
    ctx.fill();

//     var hyp = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
// 
// ctx.save();
// ctx.translate(p1.x, p1.y);
// ctx.rotate(angle);
//
// // line
// ctx.beginPath();
// ctx.moveTo(0, 0);
// ctx.lineTo(hyp - size, 0);
// ctx.stroke();
//
// // triangle
// ctx.fillStyle = 'blue';
// ctx.beginPath();
// ctx.lineTo(hyp - size, size);
// ctx.lineTo(hyp, 0);
// ctx.lineTo(hyp - size, -size);
// ctx.fill();
//
// ctx.restore();
}

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

function update(camera) {
  const { ctx, canvas } = MAP
  if(PAGE.loadingGame) return
  const clientHero = GAME.heros[HERO.id].mod()

  // ctx.shadowBlur = 0;
  // ctx.shadowColor = 'none';
  // ctx.filter = "drop-shadow(4px 4px 8px #fff)";
  // ctx.filter = "none"

  // //reset background
  // canvas.style.backgroundColor = 'black'
  // if(GAME.world.backgroundColor && GAME.gameState.started && !MAPEDITOR.paused) {
  //   canvas.style.backgroundColor = GAME.world.backgroundColor
  // }

  let viewBoundaries = HERO.getViewBoundaries(clientHero)
  GAME.objects.forEach((object) => {
    object = object.mod()

    if(object.removed) return
    if(object.id === CONSTRUCTEDITOR.objectId) return
    if(object.tags.outline) {
      if(camera.hasHitLimit || !camera.allowOcclusion || collisionsUtil.checkObject(viewBoundaries, object)) {
        if(object.constructParts) {
          drawTools.drawConstructParts(ctx, camera, object)
        } else {
          drawTools.drawObject(ctx, object, camera)
        }
      }
    }

    if(object.subObjects) {
      OBJECTS.forAllSubObjects(object.subObjects, (subObject) => {
        if(subObject.tags.potential) return
        if(subObject.tags.removed) return
        if(!subObject.tags.outline) return
        drawTools.drawObject(ctx, subObject, camera)
      })
    }
  })

  GAME.heroList.forEach((hero) => {
    hero = hero.mod()
    if(hero.removed) return

    if(hero.tags.outline) {
      drawTools.drawObject(ctx, hero, camera);
    }

    if(hero.subObjects) {
      OBJECTS.forAllSubObjects(hero.subObjects, (subObject) => {
        if(subObject.tags.potential) return
        if(subObject.tags.removed) return
        if(!subObject.tags.outline) return
        drawTools.drawObject(ctx, subObject, camera)
      })
    }
  })

  // dont show names if we zoom to the stars
  if(!clientHero.animationZoomMultiplier) {
    GAME.objects.forEach((obj) => {
      obj = obj.mod()
      if(obj.name && !obj.removed) {
        if(obj.namePosition === "center") drawNameCenter(ctx, obj, camera)
        if(obj.namePosition === "above") drawNameAbove(ctx, obj, camera)
      }
    })
  }

  if(clientHero && clientHero.interactableObject && !clientHero.flags.showDialogue && clientHero.interactableObject.tags.outline) {
    const { interactableObject } = clientHero

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
      drawTools.drawBorder(ctx, {color: 'white', x: interactableObject.x-thickness, y: interactableObject.y - thickness, width: interactableObject.width + (thickness*2), height: interactableObject.height + (thickness*2)}, camera, { thickness })
    }
  }

  if(PAGE.role.isAdmin) {
    ctx.textAlign = 'start'
    ctx.textBaseline = 'alphabetic'
    ctx.font =`24pt Arial`
    ctx.fillStyle="rgba(255,255,255,0.3)"
    ctx.fillText(Math.ceil(PAGE.fps), MAP.canvas.width - 50, 40)
  }

  if(clientHero.navigationTargetId) {
    const { minX, maxX, minY, maxY, centerY, centerX, leftDiff, rightDiff, topDiff, bottomDiff, cameraHeight, cameraWidth } = HERO.getViewBoundaries(clientHero)

    const target = GAME.objectsById[clientHero.navigationTargetId]
    const inView = collisionsUtil.checkObject(target, {x: clientHero.x - (HERO.cameraWidth * clientHero.zoomMultiplier)/2 + clientHero.width/2, y: clientHero.y - (HERO.cameraHeight * clientHero.zoomMultiplier)/2 + clientHero.height/2, width: (HERO.cameraWidth * clientHero.zoomMultiplier), height: (HERO.cameraHeight * clientHero.zoomMultiplier)})

    if(inView) {
      drawArrow(ctx, ((target.x + target.width/2) *camera.multiplier - camera.x), ((target.y - 60) *camera.multiplier - camera.y), ((target.x + target.width/2) *camera.multiplier - camera.x), ((target.y - 20) *camera.multiplier - camera.y), { size: .2 })
    }
    const angle = window.getAngle(clientHero.x, clientHero.y, target.x, target.y )
    drawArrow(ctx, MAP.canvas.width - 100, 50, MAP.canvas.width - 100, 50, { angle, size: 1 })
  }

  return

  // chat.render(ctx);
	feedback.draw(ctx);

  // PHYSICS.draw(ctx, camera)
}

export default {
  update
}
