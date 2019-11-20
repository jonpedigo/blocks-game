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
    hero._y = hero._y - hero.speed * modifier;
  }
  if (40 in keysDown) { // Player holding down
    hero._y = hero._y + hero.speed * modifier;
  }
  if (37 in keysDown) { // Player holding left
    hero._x = hero._x - hero.speed * modifier;
  }
  if (39 in keysDown) { // Player holding right
    hero._x = hero._x + hero.speed * modifier;
  }

  if(13 in keysDown) {
    camera.setLimit(100, 100)
  }


}

export default {
  start,
  update,
}
