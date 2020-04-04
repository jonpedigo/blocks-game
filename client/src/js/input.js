import camera from './camera';

const keysDown = {}

let lastJump = 0

function init(){
  window.hero.inputDirection = 'up'

  window.addEventListener("keydown", function (e) {
    if(window.hero.flags.paused || window.world.globalTags.paused) return

    keysDown[e.keyCode] = true

    if(e.keyCode === 32 && window.hero.onGround && !window.usePlayEditor && window.hero.tags.gravity) {
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

    if (38 === e.keyCode) { // Player holding up
      window.hero.inputDirection = 'up'
    }
    if (40 === e.keyCode) { // Player holding down
      window.hero.inputDirection = 'down'
    }
    if (37 === e.keyCode) { // Player holding left
      window.hero.inputDirection = 'left'
    }
    if (39 === e.keyCode) { // Player holding right
      window.hero.inputDirection = 'right'
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

function update(delta) {
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

  window.hero._initialX = window.hero.x
  window.hero._initialY = window.hero.y

  if (38 in keysDown) { // Player holding up
    if(window.hero.arrowKeysBehavior === 'acc' || window.hero.arrowKeysBehavior === 'acceleration') {
      window.hero.accY -= (window.hero.speed) * delta;
    } else if (window.hero.arrowKeysBehavior === 'velocity') {
      window.hero.velocityY -= (window.hero.speed) * delta;
    }
  }
  if (40 in keysDown) { // Player holding down
    if(window.hero.arrowKeysBehavior === 'acc' || window.hero.arrowKeysBehavior === 'acceleration') {
      window.hero.accY += (window.hero.speed) * delta;
    } else if (window.hero.arrowKeysBehavior === 'velocity') {
      window.hero.velocityY += (window.hero.speed) * delta;
    }
  }
  if (37 in keysDown) { // Player holding left
    if(window.hero.arrowKeysBehavior === 'acc' || window.hero.arrowKeysBehavior === 'acceleration') {
      window.hero.accX -= (window.hero.speed) * delta;
    } else if (window.hero.arrowKeysBehavior === 'velocity') {
      window.hero.velocityX -= (window.hero.speed) * delta;
    }
  }
  if (39 in keysDown) { // Player holding right
    if(window.hero.arrowKeysBehavior === 'acc' || window.hero.arrowKeysBehavior === 'acceleration') {
      window.hero.accX += (window.hero.speed) * delta;
    } else if (window.hero.arrowKeysBehavior === 'velocity') {
      window.hero.velocityX += (window.hero.speed) * delta;
    }
  }

  if(window.hero.arrowKeysBehavior === 'skating') {
    if(window.window.hero.inputDirection === 'up') {
      window.hero.y -= Math.ceil(window.hero.speed * delta);
    } else if(window.window.hero.inputDirection === 'down') {
      window.hero.y += Math.ceil(window.hero.speed * delta);
    } else if(window.window.hero.inputDirection === 'left') {
      window.hero.x -= Math.ceil(window.hero.speed * delta);
    } else if(window.window.hero.inputDirection === 'right') {
      window.hero.x += Math.ceil(window.hero.speed * delta);
    }
  }

  function positionInput() {

    if(window.hero.arrowKeysBehavior === 'flatDiagonal') {
      if(!window.hero.tags.gravity) {
        if (38 in keysDown && !window.hero.tags.gravity) { // Player holding up
          window.hero.velocityY = -Math.ceil(window.hero.speed * delta) * 100
        } else if (40 in keysDown) { // Player holding down
          window.hero.velocityY = Math.ceil(window.hero.speed * delta) * 100
        } else {
          window.hero.velocityY = 0
        }
      }

      if (37 in keysDown) { // Player holding left
        window.hero.velocityX = -Math.ceil(window.hero.speed * delta) * 100
      } else if (39 in keysDown) { // Player holding right
        window.hero.velocityX = Math.ceil(window.hero.speed * delta) * 100
      } else {
        window.hero.velocityX = 0
      }
    }

    if(window.hero.arrowKeysBehavior === 'flatRecent') {
      window.hero.velocityX = 0
      if(!window.hero.tags.gravity) {
        window.hero.velocityY = 0
      }

      if (38 in keysDown && window.window.hero.inputDirection == 'up' && !window.hero.tags.gravity) { // Player holding up
        window.hero.velocityY = -Math.ceil(window.hero.speed * delta) * 100
        return
      }

      if (40 in keysDown && window.window.hero.inputDirection == 'down') { // Player holding down
        window.hero.velocityY = Math.ceil(window.hero.speed * delta) * 100
        return
      }

      if (37 in keysDown && window.window.hero.inputDirection == 'left') { // Player holding left
        window.hero.velocityX = -Math.ceil(window.hero.speed * delta) * 100
        return
      }

      if (39 in keysDown && window.window.hero.inputDirection == 'right') { // Player holding right
        window.hero.velocityX = Math.ceil(window.hero.speed * delta) * 100
        return
      }

      if (38 in keysDown && !window.hero.tags.gravity) { // Player holding up
        window.hero.velocityY = -Math.ceil(window.hero.speed * delta) * 100
      }

      if (40 in keysDown) { // Player holding down
        window.hero.velocityY = Math.ceil(window.hero.speed * delta) * 100
      }

      if (37 in keysDown) { // Player holding left
        window.hero.velocityX = -Math.ceil(window.hero.speed * delta) * 100
      }

      if (39 in keysDown) { // Player holding right
        window.hero.velocityX = Math.ceil(window.hero.speed * delta) * 100
      }
    }
  }


  positionInput()

  /// CUSTOM GAME FX
  if(window.customGame) {
    window.customGame.input(keysDown, delta)
  }
}

function getDirection() {
  return inputDirection
}

export default {
  init,
  update,
  getDirection,
}
