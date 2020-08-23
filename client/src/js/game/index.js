import gridUtil from '../utils/grid.js'
import pathfinding from '../utils/pathfinding.js'

import ai from './ai'
import input from './input.js'
import triggers from './triggers.js'
import gameState from './gameState.js'
import tags from './tags.js'
import timeouts from './timeouts'
import world from './world.js'
import grid from './grid.js'
import dayNightCycle from './daynightcycle.js'

import onTalk from './heros/onTalk'
import { startQuest } from './heros/quests'
import { processSequence } from './sequence'
import { testCondition, testEventMatch } from './conditions'

import './objects'
import './heros'

class Game{
  constructor() {
    this.pfgrid = null
    this.heros = {}
    this.heroList = []
    this.objects = []
    this.objectsById = {}
    this.world = {}
    this.grid = {}
    this.state = {}
    this.ai = ai
  }

  onPageLoaded() {
    world.setDefault()
    gameState.setDefault()
    grid.setDefault()
    tags.setDefault()
    input.setDefault()
    timeouts.setDefault()
    dayNightCycle.setDefault()

    triggers.onPageLoaded()
    input.onPageLoaded()
  }

  onUpdate(delta) {
    GAME.heroList = []
    HERO.forAll((hero) => {
      GAME.heroList.push(hero)
    })
    GAME.getObjectsByTag()

    if(PAGE.role.isHost) {
      // remove second part when a player can host a multiplayer game
      if(!GAME.gameState.paused && (!PAGE.role.isPlayer || !GAME.heros[HERO.id].flags.paused)) {
        //// PREPARE ALL
        PHYSICS.prepareObjectsAndHerosForMovementPhase()

        if(!GAME.gameState.started) {
          GAME.heroList.forEach(hero => {
            if(hero.flags.paused) return
            if(GAME.heroInputs[hero.id]) input.onUpdate(hero, GAME.heroInputs[hero.id], delta)
            window.local.emit('onUpdateHero', hero, GAME.heroInputs[hero.id], delta)
            PHYSICS.updatePosition(hero, delta)
            PHYSICS.prepareObjectsAndHerosForCollisionsPhase(hero, [], [])
            PHYSICS.heroCorrection(hero, [], [])
            PHYSICS.postPhysics([], [])
          })

          GAME.objects.forEach((object) => {
            if(object.removed) return
            window.local.emit('onUpdateObject', object, delta)
          })
          timeouts.onUpdate(delta)
          GAME.loadActiveMods()
        }

        dayNightCycle.update(delta)

        if(GAME.gameState.started) {

        //////////////////////////////
        //////////////////////////////
        //////////////////////////////
        //// 1. UPDATE GAME STATE PHASE -- START
        //////////////////////////////
        //////////////////////////////
        //// UPDATE SERVICES
        GAME.gameState.sequenceQueue.forEach((sequence) => {
          processSequence(sequence)
        })
        GAME.updateActiveMods()

        timeouts.onUpdate(delta)

        //////////////////////////////
        //// HEROS
        GAME.heroList.forEach(hero => {
          if(hero.flags.paused) return
          if(GAME.heroInputs[hero.id]) input.onUpdate(hero, GAME.heroInputs[hero.id], delta)
          window.local.emit('onUpdateHero', hero, GAME.heroInputs[hero.id], delta)
        })
        //////////////////////////////
        //// OBJECTS
        GAME.ai.onUpdate(GAME.objects, delta)
        GAME.resetPaths = false
        GAME.objects.forEach((object) => {
          if(object.removed) return
          window.local.emit('onUpdateObject', object, delta)
        })

        //// UPDATE GAME STATE PHASE -- END
        //////////////////////////////
        //////////////////////////////

        // XXXXXX

        //////////////////////////////
        //////////////////////////////
        //////////////////////////////
        //// 2. PHYSICS MOVEMENT PHASE -- START
        //////////////////////////////
        //////////////////////////////
        //////////////////////////////
        //// HEROS
        GAME.heroList.forEach(hero => {
          if(hero.flags.paused) return
          PHYSICS.updatePosition(hero, delta)
          // GAME.heroInputs[id] = {}
        })
        //// OBJECTS
        if(GAME.gameState.started) {
          GAME.objects.forEach((object) => {
            if(object.removed) return
            PHYSICS.updatePosition(object, delta)
          })
        }
        //////////////////////////////
        // PHYSICS MOVEMENT PHASE -- END
        //////////////////////////////
        //////////////////////////////

        // XXXXXX

        //////////////////////////////
        //////////////////////////////
        //////////////////////////////
        // 3. PHYSICS EVENTS AND CORRECTIONS PHASES - START
        //////////////////////////////
        //////////////////////////////
        PHYSICS.correctAndEffectAllObjectAndHeros(delta)
        //////////////////////////////
        // PHYSICS EVENTS AND CORRECTIONS PHASES - END
        //////////////////////////////
        //////////////////////////////
        }
        // XXXXXX

        //////////////////////////////
        //////////////////////////////
        //////////////////////////////
        //// 4. SPECIAL EVENT PHASE - START
        //////////////////////////////
        //// ANIMATION
        GAME.heroList.forEach((hero) => {
          if(hero.animationZoomTarget) {
            HERO.zoomAnimation(hero)
          }
        })
        //////////////////////////////
        //// ANTICIPATE OBJECT
        if(PAGE.role.isHost && OBJECTS.anticipatedForAdd) {
          let hero = GAME.heros[HERO.id]
          if(PAGE.role.isPlayEditor) {
            hero = window.editingHero
          }
          if(PAGE.role.isPlayer) OBJECTS.anticipatedAdd(GAME.heros[HERO.id])
          else if(PAGE.role.isPlayEditor) OBJECTS.anticipatedAdd(window.editingHero)
        }
        //////////////////////////////
        //// SPECIAL EVENT PHASE - END
        //////////////////////////////
        //////////////////////////////
      }
    }

    if((PAGE.role.isHost || PAGE.role.isPlayEditor) && GAME.world.tags.calculatePathCollisions) {
      GAME.updateGridObstacles()
      GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
    }
  }

