import gridUtil from '../utils/grid'

class Editor {
  constructor() {
    this.preferences = {
      zoomMultiplier: 0
    }
    this.zoomDelta = .1250
  }

  onPageLoaded() {
    const storedPreferences = localStorage.getItem('editorPreferences')

    if(storedPreferences && storedPreferences != 'undefined' && storedPreferences != 'null') {
      EDITOR.preferences = JSON.parse(storedPreferences)
    }
  }

  onUpdate() {
    localStorage.setItem('editorPreferences', JSON.stringify(EDITOR.preferences))
  }

  async loadGame() {
    const { value: loadGameId } = await Swal.fire({
      title: 'Load Game',
      text: "Enter id of game to load",
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Load Game',
    })
    if(loadGameId) {
      window.socket.on('onLoadGame', (game) => {
        choseGameCallback(game)
      })
      window.socket.emit('setAndLoadCurrentGame', loadGameId)
    }
  }

  async newGame() {
    const { value: newGameId } = await Swal.fire({
      title: 'Create Game',
      text: "Enter id you want for new game",
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Create',
    })
    if(newGameId) {
      let game = {
        id: newGameId,
        world: JSON.parse(JSON.stringify(window.defaultWorld)),
        // defaultHero: JSON.parse(JSON.stringify(window.defaultHero)),
        objects: [],
        grid: JSON.parse(JSON.stringify(window.defaultGrid)),
      }
      window.socket.emit('saveGame', game)
      choseGameCallback(game)
    }
  }

  clearProperty(propName) {
    if(propName === 'gameBoundaries') {
      sendWorldUpdate( { gameBoundaries: null })
    }
    if(propName === 'lockCamera') {
      sendWorldUpdate( { lockCamera: null })
    }
  }

  setGameBoundaryBehavior(behavior) {
    // 'default'
    //  'boundaryAll'
    //  'pacmanFlip'
    //  'purgatory'
    sendWorldUpdate( { gameBoundaries: { ...GAME.world.gameBoundaries, behavior } })
  }

  setGameBoundaryTo(propName) {
    if(propName === 'lockCamera' && GAME.world.lockCamera) {
      sendWorldUpdate( { gameBoundaries: {...GAME.world.lockCamera, behavior: GAME.world.gameBoundaries ? GAME.world.gameBoundaries.behavior : 'default' } })
    }
    if(propName === 'heroCamera') {
      const value = getHeroCameraValue()
      sendWorldUpdate( { gameBoundaries: {...value, behavior: GAME.world.gameBoundaries ? GAME.world.gameBoundaries.behavior : 'default' }})
    }
    if(propName === 'grid') {
      const value = getGridValue()
      sendWorldUpdate( { gameBoundaries: {...value, behavior: GAME.world.gameBoundaries ? GAME.world.gameBoundaries.behavior : 'default' }})
    }
    if(propName === 'gridMinusOne') {
      const value = getGridMinusOneValue()
      sendWorldUpdate( { gameBoundaries: {...value, behavior: GAME.world.gameBoundaries ? GAME.world.gameBoundaries.behavior : 'default' }})
    }
    if(propName === 'zoomOut') {
      let game = GAME.world.gameBoundaries
      sendWorldUpdate( { gameBoundaries: { ...game, width: (game.width + (GAME.grid.nodeSize * 2)), height: (game.height + (GAME.grid.nodeSize)), x:  game.x -  GAME.grid.nodeSize, y: game.y  - (GAME.grid.nodeSize/2) } })
    }
    if(propName === 'zoomIn') {
      let game = GAME.world.gameBoundaries
      sendWorldUpdate( { gameBoundaries: { ...game, width: (game.width - (GAME.grid.nodeSize * 2)), height: (game.height - (GAME.grid.nodeSize)), x:  game.x +  GAME.grid.nodeSize, y: game.y  + (GAME.grid.nodeSize/2) } })
    }
  }

