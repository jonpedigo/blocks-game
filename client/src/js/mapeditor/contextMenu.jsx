import React from 'react'
import ReactDOM from 'react-dom'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import modals from './modals.js'
import { SwatchesPicker } from 'react-color';

function init(editor, props) {
  editor.contextMenu = document.getElementById('context-menu')
  editor.contextMenuVisible = false

  // Mount React App
  ReactDOM.render(
    React.createElement(contextMenuEl, { editor, ...props, ref: ref => editor.contextMenuRef = ref }),
    editor.contextMenu
  )
}

class contextMenuEl extends React.Component{
  constructor(props) {
    super(props)

    window.document.getElementById('game-canvas').addEventListener("contextmenu", e => {
      e.preventDefault();
      const origin = {
        left: e.pageX,
        top: e.pageY
      };
      this._setContextMenuPosition(origin);
      return false;
    });

    window.addEventListener("click", e => {
      if(e.target.innerText !== 'Color Picker') {
        this._toggleContextMenu("hide");
      }
    });

    this.state = {
      hide: true
    }

    this._handleClick = ({ key }) => {
      const { editor, onStartResize, onStartDrag, onDelete, onCopy, onStartSetPathfindingLimit } = this.props;
      const { objectHighlighted, recievedObject, copiedObject } = editor

      if(key === 'create-object') {
        window.addObjects(objectHighlighted)
      }

      if(key === "name-object") {
        modals.nameObject(objectHighlighted)
      }
      if(key === 'name-position-center') {
        window.socket.emit('editObjects', [{id: objectHighlighted.id, namePosition: 'center'}])
      }
      if(key === 'name-position-above') {
        window.socket.emit('editObjects', [{id: objectHighlighted.id, namePosition: 'above'}])
      }
      if(key === 'name-position-none') {
        window.socket.emit('editObjects', [{id: objectHighlighted.id, namePosition: null}])
      }

      if(key === 'trigger-collision') {
        window.socket.emit('editObjects', [{id: objectHighlighted.id, tags: { requireActionButton: false }}])
      }
      if(key === 'trigger-interact') {
        window.socket.emit('editObjects', [{id: objectHighlighted.id, tags: { requireActionButton: true }}])
      }

      if(key === "write-dialogue") {
        modals.writeDialogue(objectHighlighted)
      }

      if(key === 'resize') {
        onStartResize(objectHighlighted)
      }

      if(key === 'drag') {
        onStartDrag(objectHighlighted)
      }

      if(key === 'delete') {
        onDelete(objectHighlighted)
      }

      if(key === 'copy') {
        onCopy(objectHighlighted)
      }

      if(key === 'select-color') {
        this.setState({ isColoring: true })
      }

      if(key === 'toggle-filled') {
        window.socket.emit('editObjects', [{id: objectHighlighted.id, tags: { filled: !objectHighlighted.tags.filled }}])
      }

      if(key === 'toggle-visible') {
        window.socket.emit('editObjects', [{id: objectHighlighted.id, tags: { invisible: false, obstacle: true }}])
      }
      if(key === 'toggle-invisible') {
        window.socket.emit('editObjects', [{id: objectHighlighted.id, tags: { invisible: true, obstacle: false }}])
      }


      if(key === 'set-pathfinding-limit') {
        onStartSetPathfindingLimit(objectHighlighted)
      }

      if(key === 'toggle-pause-game') {
        window.socket.emit('editGameState', { paused: !GAME.gameState.paused })
      }

      if(key === 'copy-id') {
        window.copyToClipBoard(objectHighlighted.id)
      }
    }
  }

  _toggleContextMenu(command) {
    if(command === "show") {
      this.setState({ hide: false })
    } else {
      this.setState({ hide: true })
    }
  };

  _setContextMenuPosition({ top, left }) {
    const { editor } = this.props;
    editor.contextMenu.style.left = `${left}px`;
    editor.contextMenu.style.top = `${top}px`;
    this._toggleContextMenu('show');
  };

  render() {
    const { hide, isColoring, chosenColor } = this.state;
    const { editor } = this.props;
    const { objectHighlighted, recievedObject, copiedObject } = editor

    if(hide) {
      editor.contextMenuVisible = false
      return null
    }

    if(isColoring) {
      return <SwatchesPicker
        color={ objectHighlighted.color }
        onChange={ (color) => {
          this.setState({
            isColoring: false,
          })
          objectHighlighted.color = color.hex
          window.socket.emit('editObjects', [{id: objectHighlighted.id, color: color.hex}])
        }}
      />
    }

    editor.contextMenuVisible = true
    if(!objectHighlighted.id) {
      return <Menu onClick={this._handleClick}>
        <MenuItem key='create-object'>Create object</MenuItem>
        { recievedObject && <MenuItem key='add-recieved-object'>Add recieved object</MenuItem> }
        <MenuItem key='toggle-pause-game'>{ GAME.gameState.paused ? 'Unpause game' : 'Pause game' }</MenuItem>
      </Menu>
    }

    return <Menu onClick={this._handleClick}>
      <MenuItem key="drag">Drag</MenuItem>
      <MenuItem key="resize">Resize</MenuItem>
      <MenuItem key="delete">Delete</MenuItem>
      <MenuItem key="copy">Copy</MenuItem>
      <MenuItem key="write-dialogue">Dialogue</MenuItem>
      <SubMenu title="Color">
        <MenuItem key="select-color">Color Picker</MenuItem>
        <MenuItem key="toggle-filled">{ objectHighlighted.tags.filled ? 'On border only' : "Fill object" }</MenuItem>
      </SubMenu>
      <SubMenu title="Name">
        <MenuItem key="name-object">Give Name</MenuItem>
        <MenuItem key="name-position-center">Position Name in Center</MenuItem>
        <MenuItem key="name-position-above">Position Name above</MenuItem>
        <MenuItem key="name-position-none">Dont show name on map</MenuItem>
      </SubMenu>
      <SubMenu title="Advanced">
        <MenuItem key="set-pathfinding-limit">Set pathfinding area</MenuItem>
        <MenuItem key="set-parent">Set parent</MenuItem>
        <MenuItem key="set-relative">Set relative</MenuItem>
        {objectHighlighted.tags.invisible ? <MenuItem key="toggle-visible">Make visible</MenuItem> : <MenuItem key="toggle-invisible">Make invisible</MenuItem> }
        <MenuItem key="copy-id">Copy id to clipboard</MenuItem>
        <SubMenu title="Hero Update">
          <MenuItem key="trigger-collision">When collided</MenuItem>
          <MenuItem key="trigger-interact">When X is pressed</MenuItem>
        </SubMenu>
      </SubMenu>
    </Menu>
  }
}

export default {
  init
}
