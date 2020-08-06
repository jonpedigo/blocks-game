import React from 'react'
import ReactDOM from 'react-dom'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import modals from '../modals.js'

export default class WorldContextMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleMapMenuClick = ({ key }) => {
      const { objectSelected } = this.state

      if(key === 'create-object') {
        OBJECTS.create({...objectSelected, tags: {obstacle: true}})
      }

      if(key === 'toggle-pause-game') {
        window.socket.emit('editGameState', { paused: !GAME.gameState.paused })
      }

      if(key === 'toggle-start-game') {
        if(GAME.gameState.started) {
          window.socket.emit('stopGame')
        } else {
          window.socket.emit('startGame')
        }
      }

      if(key === 'set-world-respawn-point') {
        window.socket.emit('updateWorld', {worldSpawnPointX: objectSelected.x, worldSpawnPointY:  objectSelected.y})
      }

      if(key === 'select-world-background-color') {
        this.openColorPicker('worldBackground')
      }
      if(key === 'select-default-object-color') {
        this.openColorPicker('defaultObject')
      }

      if(key === 'open-sequence-editor') {
        WORLDMANAGER.open('sequence')
      }

      if(key === 'download-game-JSON')  {
        let saveGame = GAME.cleanForSave(GAME)
        console.log(saveGame)
        PAGE.downloadObjectAsJson(saveGame, GAME.id)
      }
    }
  }

  _renderAdvancedWorldMenu() {
    const { objectSelected } = this.props

    return <SubMenu title="Advanced">
      <MenuItem key='download-game-JSON'>Download Game JSON</MenuItem>
      <MenuItem key='open-sequence-editor'>Open Sequence Editor</MenuItem>
    </SubMenu>
  }

  render() {
    return <Menu onClick={this._handleMapMenuClick}>
      <MenuItem key='create-object'>Create object</MenuItem>
      <MenuItem key='set-world-respawn-point'>Set as world respawn point</MenuItem>
      <MenuItem className='dont-close-menu' key='select-world-background-color'>Set world background color</MenuItem>
      <MenuItem className='dont-close-menu' key='select-default-object-color'>Set default object color</MenuItem>
      <MenuItem key='toggle-start-game'>{ GAME.gameState.started ? 'Stop Game' : 'Start Game' }</MenuItem>
    </Menu>
  }
}