  onAskJoinGame(heroId) {
    let hero = GAME.heros[heroId]
    if(!hero) {
      hero = HERO.summonFromGameData({id: heroId})
      hero.id = heroId
      window.socket.emit('heroJoinedGamed', hero)
    }
  }

  onHeroJoinedGame(hero) {
    HERO.addHero(hero, { skipEventListeners: true })
    if(hero.id == HERO.id) {
      window.local.emit('onHeroFound', hero)
    }
  }

  onHeroFound(hero) {
    GAME.loadHeros(GAME)
    window.local.emit('onGameLoaded')
  }

  onGameLoaded() {
    PAGE.gameLoaded = true
    GAME.gameState.loaded = true
    GAME.gameState.paused = false
    dayNightCycle.onGameLoaded()
  }

  loadAndJoin(game) {
    window.local.emit('onStartLoadingScreen')

    GAME.loadGridWorldObjectsCompendiumState(game)

    // if you are a player and you dont already have a hero from the server ask for one
    if(PAGE.role.isPlayer && !GAME.heros[HERO.id]) {
      if(GAME.heros[HERO.id]) {
        window.local.emit('onHeroFound', GAME.heros[HERO.id])
      } else {
        window.socket.emit('askJoinGame', HERO.id)
      }
    } else {
      GAME.loadHeros(GAME)
      window.local.emit('onGameLoaded')
    }
  }

