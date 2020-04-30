import gridTool from '../utils/grid.js'
import pathfinding from '../utils/pathfinding.js'
import collisions from '../utils/collisions.js'
import input from '../game/input.js'
import modals from '../mapeditor/modals.js'
import io from 'socket.io-client'

function init() {
  // EVENT SETUP
  if(PAGE.role.isArcadeMode) {
    window.socket = window.local
  } else if (window.location.origin.indexOf('localhost') > 0) {
    window.socket = io.connect('http://localhost:4000');
  } else {
    window.socket = io.connect();
  }

  ///////////////////////////////
  ///////////////////////////////
  // just for host
  ///////////////////////////////

  if(PAGE.role.isHost) {
    window.socket.on('onAskJoinGame', (heroId) => {
      if(GAME) {
        let hero = GAME.heros[heroId]
        if(!hero) {
          hero = window.findHeroInNewGame(GAME, {id: heroId})
          hero.id = heroId
          GAME.heros[hero.id] = hero
          PHYSICS.addObject(hero)
        } else {
          PHYSICS.addObject(hero)
          hero.id = heroId
        }
        window.local.emit('onHeroJoined', hero)
        window.socket.emit('addHeroToGame', hero)
      }
    })

    // PLAYERS CALL THIS
    window.socket.on('onSendHeroInput', (heroInput, heroId) => {
      // dont update input for hosts hero since we've already locally updated
      if(PAGE.role.isPlayer && HERO.hero && heroId == HERO.hero.id) {
        return
      }
      GAME.heroInputs[heroId] = heroInput
    })

    // PLAYERS CALL THIS
    window.socket.on('onSendHeroKeyDown', (keyCode, heroId) => {
      // dont do keydown event for hosts hero since we've already done locally
      if(PAGE.role.isPlayer && heroId == HERO.hero.id) return
      let hero = GAME.heros[heroId]
      input.onKeyDown(keyCode, hero)
    })

    // EDITOR CALLS THIS
    window.socket.on('onResetHeroToDefault', (hero) => {
      Object.keys(GAME.heros).forEach((id) => {
        if(id === hero.id) {
          GAME.heros[id] = window.resetHeroToDefault(GAME.heros[id])
          if(PAGE.role.isPlayer && HERO.hero.id === hero.id) HERO.hero = GAME.heros[id]
        }
      })
    })

    // EDITOR CALLS THIS
    window.socket.on('onRespawnHero', (hero) => {
      Object.keys(GAME.heros).forEach((id) => {
        if(id === hero.id) {
          window.respawnHero(GAME.heros[id])
        }
      })
    })

    // EDITOR CALLS THIS
  	window.socket.on('onEditObjects', (editedObjects) => {
      editedObjects.forEach((obj) => {
        // slow down that gravity boi!
        if(GAME.objectsById[obj.id].tags.gravity && !obj.tags.gravity) {
          obj.velocityY = 0
        }
        let objectById = GAME.objectsById[obj.id]
        // if(!obj.x) {
        //   obj.x = objectById.x
        // }
        // if(!obj.y) {
        //   obj.y = objectById.y
        // }
        obj.path = null
        window.mergeDeep(objectById, obj)
      })
      if(!GAME.world.globalTags.calculatePathCollisions) {
        gridTool.updateGridObstacles()
        GAME.resetPaths = true
        GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
      }
  	})

    // EDITOR CALLS THIS
    window.socket.on('onEditGameState', (gameState) => {
      window.mergeDeep(GAME.gameState, gameState)
      if(PAGE.role.isPlayEditor && window.syncGameStateToggle.checked) {
        window.gamestateeditor.update(gameState)
      }
    })

    // EDITOR CALLS THIS
  	window.socket.on('onSnapAllObjectsToGrid', () => {
  		window.snapAllObjectsToGrid()
  	})

    // EDITOR CALLS THIS
    window.socket.on('onAnticipateObject', (object) => {
  		window.anticipatedObject = object
  	})

    // EDITOR CALLS THIS
    window.socket.on('onStopGame', () => {
      if(!GAME.gameState.started) {
        return console.log('trying to stop game that aint even started yet')
      }

      let initialGameState = localStorage.getItem('initialGameState')
      if(!initialGameState) {
        console.log('game stopped, but no initial game state set')
      }

      if(initialGameState) {
        initialGameState = JSON.parse(initialGameState)
        GAME.objects = initialGameState.objects
        GAME.heros = initialGameState.heros
        GAME.world = initialGameState.world
        GAME.gameState = initialGameState.gameState
        GAME.grid = initialGameState.grid
        GAME.grid.nodes = gridTool.generateGridNodes(GAME.grid)
        gridTool.updateGridObstacles()
        GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
      }

      // GAME.gameState.paused = true
      GAME.gameState.started = false
      GAME.gameState.loaded = true
    })

    // EDITOR CALLS THIS
    window.socket.on('onStartGame', () => {
      if(GAME.gameState.started) {
        return console.log('trying to start game that has already started')
      }

      // remove all references to the objects, state, heros, world, etc so we can consider them state while the game is running!
      localStorage.setItem('initialGameState', JSON.stringify({...GAME, grid: {...GAME.grid, nodes: null }}))
      GAME.gameState.paused = false
      GAME.gameState.started = true

      if(GAME.defaultCustomGame) {
        GAME.defaultCustomGame.onGameStart()
      }
      if(GAME.customGame) {
        GAME.customGame.onGameStart()
      }
      if(GAME.liveCustomGame) {
        GAME.liveCustomGame.onGameStart()
      }
    })
  }

  if(PAGE.role.isGhost) {
    window.socket.on('onSendHeroMapEditor', (remoteState, heroId) => {
      if(HERO.hero && HERO.hero.id === heroId && MAPEDITOR) {
        MAPEDITOR.remoteState = remoteState
      }
    })
  }

  ///////////////////////////////
  ///////////////////////////////
  // UPDATING GAME STATE EVENTS, EDITOR UPDATES ITS OWN STATE IF SYNCED
  ///////////////////////////////
  // HOST CALLS THIS
  window.socket.on('onUpdateGameState', (gameState) => {
    if(!PAGE.gameLoaded) return
    if(!PAGE.role.isHost) GAME.gameState = gameState
    if(PAGE.role.isPlayEditor && window.syncGameStateToggle.checked && !w.editingGame.branch) {
      window.gamestateeditor.update(gameState)
    }
  })

  // host CALLS THIS
  window.socket.on('onUpdateObjects', (objectsUpdated) => {
    if(!PAGE.gameLoaded) return
    if(!PAGE.role.isHost) {
      GAME.objects = objectsUpdated
      GAME.objectsById = GAME.objects.reduce((prev, next) => {
        prev[next.id] = next
        return prev
      }, {})

      // old interpolation code
      // if(PAGE.role.isPlayer) {
      //   objectsUpdated.forEach((obj) => {
      //     let go = GAME.objectsById[obj.id]
      //     if(!go) {
      //       GAME.objectsById[obj.id] = obj
      //       go = obj
      //     }
      //     go._lerpX = obj.x
      //     go._lerpY = obj.y
      //     delete obj.x
      //     delete obj.y
      //     window.mergeDeep(go, obj)
      //   })
      // } else if(PAGE.role.isPlayEditor) {
      //   GAME.objects = objectsUpdated
      //   GAME.objectsById = GAME.objects.reduce((prev, next) => {
      //     prev[next.id] = next
      //     return prev
      //   }, {})
      // }
    }

    if(PAGE.role.isPlayEditor && window.objecteditor.get().id) {
      if(window.syncObjectsToggle.checked) {
        window.objecteditor.update(GAME.objectsById[window.objecteditor.get().id])
      }
    }
  })

  // HOST CALLS THIS
  window.socket.on('onUpdateHero', (updatedHero) => {
    if(!PAGE.gameLoaded) return

    if(!PAGE.role.isHost) {
      if(!GAME.heros[updatedHero.id]) {
        GAME.heros[updatedHero.id] = updatedHero
        PHYSICS.addObject(updatedHero)
        // you need to reset the reference... really just for NON HOST PLAYER MODE ( because it loads non host )
      }
      window.mergeDeep(GAME.heros[updatedHero.id], updatedHero)
      if(PAGE.role.isPlayer && HERO.hero.id === updatedHero.id) {
        window.mergeDeep(HERO.hero, updatedHero)
      }
      // old interpolation code
      // } else if(PAGE.role.isPlayEditor) {
      //   window.mergeDeep(GAME.heros[updatedHero.id], updatedHero)
      // } else if(PAGE.role.isPlayer) {
      //   let hero = GAME.heros[updatedHero.id]
      //   if(!hero) GAME.heros[updatedHero.id] = updatedHero
      //   hero._lerpX = updatedHero.x
      //   hero._lerpY = updatedHero.y
      //   delete updatedHero.x
      //   delete updatedHero.y
      //   window.mergeDeep(hero, updatedHero)
    }

    if(PAGE.gameLoaded && PAGE.role.isPlayEditor) {
      if(window.editingHero.id === updatedHero.id) {
        if(updatedHero.jumpVelocity !== GAME.heros[updatedHero.id].jumpVelocity) {
          updatedHero.reachablePlatformHeight = window.resetReachablePlatformHeight(GAME.heros[updatedHero.id])
        }
        if(updatedHero.jumpVelocity !== GAME.heros[updatedHero.id].jumpVelocity || updatedHero.speed !== GAME.heros[updatedHero.id].speed) {
          updatedHero.reachablePlatformWidth = window.resetReachablePlatformWidth(GAME.heros[updatedHero.id])
        }

        window.editingHero = updatedHero
        if(GAME.world.syncHero) {
          window.setEditingHero(updatedHero)
        }
      }
    }
  })

  ///////////////////////////////
  ///////////////////////////////
  //shared events
  ///////////////////////////////

  // EVERYONE CALLS THIS
  window.socket.on('onAddObjects', (objectsAdded) => {
    GAME.objects.push(...objectsAdded)
    objectsAdded.forEach((object) => {
      PHYSICS.addObject(object)
      GAME.objectsById[object.id] = object
    })

    if(GAME.grid.nodes && !GAME.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      GAME.resetPaths = true
      GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
    }
  })

  // EDITOR CALLS THIS
  window.socket.on('onResetObjects', (updatedObjects) => {
    GAME.objects = GAME.objects.reduce((arr, object) => {
      if(object.removed) return arr
      PHYSICS.removeObject(object)
      return arr
    }, [])

    GAME.objectsById = GAME.objects.reduce((prev, next) => {
      prev[next.id] = next
      return prev
    }, {})

    if(!GAME.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
    }
  })

  // EDITOR CALLS THIS
  window.socket.on('onResetWorld', () => {
    GAME.world = JSON.parse(JSON.stringify(window.defaultWorld))
    if(!PAGE.role.isPlayEditor) window.camera.clearLimit()
    gridTool.updateGridObstacles()
    if(PAGE.role.isHost) GAME.resetPaths = true
    if(PAGE.role.isHost) GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
    window.handleWorldUpdate(GAME.world)
  })

  // EDITOR CALLS THIS
  window.socket.on('onUpdateWorld', (updatedWorld) => {
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
      window.handleWorldUpdate(updatedWorld)
    }
  })

  // EDITORS and PLAYERS call this
  window.socket.on('onEditHero', (updatedHero) => {
  	if(updatedHero.jumpVelocity !== GAME.heros[updatedHero.id].jumpVelocity) {
  		updatedHero.reachablePlatformHeight = window.resetReachablePlatformHeight(GAME.heros[updatedHero.id])
  	}
  	if(updatedHero.jumpVelocity !== GAME.heros[updatedHero.id].jumpVelocity || updatedHero.speed !== GAME.heros[updatedHero.id].speed) {
  		updatedHero.reachablePlatformWidth = window.resetReachablePlatformWidth(GAME.heros[updatedHero.id])
  	}

    console.log(updatedHero)
    window.mergeDeep(GAME.heros[updatedHero.id], updatedHero)

    if(PAGE.gameLoaded && PAGE.role.isPlayEditor) {
      if(window.editingHero.id === updatedHero.id) {
        window.editingHero = GAME.heros[updatedHero.id]
        if(GAME.world.syncHero) {
          window.setEditingHero(GAME.heros[updatedHero.id])
        }
      }
      if(!window.editingHero.id) {
        window.setEditorToAnyHero()
      }
    }
  })

  // CLIENT HOST OR EDITOR CALL THIS
  window.socket.on('onRemoveObject', (object) => {
    if(!GAME.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      if(PAGE.role.isHost) GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
    }

    GAME.objectsById[object.id].removed = true
  })

  // CLIENT HOST OR EDITOR CALL THIS
  window.socket.on('onRemoveHero', (hero) => {
    GAME.heros[hero.id].removed = true
  })

  // CLIENT HOST OR EDITOR CALL THIS
  window.socket.on('onDeleteObject', (object) => {
    if(PAGE.role.isPlayEditor && window.objecteditor.get().id === object.id) {
      window.objecteditor.update({})
      window.objecteditor.saved = true
      window.updateObjectEditorNotifier()
    }

    if(!GAME.world.globalTags.calculatePathCollisions) {
      gridTool.updateGridObstacles()
      if(PAGE.role.isHost) GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
    }

    let spliceIndex
    GAME.objects.forEach((obj, i) => {
      if(obj.id == object.id) {
        spliceIndex
      }
    })

    if(spliceIndex >= 0) {
      GAME.objects.splice(spliceIndex, 1)
    }

    GAME.objects = GAME.objects.filter((obj) => obj.id !== object.id)
    PHYSICS.removeObject(object)
    delete GAME.objectsById[object.id]
  })

  // EDITOR CALLS THIS
  window.socket.on('onUpdateGrid', (grid) => {
    GAME.grid = grid
    GAME.grid.nodes = gridTool.generateGridNodes(grid)
    gridTool.updateGridObstacles()
    if(PAGE.role.isHost) {
      GAME.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
    }
  })

  // EDITOR CALLS THIS
  window.socket.on('onDeleteHero', (id) => {
    if(PAGE.role.isHost) {
      PHYSICS.removeObject(GAME.heros[id])
    }
    delete GAME.heros[id]
    if(PAGE.role.isPlayEditor && window.editingHero.id == id) {
      window.setEditingHero({})
    }
  })

  window.socket.on('onCopyGame', (game) => {
    GAME.unload()
    window.loadGame(game, { resetHeros: true })
  })


  // this is switching between games
  window.socket.on('onSetGame', (game) => {
    GAME.unload()
    window.loadGame(game, { resetHeros: true })
    window.changeGame(game.id)
  })

  // this is from branch merge
  window.socket.on('onSetGameJSON', (game) => {
    GAME.unload()
    window.loadGame(game)
    window.changeGame(game.id)
  })


  // window.socket.on('onNewGame', () => {
  //   window.changeGame(null)
  //   GAME.gameState = JSON.parse(JSON.stringify(window.defaultGameState))
  // })

  window.socket.on('onGameSaved', (id) => {
    window.changeGame(id)
  })

  window.socket.on('onUpdateCustomGameFx', (customFx) => {
    if(PAGE.role.isHost) {
      try {
        window.setLiveCustomFx(customFx)
      } catch (e) {
        console.log(e)
      }
    }

    if(PAGE.role.isPlayEditor) {
      window.customFx = customFx
    }
  })

  window.socket.on('onCustomFxEvent', (event) => {
    if(PAGE.role.isHost && GAME.liveCustomGame && GAME.liveCustomGame[event]) {
      GAME.liveCustomGame[event]()
    }
  })

  window.socket.on('onAskHeroToNameObject', async (object, heroId) => {
    if(PAGE.role.isPlayer && !PAGE.role.isGhost && HERO.hero.id === heroId) {
      modals.nameObject(object)
    }

    // let ctx = document.getElementById('swal-canvas').getContext('2d')
    // ctx.fillStyle = object.color
    // ctx.fillRect(10, 10, object.width, object.height);
  })

  window.socket.on('onAskHeroToWriteChat', async (object, heroId) => {
    if(PAGE.role.isPlayer && !PAGE.role.isGhost && HERO.hero.id === heroId) {
      modals.writeDialogue(object)
    }
  })
}

export default {
  init
}
