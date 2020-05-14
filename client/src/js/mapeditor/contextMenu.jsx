import React from 'react'
import ReactDOM from 'react-dom'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import { SwatchesPicker } from 'react-color';
import HeroContextMenu from './heroContextMenu.jsx';
import ObjectContextMenu from './objectContextMenu.jsx';
import modals from './modals.js'

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

    MAPEDITOR.canvas.addEventListener("contextmenu", e => {
      e.preventDefault();
      const origin = {
        left: e.pageX,
        top: e.pageY
      };
      this._setContextMenuPosition(origin);
      return false;
    });

    window.addEventListener("click", e => {
      if(e.target.innerText === 'Color Picker' || e.target.innerText === 'Set world background color' || e.target.className.indexOf('dont-close-menu') >= 0) {
      } else {
        this._toggleContextMenu("hide");
      }
    });

    this.state = {
      hide: true,
      objectSelected: {},
      subObjectSelected: {},
      subObjectSelectedName: null,
      isColoring: false,
    }

    this.openColorPicker = () => {
      this.setState({ isColoring: true })
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

      if(key === 'select-color') {
        this.openColorPicker()
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
    MAPEDITOR.contextMenu.style.left = `${left}px`
    MAPEDITOR.contextMenu.style.top = `${top}px`
    this._toggleContextMenu('show')
  }

  render() {
    const { hide, isColoring, objectSelected, subObjectSelected, subObjectSelectedName } = this.state;

    if(hide) {
      MAPEDITOR.contextMenuVisible = false
      return null
    }

    // turn this into a modal?
    if(isColoring) {
      return <SwatchesPicker
        color={ objectSelected.color }
        onChange={ (color) => {
          this.setState({
            isColoring: false,
          })
          objectSelected.color = color.hex
          if(!objectSelected.id) {
            window.socket.emit('updateWorld', {backgroundColor: color.hex})
          } else if(objectSelected.tags.hero) {
            window.socket.emit('editHero', {id: objectSelected.id, color: color.hex})
          } else {
            window.socket.emit('editObjects', [{id: objectSelected.id, color: color.hex}])
          }
        }}
      />
    }

    MAPEDITOR.contextMenuVisible = true

    if(subObjectSelected && subObjectSelectedName) {
      return <ObjectContextMenu
        objectName={subObjectSelectedName}
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
        <MenuItem key='select-color'>Set world background color</MenuItem>
        <MenuItem key='toggle-pause-game'>{ GAME.gameState.paused ? 'Unpause game' : 'Pause game' }</MenuItem>
        <MenuItem key='toggle-start-game'>{ GAME.gameState.started ? 'Stop Game' : 'Start Game' }</MenuItem>
      </Menu>
    }

    return <ObjectContextMenu
      objectName={objectSelected.name}
      objectSelected={objectSelected}
      openColorPicker={this.openColorPicker}
      selectSubObject={this._selectSubObject}
    />
  }
}

export default {
  init
}
