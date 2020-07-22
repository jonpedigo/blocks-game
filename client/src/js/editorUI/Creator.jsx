import React from 'react'
import classnames from 'classnames'

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

    this.clearSelectedCreatorObject = () => {
      this.setState({
        creatorObjectSelected: {}
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

    this._onMouseMove = () => {
      const { creatorObjectSelected } = this.state

      if(!MAPEDITOR.objectHighlighted.id && creatorObjectSelected.JSON) {
        const { height, width, tags, color } = creatorObjectSelected.JSON
        if(width) MAPEDITOR.objectHighlighted.width = width
        if(height) MAPEDITOR.objectHighlighted.height = height
        if(tags) MAPEDITOR.objectHighlighted.tags = tags
        MAPEDITOR.objectHighlighted.color = color || 'white'
        MAPEDITOR.objectHighlighted.CREATOR = true
      }
    }

    this._onClick = () => {
      const { creatorObjectSelected } = this.state
      let newObject
      if(!MAPEDITOR.objectHighlighted.id && creatorObjectSelected.JSON) {
        newObject = _.cloneDeep(creatorObjectSelected.JSON)
        newObject.x = MAPEDITOR.objectHighlighted.x
        newObject.y = MAPEDITOR.objectHighlighted.y
        newObject.id = 'creator-'+window.uniqueID()
        OBJECTS.create(newObject)

        if(creatorObjectSelected.onCreateObject) {
          creatorObjectSelected.onCreateObject(newObject)
        }
      }

      if(creatorObjectSelected.onClick) {
        creatorObjectSelected.onClick(MAPEDITOR.objectHighlighted, newObject)
      }
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
    document.body.addEventListener("click", this._onClick)
    document.body.addEventListener("mousemove", this._onMouseMove)

    this._categorizeCreatorObjects()
  }

  componentWillUnmount() {
    document.removeEventListener("click", this._onClick, false);
    document.removeEventListener("mousemove", this._onMouseMove, false);
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
    // window.setFontAwesomeCursor("\uf041", 'white')
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
              // document.body.style.cursor = 'default';
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
