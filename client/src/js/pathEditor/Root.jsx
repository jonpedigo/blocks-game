import { SketchPicker, SwatchesPicker } from 'react-color';
import React from 'react'

export default class Root extends React.Component{
  constructor(props) {
    super(props)

    this.state = {
      open: false,
      selectedColor: '',
    }

    this._openColorPicker = this._openColorPicker.bind(this)
    this._closeColorPicker = this._closeColorPicker.bind(this)
    this._paintBrushClick = this._paintBrushClick.bind(this)
    this._eyeDropperClick = this._eyeDropperClick.bind(this)
    this._eraserClick = this._eraserClick.bind(this)
    this._saveClick = this._saveClick.bind(this)
    this._cancelClick = this._cancelClick.bind(this)
  }

  setColor(color) {
    this.setState({
      selectedColor: color,
    })
  }

  open(initialColor) {
    this.setState({
      open: true,
      selectedColor: initialColor,
    })
    this._paintBrushClick()
  }

  close() {
    this.setState({
      open: false,
    })
  }

  _renderColorPicker() {
    const { selectedColor, isColorPickerOpen } = this.state
    const { selectColor } = this.props

    if(!isColorPickerOpen) return null

    return <div className="ConstructEditor__color-picker"><SketchPicker
        color={selectedColor}
        onChange={(color) => {
          this.setState({
            selectedColor: color.hex
          })
          selectColor(color.hex)
        }}
        onChangeComplete={ (color) => {
          selectColor(color.hex)
        }}
      />
      <SwatchesPicker
          color={selectedColor}
          onChange={(color) => {
            this.setState({
              selectedColor: color.hex
            })
            selectColor(color.hex)
          }}
          onChangeComplete={ (color) => {
            selectColor(color.hex)
          }}
        />
    </div>
  }

  _renderMenu() {
    const { selectedColor, isColorPickerOpen } = this.state

    const colorSelection = PAGE.role.isAdmin || GAME.heros[HERO.id].flags.constructEditorColor

    return <div className="ConstructEditor__menu-list">
      <div className="ConstructEditor__menu-item fas fa-route" onClick={this._paintBrushClick}></div>
      <div className="ConstructEditor__menu-item fas fa-eraser" onClick={this._eraserClick}></div>
      <div className="ConstructEditor__menu-item fas fa-edit" onClick={this._eyeDropperClick}></div>
      <div className="ConstructEditor__menu-item ConstructEditor__menu-item--text" onClick={this._saveClick}>Save</div>
      <div className="ConstructEditor__menu-item ConstructEditor__menu-item--text" onClick={this._cancelClick}>Cancel</div>
    </div>
  }

  _openColorPicker() {
    this.setState({isColorPickerOpen: true})
  }

  _closeColorPicker() {
    this.setState({isColorPickerOpen: false})
  }

  _paintBrushClick() {
    const { toolChange } = this.props
    toolChange('paintBrush')
    window.setFontAwesomeCursor("\uf4d7", 'white')
  }

  _eyeDropperClick() {
    const { toolChange } = this.props
    toolChange('eyeDropper')
    window.setFontAwesomeCursor("\uf1fb", 'white')
  }

  _eraserClick() {
    const { toolChange } = this.props
    window.setFontAwesomeCursor("\uf12d", 'white')
    toolChange('eraser')
  }

  _saveClick() {
    this.props.finishConstruct()
  }

  _cancelClick() {
    this.props.cancelConstruct()
  }

  render() {
    const { open } = this.state

    if(!open) return null

    return (
      <div className="ConstructEditor">
        {this._renderMenu()}
        {this._renderColorPicker()}
      </div>
    )
  }
}
