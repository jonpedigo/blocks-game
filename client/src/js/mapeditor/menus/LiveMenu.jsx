import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class LiveMenu extends React.Component {
  constructor(props) {
    super(props)

    this._handleLiveMenuClick = ({ key }) => {
      const { objectSelected } = this.props

      if (key === "open-physics-live-menu") {
        LIVEEDITOR.open(objectSelected, 'physics')
      }
      if (key === "open-daynight-live-menu") {
        LIVEEDITOR.open({}, 'daynightcycle')
      }
    }
  }

  render() {
    return <Menu onClick={this._handleLiveMenuClick}>
      <MenuItem key="open-physics-live-menu">Physics</MenuItem>
      <MenuItem key="open-daynight-live-menu">Day/Night Cycle</MenuItem>
    </Menu>
  }
}
