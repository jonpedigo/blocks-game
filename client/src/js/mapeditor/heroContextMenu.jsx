import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import modals from './modals.js'

export default class HeroContextMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleHeroMenuClick = ({ key }) => {
      const { editor, onStartResize, onStartDrag, onDelete, onColor } = this.props;
      const { objectHighlighted } = editor

      if(key === 'resize') {
        onStartResize(objectHighlighted)
      }

      if(key === 'drag') {
        onStartDrag(objectHighlighted)
      }

      if(key === 'delete') {
        onDelete(objectHighlighted)
      }

      if(key === 'select-color') {
        onColor()
      }

      if(key === 'toggle-filled') {
        window.socket.emit('editHero', {id: objectHighlighted.id, tags: { filled: !objectHighlighted.tags.filled }})
      }

      if(key === 'toggle-visible') {
        window.socket.emit('editHero', {id: objectHighlighted.id, tags: { invisible: false }})
      }
      if(key === 'toggle-invisible') {
        window.socket.emit('editHero', {id: objectHighlighted.id, tags: { invisible: true }})
      }

      if(key === 'copy-id') {
        PAGE.copyToClipBoard(objectHighlighted.id)
      }
    }
  }

  render() {
    return <Menu onClick={this._handleHeroMenuClick}>
      <MenuItem key='drag'>Create object</MenuItem>
    </Menu>
  }
}
