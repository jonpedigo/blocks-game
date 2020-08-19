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
import { handleExtraMenuClicks } from './helper.js'
// NATE::
export default class GeneratedMenu extends React.Component {
  constructor(props) {
    super(props)

    this._handleMenuClick = ({ key }) => {
      const { startResize, onStartDrag, deleteObject, onCopy, removeObject } = MAPEDITOR
      const { objectSelected } = this.props;

      if (key === 'resize') {
        if (subObject) {
          startResize(objectSelected, { snapToGrid: false })
        } else {
          startResize(objectSelected)
        }
        return
      }

      if (key === 'resize-grid') {
        startResize(objectSelected, { snapToGrid: true })
        return
      }

      if (key === 'drag') {
        onStartDrag(objectSelected)
        return
      }

      if (key === 'delete') {
        deleteObject(objectSelected)
        return
      }

      if (key === 'remove') {
        removeObject(objectSelected)
        return
      }

      if (key === 'copy') {
        onCopy(objectSelected)
        return
      }

      if (key === 'drop') {
        window.socket.emit('dropObject', objectSelected.ownerId, objectSelected.subObjectName)
        return
      }

      handleExtraMenuClicks(key, objectSelected, this.props.openColorPicker)
    }
  }

  _generateContextMenuItems(library) {
    let objectMenuItems = []
    let heroMenuItems = []

    library.forEach((menuItem) => {
      if (menuItem.objectType === 'object') {
        objectMenuItems.push(menuItem)
      }
      if (menuItem.objectType === 'hero') {
        heroMenuItems.push(menuItem)
      }
    })

    // <MenuItem> key=action </MenuItem>
    const objectMenuObj = { baseLevelMenu: [] }
    const heroMenuObj = { baseLevelMenu: [] }

    objectMenuItems.forEach(item => {
      if (item.hasOwnProperty('subMenu')) {
        if (!objectMenuObj[item.subMenu]) {
          objectMenuObj[item.subMenu] = { submenuKey: item.subMenu, subMenuItems: [] }
          objectMenuObj['baseLevelMenu'].push({ subMenuKey: item.subMenu })
        }
        objectMenuObj[item.subMenu].subMenuItems.push(item)
      } else {
        objectMenuObj['baseLevelMenu'].push(item)
      }
    })

    heroMenuItems.forEach(item => {
      if (item.hasOwnProperty('subMenu')) {
        if (!heroMenuObj[item.subMenu]) {
          heroMenuObj[item.subMenu] = { submenuKey: item.subMenu, subMenuItems: [] }
          heroMenuObj['baseLevelMenu'].push({ subMenuKey: item.subMenu })
        }
        heroMenuObj[item.subMenu].subMenuItems.push(item)
      } else {
        heroMenuObj['baseLevelMenu'].push(item)
      }
    })

    return {
      heroMenuObj,
      objectMenuObj
    }
  }

  _renderSubMenu(subMenuItems, key) {
    return (
      <SubMenu title={key}>
        {subMenuItems.map(item => {
          return this._fetchMenu(item)
        })}
      </SubMenu>
    )
  }

  _fetchMenu(menuData, key) {
    const { objectSelected, subObject, openColorPicker } = this.props
    switch (menuData.useExistingMenu) {
      case 'Dialogue':
        return (<DialogueMenu key={key} objectSelected={objectSelected} subObject={subObject} />)
      case 'Color':
        return (<ColorMenu key={key} objectSelected={objectSelected} openColorPicker={openColorPicker} subObject={subObject}></ColorMenu>
        )
      case 'Tag':
        return (<TagMenu key={key} objectSelected={objectSelected}></TagMenu>
        )
      case 'GameTag':
        return (<GameTagMenu key={key} objectSelected={objectSelected} subObject={subObject}></GameTagMenu>
        )
      case 'Quest':
        return (<QuestMenu key={key} objectSelected={objectSelected} subObject={subObject}></QuestMenu>
        )
      case 'SpawnZone':
        return (<SpawnZoneMenu key={key} objectSelected={objectSelected} subObject={subObject}></SpawnZoneMenu>
        )
      case 'ResourceZone':
        return (<ResourceZoneMenu key={key} objectSelected={objectSelected} subObject={subObject}></ResourceZoneMenu>
        )
      case 'Name':
        return (<NameMenu key={key} objectSelected={objectSelected} subObject={subObject}></NameMenu>
        )
      case 'ObjectAdvanced':
        return (<ObjectAdvancedMenu key={key} objectSelected={objectSelected} subObject={subObject}></ObjectAdvancedMenu>
        )
      case 'SelectSubObject':
        return (<SelectSubObjectMenu key={key} objectSelected={objectSelected} subObject={subObject}></SelectSubObjectMenu>
        )
      case 'Relative':
        return (<RelativeMenu key={key} objectSelected={objectSelected} subObject={subObject}></RelativeMenu>
        )
      case 'Trigger':
        return (<TriggerMenu key={key} objectSelected={objectSelected} ></TriggerMenu>
        )
      case 'Hook':
        return (<HookMenu key={key} objectSelected={objectSelected}></HookMenu>
        )
      case 'Live':
        return (<LiveMenu key={key} objectSelected={objectSelected} subObject={subObject}></LiveMenu>
        )
      case 'Sprite':
        return (<SpriteMenu key={key} objectSelected={objectSelected} ></SpriteMenu>
        )
      default:
        return (<MenuItem key={menuData.action}>{menuData.title}</MenuItem>)
    }
  }


  _renderGeneratedMenu(menuObj) {
    return menuObj.baseLevelMenu.map((item, index) => {
      if (item.subMenuKey) {
        return this._renderSubMenu(menuObj[item.subMenuKey].subMenuItems, item.subMenuKey)
      } else if (item.useExistingMenu) {
        return (<SubMenu title={item.title}>
          {this._fetchMenu(item, index)}
        </SubMenu>)
      }
      else {
        return this._fetchMenu(item)
      }
    })
  }


  render() {
    const { objectSelected, subObject, menuItemData } = this.props
    const { objectMenuObj, heroMenuObj } = this._generateContextMenuItems(menuItemData)

    if (objectSelected.tags && objectSelected.tags.hero) {
      return <Menu onClick={this._onHandleMenuClick}>
        {this._renderGeneratedMenu(heroMenuObj)}
      </Menu>
    }

    if (objectSelected.id) {
      return <Menu onClick={this._handleMenuClick}>
        {this._renderGeneratedMenu(objectMenuObj)}
      </Menu>
    }

    return null;
  }
}
