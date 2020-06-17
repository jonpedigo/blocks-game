import onObjectCollide from './onObjectCollide'
import pathfinding from '../../utils/pathfinding.js'
import collisions from '../../utils/collisions'
import gridUtil from '../../utils/grid.js'
import triggers from '../triggers.js'

class Objects{
  constructor() {
    window.defaultSubObject = {
      relativeX: 0, relativeY: 0
    }

    window.defaultObject = {
      velocityX: 0,
      velocityY: 0,
      velocityMax: 100,
      speed: 100,
      subObjects: {},
    }
  }

  onGridLoaded() {
    window.defaultSubObject.width = GAME.grid.nodeSize
    window.defaultSubObject.height = GAME.grid.nodeSize
    window.defaultSubObject.tags = JSON.parse(JSON.stringify(window.subObjectTags))
  }

  onGameLoaded() {
    window.defaultObject.tags = window.tags
  }

  onObjectCollide(agent, collider, result) {
    onObjectCollide(agent, collider, result)
  }

  forAllSubObjects(subObjects, fx) {
    Object.keys(subObjects).forEach((id) => {
      fx(subObjects[id], id)
    })
  }

  respawn(object) {
    let originalX = object.x
    const {x, y } = OBJECTS.getSpawnCoords(object)
    object.x = x
    object.y = y
    object.velocityX = 0
    object.velocityY = 0
  }

  getSpawnCoords(object) {
    return {
      x: object.spawnPointX,
      y: object.spawnPointY
    }
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
      const { x, y } = gridUtil.snapXYToGrid(diffX, diffY)
      object.pathfindingLimit.x += x
      object.pathfindingLimit.y += y
      // grid.snapDragToGrid(object.pathfindingLimit, {dragging: true})
    }

