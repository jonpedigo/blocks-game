import React from 'react'
import ReactDOM from 'react-dom'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import modals from './modals.js'

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
      this._toggleContextMenu("hide");
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

      if(key === 'set-pathfinding-limit') {
        onStartSetPathfindingLimit(objectHighlighted)
      }

      if(key === 'toggle-pause-game') {
        window.socket.emit('editGameState', { paused: !game.gameState.paused })
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
    const { hide } = this.state;
    const { editor } = this.props;
    const { objectHighlighted, recievedObject, copiedObject } = editor

    if(hide) {
      editor.contextMenuVisible = false
      return null
    }

    editor.contextMenuVisible = true
    if(!objectHighlighted.id) {
      return <Menu onClick={this._handleClick}>
        <MenuItem key='create-object'>Create object</MenuItem>
        { recievedObject && <MenuItem key='add-recieved-object'>Add recieved object</MenuItem> }
        <MenuItem key='toggle-pause-game'>{ game.gameState.paused ? 'Unpause game' : 'Pause game' }</MenuItem>
      </Menu>
    }

    return <Menu onClick={this._handleClick}>
      <MenuItem key="drag">Drag</MenuItem>
      <MenuItem key="resize">Resize</MenuItem>
      <MenuItem key="delete">Delete</MenuItem>
      <MenuItem key="copy">Copy</MenuItem>
      <MenuItem key="color">Select Color</MenuItem>
      <MenuItem key="write-dialogue">Dialogue</MenuItem>
      <SubMenu title="Trigger">
        <MenuItem key="trigger-collision">When collided</MenuItem>
        <MenuItem key="trigger-interact">When X is pressed</MenuItem>
        <MenuItem key="trigger-chain">When selected object is triggered</MenuItem>
      </SubMenu>
      <SubMenu title="Name">
        <MenuItem key="name-object">Give Name</MenuItem>
        <MenuItem key="name-position-center">Position Name in Center</MenuItem>
        <MenuItem key="name-position-above">Position Name above</MenuItem>
      </SubMenu>
      <SubMenu title="Advanced">
        <MenuItem key="set-pathfinding-limit">Set exploration area</MenuItem>
        <MenuItem key="set-parent">Set parent</MenuItem>
        <MenuItem key="set-relative">Set relative</MenuItem>
      </SubMenu>
    </Menu>
  }
}

export default {
  init
}
