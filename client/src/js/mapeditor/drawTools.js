function getObjectVertices(ctx, object, camera, options = {}) {
  let prev = []
  if(object.removed) return prev

  const extraProps = {}

  if(object.tags && object.tags && object.tags && object.tags.glowing) {
    extraProps.glow = 3
    extraProps.thickness = 2
    extraProps.color = 'white'
  }

  if(options.thickness) {
    extraProps.thickness = options.thickness
  }

  if(object.color) extraProps.color = object.color
  prev.push({a:{x:object.x,y:object.y}, b:{x:object.x + object.width,y:object.y}, ...extraProps})
  prev.push({a:{x:object.x + object.width,y:object.y}, b:{x:object.x + object.width,y:object.y + object.height}, ...extraProps})
  prev.push({a:{x:object.x + object.width,y:object.y + object.height}, b:{x:object.x,y:object.y + object.height}, ...extraProps})
  prev.push({a:{x:object.x,y:object.y + object.height}, b:{x:object.x,y:object.y}, ...extraProps})
  return prev
}

function drawFilledObject(ctx, object, camera) {
  if(object.color) ctx.fillStyle = object.color
  ctx.fillRect((object.x * camera.multiplier) - camera.x, (object.y * camera.multiplier) - camera.y, (object.width * camera.multiplier), (object.height * camera.multiplier));
}

function drawLine(ctx, vertice, camera) {
  if(vertice.glow) {
    ctx.filter = "drop-shadow(4px 4px 8px #fff)";
  }
  if(vertice.color) {
    ctx.strokeStyle = vertice.color;
  }
  if(vertice.thickness) {
    ctx.lineWidth = vertice.thickness
  }

  ctx.beginPath();
  ctx.moveTo( (vertice.a.x * camera.multiplier - camera.x), (vertice.a.y * camera.multiplier - camera.y));
  ctx.lineTo( (vertice.b.x * camera.multiplier - camera.x), (vertice.b.y * camera.multiplier - camera.y));
  ctx.stroke();

  if(vertice.glow) {
    ctx.filter = "none";
    drawLine(ctx, {...vertice, glow: false}, camera)
  }
  if(vertice.color) {
    ctx.strokeStyle = "#999";
  }
  if(vertice.thickness) {
    ctx.lineWidth = 1
  }
}

function drawBorder(ctx, object, camera, options = { thickness: 1 }) {
  getObjectVertices(ctx, object, camera, options).forEach((vertice) => {
    drawLine(ctx, vertice, camera)
  })
}

function drawObject(ctx, object, camera, options = {showInvisible: false}) {
  if(object.tags && object.tags.filled) {
    drawFilledObject(ctx, object, camera);
  } if(object.tags && object.tags.invisible) {
    if(options.showInvisible) {
      ctx.globalAlpha = 0.2;
      drawFilledObject(ctx, object, camera);
      ctx.globalAlpha = 1.0;
    }
  } else {
    drawBorder(ctx, object, camera);
  }
}

export default {
  getObjectVertices,
  drawObject,
  drawLine,
  drawBorder,
  drawFilledObject,
}
