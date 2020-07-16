import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class SubObjectChanceMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleSubObjectChanceMenuClick = ({ key }) => {
      const { objectSelected, subObjectName } = this.props

      if(key === 'edit-random-weight') {
        PAGE.typingMode = true
        const subObjectChance = objectSelected.subObjectChances[subObjectName]
        modals.openEditNumberModal('random weight', subObjectChance.randomWeight, {}, (result) => {
          if(result && result.value) {
            subObjectChance.randomWeight = Number(result.value)
            window.socket.emit('editObjects', [{id: objectSelected.id, subObjectChances: objectSelected.subObjectChances }])
          }
          PAGE.typingMode = false
        })
      }

      if(key === 'edit-condition') {
        modals.editSubObjectChanceConditions(objectSelected, subObjectName)
      }

      if(key === 'remove') {
        window.socket.emit('deleteSubObjectChance', objectSelected.id, subObjectName)
      }
    }
  }

  render() {
    return <Menu onClick={this._handleSubObjectChanceMenuClick}>
      <MenuItem key="edit-random-weight">Edit Random Weight</MenuItem>
      <MenuItem key="edit-condition">Edit Condition</MenuItem>
      <MenuItem key="remove">Remove</MenuItem>
    </Menu>
  }
}
