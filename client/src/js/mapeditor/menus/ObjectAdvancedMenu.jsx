import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class ObjectAdvancedMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleObjectAdvancedMenuClick = ({ key }) => {
      const { objectSelected } = this.props
      const { onStartSetPathfindingLimit, networkEditObject, openConstructEditor } = MAPEDITOR

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

      if(key === 'edit-all-json') {
        modals.editObjectCode(objectSelected, 'Editing Object', objectSelected);
      }

      if(key === 'add-new-subobject') {
        modals.addNewSubObject(objectSelected)
      }

      if(key === 'set-world-respawn-point') {
        window.socket.emit('updateWorld', {worldSpawnPointX: objectSelected.x, worldSpawnPointY:  objectSelected.y})
      }

      if(key === 'set-object-respawn-point') {
        networkEditObject(objectSelected, { spawnPointX: objectSelected.x, spawnPointY: objectSelected.y })
      }

      if(key === 'turn-into-spawn-zone') {
        window.socket.emit('addSubObject', objectSelected, { tags: { potential: true }}, 'spawner')
        networkEditObject(objectSelected, { tags: {spawnZone: true}, spawnLimit: 0, spawnPoolInitial: 1, spawnSubObjectName: 'spawner' })
      }

      if(key === 'open-construct-editor') {
        openConstructEditor(objectSelected)
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
      <MenuItem key='add-new-subobject'>Add new sub object</MenuItem>
      <MenuItem key='turn-into-spawn-zone'>Turn into spawn zone</MenuItem>
      <MenuItem key="edit-properties-json">Edit Properties JSON</MenuItem>
      <MenuItem key="edit-state-json">Edit State JSON</MenuItem>
      <MenuItem key="edit-all-json">Edit All JSON</MenuItem>
      <MenuItem key='set-object-respawn-point'>Set current position as object respawn point</MenuItem>
      <MenuItem key='set-world-respawn-point'>Set current position as world respawn point</MenuItem>
      <MenuItem key='open-construct-editor'>Open construct editor</MenuItem>
    </Menu>
  }
}
