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
      const json = window.modLibrary[modId]
      window.socket.emit('editHero', { id: HERO.id, ...json})
    },
    onToggleOn: () => {
      const json = window.modLibrary[modId]
      const mod = {
        ownerId: objectId || HERO.id,
        effectJSON: json,
        manualRevertId: modId,
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

function onGameLoaded() {
  window.creatorLibrary = {
    selectColor: {
      specialAction: 'selectColor',
    },
    drawStructure: {
      label: 'Structure',
      columnName: 'Draw',
      onSelect: function() {
        constructEditorOnSelect.call(this, 'globalConstructStationaryObstacle', { obstacle: true, stationary: true })
      }
    },
    drawBackground: {
      label: 'Background',
      columnName: 'Draw',
      onSelect: function() {
        constructEditorOnSelect.call(this, 'globalConstructStationaryBackground', { background: true, stationary: true, notInCollisions: true })
      }
    },
    drawForeground: {
      label: 'Foreground',
      columnName: 'Draw',
      onSelect: function() {
        constructEditorOnSelect.call(this, 'globalConstructStationaryForeground', { foreground: true, stationary: true, notInCollisions: true })
      }
    },
    standingNPC: {
      label: 'Standing',
      columnName: 'NPCs',
      JSON: {
        objectType: 'plainObject',
        heroDialogue: [
          "hello!"
        ],
        tags: { obstacle: true, stationary: true, talker: true, talkOnHeroInteract: true },
      }
    },
    wanderingNPC: {
      label: 'Wandering',
      columnName: 'NPCs',
      JSON: {
        objectType: 'plainObject',
        heroDialogue: [
          "hello!"
        ],
        tags: { obstacle: true, wander: true, moving: true, talker: true, talkOnHeroInteract: true },
      }
    },
    light: {
      label: 'Medium  Light',
      columnName: 'Lights',
      JSON: {
        objectType: 'plainObject',
        tags: {
          light: true,
          invisible: true,
        }
      }
    },
    fire: {
      label: 'Fire',
      columnName: 'Lights',
      JSON: {
        objectType: 'plainObject',
        tags: {
          emitter: true,
          light: true,
        }
      }
    },
    spawnZone: {
      label: 'Spawn Zone',
      columnName: 'Zones',
      JSON: {
        objectType: 'plainObject',
        width: GAME.grid.nodeSize * 2,
        height: GAME.grid.nodeSize * 2,
        tags: {
          spawnZone: true,
          spawnRandomlyWithin: true,
          spawnOnInterval: true,
          invisible: true,
        },
        spawnLimit: -1, spawnPoolInitial: 1, subObjectChances: {'spawner': {randomWeight: 1, conditionList: null}}
      },
      onCreateObject: (object) => {
        window.socket.emit('addSubObject', object, { tags: { potential: true } }, 'spawner')
      },
    },
    resourceZone: {
      label: 'Resource Zone',
      columnName: 'Zones',
      JSON: {
        objectType: 'plainObject',
        width: GAME.grid.nodeSize * 2,
        height: GAME.grid.nodeSize * 2,
        tags: { outline: true, resourceZone: true, resourceDepositOnCollide: true, resourceWithdrawOnInteract: true },
        resourceWithdrawAmount: 1, resourceLimit: -1, resourceTags: ['resource']
      }
    },
    resource: {
      label: 'Resource',
      columnName: 'Items',
      JSON: {
        objectType: 'plainObject',
        subObjectName: 'resource',
        tags: { obstacle: true, resource: true, pickupable: true, pickupOnHeroInteract: true },
      }
    },
    chest: {
      label: 'Chest',
      columnName: 'Items',
      JSON: {
        objectType: 'plainObject',
        tags: { obstacle: true, spawnZone: true, spawnAllInHeroInventoryOnHeroInteract: true, destroyOnSpawnPoolDepleted: true },
        spawnLimit: -1, spawnPoolInitial: 1, subObjectChances: {'spawner': {randomWeight: 1, conditionList: null}}
      }
    },
    homing: {
      label: 'Homing',
      columnName: 'Monsters',
      JSON: {
        objectType: 'plainObject',
        tags: { obstacle: true, monster: true, moving: true, homing: true, targetHeroOnAware: true },
        subObjects: {
          awarenessTriggerArea: {
            x: 0, y: 0, width: 40, height: 40,
            relativeWidth: GAME.grid.nodeSize * 12,
            relativeHeight: GAME.grid.nodeSize * 16,
            relativeX: 0,
            relativeY: -GAME.grid.nodeSize * 4,
            opacity: 0.2,
            color: 'yellow',
            tags: { obstacle: false, invisible: false, stationary: true, awarenessTriggerArea: true, relativeToDirection: true, },
          }
        }
      }
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
      toggleId: 'mario',
      ...toggleMod('mario')
    },
    kirby: {
      label: 'Kirby',
      columnName: 'Hero',
      toggleId: 'kirby',
      ...toggleMod('kirby')
    },
    zelda: {
      label: 'Zelda',
      columnName: 'Hero',
      toggleId: 'zelda',
      ...toggleMod('zelda')
    },
    ufo: {
      label: 'UFO',
      columnName: 'Hero',
      toggleId: 'ufo',
      ...toggleMod('ufo')
    },
    asteroids: {
      label: 'Asteroids',
      columnName: 'Hero',
      toggleId: 'asteroids',
      ...toggleMod('asteroids')
    },
    car: {
      label: 'Car',
      columnName: 'Hero',
      toggleId: 'car',
      ...toggleMod('car')
    },
    snake: {
      label: 'Snake',
      columnName: 'Hero',
      toggleId: 'snake',
      ...toggleMod('snake')
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
  }
}

export default {
  onGameLoaded
}
