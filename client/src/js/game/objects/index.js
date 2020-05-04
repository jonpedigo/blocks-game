import onObjectCollide from './onObjectCollide'
import pathfinding from '../../utils/pathfinding.js'
import collisions from '../../utils/collisions'
import grid from '../../utils/grid.js'

class Objects{
  constructor() {
    window.defaultObject = {
      velocityX: 0,
      velocityY: 0,
      velocityMax: 100,
      speed: 100,
      color: '#525252',
      // cant put objects in it cuz of some pass by reference BS...
    }
  }

  onGameLoaded() {
    window.defaultObject.tags = JSON.parse(JSON.stringify(window.tags))
  }

  onObjectCollide(agent, collider, result, removeObjects, respawnObjects) {
    onObjectCollide(agent, collider, result, removeObjects, respawnObjects)
  }

  forAllSubObjects(subObjects, fx) {
    Object.keys(subObjects).forEach((id) => {
      fx(subObjects[id], id)
    })
  }

  respawn(object) {
    object.x = object.spawnPointX
    object.y = object.spawnPointY
  }

  migratePos(object, newPos) {
    let diffX = newPos.x - object.x
    let diffY = newPos.y - object.y
    //also update children
    // console.log(diffX, diffY, newPos, object)

    // game.objects.forEach((childObject) => {
    //   if(childObject.parentId === object.id) {
    //     window.setObjectPos(childObject, {x: childObject.x + diffX, y: childObject.y + diffY}, game)
    //   }
    // })

    if(object.pathfindingLimit) {
      // you need to make sure diffX, diffY is also at the x, y grid locations ( the object could be inbetween grids if it has velocity )
      const { x, y } = grid.snapXYToGrid(diffX, diffY)
      object.pathfindingLimit.x += x
      object.pathfindingLimit.y += y
      // grid.snapDragToGrid(object.pathfindingLimit, {dragging: true})
    }

    object.spawnPointX += diffX
    object.spawnPointY += diffY
    object.x = newPos.x
    object.y = newPos.y
  }

  removeState(object, options = { skipPos : false }) {
    if(!options.skipPos) {
      delete object.x
      delete object.y
    }
    delete object._initialY
    delete object._initialX
    delete object._deltaY
    delete object._deltaX
    delete object.velocityY
    delete object.velocityX
    delete object.spawnedIds
    delete object.spawnWait
    delete object.target
    delete object.path
    delete object.removed
    delete object.lastPowerUpId
    delete object.direction
    delete object.gridX
    delete object.gridY
    delete object.spawnPool
    delete object._parentId
    delete object._skipNextGravity
    delete object.fresh
    delete object.i
  }

  cleanForSave(object) {
    delete object._initialY
    delete object._initialX
    delete object._deltaY
    delete object._deltaX
    delete object.velocityY
    delete object.velocityX
    delete object.lastPowerUpId
    delete object.direction
    delete object.gridX
    delete object.gridY
    delete object._parentId
    delete object._skipNextGravity
    delete object.i
    delete object.interactableObject
    delete object.gridHeight
    delete object.gridWidth
    delete object.onGround
  }

  getMapState(object) {
    let mapState = {
      id: object.id,
      x: object.x,
      y: object.y,
      width: object.width,
      height: object.height,
      color: object.color,
      name: object.name,
      namePos: object.namePos,
      removed: object.removed,
    }

    if(object.subObjects) {
      mapState.subObjects = {}
      OBJECTS.forAllSubObjects(object.subObjects, (subObject, key) => {
        mapState.subObjects[key] = {}
        mapState.subObjects[key].x = subObject.x
        mapState.subObjects[key].y = subObject.y
        mapState.subObjects[key].width = subObject.width
        mapState.subObjects[key].height = subObject.height
      })
    }

    return mapState
  }