  loadGridWorldObjectsCompendiumState(game){
    GAME.id = game.id
    GAME.grid = game.grid
    window.local.emit('onGridLoaded')

    tags.setDefault()
    if(game.tags) {
      tags.addGameTags(game.tags)
      GAME.tags = game.tags
    } else GAME.tags = {}

    input.setDefault()
    if(game.customInputBehavior) {
      input.addCustomInputBehavior(game.customInputBehavior)
      GAME.customInputBehavior = game.customInputBehavior
    } else GAME.customInputBehavior = []

    if(game.compendium) window.compendium = game.compendium

    GAME.defaultHero = game.defaultHero || game.hero || window.defaultHero
    GAME.defaultHero.id = 'default hero'

    // let storedGameState = localStorage.getItem('gameStates')
    // if(storedGameState) storedGameState = storedGameState[game.id]
    // if(game.world.storeGameState && storedGameState) {
    //   GAME.objects = storedGameState.objects
    //   GAME.world = storedGameState.world
    //   GAME.gameState = storedGameState.gameState
    // } else {

    // game state
    if(game.gameState && game.gameState.loaded) {
      GAME.gameState = game.gameState
      if(!GAME.gameState) GAME.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
      // GAME.gameState.sequenceQueue = []
      // GAME.gameState.activeModList = []
      //( remove timouts from this list when you can convert this functions to strings and use eval..)
      GAME.gameState.timeouts = []
      GAME.gameState.timeoutsById = {}
      // GAME.gameState.logs = []
    } else {
      GAME.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
    }

    GAME.objectsById = {}
    GAME.objects = game.objects.map((object) => {
      OBJECTS.addObject(object)
      if(!GAME.gameState.loaded) {
        OBJECTS.respawn(object)
      }
      return object
    })

    // if(!GAME.gameState.loaded) {
    //   GAME.objects.filter((object) => !object.spawned)
    // }

    // for host to find themselves ONRELOAD really is all...
    if(game.heros) {
      GAME.heros = game.heros
    }

    // grid
    GAME.world = game.world
    if(!GAME.world.sequences) GAME.world.sequences = {}
    if(!GAME.world.animations) GAME.world.animations = {}
    GAME.grid.nodes = gridUtil.generateGridNodes(GAME.grid)
    GAME.updateGridObstacles()
    GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
    GAME.handleWorldUpdate(GAME.world)

    if(PAGE.role.isPlayEditor) {
      window.gamestateeditor.update(GAME.gameState)
    }

    // window.local.emit('onWorldLoaded')
    // window.local.emit('onGameStateLoaded')
    // window.local.emit('onCompendiumLoaded')
    // window.local.emit('onObjectsLoaded')
    window.local.emit('onGameHeroLoaded')
  }

  loadHeros(heros) {
    if(!GAME.gameState.loaded) {
      GAME.heroList.forEach((hero) => {
        GAME.heros[hero.id] = HERO.summonFromGameData(hero)
        GAME.heros[hero.id].id = hero.id
      })
    }

    GAME.heroList = []
    HERO.forAll((hero) => {
      GAME.heroList.push(hero)
      HERO.addHero(hero)
    })

    window.local.emit('onHerosLoaded')
  }

  unload() {
    window.local.emit('onGameUnload')

    if(PAGE.role.isPlayEditor) {
      window.editingObject = {
        id: null,
        i: null,
      }
      window.objecteditor.saved = true
      window.objecteditor.update({})
    }

    GAME.objects.forEach((object) => {
      OBJECTS.unloadObject(object)
    })

    GAME.heroList.forEach((hero) => {
      HERO.deleteHero(hero)
    })

    GAME.gameState.sequenceQueue.forEach((sequence) => {
      sequence.eventListeners.forEach((remove) => {
        remove()
      })
    })

    GAME.gameState.activeModList.forEach((mod) => {
      if(mod.removeEventListener) mod.removeEventListener()
    })

    GAME.gameState = null
  }

  snapToGrid() {
    GAME.objects.forEach((object) => {
      if(object.removed) return

      gridUtil.snapObjectToGrid(object)
    })

    gridUtil.snapObjectToGrid(GAME.heros[HERO.id])
    GAME.heros[HERO.id].width = GAME.grid.nodeSize
    GAME.heros[HERO.id].height = GAME.grid.nodeSize
  }

  onAddGameTag(tagName) {
    GAME.tags[tagName] = false
    tags.addGameTags({[tagName]: false})
  }

