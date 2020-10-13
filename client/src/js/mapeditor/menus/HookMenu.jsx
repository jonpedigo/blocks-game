import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class HookMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleHookMenuClick = ({ key }) => {
      const { objectSelected } = this.props
      const { networkEditObject } = MAPEDITOR

      const data = JSON.parse(key)

      if(data.action === 'add') {
        modals.addHook(objectSelected, data.eventName)
      }

      if(data.action === 'edit-conditions') {
        modals.editHookConditions(objectSelected, data.hook)
      }

      if(data.action === 'delete') {
        window.socket.emit('deleteHook', objectSelected.id, data.hook.id)
      }
    }
  }

  _renderEventConditions(eventName) {
    const { objectSelected } = this.props

    if(!objectSelected.hooks) {
      objectSelected.hooks = {}
    }

    const items = []

    Object.keys(objectSelected.hooks).forEach((hookId) => {
      const hook = objectSelected.hooks[hookId]
      if(hook === null) return

      if(hook.eventName === eventName) {
        items.push(
          <MenuItem key={JSON.stringify({action: 'edit-conditions', hook})}>{`Edit ${hook.id} Conditions`}</MenuItem>,
          <MenuItem key={JSON.stringify({action: 'delete', hook})}>{`Delete ${hook.id}`}</MenuItem>)
      }
    })

    return items
  }

  _renderHookMenu() {
    const { objectSelected } = this.props

    const items = []

    Object.keys(window.hookEvents).forEach((eventName) => {
      items.push(<SubMenu key={eventName} title={eventName}>
          <MenuItem key={JSON.stringify({eventName, action: 'add'})}>Add Hook</MenuItem>
          {this._renderEventConditions(eventName)}
        </SubMenu>)
    })

    return items
  }

  render() {
    return <Menu onClick={this._handleHookMenuClick}>
      {this._renderHookMenu()}
    </Menu>
  }
}
