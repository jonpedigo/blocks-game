import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'
import SubObjectChanceMenu from './SubObjectChanceMenu.jsx'

export default class SpawnZoneMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleSpawnZoneMenuClick = ({ key }) => {
      const { objectSelected } = this.props
      const { spawnLimit, spawnPoolInitial, spawnWaitTimer } = objectSelected

      if(key === 'edit-spawn-limit') {
        modals.editPropertyNumber(objectSelected, 'spawnLimit', spawnLimit)
      }

      if(key === 'edit-spawn-pool-initial') {
        modals.editPropertyNumber(objectSelected, 'spawnPoolInitial', spawnPoolInitial)
      }

      if(key === 'edit-spawn-wait-timer') {
        modals.editPropertyNumber(objectSelected, 'spawnWaitTimer', spawnWaitTimer)
      }

      if(key === 'add-spawn-object') {
        modals.openNameSubObjectModal((result) => {
          if(result && result.value) {
            const subObjectChances = objectSelected.subObjectChances
            window.socket.emit('editObjects', [{id: objectSelected.id, subObjectChances: {...subObjectChances, [result.value]: {randomWeight: 1, conditionList: null} }}])
          }
        })
      }

      if(key === 'spawn-all-now') {
        window.socket.emit('spawnAllNow', objectSelected.id)
      }
    }
  }

  render() {
    const { objectSelected } = this.props
    const subObjectChanceNames = Object.keys(objectSelected.subObjectChances)

    return <Menu onClick={this._handleSpawnZoneMenuClick}>
      <MenuItem key="edit-spawn-pool-initial">Initial Spawn Pool</MenuItem>
      <MenuItem key="edit-spawn-wait-timer">Spawn Wait Seconds</MenuItem>
      <MenuItem key="edit-spawn-limit">Spawn Limit</MenuItem>
      <MenuItem key="spawn-all-now">Spawn All Now</MenuItem>
      <SubMenu title="Spawn Objects">
        {subObjectChanceNames.map((subObjectName) => {
          return <SubMenu title={subObjectName}>
            <SubObjectChanceMenu objectSelected={objectSelected} subObjectName={subObjectName}></SubObjectChanceMenu>
          </SubMenu>
        })}
        <MenuItem key="add-spawn-object">Add Spawn Object</MenuItem>
      </SubMenu>
    </Menu>
  }
}
