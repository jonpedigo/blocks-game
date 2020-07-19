import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'
import SubObjectChanceMenu from './SubObjectChanceMenu.jsx'

export default class LootMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleLootMenuClick = ({ key }) => {
      const { objectSelected } = this.props
      const { lootCount } = objectSelected

      if(key === 'edit-loot-count') {
        modals.editPropertyNumber(objectSelected, 'lootCount', lootCount)
      }

      if(key === 'add-loot-object') {
        modals.openNameSubObjectModal((result) => {
          if(result && result.value) {
            const subObjectChances = objectSelected.subObjectChances
            window.socket.emit('editObjects', [{id: objectSelected.id, subObjectChances: {...subObjectChances, [result.value]: {randomWeight: 1, conditionList: null} }}])
          }
        })
      }
    }
  }

  render() {
    const { objectSelected } = this.props
    const subObjectChanceNames = Object.keys(objectSelected.subObjectChances)

    return <Menu onClick={this._handleLootMenuClick}>
      <MenuItem key="edit-loot-count">Edit Loot Count</MenuItem>
      <SubMenu title="Loot Objects">
        {subObjectChanceNames.map((subObjectName) => {
          return <SubMenu title={subObjectName}>
            <SubObjectChanceMenu objectSelected={objectSelected} subObjectName={subObjectName}></SubObjectChanceMenu>
          </SubMenu>
        })}
        <MenuItem key="add-loot-object">Add Loot Object</MenuItem>
      </SubMenu>
    </Menu>
  }
}
