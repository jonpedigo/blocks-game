import pathfinding from './pathfinding.js';

function init(hero, objects){


}

function update(hero, objects, modifier) {
  objects.forEach((object) => {
    if(object.tags && object.tags['monster']) {
      object.target = window.hero

      if(object.target.x > object.x) {
        object.velocityX = object.speed || 100
      } else if (object.target.x < object.x) {
        object.velocityX = -object.speed || -100
      }

      if(object.target.y > object.y) {
        object.velocityY = object.speed || 100
      } else if (object.target.y < object.y) {
        object.velocityY = -object.speed || -100
      }
    }

    if(object.tags && object.tags['obstacle']) {
      object.velocityY = 0
      object.velocityX = 0
      object.accY = 0
      object.accX = 0
    }


    if(object.tags && object.tags.patrol) {
      if(!object.path || (object.path && !object.path.length)) {
        object.path = [pathfinding.walkAround(object)]
      }
    }
  })
}

export default {
  init,
  update,
}