  onUpdateGameCustomInputBehavior(customInputBehavior) {
    input.setDefault()
    input.addCustomInputBehavior(customInputBehavior)
    GAME.customInputBehavior = customInputBehavior
  }

  addObstacle(object) {
    if(((!object.path || !object.path.length) && (!object.tags.moving && object.tags.stationary) && object.tags.obstacle) || GAME.world.tags.calculatePathCollisions || object.tags.onlyHeroAllowed) {
      // pretend we are dealing with a 0,0 plane
      let x = object.x - GAME.grid.startX
      let y = object.y - GAME.grid.startY

      let diffX = x % GAME.grid.nodeSize
      x -= diffX
      x = x/GAME.grid.nodeSize

      let diffY = y % GAME.grid.nodeSize
      y -= diffY
      y = y/GAME.grid.nodeSize

      let gridWidth = object.width / GAME.grid.nodeSize;
      let gridHeight = object.height / GAME.grid.nodeSize;

      for(let currentx = x; currentx < x + gridWidth; currentx++) {
        for(let currenty = y; currenty < y + gridHeight; currenty++) {
          GAME.hasObstacleUpdate(currentx, currenty, true)
        }
      }
    }
  }

  hasObstacleUpdate(x, y, hasObstacle) {
    if(x >= 0 && x < GAME.grid.width) {
      if(y >= 0 && y < GAME.grid.height) {
        let gridNode = GAME.grid.nodes[x][y]
        gridNode.hasObstacle = hasObstacle
      }
    }
  }

  removeObstacle(object) {
    // pretend we are dealing with a 0,0 plane
    let x = object.x - GAME.grid.startX
    let y = object.y - GAME.grid.startY

    let diffX = x % GAME.grid.nodeSize
    x -= diffX
    x = x/GAME.grid.nodeSize

    let diffY = y % GAME.grid.nodeSize
    y -= diffY
    y = y/GAME.grid.nodeSize

    let gridWidth = object.width / GAME.grid.nodeSize;
    let gridHeight = object.height / GAME.grid.nodeSize;

    for(let currentx = x; currentx < x + gridWidth; currentx++) {
      for(let currenty = y; currenty < y + gridHeight; currenty++) {
        GAME.hasObstacleUpdate(currentx, currenty, false)
      }
    }
  }

  updateGridObstacles() {
    if(GAME.grid.width !== GAME.grid.nodes.length) {
      // were in the middle of a grid update HOMIE!!
      return
    }

    GAME.forEachGridNode((gridNode) => {
      if(gridNode) gridNode.hasObstacle = false
    })

    GAME.objects.forEach((obj) => {
      if(obj.removed) return

      if(obj.tags && obj.tags.obstacle || obj.tags.onlyHeroAllowed) {
        if(obj.constructParts) {
          obj.constructParts.forEach((part) => {
            GAME.addObstacle({...part, tags: obj.tags})
          })
        } else {
          GAME.addObstacle(obj)
        }
      }
    })
  }

  forEachGridNode(fx) {
    for(var i = 0; i < GAME.grid.width; i++) {
      for(var j = 0; j < GAME.grid.height; j++) {
        fx(GAME.grid.nodes[i][j])
      }
    }
  }

  addTimeout(id, numberOfSeconds, fx) {
    timeouts.addTimeout(id, numberOfSeconds, fx)
  }
  incrementTimeout(id, numberOfSeconds) {
    timeouts.incrementTimeout(id, numberOfSeconds)
  }
  resetTimeout(id, numberOfSeconds) {
    timeouts.resetTimeout(id, numberOfSeconds)
  }
  addOrResetTimeout(id, numberOfSeconds, fx) {
    timeouts.addOrResetTimeout(id, numberOfSeconds, fx)
  }
  completeTimeout(id) {
    timeouts.completeTimeout(id)
  }
  clearTimeout(id) {
    timeouts.clearTimeout(id)
  }

