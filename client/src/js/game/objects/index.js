import onObjectCollide from './onObjectCollide'
import pathfinding from '../../utils/pathfinding.js'
import collisions from '../../utils/collisions'
import gridUtil from '../../utils/grid.js'
import triggers from '../triggers.js'
import { dropObject, equipSubObject, unequipSubObject } from '../heros/inventory.js'
import { addHook, deleteHook } from '../hooks.js'
import { spawnAllNow, destroySpawnIds } from '../spawnZone.js'
import { setTarget, setPathTarget } from '../ai/pathfinders.js'

class Objects{
  constructor() {
    window.defaultObjectColor = '#525252'
    window.defaultSubObject = {
      relativeX: 0, relativeY: 0,
      objectType: 'subObject',
      count: 1,
    }

    window.defaultObject = {
      velocityX: 0,
      velocityY: 0,
      velocityMax: 100,
      speed: 100,
      subObjects: {},
      objectType: 'plainObject',
    }
  }

  onGridLoaded() {
    window.defaultObject.width = GAME.grid.nodeSize
    window.defaultObject.height = GAME.grid.nodeSize
    window.defaultSubObject.width = GAME.grid.nodeSize
    window.defaultSubObject.height = GAME.grid.nodeSize
    window.defaultSubObject.tags = JSON.parse(JSON.stringify(window.subObjectTags))
  }

  onGameLoaded() {
    // window.defaultObject.tags = window.tags
    // window.mergeDeep(window.defaultObject.tags, window.plainObjectTags)
  }

  onObjectCollide(agent, collider, result) {
    onObjectCollide(agent, collider, result)
  }

