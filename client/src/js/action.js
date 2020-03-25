import input from './input'
import gridTool from './grid.js'
import collisions from './collisions.js'

const keysDown = {}

function shootBullet() {
  let direction = input.getDirection()
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
  let direction = input.getDirection()
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

function update(flags, hero, modifier) {

}

function addObjects(objects, options = { bypassCollisions: false }) {
  if(!objects.length) {
    objects = [objects]
  }

  objects = objects.map((newObject) => {
    Object.assign(newObject, window.defaultObject)

    if(!newObject.tags) {
      newObject.tags = []
    }

    for(let tag in window.tags) {
      if(window.tags[tag].checked || newObject.tags[tag] === true){
        newObject.tags[tag] = true
      } else {
        newObject.tags[tag] = false
      }
    }

    if(!window.preferences.calculatePathCollisions) {
      gridTool.addObstacle(newObject)
    }

    if(!collisions.check(newObject, window.objects) || options.bypassCollisions) {
      return newObject
    }
  }).filter(obj => !!obj)

  window.socket.emit('addObjects', objects)
}

export default {
  init,
  update,
}
