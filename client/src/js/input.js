import camera from './camera';

const keysDown = {}

let inputDirection = 'up'
let lastJump = 0

function init(){
  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true

    if(e.keyCode === 32 && window.hero.onGround && !window.usePlayEditor && !window.hero.flags.paused && window.hero.tags.gravity) {
      window.hero.velocityY = hero.jumpVelocity

      lastJump = Date.now();
    }

    if(window.hero.arrowKeysBehavior === 'grid') {
      if (38 in keysDown) { // Player holding up
        window.hero.y -= window.grid.nodeSize
      } else if (40 in keysDown) { // Player holding down
        window.hero.y += window.grid.nodeSize
      } else if (37 in keysDown) { // Player holding left
        window.hero.x -= window.grid.nodeSize
      } else if (39 in keysDown) { // Player holding right
        window.hero.x += window.grid.nodeSize
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
    inputDirection = 'up'
    if(hero.tags.gravity == true) {
    } else if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accY -= (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityY -= (hero.speed) * delta;
    }
  }
  if (40 in keysDown) { // Player holding down
    inputDirection = 'down'
    if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accY += (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityY += (hero.speed) * delta;
    }
  }
  if (37 in keysDown) { // Player holding left
    inputDirection = 'left'
    if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accX -= (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityX -= (hero.speed) * delta;
    }
  }
  if (39 in keysDown) { // Player holding right
    inputDirection = 'right'
    if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accX += (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityX += (hero.speed) * delta;
    }
  }

  if(hero.arrowKeysBehavior === 'skating') {
    if(inputDirection === 'up') {
      hero.y -= Math.ceil(hero.speed * delta);
    } else if(inputDirection === 'down') {
      hero.y += Math.ceil(hero.speed * delta);
    } else if(inputDirection === 'left') {
      hero.x -= Math.ceil(hero.speed * delta);
    } else if(inputDirection === 'right') {
      hero.x += Math.ceil(hero.speed * delta);
    }
  }

  function positionInput() {
    if(hero.arrowKeysBehavior === 'position') {
      hero.velocityX = 0
      hero.velocityY = 0

      if (38 in keysDown && window.hero.directions.up) { // Player holding up
        hero.velocityY = -Math.ceil(hero.speed * delta) * 150
        return
      }

      if (40 in keysDown && window.hero.directions.down) { // Player holding down
        hero.velocityY = Math.ceil(hero.speed * delta) * 150
        return
      }

      if (37 in keysDown && window.hero.directions.left) { // Player holding left
        hero.velocityX = -Math.ceil(hero.speed * delta) * 150
        return
      }

      if (39 in keysDown && window.hero.directions.right) { // Player holding right
        hero.velocityX = Math.ceil(hero.speed * delta) * 150
        return
      }

      if (38 in keysDown) { // Player holding up
        hero.velocityY = -Math.ceil(hero.speed * delta) * 60
      }

      if (40 in keysDown) { // Player holding down
        hero.velocityY = Math.ceil(hero.speed * delta) * 60
      }

      if (37 in keysDown) { // Player holding left
        hero.velocityX = -Math.ceil(hero.speed * delta) * 60
      }

      if (39 in keysDown) { // Player holding right
        hero.velocityX = Math.ceil(hero.speed * delta) * 60
      }
    }
  }
  positionInput()

  window.hero.inputDirection = inputDirection
}

function getDirection() {
  return inputDirection
}

export default {
  init,
  update,
  getDirection,
}
