import React from 'react'
import classnames from 'classnames'
import { SketchPicker, SwatchesPicker } from 'react-color';

export default class Toolbar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: true,
      isColorPickerOpen: false,
      colorSelected: '#FFFFFF'
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
        }}
        onChangeComplete={ (color) => {
          this.setState({
            colorSelected: color.hex
          })
        }}
      />
    <br/>
    <SwatchesPicker
      color={colorSelected}
      onChangeComplete={ (color) => {
        this.setState({
          colorSelected: color.hex
        })
      }}/>
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
    const { open } = this.state

    if(!open || CONSTRUCTEDITOR.open) return null

    return (
      <div className="Toolbar">
        <i className="Toolbar__tool-selector fa fas fa-magic"></i>
        <i className="Toolbar__tool-selector fa fas fa-globe"></i>
        <i className="Toolbar__tool-selector fa fas fa-th"></i>
        <i className="Toolbar__tool-selector fa fas fa-cloud-sun-rain"></i>
        <hr></hr>
        <i className="Toolbar__tool-selector fa fas fa-cog"></i>
        <i className="Toolbar__tool-selector fa fas fa-save"></i>
        <i className="Toolbar__tool-selector fa fas fa-folder"></i>
        <i className="Toolbar__tool-selector fa fas fa-file"></i>
      </div>
    )
  }
}
