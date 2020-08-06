import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import TagMenu from '../menus/tagMenu.jsx';
import ColorMenu from '../menus/ColorMenu.jsx';
import GameTagMenu from '../menus/GameTagMenu.jsx';
import DialogueMenu from '../menus/DialogueMenu.jsx';
import QuestMenu from '../menus/QuestMenu.jsx';
import SpawnZoneMenu from '../menus/SpawnZoneMenu.jsx';
import ResourceZoneMenu from '../menus/ResourceZoneMenu.jsx';
import NameMenu from '../menus/NameMenu.jsx';
import ObjectAdvancedMenu from '../menus/ObjectAdvancedMenu.jsx';
import SelectSubObjectMenu from '../menus/SelectSubObjectMenu.jsx';
import RelativeMenu from '../menus/RelativeMenu.jsx';
import TriggerMenu from '../menus/TriggerMenu.jsx';
import HookMenu from '../menus/HookMenu.jsx';
import LiveMenu from '../menus/LiveMenu.jsx';
import SpriteMenu from '../menus/SpriteMenu.jsx';
import modals from '../modals.js'

// NATE::
export default class GeneratedMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleMenuClick = ({ key }) => {
      const { startResize, onStartDrag, deleteObject, onCopy, removeObject } = MAPEDITOR

      //  NATE:: PUT TONS OF FUNCTIONS HERE AS THE LIBRARY
      if(key === 'resize') {
        if(subObject) {
          startResize(objectSelected, { snapToGrid: false })
        } else {
          startResize(objectSelected)
        }
      }

      if(key === 'resize-grid') {
        startResize(objectSelected, { snapToGrid: true })
      }

      if(key === 'drag') {
        onStartDrag(objectSelected)
      }

      if(key === 'delete') {
        deleteObject(objectSelected)
      }

      if(key === 'remove') {
        removeObject(objectSelected)
      }

      if(key === 'copy') {
        onCopy(objectSelected)
      }

      if(key === 'drop') {
        window.socket.emit('dropObject', objectSelected.ownerId, objectSelected.subObjectName)
      }
    }
  }

  // NATE::
  _generateContextMenuItems(library) {
    let objectMenuItems = []
    let heroMenuItems = []

    library.forEach((menuItem) => {
      if(menuItem.objectType === 'object') {
        objectMenuItems.push(menuItem)
      }
      if(menuItem.objectType === 'hero') {
        heroMenuItems.push(menuItem)
      }
    })

    // objectMenuItems = objectMenuItems.reduce(() => {
    //   // NATE:: here youll have to turn the data into the format that you want to use in generatedMenu.jsx
    //   // if theres a submenu mentioned youll need to create a sub array or something
    // })
    //
    // heroMenuItems = heroMenuItems.reduce(() => {
    //
    // })

    return {
      objectMenuItems,
      heroMenuItems
    }
  }

  render() {
    const { objectSelected, subObject, menuItemData } = this.props
    const { objectMenuItems, heroMenuItems } = this._generateContextMenuItems(menuItemData)

    if(objectSelected.tags && objectSelected.tags.hero) {
      return <Menu onClick={this._onHandleMenuClick}>
        {/* NATE:: use heroMenuItems to generate a menu */}
      </Menu>
    }

    return <Menu onClick={this._onHandleMenuClick}>
      {/* NATE:: use objectMenuItems to generate a menu */}
    </Menu>
  }
}
