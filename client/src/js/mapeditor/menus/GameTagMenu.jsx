import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class GameTagMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleGameTagMenuClick = ({ key }) => {
      const { objectSelected } = this.props
      const { networkEditObject } = MAPEDITOR

      if(key === 'create-game-tag') {
        modals.addGameTag()
        return
      }

      networkEditObject(objectSelected, {tags: { [key]: !objectSelected.tags[key] }})
    }
  }

  _renderGameTagMenu() {
    const { objectSelected } = this.props

    const tagList = Object.keys(GAME.library.tags)
    return tagList.map((tag) => {
      if(objectSelected.tags && objectSelected.tags[tag]) {
        return <MenuItem key={tag}>{tag}<i style={{marginLeft:'6px'}} className="fas fa-check"></i></MenuItem>
      } else {
        return <MenuItem key={tag}>{tag}</MenuItem>
      }
    })
  }

  render() {
    return <Menu onClick={this._handleGameTagMenuClick}>
      <MenuItem key="create-game-tag">Create new group</MenuItem>
      {this._renderGameTagMenu()}
    </Menu>
  }
}
