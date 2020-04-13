import camera from './camera';

window.heroKeysDown = {}
let keysDown = window.heroKeysDown
// this is the one for the
window.heroInput = {}

let lastJump = 0

function init(){
  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true

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

function update(hero, keysDown, delta) {
  if(32 in keysDown) {
    if(hero.chat.length) {
      hero.chat.shift()
      if(!hero.chat.length) {
        hero.flags.showChat = false
        hero.flags.paused = false
        hero.onGround = false
      }
    }
  }

  if(hero.flags.paused || window.gameState.paused) return

  if(32 in keysDown) {
    if(hero.onGround && hero.tags.gravity) {
      hero.velocityY = hero.jumpVelocity
      lastJump = Date.now();
    }
  }

  if(hero.arrowKeysBehavior === 'grid') {
    if (38 in keysDown) { // Player holding up
      hero.y -= window.grid.nodeSize
    } else if (40 in keysDown) { // Player holding down
      hero.y += window.grid.nodeSize
    } else if (37 in keysDown) { // Player holding left
      hero.x -= window.grid.nodeSize
    } else if (39 in keysDown) { // Player holding right
      hero.x += window.grid.nodeSize
    }
  }

  if (38 in keysDown) { // Player holding up
    hero.inputDirection = 'up'
  }
  if (40 in keysDown) { // Player holding down
    hero.inputDirection = 'down'
  }
  if (37 in keysDown) { // Player holding left
    hero.inputDirection = 'left'
  }
  if (39 in keysDown) { // Player holding right
    hero.inputDirection = 'right'
  }
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
  /// DEFAULT GAME FX
  if(window.defaultCustomGame) {
    window.defaultCustomGame.input(hero, keysDown, delta)
  }

  /// CUSTOM GAME FX
  if(window.customGame) {
    window.customGame.input(hero, keysDown, delta)
  }

  /// LIVE CUSTOM GAME FX
  if(window.liveCustomGame) {
    window.liveCustomGame.input(hero, keysDown, delta)
  }

  if(hero.flags.paused || window.gameState.paused) return

  hero._initialX = hero.x
  hero._initialY = hero.y

  if (38 in keysDown) { // Player holding up
    if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accY -= (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityY -= (hero.speed) * delta;
    }
  }
  if (40 in keysDown) { // Player holding down
    if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accY += (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityY += (hero.speed) * delta;
    }
  }
  if (37 in keysDown) { // Player holding left
    if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accX -= (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityX -= (hero.speed) * delta;
    }
  }
  if (39 in keysDown) { // Player holding right
    if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accX += (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityX += (hero.speed) * delta;
    }
  }

  if(hero.arrowKeysBehavior === 'skating') {
    if(hero.inputDirection === 'up') {
      hero.y -= Math.ceil(hero.speed * delta);
    } else if(hero.inputDirection === 'down') {
      hero.y += Math.ceil(hero.speed * delta);
    } else if(hero.inputDirection === 'left') {
      hero.x -= Math.ceil(hero.speed * delta);
    } else if(hero.inputDirection === 'right') {
      hero.x += Math.ceil(hero.speed * delta);
    }
  }

  function positionInput() {

    if(hero.arrowKeysBehavior === 'flatDiagonal') {
      if(!hero.tags.gravity) {
        if (38 in keysDown && !hero.tags.gravity) { // Player holding up
          hero.velocityY = -Math.ceil(hero.speed * delta) * 100
        } else if (40 in keysDown) { // Player holding down
          hero.velocityY = Math.ceil(hero.speed * delta) * 100
        } else {
          hero.velocityY = 0
        }
      }

      if (37 in keysDown) { // Player holding left
        hero.velocityX = -Math.ceil(hero.speed * delta) * 100
      } else if (39 in keysDown) { // Player holding right
        hero.velocityX = Math.ceil(hero.speed * delta) * 100
      } else {
        hero.velocityX = 0
      }
    }

    if(hero.arrowKeysBehavior === 'flatRecent') {
      hero.velocityX = 0
      if(!hero.tags.gravity) {
        hero.velocityY = 0
      }

      if (38 in keysDown && window.hero.inputDirection == 'up' && !hero.tags.gravity) { // Player holding up
        hero.velocityY = -Math.ceil(hero.speed * delta) * 100
        return
      }

      if (40 in keysDown && window.hero.inputDirection == 'down') { // Player holding down
        hero.velocityY = Math.ceil(hero.speed * delta) * 100
        return
      }

      if (37 in keysDown && window.hero.inputDirection == 'left') { // Player holding left
        hero.velocityX = -Math.ceil(hero.speed * delta) * 100
        return
      }

      if (39 in keysDown && window.hero.inputDirection == 'right') { // Player holding right
        hero.velocityX = Math.ceil(hero.speed * delta) * 100
        return
      }

      if (38 in keysDown && !hero.tags.gravity) { // Player holding up
        hero.velocityY = -Math.ceil(hero.speed * delta) * 100
      }

      if (40 in keysDown) { // Player holding down
        hero.velocityY = Math.ceil(hero.speed * delta) * 100
      }

      if (37 in keysDown) { // Player holding left
        hero.velocityX = -Math.ceil(hero.speed * delta) * 100
      }

      if (39 in keysDown) { // Player holding right
        hero.velocityX = Math.ceil(hero.speed * delta) * 100
      }
    }
  }

  positionInput()
}

function loaded() {
  // window.hero.inputDirection = 'up'
}

function getDirection() {
  return inputDirection
}

export default {
  init,
  loaded,
  update,
  getDirection,
}
