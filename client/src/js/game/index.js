import hero from './hero.js'
import ghost from './ghost.js'
import timeouts from './timeouts'
import intelligence from './intelligence.js'
import grid from '../grid.js'
import input from './input.js'
import pathfinding from './pathfinding.js'
import objects from './objects.js'
import gameState from './gameState.js'
import world from './world.js'
import tags from './tags.js'
import events from './events.js'

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

  let storedGameState = localStorage.getItem('gameStates')
  if(storedGameState) storedGameState = storedGameState[game.id]
  if(game.world.storeGameState && storedGameState) {
    GAME.objects = storedGameState.objects
    GAME.world = storedGameState.world
    GAME.gameState = storedGameState.gameState
  } else {
    GAME.objects = game.objects
    GAME.world = game.world
    if(game.gameState && game.gameState.loaded) {
      if(!GAME.heros) GAME.heros = {}
      GAME.heros = game.heros
      GAME.gameState = game.gameState
      if(!GAME.gameState) GAME.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
    } else {
      GAME.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
      // you need to keep the heros from last time in this scenario ( you just loaded A WHOLE NEW GAME)
      // GAME.heros = {}
      if(!GAME.heros) GAME.heros = {}
      Object.keys(GAME.heros).forEach((id) => {
        GAME.heros[id] = window.findHeroInNewGame(game, GAME.heros[id])
        GAME.heros[id].id = id
      })
    }
  }

  if(role.isHost && role.isPlayer) {
    // just gotta make sure when we reload all these crazy player bois that the reference for the host hero is reset because it doesnt get reset any other time for the host
    if(GAME.heros[window.hero.id]) {
      window.hero = GAME.heros[window.hero.id]
    } else {
      GAME.heros[window.hero.id] = window.hero
    }
  }

  Object.keys(GAME.heros).forEach((id) => {
    PHYSICS.addObject(GAME.heros[id])
  })

  if(!GAME.objectsById) GAME.objectsById = {}
  GAME.objects.forEach((object) => {
    GAME.objectsById[object.id] = object
    PHYSICS.addObject(object)
  })

  // grid
  GAME.grid.nodes = grid.generateGridNodes(GAME.grid)
  grid.updateGridObstacles()
  window.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
  handleWorldUpdate(GAME.world)

  if(role.isPlayEditor) {
    window.gamestateeditor.update(GAME.gameState)
  }

  /// DEFAULT GAME FX
  if(window.defaultCustomGame) {
    window.defaultCustomGame.onGameLoaded()
  }
  /// CUSTOM GAME FX
  if(window.customGame) {
    window.customGame.onGameLoaded()
  }

  GAME.gameState.loaded = true
}

GAME.unload = function() {
  if(window.defaultCustomGame) {
    window.defaultCustomGame.onGameUnloaded()
  }
  if(window.customGame) {
    window.customGame.onGameUnloaded()
  }
  if(window.liveCustomGame) {
    window.liveCustomGame.onGameUnloaded()
  }

  if(role.isPlayEditor) {
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
}

GAME.update = function(delta) {
  GAME.heroList = []
  window.forAllHeros((hero) => {
    GAME.heroList.push(hero)
  })

  if(role.isPlayer) {
    if(role.isGhost) {
      if(window.hero.id === 'ghost') {
        input.update(window.hero, window.keysDown, delta)
      }
      ghost.update()
    }

    if(!role.isGhost){
      localStorage.setItem('hero', JSON.stringify(window.hero))
      // we are locally updating the hero input as host
      if(!role.isHost && !window.pageState.typingMode) {
        window.socket.emit('sendHeroInput', window.keysDown, window.hero.id)
      }
    }
  }

  if(role.isHost) {
    // remove second part when a player can host a multiplayer game
    if(!GAME.gameState.paused && (!role.isPlayer || !window.hero.flags.paused)) {
      timeouts.update(delta)
      /// DEFAULT GAME FX
      if(window.defaultCustomGame) {
        window.defaultCustomGame.update(delta)
      }
      /// CUSTOM GAME FX
      if(window.customGame) {
        window.customGame.update(delta)
      }
      /// CUSTOM GAME FX
      if(window.liveCustomGame) {
        window.liveCustomGame.update(delta)
      }

      // movement
      PHYSICS.prepareObjectsAndHerosForMovementPhase()
      Object.keys(GAME.heros).forEach((id) => {
        if(window.hero.flags.paused) return
        let hero = GAME.heros[id]
        if(hero.animationZoomTarget) {
          window.heroZoomAnimation(hero)
        }
        if(window.heroInput[id]) input.update(hero, window.heroInput[id], delta)
        PHYSICS.updatePosition(hero, delta)
        // window.heroInput[id] = {}
      })
      intelligence.update(GAME.objects, delta)
      GAME.objects.forEach((object) => {
        PHYSICS.updatePosition(object, delta)
      })

      /// physics and corrections
      PHYSICS.update(delta)

      if(role.isHost && window.anticipatedObject) {
        let hero = window.hero
        if(role.isPlayEditor) {
          hero = window.editingHero
        }
        if(role.isPlayer) window.anticipateObjectAdd(window.hero)
        else if(role.isPlayEditor) window.anticipateObjectAdd(window.editingHero)
      }
    }
  }

  if((role.isHost || role.isPlayEditor) && GAME.world.globalTags.calculatePathCollisions) {
    grid.updateGridObstacles()
    window.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
  }
}

function onPageLoad() {
  objects.setDefault()
  world.setDefault()
  gameState.setDefault()
  tags.setDefault()
  if(!window.isPlayEditor) {
    hero.setDefault()
  }
  if(role.isGhost) {
    ghost.init()
  }
  timeouts.init()
  input.init()
}

function onGameLoad() {
  objects.loaded()

  if(!role.isPlayEditor) {
    hero.loaded()
    input.loaded()
  }

  if(role.isGhost) ghost.loaded()
}

export default {
  onPageLoad,
  onGameLoad,
}
