import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class ColorMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleColorMenuClick = ({ key }) => {
      const { objectSelected, openColorPicker } = this.props

      if(key === 'select-color') {
        this.openColorPicker()
      }

      if(key === 'toggle-filled') {
        window.socket.emit('editObjects', [{id: objectSelected.id, tags: { filled: !objectSelected.tags.filled }}])
      }

      if(key === 'toggle-visible') {
        window.socket.emit('editObjects', [{id: objectSelected.id, tags: { invisible: false, obstacle: true }}])
      }
      if(key === 'toggle-invisible') {
        window.socket.emit('editObjects', [{id: objectSelected.id, tags: { invisible: true, obstacle: false }}])
      }
    }
  }

  render() {
    const { objectSelected } = this.props

    return <Menu onClick={this._handleColorMenuClick}>
      <MenuItem key="select-color">Color Picker</MenuItem>
      <MenuItem key="toggle-filled">{ objectSelected.tags.filled ? 'On border only' : "Fill object" }</MenuItem>
      {objectSelected.tags.invisible ? <MenuItem key="toggle-visible">Make visible</MenuItem> : <MenuItem key="toggle-invisible">Make invisible</MenuItem> }
    </Menu>
  }
}
