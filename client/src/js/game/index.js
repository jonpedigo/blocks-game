import gridUtil from '../utils/grid.js'
import pathfinding from '../utils/pathfinding.js'

import ai from './ai'
import input from './input.js'
import triggers from './triggers.js'
import gameState from './gameState.js'
import tags from './tags.js'
import timeouts from './timeouts'
import world from './world.js'

import onTalk from './heros/onTalk'
import { startQuest } from './heros/quests'

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
    tags.setDefault()
    input.setDefault()
    timeouts.setDefault()

    triggers.onPageLoaded()
    input.onPageLoaded()
  }

  onUpdate(delta) {
    GAME.heroList = []
    HERO.forAll((hero) => {
      GAME.heroList.push(hero)
    })

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
          return
        }
        //////////////////////////////
        //////////////////////////////
        //////////////////////////////
        //// 1. UPDATE GAME STATE PHASE -- START
        //////////////////////////////
        //////////////////////////////
        //// TIMEOUT
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

    if((PAGE.role.isHost || PAGE.role.isPlayEditor) && GAME.world.globalTags.calculatePathCollisions) {
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
    HERO.addHero(hero)
    if(hero.id == HERO.id) {
      window.local.emit('onHeroFound', hero)
    }
  }

  onHeroFound(hero) {
    GAME.loadHeros(GAME)
    window.local.emit('onGameLoaded')
  }

  onGameLoaded() {
    GAME.gameState.loaded = true
  }

  loadAndJoin(game) {
    GAME.loadGridWorldObjectsCompendiumState(game)

    // if you are a player and you dont already have a hero from the server ask for one
    if(PAGE.role.isPlayer && !PAGE.role.isGhost && !GAME.heros[HERO.id]) {
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
    GAME.defaultHero = game.defaultHero || game.hero
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
    } else {
      GAME.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
    }

    GAME.objects = game.objects.map((object) => {
      OBJECTS.addObject(object)
      if(!GAME.gameState.loaded) {
        OBJECTS.respawn(object)
      }
      return object
    })

    if(!GAME.gameState.loaded) {
      GAME.objects.filter((object) => !object.spawned)
    }

    // for host to find themselves ONRELOAD really is all...
    if(game.heros) {
      GAME.heros = game.heros
    }

    // grid
    GAME.world = game.world
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
      GAME.heroList.forEach(({id}) => {
        GAME.heros[id] = HERO.summonFromGameData(GAME.heros[id])
        GAME.heros[id].id = id
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
    GAME.heroList.forEach(({id}) => {
      let hero = GAME.heros[id]
      HERO.deleteHero(hero)
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
    if(((!object.path || !object.path.length) && object.tags.stationary && object.tags.obstacle) || GAME.world.globalTags.calculatePathCollisions || object.tags.onlyHeroAllowed) {
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
    GAME.forEachGridNode((gridNode) => {
      gridNode.hasObstacle = false
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

  onAddTrigger(ownerId, trigger) {
    triggers.addTrigger(OBJECTS.getObjectOrHeroById(ownerId), trigger)
  }
  onEditTrigger(ownerId, triggerId, trigger) {
    const owner = OBJECTS.getObjectOrHeroById(ownerId)
    triggers.deleteTrigger(owner, triggerId)
    triggers.addTrigger(owner, trigger)
  }
  onDeleteTrigger(ownerId, triggerId) {
    triggers.deleteTrigger(OBJECTS.getObjectOrHeroById(ownerId), triggerId)
  }

  onStopGame() {
    if(!GAME.gameState.started) {
      return console.log('trying to stop game that aint even started yet')
    }

    let initialGameState = localStorage.getItem('initialGameState')
    if(!initialGameState) {
      return console.log('game stopped, but no initial game state set')
    }

    initialGameState = JSON.parse(initialGameState)
    GAME.unload()
    GAME.loadAndJoin(initialGameState)
    window.local.emit('onGameStopped')
  }

  onGameStart() {
    if(GAME.gameState.started) {
      return console.log('trying to start game that has already started')
    }

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
  }

  cleanForSave(game) {
    let gameCopy = JSON.parse(JSON.stringify({
      objects: game.objects.filter((object) => !object.spawned),
      world: game.world,
      grid: game.grid,
      tags: game.tags,
      customInputBehavior: game.customInputBehavior,
      // defaultHero: game.defaultHero,
    }))

    if(!gameCopy.world.globalTags.shouldRestoreHero && !gameCopy.world.globalTags.isAsymmetric && game.heros) {
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

    let idValue = document.getElementById('game-id').value
    if(idValue) {
      gameCopy.id = idValue
    }else if(!gameCopy.id) {
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
    if(!PAGE.role.isHost) GAME.gameState = gameState
  }

  onChangeGame(game) {
    GAME.unload()
    GAME.loadAndJoin(game)
    ARCADE.changeGame(game.id)
  }

  onReloadGame(game) {
    GAME.unload()
    GAME.loadAndJoin(game)
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

      if(key === 'globalTags' || key === 'editorTags') {
        for(let tag in updatedWorld.globalTags) {
          if(tag === 'calculatePathCollisions' && GAME.grid.nodes) {
            GAME.updateGridObstacles()
            if(PAGE.role.isHost) GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
          }
        }
        if(key === 'syncHero' && PAGE.role.isPlayEditor) {
          window.syncHeroToggle.checked = value
        }
        if(key === 'syncObjects' && PAGE.role.isPlayEditor) {
          window.syncObjectsToggle.checked = value
        }
        if(key === 'syncGameState' && PAGE.role.isPlayEditor) {
          window.syncGameStateToggle.checked = value
        }
      }
    }

    window.local.emit('onUpdatePFgrid')

    if(PAGE.role.isPlayEditor) {
      window.worldeditor.update(GAME.world)
      window.worldeditor.expandAll()
    }
  }

  onUpdatePFgrid() {
    if(!GAME.world.globalTags.calculatePathCollisions) {
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
      PHYSICS.removeObject(object)
    }, [])
    GAME.objects = []
    GAME.objectsById = {}
  }
}

window.GAME = new Game()
