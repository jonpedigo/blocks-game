import camera from './camera.js'
import chat from './chat.js'
import feedback from './feedback.js'
import drawTools from './mapeditor/drawTools.js'

function update() {
  //set camera so we render everything in the right place
  camera.set(ctx, window.hero)

  let tempCamera = JSON.parse(JSON.stringify(camera.get()))
  tempCamera.multiplier = 1/tempCamera.multiplier

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'none';

  ctx.filter = "drop-shadow(4px 4px 8px #fff)";
  ctx.filter = "none"
  let vertices = [...w.game.objects].reduce((prev, object) => {
    if(object.removed) return prev
    if(object.tags.filled) return prev
    if(object.tags.invisible) return prev
    let extraProps = {}
    if(object.tags.glowing) {
      extraProps.glow = 3
      extraProps.thickness = 2
      extraProps.color = 'white'
    }
    if(object.color) extraProps.color = object.color
		prev.push({a:{x:object.x,y:object.y}, b:{x:object.x + object.width,y:object.y}, ...extraProps})
		prev.push({a:{x:object.x + object.width,y:object.y}, b:{x:object.x + object.width,y:object.y + object.height}, ...extraProps})
		prev.push({a:{x:object.x + object.width,y:object.y + object.height}, b:{x:object.x,y:object.y + object.height}, ...extraProps})
		prev.push({a:{x:object.x,y:object.y + object.height}, b:{x:object.x,y:object.y}, ...extraProps})
		return prev
	}, [])

  //reset background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);


	w.game.world.renderStyle = 'outlines'
 	if (w.game.world.renderStyle === 'outlines') {
		ctx.strokeStyle = "#999";
		for(var i=0;i<vertices.length;i++){
			camera.drawVertice(ctx, vertices[i])
		}
		ctx.fillStyle = 'white';
		camera.drawObject(ctx, window.hero)
    for(let i = 0; i < w.game.objects.length; i++){
      if(!w.game.objects[i].tags.filled) continue
      if(w.game.objects[i].removed) continue
      if(w.game.objects[i].tags.invisible) continue
      camera.drawObject(ctx, w.game.objects[i])
    }
	} else if(w.game.world.renderStyle === 'physics'){
		physics.drawSystem(ctx, vertices)
	} else {
		for(let i = 0; i < w.game.objects.length; i++){
      if(w.game.objects[i].removed) continue
      if(w.game.objects[i].tags.invisible) continue
			camera.drawObject(ctx, w.game.objects[i])
		}
	}

  for(var heroId in w.game.heros) {
    if(heroId === window.hero.id) continue;
    let currentHero = w.game.heros[heroId];
    camera.drawObject(ctx, currentHero);
  }

  w.game.world.shadows = false
  if(w.game.world.shadows === true) {
    shadow.draw(ctx, vertices, hero)
  }

  w.game.objects.forEach((obj) => {
    if(obj.name) {
      if(obj.namePosition === "center") camera.drawNameCenter(ctx, obj)
      if(obj.namePosition === "above") camera.drawNameAbove(ctx, obj)
    }
  })

  ctx.font =`24pt Arial`
	ctx.fillStyle="rgba(255,255,255,0.3)"
  ctx.fillText(Math.ceil(window.fps), window.CONSTANTS.PLAYER_CANVAS_WIDTH - 50, 40)

  if(window.ghost) {
    ctx.font =`24pt Arial`
    ctx.fillStyle="rgba(255,255,255,0.3)"
    ctx.fillText('Ghost View Id: ' + window.hero.id, 10, 40)
  }

  chat.render(ctx);
	feedback.draw(ctx);

  if(window.hero && window.hero._interactableObject && !window.hero.flags.showChat) {
    ctx.fillStyle = "rgb(255, 255, 255)";
    let text = "Press X to interact"
    ctx.textAlign = 'center'
    // ctx.textBaseline = 'alphabetic'
    ctx.font =`${18 * window.canvasMultiplier}pt Courier New`
    // console.log(window.CONSTANTS.PLAYER_CANVAS_WIDTH/2 - (200 * window.canvasMultiplier), 240 * window.canvasMultiplier)
    ctx.fillText(text, window.CONSTANTS.PLAYER_CANVAS_WIDTH/2, window.CONSTANTS.PLAYER_CANVAS_HEIGHT - (36 * window.canvasMultiplier))
    const { _interactableObject } = window.hero
    let thickness = 3
    drawTools.drawBorder(ctx, {x: _interactableObject.x-thickness, y: _interactableObject.y - thickness, width: _interactableObject.width + (thickness*2), height: _interactableObject.height + (thickness*2)}, tempCamera, { thickness })
  }

}

export default {
  update
}
