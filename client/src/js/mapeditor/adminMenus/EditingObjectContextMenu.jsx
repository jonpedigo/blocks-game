import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import TagMenu from '../menus/tagMenu.jsx';
import CurrentTagsMenu from '../menus/CurrentTagsMenu.jsx';
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

export default class EditingObjectContextMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleObjectMenuClick = ({ key }) => {
      const { selectSubObject, objectSelected, subObject, objectEditing } = this.props;
      const { networkEditObject } = MAPEDITOR

      if(key === 'set-as-path') {
        const update = { pathId: objectSelected.id }
        if(objectSelected.customGridProps) {
          update.pathfindingGridId = objectSelected.id
        } else {
          update.pathfindingGridId = null
        }
        networkEditObject(objectEditing, update)
      }

      if(key === 'set-as-parent') {
        networkEditObject(objectEditing, { parentId: objectSelected.id })
      }

      if(key === 'set-as-relative') {
        const relativeX = objectEditing.x - objectSelected.x
        const relativeY = objectEditing.y - objectSelected.y
        networkEditObject(objectEditing, { relativeId: objectSelected.id, relativeX, relativeY })
      }

      if(key === 'clear-object-selection') {
        OBJECTS.editingId = null;
      }
    }
  }

  render() {
    const { objectSelected, subObject } = this.props

    // <MenuItem key="follow">Follow</MenuItem>

    return <Menu onClick={this._handleObjectMenuClick}>
      {objectSelected.tags.path && <MenuItem key="set-as-path">Set as Path</MenuItem>}
      {objectSelected.tags.pathfindingLimit && <MenuItem key="set-as-pathfinding-limit">Set as Pathfinding Limit</MenuItem>}
      {objectSelected.tags.spawnZone && <MenuItem key="set-as-respawn-zone">Set as Respawn Zone</MenuItem>}
      <MenuItem key="set-as-parent">Set as Parent</MenuItem>
      <MenuItem key="set-as-relative">Set as Relative</MenuItem>
      <MenuItem key="pathfind-to">Pathfind to</MenuItem>
      <MenuItem key="go-to">Go to</MenuItem>
      {Object.keys(objectSelected.subObjects || {}).length && <SubMenu title="Sub Objects">
        <SelectSubObjectMenu objectSelected={objectSelected} selectSubObject={this.props.selectSubObject}/>
      </SubMenu>}
      <MenuItem key="clear-object-selection">Clear object selection</MenuItem>
    </Menu>
  }
}
