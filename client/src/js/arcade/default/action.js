import collisions from '../../utils/collisions'
import gridTool from '../../utils/grid.js'
import pathfinding from '../../utils/pathfinding.js'

function shootBullet(hero) {
  let directions = hero.directions
  let shooted = {
    id: 'bullet-' + window.uniqueID(),
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

  addObjects([shooted], { fromLiveGame: true })
}

function dropWall(hero) {
  let directions = hero.directions
  let wall = {
    id: 'wall-' + window.uniqueID(),
    width: GAME.grid.nodeSize,
    height: GAME.grid.nodeSize,
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

  addObjects([wall], { fromLiveGame: true })
}

export default {
  shootBullet,
  dropWall,
}
