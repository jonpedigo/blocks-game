import React from 'react'
import classnames from 'classnames'
import { SketchPicker, SwatchesPicker } from 'react-color';

export default class ToolbarButton extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { active, iconName, text, cursorIcon, onClick, onShiftClick } = this.props
    return (
      <i
        className={classnames("Toolbar__tool-selector fa fas ", iconName, { "Toolbar__tool-selector--normal-cursor": !cursorIcon, "Toolbar__tool-selector--text": text, "Toolbar__tool-selector--shift": onShiftClick && EDITOR.shiftPressed, "Toolbar__tool-selector--active": active })}
        onClick={onClick}
        onMouseEnter={() => {
          if(cursorIcon) {
            window.setFontAwesomeCursor(cursorIcon, "#FFF")
          }
        }} onMouseLeave={() => {
          if(cursorIcon) {
            document.body.style.cursor = 'default';
          }
        }}
      >
        {text}
      </i>
    )
  }
}
