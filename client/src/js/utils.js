import grid from './grid.js'
import collisions from './collisions.js'
import physics from './physics.js'
import pathfinding from './pathfinding.js'

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

window.mergeDeep = mergeDeep

window.getViewBoundaries = function(hero) {
  const value = {
    width: window.CONSTANTS.PLAYER_CAMERA_WIDTH * hero.zoomMultiplier,
    height: window.CONSTANTS.PLAYER_CAMERA_HEIGHT * hero.zoomMultiplier,
    centerX: hero.x + hero.width/2,
    centerY: hero.y + hero.height/2,
  }
  value.x = value.centerX - value.width/2
  value.y = value.centerY - value.height/2
  const { leftDiff, rightDiff, topDiff, bottomDiff } = grid.getAllDiffs(value)
  grid.snapDragToGrid(value)

  return {
    centerX: value.centerX,
    centerY: value.centerY,
    minX: value.x,
    minY: value.y,
    maxX: value.x + value.width,
    maxY: value.y + value.height,
    leftDiff,
    rightDiff,
    topDiff,
    bottomDiff,
  }
}

window.resetReachablePlatformHeight = function(heroIn) {
	let velocity = heroIn.jumpVelocity
	let gravity = 1000
	let delta = (0 - velocity)/gravity
	let height = (velocity * delta) +  ((gravity * (delta * delta))/2)
	return height
}

window.resetReachablePlatformWidth = function(heroIn) {
	let velocity = heroIn.speed
	let gravity = 1000
	let deltaInAir = (0 - heroIn.jumpVelocity)/gravity
	let width = (velocity * deltaInAir)
	return width * 2
}

window.addObjects = function(objects, options = { bypassCollisions: false, instantAdd: true }) {
  if(!objects.length) {
    objects = [objects]
  }

  let alertAboutCollision

  objects = objects.map((newObject) => {
    Object.assign(newObject, {...window.defaultObject})

    if(!newObject.id){
      newObject.id = 'object' + Date.now();
    }

    if(!newObject.tags){
      newObject.tags = {};
    }

    if(!newObject.heroUpdate){
      newObject.heroUpdate = {};
    }

    for(let tag in window.tags) {
      if(window.tags[tag].checked || newObject.tags[tag] === true){
        if(tag === 'monster' && window.usePlayEditor && !(window.preferences.worldSpawnPointX >= 0 || window.editingHero.spawnPointX >= 0)) {
          alert('You cannot add a monster without setting spawn point first')
          return
        }
        newObject.tags[tag] = true
      } else {
        newObject.tags[tag] = false
      }
    }

    newObject.spawnPointX = newObject.x
    newObject.spawnPointY = newObject.y

    if(!window.preferences.calculatePathCollisions) {
      grid.addObstacle(newObject)
    }

    if(collisions.check(newObject, window.objects) || options.bypassCollisions) {
      alertAboutCollision = true
    }

    return newObject
  }).filter(obj => !!obj)

  if(!window.usePlayEditor){
    window.objects.push(...objects)
    objects.forEach((object) => {
      physics.addObject(object)
    })

    if(!window.preferences.calculatePathCollisions) {
      grid.updateGridObstacles()
      window.resetPaths = true
      window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }
    return
  }

  if(alertAboutCollision) {
    if(confirm('already an object on this grid node..confirm to add anyways')) {
      emitNewObjects()
    }
  } else {
    emitNewObjects()
  }

  function emitNewObjects() {
    if(window.instantAddToggle.checked || options.instantAddToggle) {
      // need to do a local add first
      window.objects.push(...objects)
      window.socket.emit('addObjects', objects)
    } else {
      window.objectFactory.push(...objects)
    }
  }
}
