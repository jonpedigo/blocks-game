import camera from './camera.js'
import chat from './chat.js'
import feedback from './feedback.js'

function update() {
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'none';

  ctx.filter = "drop-shadow(4px 4px 8px #fff)";
  ctx.filter = "none"
  let vertices = [...window.objects].reduce((prev, object) => {
    if(object.removed) return prev
    if(object.tags.invisible) return prev
    let extraProps = {}
    if(object.tags.glowing) {
      extraProps.glow = 3
      extraProps.thickness = 2
      extraProps.color = 'white'
    }
		prev.push({a:{x:object.x,y:object.y}, b:{x:object.x + object.width,y:object.y}, ...extraProps})
		prev.push({a:{x:object.x + object.width,y:object.y}, b:{x:object.x + object.width,y:object.y + object.height}, ...extraProps})
		prev.push({a:{x:object.x + object.width,y:object.y + object.height}, b:{x:object.x,y:object.y + object.height}, ...extraProps})
		prev.push({a:{x:object.x,y:object.y + object.height}, b:{x:object.x,y:object.y}, ...extraProps})
		return prev
	}, [])

  //reset background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	//set camera so we render everything in the right place
  camera.set(ctx, window.hero)

	window.world.renderStyle = 'outlines'
 	if (window.world.renderStyle === 'outlines') {
		ctx.strokeStyle = "#999";
		for(var i=0;i<vertices.length;i++){
			camera.drawVertice(ctx, vertices[i])
		}
		ctx.fillStyle = 'white';
		camera.drawObject(ctx, window.hero)
	} else if(window.world.renderStyle === 'physics'){
		physics.drawSystem(ctx, vertices)
	} else {
		for(let i = 0; i < window.objects.length; i++){
      if(window.objects[i].removed) continue
      if(window.objects[i].tags.invisible) continue
			camera.drawObject(ctx, window.objects[i])
		}
	}

	window.world.shadows = false
	if(window.world.shadows === true) {
		shadow.draw(ctx, vertices, hero)
	}

  for(var heroId in window.heros) {
    if(heroId === window.hero.id) continue;
    let currentHero = window.heros[heroId];
    camera.drawObject(ctx, currentHero);
  }

  ctx.font =`24pt Arial`
	ctx.fillStyle="rgba(255,255,255,0.3)"
  ctx.fillText(Math.ceil(window.fps), window.CONSTANTS.PLAYER_CANVAS_WIDTH - 50, 40)
  chat.render(ctx);
	feedback.draw(ctx);
}

export default {
  update
}
