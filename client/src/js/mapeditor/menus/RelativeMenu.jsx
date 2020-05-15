import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class Relative extends React.Component{
  constructor(props) {
    super(props)

    this._handleRelativeClick = ({ key }) => {
      const { objectSelected } = this.props
      const { startRelativeDrag } = MAPEDITOR

      if(key === 'position') {
        startRelativeDrag(objectSelected)
      }
      if(key === 'position-grid') {
        startRelativeDrag(objectSelected, { snapToGrid: true })
      }
    }
  }

  render() {
    return <Menu onClick={this._handleRelativeClick}>
      <MenuItem key="position">Position</MenuItem>
      <MenuItem key="position-grid">Position Grid</MenuItem>
    </Menu>
  }
}
