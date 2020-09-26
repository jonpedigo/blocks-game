import gridUtil from '../utils/grid'
import Swal from 'sweetalert2/src/sweetalert2.js';

class Editor {
  constructor() {
    this.preferences = {
      zoomMultiplier: 0,
      creatorColorSelected: window.defaultObjectColor
    }
    this.zoomDelta = .1250

    const storedPreferences = localStorage.getItem('editorPreferences')
    if(PAGE.role.isAdmin && storedPreferences && storedPreferences != 'undefined' && storedPreferences != 'null') {
      this.preferences = JSON.parse(storedPreferences)
    }
  }

  onPlayerIdentified() {
    window.addEventListener("keydown", function (e) {
      if(e.keyCode === 16) {
        EDITOR.shiftPressed = true
        EDITORUI.ref.forceUpdate()
        PLAYERUI.ref.forceUpdate()
        CREATOR.ref._creatorRef.current.forceUpdate()
      }

      if(EDITOR.shiftPressed && e.keyCode == 82) {
        PAGE.resetStorage()
      }
    })
    window.addEventListener("keyup", function (e) {
      if(e.keyCode === 16) {
        EDITOR.shiftPressed = false
        CREATOR.ref._creatorRef.current.forceUpdate()
        EDITORUI.ref.forceUpdate()
        PLAYERUI.ref.forceUpdate()
      }
    })
  }

