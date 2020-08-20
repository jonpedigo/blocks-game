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
  }

  window.homemadearcadeBasicLibrary = {
    selectColor: false,
    drawStructure: false,
    drawBackground: false,
    drawForeground: false,
    standingNPC: false,
    wanderingNPC: false,
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
  }
}

export default {
  onGameLoaded
}
