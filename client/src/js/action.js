import input from './input'
import gridTool from './grid.js'
import collisions from './collisions.js'

const keysDown = {}

function shootBullet() {
  let direction = window.hero.inputDirection
  let shootedd = {
    id: 'bullet-' + Date.now(),
    width: 4,
    height: 4,
    tags: {
      bullet: true,
    },
  }

  if(direction === 'up') {
    Object.assign(shooted, {
      x: window.hero.x + (window.hero.width/2),
      y: window.hero.y,
    })
  }

  if(direction === 'down') {
    Object.assign(shooted, {
      x: window.hero.x + (window.hero.width/2),
      y: window.hero.y + window.hero.height,
    })
  }

  if(direction === 'right') {
    Object.assign(shooted, {
      x: window.hero.x + window.hero.width,
      y: window.hero.y + (window.hero.height/2),
    })
  }

  if(direction === 'left') {
    Object.assign(shooted, {
      x: window.hero.x,
      y: window.hero.y + (window.hero.height/2),
    })
  }

  addObjects([shooted])
}

function dropWall() {
  let direction = window.hero.inputDirection
  let wall = {
    id: 'wall-' + Date.now(),
    width: window.grid.nodeSize,
    height: window.grid.nodeSize,
    tags: {
      obstacle: true,
      stationary: true,
    },
  }

  if(direction === 'up') {
    Object.assign(wall, {
      x: window.hero.x,
      y: window.hero.y - window.hero.height,
    })
  }

  if(direction === 'down') {
    Object.assign(wall, {
      x: window.hero.x,
      y: window.hero.y + window.hero.height,
    })
  }

  if(direction === 'right') {
    Object.assign(wall, {
      x: window.hero.x + window.hero.width,
      y: window.hero.y,
    })
  }

  if(direction === 'left') {
    Object.assign(wall, {
      x: window.hero.x - window.hero.width,
      y: window.hero.y,
    })
  }

  addObjects([wall])
}

function init(hero){
  window.addEventListener("keydown", function (e) {
    if(window.hero.flags.paused || window.world.globalTags.paused) return
    keysDown[e.keyCode] = true


    //shoot out thing
    if(e.keyCode === 90) {

      if(window.hero.actionButtonBehavior === 'shootBullet') {
        shootBullet()
      }

      if(window.hero.actionButtonBehavior === 'dropWall') {
        dropWall()
      }

    }
  }, false)

  window.addEventListener("keyup", function (e) {
	   delete keysDown[e.keyCode]
  }, false)


}

function update(modifier) {

}

export default {
  init,
  update,
}
