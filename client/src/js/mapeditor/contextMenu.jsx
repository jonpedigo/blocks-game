import React from 'react'
import ReactDOM from 'react-dom'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import { SwatchesPicker } from 'react-color';
import HeroContextMenu from './adminMenus/heroContextMenu.jsx';
import ObjectContextMenu from './adminMenus/objectContextMenu.jsx';
import EditingObjectContextMenu from './adminMenus/EditingObjectContextMenu.jsx';
import EditingSequenceContextMenu from './adminMenus/EditingSequenceContextMenu.jsx';
import WorldContextMenu from './adminMenus/worldContextMenu.jsx';
import GeneratedMenu from './playerMenus/generatedMenu.jsx';
import '../libraries/playerMenuLibrary.js';

import modals from './modals.js';

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

      if(!PAGE.showEditorTools()) {
        return null
      }

      if(!MAPEDITOR.paused) {
        e.preventDefault();
        const { x, y } = window.convertToGameXY(e)
        const origin = {
          left: x,
          top: y
        };
        this._setContextMenuPosition(origin);
        return false;
      }
    });

    // window.addEventListener("click", e => {
    //   if(e.target.className.indexOf('dont-close-menu') >= 0) {
    //   } else {
    //     this._toggleContextMenu("hide");
    //   }
    // });

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

    this._selectSubObject = (subObject, name) => {
      MAPEDITOR.objectHighlighted = subObject
      this.setState({
        subObjectSelected: subObject,
        subObjectSelectedName: name,
      })
    }
  }

  _toggleContextMenu = (command) => {
    if(command === "show") {
      this.setState({ hide: false, objectSelected: MAPEDITOR.objectHighlighted })
    } else {
      this.setState({ hide: true, subObjectSelected: {}, subObjectSelectedName: null })
    }
  }

  _setContextMenuPosition = ({ top, left }) => {
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

    console.log(top, left, MAPEDITOR.contextMenu)
    this._toggleContextMenu('show')
  }

  _renderPlayerMenus() {
    const { objectSelected, subObjectSelected, subObjectSelectedName } = this.state;

    MAPEDITOR.contextMenuVisible = true

    const hero = GAME.heros[HERO.id]
    return <GeneratedMenu
      objectSelected={objectSelected}
      openColorPicker={this.openColorPicker}
      selectSubObject={this._selectSubObject}
      heroMenuItems={hero.heroMenu}
      objectMenuItems={hero.objectMenu}
      worldMenuItems={hero.worldMenu}
    />
  }

  _renderAdminMenus() {
    const { objectSelected, subObjectSelected, subObjectSelectedName } = this.state;
    const { networkEditObject } = MAPEDITOR

    MAPEDITOR.contextMenuVisible = true

    if(BELOWMANAGER.editingSequenceItemId) {
      return <EditingSequenceContextMenu
        objectSelected={objectSelected}
      />
    }

    const showEditingObjectMenu = OBJECTS.editingId && objectSelected.id && OBJECTS.editingId !== objectSelected.id
    if(showEditingObjectMenu) {
      const objectEditing = OBJECTS.getObjectOrHeroById(OBJECTS.editingId)
      if(objectEditing) {
        return <EditingObjectContextMenu
          objectEditing={objectEditing}
          objectSelected={objectSelected}
          selectSubObject={this._selectSubObject}
        />
      } else {
        OBJECTS.editingId = null
      }
    }

    if(subObjectSelected && subObjectSelectedName) {
      if(showEditingObjectMenu) {
        const objectEditing = OBJECTS.getObjectOrHeroById(OBJECTS.editingId)
        if(objectEditing) {
          return <EditingObjectContextMenu
            objectEditing={objectEditing}
            objectSelected={subObjectSelected}
            openColorPicker={this.openColorPicker}
            selectSubObject={this._selectSubObject}
          />
        } else {
          OBJECTS.editingId = null
        }
      }
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
      return <WorldContextMenu
        objectSelected={objectSelected}
        openColorPicker={this.openColorPicker}
        selectSubObject={this._selectSubObject}
      />
    }

    return <ObjectContextMenu
      objectSelected={objectSelected}
      openColorPicker={this.openColorPicker}
      selectSubObject={this._selectSubObject}
    />
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

    if(PAGE.role.isAdmin) {
      return this._renderAdminMenus()
    } else {
      return this._renderPlayerMenus()
    }
  }
}

export default {
  init
}