  anticipatedAdd(hero) {
    const { minX, maxX, minY, maxY, centerY, centerX, leftDiff, rightDiff, topDiff, bottomDiff, cameraHeight, cameraWidth } = HERO.getViewBoundaries(hero)

    let isWall = OBJECTS.anticipatedForAdd.wall

    if (leftDiff < 1 && hero.directions.left) {
      let newObject = {
        x: minX - GAME.grid.nodeSize,
        y: isWall ? minY + ( GAME.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minY, maxY),
        width: GAME.grid.nodeSize,
        height: isWall ? (HERO.cameraHeight * 2) - (GAME.grid.nodeSize * 3) : GAME.grid.nodeSize,
      }
      addAnticipatedObject(newObject)
    } else if (topDiff < 1 && hero.directions.up) {
      let newObject = {
        x: isWall ? minX + ( GAME.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minX, maxX),
        y: minY - GAME.grid.nodeSize,
        width: isWall ? (HERO.cameraWidth * 2) - (GAME.grid.nodeSize * 4) : GAME.grid.nodeSize,
        height: GAME.grid.nodeSize,
      }
      addAnticipatedObject(newObject)
    } else if (rightDiff > GAME.grid.nodeSize - 1 && hero.directions.right) {
      let newObject = {
        x: maxX + GAME.grid.nodeSize,
        y: isWall ? minY + ( GAME.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minY, maxY),
        width: GAME.grid.nodeSize,
        height: isWall ? (HERO.cameraHeight * 2) - (GAME.grid.nodeSize * 4) : GAME.grid.nodeSize,
      }
      addAnticipatedObject(newObject)
    } else if (bottomDiff > GAME.grid.nodeSize - 1 && hero.directions.down) {
      let newObject = {
        x: isWall ? minX + ( GAME.grid.nodeSize * 2) : grid.getRandomGridWithinXY(minX, maxX),
        y: maxY + GAME.grid.nodeSize,
        width: isWall ? (HERO.cameraWidth * 2) - (GAME.grid.nodeSize * 4) : GAME.grid.nodeSize,
        height: GAME.grid.nodeSize,
      }
      addAnticipatedObject(newObject)
    }

    function addAnticipatedObject(newObject) {
      let {x , y} = grid.snapXYToGrid(newObject.x, newObject.y)
      if(grid.keepGridXYWithinBoundaries(x/GAME.grid.nodeSize, y/GAME.grid.nodeSize) && grid.keepGridXYWithinBoundaries((x + newObject.width)/GAME.grid.nodeSize, (y + newObject.height)/GAME.grid.nodeSize)) {
        OBJECTS.create([{...newObject, ...OBJECTS.anticipatedForAdd}])
        OBJECTS.anticipatedForAdd = null
      }
    }
  }