  setCameraLockTo(propName) {
    if(propName === 'heroCamera') {
      const value = getHeroCameraValue()
      sendWorldUpdate( { lockCamera: value })
    }
    if(propName === 'grid') {
      const value = getGridValue()
      const { x, y, width, height} = value
      const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      sendWorldUpdate( { lockCamera })
    }
    if(propName === 'gridMinusOne') {
      const value = getGridMinusOneValue()
      const { x, y, width, height} = value
      const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      sendWorldUpdate( { lockCamera })
    }

    if(propName === 'gameBoundaries' && GAME.world.gameBoundaries && GAME.world.gameBoundaries.x >= 0) {
      const value = GAME.world.gameBoundaries
      const { x, y, width, height} = value
      const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      sendWorldUpdate( { lockCamera })
    }

    if(propName === 'zoomOut') {
      let lockCamera = GAME.world.lockCamera
      lockCamera.x -= GAME.grid.nodeSize
      lockCamera.y -= GAME.grid.nodeSize/2
      lockCamera.width += (GAME.grid.nodeSize * 2)
      lockCamera.height += (GAME.grid.nodeSize)
      const value = lockCamera
      lockCamera = { ...lockCamera, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      sendWorldUpdate( { lockCamera })
    }
    if(propName === 'zoomIn') {
      let lockCamera = GAME.world.lockCamera
      lockCamera.x -= GAME.grid.nodeSize
      lockCamera.y -= GAME.grid.nodeSize/2
      lockCamera.width += (GAME.grid.nodeSize * 2)
      lockCamera.height += (GAME.grid.nodeSize)
      const value = lockCamera
      lockCamera = { ...lockCamera, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      sendWorldUpdate( { lockCamera })
    }
  }

  setHeroZoomTo(propName) {
    if(propName === 'gameBoundaries' && GAME.world.gameBoundaries && GAME.world.gameBoundaries.x >= 0) {
      let zoomMultiplier = GAME.world.gameBoundaries.width/HERO.cameraWidth
      sendHeroUpdate({ zoomMultiplier })
    }
    if(propName === 'lockCamera' && GAME.world.lockCamera) {
      let zoomMultiplier = GAME.world.lockCamera.width/HERO.cameraWidth
      sendHeroUpdate({ zoomMultiplier })
    }
    if(propName === 'grid') {
      let zoomMultiplier = (GAME.grid.width * GAME.grid.nodeSize)/HERO.cameraWidth
      sendHeroUpdate({ zoomMultiplier })
    }
    if(propName === 'gridMinusOne') {
      let zoomMultiplier = ((GAME.grid.width-2) * GAME.grid.nodeSize)/HERO.cameraWidth
      sendHeroUpdate({ zoomMultiplier })
    }

    if(propName === 'zoomOut') {
      const hero = GAME.heros[HERO.id]
      sendHeroUpdate({ id: hero.id, zoomMultiplier: hero.zoomMultiplier + EDITOR.zoomDelta })
    }
    if(propName === 'zoomIn') {
      const hero = GAME.heros[HERO.id]
      sendHeroUpdate({ id: hero.id, zoomMultiplier: hero.zoomMultiplier - EDITOR.zoomDelta })
    }

    // if(propName === 'zoomOut') {
    //   GAME.heroList.forEach((hero) => {
    //     sendHeroUpdate({ id: hero.id, zoomMultiplier: hero.zoomMultiplier + EDITOR.zoomDelta })
    //   })
    // }
    // if(propName === 'zoomIn') {
    //   GAME.heroList.forEach((hero) => {
    //     sendHeroUpdate({ id: hero.id, zoomMultiplier: hero.zoomMultiplier - EDITOR.zoomDelta })
    //   })
    // }
  }
}

function getHeroCameraValue() {
  const value = {
    width: HERO.cameraWidth * hero.zoomMultiplier,
    height: HERO.cameraHeight * hero.zoomMultiplier,
    centerX: hero.x + hero.width/2,
    centerY: hero.y + hero.height/2,
  }
  value.x = value.centerX - value.width/2
  value.y = value.centerY - value.height/2
  value.limitX = Math.abs(value.width/2)
  value.limitY = Math.abs(value.height/2)
  gridUtil.snapObjectToGrid(value)
  value.width = HERO.cameraWidth * hero.zoomMultiplier
  value.height = HERO.cameraHeight * hero.zoomMultiplier

  return value;
}

function getGridValue() {
  const value = {
    width: GAME.grid.width * GAME.grid.nodeSize,
    height: GAME.grid.height * GAME.grid.nodeSize,
    x: GAME.grid.startX,
    y: GAME.grid.startY
  }

  return value
}

function getGridMinusOneValue() {
  const value = {
    width: (GAME.grid.width - 2) * GAME.grid.nodeSize,
    height: (GAME.grid.height - 2) * GAME.grid.nodeSize,
    x: GAME.grid.startX + GAME.grid.nodeSize,
    y: GAME.grid.startY + GAME.grid.nodeSize
  }

  return value
}

function choseGameCallback(game) {
  if(GAME.id) {
    GAME.unload()
  }
  GAME.loadAndJoin(game)
  ARCADE.changeGame(game.id)
}

function sendHeroUpdate(update) {
  window.socket.emit('editHero', { id: HERO.id, ...update })
}

function sendWorldUpdate(update) {
  window.socket.emit('updateWorld', update)
}

window.EDITOR = new Editor
