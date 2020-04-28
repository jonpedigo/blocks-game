import React from 'react'
import ReactDOM from 'react-dom'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import modals from './modals.js'

function init(editor, props) {
  editor.contextMenu = document.getElementById('context-menu')

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
      const { editor, onResize, onDrag } = this.props;

      if(key === 'add-object') {
        window.addObjects(editor.objectHighlighted)
      }

      if(key === "name-object") {
        modals.nameObject(editor.objectHighlighted)
      }

      if(key === "write-dialogue") {
        modals.writeDialogue(editor.objectHighlighted)
      }

      if(key === 'resize') {
        onResize(editor.objectHighlighted)
      }

      if(key === 'drag') {
        onDrag(editor.objectHighlighted)
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
    const { editor } = this.props;

    if(this.state.hide) {
      editor.contextMenuVisible = false
      return null
    }

    editor.contextMenuVisible = true
    if(!editor.objectHighlighted.id) {
      return <Menu onClick={this._handleClick}>
        <MenuItem key='add-object'>Add</MenuItem>
      </Menu>
    }

    return <Menu onClick={this._handleClick}>
      <MenuItem key="drag">Drag</MenuItem>
      <MenuItem key="resize">Resize</MenuItem>
      <MenuItem key="delete">Delete</MenuItem>
      <MenuItem key="copy">Copy</MenuItem>
      <MenuItem key="color">Select Color</MenuItem>
      <MenuItem key="write-dialogue">Dialogue</MenuItem>
      <SubMenu title="Name">
        <MenuItem key="name-object">Give Name</MenuItem>
        <MenuItem key="name-position-center">Position Name in Center</MenuItem>
        <MenuItem key="name-position-above">Position Name above</MenuItem>
      </SubMenu>
    </Menu>
  }
}

export default {
  init
}
