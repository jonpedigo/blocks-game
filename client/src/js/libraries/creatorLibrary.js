import gridUtil from '../utils/grid.js'

function constructEditorOnSelect(objectId, tags) {
  if(GAME.objectsById[objectId]) {
    MAPEDITOR.openConstructEditor(GAME.objectsById[objectId], EDITOR.preferences.creatorColorSelected, true)
  } else {
    const globalConstructStationaryObstacle = {reserved: true, x: 0, y: 0, width: GAME.grid.width, height: GAME.grid.height, tags, constructParts: [], id: objectId}
    OBJECTS.create(globalConstructStationaryObstacle)
    MAPEDITOR.openConstructEditor(globalConstructStationaryObstacle, EDITOR.preferences.creatorColorSelected, true)
  }
  const removeListener = window.local.on('onConstructEditorClose', ({constructParts, x, y, width, height}) => {
    setTimeout(() => {
      this.setState({
        creatorObjectSelected: {}
      })
    }, 200)
    removeListener()
  })
}

function toggleMod(modId) {
  let objectId = null
  return {
    onShiftClick: () => {
      const json = window.modLibrary[modId].effectJSON
      window.socket.emit('editHero', { id: HERO.id, ...json})
    },
    onToggleOn: () => {
      const libraryMod = window.modLibrary[modId]
      const mod = {
        ownerId: objectId || HERO.id,
        manualRevertId: modId,
        ...libraryMod
      }
      window.socket.emit('startMod', mod)
      window.socket.emit('resetPhysicsProperties', objectId || HERO.id)
    },
    onToggleOff: () => {
      window.socket.emit('endMod', modId)
      window.socket.emit('resetPhysicsProperties', objectId || HERO.id)
    }
  }
}

function toggleSubObject(subObjectId, modId) {
  let objectId = null
  return {
    onToggleOn: () => {
      const so = _.cloneDeep(window.subObjectLibrary[subObjectId])
      window.socket.emit('addSubObject', GAME.heros[HERO.id], so, subObjectId, { equipAfterCreated: !!so.actionButtonBehavior })
    },
    onToggleOff: () => {
      window.socket.emit('deleteSubObject', GAME.heros[HERO.id], subObjectId)
    }
  }
}