  onAddTrigger(ownerId, trigger) {
    const { eventName } = trigger
    const owner = OBJECTS.getObjectOrHeroById(ownerId)
    triggers.addTrigger(owner, trigger)
  }
  onEditTrigger(ownerId, triggerId, trigger) {
    const owner = OBJECTS.getObjectOrHeroById(ownerId)
    triggers.deleteTrigger(owner, triggerId)
    triggers.addTrigger(owner, trigger)
  }
  onDeleteTrigger(ownerId, triggerId) {
    triggers.deleteTrigger(OBJECTS.getObjectOrHeroById(ownerId), triggerId)
  }

  onGameReady() {
    window.local.emit('onLoadingScreenEnd')
  }

  onStopGame() {
    if(!GAME.gameState.started) {
      return console.log('trying to stop game that aint even started yet')
    }

    window.local.emit('onLoadingScreenStart')

    setTimeout(() => {
      let initialGameState = localStorage.getItem('initialGameState')
      if(!initialGameState) {
        GAME.unload()
        GAME.loadAndJoin(GAME)
        return console.log('game stopped, but no initial game state set')
      }

      initialGameState = JSON.parse(initialGameState)
      GAME.unload()
      GAME.loadAndJoin(initialGameState)
      window.local.emit('onGameStopped')
    }, 100)
  }

  onGameStart() {
    if(GAME.gameState.started) {
      return console.log('trying to start game that has already started')
    }

    window.local.emit('onLoadingScreenStart')

    setTimeout(() => {
      // remove all references to the objects, state, heros, world, etc so we can consider them state while the game is running!
      localStorage.setItem('initialGameState', JSON.stringify(GAME.cleanForSave(GAME)))

      GAME.heroList.forEach((hero) => {
        HERO.spawn(hero)
        hero.questState = {}
        if(hero.quests) {
          Object.keys(hero.quests).forEach((questId) => {
            hero.questState[questId] = {
              started: false,
              active: false,
              completed: false,
            }
          })
        }
      })

      GAME.objects.forEach((object) => {
        OBJECTS.respawn(object)
        if(object.tags.talkOnStart) {
          GAME.heroList.forEach((hero) => {
            onTalk(hero, object, {}, [], [], { fromStart: true })
          })
        }
        if(object.tags.giveQuestOnStart) {
          GAME.heroList.forEach((hero) => {
            startQuest(hero, object.questGivingId)
          })
        }
      })
      GAME.gameState.paused = false
      GAME.gameState.started = true
      window.local.emit('onGameStarted')
    }, 100)
  }

  cleanForSave(game) {
    let gameCopy = JSON.parse(JSON.stringify({
      //.filter((object) => !object.spawned)
      id: game.id,
      objects: game.objects,
      world: game.world,
      grid: game.grid,
      tags: game.tags,
      customInputBehavior: game.customInputBehavior,
      // defaultHero: game.defaultHero,
    }))

    if(!gameCopy.world.tags.shouldRestoreHero && !gameCopy.world.tags.isAsymmetric && game.heros) {
      for(var heroId in game.heros) {
        if(game.heros[heroId].tags.default) {
          gameCopy.defaultHero = JSON.parse(JSON.stringify(game.heros[heroId]))
        }
      }
      if(!gameCopy.defaultHero && game.heros[heroId]) gameCopy.defaultHero = JSON.parse(JSON.stringify(game.heros[heroId]))
      else if(!gameCopy.defaultHero && game.heroList.length) gameCopy.defaultHero = JSON.parse(JSON.stringify(game.heroList[0]))
      else if(!gameCopy.defaultHero && game.defaultHero) gameCopy.defaultHero = game.hero
      else if(!gameCopy.defaultHero) return alert('could not find a game hero')
    }

    if(!gameCopy.id) {
      gameCopy.id = 'game-' + window.uniqueID()
    }

    if(gameCopy.grid && gameCopy.grid.nodes) {
      delete gameCopy.grid.nodes
    }

    gameCopy.objects = gameCopy.objects.map((object) => {
      window.removeFalsey(object.tags, true)
      let props = OBJECTS.getProperties(object)
      window.removeFalsey(props)
      return props
    })

    gameCopy.defaultHero = HERO.getProperties(gameCopy.defaultHero)
    window.removeFalsey(gameCopy.defaultHero)
    window.removeFalsey(gameCopy.defaultHero.tags, true)

    return gameCopy
  }