  create(objects, options = { bypassCollisions: false, fromLiveGame: false }) {
    if(!objects.length) {
      objects = [objects]
    }

    let alertAboutCollision
    let hasBeenWarned = false

    objects = objects.map((newObject, i) => {
      newObject = window.mergeDeep(JSON.parse(JSON.stringify(window.defaultObject)), newObject)

      if(!newObject.id){
        newObject.id = 'object-' + window.uniqueID() + '-' + i;
      }

      if(newObject.compendiumId) {
        newObject.fromCompendiumId = newObject.compendiumId
        delete newObject.compendiumId
      }

      newObject.spawnPointX = newObject.x
      newObject.spawnPointY = newObject.y

      if(!GAME.world.globalTags.calculatePathCollisions) {
        GAME.addObstacle(newObject)
      }

      if(newObject.tags.obstacle && collisions.check(newObject, GAME.objects) && !options.bypassCollisions) {
        alertAboutCollision = true
      }

      //ALWAYS CONTAIN WITHIN BOUNDARIES OF THE GRID!!
      if(newObject.x + newObject.width > (GAME.grid.nodeSize * GAME.grid.width) + GAME.grid.startX) {
        if(PAGE.role.isPlayEditor && !hasBeenWarned) alert('adding obj outside grid system, canceled')
        hasBeenWarned = true
        return null
      }
      if(newObject.y + newObject.height > (GAME.grid.nodeSize * GAME.grid.height) + GAME.grid.startY) {
        if(PAGE.role.isPlayEditor && !hasBeenWarned) alert('adding obj outside grid system, canceled')
        hasBeenWarned = true
        return null
      }
      if(newObject.x < GAME.grid.startX) {
        if(PAGE.role.isPlayEditor && !hasBeenWarned) alert('adding obj outside grid system, canceled')
        hasBeenWarned = true
        return null
      }
      if(newObject.y < GAME.grid.startY) {
        if(PAGE.role.isPlayEditor && !hasBeenWarned) alert('adding obj outside grid system, canceled')
        hasBeenWarned = true
        return null
      }

      return newObject
    }).filter(obj => !!obj)

    if(PAGE.role.isPlayEditor && !options.fromLiveGame) {
      if(alertAboutCollision) {
        if(!confirm('already an object on this grid node..confirm to add anyways')) return
      }

      let warnings = ""
      let sampleObject = objects[0]
      if(!sampleObject.tags.obstacle) {
        warnings+= 'NOT obstacle\n\n'
      }
      if(!sampleObject.tags.stationary) {
        warnings+= 'NOT stationary - does NOT effect pathfinding\n\n'
      }

      warnings+= "TAGS:\n"
      Object.keys(sampleObject.tags).forEach((tagName) => {
        if(sampleObject.tags[tagName] === true) {
          warnings+= tagName+'\n'
        }
      })
      if(sampleObject.velocityX || sampleObject.velocityY) {
        warnings += 'has VELOCITY\n'
      }
      if(sampleObject.heroUpdate) {
        warnings += 'has GAME.heros[HERO.id] UPDATE\n'
      }
      if(sampleObject.objectUpdate) {
        warnings += 'has OBJECT UPDATE\n'
      }

      if(confirm(warnings)) {
        emitNewObjects()
      }
    } else {
      emitNewObjects()
    }

    function emitNewObjects() {
      if(window.editingGame && window.editingGame.branch && !options.fromLiveGame) {
        window.branch.objects.push(...objects)
      } else {
        window.socket.emit('addObjects', objects)
      }
    }

    return objects
  }

  onEditObjects(editedObjects) {
    editedObjects.forEach((obj) => {
      // slow down that gravity boi!
      if(GAME.objectsById[obj.id].tags.gravity === true && obj.tags.gravity === false) {
        obj.velocityY = 0
      }
      let objectById = GAME.objectsById[obj.id]
      obj.path = null
      window.mergeDeep(objectById, obj)
    })

    GAME.resetPaths = true

    window.local.emit('onUpdatePFgrid')
  }

  onAnticipateObject(object) {
    OBJECTS.anticipatedForAdd = object
  }

  addObject(object) {
    object.tags = window.mergeDeep(JSON.parse(JSON.stringify(window.defaultTags)), object.tags)
    GAME.objectsById[object.id] = object
    PHYSICS.addObject(object)
  }

  removeObject(object) {
    GAME.objectsById[object.id].removed = true
    window.local.emit('onUpdatePFgrid')
  }

  onDeleteObject(object) {
    let spliceIndex
    GAME.objects.forEach((obj, i) => {
      if(obj.id == object.id) {
        spliceIndex = i
      }
    })
    if(spliceIndex >= 0) {
      GAME.objects.splice(spliceIndex, 1)
    }
    PHYSICS.removeObject(object)
    delete GAME.objectsById[object.id]
    window.local.emit('onUpdatePFgrid')
  }

  onNetworkUpdateObjects(objectsUpdated) {
    if(!PAGE.gameLoaded) return
    if(!PAGE.role.isHost) {
      objectsUpdated.forEach((obj) => {
        let objectById = GAME.objectsById[obj.id]
        window.mergeDeep(objectById, obj)
      })
    }
  }

  onNetworkAddObjects(objectsAddedd) {
    GAME.objects.push(...objectsAdded)
    objectsAdded.forEach((object) => {
      OBJECTS.addObject(object)
    })
    window.local.emit('onUpdatePFgrid')
  }
}

window.OBJECTS = new Objects()
