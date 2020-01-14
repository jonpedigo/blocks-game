function init(hero, objects){


}

function update(hero, objects, modifier) {
  objects.forEach((object) => {
    if(object.tags.indexOf('monster') > -1) {
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
  })
}

export default {
  init,
  update,
}