  onEditGameState(gameState) {
    window.mergeDeep(GAME.gameState, gameState)
  }

  onUpdateGameState(gameState) {
    if(!PAGE.gameLoaded) return
    if(!PAGE.role.isHost) window.mergeDeep(GAME.gameState, gameState)
  }

  onChangeGame(game) {
    if(GAME.id) {
      GAME.unload()
    }
    GAME.loadAndJoin(game)
    ARCADE.changeGame(game.id)
  }

  onReloadGame(game) {
    // for demo
    let animationZoomTarget
    let animationZoomMultiplier
    if(PAGE.role.isHost && HERO.id && GAME.heros[HERO.id].animationZoomTarget) {
      const hero = GAME.heros[HERO.id]
      animationZoomTarget = hero.animationZoomTarget;
      animationZoomMultiplier = hero.animationZoomMultiplier;
    }

    GAME.unload()
    GAME.loadAndJoin(game)

    const removeEventListener = window.local.on('onGameLoaded', () => {
      // for demo
      if(animationZoomTarget) {
        GAME.heros[HERO.id].animationZoomTarget = animationZoomTarget
      }
      if(animationZoomMultiplier) {
        GAME.heros[HERO.id].animationZoomMultiplier = animationZoomMultiplier
      }
      removeEventListener()
    })

  }

  onUpdateGrid(grid) {
    GAME.grid = grid
    GAME.grid.nodes = gridUtil.generateGridNodes(grid)
    GAME.updateGridObstacles()
    if(PAGE.role.isHost) {
      GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
    }
  }

  onUpdateWorld(updatedWorld) {
    if(GAME.world) {
      for(let key in updatedWorld) {
        const value = updatedWorld[key]

        if(value instanceof Object) {
          GAME.world[key] = {}
          window.mergeDeep(GAME.world[key], value)
        } else {
          GAME.world[key] = value
        }
      }
      GAME.handleWorldUpdate(updatedWorld)
    }
  }

  handleWorldUpdate(updatedWorld) {
    for(let key in updatedWorld) {
      const value = updatedWorld[key]

      if(key === 'lockCamera' && !PAGE.role.isPlayEditor) {
        if(value && value.limitX) {
          MAP.camera.setLimit(value.limitX, value.limitY, value.centerX, value.centerY)
        } else {
          MAP.camera.clearLimit();
        }
      }

      if(key === 'gameBoundaries') {
        GAME.updateGridObstacles()
        if(PAGE.role.isHost) GAME.resetPaths = true
        if(PAGE.role.isHost) GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
      }

      if(key === 'tags') {
        for(let tag in updatedWorld.tags) {
          const tagVal = updatedWorld.tags[tag]
          if(tag === 'calculatePathCollisions' && GAME.grid.nodes) {
            GAME.updateGridObstacles()
            if(PAGE.role.isHost) GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
          }
          if(tag === 'allMovingObjectsHaveGravityY') {
            GAME.objects.forEach((object) => {
              object.velocityY = 0
            });
            GAME.heroList.forEach((object) => {
              object.velocityY = 0
            });
          }
          if(PAGE.gameLoaded) {
            if(tag === 'hasGameLog') {
              if(!tagVal) PAGE.closeLog()
              if(tagVal) {
                PAGE.openLog()
              }
            }
          }
        }
      }
    }

    window.local.emit('onUpdatePFgrid')

    if(PAGE.role.isPlayEditor) {
      // window.worldeditor.update(GAME.world)
      // window.worldeditor.expandAll()
    }
  }

  onUpdatePFgrid() {
    if(!GAME.world.tags.calculatePathCollisions) {
      GAME.updateGridObstacles()
      GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
    }
  }

