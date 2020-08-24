import onHeroTrigger from './onHeroTrigger'
import ghost from './ghost.js'
import pathfinding from '../../utils/pathfinding.js'
import collisions from '../../utils/collisions'
import gridUtil from '../../utils/grid.js'
import input from '../input.js'
import triggers from '../triggers.js'

class Hero{
  constructor() {
    this.cameraWidth = 640,
    this.cameraHeight = 320
    this.setDefault()
  }

  onHeroInteract(hero, interactor, result) {
    onHeroTrigger(hero, interactor, result, { fromInteractButton: true })
  }

  onHeroCollide(hero, collider, result) {
    if(collider.ownerId === hero.id) return
    onHeroTrigger(hero, collider, result, { fromInteractButton: false })
  }

  getHeroId() {
    if(PAGE.role.isPlayer) {
      let savedHero = localStorage.getItem('hero');
      if(savedHero && JSON.parse(savedHero).id){
        HERO.id = JSON.parse(savedHero).id
      } else {
        HERO.id = 'hero-'+window.uniqueID()
      }
    }
  }

  setDefault() {
    window.defaultHero = {
    	width: 40,
    	height: 40,
    	velocityX: 0,
    	velocityY: 0,
      _flatVelocityX: 0,
      _flatVelocityY: 0,
      _cantInteract: false,
    	velocityMax: 400,
      color: '#FFFFFF',
    	// accY: 0,
    	// accX: 0,
    	// accDecayX: 0,
    	// accDecayY: 0,
    	speed: 250,
    	arrowKeysBehavior: 'flatDiagonal',
      // actionButtonBehavior: 'dropWall',
    	jumpVelocity: -480,
    	// spawnPointX: (40) * 20,
    	// spawnPointY: (40) * 20,
    	zoomMultiplier: 1.875,
      // x: window.grid.startX + (window.grid.width * window.grid.nodeSize)/2,
      // y: window.grid.startY + (window.grid.height * window.grid.nodeSize)/2,
      lives: 10,
      score: 0,
      dialogue: [],
      defaultSprite: 'solidcolorsprite',
      sprite: 'solidcolorsprite',
      flags : {
        showDialogue: false,
        showScore: false,
        showLives: false,
        paused: false,
      },
      directions: {
        up: false,
        down: false,
        right: false,
        left: false,
      },

      heroMenu: {},
      objectMenu: {},
      creator: {},

      quests: {},
      questState: {},
      triggers: {},
      triggerState: {},
      tags: {},
      cameraTweenToTargetX: false,
      cameraTweenToTargetY: false,
      cameraTweenSpeedXExtra: 0,
      cameraTweenSpeedYExtra: 0,
      cameraTweenSpeed: 2,
      // cameraRotation: 0,
    }

    window.local.on('onGridLoaded', () => {
      window.defaultHero.tags = {...window.heroTags}
      window.defaultHero.x = GAME.grid.startX + (GAME.grid.width * GAME.grid.nodeSize)/2
      window.defaultHero.y = GAME.grid.startY + (GAME.grid.height * GAME.grid.nodeSize)/2
      window.defaultHero.width = GAME.grid.nodeSize
      window.defaultHero.height = GAME.grid.nodeSize

      window.defaultHero.subObjects = {
        heroInteractTriggerArea: {
          x: 0, y: 0, width: 40, height: 40,
          relativeWidth: GAME.grid.nodeSize * 2,
          relativeHeight: GAME.grid.nodeSize * 2,
          relativeX: 0,
          relativeY: 0,
          tags: { obstacle: false, invisible: true, stationary: true, heroInteractTriggerArea: true },
        },
        awarenessTriggerArea: {
          x: 0, y: 0, width: 40, height: 40,
          relativeWidth: GAME.grid.nodeSize * 12,
          relativeHeight: GAME.grid.nodeSize * 16,
          relativeX: 0,
          relativeY: -GAME.grid.nodeSize * 4,
          tags: { obstacle: false, invisible: true, stationary: true, awarenessTriggerArea: true, relativeToDirection: true, },
        },
        // spear: {
        //   id: 'spear-'+window.uniqueID(),
        //   x: 0, y: 0, width: 40, height: 40,
        //   relativeX: GAME.grid.nodeSize/5,
        //   relativeY: -GAME.grid.nodeSize,
        //   relativeWidth: -GAME.grid.nodeSize * .75,
        //   relativeHeight: 0,
        //   relativeToDirection: true,
        //   tags: { monsterDestroyer: true, obstacle: false },
        // }
      }
    })
  }

