import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'
import SpriteChooser from '../SpriteChooser.js';

export default class SpriteMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleSpriteMenuClick = ({ key }) => {
      const { objectSelected } = this.props
      const { networkEditObject } = MAPEDITOR

      if(key === 'name-position-center') {
        networkEditObject(objectSelected, { namePosition: 'center'})
      }
      if(key === 'name-position-above') {
        networkEditObject(objectSelected, { namePosition: 'above'})
      }
      if(key === 'name-position-none') {
        networkEditObject(objectSelected, { namePosition: null})
      }

      if(key === 'chooseSprite') {
        SpriteChooser.open(objectSelected)
      }
    }
  }

  render() {
    return <Menu onClick={this._handleSpriteMenuClick}>
      <MenuItem key="chooseSprite">Select Default Sprite</MenuItem>
      <MenuItem key="chooseSprite">Select Left Sprite</MenuItem>
      <MenuItem key="chooseSprite">Select Right Sprite</MenuItem>
      <MenuItem key="chooseSprite">Select Up Sprite</MenuItem>
      <MenuItem key="chooseSprite">Select Down Sprite</MenuItem>
    </Menu>
  }
}
