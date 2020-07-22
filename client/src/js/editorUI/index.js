import React from 'react'
import ReactDOM from 'react-dom'
import Root from './Root.jsx'

import gridUtil from '../utils/grid.js'

class EditorUI {
  constructor() {
    this.container = null
    this.ref = null
  }

  onGameLoaded() {
    window.defaultCreatorObjects = [
      {
        label: 'Structure',
        columnName: 'Basic',
        JSON: {
          objectType: 'plainObject',
          tags: {
            obstacle: true,
            stationary: true,
            filled: true,
          }
        }
      },
      {
        label: 'Outline',
        columnName: 'Basic',
        JSON: {
          objectType: 'plainObject',
          tags: {
            obstacle: true,
            stationary: true,
          }
        }
      },
      {
        label: 'Backdrop',
        columnName: 'Basic',
        onSelectObject: () => {
          //sprite chooser
        },
        onClick: (object) => {
          const { gridX, gridY } = gridUtil.convertToGridXY(object)
          window.socket.emit('updateGridNode', gridX, gridY, { sprite: 'solidcolorsprite' })
        }
      },
      {
        label: 'Medium  Light',
        columnName: 'Lights',
        JSON: {
          objectType: 'plainObject',
          tags: {
            light: true,
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
            filled: true,
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
          tags: { resourceZone: true, resourceDepositOnCollide: true, resourceWithdrawOnInteract: true },
          resourceWithdrawAmount: 1, resourceLimit: -1, resourceTags: ['resource']
        }
      },
      {
        label: 'Basic Item',
        columnName: 'Items',
        JSON: {
          objectType: 'plainObject',
          tags: { filled: true, pickupable: true, pickupOnHeroInteract: true },
        }
      },
      {
        label: 'Resource',
        columnName: 'Items',
        JSON: {
          objectType: 'plainObject',
          tags: { obstacle: true, resource: true, filled: true, pickupable: true, pickupOnHeroInteract: true },
        }
      },
      {
        label: 'Chest',
        columnName: 'Items',
        JSON: {
          objectType: 'plainObject',
          tags: { filled: true, obstacle: true, spawnZone: true, spawnAllInHeroInventoryOnHeroInteract: true, destroyOnSpawnPoolDepleted: true },
          spawnLimit: -1, spawnPoolInitial: 1, subObjectChances: {'spawner': {randomWeight: 1, conditionList: null}}
        }
      },
      {
        label: 'Standing Actor',
        columnName: 'Actors',
        JSON: {
          objectType: 'plainObject',
          dialogue: "Hello!",
          tags: { obstacle: true, stationary: true, filled: true, talker: true, talkOnHeroInteract: true },
        }
      },
      {
        label: 'Wanderer',
        columnName: 'Actors',
        JSON: {
          objectType: 'plainObject',
          dialogue: "Hello!",
          tags: { obstacle: true, filled: true, wander: true, talker: true, talkOnHeroInteract: true },
        }
      },
    ]

    // this.container = container
    const initialProps = {
      ref: ref => EDITORUI.ref = ref
    }

    const container = document.createElement('div')
    container.id = 'EditorUIContainer'
    document.getElementById('GameContainer').appendChild(container)
    EDITORUI.container = container

    // Mount React App
    ReactDOM.render(
      React.createElement(Root, initialProps),
      container
    )
  }

  open(objectSelected, openEditorName) {
    EDITORUI.ref.open(objectSelected, openEditorName)
  }
}

window.EDITORUI = new EditorUI()
