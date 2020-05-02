import hero from './hero.js'
import timeouts from './timeouts'
import ai from './ai'
import gridUtil from '../utils/grid.js'
import input from './input.js'
import pathfinding from '../utils/pathfinding.js'
import objects from './objects.js'
import gameState from './gameState.js'
import world from './world.js'
import tags from './tags.js'
import './events/index'
import './game'

window.GAME = {
  pfgrid: null,
  heros: {},
  heroList: [],
  objects: [],
  objectsById: {},
  world: {},
  grid: {},
  state: {},
  ai: ai,
}

function onPageLoad() {
  input.onPageLoad()
  world.setDefault()
  gameState.setDefault()
  tags.setDefault()
  objects.setDefault()
  if(!window.isPlayEditor) {
    hero.setDefault()
  }
  timeouts.setDefault()
}

GAME.load = function(game){
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
    window.forAllHeros((hero) => {
      GAME.heroList.push(hero)
    })
  }

  // grid
  GAME.grid.nodes = gridUtil.generateGridNodes(GAME.grid)
  gridUtil.updateGridObstacles()
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
}

GAME.loadHeros = function(game, options = { resetHeros: false }) {
  if(options.resetHeros) {
    GAME.heroList.forEach(({id}) => {
      GAME.heros[id] = window.findHeroInNewGame(GAME.heros[id])
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
}

GAME.unload = function() {
  if(GAME.defaultCustomGame) {
    GAME.defaultCustomGame.onGameUnloaded()
  }
  if(GAME.customGame) {
    GAME.customGame.onGameUnloaded()
  }
  if(GAME.liveCustomGame) {
    GAME.liveCustomGame.onGameUnloaded()
  }

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

function onUpdate(delta) {
  GAME.heroList = []
  window.forAllHeros((hero) => {
    GAME.heroList.push(hero)
  })

  if(HERO.hero && HERO.hero.id === 'ghost') {
    input.update(HERO.hero, GAME.keysDown, delta)
  }

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
        //// DEFAULT GAME UPDATE
        if(GAME.defaultCustomGame) {
          GAME.defaultCustomGame.onUpdateHero(hero, GAME.heroInputs[hero.id], delta)
        }
        //////////////////////////////
        //// CUSTOM GAME UPDATE
        if(GAME.customGame) {
          GAME.customGame.onUpdateHero(hero, GAME.heroInputs[hero.id], delta)
        }
        //////////////////////////////
        //// LIVE CUSTOM GAME UPDATE
        if(GAME.liveCustomGame) {
          GAME.liveCustomGame.onUpdateHero(hero, GAME.heroInputs[hero.id], delta)
        }
      })
      //////////////////////////////
      //// OBJECTS
      GAME.ai.onUpdate(GAME.objects, delta)
      GAME.resetPaths = false
      GAME.objects.forEach((object) => {
        if(GAME.defaultCustomGame) {
          GAME.defaultCustomGame.onUpdateObject(object, delta)
        }
        //////////////////////////////
        //// CUSTOM GAME UPDATE
        if(GAME.customGame) {
          GAME.customGame.onUpdateObject(object, delta)
        }
        //////////////////////////////
        //// LIVE CUSTOM GAME UPDATE
        if(GAME.liveCustomGame) {
          GAME.liveCustomGame.onUpdateObject(object, delta)
        }
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
      if(hero.animationZoomTarget) {
        heroZoomAnimation(hero)
      }
      //////////////////////////////
      //// ANTICIPATE OBJECT
      if(PAGE.role.isHost && window.anticipatedObject) {
        let hero = HERO.hero
        if(PAGE.role.isPlayEditor) {
          hero = window.editingHero
        }
        if(PAGE.role.isPlayer) window.anticipateObjectAdd(HERO.hero)
        else if(PAGE.role.isPlayEditor) window.anticipateObjectAdd(window.editingHero)
      }
      //////////////////////////////
      //// SPECIAL EVENT PHASE - END
      //////////////////////////////
      //////////////////////////////
    }
  }

  if((PAGE.role.isHost || PAGE.role.isPlayEditor) && GAME.world.globalTags.calculatePathCollisions) {
    gridUtil.updateGridObstacles()
    GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
  }
}

export default {
  onPageLoad,
  onUpdate,
}
