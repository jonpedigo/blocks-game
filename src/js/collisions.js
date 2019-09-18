function check(hero, objects){
  let illegal = false

  // Are they touching?
  for(let i = 0; i < objects.length; i++){
    if (
      hero._x < (objects[i].x + objects[i].width)
      && objects[i].x < (hero._x + hero.width)
      && hero._y < (objects[i].y + objects[i].height)
      && objects[i].y < (hero._y + hero.height)
    ) {
      if(objects[i].obstacle) illegal = true
      if(objects[i].onCollide) objects[i].onCollide()
    }
  }

  if(illegal) {
    hero._x = hero.x
    hero._y = hero.y
  }

  if(!illegal){
    hero.x = hero._x
    hero.y = hero._y
  }
}

export default {
  check,
}
