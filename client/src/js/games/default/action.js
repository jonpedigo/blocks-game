import collisions from '../../collisions'
import gridTool from '../../grid.js'
import pathfinding from '../../pathfinding.js'

function shootBullet(hero) {
  let directions = hero.directions
  let shooted = {
    id: 'bullet-' + Date.now(),
    width: 4,
    height: 4,
    tags: {
      bullet: true,
    },
  }

  if(directions.up) {
    Object.assign(shooted, {
      x: hero.x + (hero.width/2),
      y: hero.y,
    })
  }

  if(directions.down) {
    Object.assign(shooted, {
      x: hero.x + (hero.width/2),
      y: hero.y + hero.height,
    })
  }

  if(directions.right) {
    Object.assign(shooted, {
      x: hero.x + hero.width,
      y: hero.y + (hero.height/2),
    })
  }

  if(directions.left) {
    Object.assign(shooted, {
      x: hero.x,
      y: hero.y + (hero.height/2),
    })
  }

  addObjects([shooted], { bypassCollisions: true })
}

function dropWall(hero) {
  let directions = hero.directions
  let wall = {
    id: 'wall-' + Date.now(),
    width: w.game.grid.nodeSize,
    height: w.game.grid.nodeSize,
    tags: {
      obstacle: true,
      stationary: true,
    },
  }

  if(directions.up) {
    Object.assign(wall, {
      x: hero.x,
      y: hero.y - hero.height,
    })
  }

  if(directions.down) {
    Object.assign(wall, {
      x: hero.x,
      y: hero.y + hero.height,
    })
  }

  if(directions.right) {
    Object.assign(wall, {
      x: hero.x + hero.width,
      y: hero.y,
    })
  }

  if(directions.left) {
    Object.assign(wall, {
      x: hero.x - hero.width,
      y: hero.y,
    })
  }

  addObjects([wall], { bypassCollisions: true })
}

export default {
  shootBullet,
  dropWall,
}