  onResetWorld() {
    GAME.world = JSON.parse(JSON.stringify(window.defaultWorld))
    if(!PAGE.role.isPlayEditor) MAP.camera.clearLimit()
    GAME.handleWorldUpdate(GAME.world)
  }

  onResetObjects() {
    GAME.objects.forEach((object) => {
      window.local.emit('onDeleteObject', object)
    }, [])
    GAME.objects = []
    GAME.objectsById = {}
  }

  addSequence(sequence) {
    GAME.world.sequences[sequence.id] = sequence
  }

  startMod(ownerId, mod) {
    mod = JSON.parse(JSON.stringify(mod))
    mod.ownerId = ownerId
    GAME.gameState.activeModList.push(mod)

    if(mod.conditionType && mod.conditionType.length && mod.conditionType !== 'none') {
      if(mod.conditionType === 'onEvent') {
        mod.removeEventListener = window.local.on(mod.conditionEventName, (mainObject, guestObject) => {
          const ownerObject = OBJECTS.getObjectOrHeroById(mod.ownerId)
          const eventMatch = testEventMatch(mod.conditionEventName, mainObject, guestObject, mod, ownerObject, { testPassReverse: mod.testPassReverse, testModdedVersion: mod.testModdedVersion })
          if(eventMatch) {
            mod._remove = true
            mod.removeEventListener()
            delete mod.removeEventListener
          }
        })
      }
      if(mod.conditionType === 'onTimerEnd') {
        GAME.addTimeout(window.uniqueID(), mod.conditionValue || 10, () => {
          mod._remove = true
        })
      }
    }
  }

  testMod(mod, testObject) {
    if(mod.conditionType && mod.conditionType.length && mod.conditionType !== 'none' && mod.conditionType !== 'onTimerEnd' && mod.conditionType !== 'onEvent') {
      if(testCondition(mod, testObject, { testPassReverse: mod.testPassReverse })) {
        mod._disabled = false
        return true
      } else if(mod.testFailDestroyMod) {
        if(mod.removeEventListener) mod.removeEventListener()
        return false
      } else {
        mod._disabled = true
        return true
      }
    }

    return true
  }

  updateActiveMods() {
    /*
    {
      //modname
      effectJSON: {},
      // other effect values

      conditionType // onEvent, onTimer
      conditionEventName
      conditionTimerValue
      conditionValue
      testPassReverse
      testFailDestroyMod
      testAndModOwnerWhenEquipped
    }
    */
    GAME.gameState.activeModList = GAME.gameState.activeModList.filter(mod => {
      const modOwnerObject = OBJECTS.getObjectOrHeroById(mod.ownerId)

      if(mod._remove) {
        if(mod.removeEventListener) mod.removeEventListener()
        return false
      }

      // this means the owner of the mod's owner object, CONFUSING
      if(mod.testAndModOwnerWhenEquipped) {
        if(modOwnerObject.ownerId && modOwnerObject.isEquipped) {
          const testObject = OBJECTS.getObjectOrHeroById(modOwnerObject.ownerId)
          return GAME.testMod(mod, testObject)
        } else {
          mod._disabled = true
          return true
        }
      }

      const testObject = modOwnerObject
      return GAME.testMod(mod, testObject)
    })

    GAME.loadActiveMods()
  }

  loadActiveMods() {
    GAME.gameState.activeMods = {}
    GAME.modCache = {}
    // create mods to effect the game in the next update
    GAME.gameState.activeModList.forEach((mod) => {
      if(!GAME.gameState.activeMods[mod.ownerId]) GAME.gameState.activeMods[mod.ownerId] = []
      GAME.gameState.activeMods[mod.ownerId].push(mod)
    })
  }

