import React from 'react'
import ReactDOM from 'react-dom'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import { SwatchesPicker } from 'react-color';
import HeroContextMenu from './heroContextMenu.jsx';
import ObjectContextMenu from './objectContextMenu.jsx';
import modals from '../modals.js'

function init(editor, props) {
  MAPEDITOR.contextMenu = document.getElementById('context-menu')
  MAPEDITOR.contextMenuVisible = false

  // Mount React App
  ReactDOM.render(
    React.createElement(contextMenuEl, { editor, ...props, ref: ref => MAPEDITOR.contextMenuRef = ref }),
    MAPEDITOR.contextMenu
  )
}

class contextMenuEl extends React.Component{
  constructor(props) {
    super(props)

    document.body.addEventListener("contextmenu", e => {
      if(!window.isClickingMap(e.target.className)) return
      if(!MAPEDITOR.paused) {
        e.preventDefault();
        const origin = {
          left: e.pageX,
          top: e.pageY
        };
        this._setContextMenuPosition(origin);
        return false;
      }
    });

    window.addEventListener("click", e => {
      if(e.target.className.indexOf('dont-close-menu') >= 0) {
      } else {
        this._toggleContextMenu("hide");
      }
    });

    this.state = {
      hide: true,
      objectSelected: {},
      subObjectSelected: {},
      subObjectSelectedName: null,
      coloringObject: null,
    }

    this.openColorPicker = (coloringObject) => {
      this.setState({ coloringObject  })
    }

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
        SEQUENCEEDITOR.open()
      }

      if(key === 'download-game-JSON')  {
        let saveGame = GAME.cleanForSave(GAME)
        console.log(saveGame)
        PAGE.downloadObjectAsJson(saveGame, GAME.id)
      }
    }

    this._handleGameTagMenuClick = ({key}) => {
      const { objectSelected } = this.state

      if(key === 'create-game-tag') {
        modals.addGameTag()
        return
      }

      window.socket.emit('editObjects', [{id: objectSelected.id, tags: { [key]: !objectSelected.tags[key] }}])
    }

    this._selectSubObject = (subObject, name) => {
      MAPEDITOR.objectHighlighted = subObject
      this.setState({
        subObjectSelected: subObject,
        subObjectSelectedName: name,
      })
    }
  }

  _toggleContextMenu(command) {
    if(command === "show") {
      this.setState({ hide: false, objectSelected: MAPEDITOR.objectHighlighted })
    } else {
      this.setState({ hide: true, subObjectSelected: {}, subObjectSelectedName: null })
    }
  }

  _setContextMenuPosition({ top, left }) {
    // THIS ADJUSTS THE SIZE OF THE CONTEXT MENU IF ITS TOO CLOSE TO THE EDGES
    if(MAPEDITOR.objectHighlighted.id) {
      const heightDesired = 350
      const widthDesired = 450

      const bottomDistance = window.innerHeight - top
      const rightDistance = window.innerWidth - left

      if(bottomDistance < heightDesired) {
        top = window.innerHeight - heightDesired
      }

      if(rightDistance < widthDesired) {
        left = window.innerWidth - widthDesired
      }
    }

    MAPEDITOR.contextMenu.style.left = `${left}px`
    MAPEDITOR.contextMenu.style.top = `${top}px`

    this._toggleContextMenu('show')
  }


  _renderAdvancedWorldMenu() {
    const { objectSelected } = this.props

    return <SubMenu title="Advanced">
      <MenuItem key='download-game-JSON'>Download Game JSON</MenuItem>
      <MenuItem key='open-sequence-editor'>Open Sequence Editor</MenuItem>
    </SubMenu>
  }

  render() {
    const { hide, coloringObject, objectSelected, subObjectSelected, subObjectSelectedName } = this.state;
    const { networkEditObject } = MAPEDITOR

    if(hide) {
      MAPEDITOR.contextMenuVisible = false
      return null
    }

    if(coloringObject) {
      return <SwatchesPicker
        color={ coloringObject.color }
        onChange={ (color) => {
          if(coloringObject == 'worldBackground') {
            window.socket.emit('updateWorld', {backgroundColor: color.hex})
          } else if(coloringObject == 'defaultObject') {
            window.socket.emit('updateWorld', {defaultObjectColor: color.hex})
          } else {
            coloringObject.tags.outline = false
            networkEditObject(coloringObject, {color: color.hex})
          }
          this.setState({
            coloringObject: null,
          })
        }}
      />
    }

    // if(GAME.gameState.started && !PAGE.role.isAdmin) {
    //   return <Menu onClick={this._handleMapMenuClick}>
    //     <MenuItem key='toggle-pause-game'>{ GAME.gameState.paused ? 'Unpause game' : 'Pause game' }</MenuItem>
    //     <MenuItem key='toggle-start-game'>{ GAME.gameState.started ? 'Stop Game' : 'Start Game' }</MenuItem>
    //   </Menu>
    // }

    MAPEDITOR.contextMenuVisible = true

    if(subObjectSelected && subObjectSelectedName) {
      return <ObjectContextMenu
        objectSelected={subObjectSelected}
        openColorPicker={this.openColorPicker}
        selectSubObject={this._selectSubObject}
        subObject
        />
    }

    if(objectSelected.tags && objectSelected.tags.hero) {
      return <HeroContextMenu
        objectSelected={objectSelected}
        openColorPicker={this.openColorPicker}
        selectSubObject={this._selectSubObject}
      />
    }

    if(!objectSelected.id) {
      return <Menu onClick={this._handleMapMenuClick}>
        <MenuItem key='create-object'>Create object</MenuItem>
        <MenuItem key='set-world-respawn-point'>Set as world respawn point</MenuItem>
        <MenuItem className='dont-close-menu' key='select-world-background-color'>Set world background color</MenuItem>
        <MenuItem className='dont-close-menu' key='select-default-object-color'>Set default object color</MenuItem>
        <MenuItem key='toggle-start-game'>{ GAME.gameState.started ? 'Stop Game' : 'Start Game' }</MenuItem>
        {this._renderAdvancedWorldMenu()}
      </Menu>
    }

    return <ObjectContextMenu
      objectSelected={objectSelected}
      openColorPicker={this.openColorPicker}
      selectSubObject={this._selectSubObject}
    />
  }
}

export default {
  init
}
