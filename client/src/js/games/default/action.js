import collisions from '../../collisions'
import gridTool from '../../grid.js'
import pathfinding from '../../pathfinding.js'

function shootBullet(hero) {
  let directions = window.hero.directions
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
      x: window.hero.x + (window.hero.width/2),
      y: window.hero.y,
    })
  }

  if(direction.down) {
    Object.assign(shooted, {
      x: window.hero.x + (window.hero.width/2),
      y: window.hero.y + window.hero.height,
    })
  }

  if(direction.right) {
    Object.assign(shooted, {
      x: window.hero.x + window.hero.width,
      y: window.hero.y + (window.hero.height/2),
    })
  }

  if(direction.left) {
    Object.assign(shooted, {
      x: window.hero.x,
      y: window.hero.y + (window.hero.height/2),
    })
  }

  addObjects([shooted])
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
      x: window.hero.x,
      y: window.hero.y - window.hero.height,
    })
  }

  if(directions.down) {
    Object.assign(wall, {
      x: window.hero.x,
      y: window.hero.y + window.hero.height,
    })
  }

  if(directions.right) {
    Object.assign(wall, {
      x: window.hero.x + window.hero.width,
      y: window.hero.y,
    })
  }

  if(direction.left) {
    Object.assign(wall, {
      x: window.hero.x - window.hero.width,
      y: window.hero.y,
    })
  }

  addObjects([wall])
}

export default {
  shootBullet,
  dropWall,
}
