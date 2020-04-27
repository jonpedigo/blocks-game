import React from 'react'
import ReactDOM from 'react-dom'
import Menu, { SubMenu, MenuItem } from 'rc-menu';

class contextMenuEl extends React.Component{
  constructor(props) {
    super(props)

    window.document.getElementById('game-canvas').addEventListener("contextmenu", e => {
      e.preventDefault();
      const origin = {
        left: e.pageX,
        top: e.pageY
      };
      this.setContextMenuPosition(origin);
      return false;
    });

    window.addEventListener("click", e => {
      this.toggleContextMenu("hide");
    });

    this.state = {
      hide: true
    }
  }

  setContextMenuPosition({ top, left }) {
    const { editor } = this.props;

    editor.contextMenu.style.left = `${left}px`;
    editor.contextMenu.style.top = `${top}px`;
    this.toggleContextMenu('show');
  };

  toggleContextMenu(command) {
    const { editor } = this.props;

    if(command === "show") {
      this.setState({ hide: false })
    } else {
      this.setState({ hide: true })
    }

    // editor.contextMenu.style.display = command === "show" ? "block" : "none";
  };

  render() {
    const { editor } = this.props;

    if(this.state.hide || !editor.gridHighlight.id) {
      editor.contextMenuVisible = false
      return null
    }

    editor.contextMenuVisible = true
    return <Menu>
      <MenuItem>1</MenuItem>
      <SubMenu title="2">
        <MenuItem>2-1</MenuItem>
      </SubMenu>
    </Menu>
  }
}

function init(editor, options) {
  // CONTEXT MENU
  editor.contextMenu = document.getElementById('context-menu')

  // Mount React App
  ReactDOM.render(
    React.createElement(contextMenuEl, { editor }),
    editor.contextMenu
  )

  editor.contextMenuVisible = false;
}

export default {
  init
}
