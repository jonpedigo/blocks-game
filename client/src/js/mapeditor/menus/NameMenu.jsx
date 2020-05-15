import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class NameMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleNameMenuClick = ({ key }) => {
      const { objectSelected } = this.props
      const { networkEditObject } = MAPEDITOR

      if(key === "name-object") {
        modals.nameObject(objectSelected)
      }
      if(key === 'name-position-center') {
        networkEditObject(objectSelected, { namePosition: 'center'})
      }
      if(key === 'name-position-above') {
        networkEditObject(objectSelected, { namePosition: 'above'})
      }
      if(key === 'name-position-none') {
        networkEditObject(objectSelected, { namePosition: null})
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
