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

function drawVertice(ctx, vertice, camera) {
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
    drawVertice(ctx, {...vertice, glow: false}, camera)
  }
  if(vertice.color) {
    ctx.strokeStyle = window.defaultObject.color;
  }
  if(vertice.thickness) {
    ctx.lineWidth = 1
  }
}

function drawBorder(ctx, object, camera, options = { thickness: 1 }) {
  getObjectVertices(ctx, object, camera, options).forEach((vertice) => {
    drawVertice(ctx, vertice, camera)
  })
}

function drawObject(ctx, object, camera, options = {showInvisible: false}) {
  ctx.save()
  if(object.tags && object.tags.rotateable) {
    ctx.beginPath();
    ctx.translate((object.x * camera.multiplier) - camera.x + ((object.width/2) * camera.multiplier), (object.y * camera.multiplier) - camera.y + ((object.height/2) * camera.multiplier));
    ctx.rotate(object.angle);
    object = {...object, x: -(object.width/2), y: -(object.height/2)}
    camera = {...camera, x: 0, y: 0}
  }


  if(object.tags && object.tags.invisible) {
   if(options.showInvisible) {
     ctx.globalAlpha = 0.2;
     drawFilledObject(ctx, object, camera);
   }
  } else if(object.tags && object.tags.filled) {
    drawFilledObject(ctx, object, camera);
  } else {
    drawBorder(ctx, object, camera);
  }

  ctx.restore()
}

function drawLine(ctx, pointA, pointB, options, camera) {
  if(options.color) {
    ctx.strokeStyle = options.color;
  }
  if(options.thickness) {
    ctx.lineWidth = options.thickness
  }

  ctx.beginPath();
  ctx.moveTo( (pointA.x * camera.multiplier - camera.x), (pointA.y * camera.multiplier - camera.y));
  ctx.lineTo( (pointB.x * camera.multiplier - camera.x), (pointB.y * camera.multiplier - camera.y));
  ctx.stroke();

  if(options.color) {
    ctx.strokeStyle = window.defaultObject.color;
  }
  if(options.thickness) {
    ctx.lineWidth = 1
  }
}

export default {
  getObjectVertices,
  drawObject,
  drawLine,
  drawVertice,
  drawBorder,
  drawFilledObject,
}
