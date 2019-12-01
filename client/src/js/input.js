import camera from './camera';

const keysDown = {}

function start(hero){
  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true

    if(e.keyCode === 32 && hero.onGround) {
      hero.velocityY = -500
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

function update(flags, hero, modifier) {
  if(flags.heroPaused) return
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
  if (38 in keysDown && hero.gravity === 0) { // Player holding up
    if(hero.inputControlProp === 'position') {
      hero.y -= hero.speed * modifier;
    } else if(hero.inputControlProp === 'acc' || hero.inputControlProp === 'acceleration') {
      hero.accY -= hero.speed * modifier;
    } else if (hero.inputControlProp === 'velocity') {
      hero.velocityY -= hero.speed * modifier;
    }
  }
  if (40 in keysDown) { // Player holding down
    if(hero.inputControlProp === 'position') {
      hero.y += hero.speed * modifier;
    } else if(hero.inputControlProp === 'acc' || hero.inputControlProp === 'acceleration') {
      hero.accY += hero.speed * modifier;
    } else if (hero.inputControlProp === 'velocity') {
      hero.velocityY += hero.speed * modifier;
    }
  }
  if (37 in keysDown) { // Player holding left
    if(hero.inputControlProp === 'position') {
      hero.x -= hero.speed * modifier;
    } else if(hero.inputControlProp === 'acc' || hero.inputControlProp === 'acceleration') {
      hero.accX -= hero.speed * modifier;
    } else if (hero.inputControlProp === 'velocity') {
      hero.velocityX -= hero.speed * modifier;
    }
  }
  if (39 in keysDown) { // Player holding right
    if(hero.inputControlProp === 'position') {
      hero.x += hero.speed * modifier;
    } else if(hero.inputControlProp === 'acc' || hero.inputControlProp === 'acceleration') {
      hero.accX += hero.speed * modifier;
    } else if (hero.inputControlProp === 'velocity') {
      hero.velocityX += hero.speed * modifier;
    }
  }

  if(13 in keysDown) {
    // camera.setLimit(100, 100)
  }
}

export default {
  start,
  update,
}
