import React from 'react'

window.defaultCreatorObjects = [
  {
    label: 'Structure',
    columnName: 'Basic',
    JSON: {
      objectType: 'plainObject',
      tags: {
        obstacle: true,
        stationary: true
      }
    }
  },
  {
    label: 'Backdrop',
    columnName: 'Basic',
    onSelectObject: () => {
      //sprite chooser
    },
    onCreateObject: () => {
      //window.socket.emit('updateGridNode')
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
      tags: { resourceZone: true, resourceDepositOnCollide: true, resourceWithdrawOnCollide: true },
      resourceWithdrawAmount: 1, resourceLimit: -1, resourceTags: ['resource']
    }
  }
]

export default class Creator extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      creatorObjects: window.defaultCreatorObjects,
      creatorObjectSelected : null,
      open: true,
      rows: [],
      columnsOpen: {}
    }

    this._setCreatorObjects = (creatorObjects = window.defaultCreatorObjects) => {
      this.setState({
        creatorObjects
      })
    }

    this._open = () => {
      this.setState({
        open: true,
      })
    }

    this._close = () => {
      this.setState({
        open: false,
      })
    }

    this._categorizeCreatorObjects = () => {
      const { creatorObjects, rowsOpen } = this.state

      let rows = {}

      creatorObjects.forEach((object) => {
        if(!rows[object.columnName]) rows[object.columnName] = []
        rows[object.columnName].push(object)
      })

      rows = Object.keys(rows).map((cName) => rows[cName])

      this.setState({
        rows
      })
    }
  }

  _toggleOpenColumn(columnName) {
    const columnsOpen = this.state.columnsOpen

    columnsOpen[columnName] = !columnsOpen[columnName]

    this.setState({columnsOpen})
  }

  componentDidMount() {
    this._categorizeCreatorObjects()
  }

  render() {
    const { creatorObjects, open, rows, columnsOpen } = this.state

    if(!open) return

    return (
      <div className="Creator">
        {rows.map((columns) => {
          return <div className="Creator__category" onClick={() => {
              this._toggleOpenColumn(columns[0].columnName)
            }}>
            {columns[0].columnName}
            {columnsOpen[columns[0].columnName] &&
              columns.map((object) => {
                return <div className="Creator__category-item">
                  {object.label}
                </div>
              })
            }
          </div>
        })}
      </div>
    )
  }
}
