import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class SpawnZoneMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleSpawnZoneMenuClick = ({ key }) => {
      const { objectSelected } = this.props
      const { spawnLimit, spawnPoolInitial, spawnWaitTimer, spawnSubObjectName } = objectSelected

      if(key === 'edit-spawn-limit') {
        modals.editPropertyNumber(objectSelected, 'spawnLimit', spawnLimit)
      }

      if(key === 'edit-spawn-pool-initial') {
        modals.editPropertyNumber(objectSelected, 'spawnPoolInitial', spawnPoolInitial)
      }

      if(key === 'edit-spawn-wait-timer') {
        modals.editPropertyNumber(objectSelected, 'spawnWaitTimer', spawnWaitTimer)
      }

      if(key === 'edit-spawn-sub-object-name') {
        modals.editProperty(objectSelected, 'spawnSubObjectName', spawnSubObjectName)
      }
    }
  }

  render() {
    return <Menu onClick={this._handleSpawnZoneMenuClick}>
      <MenuItem key="edit-spawn-pool-initial">Initial Spawn Pool</MenuItem>
      <MenuItem key="edit-spawn-sub-object-name">Sub Object to Spawn</MenuItem>
      <MenuItem key="edit-spawn-wait-timer">Spawn Wait Seconds</MenuItem>
      <MenuItem key="edit-spawn-limit">Spawn Limit</MenuItem>
    </Menu>
  }
}
