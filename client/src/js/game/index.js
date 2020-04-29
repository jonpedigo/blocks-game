import physics from './physics'
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
  w.game.grid = game.grid
  window.local.emit('onGridLoaded')

  if(game.compendium) window.compendium = game.compendium
  window.game.hero = game.hero

  let storedGameState = localStorage.getItem('gameStates')
  if(storedGameState) storedGameState = storedGameState[game.id]
  if(game.world.storeGameState && storedGameState) {
    w.game.objects = storedGameState.objects
    w.game.world = storedGameState.world
    w.game.gameState = storedGameState.gameState
  } else {
    w.game.objects = game.objects
    w.game.world = game.world
    if(game.gameState && game.gameState.loaded) {
      if(!w.game.heros) w.game.heros = {}
      w.game.heros = game.heros
      w.game.gameState = game.gameState
      if(!w.game.gameState) w.game.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
    } else {
      w.game.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
      // you need to keep the heros from last time in this scenario ( you just loaded A WHOLE NEW GAME)
      // w.game.heros = {}
      if(!w.game.heros) w.game.heros = {}
      Object.keys(w.game.heros).forEach((id) => {
        w.game.heros[id] = window.findHeroInNewGame(game, w.game.heros[id])
        w.game.heros[id].id = id
      })
    }
  }

  if(role.isHost && role.isPlayer) {
    // just gotta make sure when we reload all these crazy player bois that the reference for the host hero is reset because it doesnt get reset any other time for the host
    if(w.game.heros[window.hero.id]) {
      window.hero = w.game.heros[window.hero.id]
    } else {
      w.game.heros[window.hero.id] = window.hero
    }
  }

  Object.keys(w.game.heros).forEach((id) => {
    PHYSICS.addObject(w.game.heros[id])
  })

  if(!w.game.objectsById) w.game.objectsById = {}
  w.game.objects.forEach((object) => {
    w.game.objectsById[object.id] = object
    PHYSICS.addObject(object)
  })

  // grid
  w.game.grid.nodes = grid.generateGridNodes(w.game.grid)
  grid.updateGridObstacles()
  window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
  handleWorldUpdate(w.game.world)

  if(role.isPlayEditor) {
    window.gamestateeditor.update(w.game.gameState)
  }

  /// DEFAULT GAME FX
  if(window.defaultCustomGame) {
    window.defaultCustomGame.onGameLoaded()
  }
  /// CUSTOM GAME FX
  if(window.customGame) {
    window.customGame.onGameLoaded()
  }

  w.game.gameState.loaded = true
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

  w.game.objects.forEach((object) => {
    PHYSICS.removeObject(object)
  })
  Object.keys(w.game.heros).forEach((heroId) => {
    let hero = w.game.heros[heroId]
    PHYSICS.removeObject(hero)
  })
}

GAME.update = function(delta) {
  w.game.heroList = []
  window.forAllHeros((hero) => {
    w.game.heroList.push(hero)
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
    if(!w.game.gameState.paused && (!role.isPlayer || !window.hero.flags.paused)) {
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
      physics.prepareObjectsAndHerosForMovementPhase()
      Object.keys(w.game.heros).forEach((id) => {
        if(window.hero.flags.paused) return
        let hero = w.game.heros[id]
        if(hero.animationZoomTarget) {
          window.heroZoomAnimation(hero)
        }
        if(window.heroInput[id]) input.update(hero, window.heroInput[id], delta)
        physics.updatePosition(hero, delta)
        // window.heroInput[id] = {}
      })
      w.game.objects.forEach((object) => {
        physics.updatePosition(object, delta)
      })
      intelligence.update(w.game.objects, delta)

      /// physics and corrections
      physics.update(delta)

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

  if((role.isHost || role.isPlayEditor) && w.game.world.globalTags.calculatePathCollisions) {
    grid.updateGridObstacles()
    window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
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
