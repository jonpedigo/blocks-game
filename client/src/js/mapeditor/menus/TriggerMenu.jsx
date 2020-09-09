import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class TriggerMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleTriggerMenuClick = ({ key }) => {
      const { objectSelected } = this.props
      const { networkEditObject } = MAPEDITOR

      const data = JSON.parse(key)

      if(data.action === 'add') {
        modals.addTrigger(objectSelected)
      }

      // if(data.action === 'edit-event') {
      //   modals.editTriggerEvent(objectSelected, data.trigger)
      // }

      if(data.action === 'edit') {
        modals.editTrigger(objectSelected, data.trigger)
      }

      if(data.action === 'delete') {
        window.socket.emit('deleteTrigger', objectSelected.id, data.trigger.id)
      }
    }
  }

  // _renderEventEffects(eventName) {
  //   const { objectSelected } = this.props
  //
  //   if(!objectSelected.triggers) {
  //     objectSelected.triggers = {}
  //   }
  //
  //   const items = []
  //
  //   Object.keys(objectSelected.triggers).forEach((triggerId) => {
  //     const trigger = objectSelected.triggers[triggerId]
  //
  //     if(trigger.eventName === eventName) {
  //       items.push(
  //         }
  //   })
  //
  //   return items
  // }

  _renderTriggerMenu() {
    const { objectSelected } = this.props

    const items = []
    if(!objectSelected.triggers) return items

    Object.keys(objectSelected.triggers).forEach((name) => {
      const trigger = objectSelected.triggers[name]

      items.push(
        <MenuItem key={JSON.stringify({action: 'edit', trigger})}>{`Edit ${trigger.id}`}</MenuItem>,
        <MenuItem key={JSON.stringify({action: 'delete', trigger})}>{`Delete ${trigger.id}`}</MenuItem>
      )
    })

    return items
  }

  render() {
    return <Menu onClick={this._handleTriggerMenuClick}>
      {this._renderTriggerMenu()}
      <MenuItem key={JSON.stringify({action: 'add'})}>Add Trigger</MenuItem>
    </Menu>
  }
}
