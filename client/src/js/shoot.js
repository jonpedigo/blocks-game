import input from './input'

const keysDown = {}

function init(hero){
  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true


    //shoot out thing
    if(e.keyCode === 90) {
      let direction = input.getDirection()
      let shooted = {
        name: Date.now(),
        width: 4,
        height: 4,
      }

      if(direction === 'up') {
        shooted.velocityY = -300

        Object.assign(shooted, {
          x: hero.x + (hero.width/2),
          y: hero.y,
        })
      }

      if(direction === 'down') {
        shooted.velocityY = 300

        Object.assign(shooted, {
          x: hero.x + (hero.width/2),
          y: hero.y + hero.height,
        })
      }

      if(direction === 'right') {
        shooted.velocityX = 300

        Object.assign(shooted, {
          x: hero.x + hero.width,
          y: hero.y + (hero.height/2),
        })
      }

      if(direction === 'left') {
        shooted.velocityX = -300

        Object.assign(shooted, {
          x: hero.x,
          y: hero.y + (hero.height/2),
        })
      }

      window.socket.emit('addObjects', [shooted])
    }
  }, false)

  window.addEventListener("keyup", function (e) {
	   delete keysDown[e.keyCode]
  }, false)


}

function update(flags, hero, modifier) {

}

export default {
  init,
  update,
}