  onUpdate() {
    if(PAGE.role.isPlayer && !PAGE.role.isGhost){
      localStorage.setItem('hero', JSON.stringify(GAME.heros[HERO.id]))
      // we are locally updating the hero input as host
      if(!PAGE.role.isHost && !PAGE.typingMode) {
        window.socket.emit('sendHeroInput', GAME.keysDown, HERO.id)
      }
    }
  }

  spawn(hero) {
    const {x, y } = HERO.getSpawnCoords(hero)
    hero.x = x
    hero.y = y
    hero.velocityX = 0
    hero.velocityY = 0
    hero.velocityAngle = 0
  }

  getSpawnCoords(hero) {
    let x = 960;
    let y = 960;
    // hero spawn point takes precedence
    if(hero.mod().spawnPointX && typeof hero.mod().spawnPointX == 'number' && hero.mod().spawnPointY && typeof hero.mod().spawnPointY == 'number') {
      x = hero.mod().spawnPointX
      y = hero.mod().spawnPointY
    } else if(GAME && GAME.world.worldSpawnPointX && typeof GAME.world.worldSpawnPointX == 'number' && GAME.world.worldSpawnPointY && typeof GAME.world.worldSpawnPointY == 'number') {
      x = GAME.world.worldSpawnPointX
      y = GAME.world.worldSpawnPointY
    }

    return {
      x,
      y,
    }
  }

  respawn(hero) {
    hero.velocityX = 0
    hero.velocityY = 0
    hero.velocityAngle = 0

    /// send objects that are possibly camping at their spawn point back to their spawn point
    if(PAGE.role.isHost && GAME && GAME.world && GAME.world.tags.noCamping) {
      GAME.objects.forEach((obj) => {
        if(obj.removed) return

        if(obj.mod().tags.zombie || obj.mod().tags.homing) {
          const { gridX, gridY } = gridUtil.convertToGridXY(obj)
          obj.gridX = gridX
          obj.gridY = gridY

          const spawnGridPos = gridUtil.convertToGridXY({x: obj.mod().spawnPointX, y: obj.mod().spawnPointY})

          obj.path = pathfinding.findPath({
            x: gridX,
            y: gridY,
          }, {
            x: spawnGridPos.gridX,
            y: spawnGridPos.gridY,
          }, obj.mod().pathfindingLimit)
        }
      })
    }

    HERO.spawn(hero)
  }

  resetToDefault(hero, useGame) {
    HERO.deleteHero(hero)
    hero.subObjects = {}
    hero.triggers = {}
    let newHero = JSON.parse(JSON.stringify(window.defaultHero))
    if(GAME.defaultHero && useGame) {
      newHero = JSON.parse(JSON.stringify(window.mergeDeep(newHero, GAME.defaultHero)))
    }
    OBJECTS.forAllSubObjects(newHero.subObjects, (subObject) => {
      subObject.id = 'subObject-'+window.uniqueID()
    })
    if(!hero.id) {
      alert('hero getting reset without id')
    }
    newHero.id = hero.id
    HERO.spawn(newHero)
    HERO.addHero(newHero)
    return newHero
  }

  forAll(fx) {
    Object.keys(GAME.heros).forEach((id) => {
      fx(GAME.heros[id], id)
    })
  }

  respawnAll() {
    GAME.heroList.forEach(({id}) => {
      HERO.respawn(GAME.heros[id])
    })
  }

  updateAll(update) {
    GAME.heroList.forEach(({id}) => {
      window.mergeDeep(GAME.heros[id], update)
    })
  }

