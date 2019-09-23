const currentBattle = {
  hitSize: 20,
  speed: 500,
}

let xPadding = 150
let movingLineX = xPadding
let direction = 'right';

const keysDown = {}
function start(game, hitSize, speed) {
  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true
  }, false)

  window.addEventListener("keyup", function (e) {
     delete keysDown[e.keyCode]
  }, false)

  game.mode = 'battle';
  currentBattle.hitSize = hitSize;
  currentBattle.speed = speed;
}

function update(ctx, modifier) {
  if(keysDown['32']){
    if (
      movingLineX < ((ctx.canvas.width/2) - (currentBattle.hitSize/2) + currentBattle.hitSize)
      && (ctx.canvas.width/2) - (currentBattle.hitSize/2) < (movingLineX + 5)
    ) {
      alert('got it!')
      keysDown['32'] = false
    }
  }
  if(direction == 'right') {
    movingLineX = movingLineX + (currentBattle.speed * modifier)
    if(movingLineX > ctx.canvas.width - xPadding) {
      direction = 'left'
    }
  } else {
    movingLineX = movingLineX - (currentBattle.speed * modifier)
    if(movingLineX < xPadding) {
      direction = 'right'
    }
  }

}

function render(ctx) {
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  ctx.fillStyle = 'red'
  ctx.fillRect((ctx.canvas.width/2) - (currentBattle.hitSize/2), (ctx.canvas.height - 60), currentBattle.hitSize, 30)

  ctx.fillStyle = 'blue'
  ctx.fillRect(movingLineX, ctx.canvas.height - 60, 5, 30)
}

export default {
  start,
  update,
  render
}