  forAllSubObjects(subObjects, fx) {
    if(!subObjects) return
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
      x: object.mod().spawnPointX,
      y: object.mod().spawnPointY
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

    if(object.mod().pathfindingLimit) {
      // you need to make sure diffX, diffY is also at the x, y grid locations ( the object could be inbetween grids if it has velocity )
      const { x, y } = gridUtil.snapXYToGrid(diffX, diffY)
      object.mod().pathfindingLimit.x += x
      object.mod().pathfindingLimit.y += y
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
      target: object.targetXY,
      path: object.path,
      lastHeroUpdateId: object.lastHeroUpdateId,
      _movementDirection: object._movementDirection,
      _goalDirection: object._goalDirection,
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
      spawnedIds: object.spawnedIds,
      spawnWait: object.spawnWait,
      spawnPool: object.spawnPool,
      customState: object.customState,
      inInventory: object.inInventory,
      isEquipped: object.isEquipped,
      _targetId: object._targetPursueId,
      _objectsWithin: object._objectsWithin,
      _objectsAwareOf: object._objectsAwareOf,
      _flipY: object._flipY,


      // IMPLEMENT...
      conditionTestCounts: object.conditionTestCounts,
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
      objectType: object.objectType,
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
      heroDialogue: object.heroDialogue,
      pathfindingLimit: object.pathfindingLimit,
      relativeX: object.relativeX,
      relativeY: object.relativeY,
      relativeId: object.relativeId,
      parentId: object.parentId,
      name: object.name,
      namePos: object.namePos,
      questGivingId: object.questGivingId,
      questCompleterId: object.questCompleterId,
      hooks: object.hooks,
      subObjectChances: object.subObjectChances,
      spawned: object.spawned,
      reserved: object.reserved,
      opacity: object.opacity,

      liveEmitterData: object.liveEmitterData,

      // equipment
      actionButtonBehavior: object.actionButtonBehavior,
      actionProps: object.actionProps,

      // inventory
      count: object.count,

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
      relativeWidth: object.relativeWidth,
      relativeHeight: object.relativeHeight,
      subObjectName: object.subObjectName,

      //spawn zones
      spawnPoolInitial: object.spawnPoolInitial,
      spawnWaitTimer: object.spawnWaitTimer,
      spawnLimit: object.spawnLimit,

      //resource zones
      resourceWithdrawAmount: object.resourceWithdrawAmount,
      resourceTags: object.resourceTags,
      resourceLimit: object.resourceLimit,

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
        const { id, testAndModOwnerWhenEquipped, testFailDestroyMod, testPassReverse, testModdedVersion, conditionValue, conditionType, conditionJSON, conditionEventName, eventName, effectName, eventThreshold, effectValue, effectJSON, mainObjectId, mainObjectTag, guestObjectId, guestObjectTag, initialTriggerPool, effectorObject, effectedMainObject, effectedGuestObject, effectedWorldObject, effectedOwnerObject, effectedIds, effectedTags, effectSequenceId, effectTags,           conditionMainObjectId,
                  conditionMainObjectTag,
                  conditionGuestObjectId,
                  conditionGuestObjectTag,
                  effectLibraryMod,
                  effectLibraryObject,
                 } = object.triggers[triggerId]

        properties.triggers[triggerId] = {
          id,
          effectName,
          effectValue,
          effectJSON,
          effectorObject,
          effectedMainObject,
          effectedGuestObject,
          effectedOwnerObject,
          effectedWorldObject,
          effectedIds,
          effectedTags,
          effectTags,
          effectSequenceId,
          effectLibraryMod,
          effectLibraryObject,
          eventName,
          eventThreshold,
          initialTriggerPool,
          mainObjectId,
          mainObjectTag,
          guestObjectId,
          guestObjectTag,

          // for mod currently, might move to a .mod property and use these for actual condition on the trigger
          testAndModOwnerWhenEquipped,
          testFailDestroyMod,
          testPassReverse,
          testModdedVersion,
          conditionValue,
          conditionType,
          conditionJSON,
          conditionEventName,
          conditionMainObjectId,
          conditionMainObjectTag,
          conditionGuestObjectId,
          conditionGuestObjectTag,
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
      chat: object.chat,
      width: object.width,
      height: object.height,
      color: object.color,
      name: object.name,
      sprite: object.sprite,
      namePos: object.namePos,
      removed: object.removed,
      angle: object.angle,
      _flipY: object._flipY,
      spawnPointX: object.spawnPointX,
      spawnPointY: object.spawnPointY,
      liveEmitterData: object.liveEmitterData,
      tags: object.tags,
      constructParts: object.constructParts && object.constructParts.map((part) => {
        return {
          id: part.id,
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
        mapState.subObjects[subObjectName] = OBJECTS.getMapState(subObject)
      })
    }

    return mapState
  }

  isInteractable(object) {
    if((object.mod().tags['completeQuestOnHeroInteract'] && object.mod().tags['questCompleter']) || (object.mod().tags['giveQuestOnHeroInteract'] && object.mod().tags['questGiver'])) return true

    if(object.mod().tags['spawnOnHeroInteract'] && object.mod().tags.spawnZone) return true

    if(object.mod().tags['updateHeroOnHeroInteract'] && object.mod().tags.heroUpdate) return true

    if(object.mod().tags['talkOnHeroInteract'] && object.mod().tags.talker) return true

    if(object.mod().tags['pickupOnHeroInteract'] && object.mod().tags.pickupable) return true

    if(object.mod().tags['spawnAllInHeroInventoryOnHeroInteract'] && object.mod().tags.spawnZone) return true

    if(object.mod().tags['resourceWithdrawOnInteract'] && object.mod().tags.resourceZone) return true

    if(object.mod().tags['resourceDepositOnInteract'] && object.mod().tags.resourceZone) return true

    if(object.mod().tags['interactable']) return true

    return false
  }

  anticipatedAdd(hero, object) {
    const { minX, maxX, minY, maxY, centerY, centerX, leftDiff, rightDiff, topDiff, bottomDiff, cameraHeight, cameraWidth } = HERO.getViewBoundaries(hero)

    let isWall = object.wall
    let isBlock = object.block
    let isRandom = object.random

    if(isRandom) {
      let newObject
      if(isWall) {
        if(Math.random() > .5) {
          newObject = {
            x: minX + (GAME.grid.nodeSize * 2),
            y: gridUtil.getRandomGridWithinXY(minY, maxY),
            width: (HERO.cameraWidth * 2) - (GAME.grid.nodeSize * 4),
            height: GAME.grid.nodeSize,
          }
        } else {
          newObject = {
            x: gridUtil.getRandomGridWithinXY(minX, maxX),
            y: minY + ( GAME.grid.nodeSize * 2),
            width: GAME.grid.nodeSize,
            height: (HERO.cameraHeight * 2) - (GAME.grid.nodeSize * 3)
          }
        }
      } else if(isBlock) {
        if(Math.random() > .5) {
          newObject = {
            x: gridUtil.getRandomGridWithinXY(minX, maxX),
            y: gridUtil.getRandomGridWithinXY(minY, maxY),
            width: GAME.grid.nodeSize * 5,
            height: GAME.grid.nodeSize,
          }
        } else {
          newObject = {
            x: gridUtil.getRandomGridWithinXY(minX, maxX),
            y: gridUtil.getRandomGridWithinXY(minY, maxY),
            width: GAME.grid.nodeSize,
            height: GAME.grid.nodeSize * 5,
          }
        }
      } else {
        newObject = {
          x: gridUtil.getRandomGridWithinXY(minX, maxX),
          y: gridUtil.getRandomGridWithinXY(minY, maxY),
          width: GAME.grid.nodeSize,
          height: GAME.grid.nodeSize,
        }
      }
      addAnticipatedObject(newObject)
    } else if (leftDiff < 1 && hero.directions.left) {
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
      if(!collisions.check(newObject, GAME.objects) && gridUtil.keepGridXYWithinBoundaries(x/GAME.grid.nodeSize, y/GAME.grid.nodeSize) && gridUtil.keepGridXYWithinBoundaries((x + newObject.width)/GAME.grid.nodeSize, (y + newObject.height)/GAME.grid.nodeSize)) {
        const createMe = {...newObject, ...object}
        createMe.tags.fadeInOnInit = true
        OBJECTS.create([createMe])
        object.numberToAdd--
        if(object.numberToAdd) {
        } else {
          GAME.gameState.anticipatedForAdd = GAME.gameState.anticipatedForAdd.filter((antObject) => {
            return antObject !== object
          })
        }
      }
    }
  }

  create(objects, options = { local: false, bypassCollisions: false, fromLiveGame: false }) {
    if(!objects.length) {
      objects = [objects]
    }

    let alertAboutCollision
    let hasBeenWarned = false

    objects = objects.map((newObject) => {
      newObject = window.mergeDeep(JSON.parse(JSON.stringify(window.defaultObject)), newObject)

      if(!newObject.id){
        newObject.id = 'object-' + window.uniqueID();
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
        const diff = newObject.x + newObject.width - ((GAME.grid.nodeSize * GAME.grid.width) + GAME.grid.startX)
        if(PAGE.role.isPlayEditor && !window.playEditorKeysDown[18] && !hasBeenWarned) alert('adding obj outside grid system, canceled')
        hasBeenWarned = true

        GAME.grid.width += Math.ceil(diff/GAME.grid.nodeSize)
        // return null
      }
      if(newObject.y + newObject.height > (GAME.grid.nodeSize * GAME.grid.height) + GAME.grid.startY) {
        const diff = newObject.y + newObject.height - ((GAME.grid.nodeSize * GAME.grid.height) + GAME.grid.startY)
        if(PAGE.role.isPlayEditor && !window.playEditorKeysDown[18] && !hasBeenWarned) alert('adding obj outside grid system, canceled')
        hasBeenWarned = true
        // return null
        GAME.grid.height += Math.ceil(diff/GAME.grid.nodeSize)
      }
      if(newObject.x < GAME.grid.startX) {
        const diff = GAME.grid.startX - newObject.x
        if(PAGE.role.isPlayEditor && !window.playEditorKeysDown[18] && !hasBeenWarned) alert('adding obj outside grid system, canceled')
        hasBeenWarned = true

        GAME.grid.width += Math.ceil(diff/GAME.grid.nodeSize)
        GAME.grid.startX -= diff

        // return null
      }
      if(newObject.y < GAME.grid.startY) {
        const diff = GAME.grid.startY - newObject.y

        if(PAGE.role.isPlayEditor && !window.playEditorKeysDown[18] && !hasBeenWarned) alert('adding obj outside grid system, canceled')
        hasBeenWarned = true

        GAME.grid.height += Math.ceil(diff/GAME.grid.nodeSize)
        GAME.grid.startY -= diff
        // return null
      }

      if(hasBeenWarned) {
        window.socket.emit('updateGrid', GAME.grid)
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
      if(!options.silently) {
        if(window.editingGame && window.editingGame.branch && !options.fromLiveGame) {
          window.branch.objects.push(...objects)
        } else {
          if(options.local) {
            window.local.emit('onNetworkAddObjects', objects)
          } else {
            window.socket.emit('addObjects', objects)
          }
        }
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
          if(object.tags.notInCollisions) return
          PHYSICS.removeObject(part)
        })
      } else {
        if(!object.tags.notInCollisions) {
          PHYSICS.removeObject(object)
        }
      }
      update.constructParts.forEach((part) => {
        if(object.tags.notInCollisions) return
        part.ownerId = object.id
        PHYSICS.addObject(part)
      })
    } else if(object.constructParts) {
      if(!object.tags.notInCollisions) {
        PHYSICS.addObject(object)
      }
    }
    object.path = null
    window.mergeDeep(object, update)
  }

  onEditObjects(editedObjects) {
    editedObjects.forEach((obj) => {
      let objectById = GAME.objectsById[obj.id]
      if(obj.constructParts || objectById.constructParts) {
        PIXIMAP.deleteObject(objectById)
      }
      OBJECTS.editObject(objectById, obj)
      if(obj.constructParts || objectById.constructParts) {
        PIXIMAP.addObject(objectById)
      }
    })

    GAME.resetPaths = true

    window.local.emit('onUpdatePFgrid')
  }

  onAnticipateObject(object) {
    if(!GAME.gameState.anticipatedForAdd) GAME.gameState.anticipatedForAdd = []
    GAME.gameState.anticipatedForAdd.push(object)
  }

  onUpdateObject(object, delta) {
    if(object.mod().tags.realRotate) {
      if(typeof object.angle != 'number') object.angle = 0
      object.angle += 1 * delta
    }
    if(object.mod().tags.realRotateFast) {
      if(typeof object.angle != 'number') object.angle = 0
      object.angle += 7 * delta
    }
  }

  onUpdateHero(hero, keysDown, delta) {
    if(hero.mod().tags.realRotate) {
      if(typeof hero.angle != 'number') hero.angle = 0
      hero.angle += 1 * delta
    }
    if(hero.mod().tags.realRotateFast) {
      if(typeof hero.angle != 'number') hero.angle = 0
      hero.angle += 7 * delta
    }
  }

  addObject(object) {
    // object.tags = window.mergeDeep(JSON.parse(JSON.stringify({...window.defaultTags, plain: true})), object.tags)
    GAME.objectsById[object.id] = object
    if(object.subObjects) {
      OBJECTS.forAllSubObjects(object.subObjects, (subObject, subObjectName) => {
        OBJECTS.addSubObject(object, subObject, subObjectName)
      })
    }
    if(object.constructParts) {
      object.constructParts.forEach((part) => {
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

  addSubObject(owner, subObject, subObjectName, options = {}) {
    if(!PAGE.role.isHost) return
    subObject = window.mergeDeep(JSON.parse(JSON.stringify(window.defaultSubObject)), subObject)
    subObject.ownerId = owner.id
    subObject.subObjectName = subObjectName
    if(!subObject.id) subObject.id = subObjectName + '-' + window.uniqueID()
    GAME.objectsById[subObject.id] = subObject

    let subObjectAlreadyExisted = false

    if(owner.subObjects[subObject.subObjectName]) {
      const existingSubObject = owner.subObjects[subObject.subObjectName]
      if(existingSubObject.id !== subObject.id) {
        if(subObject.tags.stackable) {
          if(!existingSubObject.count) existingSubObject.count = 1
          existingSubObject.count+= (subObject.count || 1)
          subObjectAlreadyExisted = true
          if(subObject.isEquipped) {
            existingSubObject.isEquipped = true
          }
          return
        } else {
          subObject.subObjectName = subObject.subObjectName + '-copy-'+window.uniqueID()
          subObjectName = subObject.subObjectName
          console.trace('i have copied', existingSubObject, subObject)
        }
      }
    }

    if(!subObjectAlreadyExisted){
      owner.subObjects[subObjectName] = subObject
      if(!subObject.tags.potential) PHYSICS.addObject(subObject)

      if(subObject.triggers) {
        Object.keys(subObject.triggers).forEach((triggerId) => {
          const trigger = subObject.triggers[triggerId]
          triggers.addTrigger(subObject, trigger)
        })
      }
    }

    if(options.equipAfterCreated) {
      equipSubObject(OBJECTS.getObjectOrHeroById(owner.id), subObject)
    }
  }

  deleteSubObject(owner, subObject, subObjectName) {
    if(subObject.isEquipped) unequipSubObject(owner, subObject)
    PIXIMAP.deleteObject(subObject)
    if(PAGE.role.isHost && !subObject.tags.potential) PHYSICS.removeObject(subObject)
    delete owner.subObjects[subObjectName]
  }

  getOwner(subObject) {
    let owner = OBJECTS.getObjectOrHeroById(subObject.ownerId)
    if(!owner) {
      owner = OBJECTS.getRelative(subObject.mod().relativeId)
    }
    if(!owner) {
      owner = OBJECTS.getParent(subObject.mod().parentId)
    }
    return owner
  }

  getParent(subObject) {
    return OBJECTS.getObjectOrHeroById(subObject.mod().parentId)
  }

  getRelative(subObject) {
    return OBJECTS.getObjectOrHeroById(subObject.mod().relativeId)
  }

  getObjectOrHeroById(id) {
    let object = GAME.objectsById[id]
    if(object) return object

    let hero = GAME.heros[id]
    if(hero) return hero
  }

  removeObject(object) {
    GAME.objectsById[object.id].removed = true
    if(object.subObjects) {
        OBJECTS.forAllSubObjects(object.subObjects, (subObject, subObjectName) => {
        subObject.removed = true
      })
    }
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
        if(PHYSICS.objects[part.id]) {
          PHYSICS.removeObject(part)
        }
      })
    } else {
      if(PHYSICS.objects[object.id]) {
        PHYSICS.removeObject(object)
      }
    }
    if(PAGE.role.isHost && object.triggers) {
      Object.keys(object.triggers).forEach((triggerId) => {
        triggers.removeTriggerEventListener(object, triggerId)
      })
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

  onDeleteSubObjectChance(ownerId, subObjectName) {
    const owner = OBJECTS.getObjectOrHeroById(ownerId)
    delete owner.subObjectChances[subObjectName]
  }

  onDeleteSubObject(owner, subObjectName) {
    const subObject = owner.subObjects[subObjectName]
    if(owner.tags.hero) {
      OBJECTS.deleteSubObject(GAME.heros[owner.id], subObject, subObjectName)
    } else {
      OBJECTS.deleteSubObject(GAME.objectsById[owner.id], subObject, subObjectName)
    }

    if(subObject.triggers) {
      Object.keys(subObject.triggers).forEach((triggerId) => {
        triggers.removeTriggerEventListener(object, triggerId)
      })
    }
  }

  onAddSubObject(owner, subObject, subObjectName, options) {
    if(owner.tags.hero) {
      if(!GAME.heros[owner.id].subObjects) GAME.heros[owner.id].subObjects = {}
      OBJECTS.addSubObject(GAME.heros[owner.id], subObject, subObjectName, options)
    } else {
      if(!GAME.objectsById[owner.id].subObjects) GAME.objectsById[owner.id].subObjects = {}
      OBJECTS.addSubObject(GAME.objectsById[owner.id], subObject, subObjectName, options)
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
  }

  onDropObject(objectId, subObjectName) {
    const dropper = OBJECTS.getObjectOrHeroById(objectId)
    const dropping = dropper.subObjects[subObjectName]
    dropObject(dropper, dropping)
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
        // OBJECTS.forAllSubObjects(object.subObjects, (so) => {
        //   console.log('?')
        //   GAME.objectsById[so.id] = so
        // })
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
      relativeX: (object.x + object.mod().width/2) - (relative.x + relative.mod().width/2),
      relativeY: (object.y + object.mod().height/2) - (relative.y + relative.mod().height/2)
    }
  }

  onAddHook(ownerId, hook) {
    const { eventName } = hook
    const owner = OBJECTS.getObjectOrHeroById(ownerId)
    addHook(owner, hook)
  }

  onEditHook(ownerId, hookId, hook) {
    const owner = OBJECTS.getObjectOrHeroById(ownerId)
    deleteHook(owner, hookId)
    addHook(owner, hook)
  }

  onDeleteHook(ownerId, hookId) {
    deleteHook(OBJECTS.getObjectOrHeroById(ownerId), hookId)
  }

  onSpawnAllNow(objectId) {
    const object = OBJECTS.getObjectOrHeroById(objectId)
    spawnAllNow(object)
  }
  onDestroySpawnIds(objectId) {
    const object = OBJECTS.getObjectOrHeroById(objectId)
    destroySpawnIds(object)
  }


  quake(object, options = { powerWave: false, color: object.color, speed: 150, tags: { noHeroAllowed: true }}) {
    const createdObjects = []
    const diagonals = []
    let lastCreatedObjects = []
    let stage = 0
    let maxStage = 4
    const powerWave = options.powerWave

    const originalPosition = _.cloneDeep(object)
    // originalPosition.x -= GAME.grid.nodeSize
    // originalPosition.y -= GAME.grid.nodeSize
    // originalPosition.width += (GAME.grid.nodeSize * 2)
    // originalPosition.height += (GAME.grid.nodeSize * 2)

    const quakeSpeed = options.speed
    const left = { x: object.x, height: object.height, y: object.y, width: GAME.grid.nodeSize, velocityX: -quakeSpeed, tags: options.tags, color: options.color, velocityMax: 1000, opacity: 1 }
    const top = { y: object.y, width: object.width, x: object.x, height: GAME.grid.nodeSize, velocityY: -quakeSpeed, tags: options.tags, color: options.color, velocityMax: 1000, opacity: 1 }
    const right = { x: object.x + object.width - GAME.grid.nodeSize, height: object.height, y: object.y, width: GAME.grid.nodeSize, velocityX: quakeSpeed, tags: options.tags, color: options.color, velocityMax: 1000, opacity: 1 }
    const bottom = { y: object.y + object.height - GAME.grid.nodeSize, width: object.width, x: object.x, height: GAME.grid.nodeSize, velocityY: quakeSpeed, tags: options.tags, color: options.color, velocityMax: 1000, opacity: 1 }
    stage++

    // the diagonal buggers have 3 stages
    // 1. move diagonal
    // 2. duplicate self with two other nodes ( one going up/down another going left/right )
    // 3.

    lastCreatedObjects = OBJECTS.create([left, top, bottom, right])
    createdObjects.push(...lastCreatedObjects)

    const removeUpdateListener = window.local.on('onUpdate', (delta) => {
      if(stage === maxStage) {
        let lowestOpacity = 1
        createdObjects.forEach((co) => {
          const go = GAME.objectsById[co.id]
          if(go) {
            if(go.opacity < lowestOpacity) lowestOpacity = go.opacity
          }
        })

        const allEqualOpacity = createdObjects.every((co) => {
          const go = GAME.objectsById[co.id]
          if(go) {
            return go.opacity === lowestOpacity
          } else return true
        })


        if(powerWave) {
          diagonals.forEach((co) => {
            const go = GAME.objectsById[co.id]
            if(go) {
              window.socket.emit('deleteObject', go)
            }
          })
        }

        createdObjects.forEach((co) => {
          const go = GAME.objectsById[co.id]
          if(go) {
            if(!powerWave) {
              go.velocityX = 0
              go.velocityY = 0
            }

            if(go.opacity <= 0) window.socket.emit('deleteObject', go)
            if(go.opacity > lowestOpacity || allEqualOpacity) {
              let opacityDelta = ((go.opacity/100) * delta) + .05
              if(powerWave) opacityDelta = opacityDelta/1000
              go.opacity -= opacityDelta
              if(!allEqualOpacity && go.opacity < lowestOpacity) go.opacity = lowestOpacity
            }
          }
        })

        if(createdObjects.every((co) => { return !GAME.objectsById[co.id] })) {
          removeUpdateListener()
        }
      }

      if(stage < maxStage && GAME.objectsById[lastCreatedObjects[0].id] && !collisions.checkAnything(originalPosition, lastCreatedObjects.map(({id}) => {
        return GAME.objectsById[id]
      }))) {
        // - ((stage/maxStage)/2)

        if(stage < maxStage - 1) {
          // diagonals
          const diagChildren = []
          diagonals.map(({id}) => {
            return GAME.objectsById[id]
          }).forEach((diag) => {
            if(diag) {
              window.socket.emit('deleteObject', diag)
              const hasWeight = stage >= 2
              const opacity = hasWeight ? 1 : diag.opacity
              diagChildren.push({...diag, id: null, velocityX: 0, tags: hasWeight ? options.tags : {}, velocityMax: 1000, opacity: opacity, color: options.color })
              diagChildren.push({...diag, id: null, velocityY: 0, tags: hasWeight ? options.tags : {}, velocityMax: 1000, opacity: opacity, color: options.color })
            }
          })
          if(diagChildren.length) {
            const createdChildren = OBJECTS.create(diagChildren)
            createdObjects.push(...createdChildren)
          }
        }

        const newObjectOpacity = stage < maxStage-1 ? .4 : .2
        let newDiagonalOpacity = newObjectOpacity
        if(stage === 1) {
          newDiagonalOpacity = 1
        }
        const topLeft = { x: originalPosition.x, height: GAME.grid.nodeSize, y: originalPosition.y, width: GAME.grid.nodeSize, velocityX: -quakeSpeed, velocityY: -quakeSpeed, tags: options.tags, color: options.color, velocityMax: 1000, opacity: newDiagonalOpacity }
        const topRight = { x: originalPosition.x + originalPosition.width - GAME.grid.nodeSize, height: GAME.grid.nodeSize, y: originalPosition.y, width: GAME.grid.nodeSize, velocityX: quakeSpeed, velocityY: -quakeSpeed, tags: options.tags, color: options.color, velocityMax: 1000, opacity: newDiagonalOpacity }
        const bottomLeft = { x: originalPosition.x, height: GAME.grid.nodeSize, y: originalPosition.y + originalPosition.height - GAME.grid.nodeSize, width: GAME.grid.nodeSize, velocityX: -quakeSpeed, velocityY: quakeSpeed, tags: options.tags, color: options.color, velocityMax: 1000, opacity: newDiagonalOpacity }
        const bottomRight = { x: originalPosition.x + originalPosition.width - GAME.grid.nodeSize, height: GAME.grid.nodeSize, y: originalPosition.y + originalPosition.height - GAME.grid.nodeSize, width: GAME.grid.nodeSize, velocityX: quakeSpeed, velocityY: quakeSpeed, tags: options.tags, color: options.color, velocityMax: 1000, opacity: newDiagonalOpacity }

        const newDiagonals = OBJECTS.create([topLeft, topRight, bottomLeft, bottomRight])

        // diagonals.forEach(({id}) => {
        //   const go = GAME.objectsById[id]
        // })

        diagonals.push(...newDiagonals)
        createdObjects.push(...newDiagonals)

        const left = { x: originalPosition.x, height: originalPosition.height, y: originalPosition.y, width: GAME.grid.nodeSize, velocityX: -quakeSpeed, tags: {}, color: options.color, velocityMax: 1000, opacity: newObjectOpacity   }
        const top = { y: originalPosition.y, width: originalPosition.width, x: originalPosition.x, height: GAME.grid.nodeSize, velocityY: -quakeSpeed, tags: {}, color: options.color, velocityMax: 1000, opacity: newObjectOpacity   }
        const right = { x: originalPosition.x + originalPosition.width - GAME.grid.nodeSize, height: originalPosition.height, y: originalPosition.y, width: GAME.grid.nodeSize, velocityX: quakeSpeed, tags: {}, color: options.color, velocityMax: 1000, opacity: newObjectOpacity }
        const bottom = { y: originalPosition.y + originalPosition.height - GAME.grid.nodeSize, width: originalPosition.width, x: originalPosition.x, height: GAME.grid.nodeSize, velocityY: quakeSpeed, tags: {}, color: options.color, velocityMax: 1000, opacity: newObjectOpacity }

        // const topLeft1 = { x: originalPosition.x - GAME.grid.nodeSize, height: GAME.grid.nodeSize, y: originalPosition.y - GAME.grid.nodeSize, width: GAME.grid.nodeSize, velocityX: -quakeSpeed, tags: {}, velocityMax: 1000, opacity: .5 }
        // const topLeft2 = { x: originalPosition.x - GAME.grid.nodeSize, height: GAME.grid.nodeSize, y: originalPosition.y - GAME.grid.nodeSize, width: GAME.grid.nodeSize, velocityY: -quakeSpeed, tags: {}, velocityMax: 1000, opacity: .5 }
        //
        // const topRight1 = { y: originalPosition.y - GAME.grid.nodeSize, width: GAME.grid.nodeSize, x: originalPosition.x + originalPosition.width, height: GAME.grid.nodeSize, velocityY: -quakeSpeed, tags: {}, velocityMax: 1000, opacity: .5 }
        // const topRight2 = { y: originalPosition.y - GAME.grid.nodeSize, width: GAME.grid.nodeSize, x: originalPosition.x + originalPosition.width, height: GAME.grid.nodeSize, velocityX: quakeSpeed, tags: {}, velocityMax: 1000, opacity: .5 }
        //
        // const bottomLeft1 = { x: originalPosition.x - GAME.grid.nodeSize, height: GAME.grid.nodeSize, y: originalPosition.y + originalPosition.height, width: GAME.grid.nodeSize, velocityX: -quakeSpeed, tags: {}, velocityMax: 1000, opacity: .5 }
        // const bottomLeft2 = { x: originalPosition.x - GAME.grid.nodeSize, height: GAME.grid.nodeSize, y: originalPosition.y + originalPosition.height, width: GAME.grid.nodeSize, velocityY: quakeSpeed, tags: {}, velocityMax: 1000, opacity: .5 }
        //
        // const bottomRight1 = { y: originalPosition.y + originalPosition.height, width: GAME.grid.nodeSize, x: originalPosition.x + originalPosition.width, height: GAME.grid.nodeSize, velocityY: quakeSpeed, tags: {}, velocityMax: 1000, opacity: .5 }
        // const bottomRight2 = { y: originalPosition.y + originalPosition.height, width: GAME.grid.nodeSize, x: originalPosition.x + originalPosition.width, height: GAME.grid.nodeSize, velocityX: quakeSpeed, tags: {}, velocityMax: 1000, opacity: .5 }
        //
        // lastCreatedObjects = OBJECTS.create([topLeft1, topLeft2, topRight1, topRight2, bottomLeft1, bottomLeft2, bottomRight1, bottomRight2])
        lastCreatedObjects = OBJECTS.create([left, top, bottom, right])
        createdObjects.push(...lastCreatedObjects)
        stage++
      }
    })
  }

  onObjectAnimation(type, objectId, options = {}) {
    if(!PAGE.role.isHost) return

    if(!options) options = {}

    const object = OBJECTS.getObjectOrHeroById(objectId)
    if(object) {
      if(type === 'quake') {
        OBJECTS.quake(object, options)
      }

      if(type === 'quickTrail') {
        object.tags.hasTrail = true
        setTimeout(() => {
          object.tags.hasTrail = false
        }, options.duration || 800)
      }
    }
    // animationQuake: originalPosition.animationQuake,
    // ACTUAL
    // fadeToColor ( actual )
    // fadeOut
    // fadeIn
  }

  onObjectDestroyed(object) {
    if(object.mod().tags.explodeOnDestroy) {
      window.socket.emit('objectAnimation', 'explode', object.id)
    }
    if(object.mod().tags.spinOffOnDestroy) {
      window.socket.emit('objectAnimation', 'spinOff', object.id)
    }
  }

  mergeWithJSON(object, JSON) {
    JSON = _.cloneDeep(JSON)

    Object.keys(JSON).forEach((key) => {
      const jsonValue = JSON[key]
      const objectValue = object[key]
      if(!objectValue) return

      if(typeof jsonValue === 'string' && typeof objectValue === 'number') {
        if (jsonValue.startsWith("+")) {
          const equationValue = Number(jsonValue.slice(1))
          JSON[key] = objectValue + equationValue
        } else if(jsonValue.startsWith("-")) {
          const equationValue = Number(jsonValue.slice(1))
          JSON[key] = objectValue - equationValue
        }
      }

      if((typeof objectValue === 'boolean' || objectValue === undefined) && typeof jsonValue === 'string') {
        if (jsonValue.startsWith("toggle")) {
          JSON[key] = !JSON[key]
        }
      }
    })

    window.mergeDeep(object, JSON)
  }

  onObjectAware(object, awareOfObject) {

    // if this passes you are already pursuing something and shouldn't switch
    if(object._targetPursueId && !object.mod().tags.targetSwitchOnAware) return

    if(awareOfObject.mod().tags.hero) {
      if(object.mod().tags.targetHeroOnAware) {
        if(object.mod().tags.homing) {
          setPathTarget(object, awareOfObject, true)
        }
        if(object.mod().tags.zombie) {
          setTarget(object, awareOfObject, true)
        }
      }
    } else if(awareOfObject.mod().tags.victim){
      if(object.mod().tags.targetVictimOnAware) {
        if(object.mod().tags.homing) {
         setPathTarget(object, awareOfObject, true)
        }
        if(object.mod().tags.zombie) {
         setTarget(object, awareOfObject, true)
        }
      }
    }
  }

  onObjectUnaware(object, unawareOfObject) {
    if(object.mod().tags.targetClearOnUnaware) {
      if(unawareOfObject.id === object._targetPursueId) {
        delete object._targetPursueId
      }
    }
  }

  chat({id, duration = 3, text}) {
    const object = OBJECTS.getObjectOrHeroById(id)
    object.chat = text
    GAME.addOrResetTimeout(id + '-chat', duration, () => {
      object.chat = null
    })
  }

  onResetPhysicsProperties(objectId) {
    const object = OBJECTS.getObjectOrHeroById(objectId)
    object.velocityY = 0
    object.velocityX = 0
    object.velocityAngle = 0
    object._skipPosUpdate = true
    object._skipNextGravity = true
    object.angle = null
  }
}

window.OBJECTS = new Objects()
