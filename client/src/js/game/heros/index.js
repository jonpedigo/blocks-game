import onEffectHero from './onEffectHero'
import ghost from './ghost.js'
import pathfinding from '../../utils/pathfinding.js'
import collisions from '../../utils/collisions'
import gridUtil from '../../utils/grid.js'
import input from '../input.js'

class Hero{
  constructor() {
    this.cameraWidth = 640,
    this.cameraHeight = 320
    this.setDefault()
  }

  onHeroInteract(hero, interactor, result, removeObjects, respawnObjects) {
    onEffectHero(hero, interactor, result, removeObjects, respawnObjects, { fromInteractButton: true })
  }

  onHeroCollide(hero, collider, result, removeObjects, respawnObjects) {
    if(collider.tags['requireActionButton'] || collider.ownerId === hero.id) return
    onEffectHero(hero, collider, result, removeObjects, respawnObjects, { fromInteractButton: false })
  }

  getHeroId() {
    // GET GAME.heros[HERO.id] ID
    if(PAGE.role.isGhost) {
      HERO.id = 'ghost'
    } else if(PAGE.role.isPlayer) {
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
    	velocityMax: 400,
      color: 'white',
    	// accY: 0,
    	// accX: 0,
    	// accDecayX: 0,
    	// accDecayY: 0,
    	speed: 250,
    	arrowKeysBehavior: 'flatDiagonal',
      actionButtonBehavior: 'dropWall',
    	jumpVelocity: -480,
    	// spawnPointX: (40) * 20,
    	// spawnPointY: (40) * 20,
    	tags: {
        obstacle: false,
        hero: true,
        isPlayer: true,
        monsterDestroyer: false,
        gravity: false,
        filled: true,
        default: false,
      },
    	zoomMultiplier: 1.875,
      // x: window.grid.startX + (window.grid.width * window.grid.nodeSize)/2,
      // y: window.grid.startY + (window.grid.height * window.grid.nodeSize)/2,
      lives: 10,
      score: 0,
      chat: [],
      flags : {
        showChat: false,
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
    }

    window.local.on('onGridLoaded', () => {
      window.defaultHero.x = GAME.grid.startX + (GAME.grid.width * GAME.grid.nodeSize)/2
      window.defaultHero.y = GAME.grid.startY + (GAME.grid.height * GAME.grid.nodeSize)/2

      window.defaultHero.subObjects = {
        actionTriggerArea: {
          id: 'ata-'+window.uniqueID(),
          x: 0, y: 0, width: 40, height: 40,
          actionTriggerArea: true,
          changeWithDirection: false,
          relativeWidth: GAME.grid.nodeSize * 2,
          relativeHeight: GAME.grid.nodeSize * 2,
          relativeX: -GAME.grid.nodeSize,
          relativeY: -GAME.grid.nodeSize,
          tags: { obstacle: false, invisible: true, stationary: true },
        },
        // spear: {
        //   id: 'spear-'+window.uniqueID(),
        //   x: 0, y: 0, width: 40, height: 40,
        //   relativeX: GAME.grid.nodeSize/5,
        //   relativeY: -GAME.grid.nodeSize,
        //   relativeWidth: -GAME.grid.nodeSize * .75,
        //   relativeHeight: 0,
        //   changeWithDirection: true,
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
    console.log(x, y)
    hero.x = x
    hero.y = y
    hero.velocityX = 0
    hero.velocityY = 0
  }

  getSpawnCoords(hero) {
    let x = 960;
    let y = 960;
    // hero spawn point takes precedence
    if(hero.spawnPointX && hero.spawnPointX >= 0 && hero.spawnPointY && hero.spawnPointY >= 0) {
      x = hero.spawnPointX
      y = hero.spawnPointY
    } else if(GAME && GAME.world.worldSpawnPointX && GAME.world.worldSpawnPointX >= 0 && GAME.world.worldSpawnPointY && GAME.world.worldSpawnPointY >= 0) {
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

    /// send objects that are possibly camping at their spawn point back to their spawn point
    if(PAGE.role.isHost && GAME && GAME.world && GAME.world.globalTags.noCamping) {
      GAME.objects.forEach((obj) => {
        if(obj.removed) return

        if(obj.tags.zombie || obj.tags.homing) {
          const { gridX, gridY } = gridUtil.convertToGridXY(obj)
          obj.gridX = gridX
          obj.gridY = gridY

          const spawnGridPos = gridUtil.convertToGridXY({x: obj.spawnPointX, y: obj.spawnPointY})

          obj.path = pathfinding.findPath({
            x: gridX,
            y: gridY,
          }, {
            x: spawnGridPos.gridX,
            y: spawnGridPos.gridY,
          }, obj.pathfindingLimit)
        }
      })
    }

    HERO.spawn(hero)
  }

  resetToDefault(hero, useGame) {
    HERO.deleteHero(hero)
    let newHero = JSON.parse(JSON.stringify(window.defaultHero))
    if(GAME.hero && useGame) {
      newHero = JSON.parse(JSON.stringify(window.mergeDeep(newHero, GAME.hero)))
    }
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
    if(hero.animationZoomTarget > hero.animationZoomMultiplier) {
      hero.animationZoomMultiplier = hero.animationZoomMultiplier/.97
      if(hero.animationZoomTarget < hero.animationZoomMultiplier) {
        if(hero.endAnimation) hero.animationZoomMultiplier = null
        else {
          hero.animationZoomMultiplier = hero.animationZoomTarget
        }
      }
    }

    if(hero.animationZoomTarget < hero.animationZoomMultiplier) {
      hero.animationZoomMultiplier = hero.animationZoomMultiplier/1.03
      if(hero.animationZoomTarget > hero.animationZoomMultiplier) {
        if(hero.endAnimation) hero.animationZoomMultiplier = null
        else {
          hero.animationZoomMultiplier = hero.animationZoomTarget
        }
      }
    }
  }

  getViewBoundaries(hero) {
    const value = {
      width: HERO.cameraWidth * hero.zoomMultiplier,
      height: HERO.cameraHeight * hero.zoomMultiplier,
      centerX: hero.x + hero.width/2,
      centerY: hero.y + hero.height/2,
    }
    value.x = value.centerX - value.width/2
    value.y = value.centerY - value.height/2
    let nonGrid = {...value}
    const { leftDiff, rightDiff, topDiff, bottomDiff } = gridUtil.getAllDiffs(value)
    gridUtil.snapDragToGrid(value)

    return {
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
    if(GAME.world.globalTags.shouldRestoreHero && GAME.heros && hero) {
      GAME.heroList.forEach((currentHero) => {
        if(currentHero.id == hero.id) {
          return currentHero
        }
      })
      console.log('failed to find hero with id' + HERO.id)
    }

    if(!GAME.world.globalTags.isAsymmetric && GAME.hero) {
      delete GAME.hero.id
      hero = JSON.parse(JSON.stringify(GAME.hero))
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
      lastPowerUpId: hero.lastPowerUpId,
      directions: hero.directions,
      gridX: hero.gridX,
      gridY: hero.gridY,
      inputDirection: hero.inputDirection,
      reachablePlatformWidth: hero.reachablePlatformWidth,
      reachablePlatformHeight: hero.reachablePlatformHeight,
      animationZoomMultiplier: hero.animationZoomMultiplier,
      animationZoomTarget: hero.animationZoomTarget,
      endAnimation: hero.endAnimation,
      chat: hero.chat,
      chatName: hero.chatName,
      _parentId: hero._parentId,
      _skipNextGravity: hero._skipNextGravity,
      interactableObject: hero.interactableObject,
      gridHeight: hero.gridHeight,
      gridWidth: hero.gridWidth,
      updateHistory: hero.updateHistory,
      onGround: hero.onGround,
      customState: hero.customState,
    }

    if(hero.subObjects) {
      state.subObjects = {}
      OBJECTS.forAllSubObjects(hero.subObjects, (subObject, key) => {
        state.subObjects[key] = OBJECTS.getState(subObject)
        window.removeFalsey(state.subObjects[key])
      })
    }

    return state
  }

  getProperties(hero) {
    let properties = {
      id: hero.id,
      actionButtonBehavior: hero.actionButtonBehavior,
      arrowKeysBehavior: hero.arrowKeysBehavior,
      jumpVelocity: hero.jumpVelocity,
      velocityMax: hero.velocityMax,
      speed: hero.speed,
      width: hero.width,
      height: hero.height,
      flags: hero.flags,
      tags: hero.tags,
      zoomMultiplier: hero.zoomMultiplier,
      color: hero.color,
      lives: hero.lives,
      spawnPointX: hero.spawnPointX,
      spawnPointY: hero.spawnPointY,
      relativeX: hero.relativeX,
      relativeY: hero.relativeY,
      relativeId: hero.relativeId,
      parentId: hero.parentId,
      customProps: hero.customProps,
    }

    if(hero.subObjects) {
      properties.subObjects = {}
      OBJECTS.forAllSubObjects(hero.subObjects, (subObject, key) => {
        properties.subObjects[key] = OBJECTS.getProperties(subObject)
        window.removeFalsey(properties.subObjects[key])
      })
    }

    return properties
  }

  getMapState(hero) {
    let mapState = {
      id: hero.id,
      x: hero.x,
      y: hero.y,
      width: hero.width,
      height: hero.height,
      interactableObject: hero.interactableObject,
      chat: hero.chat,
      flags: hero.flags,
      directions: hero.directions,
      zoomMultiplier: hero.zoomMultiplier,
      animationZoomMultiplier: hero.animationZoomMultiplier,
      color: hero.color,
      inputDirection: hero.inputDirection,
      lives: hero.lives,
      score: hero.score,
      removed: hero.removed,
      custom: hero.custom,
    }

    if(hero.subObjects) {
      mapState.subObjects = {}
      OBJECTS.forAllSubObjects(hero.subObjects, (subObject, key) => {
        mapState.subObjects[key] = {}
        mapState.subObjects[key].x = subObject.x
        mapState.subObjects[key].y = subObject.y
        mapState.subObjects[key].width = subObject.width
        mapState.subObjects[key].height = subObject.height
      })
    }

    return mapState
  }

  onEditHero(updatedHero) {
    window.mergeDeep(GAME.heros[updatedHero.id], updatedHero)
  }

  onResetHeroToDefault(hero) {
    GAME.heros[hero.id] = HERO.resetToDefault(GAME.heros[hero.id])
  }
  onResetHeroToGameDefault(hero) {
    GAME.heros[hero.id] = HERO.resetToDefault(GAME.heros[hero.id], true)
  }

  onRespawnHero(hero) {
    console.log(hero)
    HERO.respawn(GAME.heros[hero.id])
    console.log(hero)
  }

  addHero(hero) {
    GAME.heros[hero.id] = hero
    if(hero.subObjects) {
      OBJECTS.forAllSubObjects(hero.subObjects, (subObject, key) => {
        if(!subObject.id) {
          subObject.id = key + window.uniqueID()
        }
        PHYSICS.addObject(subObject)
      })
    }
    PHYSICS.addObject(hero)
  }

  removeHero(hero) {
    GAME.heros[hero.id].removed = true
  }

  onDeleteHero(hero) {
    HERO.deleteHero(hero)
  }

  deleteHero(hero) {
    if(hero.subObjects) {
      OBJECTS.forAllSubObjects(hero.subObjects, (subObject, key) => {
        PHYSICS.removeObject(subObject)
      })
    }
    PHYSICS.removeObject(GAME.heros[hero.id])
    delete GAME.heros[hero.id]
  }

  onNetworkUpdateHero(updatedHero) {
    if(!PAGE.gameLoaded) return
    HERO.resetReachablePlatformArea(updatedHero)
    if(!PAGE.role.isHost) {
      window.mergeDeep(GAME.heros[updatedHero.id], updatedHero)
      if(PAGE.role.isPlayer && HERO.id === updatedHero.id) {
        window.mergeDeep(GAME.heros[HERO.id], updatedHero)
      }
    }
  }

  onSendHeroInput(input, heroId) {
    // dont update input for hosts hero since we've already locally updated
    if(PAGE.role.isPlayer && GAME.heros[HERO.id] && heroId == HERO.id) {
      return
    }
    GAME.heroInputs[heroId] = input
  }

  onSendHeroKeyDown(keyCode, heroId) {
    // dont do keydown event for hosts hero since we've already done locally
    if(PAGE.role.isPlayer && heroId == HERO.id) return
    let hero = GAME.heros[heroId]
    input.onKeyDown(keyCode, hero)
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
    let gravity = 1000
    let delta = (0 - velocity)/gravity
    let height = (velocity * delta) +  ((gravity * (delta * delta))/2)
    return height
  }

  resetReachablePlatformWidth(hero) {
    // for flatDiagonal
    let velocityX = hero.speed
    if(Math.abs(velocityX) > Math.abs(hero.velocityMax)) velocityX = Math.abs(hero.velocityMax)


    let deltaVelocityYToUse = hero.jumpVelocity
    if(Math.abs(hero.jumpVelocity) > Math.abs(hero.velocityMax)) deltaVelocityYToUse = Math.abs(hero.velocityMax)
    let gravity = 1000
    let deltaInAir = (0 - deltaVelocityYToUse)/gravity
    let width = (velocityX * deltaInAir)
    return width * 2
  }
}

window.HERO = new Hero()
