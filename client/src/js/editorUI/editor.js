import gridUtil from '../utils/grid'
import Swal from 'sweetalert2/src/sweetalert2.js';

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

    window.addEventListener("keydown", function (e) {
      if(e.keyCode === 16) {
        EDITOR.shiftPressed = true
        EDITORUI.ref.forceUpdate()
      }
    })
    window.addEventListener("keyup", function (e) {
      if(e.keyCode === 16) {
        EDITOR.shiftPressed = false
        EDITORUI.ref.forceUpdate()
      }
    })
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
      showClass: {
        popup: 'animated fadeInDown faster'
      },
      hideClass: {
        popup: 'animated fadeOutUp faster'
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
      showClass: {
        popup: 'animated fadeInDown faster'
      },
      hideClass: {
        popup: 'animated fadeOutUp faster'
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

  saveGame() {
    console.log('previous version before save', GAME)
    let saveGame = GAME.cleanForSave(GAME)

    if(window.location.href.indexOf('localhost')) {
      console.log('saving to server', saveGame)
      window.socket.emit('saveGame', {...saveGame,
            compendium: window.compendium })
    } else {
      PAGE.downloadObjectAsJson(saveGame, GAME.id)
    }
  }

  transformWorldTo(worldName) {
    const { clearProperty, setGameBoundaryBehavior, setGameBoundaryTo, setCameraLockTo, setHeroZoomTo, setGridTo, setWorldAndHeroSpawnPointsTo, respawnAllHeros } = EDITOR
    if(worldName === 'Mario') {
      if(EDITOR.shiftPressed) {
        GAME.grid.width = 200
        GAME.grid.height = 80
        window.socket.emit('updateGrid', GAME.grid)
        window.socket.emit('resetObjects')
        setWorldAndHeroSpawnPointsTo('gridCenter')
        respawnAllHeros()
      }

      setGameBoundaryBehavior('default')
      setGameBoundaryTo('grid')
      setCameraLockTo('gridMinusOne')
      setHeroZoomTo('default')
      sendWorldUpdate({ tags: { ...window.defaultWorld.tags, allMovingObjectsHaveGravityY: true, gameBoundaryBottomDestroyHero: true }})
    }
    if(worldName === 'Zelda') {
      if(EDITOR.shiftPressed) {
        GAME.grid.width = 200
        GAME.grid.height = 200
        window.socket.emit('updateGrid', GAME.grid)
        window.socket.emit('resetObjects')
        setWorldAndHeroSpawnPointsTo('gridCenter')
        respawnAllHeros()
      }

      setGameBoundaryBehavior('boundaryAll')
      setGameBoundaryTo('grid')
      setCameraLockTo('grid')
      setHeroZoomTo('default')
      sendWorldUpdate({ tags: { ...window.defaultWorld.tags }})
    }
    if(worldName === 'Pacman') {
      if(EDITOR.shiftPressed) {
        GAME.grid.width = 40
        GAME.grid.height = 20
        window.socket.emit('updateGrid', GAME.grid)
        window.socket.emit('resetObjects')
        setWorldAndHeroSpawnPointsTo('gridCenter')
        respawnAllHeros()
      }

      setGameBoundaryBehavior('pacmanFlip')
      setGameBoundaryTo('grid')
      setCameraLockTo('grid')
      setHeroZoomTo('grid')
      sendWorldUpdate({ tags: { ...window.defaultWorld.tags }})
    }
    if(worldName === 'Purgatory') {
      if(EDITOR.shiftPressed) {
        setGridTo('default')
        window.socket.emit('resetObjects')
        setWorldAndHeroSpawnPointsTo('gridCenter')
        respawnAllHeros()
      }

      setGameBoundaryBehavior('purgatory')
      setGameBoundaryTo('grid')
      clearProperty('lockCamera')
      setHeroZoomTo('default')
      sendWorldUpdate({ tags: { ...window.defaultWorld.tags }})

    }
    if(worldName === 'Smash') {
      if(EDITOR.shiftPressed) {
        setGridTo('default')
        window.socket.emit('resetObjects')
        setWorldAndHeroSpawnPointsTo('gridCenter')
        respawnAllHeros()
      }
      setGameBoundaryBehavior('default')
      setGameBoundaryTo('grid')
      setCameraLockTo('grid')
      setCameraLockTo('smaller')
      setCameraLockTo('smaller')
      setCameraLockTo('smaller')
      setCameraLockTo('smaller')
      setCameraLockTo('smaller')
      setCameraLockTo('smaller')
      setCameraLockTo('smaller')
      setCameraLockTo('smaller')
      setCameraLockTo('smaller')
      setCameraLockTo('smaller')
      setCameraLockTo('smaller')
      setCameraLockTo('smaller')
      setCameraLockTo('smaller')
      setCameraLockTo('smaller')
      setCameraLockTo('smaller')
      setHeroZoomTo('default')
      sendWorldUpdate({ tags: { ...window.defaultWorld.tags, gameBoundaryDestroyHero: true }})
    }
    if(worldName === 'Default') {
      if(EDITOR.shiftPressed) {
        setGridTo('default')
        window.socket.emit('resetObjects')
        setWorldAndHeroSpawnPointsTo('gridCenter')
        respawnAllHeros()
      }
      setHeroZoomTo('default')
      clearProperty('lockCamera')
      clearProperty('gameBoundaries')
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
    if(propName === 'larger') {
      let game = GAME.world.gameBoundaries
      sendWorldUpdate( { gameBoundaries: { ...game, width: (game.width + (GAME.grid.nodeSize * 2)), height: (game.height + (GAME.grid.nodeSize)), x:  game.x -  GAME.grid.nodeSize, y: game.y  - (GAME.grid.nodeSize/2) } })
    }
    if(propName === 'smaller') {
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

    if(propName === 'gameBoundaries' && GAME.world.gameBoundaries && typeof GAME.world.gameBoundaries.x == 'number') {
      const value = GAME.world.gameBoundaries
      const { x, y, width, height} = value
      const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      sendWorldUpdate( { lockCamera })
    }

    if(propName === 'larger') {
      let lockCamera = GAME.world.lockCamera
      lockCamera.x -= GAME.grid.nodeSize
      lockCamera.y -= GAME.grid.nodeSize/2
      lockCamera.width += (GAME.grid.nodeSize * 2)
      lockCamera.height += (GAME.grid.nodeSize)
      const value = lockCamera
      lockCamera = { ...lockCamera, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      sendWorldUpdate( { lockCamera })
    }
    if(propName === 'smaller') {
      let lockCamera = GAME.world.lockCamera
      lockCamera.x += GAME.grid.nodeSize
      lockCamera.y += GAME.grid.nodeSize/2
      lockCamera.width -= (GAME.grid.nodeSize * 2)
      lockCamera.height -= (GAME.grid.nodeSize)
      const value = lockCamera
      lockCamera = { ...lockCamera, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      sendWorldUpdate( { lockCamera })
    }
  }

  setHeroZoomTo(propName) {
    if(propName === 'gameBoundaries' && GAME.world.gameBoundaries && typeof GAME.world.gameBoundaries.x == 'number') {
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

    if(propName === 'larger') {
      const hero = GAME.heros[HERO.id]
      sendHeroUpdate({ id: hero.id, zoomMultiplier: hero.zoomMultiplier + EDITOR.zoomDelta })
    }
    if(propName === 'smaller') {
      const hero = GAME.heros[HERO.id]
      sendHeroUpdate({ id: hero.id, zoomMultiplier: hero.zoomMultiplier - EDITOR.zoomDelta })
    }

    if(propName === 'default') {
      const hero = GAME.heros[HERO.id]
      sendHeroUpdate({ id: hero.id, zoomMultiplier: 1.875 })
    }

    // if(propName === 'larger') {
    //   GAME.heroList.forEach((hero) => {
    //     sendHeroUpdate({ id: hero.id, zoomMultiplier: hero.zoomMultiplier + EDITOR.zoomDelta })
    //   })
    // }
    // if(propName === 'smaller') {
    //   GAME.heroList.forEach((hero) => {
    //     sendHeroUpdate({ id: hero.id, zoomMultiplier: hero.zoomMultiplier - EDITOR.zoomDelta })
    //   })
    // }
  }

  setWorldAndHeroSpawnPointsTo(propName) {
    if(propName === 'gridCenter') {
      const x = GAME.grid.startX + ((GAME.grid.width * GAME.grid.nodeSize)/2)
      const y = GAME.grid.startY + ((GAME.grid.height * GAME.grid.nodeSize)/2)
      sendWorldUpdate({spawnPointX: x, spawnPointY: y})
      sendHeroUpdate({spawnPointX: x, spawnPointY: y})
    }
  }

  setGridTo(propName) {
    if(propName === 'larger') {
      GAME.grid.width+=4
      GAME.grid.startX-=GAME.grid.nodeSize * 2
      GAME.grid.height+=2
      GAME.grid.startY-=GAME.grid.nodeSize
    }
    if(propName === 'smaller') {
      GAME.grid.width-=4
      GAME.grid.startX+=GAME.grid.nodeSize * 1
      GAME.grid.height-=2
      GAME.grid.startY+=GAME.grid.nodeSize
    }
    if(propName === 'default') {
      GAME.grid.width = window.defaultGrid.width
      GAME.grid.height = window.defaultGrid.height
    }
    window.socket.emit('updateGrid', GAME.grid)
  }

  respawnAllHeros() {
    GAME.heroList.forEach((hero) => {
      window.socket.emit('respawnHero', hero)
    })
  }
}

function expandGrid(newObject) {
  if(newObject.x + newObject.width > (GAME.grid.nodeSize * GAME.grid.width) + GAME.grid.startX) {
    const diff = newObject.x + newObject.width - ((GAME.grid.nodeSize * GAME.grid.width) + GAME.grid.startX)
    GAME.grid.width += Math.ceil(diff/GAME.grid.nodeSize)
  }
  if(newObject.y + newObject.height > (GAME.grid.nodeSize * GAME.grid.height) + GAME.grid.startY) {
    const diff = newObject.y + newObject.height - ((GAME.grid.nodeSize * GAME.grid.height) + GAME.grid.startY)
    GAME.grid.height += Math.ceil(diff/GAME.grid.nodeSize)
  }
  if(newObject.x < GAME.grid.startX) {
    const diff = GAME.grid.startX - newObject.x
    GAME.grid.width += Math.ceil(diff/GAME.grid.nodeSize)
    GAME.grid.startX -= diff
  }
  if(newObject.y < GAME.grid.startY) {
    const diff = GAME.grid.startY - newObject.y
    GAME.grid.height += Math.ceil(diff/GAME.grid.nodeSize)
    GAME.grid.startY -= diff
  }
}

function getHeroCameraValue() {
  const hero = GAME.heros[HERO.id]
  const value = {
    width: HERO.cameraWidth * hero.zoomMultiplier,
    height: HERO.cameraHeight * hero.zoomMultiplier,
  }
  value.x = hero.x - value.width/2
  value.y = hero.y - value.height/2

  gridUtil.snapObjectToGrid(value)
  value.width = HERO.cameraWidth * hero.zoomMultiplier
  value.height = HERO.cameraHeight * hero.zoomMultiplier
  value.centerX = value.x + value.width/2,
  value.centerY = value.y + value.height/2,
  value.limitX = Math.abs(value.width/2)
  value.limitY = Math.abs(value.height/2)

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

let worldUpdate
let flushWorldUpdateTimer
function sendWorldUpdate(update) {
  window.mergeDeep(GAME.world, update)
  if(worldUpdate) {
    Object.assign(worldUpdate, update)
  } else {
    worldUpdate = update
  }

  if(flushWorldUpdateTimer) clearTimeout(flushWorldUpdateTimer)
  flushWorldUpdateTimer = setTimeout(() => {
    window.socket.emit('updateWorld', worldUpdate)
    worldUpdate = null
  }, 100)
}

window.EDITOR = new Editor