  onUpdate() {
    if(PAGE.role.isAdmin) {
      localStorage.setItem('editorPreferences', JSON.stringify(EDITOR.preferences))
    }
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
      choseGameCallback(loadGameId)
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
      choseGameCallback(game.id)
    }
  }

  saveGame() {
    console.log('previous version before save', GAME)
    let saveGame = GAME.cleanForSave(GAME)
    saveGame = {...saveGame,
          compendium: window.compendium }

    if(window.location.href.indexOf('localhost')) {
      console.log('saving to server', saveGame)
      window.socket.emit('saveGame', {...saveGame,
            compendium: window.compendium })
    } else {
      console.log('saving to local storage')
      const saveString = JSON.stringify(saveGame)
      // get megabytes
      const size = window.byteLength(saveString)/1000000
      if(size > 3) {
        // alert('save too big for browser storage, download as json instead')
      } else {
        localStorage.setItem('saveEditingGame', saveString)
      }
      console.log('downloading', saveGame)
      PAGE.downloadObjectAsJson(saveGame, GAME.id)
    }
  }

  transformWorldTo(worldName) {
    const { clearProperty, setGameBoundaryBehavior, setGameBoundaryTo, setCameraLockTo, setHerosZoomTo, setGridTo, setWorldAndHeroSpawnPointsTo, respawnAllHeros } = EDITOR
    if(worldName === 'Mario') {
      if(EDITOR.shiftPressed) {
        GAME.grid.width = 200
        GAME.grid.height = 100
        window.socket.emit('updateGrid', GAME.grid)
        window.socket.emit('resetObjects')
        setWorldAndHeroSpawnPointsTo('gridCenter')
        setTimeout(() => {
          respawnAllHeros()
        })
        setHerosZoomTo('default')
      }

      setGameBoundaryBehavior('default')
      setGameBoundaryTo('grid')
      setCameraLockTo('gridMinusOne')
      sendWorldUpdate({ tags: { ...window.defaultWorld.tags, allMovingObjectsHaveGravityY: true, gameBoundaryBottomDestroyHero: true }})
    }

    if(worldName === 'Zelda') {
      if(EDITOR.shiftPressed) {
        GAME.grid.width = 200
        GAME.grid.height = 200
        window.socket.emit('updateGrid', GAME.grid)
        window.socket.emit('resetObjects')
        setWorldAndHeroSpawnPointsTo('gridCenter')
        setTimeout(() => {
          respawnAllHeros()
        })
      }

      setGameBoundaryBehavior('boundaryAll')
      setGameBoundaryTo('gridMinusOne')
      setCameraLockTo('gridMinusOne')
      setHerosZoomTo('default')
      sendWorldUpdate({ tags: { ...window.defaultWorld.tags }})
    }

    if(worldName === 'Pacman') {
      if(EDITOR.shiftPressed) {
        GAME.grid.width = 44
        GAME.grid.height = 22
        window.socket.emit('updateGrid', GAME.grid)
        window.socket.emit('resetObjects')
        setWorldAndHeroSpawnPointsTo('gridCenter')
        setTimeout(() => {
          respawnAllHeros()
        })
      }

      setGameBoundaryBehavior('pacmanFlip')
      setGameBoundaryTo('gridMinusOne')
      setCameraLockTo('gridMinusOne')
      setHerosZoomTo('gridMinusOne')

      sendWorldUpdate({ tags: { ...window.defaultWorld.tags }})
    }

    if(worldName === 'Purgatory') {
      if(EDITOR.shiftPressed) {
        setGridTo('default')
        window.socket.emit('resetObjects')
        setWorldAndHeroSpawnPointsTo('gridCenter')
        setTimeout(() => {
          respawnAllHeros()
        })
      }

      setGameBoundaryBehavior('purgatory')
      setGameBoundaryTo('grid')
      clearProperty('lockCamera')
      setHerosZoomTo('default')
      setHerosZoomTo('smaller')
      setHerosZoomTo('smaller')
      setHerosZoomTo('smaller')
      setHerosZoomTo('smaller')
      sendWorldUpdate({ tags: { ...window.defaultWorld.tags }})
    }

    if(worldName === 'Smash') {
      if(EDITOR.shiftPressed) {
        setGridTo('default')
        window.socket.emit('resetObjects')
        setWorldAndHeroSpawnPointsTo('gridCenter')
        setTimeout(() => {
          respawnAllHeros()
        })
      }
      setGameBoundaryBehavior('default')
      setGameBoundaryTo('grid')
      setCameraLockTo('gridPadding')
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
      setHerosZoomTo('default')
      sendWorldUpdate({ tags: { ...window.defaultWorld.tags, gameBoundaryDestroyHero: true }})
    }
    if(worldName === 'Default') {
      if(EDITOR.shiftPressed) {
        setGridTo('default')
        window.socket.emit('resetObjects')
        setWorldAndHeroSpawnPointsTo('gridCenter')
        setTimeout(() => {
          respawnAllHeros()
        })
        sendWorldUpdate({...window.defaultWorld})
      }
      sendWorldUpdate({ tags: { ...window.defaultWorld.tags}})
      setHerosZoomTo('default')
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
    if(propName === 'gridPadding') {
      const value = getGridPaddingValue()
      sendWorldUpdate( { gameBoundaries: {...value, behavior: GAME.world.gameBoundaries ? GAME.world.gameBoundaries.behavior : 'default' }})
    }
    if(propName === 'gridPaddingMinusOne') {
      const value = getGridPaddingValue(true)
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
    if(propName === 'gridPadding') {
      const value = getGridPaddingValue()
      const { x, y, width, height} = value
      const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
      sendWorldUpdate( { lockCamera })
    }
    if(propName === 'gridPaddingMinusOne') {
      const value = getGridPaddingValue(true)
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
      let zoomMultiplier = ((GAME.grid.width-4) * GAME.grid.nodeSize)/HERO.cameraWidth
      sendHeroUpdate({ zoomMultiplier })
    }
    if(propName === 'gridPadding') {
      const padding = GAME.world.chunkGamePadding
      let zoomMultiplier = ((GAME.grid.width - padding) * GAME.grid.nodeSize)/HERO.cameraWidth
      sendHeroUpdate({ zoomMultiplier })
    }
    if(propName === 'gridPaddingMinusOne') {
      const padding = GAME.world.chunkGamePadding - 4
      let zoomMultiplier = ((GAME.grid.width-padding) * GAME.grid.nodeSize)/HERO.cameraWidth
      sendHeroUpdate({ zoomMultiplier })
    }

    if(propName === 'larger') {
      const hero = GAME.heros[HERO.editingId || HERO.id]
      sendHeroUpdate({ zoomMultiplier: hero.zoomMultiplier + EDITOR.zoomDelta })
    }
    if(propName === 'smaller') {
      const hero = GAME.heros[HERO.editingId || HERO.id]
      sendHeroUpdate({ zoomMultiplier: hero.zoomMultiplier - EDITOR.zoomDelta })
    }

    if(propName === 'default') {
      const hero = GAME.heros[HERO.editingId || HERO.id]
      sendHeroUpdate({ zoomMultiplier: 1.875 })
    }
  }

  setHerosZoomTo(propName) {
    if(propName === 'gameBoundaries' && GAME.world.gameBoundaries && typeof GAME.world.gameBoundaries.x == 'number') {
      let zoomMultiplier = GAME.world.gameBoundaries.width/HERO.cameraWidth
      sendHerosUpdate({ zoomMultiplier })
    }
    if(propName === 'lockCamera' && GAME.world.lockCamera) {
      let zoomMultiplier = GAME.world.lockCamera.width/HERO.cameraWidth
      sendHerosUpdate({ zoomMultiplier })
    }
    if(propName === 'grid') {
      let zoomMultiplier = (GAME.grid.width * GAME.grid.nodeSize)/HERO.cameraWidth
      sendHerosUpdate({ zoomMultiplier })
    }
    if(propName === 'gridMinusOne') {
      let zoomMultiplier = ((GAME.grid.width-4) * GAME.grid.nodeSize)/HERO.cameraWidth
      sendHerosUpdate({ zoomMultiplier })
    }
    if(propName === 'gridPadding') {
      const padding = GAME.world.chunkGamePadding
      let zoomMultiplier = ((GAME.grid.width - padding) * GAME.grid.nodeSize)/HERO.cameraWidth
      sendHerosUpdate({ zoomMultiplier })
    }
    if(propName === 'gridPaddingMinusOne') {
      const padding = GAME.world.chunkGamePadding - 4
      let zoomMultiplier = ((GAME.grid.width-padding) * GAME.grid.nodeSize)/HERO.cameraWidth
      sendHerosUpdate({ zoomMultiplier })
    }

    if(propName === 'larger') {
      const hero = GAME.heros[HERO.editingId || HERO.id]
      hero.zoomMultiplier += EDITOR.zoomDelta
      sendHerosUpdate({ zoomMultiplier: hero.zoomMultiplier })
    }
    if(propName === 'smaller') {
      const hero = GAME.heros[HERO.editingId || HERO.id]
      hero.zoomMultiplier -= EDITOR.zoomDelta
      sendHerosUpdate({ zoomMultiplier: hero.zoomMultiplier })
    }

    if(propName === 'default') {
      const hero = GAME.heros[HERO.editingId || HERO.id]
      hero.zoomMultiplier = 1.875
      sendHerosUpdate({ zoomMultiplier: 1.875 })
    }
  }

  setWorldAndHeroSpawnPointsTo(propName) {
    if(propName === 'gridCenter') {
      const x = GAME.grid.startX + ((GAME.grid.width * GAME.grid.nodeSize)/2)
      const y = GAME.grid.startY + ((GAME.grid.height * GAME.grid.nodeSize)/2)
      sendWorldUpdate({spawnPointX: x, spawnPointY: y})
      // sendHerosUpdate({spawnPointX: x, spawnPointY: y})
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
      const padding = GAME.world.chunkGamePadding
      GAME.grid.width = window.defaultGrid.width + (padding * 2)
      GAME.grid.height = window.defaultGrid.height + padding
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
  const hero = GAME.heros[HERO.editingId || HERO.id]
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
    width: (GAME.grid.width - 4) * GAME.grid.nodeSize,
    height: (GAME.grid.height - 2) * GAME.grid.nodeSize,
    x: GAME.grid.startX + (GAME.grid.nodeSize * 2),
    y: GAME.grid.startY + GAME.grid.nodeSize
  }

  return value
}

function getGridPaddingValue(minusOne = false) {
  let padding = GAME.world.chunkGamePadding
  if(minusOne) padding++

  const value = {
    width: (GAME.grid.width - (padding * 2)) * GAME.grid.nodeSize,
    height: (GAME.grid.height - (padding)) * GAME.grid.nodeSize,
    x: GAME.grid.startX + (GAME.grid.nodeSize * padding),
    y: GAME.grid.startY + (GAME.grid.nodeSize * (padding/2))
  }

  return value
}


function choseGameCallback(gameId) {
  window.socket.emit('setGame', gameId)
}

function sendHeroUpdate(update) {
  window.socket.emit('editHero', { id: HERO.editingId || HERO.id, ...update })
}

function sendHerosUpdate(update) {
  GAME.heroList.forEach(({id}) => {
    window.socket.emit('editHero', { id, ...update })
  })
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
