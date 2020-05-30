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
        modals.addTrigger(objectSelected, data.event)
      }

      if(data.action === 'edit') {
        modals.editTrigger(objectSelected, data.trigger)
      }

      if(data.action === 'delete') {
        window.socket.emit('deleteTrigger', objectSelected.id, data.trigger.id)
      }

      if(data.action === 'editMutationJSON') {
        modals.editMutationJSON(objectSelected, data.trigger)
      }
    }
  }

  _renderEventEffects(event) {
    const { objectSelected } = this.props

    if(!objectSelected.triggers) {
      objectSelected.triggers = {}
    }

    const items = []

    Object.keys(objectSelected.triggers).forEach((triggerId) => {
      const trigger = objectSelected.triggers[triggerId]

      if(trigger.event === event) {
        items.push(<MenuItem key={JSON.stringify({action: 'edit', trigger})}>{`Edit ${trigger.effect}`}</MenuItem>,
          <MenuItem key={JSON.stringify({action: 'delete', trigger})}>{`Delete ${trigger.effect}`}</MenuItem>)

        if(trigger.effect === 'mutate') {
          items.push(<MenuItem key={JSON.stringify({action: 'editMutationJSON', trigger})}>{`Edit mutation JSON`}</MenuItem>)
        }
      }
    })

    return items
  }

  _renderTriggerMenu() {
    const { objectSelected } = this.props

    const items = []

    window.triggerEvents.forEach((event) => {
      items.push(<SubMenu key={event} title={event}>
          <MenuItem key={JSON.stringify({event, action: 'add'})}>Add Effect</MenuItem>
          {this._renderEventEffects(event)}
        </SubMenu>)
    })

    return items
  }

  render() {
    return <Menu onClick={this._handleTriggerMenuClick}>
      {this._renderTriggerMenu()}
    </Menu>
  }
}
