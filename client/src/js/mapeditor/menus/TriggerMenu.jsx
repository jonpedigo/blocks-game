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
        modals.addTrigger(objectSelected, data.eventName)
      }

      if(data.action === 'edit') {
        modals.editTrigger(objectSelected, data.trigger)
      }

      if(data.action === 'delete') {
        window.socket.emit('deleteTrigger', objectSelected.id, data.trigger.id)
      }

      if(data.action === 'editEffectJSON') {
        modals.editEffectJSON(objectSelected, data.trigger)
      }
    }
  }

  _renderEventEffects(eventName) {
    const { objectSelected } = this.props

    if(!objectSelected.triggers) {
      objectSelected.triggers = {}
    }

    const items = []

    Object.keys(objectSelected.triggers).forEach((triggerId) => {
      const trigger = objectSelected.triggers[triggerId]

      if(trigger.eventName === eventName) {
        items.push(<MenuItem key={JSON.stringify({action: 'edit', trigger})}>{`Edit ${trigger.effectName}`}</MenuItem>,
          <MenuItem key={JSON.stringify({action: 'delete', trigger})}>{`Delete ${trigger.effectName}`}</MenuItem>)

        if(trigger.effectName === 'mutate') {
          items.push(<MenuItem key={JSON.stringify({action: 'editEffectJSON', trigger})}>{`Edit Effect JSON`}</MenuItem>)
        }
      }
    })

    return items
  }

  _renderTriggerMenu() {
    const { objectSelected } = this.props

    const items = []

    Object.keys(window.triggerEvents).forEach((eventName) => {
      items.push(<SubMenu key={eventName} title={eventName}>
          <MenuItem key={JSON.stringify({eventName, action: 'add'})}>Add Effect</MenuItem>
          {this._renderEventEffects(eventName)}
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
