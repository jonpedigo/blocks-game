import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import TagMenu from './menus/tagMenu.jsx';
import ColorMenu from './menus/ColorMenu.jsx';
import GameTagMenu from './menus/GameTagMenu.jsx';
import DialogueMenu from './menus/DialogueMenu.jsx';
import QuestMenu from './menus/QuestMenu.jsx';
import NameMenu from './menus/NameMenu.jsx';
import ObjectAdvancedMenu from './menus/ObjectAdvancedMenu.jsx';
import SelectSubObjectMenu from './menus/SelectSubObjectMenu.jsx';
import modals from './modals.js'

export default class ObjectContextMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleObjectMenuClick = ({ key }) => {
      const { onStartResize, onStartDrag, onDelete, onCopy } = MAPEDITOR
      const { selectSubObject, objectSelected } = this.props;

      if(key === 'resize') {
        onStartResize(objectSelected)
      }

      if(key === 'drag') {
        onStartDrag(objectSelected)
      }

      if(key === 'delete') {
        onDelete(objectSelected)
      }

      if(key === 'remove') {
        window.socket.emit('removeObject', objectSelected)
      }

      if(key === 'copy') {
        onCopy(objectSelected)
      }
    }
  }

  _renderObjectQuestMenu() {
    const { objectSelected } = this.props
    const { questGiver, questCompleter } = objectSelected.tags

    if(questGiver || questCompleter) {
      return <SubMenu title="Quest">
      <QuestMenu objectSelected={objectSelected} subObject/>
      </SubMenu>
    }
  }

  render() {
    const { objectSelected, objectName, subObject } = this.props

    return <Menu onClick={this._handleObjectMenuClick}>
      {objectName && <MenuItem className="bold-menu-item">{objectName}</MenuItem>}
      {!subObject && <MenuItem key="drag">Drag</MenuItem>}
      <MenuItem key="resize">Resize</MenuItem>
      <MenuItem key="copy">Copy</MenuItem>
      <SubMenu title="Dialogue">
        <DialogueMenu objectSelected={objectSelected} subObject/>
      </SubMenu>
      <SubMenu title="Color">
        <ColorMenu objectSelected={objectSelected} openColorPicker={this.props.openColorPicker} subObject></ColorMenu>
      </SubMenu>
      <SubMenu title="Name">
        <NameMenu objectSelected={objectSelected} subObject/>
      </SubMenu>
      {this._renderObjectQuestMenu()}
      <SubMenu title="Group">
        <GameTagMenu objectSelected={objectSelected} subObject/>
      </SubMenu>
      <SubMenu title="Tags">
        <TagMenu objectSelected={objectSelected} subObject></TagMenu>
      </SubMenu>
      <SubMenu title="Advanced">
        <ObjectAdvancedMenu objectSelected={objectSelected} subObject/>
      </SubMenu>
      <SubMenu title="Sub Objects">
        <SelectSubObjectMenu objectSelected={objectSelected} selectSubObject={this.props.selectSubObject} subObject/>
      </SubMenu>
      { GAME.gameState.started ? <MenuItem key="remove">Remove</MenuItem> : <MenuItem key="delete">Delete</MenuItem> }
    </Menu>
  }
}
