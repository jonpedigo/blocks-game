import React from 'react'
import classnames from 'classnames'

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
      creatorObjectSelected : {},
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

  componentDidMount() {
    this._categorizeCreatorObjects()
  }

  _toggleOpenColumn(columnName) {
    const columnsOpen = this.state.columnsOpen

    columnsOpen[columnName] = !columnsOpen[columnName]

    this.setState({columnsOpen})
  }

  _closeColumn(columnName) {
    const columnsOpen = this.state.columnsOpen

    columnsOpen[columnName] = false

    this.setState({columnsOpen})
  }

  _selectCreatorObject(object) {
    this.setState({
      creatorObjectSelected: object
    })
  }

  _renderColumn(column) {
    const { columnsOpen, creatorObjectSelected } = this.state

    const name = column[0].columnName
    const selected = name === creatorObjectSelected.columnName
    const open = columnsOpen[name] || selected

    return <div className="Creator__category-container"><div className={classnames("Creator__category", {"Creator__category--selected": selected } )} onClick={() => {
        this._toggleOpenColumn(name)
      }}
      onMouseLeave={() => {
        this._closeColumn(name)
      }}
      >
      <div className="Creator__category-top">
        {!open && name}
        {open && !selected && <i className="fa fas fa-chevron-down"></i>}
        {selected &&
          <i className="Creator__category-close fa fas fa-times"
            onClick={() => {
              this.setState({
                creatorObjectSelected: {}
              })
            }
          }></i>
        }
      </div>
      {open &&
        column.map((object) => {
          const selected = object.label === creatorObjectSelected.label
          return <div className={classnames("Creator__category-item", { "Creator__category-item--selected": selected })} onClick={() => {
              this._selectCreatorObject(object)
            }}>
            {object.label}
          </div>
        })
      }
    </div></div>
  }

  render() {
    const { creatorObjects, open, rows } = this.state

    if(!open) return

    return (
      <div className="Creator">
        {rows.map((column) => {
          return this._renderColumn(column)
        })}
      </div>
    )
  }
}
