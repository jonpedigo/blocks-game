import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import modals from './modals.js'

export default class HeroContextMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleHeroMenuClick = ({ key }) => {
      const { editor, onStartResize, onStartDrag, onDelete, openColorPicker } = this.props;
      const { objectHighlighted } = editor

      if(key === 'resize') {
        onStartResize(objectHighlighted)
      }

      if(key === 'drag') {
        onStartDrag(objectHighlighted)
      }

      if(key === 'delete') {
        onDelete(objectHighlighted)
      }

      if(key === 'select-color') {
        openColorPicker()
      }

      if(key === 'toggle-filled') {
        window.socket.emit('editHero', {id: objectHighlighted.id, tags: { filled: !objectHighlighted.tags.filled }})
      }

      if(key === 'copy-id') {
        PAGE.copyToClipBoard(objectHighlighted.id)
      }
    }
  }

  render() {
    const { editor } = this.props
    const { objectHighlighted } = editor

    return <Menu onClick={this._handleHeroMenuClick}>
      <MenuItem key='drag'>Drag</MenuItem>
      <MenuItem key='resize'>Resize</MenuItem>
      <MenuItem key='respawn'>Respawn</MenuItem>
      <SubMenu title="Color">
        <MenuItem key="select-color">Color Picker</MenuItem>
        <MenuItem key="toggle-filled">{ objectHighlighted.tags.filled ? 'On border only' : "Fill object" }</MenuItem>
      </SubMenu>
      <SubMenu title="Advanced">
        <MenuItem key="copy-id">Copy id to clipboard</MenuItem>
        <MenuItem key="add-compendium">Set as Game Default Hero</MenuItem>
        <MenuItem key="edit-properties-json">Edit Properties JSON</MenuItem>
        <MenuItem key="edit-state-json">Edit State JSON</MenuItem>
      </SubMenu>
      <MenuItem key='delete'>Delete</MenuItem>
    </Menu>
  }
}
