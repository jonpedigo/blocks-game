import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import TagMenu from './menus/tagMenu.jsx';
import ColorMenu from './menus/ColorMenu.jsx';
import GameTagMenu from './menus/GameTagMenu.jsx';
import DialogueMenu from './menus/DialogueMenu.jsx';
import QuestMenu from './menus/QuestMenu.jsx';
import SpawnZoneMenu from './menus/SpawnZoneMenu.jsx';
import NameMenu from './menus/NameMenu.jsx';
import ObjectAdvancedMenu from './menus/ObjectAdvancedMenu.jsx';
import SelectSubObjectMenu from './menus/SelectSubObjectMenu.jsx';
import RelativeMenu from './menus/RelativeMenu.jsx';
import TriggerMenu from './menus/TriggerMenu.jsx';
import SpriteMenu from './menus/SpriteMenu.jsx';
import modals from './modals.js'

export default class ObjectContextMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleObjectMenuClick = ({ key }) => {
      const { startResize, onStartDrag, deleteObject, onCopy } = MAPEDITOR
      const { selectSubObject, objectSelected, subObject } = this.props;
      const { removeObject } = MAPEDITOR

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
    }
  }

  _renderObjectQuestMenu() {
    const { objectSelected, subObject } = this.props
    const { questGiver, questCompleter } = objectSelected.tags

    if(questGiver || questCompleter) {
      return <SubMenu title="Quest">
      <QuestMenu objectSelected={objectSelected} subObject={subObject}/>
      </SubMenu>
    }
  }

  _renderObjectSpawnZoneMenu() {
    const { objectSelected, subObject } = this.props
    const { spawnZone } = objectSelected.tags

    if(spawnZone) {
      return <SubMenu title="Spawn Zone">
      <SpawnZoneMenu objectSelected={objectSelected} subObject={subObject}/>
      </SubMenu>
    }
  }

  render() {
    const { objectSelected, subObject } = this.props

    return <Menu onClick={this._handleObjectMenuClick}>
      {objectSelected.name && <MenuItem className="bold-menu-item">{objectSelected.name}</MenuItem>}
      {objectSelected.subObjectName && <MenuItem className="bold-menu-item">{objectSelected.subObjectName}</MenuItem>}
      {!subObject && <MenuItem key="drag">Drag</MenuItem>}
      {!objectSelected.constructParts && <MenuItem key="resize">Resize</MenuItem>}
      {subObject && <MenuItem key="resize-grid">Resize On Grid</MenuItem>}
      <MenuItem key="copy">Copy</MenuItem>
      <SubMenu title='Sprite'><SpriteMenu objectSelected={objectSelected} subObject={subObject}/></SubMenu>
      {(objectSelected.ownerId || objectSelected.relativeId) && <SubMenu title="Relative">
        <RelativeMenu objectSelected={objectSelected} subObject={subObject}/>
      </SubMenu>}
      <SubMenu title="Dialogue">
        <DialogueMenu objectSelected={objectSelected} subObject={subObject}/>
      </SubMenu>
      <SubMenu title="Color">
        <ColorMenu objectSelected={objectSelected} openColorPicker={this.props.openColorPicker} subObject={subObject}></ColorMenu>
      </SubMenu>
      <SubMenu title="Name">
        <NameMenu objectSelected={objectSelected} subObject={subObject}/>
      </SubMenu>
      {this._renderObjectQuestMenu()}
      {this._renderObjectSpawnZoneMenu()}
      <SubMenu title="Group">
        <GameTagMenu objectSelected={objectSelected} subObject={subObject}/>
      </SubMenu>
      <SubMenu title="Triggers">
        <TriggerMenu objectSelected={objectSelected}/>
      </SubMenu>
      <SubMenu title="Tags">
        <TagMenu objectSelected={objectSelected} subObject={subObject}></TagMenu>
      </SubMenu>
      {Object.keys(objectSelected.subObjects || {}).length && <SubMenu title="Sub Objects">
        <SelectSubObjectMenu objectSelected={objectSelected} selectSubObject={this.props.selectSubObject}/>
      </SubMenu>}
      { GAME.gameState.started ? <MenuItem key="remove">Remove</MenuItem> : <MenuItem key="delete">Delete</MenuItem> }
      <SubMenu title="Advanced">
        <ObjectAdvancedMenu objectSelected={objectSelected} subObject={subObject}/>
      </SubMenu>
    </Menu>
  }
}
