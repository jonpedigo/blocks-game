function shootBullet({ pos, actionProps, direction }) {
  let shooted = {
    id: 'bullet-' + window.uniqueID(),
    width: 4,
    height: 4,
    tags: actionProps.shootTags,
  }

  const velocity = actionProps.shootVelocity || 100

  if(direction === 'up') {
    Object.assign(shooted, {
      x: pos.x + (pos.width/2),
      y: pos.y,
      velocityY: -velocity,
    })
  } else if(direction === 'down') {
    Object.assign(shooted, {
      x: pos.x + (pos.width/2),
      y: pos.y + pos.height,
      velocityY: velocity,
    })
  } else if(direction === 'right') {
    Object.assign(shooted, {
      x: pos.x + pos.width,
      y: pos.y + (pos.height/2),
      velocityX: velocity,
    })
  } else if(direction === 'left') {
    Object.assign(shooted, {
      x: pos.x,
      y: pos.y + (pos.height/2),
      velocityX: -velocity,
    })
  }

  OBJECTS.create([shooted], { fromLiveGame: true })
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

  if(direction === 'up') {
    Object.assign(wall, {
      x: hero.x,
      y: hero.y - hero.height,
    })
  }

  if(direction === 'down') {
    Object.assign(wall, {
      x: hero.x,
      y: hero.y + hero.height,
    })
  }

  if(direction === 'right') {
    Object.assign(wall, {
      x: hero.x + hero.width,
      y: hero.y,
    })
  }

  if(direction === 'left') {
    Object.assign(wall, {
      x: hero.x - hero.width,
      y: hero.y,
    })
  }

  OBJECTS.create([wall], { fromLiveGame: true })
}

export {
  shootBullet,
  dropWall,
}
