function shootBullet({ pos, tags, directions }) {
  let shooted = {
    id: 'bullet-' + window.uniqueID(),
    width: 4,
    height: 4,
    tags: {
      monsterDestroyer: true,
    },
  }

  if(directions.up) {
    Object.assign(shooted, {
      x: pos.x + (pos.width/2),
      y: pos.y,
      veloctyY: -10,
    })
  } else if(directions.down) {
    Object.assign(shooted, {
      x: pos.x + (pos.width/2),
      y: pos.y + pos.height,
      veloctyY: 10,
    })
  } else if(directions.right) {
    Object.assign(shooted, {
      x: pos.x + pos.width,
      y: pos.y + (pos.height/2),
      veloctyX: 10,
    })
  } else if(directions.left) {
    Object.assign(shooted, {
      x: pos.x,
      y: pos.y + (pos.height/2),
      veloctyX: -10,
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

  OBJECTS.create([wall], { fromLiveGame: true })
}

export {
  shootBullet,
  dropWall,
}
