import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class GameTagMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleGameTagMenuClick = ({ key }) => {
      const { objectSelected } = this.props

      if(key === 'create-game-tag') {
        modals.addGameTag()
        return
      }

      window.socket.emit('editObjects', [{id: objectSelected.id, tags: { [key]: !objectSelected.tags[key] }}])
    }
  }

  _renderGameTagMenu() {
    const { objectSelected } = this.props

    const tagList = Object.keys(GAME.tags)
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