  zoomAnimation(hero) {
    if(hero.animationZoomMultiplier == hero.zoomMultiplier && hero.animationZoomTarget == window.constellationDistance) {
      window.local.emit('onConstellationAnimationStart')
    }
    if(hero.animationZoomMultiplier == window.constellationDistance && hero.zoomMultiplier == hero.animationZoomTarget) {
      setTimeout(() => {
        window.local.emit('onConstellationAnimationEnd')
      }, 2500)
    }

    if(hero.animationZoomTarget > hero.animationZoomMultiplier) {
      hero.animationZoomMultiplier = hero.animationZoomMultiplier/.97
      PAGE.resizingMap = true
      if(hero.animationZoomTarget < hero.animationZoomMultiplier) {
        if(hero.endAnimation) {
          hero.animationZoomMultiplier = null
          PAGE.resizingMap = false
        } else {
          hero.animationZoomMultiplier = hero.animationZoomTarget
        }
      }
    }

    if(hero.animationZoomTarget < hero.animationZoomMultiplier) {
      hero.animationZoomMultiplier = hero.animationZoomMultiplier/1.03
      PAGE.resizingMap = true
      if(hero.animationZoomTarget > hero.animationZoomMultiplier) {
        if(hero.endAnimation) {
          PAGE.resizingMap = false
          hero.animationZoomMultiplier = null
        } else {
          hero.animationZoomMultiplier = hero.animationZoomTarget
        }
      }
    }
  }

  getViewBoundaries(hero) {
    const value = {
      width: HERO.cameraWidth * hero.zoomMultiplier,
      height: HERO.cameraHeight * hero.zoomMultiplier,
      centerX: hero.x + hero.mod().width/2,
      centerY: hero.y + hero.mod().height/2,
    }
    value.x = value.centerX - value.width/2
    value.y = value.centerY - value.height/2
    if(hero.id === HERO.id && MAP.camera.hasHitLimit) {
      value.x = MAP.camera.x
      value.y = MAP.camera.y
    }

    let nonGrid = {...value}
    const { leftDiff, rightDiff, topDiff, bottomDiff } = gridUtil.getAllDiffs(value)
    gridUtil.snapDragToGrid(value)

    const { gridX, gridY, width, height } = gridUtil.convertToGridXY(value)

    return {
      gridX,
      gridY,
      gridWidth: width,
      gridHeight: height,
      centerX: value.centerX,
      centerY: value.centerY,
      minX: value.x,
      minY: value.y,
      x: nonGrid.x,
      y: nonGrid.y,
      width: nonGrid.width,
      height: nonGrid.height,
      maxX: value.x + value.width,
      maxY: value.y + value.height,
      leftDiff,
      rightDiff,
      topDiff,
      bottomDiff,
      cameraWidth: HERO.cameraWidth,
      cameraHeight: HERO.cameraHeight,
    }
  }

  summonFromGameData(hero) {
    // if we have decided to restore position, find hero in hero list
    if(GAME.world.tags.shouldRestoreHero && GAME.heros && hero) {
      GAME.heroList.forEach((currentHero) => {
        if(currentHero.id == hero.id) {
          return currentHero
        }
      })
      console.log('failed to find hero with id' + HERO.id)
    }

    if(!GAME.world.tags.isAsymmetric && GAME.defaultHero) {
      delete GAME.defaultHero.id
      const id = hero.id
      hero = JSON.parse(JSON.stringify(GAME.defaultHero))
      OBJECTS.forAllSubObjects(hero.subObjects, (subObject) => {
        subObject.id = 'subObject-'+window.uniqueID()
      })
      hero.id = id
      HERO.respawn(hero)
      return hero
    }

    return HERO.resetToDefault(hero)
  }

