import gridUtil from '../utils/grid.js'
import pathfinding from '../utils/pathfinding.js'

import ai from './ai'
import input from './input.js'
import gameState from './gameState.js'
import tags from './tags.js'
import timeouts from './timeouts'
import world from './world.js'

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
    timeouts.setDefault()

    input.onPageLoaded()
  }

  onUpdate(delta) {
    GAME.heroList = []
    HERO.forAll((hero) => {
      GAME.heroList.push(hero)
    })

    if(PAGE.role.isHost) {
      // remove second part when a player can host a multiplayer game
      if(!GAME.gameState.paused && (!PAGE.role.isPlayer || !HERO.hero.flags.paused)) {
        //// PREPARE ALL
        PHYSICS.prepareObjectsAndHerosForMovementPhase()
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
        GAME.objects.forEach((object) => {
          if(object.removed) return
          PHYSICS.updatePosition(object, delta)
        })
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
          let hero = HERO.hero
          if(PAGE.role.isPlayEditor) {
            hero = window.editingHero
          }
          if(PAGE.role.isPlayer) OBJECTS.anticipatedAdd(HERO.hero)
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

  load(game, options) {
    let isFirstLoad = !GAME.gameState || !GAME.gameState.loaded
    GAME.loadGridWorldObjectsCompendiumState(game, options)

    // if you are a player and you dont already have a hero from the server ask for one
    if(PAGE.role.isPlayer && !PAGE.role.isGhost && !HERO.hero) {
      HERO.joinGame(onHerosReady)
    } else {
      onHerosReady()
    }

    function onHerosReady() {
      GAME.loadHeros(game, options)
      window.local.emit('onGameLoaded', isFirstLoad)
    }
  }

  loadGridWorldObjectsCompendiumState(game){
    GAME.grid = game.grid
    window.local.emit('onGridLoaded')

    if(game.compendium) window.compendium = game.compendium
    GAME.hero = game.hero

    // let storedGameState = localStorage.getItem('gameStates')
    // if(storedGameState) storedGameState = storedGameState[game.id]
    // if(game.world.storeGameState && storedGameState) {
    //   GAME.objects = storedGameState.objects
    //   GAME.world = storedGameState.world
    //   GAME.gameState = storedGameState.gameState
    // } else {

    GAME.objects = game.objects
    GAME.world = game.world
    // }

    if(!GAME.objectsById) GAME.objectsById = {}
    GAME.objects.forEach((object) => {
      GAME.objectsById[object.id] = object
      PHYSICS.addObject(object)
    })

    // for host to find themselves really is all...
    if(game.heros) {
      GAME.heros = game.heros
      GAME.heroList = []
      HERO.forAll((hero) => {
        GAME.heroList.push(hero)
      })
    }

    // grid
    GAME.grid.nodes = gridUtil.generateGridNodes(GAME.grid)
    GAME.updateGridObstacles()
    GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
    handleWorldUpdate(GAME.world)

    // game state
    if(game.gameState && game.gameState.loaded) {
      GAME.gameState = game.gameState
      if(!GAME.gameState) GAME.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
    } else {
      GAME.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
    }

    if(PAGE.role.isPlayEditor) {
      window.gamestateeditor.update(GAME.gameState)
    }

    GAME.gameState.loaded = true
    window.local.emit('onWorldLoaded')
    window.local.emit('onGameStateLoaded')
    window.local.emit('onCompendiumLoaded')
    window.local.emit('onObjectsLoaded')
  }

  loadHeros(game, options = { resetHeros: false }) {
    if(options.resetHeros) {
      GAME.heroList.forEach(({id}) => {
        GAME.heros[id] = HERO.summonFromGameData(GAME.heros[id])
        GAME.heros[id].id = id
      })
    }

    if(PAGE.role.isHost && PAGE.role.isPlayer) {
      // just gotta make sure when we reload all these crazy player bois that the reference for the host hero is reset because it doesnt get reset any other time for the host
      if(GAME.heros[HERO.hero.id]) {
        HERO.hero = GAME.heros[HERO.hero.id]
      } else {
        GAME.heros[HERO.hero.id] = HERO.hero
      }

      GAME.heroList.push(HERO.hero)
    }

    GAME.heroList.forEach(({id}) => {
      PHYSICS.addObject(GAME.heros[id])
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
      PHYSICS.removeObject(object)
    })
    GAME.heroList.forEach(({id}) => {
      let hero = GAME.heros[id]
      PHYSICS.removeObject(hero)
    })

    GAME.gameState = null
  }

  snapToGrid() {
    GAME.objects.forEach((object) => {
      if(object.removed) return

      gridUtil.snapObjectToGrid(object)
    })

    gridUtil.snapObjectToGrid(HERO.hero)
    HERO.hero.width = GAME.grid.nodeSize
    HERO.hero.height = GAME.grid.nodeSize
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
        GAME.addObstacle(obj)
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

  cleanForNetwork() {
    GAME.objects.forEach((object) => {
      Object.keys(object.tags).forEach((key) => {
        if(object.tags[key] === false) delete object.tags[key]
        OBJECTS.cleanForNetwork(object)
      })
    })

    GAME.heroList.forEach((hero) => {
      HERO.cleanForNetwork(hero)
    })
  }
}

window.GAME = new Game()
