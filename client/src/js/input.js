import camera from './camera';

const keysDown = {}

function start(hero, modifier){
  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true
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
  if (38 in keysDown) { // Player holding up
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

  if(32 in keysDown) {

  }

  if(13 in keysDown) {
    // camera.setLimit(100, 100)
  }
}

export default {
  start,
  update,
}