  getState(hero) {
    let state = {
      x: hero.x,
      y: hero.y,
      _initialY: hero._initialY,
      _initialX: hero._initialX,
      _deltaY: hero._deltaY,
      _deltaX: hero._deltaX,
      velocityY: hero.velocityY,
      velocityX: hero.velocityX,
      _cantInteract: hero._cantInteract,
      _flatVelocityX: hero._flatVelocityX,
      _flatVelocityY: hero._flatVelocityY,
      _floatable: hero._floatable,
      lastHeroUpdateId: hero.lastHeroUpdateId,
      lastDialogueId: hero.lastDialogueId,
      directions: hero.directions,
      sprite: hero.sprite,
      gridX: hero.gridX,
      gridY: hero.gridY,
      inputDirection: hero.inputDirection,
      reachablePlatformWidth: hero.reachablePlatformWidth,
      reachablePlatformHeight: hero.reachablePlatformHeight,
      animationZoomMultiplier: hero.animationZoomMultiplier,
      animationZoomTarget: hero.animationZoomTarget,
      endAnimation: hero.endAnimation,
      dialogue: hero.dialogue,
      dialogueName: hero.dialogueName,
      choiceOptions: hero.choiceOptions,
      _parentId: hero._parentId,
      _skipNextGravity: hero._skipNextGravity,
      interactableObject: hero.interactableObject,
      gridHeight: hero.gridHeight,
      gridWidth: hero.gridWidth,
      updateHistory: hero.updateHistory,
      onGround: hero.onGround,
      angle: hero.angle,
      questState: hero.questState,
      customState: hero.customState,
      _objectsWithin: hero._objectsWithin,
      _objectsAwareOf: hero._objectsAwareOf,
      _flipY: hero._flipY,
      // conditionTestCounts: hero.conditionTestCounts,
      liveEmitterData: hero.liveEmitterData
    }

    if(hero.subObjects) {
      state.subObjects = {}
      OBJECTS.forAllSubObjects(hero.subObjects, (subObject, subObjectName) => {
        state.subObjects[subObjectName] = OBJECTS.getState(subObject)
        window.removeFalsey(state.subObjects[subObjectName])
      })
    }

    if(hero.triggers) {
      state.triggers = {}
      Object.keys(hero.triggers).forEach((triggerId) => {
        const { pool, eventCount, disabled } = hero.triggers[triggerId]

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

  getProperties(hero) {
    let properties = {
      id: hero.id,
      objectType: hero.objectType,
      width: hero.width,
      height: hero.height,
      flags: hero.flags,
      tags: hero.tags,

      zBehavior: hero.zBehavior,
      xBehavior: hero.xBehavior,
      cBehavior: hero.cBehavior,
      arrowKeysBehavior: hero.arrowKeysBehavior,
      spaceBarBehavior: hero.spaceBarBehavior,

      color: hero.color,
      defaultSprite: hero.defaultSprite,
      upSprite: hero.upSprite,
      leftSprite: hero.leftSprite,
      downSprite: hero.downSprite,
      rightSprite: hero.rightSprite,
      opacity: hero.opacity,

      lives: hero.lives,
      spawnPointX: hero.spawnPointX,
      spawnPointY: hero.spawnPointY,
      relativeX: hero.relativeX,
      relativeY: hero.relativeY,
      relativeId: hero.relativeId,
      parentId: hero.parentId,
      quests: hero.quests,
      customProps: hero.customProps,
      hooks: hero.hooks,
      subObjectChances: hero.subObjectChances,

      heroMenu: hero.heroMenu,
      objectMenu: hero.objectMenu,
      creator: hero.creator,

      zoomMultiplier: hero.zoomMultiplier,
      cameraTweenToTargetX: hero.cameraTweenToTargetX,
      cameraTweenToTargetY: hero.cameraTweenToTargetY,
      cameraTweenSpeedXExtra: hero.cameraTweenSpeedXExtra,
      cameraTweenSpeedYExtra: hero.cameraTweenSpeedYExtra,
      cameraTweenSpeed: hero.cameraTweenSpeed,
      // cameraRotation: hero.cameraRotation,

      resourceWithdrawAmount: hero.resourceWithdrawAmount,
      resourceTags: hero.resourceTags,
      resourceLimit: hero.resourceLimit,

      liveEmitterData: hero.liveEmitterData,

      jumpVelocity: hero.jumpVelocity,
      dashVelocity: hero.dashVelocity,
      velocityMax: hero.velocityMax,
      velocityMaxXExtra: hero.velocityMaxXExtra,
      velocityMaxYExtra: hero.velocityMaxYExtra,
      speed: hero.speed,
      speedXExtra: hero.speedXExtra,
      speedYExtra: hero.speedYExtra,
      velocityDecay: hero.velocityDecay,
      velocityDecayXExtra: hero.velocityDecayXExtra,
      velocityDecayYExtra: hero.velocityDecayYExtra,
      floatJumpTimeout: hero.floatJumpTimeout,
    }

    if(hero.subObjects) {
      properties.subObjects = {}
      OBJECTS.forAllSubObjects(hero.subObjects, (subObject, subObjectName) => {
        properties.subObjects[subObjectName] = OBJECTS.getProperties(subObject)
        window.removeFalsey(properties.subObjects[subObjectName])
      })
    }

    if(hero.triggers) {
      properties.triggers = {}
      Object.keys(hero.triggers).forEach((triggerId) => {
        const { id, testAndModOwnerWhenEquipped, testFailDestroyMod, testPassReverse, testModdedVersion, conditionValue, conditionType, conditionJSON, conditionEventName, eventName, effectName, eventThreshold, effectValue, effectJSON, mainObjectId, mainObjectTag, guestObjectId, guestObjectTag, initialTriggerPool, effectorObject, effectedMainObject, effectedGuestObject, effectedWorldObject, effectedOwnerObject, effectedIds, effectedTags, effectSequenceId, effectTags,           conditionMainObjectId,
                  conditionMainObjectTag,
                  conditionGuestObjectId,
                  conditionGuestObjectTag, } = hero.triggers[triggerId]

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
          eventName,
          eventThreshold,
          mainObjectId,
          mainObjectTag,
          guestObjectId,
          guestObjectTag,
          initialTriggerPool,

          // just for mods right now, not actual Condition
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

  getMapState(hero) {
    let mapState = {
      id: hero.id,
      x: hero.x,
      y: hero.y,
      chat: hero.chat,
      width: hero.width,
      height: hero.height,
      interactableObject: hero.interactableObject,
      dialogue: hero.dialogue,
      choiceOptions: hero.choiceOptions,
      flags: hero.flags,
      sprite: hero.sprite,
      directions: hero.directions,
      zoomMultiplier: hero.zoomMultiplier,
      animationZoomMultiplier: hero.animationZoomMultiplier,
      color: hero.color,
      inputDirection: hero.inputDirection,
      lives: hero.lives,
      _flipY: hero._flipY,
      score: hero.score,
      removed: hero.removed,
      questState: hero.questState,
      angle: hero.angle,
      customMapState: hero.customMapState,
    }

    if(hero.subObjects) {
      mapState.subObjects = {}
      OBJECTS.forAllSubObjects(hero.subObjects, (subObject, subObjectName) => {
        mapState.subObjects[subObjectName] = OBJECTS.getMapState(subObject)
      })
    }

    return mapState
  }

  onEditHero(updatedHero) {
    if(updatedHero.arrowKeysBehavior || (updatedHero.tags && updatedHero.tags.gravityY !== undefined)) {
      updatedHero.velocityX = 0
      updatedHero.velocityY = 0
    }
    if(updatedHero.zoomMultiplier && updatedHero.zoomMultiplier !== GAME.heros[updatedHero.id].zoomMultiplier) {
      window.local.emit('onZoomChange', updatedHero.id)
    }
    window.mergeDeep(GAME.heros[updatedHero.id], updatedHero)
  }

  onResetHeroToDefault(hero) {
    GAME.heros[hero.id] = HERO.resetToDefault(GAME.heros[hero.id])
  }
  onResetHeroToGameDefault(hero) {
    GAME.heros[hero.id] = HERO.resetToDefault(GAME.heros[hero.id], true)
  }

  onRespawnHero(hero) {
    HERO.respawn(GAME.heros[hero.id])
  }

  addHero(hero, options = {}) {
    GAME.heros[hero.id] = hero
    if(hero.subObjects) {
      OBJECTS.forAllSubObjects(hero.subObjects, (subObject, subObjectName) => {
        OBJECTS.addSubObject(hero, subObject, subObjectName)
      })
    }
    if(!options.skipEventListeners && hero.triggers) {
      Object.keys(hero.triggers).forEach((triggerId) => {
        const trigger = hero.triggers[triggerId]
        triggers.addTrigger(hero, trigger)
      })
    }
    PHYSICS.addObject(hero)
  }

  removeHero(hero) {
    OBJECTS.forAllSubObjects(hero.subObjects, (subObject) => {
      subObject.removed = true
    })
    GAME.heros[hero.id].removed = true
  }

  onDeleteHero(heroId) {
    const hero = GAME.heros[heroId]
    HERO.deleteHero(hero)
    delete GAME.heros[heroId]
  }

  onDeleteQuest(heroId, questId) {
    const hero = GAME.heros[heroId]
    if(hero.quests) delete hero.quests[questId]
  }

  deleteHero(hero) {
    if(hero.subObjects) {
      OBJECTS.forAllSubObjects(hero.subObjects, (subObject, subObjectName) => {
        OBJECTS.deleteSubObject(hero, subObject, subObjectName)
      })
    }

    if(hero.triggers) {
      Object.keys(hero.triggers).forEach((triggerId) => {
        triggers.removeTriggerEventListener(hero, triggerId)
      })
    }

    PHYSICS.removeObject(GAME.heros[hero.id])
  }

  onNetworkUpdateHero(updatedHero) {
    if(!PAGE.gameLoaded) return
    if(updatedHero.subObjects) OBJECTS.forAllSubObjects(updatedHero.subObjects, (so) => {
      window.mergeDeep(GAME.objectsById[so.id], so)
    })
    if(PAGE.role.isPlayEditor) HERO.resetReachablePlatformArea(updatedHero)
    if(!PAGE.role.isHost) {
      window.mergeDeep(GAME.heros[updatedHero.id], updatedHero)
      if(PAGE.role.isPlayer && HERO.id === updatedHero.id) {
        window.mergeDeep(GAME.heros[HERO.id], updatedHero)
      }
    }
  }

  onSendHeroInput(input, heroId) {
    // dont update input for hosts hero since we've already locally updated
    if(PAGE.role.isHost && GAME.heros[HERO.id] && heroId == HERO.originalId) {
      return
    }
    GAME.heroInputs[heroId] = input
  }

  onSendHeroKeyDown(key, heroId) {
    // dont do keydown event for hosts hero since we've already done locally
    if(PAGE.role.isPlayer && heroId == HERO.originalId) return
    let hero = GAME.heros[heroId]
    input.onKeyDown(key, hero)
  }

  onSendHeroKeyUp(key, heroId) {
    // dont do keydown event for hosts hero since we've already done locally
    if(PAGE.role.isHost && heroId == HERO.originalId) return
    let hero = GAME.heros[heroId]
    input.onKeyUp(key, hero)
  }


  resetReachablePlatformArea(hero) {
    if(hero.jumpVelocity !== GAME.heros[hero.id].jumpVelocity) {
      hero.reachablePlatformHeight = HERO.resetReachablePlatformHeight(GAME.heros[hero.id])
    }
    if(hero.jumpVelocity !== GAME.heros[hero.id].jumpVelocity || hero.speed !== GAME.heros[hero.id].speed) {
      hero.reachablePlatformWidth = HERO.resetReachablePlatformWidth(GAME.heros[hero.id])
    }
  }

  resetReachablePlatformHeight(hero) {
    let velocity = hero.jumpVelocity
    if(Math.abs(hero.jumpVelocity) > Math.abs(hero.velocityMax)) velocity = Math.abs(hero.velocityMax)

    let gravityVelocityY = GAME.world.gravityVelocityY
    if(!gravityVelocityY) gravityVelocityY = 1000

    let delta = (0 - velocity)/gravityVelocityY
    let height = (velocity * delta) +  ((gravityVelocityY * (delta * delta))/2)
    return height
  }

  resetReachablePlatformWidth(hero) {
    // for flatDiagonal
    let velocityX = hero.speed
    if(Math.abs(velocityX) > Math.abs(hero.velocityMax)) velocityX = Math.abs(hero.velocityMax)


    let deltaVelocityYToUse = hero.jumpVelocity
    if(Math.abs(hero.jumpVelocity) > Math.abs(hero.velocityMax)) deltaVelocityYToUse = Math.abs(hero.velocityMax)

    let gravityVelocityY = GAME.world.gravityVelocityY
    if(!gravityVelocityY) gravityVelocityY = 1000

    let deltaInAir = (0 - deltaVelocityYToUse)/gravityVelocityY
    let width = (velocityX * deltaInAir)
    return width * 2
  }
}

window.HERO = new Hero()
