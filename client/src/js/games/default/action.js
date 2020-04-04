import collisions from '../../collisions'
import gridTool from '../../grid.js'
import pathfinding from '../../pathfinding.js'

function shootBullet() {
  let direction = window.hero.inputDirection
  let shooted = {
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

export default {
  shootBullet,
  dropWall,
}
