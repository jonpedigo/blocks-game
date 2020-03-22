import camera from './camera';

const keysDown = {}
let direction = 'up'

let lastJump = 0

function init(){
  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true

    if(e.keyCode === 32 && window.hero.onGround && !window.usePlayEditor && !window.hero.paused && window.hero.gravity) {
      window.hero.velocityY = hero.jumpVelocity

      lastJump = Date.now();
    }

    if(window.hero.arrowKeysBehavior === 'grid') {
      if (38 in keysDown) { // Player holding up
        window.hero.y -= window.grid.gridNodeSize
      } else if (40 in keysDown) { // Player holding down
        window.hero.y += window.grid.gridNodeSize
      } else if (37 in keysDown) { // Player holding left
        window.hero.x -= window.grid.gridNodeSize
      } else if (39 in keysDown) { // Player holding right
        window.hero.x += window.grid.gridNodeSize
      }
    }

    // console.log(keysDown, e.keyCode, hero.wallJumpLeft)
    // if(e.keyCode === 32 && !hero.onGround && hero.wallJumpLeft) {
    //   console.log('wall jump left')
    //   hero.velocityX = -200
    //   hero.velocityY = -400
    // }
    // if(e.keyCode === 32 && !hero.onGround && hero.wallJumpRight) {
    //   hero.velocityX = 200
    //   hero.velocityY = -400
    // }
  }, false)

  window.addEventListener("keyup", function (e) {
	   delete keysDown[e.keyCode]
  }, false)


}

function update(hero, delta) {
  /*
    left arrow	37
    up arrow	38
    right arrow	39
    down arrow	40
    w 87
    a 65
    s 83
    d 68
  */

  hero._initialX = hero.x
  hero._initialY = hero.y

  if (38 in keysDown) { // Player holding up
    direction = 'up'
    if(hero.gravity > 0) {
    } else if(hero.arrowKeysBehavior === 'position') {
      hero.y -= Math.ceil(hero.speed * delta);
    } else if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accY -= (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityY -= (hero.speed) * delta;
    }
  }
  if (40 in keysDown) { // Player holding down
    direction = 'down'
    if(hero.arrowKeysBehavior === 'position') {
      hero.y += Math.ceil(hero.speed * delta);
    } else if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accY += (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityY += (hero.speed) * delta;
    }
  }
  if (37 in keysDown) { // Player holding left
    direction = 'left'
    if(hero.arrowKeysBehavior === 'position') {
      hero.x -= Math.ceil(hero.speed * delta);
    } else if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accX -= (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityX -= (hero.speed) * delta;
    }
  }
  if (39 in keysDown) { // Player holding right
    direction = 'right'
    if(hero.arrowKeysBehavior === 'position') {
      hero.x += Math.ceil(hero.speed * delta);
    } else if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accX += (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityX += (hero.speed) * delta;
    }
  }

  if(13 in keysDown) {
    // camera.setLimit(100, 100)
  }

  if(hero.arrowKeysBehavior === 'skating') {
    if(direction === 'up') {
      hero.y -= Math.ceil(hero.speed * delta);
    } else if(direction === 'down') {
      hero.y += Math.ceil(hero.speed * delta);
    } else if(direction === 'left') {
      hero.x -= Math.ceil(hero.speed * delta);
    } else if(direction === 'right') {
      hero.x += Math.ceil(hero.speed * delta);
    }
  }
}

function getDirection() {
  return direction
}

export default {
  init,
  update,
  getDirection,
}