function onGameLoaded() {
  window.creatorLibrary = {
    selectColor: {
      specialAction: 'selectColor',
    },
    drawStructure: {
      label: 'Structure',
      columnName: 'Draw',
      onSelect: function() {
        constructEditorOnSelect.call(this, 'globalConstructStationaryObstacle', { obstacle: true,})
      }
    },
    drawBackground: {
      label: 'Background',
      columnName: 'Draw',
      onSelect: function() {
        constructEditorOnSelect.call(this, 'globalConstructStationaryBackground', { background: true, notInCollisions: true })
      }
    },
    drawForeground: {
      label: 'Foreground',
      columnName: 'Draw',
      onSelect: function() {
        constructEditorOnSelect.call(this, 'globalConstructStationaryForeground', { foreground: true, notInCollisions: true })
      }
    },
    standingNPC: {
      label: 'Standing',
      columnName: 'NPCs',
      JSON: window.objectLibrary.standingNPC,
    },
    wanderingNPC: {
      label: 'Wandering',
      columnName: 'NPCs',
      JSON: window.objectLibrary.wanderingNPC,
    },
    light: {
      label: 'Medium  Light',
      columnName: 'Lights',
      JSON: window.objectLibrary.light,
    },
    fire: {
      label: 'Fire',
      columnName: 'Lights',
      JSON: window.objectLibrary.fire,
    },
    spawnZone: {
      label: 'Spawn Zone',
      columnName: 'Zones',
      JSON: window.objectLibrary.spawnZone,
      // onCreateObject: (object) => {
      //   window.socket.emit('addSubObject', object, { tags: { potential: true } }, 'spawner')
      // },
    },
    resourceZone: {
      label: 'Resource Zone',
      columnName: 'Zones',
      JSON: window.objectLibrary.resourceZone
    },
    resource: {
      label: 'Resource',
      columnName: 'Items',
      JSON: window.objectLibrary.resource
    },
    chest: {
      label: 'Chest',
      columnName: 'Items',
      JSON: window.objectLibrary.chest,
    },
    homing: {
      label: 'Homing',
      columnName: 'Monsters',
      JSON: window.objectLibrary.homing,
    },
    spin: {
      label: 'Spin',
      columnName: 'Hero',
      toggleId: 'heroSpin',
      ...toggleMod('spin')
    },
    mario: {
      label: 'Mario',
      columnName: 'Hero',
      columnExclusiveToggle: true,
      toggleId: 'mario',
      ...toggleMod('mario')
    },
    kirby: {
      label: 'Kirby',
      columnName: 'Hero',
      columnExclusiveToggle: true,
      toggleId: 'kirby',
      ...toggleMod('kirby')
    },
    zelda: {
      label: 'Zelda',
      columnName: 'Hero',
      columnExclusiveToggle: true,
      toggleId: 'zelda',
      ...toggleMod('zelda')
    },
    ufo: {
      label: 'UFO',
      columnName: 'Hero',
      columnExclusiveToggle: true,
      toggleId: 'ufo',
      ...toggleMod('ufo')
    },
    asteroids: {
      label: 'Asteroids',
      columnName: 'Hero',
      columnExclusiveToggle: true,
      toggleId: 'asteroids',
      ...toggleMod('asteroids')
    },
    car: {
      label: 'Car',
      columnName: 'Hero',
      columnExclusiveToggle: true,
      toggleId: 'car',
      ...toggleMod('car')
    },
    snake: {
      label: 'Snake',
      columnName: 'Hero',
      columnExclusiveToggle: true,
      toggleId: 'snake',
      ...toggleMod('snake')
    },
    spear: {
      label: 'Spear',
      columnName: 'Equip',
      toggleId: 'spear',
      ...toggleSubObject('spear')
    },
    gun: {
      label: 'Gun',
      columnName: 'Equip',
      toggleId: 'gun',
      ...toggleSubObject('gun')
    },
    zeldaPowerBlock: {
      label: 'Zelda',
      columnName: 'Blocks',
      JSON: window.objectLibrary.zeldaPowerBlock,
    },
    marioPowerBlock: {
      label: 'Mario',
      columnName: 'Blocks',
      JSON: window.objectLibrary.marioPowerBlock,
    },
    asteroidsPowerBlock: {
      label: 'Asteroids',
      columnName: 'Blocks',
      JSON: window.objectLibrary.asteroidsPowerBlock,
    },
    ufoPowerBlock: {
      label: 'UFO',
      columnName: 'Blocks',
      JSON: window.objectLibrary.ufoPowerBlock,
    },
    starViewBlock: {
      label: 'Star View',
      columnName: 'Blocks',
      JSON: window.objectLibrary.starViewBlock,
    },

  }

  window.homemadearcadeBasicLibrary = {
    selectColor: false,
    drawStructure: false,
    drawBackground: false,
    drawForeground: false,
    standingNPC: false,
    wanderingNPC: false,
    spin: true,
    mario: true,
    zelda: true,
    asteroids: true,
    car: true,
    ufo: true,
    kirby: true,
    snake: true,
    spear: true,
    gun: true,
  }

  window.adminCreatorObjects = {
    selectColor: true,
    drawStructure: true,
    drawBackground: true,
    drawForeground: true,
    light: true,
    fire: true,
    spawnZone: true,
    resourceZone: true,
    resource: true,
    homing: true,
    chest: true,
    standingNPC: true,
    wanderingNPC: true,
    spin: true,
    mario: true,
    zelda: true,
    asteroids: true,
    car: true,
    ufo: true,
    kirby: true,
    snake: true,
    spear: true,
    gun: true,
    zeldaPowerBlock: true,
    marioPowerBlock: true,
    asteroidsPowerBlock: true,
    ufoPowerBlock: true,
    starViewBlock: true,
  }
}

export default {
  onGameLoaded
}
