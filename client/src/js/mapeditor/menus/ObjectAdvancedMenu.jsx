import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class ObjectAdvancedMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleObjectAdvancedMenuClick = ({ key }) => {
      const { objectSelected } = this.props
      const { onStartSetPathfindingLimit } = MAPEDITOR

      if(key === 'set-pathfinding-limit') {
        onStartSetPathfindingLimit(objectSelected)
      }

      if(key === 'copy-id') {
        PAGE.copyToClipBoard(objectSelected.id)
      }

      if(key === 'edit-properties-json') {
        modals.editObjectCode(objectSelected, 'Editing Object Properties', OBJECTS.getProperties(objectSelected));
      }

      if(key === 'edit-state-json') {
        modals.editObjectCode(objectSelected, 'Editing Object State', OBJECTS.getState(objectSelected));
      }
    }
  }

  render() {
    const { objectSelected } = this.props

    return <Menu onClick={this._handleObjectAdvancedMenuClick}>
      <MenuItem key="set-pathfinding-limit">Set pathfinding area</MenuItem>
      <MenuItem key="set-parent">Set parent</MenuItem>
      <MenuItem key="set-relative">Set relative</MenuItem>
      <MenuItem key="copy-id">Copy id to clipboard</MenuItem>
      <MenuItem key="add-compendium">Add To Compendium</MenuItem>
      <MenuItem key="edit-properties-json">Edit Properties JSON</MenuItem>
      <MenuItem key="edit-state-json">Edit State JSON</MenuItem>
    </Menu>
  }
}
