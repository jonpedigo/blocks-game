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

export default class EditingSequenceContextMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleSequenceMenuClick = ({ key }) => {
      const { selectSubObject, objectSelected, subObject } = this.props;

      if(key === 'set-as-requested') {
        window.local.emit('onSelectSequenceProperty', 'requested', objectSelected)
      }
      if(key === 'set-as-sequenceitem-value') {
        window.local.emit('onSelectSequenceProperty', 'value', objectSelected)
      }

      BELOWMANAGER.selectedSequenceProperty = null
      BELOWMANAGER.editingSequenceItemId = null
      BELOWMANAGER.ref.forceUpdate()
    }
  }

  render() {
    const { objectSelected, objectEditing, subObject } = this.props

    return <Menu onClick={this._handleSequenceMenuClick}>
      <MenuItem key='set-as-sequenceitem-value'>Select</MenuItem>
    </Menu>
  }
}
