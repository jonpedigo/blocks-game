import React from 'react'
import classnames from 'classnames'
import { SketchPicker, SwatchesPicker } from 'react-color';
import gridUtil from '../utils/grid.js'
import PixiMapSprite from '../components/PixiMapSprite.jsx';

export default class Creator extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      creatorObjects: this.props.creatorObjects,
      creatorObjectSelected : {},
      rows: [],
      columnsOpen: {},
      creatorObjectsToggled: {},
      isColorPickerOpen: false,
      colorSelected: EDITOR.preferences.creatorColorSelected,
    }

    this.setCreatorObjects = (creatorObjects = window.defaultCreatorObjects) => {
      this.setState({
        creatorObjects
      }, () => {
        this._categorizeCreatorObjects()
      })
    }

    this.clearSelectedCreatorObject = () => {
      this.setState({
        creatorObjectSelected: {}
      })
    }

    this._onMouseUp = (event) => {
      this.setState({
        mouseDown: false,
      })
    }

    this._onMouseDown = (event) => {
      if(!window.isClickingMap(event.target.className)) return

      this.setState({
        mouseDown: true,
      })
    }

    this._onMouseMove = () => {
      if(!MAPEDITOR.objectHighlighted) return
      const { creatorObjectSelected, colorSelected } = this.state
      const { textureIdSelected } = this.props

      if(this.state.mouseDown && creatorObjectSelected.onMouseDown) {
        creatorObjectSelected.onMouseDown(MAPEDITOR.objectHighlighted, colorSelected)
      }

      const isObstacle = MAPEDITOR.objectHighlighted.id && MAPEDITOR.objectHighlighted.tags.obstacle
      if(!isObstacle && creatorObjectSelected.JSON) {
        const { height, width, tags, color } = creatorObjectSelected.JSON
        if(width) MAPEDITOR.objectHighlighted.width = width
        else MAPEDITOR.objectHighlighted.width = GAME.grid.nodeSize
        if(height) MAPEDITOR.objectHighlighted.height = height
        else MAPEDITOR.objectHighlighted.height = GAME.grid.nodeSize
        if(tags) MAPEDITOR.objectHighlighted.tags = tags
        const { x, y } = gridUtil.snapXYToGrid(MAPEDITOR.mousePos.x, MAPEDITOR.mousePos.y, { closest: false })
        MAPEDITOR.objectHighlighted.x = x
        MAPEDITOR.objectHighlighted.y = y
        MAPEDITOR.objectHighlighted.color = color || 'white'
        if(colorSelected && colorSelected !== GAME.world.defaultObjectColor) MAPEDITOR.objectHighlighted.color = colorSelected
        if(textureIdSelected) MAPEDITOR.objectHighlighted.defaultSprite = textureIdSelected
        MAPEDITOR.objectHighlighted.CREATOR = true
      }
    }

    this._onClick = (event) => {
      if(CONSTRUCTEDITOR.open || PATHEDITOR.open) return
      if(!window.isClickingMap(event.target.className)) return
      const { creatorObjectSelected, colorSelected } = this.state
      const { textureIdSelected } = this.props

      let newObject
      if(!MAPEDITOR.objectHighlighted.id && creatorObjectSelected.JSON) {
        newObject = _.cloneDeep(creatorObjectSelected.JSON)
        newObject.x = MAPEDITOR.objectHighlighted.x
        newObject.y = MAPEDITOR.objectHighlighted.y
        newObject.id = 'creator-'+window.uniqueID()
        OBJECTS.forAllSubObjects(newObject.subObjects, (subObject) => {
          subObject.id = 'subObject-'+window.uniqueID()
        })
        if(colorSelected) newObject.color = colorSelected
        if(textureIdSelected) newObject.defaultSprite = textureIdSelected
        OBJECTS.create(newObject)

        if(creatorObjectSelected.onCreateObject) {
          creatorObjectSelected.onCreateObject(newObject)
        }
      }

      if(creatorObjectSelected.onClick) {
        creatorObjectSelected.onClick(MAPEDITOR.objectHighlighted, colorSelected, newObject)
      }
    }

    this._categorizeCreatorObjects = () => {
      const { creatorObjects, rowsOpen } = this.state

      let rows = {}

      let hasSelectColor = false
      let hasSelectSprite = false

      Object.keys(creatorObjects).forEach((objectName) => {
        if(creatorObjects[objectName] === false) return

        const object = window.creatorLibrary[objectName]

        if(object.specialAction && object.specialAction == 'selectColor') {
          hasSelectColor = true
          return
        }
        if(object.specialAction && object.specialAction == 'selectSprite') {
          hasSelectSprite = true
          return
        }
        if(!rows[object.columnName]) rows[object.columnName] = []
        rows[object.columnName].push(object)
      })

      rows = Object.keys(rows).map((cName) => rows[cName])


      if(hasSelectSprite) rows.unshift({ specialAction: 'selectSprite'})
      if(hasSelectColor) rows.unshift({ specialAction: 'selectColor'})
      this.setState({
        rows
      })
    }

    this._openColorPicker = this._openColorPicker.bind(this)
    this._closeColorPicker = this._closeColorPicker.bind(this)
  }

  componentDidMount() {
    document.body.addEventListener("click", this._onClick)
    document.body.addEventListener("mousemove", this._onMouseMove)
    document.body.addEventListener("mousedown", this._onMouseDown)
    document.body.addEventListener("mouseup", this._onMouseUp)

    this._categorizeCreatorObjects()
  }

  componentWillUnmount() {
    document.removeEventListener("click", this._onClick, false);
    document.removeEventListener("mousemove", this._onMouseMove, false);
    document.removeEventListener("mousedown", this._onMouseDown, false);
    document.removeEventListener("mouseup", this._onMouseUp, false);
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

  _untoggleExclusivesInColumn(columnName) {
    const { creatorObjects, creatorObjectsToggled } = this.state;
    return new Promise((resolve, reject) => {
      const toggleOff = {}
      Object.keys(creatorObjects).forEach((objectName) => {
        if(creatorObjects[objectName] === false) return

        const object = window.creatorLibrary[objectName]
        if(object.columnName === columnName && object.columnExclusiveToggle && creatorObjectsToggled[object.toggleId] && object.onToggleOff) {
          object.onToggleOff()
          toggleOff[object.toggleId] = false
        }
      })

      this.setState({
        creatorObjectsToggled: {
          ...creatorObjectsToggled,
          ...toggleOff
        }
      }, () => {
        resolve()
      })
    })
  }

  async _selectCreatorObject(object) {
    const { creatorObjectsToggled } = this.state;
    if(object.onShiftClick && EDITOR.shiftPressed) {
      object.onShiftClick.bind(this)()
    } else if(object.onToggleOn && !creatorObjectsToggled[object.toggleId]) {
      if(object.columnExclusiveToggle) await this._untoggleExclusivesInColumn(object.columnName)
      object.onToggleOn.bind(this)()
      this.setState({
        creatorObjectsToggled: {
          ...this.state.creatorObjectsToggled,
          [object.toggleId]: true
        }
      })
    } else if(object.onToggleOff && creatorObjectsToggled[object.toggleId]) {
      object.onToggleOff.bind(this)()
      this.setState({
        creatorObjectsToggled: {
          ...creatorObjectsToggled,
          [object.toggleId]: false
        }
      })
    } else if(object.onSelect) {
      object.onSelect.bind(this)()
    } else {
      this.setState({
        creatorObjectSelected: object
      })
    }
  }

  _renderColumn(column) {
    const { columnsOpen, creatorObjectSelected, creatorObjectsToggled } = this.state

    const name = column[0].columnName
    const selected = name === creatorObjectSelected.columnName
    const open = columnsOpen[name] || selected

    return <div className="Creator__category-container"><div className={classnames("Creator__category", {"Creator__category--selected": selected } )} onMouseEnter={() => {
        this._toggleOpenColumn(name)
      }}
      onMouseLeave={() => {
        this._closeColumn(name)
      }}
      >
      <div className="Creator__category-top">
        {!open && !selected && name}
        {open && !selected && <i className="Creator__category-close fa fas fa-chevron-down"></i>}
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
          const hasShiftClick = object.onShiftClick && EDITOR.shiftPressed
          const selected = object.label === creatorObjectSelected.label
          const toggledOn = creatorObjectsToggled[object.toggleId]
          return <div className={classnames("Creator__category-item", { "Creator__category-item--selected": selected, "Creator__category-item--shift": hasShiftClick })} onClick={() => {
              this._selectCreatorObject(object)
            }}>
            {object.label}
            {toggledOn && <i className="fa fas fa-check"/>}
          </div>
        })
      }
    </div></div>
  }

  _openColorPicker() {
    this.setState({isColorPickerOpen: true})
  }

  _closeColorPicker() {
    this.setState({isColorPickerOpen: false})
  }

  _renderColorPicker() {
    const { colorSelected, isColorPickerOpen } = this.state

    if(!isColorPickerOpen) return null

    return <div className="Creator__color-picker"><SketchPicker
        color={colorSelected}
        onChange={(color) => {
          this.setState({
            colorSelected: color.hex
          })
          EDITOR.preferences.creatorColorSelected = color.hex
        }}
        onChangeComplete={ (color) => {
          this.setState({
            colorSelected: color.hex
          })
          EDITOR.preferences.creatorColorSelected = color.hex
        }}
      />
    <br/>
    <SwatchesPicker
      color={colorSelected}
      onChangeComplete={ (color) => {
        this.setState({
          colorSelected: color.hex
        })
        EDITOR.preferences.creatorColorSelected = color.hex
      }}/>
    </div>
  }

  _renderSelectSprite() {
    const { textureIdSelected } = this.props

    return <div className="Creator__category-container">
      <div className="Creator__category Creator__category-top Creator__category-top--sprite-selector" onClick={() => {
        MEDIAMANAGER.open({ objectSelected: 'creator', selectedMenu: 'SpriteSelector'})
      }}>
        {textureIdSelected ? <div className="Creator__sprite-container"><PixiMapSprite width="40" height="40" textureId={textureIdSelected}></PixiMapSprite></div>
      : <i className="fa fas fa-image"></i>}
      </div>
    </div>
  }

  _renderColorCategory() {
    const { isColorPickerOpen, colorSelected } = this.state

    return <div className="Creator__category-container">
      {!isColorPickerOpen && <div className="Creator__category Creator__category-top" style={{backgroundColor: colorSelected}} onClick={this._openColorPicker}></div>}
      {isColorPickerOpen && <div className="Creator__category Creator__category-top" style={{backgroundColor: colorSelected}} onClick={this._closeColorPicker}><i className="fa fas fa-chevron-down"></i></div>}
      {this._renderColorPicker()}
    </div>
  }

  render() {
    const { creatorObjects, rows } = this.state

    if(CONSTRUCTEDITOR.open || PATHEDITOR.open) return null
    if(!PAGE.showEditorTools()) {
      return null
    }

    return (
      <div className="Creator" style={rows.length ? { height: '45px'} : null}>
        {rows.map((column) => {
          if(column.specialAction && column.specialAction == 'selectColor') {
            return this._renderColorCategory()
          }
          if(column.specialAction && column.specialAction == 'selectSprite') {
            return this._renderSelectSprite()
          }
          return this._renderColumn(column)
        })}
      </div>
    )
  }
}
