import React from 'react'
import SpriteSheetEditor from './mediamanager/SpriteSheetEditor.jsx'
import SpriteSelector from './mediamanager/SpriteSelector.jsx'
import MediaManager from './mediamanager/MediaManager.jsx'
import GameManager from './gamemanager/GameManager.jsx'

import modals from '../mapeditor/modals'

export default class Root extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false,
      selectedMenu: null,
      selectedId: null,
      selectedManager: null,
      objectSelected: null,
    }

    this.selectedRef = React.createRef();
  }

  open({ objectSelected, selectedMenu, selectedId, selectedManager }) {
    this.setState({
      open: true,
      selectedManager,
      selectedMenu,
      selectedId,
      objectSelected,
    })
  }

  close = () => {
    this.setState({
      open: false,
      selectedMenu: null,
      selectedManager: null,
      selectedId: null,
      objectSelected: null,
    })
  }

  clearId = () => {
    this.setState({
      selectedId: null,
    })
  }

  openId = (id) => {
    this.setState({
      selectedId: id
    })
  }

  render() {
    const { open, selectedMenu, selectedId, selectedManager, objectSelected } = this.state

    if(!open) return null

    if(selectedManager === 'MediaManager') {
      return <MediaManager returnToList={this.clearId} openId={this.openId} selectedMenu={selectedMenu} selectedId={selectedId} objectSelected={objectSelected} closeManager={this.close}/>
    }

    if(selectedManager === 'GameManager') {
      return <GameManager returnToList={this.clearId} openId={this.openId} selectedMenu={selectedMenu} selectedId={selectedId} objectSelected={objectSelected} closeManager={this.close}/>
    }

    return null
  }
}
