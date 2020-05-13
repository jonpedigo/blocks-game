import React from 'react'
import ReactDOM from 'react-dom'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import { SwatchesPicker } from 'react-color';
import HeroContextMenu from './heroContextMenu.jsx';
import TagMenu from './tagMenu.jsx';
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

    props.editor.canvas.addEventListener("contextmenu", e => {
      e.preventDefault();
      const origin = {
        left: e.pageX,
        top: e.pageY
      };
      this._setContextMenuPosition(origin);
      return false;
    });

    window.addEventListener("click", e => {
      if(e.target.innerText === 'Color Picker' || e.target.innerText === 'Set world background color') {

      } else {
        this._toggleContextMenu("hide");
      }
    });

    this.state = {
      hide: true
    }

    this.openColorPicker = () => {
      this.setState({ isColoring: true })
    }

    this._handleObjectMenuClick = ({ key }) => {
      const { editor, onStartResize, onStartDrag, onDelete, onCopy, onStartSetPathfindingLimit } = this.props;
      const { objectHighlighted } = editor

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

      if(key === "add-dialogue") {
        if(!objectHighlighted.heroDialogue) {
          objectHighlighted.heroDialogue = []
        }
        objectHighlighted.heroDialogue.push('')
        modals.writeDialogue(objectHighlighted, objectHighlighted.heroDialogue.length-1)
      }

      if(key.indexOf("remove-dialogue") === 0) {
        let dialogueIndex = key[key.length-1]
        objectHighlighted.heroDialogue.splice(dialogueIndex, 1)
        window.socket.emit('editObjects', [{id: objectHighlighted.id, heroUpdate: objectHighlighted.heroUpdate}])
      }

      if(key.indexOf("edit-dialogue") === 0) {
        let dialogueIndex = key[key.length-1]
        modals.writeDialogue(objectHighlighted, dialogueIndex)
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

      if(key === 'remove') {
        window.socket.emit('removeObject', objectHighlighted)
      }

      if(key === 'copy') {
        onCopy(objectHighlighted)
      }

      if(key === 'select-color') {
        this.openColorPicker()
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

      if(key === 'copy-id') {
        PAGE.copyToClipBoard(objectHighlighted.id)
      }

      if(key === 'enter-quest-giver-id') {
        modals.editProperty(objectHighlighted, 'questGivingId', objectHighlighted.questGivingId || '')
      }
    }

    this._handleMapMenuClick = ({ key }) => {
      const { editor } = this.props;
      const { objectHighlighted } = editor

      if(key === 'create-object') {
        OBJECTS.create({...objectHighlighted, tags: {obstacle: true}})
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
        window.socket.emit('updateWorld', {worldSpawnPointX: objectHighlighted.x, worldSpawnPointY:  objectHighlighted.y})
      }

      if(key === 'select-color') {
        this.openColorPicker()
      }
    }
  }

  _toggleContextMenu(command) {
    if(command === "show") {
      this.setState({ hide: false })
    } else {
      this.setState({ hide: true })
    }
  }

  _setContextMenuPosition({ top, left }) {
    const { editor } = this.props
    editor.contextMenu.style.left = `${left}px`
    editor.contextMenu.style.top = `${top}px`
    this._toggleContextMenu('show')
  }

  _renderObjectQuestMenu() {
    const { editor } = this.props
    const { objectHighlighted } = editor
    const { questGiver, questCompleter } = objectHighlighted.tags

    const list = []

    if(questGiver) {
      list.push(<MenuItem key="enter-quest-giver-id">Enter giving quest name</MenuItem>)
    }

    if(questCompleter) {
      list.push(<MenuItem key="enter-quest-completer-id">Enter completing quest name</MenuItem>)
    }

    if(list.length) {
      return <SubMenu title="Quests">{list}</SubMenu>
    } else {
      return null
    }
  }

  render() {
    const { hide, isColoring } = this.state;
    const { editor } = this.props;
    const { objectHighlighted } = editor

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
          if(!objectHighlighted.id) {
            window.socket.emit('updateWorld', {backgroundColor: color.hex})
          } else if(objectHighlighted.tags.hero) {
            window.socket.emit('editHero', {id: objectHighlighted.id, color: color.hex})
          } else {
            window.socket.emit('editObjects', [{id: objectHighlighted.id, color: color.hex}])
          }
        }}
      />
    }

    editor.contextMenuVisible = true

    if(objectHighlighted.tags && objectHighlighted.tags.hero) {
      return <HeroContextMenu editor={editor} onStartResize={this.props.onStartResize} onStartDrag={this.props.onStartDrag} onDelete={this.props.onDelete} openColorPicker={this.openColorPicker}/>
    }

    if(!objectHighlighted.id) {
      return <Menu onClick={this._handleMapMenuClick}>
        <MenuItem key='create-object'>Create object</MenuItem>
        <MenuItem key='set-world-respawn-point'>Set as world respawn point</MenuItem>
        <MenuItem key='select-color'>Set world background color</MenuItem>
        <MenuItem key='toggle-pause-game'>{ GAME.gameState.paused ? 'Unpause game' : 'Pause game' }</MenuItem>
        <MenuItem key='toggle-start-game'>{ GAME.gameState.started ? 'Stop Game' : 'Start Game' }</MenuItem>
      </Menu>
    }

    return <Menu onClick={this._handleObjectMenuClick}>
      <MenuItem key="drag">Drag</MenuItem>
      <MenuItem key="resize">Resize</MenuItem>
      <MenuItem key="copy">Copy</MenuItem>
      <SubMenu title="Dialogue">
        <MenuItem key="add-dialogue">Add Dialogue</MenuItem>
        {objectHighlighted.heroDialogue && objectHighlighted.heroDialogue.map((dialogue, i) => {
          return <MenuItem key={"edit-dialogue-"+i}>{'Edit Dialogue ' + (i+1)}</MenuItem>
        })}
        {objectHighlighted.heroDialogue && objectHighlighted.heroDialogue.map((dialogue, i) => {
          return <MenuItem key={"remove-dialogue-"+i}>{'Remove Dialogue ' + (i+1)}</MenuItem>
        })}
      </SubMenu>
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
      {this._renderObjectQuestMenu()}
      <SubMenu title="Advanced">
        <SubMenu title="Tags">
          <TagMenu objectHighlighted={objectHighlighted}></TagMenu>
        </SubMenu>
        <MenuItem key="set-pathfinding-limit">Set pathfinding area</MenuItem>
        <MenuItem key="set-parent">Set parent</MenuItem>
        <MenuItem key="set-relative">Set relative</MenuItem>
        {objectHighlighted.tags.invisible ? <MenuItem key="toggle-visible">Make visible</MenuItem> : <MenuItem key="toggle-invisible">Make invisible</MenuItem> }
        <MenuItem key="copy-id">Copy id to clipboard</MenuItem>
        <MenuItem key="add-compendium">Add To Compendium</MenuItem>
        <MenuItem key="edit-properties-json">Edit Properties JSON</MenuItem>
        <MenuItem key="edit-state-json">Edit State JSON</MenuItem>
      </SubMenu>
      { GAME.gameState.started ? <MenuItem key="remove">Remove</MenuItem> : <MenuItem key="delete">Delete</MenuItem> }
    </Menu>
  }
}

export default {
  init
}
