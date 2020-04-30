import hero from './hero.js'
import timeouts from './timeouts'
import intelligence from './intelligence'
import grid from '../utils/grid.js'
import input from './input.js'
import pathfinding from '../utils/pathfinding.js'
import objects from './objects.js'
import gameState from './gameState.js'
import world from './world.js'
import tags from './tags.js'
import events from './events/index'

window.GAME = {
  pfgrid: null,
  heros: {},
  herosList: [],
  objects: [],
  objectsById: {},
  world: {},
  grid: {},
  state: {},
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
  if(game.heros) GAME.heros = game.heros

  // grid
  GAME.grid.nodes = grid.generateGridNodes(GAME.grid)
  grid.updateGridObstacles()
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
    Object.keys(GAME.heros).forEach((id) => {
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
  }

  Object.keys(GAME.heros).forEach((id) => {
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
  Object.keys(GAME.heros).forEach((heroId) => {
    let hero = GAME.heros[heroId]
    PHYSICS.removeObject(hero)
  })

  GAME.gameState = null
}

GAME.update = function(delta) {
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
      timeouts.update(delta)
      /// DEFAULT GAME FX
      if(GAME.defaultCustomGame) {
        GAME.defaultCustomGame.update(delta)
      }
      /// CUSTOM GAME FX
      if(GAME.customGame) {
        GAME.customGame.update(delta)
      }
      /// CUSTOM GAME FX
      if(GAME.liveCustomGame) {
        GAME.liveCustomGame.update(delta)
      }

      // movement
      PHYSICS.prepareObjectsAndHerosForMovementPhase()
      Object.keys(GAME.heros).forEach((id) => {
        if(HERO.hero.flags.paused) return
        let hero = GAME.heros[id]
        if(hero.animationZoomTarget) {
          heroZoomAnimation(hero)
        }
        if(GAME.heroInputs[id]) input.update(hero, GAME.heroInputs[id], delta)
        PHYSICS.updatePosition(hero, delta)
        // GAME.heroInputs[id] = {}
      })
      intelligence.update(GAME.objects, delta)
      GAME.objects.forEach((object) => {
        PHYSICS.updatePosition(object, delta)
      })

      /// physics and corrections
      PHYSICS.update(delta)

      if(PAGE.role.isHost && window.anticipatedObject) {
        let hero = HERO.hero
        if(PAGE.role.isPlayEditor) {
          hero = window.editingHero
        }
        if(PAGE.role.isPlayer) window.anticipateObjectAdd(HERO.hero)
        else if(PAGE.role.isPlayEditor) window.anticipateObjectAdd(window.editingHero)
      }
    }
  }

  if((PAGE.role.isHost || PAGE.role.isPlayEditor) && GAME.world.globalTags.calculatePathCollisions) {
    grid.updateGridObstacles()
    GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
  }
}

function onPageLoad() {
  world.setDefault()
  gameState.setDefault()
  tags.setDefault()
  objects.setDefault()
  if(!window.isPlayEditor) {
    hero.setDefault()
  }
  timeouts.setDefault()
  input.init()
}

export default {
  onPageLoad,
}