    object.spawnPointX += diffX
    object.spawnPointY += diffY
    object.x = newPos.x
    object.y = newPos.y
  }

  getState(object) {
    let state = {
      x: object.x,
      y: object.y,
      _initialY: object._initialY,
      _initialX: object._initialX,
      _deltaY: object._deltaY,
      _deltaX: object._deltaX,
      velocityY: object.velocityY,
      velocityX: object.velocityX,
      target: object.target,
      path: object.path,
      lastHeroUpdateId: object.lastHeroUpdateId,
      direction: object.direction,
      fresh: object.fresh,
      gridX: object.gridX,
      gridY: object.gridY,
      sprite: object.sprite,
      _parentId: object._parentId,
      _skipNextGravity: object._skipNextGravity,
      gridHeight: object.gridHeight,
      gridWidth: object.gridWidth,
      onGround: object.onGround,
      removed: object.removed,
      spawned: object.spawned,
      spawnedIds: object.spawnedIds,
      spawnWait: object.spawnWait,
      spawnPool: object.spawnPool,
      customState: object.customState,
    }

    if(object.subObjects) {
      state.subObjects = {}
      OBJECTS.forAllSubObjects(object.subObjects, (subObject, subObjectName) => {
        state.subObjects[subObjectName] = OBJECTS.getState(subObject)
        window.removeFalsey(state.subObjects[subObjectName])
      })
    }

    if(object.triggers) {
      state.triggers = {}
      Object.keys(object.triggers).forEach((triggerId) => {
        const { pool, eventCount, disabled } = object.triggers[triggerId]

        state.triggers[triggerId] = {
          pool,
          eventCount,
          disabled,
        }

        window.removeFalsey(state.triggers[triggerId])
      })
    }

    return state
  }

  getProperties(object) {
    let properties = {
      id: object.id,
      velocityMax: object.velocityMax,
      speed: object.speed,
      width: object.width,
      height: object.height,
      tags: object.tags,
      color: object.color,
      defaultSprite: object.defaultSprite,
      upSprite: object.upSprite,
      leftSprite: object.leftSprite,
      downSprite: object.downSprite,
      rightSprite: object.rightSprite,
      spawnPointX: object.spawnPointX,
      spawnPointY: object.spawnPointY,
      heroUpdate: object.heroUpdate,
      heroDialogue: object.heroDialogue,
      objectUpdate: object.objectUpdate,
      pathfindingLimit: object.pathfindingLimit,
      relativeX: object.relativeX,
      relativeY: object.relativeY,
      relativeId: object.relativeId,
      parentId: object.parentId,
      name: object.name,
      namePos: object.namePos,
      questGivingId: object.questGivingId,
      questCompleterId: object.questCompleterId,

      subObjects: object.subObjects,
      originalHeight: object.originalHeight,
      originalWidth: object.originalWidth,

      //
      constructParts: object.constructParts && object.constructParts.map((part) => {
        return {
          id: part.id,
          x: part.x,
          y: part.y,
          color: part.color,
          height: part.height,
          width: part.width,
          ownerId: part.ownerId,
        }
      }),

      // sub objects
      changeWithDirection: object.changeWithDirection,
      relativeWidth: object.relativeWidth,
      relativeHeight: object.relativeHeight,

      //spawn objects
      spawnPoolInitial: object.spawnPoolInitial,
      spawnWaitTimer: object.spawnWaitTimer,
      spawnLimit: object.spawnLimit,
      spawnSubObjectName: object.spawnSubObjectName,

      powerUpTimer: object.powerUpTimer,

      //compendium
      compendiumId: object.compendiumId,
      fromCompendiumId: object.compendiumId,

      customProps: object.customProps,
    }

    if(object.subObjects) {
      properties.subObjects = {}
      OBJECTS.forAllSubObjects(object.subObjects, (subObject, subObjectName) => {
        properties.subObjects[subObjectName] = OBJECTS.getProperties(subObject)
      })
    }

    if(object.triggers) {
      properties.triggers = {}
      Object.keys(object.triggers).forEach((triggerId) => {
        const { id, eventName, effectName, eventThreshold, effectValue, mutationJSON, subObjectName, mainObjectId, mainObjectTag, otherObjectId, otherObjectTag, initialPool } = object.triggers[triggerId]

        properties.triggers[triggerId] = {
          id,
          eventName,
          effectName,
          effectValue,
          eventThreshold,
          mutationJSON,
          subObjectName,
          mainObjectId,
          mainObjectTag,
          otherObjectId,
          otherObjectTag,
          initialPool,
        }

        window.removeFalsey(properties.triggers[triggerId])
      })
    }

    return properties
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
      sprite: object.sprite,
      namePos: object.namePos,
      removed: object.removed,
      spawnPointX: object.spawnPointX,
      spawnPointY: object.spawnPointY,
      constructParts: object.constructParts && object.constructParts.map((part) => {
        return {
          ownerId: part.ownerId,
          x: part.x,
          y: part.y,
          color: part.color,
          height: part.height,
          width: part.width,
        }
      }),
    }

    if(object.subObjects) {
      mapState.subObjects = {}
      OBJECTS.forAllSubObjects(object.subObjects, (subObject, subObjectName) => {
        mapState.subObjects[subObjectName] = {}
        mapState.subObjects[subObjectName].x = subObject.x
        mapState.subObjects[subObjectName].y = subObject.y
        mapState.subObjects[subObjectName].width = subObject.width
        mapState.subObjects[subObjectName].height = subObject.height
      })
    }

    return mapState
  }

  isInteractable(object) {
    if((object.tags['completeQuestOnHeroInteract'] && object.tags['questCompleter']) || (object.tags['giveQuestOnHeroInteract'] && object.tags['questGiver'])) return true

    if(object.tags['spawnOnHeroInteract'] && object.tags.spawnZone) return true

    if(object.tags['updateHeroOnHeroInteract'] && object.tags.heroUpdate) return true

    if(object.tags['talkOnHeroInteract'] && object.tags.talker) return true

    if(object.tags['showInteractBorder']) return true

    return false
  }

  anticipatedAdd(hero) {
    const { minX, maxX, minY, maxY, centerY, centerX, leftDiff, rightDiff, topDiff, bottomDiff, cameraHeight, cameraWidth } = HERO.getViewBoundaries(hero)

    let isWall = OBJECTS.anticipatedForAdd.wall

    if (leftDiff < 1 && hero.directions.left) {
      let newObject = {
        x: minX - GAME.grid.nodeSize,
        y: isWall ? minY + ( GAME.grid.nodeSize * 2) : gridUtil.getRandomGridWithinXY(minY, maxY),
        width: GAME.grid.nodeSize,
        height: isWall ? (HERO.cameraHeight * 2) - (GAME.grid.nodeSize * 3) : GAME.grid.nodeSize,
      }
      addAnticipatedObject(newObject)
    } else if (topDiff < 1 && hero.directions.up) {
      let newObject = {
        x: isWall ? minX + ( GAME.grid.nodeSize * 2) : gridUtil.getRandomGridWithinXY(minX, maxX),
        y: minY - GAME.grid.nodeSize,
        width: isWall ? (HERO.cameraWidth * 2) - (GAME.grid.nodeSize * 4) : GAME.grid.nodeSize,
        height: GAME.grid.nodeSize,
      }
      addAnticipatedObject(newObject)
    } else if (rightDiff > GAME.grid.nodeSize - 1 && hero.directions.right) {
      let newObject = {
        x: maxX + GAME.grid.nodeSize,
        y: isWall ? minY + ( GAME.grid.nodeSize * 2) : gridUtil.getRandomGridWithinXY(minY, maxY),
        width: GAME.grid.nodeSize,
        height: isWall ? (HERO.cameraHeight * 2) - (GAME.grid.nodeSize * 4) : GAME.grid.nodeSize,
      }
      addAnticipatedObject(newObject)
    } else if (bottomDiff > GAME.grid.nodeSize - 1 && hero.directions.down) {
      let newObject = {
        x: isWall ? minX + ( GAME.grid.nodeSize * 2) : gridUtil.getRandomGridWithinXY(minX, maxX),
        y: maxY + GAME.grid.nodeSize,
        width: isWall ? (HERO.cameraWidth * 2) - (GAME.grid.nodeSize * 4) : GAME.grid.nodeSize,
        height: GAME.grid.nodeSize,
      }
      addAnticipatedObject(newObject)
    }

    function addAnticipatedObject(newObject) {
      let {x , y} = gridUtil.snapXYToGrid(newObject.x, newObject.y)
      if(gridUtil.keepGridXYWithinBoundaries(x/GAME.grid.nodeSize, y/GAME.grid.nodeSize) && gridUtil.keepGridXYWithinBoundaries((x + newObject.width)/GAME.grid.nodeSize, (y + newObject.height)/GAME.grid.nodeSize)) {
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

      if(!GAME.world.tags.calculatePathCollisions) {
        GAME.addObstacle(newObject)
      }

      if(newObject.tags.obstacle && collisions.check(newObject, GAME.objects) && !options.bypassCollisions) {
        alertAboutCollision = true
      }

      //ALWAYS CONTAIN WITHIN BOUNDARIES OF THE GRID!!
      if(newObject.x + newObject.width > (GAME.grid.nodeSize * GAME.grid.width) + GAME.grid.startX) {
        if(PAGE.role.isPlayEditor && !window.playEditorKeysDown[18] && !hasBeenWarned) alert('adding obj outside grid system, canceled')
        hasBeenWarned = true
        return null
      }
      if(newObject.y + newObject.height > (GAME.grid.nodeSize * GAME.grid.height) + GAME.grid.startY) {
        if(PAGE.role.isPlayEditor && !window.playEditorKeysDown[18] && !hasBeenWarned) alert('adding obj outside grid system, canceled')
        hasBeenWarned = true
        return null
      }
      if(newObject.x < GAME.grid.startX) {
        if(PAGE.role.isPlayEditor && !window.playEditorKeysDown[18] && !hasBeenWarned) alert('adding obj outside grid system, canceled')
        hasBeenWarned = true
        return null
      }
      if(newObject.y < GAME.grid.startY) {
        if(PAGE.role.isPlayEditor && !window.playEditorKeysDown[18] && !hasBeenWarned) alert('adding obj outside grid system, canceled')
        hasBeenWarned = true
        return null
      }

      return newObject
    }).filter(obj => !!obj)

    if(PAGE.role.isPlayEditor && !options.fromLiveGame && !window.playEditorKeysDown[18]) {
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

  editObject(object, update) {
    // slow down that gravity boi!
    if(object.tags.gravityY === true && update.tags && update.tags.gravityY === false) {
      update.velocityY = 0
    }

    if(update.constructParts) {
      if(object.constructParts) {
        object.constructParts.forEach((part) => {
          PHYSICS.removeObject(part)
        })
      } else {
        PHYSICS.removeObject(object)
      }
      update.constructParts.forEach((part) => {
        part.id = window.uniqueID()
        part.ownerId = object.id
        PHYSICS.addObject(part)
      })
    } else if(object.constructParts) {
      PHYSICS.addObject(object)
    }

    object.path = null
    window.mergeDeep(object, update)
  }

  onEditObjects(editedObjects) {
    editedObjects.forEach((obj) => {
      let objectById = GAME.objectsById[obj.id]
      OBJECTS.editObject(objectById, obj)
    })

    GAME.resetPaths = true

    window.local.emit('onUpdatePFgrid')
  }

  onAnticipateObject(object) {
    OBJECTS.anticipatedForAdd = object
  }

  addObject(object) {
    object.tags = window.mergeDeep(JSON.parse(JSON.stringify({...window.defaultTags, object: true})), object.tags)
    GAME.objectsById[object.id] = object
    if(object.subObjects) {
      OBJECTS.forAllSubObjects(object.subObjects, (subObject, subObjectName) => {
        OBJECTS.addSubObject(object, subObject, subObjectName)
      })
    }
    if(object.constructParts) {
      object.constructParts.forEach((part) => {
        part.id = window.uniqueID()
        part.ownerId = object.id
        PHYSICS.addObject(part)
      })
    } else {
      PHYSICS.addObject(object)
    }

    if(object.triggers) {
      Object.keys(object.triggers).forEach((triggerId) => {
        const trigger = object.triggers[triggerId]
        triggers.addTrigger(object, trigger)
      })
    }
  }

  addSubObject(owner, subObject, subObjectName) {
    subObject = window.mergeDeep(JSON.parse(JSON.stringify(window.defaultSubObject)), subObject)
    subObject.ownerId = owner.id
    subObject.subObjectName = subObjectName
    subObject.id = subObjectName + '-' + window.uniqueID()
    if(!subObject.originalWidth) subObject.originalWidth  = subObject.width
    if(!subObject.originalHeight) subObject.originalHeight = subObject.height

    owner.subObjects[subObjectName] = subObject
    if(!subObject.tags.potential && subObjectName !== 'spawner') PHYSICS.addObject(subObject)
  }

  deleteSubObject(owner, subObject, subObjectName) {
    if(!subObject.tags.potential && subObjectName !== 'spawner') PHYSICS.removeObject(subObject)
    delete owner.subObjects[subObjectName]
  }

  getOwner(subObject) {
    let owner = OBJECTS.getObjectOrHeroById(subObject.ownerId)
    if(!owner) {
      owner = OBJECTS.getRelative(subObject.relativeId)
    }
    if(!owner) {
      owner = OBJECTS.getParent(subObject.parentId)
    }
    return owner
  }

  getParent(subObject) {
    return OBJECTS.getObjectOrHeroById(subObject.parentId)
  }

  getRelative(subObject) {
    return OBJECTS.getObjectOrHeroById(subObject.relativeId)
  }

  getObjectOrHeroById(id) {
    let object = GAME.objectsById[id]
    if(object) return object

    let hero = GAME.heros[id]
    if(hero) return hero
  }

  removeObject(object) {
    GAME.objectsById[object.id].removed = true
    OBJECTS.forAllSubObjects(object.subObjects, (subObject, subObjectName) => {
      subObject.removed = true
    })
    window.local.emit('onUpdatePFgrid')
  }

  unloadObject(object) {
    if(object.subObjects) {
      OBJECTS.forAllSubObjects(object.subObjects, (subObject, subObjectName) => {
        OBJECTS.deleteSubObject(object, subObject, subObjectName)
      })
    }
    if(object.constructParts) {
      object.constructParts.forEach((part) => {
        PHYSICS.removeObject(part)
      })
    } else {
      PHYSICS.removeObject(object)
    }
  }

  deleteObject(object) {
    OBJECTS.unloadObject(object)
    let spliceIndex
    GAME.objects.forEach((obj, i) => {
      if(obj.id == object.id) {
        spliceIndex = i
      }
    })
    if(spliceIndex >= 0) {
      GAME.objects.splice(spliceIndex, 1)
    }
    delete GAME.objectsById[object.id]
  }

  onDeleteObject(object) {
    OBJECTS.deleteObject(object)
    window.local.emit('onUpdatePFgrid')
  }

  onDeleteSubObject(owner, subObjectName) {
    const subObject = owner.subObjects[subObjectName]
    if(owner.tags.hero) {
      OBJECTS.deleteSubObject(GAME.heros[owner.id], subObject, subObjectName)
    } else {
      OBJECTS.deleteSubObject(GAME.objectsById[owner.id], subObject, subObjectName)
    }
  }

  onAddSubObject(owner, subObject, subObjectName) {
    if(owner.tags.hero) {
      if(!GAME.heros[owner.id].subObjects) GAME.heros[owner.id].subObjects = {}
      OBJECTS.addSubObject(GAME.heros[owner.id], subObject, subObjectName)
    } else {
      if(!GAME.objectsById[owner.id].subObjects) GAME.objectsById[owner.id].subObjects = {}
      OBJECTS.addSubObject(GAME.objectsById[owner.id], subObject, subObjectName)
    }
  }

  onRemoveSubObject(ownerId, subObjectName) {
    OBJECTS.removeSubObject(ownerId, subObjectName)
  }

  removeSubObject(ownerId, subObjectName) {
    const owner = OBJECTS.getObjectOrHeroById(ownerId)
    owner.subObjects[subObjectName].removed = true
  }

  onEditSubObject(ownerId, subObjectName, update) {
    const owner = OBJECTS.getObjectOrHeroById(ownerId)
    window.mergeDeep(owner.subObjects[subObjectName], update)
    owner.subObjects[subObjectName].originalWidth = owner.subObjects[subObjectName].width
    owner.subObjects[subObjectName].originalHeight = owner.subObjects[subObjectName].height
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

  onNetworkUpdateObjectsComplete(objectsUpdated) {
    if(!PAGE.gameLoaded) return
    if(!PAGE.role.isHost) {
      GAME.objects = objectsUpdated
      GAME.objects.forEach((object) => {
        GAME.objectsById[object.id] = object
      })
    }
  }

  onNetworkAddObjects(objectsAdded) {
    GAME.objects.push(...objectsAdded)
    objectsAdded.forEach((object) => {
      OBJECTS.addObject(object)
    })
    window.local.emit('onUpdatePFgrid')
  }

  getRelativeXY(object, relative) {
    return {
      relativeX: object.x - relative.x,
      relativeY: object.y - relative.y
    }
  }
  getRelativeCenterXY(object, relative) {
    return {
      relativeX: (object.x + object.width/2) - (relative.x + relative.width/2),
      relativeY: (object.y + object.height/2) - (relative.y + relative.height/2)
    }
  }
}

window.OBJECTS = new Objects()
