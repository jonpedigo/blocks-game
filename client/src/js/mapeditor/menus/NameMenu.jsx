import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class NameMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleNameMenuClick = ({ key }) => {
      const { objectSelected } = this.props

      if(key === "name-object") {
        modals.nameObject(objectSelected)
      }
      if(key === 'name-position-center') {
        window.socket.emit('editObjects', [{id: objectSelected.id, namePosition: 'center'}])
      }
      if(key === 'name-position-above') {
        window.socket.emit('editObjects', [{id: objectSelected.id, namePosition: 'above'}])
      }
      if(key === 'name-position-none') {
        window.socket.emit('editObjects', [{id: objectSelected.id, namePosition: null}])
      }
    }
  }

  render() {
    return <Menu onClick={this._handleNameMenuClick}>
      <MenuItem key="name-object">Give Name</MenuItem>
      <MenuItem key="name-position-center">Position Name in Center</MenuItem>
      <MenuItem key="name-position-above">Position Name above</MenuItem>
      <MenuItem key="name-position-none">Dont show name on map</MenuItem>
    </Menu>
  }
}