  // actually mod an object
  mod(object) {
    if(!object.id || !GAME.modCache) {
      return object
    }
    if(GAME.modCache[object.id]) {
      let cached = GAME.modCache[object.id]
      cached.x = object.x
      cached.y = object.y
    }

    const activeMods = GAME.gameState.activeMods[object.id]

    if(!activeMods) {
      return object
    } else if(activeMods) {
      const objectCopy = _.cloneDeep(object)
        //moddable propertys
        // tags: JSON.parse(JSON.stringify(object.tags)),
        // speed: object.speed,
        // width: object.width,
        // height: object.height,
        // color: object.color,
        // actionButtonBehavior: object.actionButtonBehavior,
        // arrowKeysBehavior: object.arrowKeysBehavior,
        // spaceBarBehavior: object.spaceBarBehavior,
        // jumpVelocity: object.jumpVelocity,
        // velocityMax: object.velocityMax,
        // tags: object.tags,
        // zoomMultiplier: object.zoomMultiplier,
        // defaultSprite: object.defaultSprite,
        // upSprite: object.upSprite,
        // leftSprite: object.leftSprite,
        // downSprite: object.downSprite,
        // rightSprite: object.rightSprite,
        // spawnPointX: object.spawnPointX,
        // spawnPointY: object.spawnPointY,
        // relativeX: object.relativeX,
        // relativeY: object.relativeY,
        // relativeId: object.relativeId,
        // parentId: object.parentId,
        // name: object.name,
        // namePos: object.namePos,
        // heroDialogue: object.heroDialogue,
        // pathfindingLimit: object.pathfindingLimit,

      activeMods.forEach((mod) => {
        if(mod._disabled) return
        OBJECTS.mergeWithJSON(objectCopy, mod.effectJSON)
      })

      if(objectCopy.subObjects) {
        objectCopy.subObjects = Object.keys(objectCopy.subObjects).reduce((prev, subObjectName) => {
          prev[subObjectName] = objectCopy.subObjects[subObjectName].mod()
          return prev
        }, {})
      }

      GAME.modCache[objectCopy.id] = objectCopy
      return objectCopy
    }
  }

  getObjectsByTag() {
    GAME.objectsByTag = GAME.objects.reduce((map, object) => {
      Object.keys(object.mod().tags).forEach((tag) => {
        if(!map[tag]) map[tag] = []
        if(object.mod().tags[tag] === true) map[tag].push(object)
      })
      return map
    }, {})
    GAME.herosByTag = GAME.heroList.reduce((map, hero) => {
      Object.keys(hero.mod().tags).forEach((tag) => {
        if(!map[tag]) map[tag] = []
        if(hero.mod().tags[tag] === true) map[tag].push(hero)
      })
      return map
    }, {})
  }

  onUpdateGridNode(x, y, update) {
    const key = 'x:'+x+'y:'+y
    if(!GAME.grid.nodeData) GAME.grid.nodeData = {}
    if(!GAME.grid.nodeData[key]) GAME.grid.nodeData[key] = {}
    Object.assign(GAME.grid.nodeData[key], update)
    if(GAME.grid && GAME.grid.nodes && GAME.grid.nodes[x] && GAME.grid.nodes[x][y]) {
      Object.assign(GAME.grid.nodes[x][y], update)
    }
  }

  onSendNotification(options) {
    if(options.log) {
      GAME.addLog(options)
    }
    if(PAGE.role.isHost && options.chat) {
      OBJECTS.chat({ id: options.authorId, text: options.text })
    }
  }

  addLog({ authorId, text, involvedIds, animation, type, heroId, teamId, dateMilliseconds }) {
    GAME.gameState.logs.push({
      teamId,
      heroId,
      authorId,
      text,
      involvedIds,
      animation,
      type,
      dateMilliseconds,
    })
  }

  onAddAnimation(name, animationData) {
    GAME.world.animations[name] = animationData
  }

  onStartMod(mod) {
    GAME.startMod(mod.ownerId, mod)
  }
  onEndMod(manualRevertId) {
    GAME.gameState.activeModList = GAME.gameState.activeModList.filter((mod) => {
      mod._remove = true
      if(mod.manualRevertId === manualRevertId) return false
      return true
    })
  }
}

window.GAME = new Game()
