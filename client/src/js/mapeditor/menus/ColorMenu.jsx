import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class ColorMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleColorMenuClick = ({ key }) => {
      const { objectSelected, openColorPicker } = this.props
      const { networkEditObject } = MAPEDITOR

      if(key === 'select-color') {
        openColorPicker(objectSelected)
      }

      if(key === 'toggle-outline') {
        networkEditObject(objectSelected, { tags: { outline: !objectSelected.tags.outline }})
      }

      if(key === 'toggle-invisible') {
        if(objectSelected.tags.invisible) {
          networkEditObject(objectSelected, { tags: { invisible: false, obstacle: true }})
        } else {
          networkEditObject(objectSelected, { tags: { invisible: true, obstacle: false }})
        }
      }
    }
  }

  render() {
    const { objectSelected } = this.props

    // <MenuItem key="toggle-outline">{ objectSelected.tags.outline ? 'On border only' : "Fill object" }</MenuItem>

    return <Menu onClick={this._handleColorMenuClick}>
      {!objectSelected.constructParts && <MenuItem className='dont-close-menu' key="select-color">Color Picker</MenuItem>}
      {objectSelected.tags.invisible ? <MenuItem key="toggle-invisible">Make visible</MenuItem> : <MenuItem key="toggle-invisible">Make invisible</MenuItem> }
    </Menu>
  }
}
