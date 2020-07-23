import gridUtil from '../utils/grid.js'

function constructEditorOnSelect(objectId, tags) {
  if(GAME.objectsById[objectId]) {
    MAPEDITOR.openConstructEditor(GAME.objectsById[objectId])
  } else {
    const globalConstructStationaryObstacle = {reserved: true, x: 0, y: 0, width: GAME.grid.width, height: GAME.grid.height, tags, constructParts: [], id: objectId}
    OBJECTS.create(globalConstructStationaryObstacle)
    MAPEDITOR.openConstructEditor(globalConstructStationaryObstacle)
  }
  const removeListener = window.local.on('onConstructEditorClose', ({constructParts, x, y, width, height}) => {
    setTimeout(() => {
      this.setState({
        creatorObjectSelected: {}
      })
    })
    removeListener()
  })
}

function onGameLoaded() {
  window.defaultCreatorObjects = [
    {
      label: 'Structure',
      columnName: 'Draw',
      onSelect: function() {
        constructEditorOnSelect.call(this, 'globalConstructStationaryObstacle', { obstacle: true, stationary: true })
      }
    },
    // {
    //   label: 'Outline',
    //   columnName: 'Basic',
    //   onSelect: function() {
    //     if(GAME.objectsById['globalConstructStationaryObstacleOutline']) {
    //       MAPEDITOR.openConstructEditor(GAME.objectsById['globalConstructStationaryObstacleOutline'])
    //     } else {
    //       const globalConstructStationaryObstacleOutline = {x: 0, y: 0, width: GAME.grid.width, height: GAME.grid.height, tags: { obstacle: true, stationary: true, outline: true }, constructParts: [], id: 'globalConstructStationaryObstacleOutline'}
    //       OBJECTS.create(globalConstructStationaryObstacleOutline)
    //       MAPEDITOR.openConstructEditor(globalConstructStationaryObstacleOutline)
    //     }
    //     const removeListener = window.local.on('onConstructEditorClose', ({constructParts, x, y, width, height}) => {
    //       this.setState({
    //         creatorObjectSelected: {}
    //       })
    //       removeListener()
    //     })
    //   }
    // },
    {
      label: 'Background',
      columnName: 'Draw',
      onSelect: function() {
        constructEditorOnSelect.call(this, 'globalConstructStationaryBackground', { background: true, stationary: true })
      }
    },
    {
      label: 'Foreground',
      columnName: 'Draw',
      onSelect: function() {
        constructEditorOnSelect.call(this, 'globalConstructStationaryForeground', { foreground: true, stationary: true })
      }
    },
    // {
    //   label: 'Background',
    //   columnName: 'Basic',
    //   onMouseDown: (object, color) => {
    //     const { gridX, gridY } = gridUtil.convertToGridXY(object)
    //     window.socket.emit('updateGridNode', gridX, gridY, { sprite: 'solidcolorsprite', color })
    //   }
    // },
    {
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
    {
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
    {
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
    {
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
    // {
    //   label: 'Basic Item',
    //   columnName: 'Items',
    //   JSON: {
    //     objectType: 'plainObject',
    //     tags: { pickupable: true, pickupOnHeroInteract: true },
    //   }
    // },
    {
      label: 'Resource',
      columnName: 'Items',
      JSON: {
        objectType: 'plainObject',
        tags: { obstacle: true, resource: true, pickupable: true, pickupOnHeroInteract: true },
      }
    },
    {
      label: 'Chest',
      columnName: 'Items',
      JSON: {
        objectType: 'plainObject',
        tags: { obstacle: true, spawnZone: true, spawnAllInHeroInventoryOnHeroInteract: true, destroyOnSpawnPoolDepleted: true },
        spawnLimit: -1, spawnPoolInitial: 1, subObjectChances: {'spawner': {randomWeight: 1, conditionList: null}}
      }
    },
    {
      label: 'Standing',
      columnName: 'NPCs',
      JSON: {
        objectType: 'plainObject',
        dialogue: "Hello!",
        tags: { obstacle: true, stationary: true, talker: true, talkOnHeroInteract: true },
      }
    },
    {
      label: 'Wandering',
      columnName: 'NPCs',
      JSON: {
        objectType: 'plainObject',
        dialogue: "Hello!",
        tags: { obstacle: true, wander: true, talker: true, talkOnHeroInteract: true },
      }
    },
  ]
}

export default {
  onGameLoaded
}
