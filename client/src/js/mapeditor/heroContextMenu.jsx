import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import SelectSubObjectMenu from './menus/SelectSubObjectMenu.jsx';
import modals from './modals.js'

const editQuestPrefix = 'edit-quest-'
const deleteQuestPrefix = 'delete-quest-'

export default class HeroContextMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleHeroMenuClick = ({ key }) => {
      const { objectSelected, openColorPicker } = this.props;
      const { startResize, onStartDrag, deleteObject, removeObject } = MAPEDITOR

      if(key === 'resize') {
        startResize(objectSelected)
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

      if(key === 'select-color') {
        openColorPicker(objectSelected)
      }

      if(key === 'respawn') {
        window.socket.emit('respawnHero', objectSelected)
      }

      if(key === 'toggle-filled') {
        networkEditObject(objectSelected, { tags: { filled: !objectSelected.tags.filled }})
      }

      if(key === 'copy-id') {
        PAGE.copyToClipBoard(objectSelected.id)
      }

      if(key === 'add-quest') {
        modals.editQuest(objectSelected)
      }

      if(key.indexOf(editQuestPrefix) === 0) {
        let questId = key.substr(editQuestPrefix.length)
        modals.editQuest(objectSelected, objectSelected.quests[questId])
      }

      if(key.indexOf(deleteQuestPrefix) === 0) {
        let questId = key.substr(deleteQuestPrefix.length)
        window.socket.emit('deleteQuest', objectSelected.id, questId)
      }

      if(key[0] === '{') {
        this._handleInputBehaviorMenuClick(key)
      }

      if(key === 'edit-properties-json') {
        modals.editObjectCode(objectSelected, 'Editing Hero Properties', HERO.getProperties(objectSelected));
      }

      if(key === 'edit-state-json') {
        modals.editObjectCode(objectSelected, 'Editing Hero State', HERO.getState(objectSelected));
      }

      if(key === 'add-new-subobject') {
        modals.addNewSubObject(objectSelected)
      }
    }

    this._handleTagMenuClick = ({ key }) => {
      const { objectSelected } = this.props;
      const { networkEditObject } = MAPEDITOR

      networkEditObject(objectSelected, { tags: { [key]: !objectSelected.tags[key] }})
    }

    this._handleInputBehaviorMenuClick = (key) => {
      const { objectSelected } = this.props;
      const { networkEditObject } = MAPEDITOR

      const data = JSON.parse(key)
      if(data.new) {
        modals.addCustomInputBehavior(data.behaviorProp)
      } else if(data.behaviorName && data.behaviorProp) {
        networkEditObject(objectSelected, { [data.behaviorProp]: data.behaviorName })
      }
    }
  }

  _renderEditQuestList(quests = {}) {
    const questList = Object.keys(quests)
    return questList.map((questId) => {
      return <MenuItem key={editQuestPrefix+questId}>{'Edit ' + questId}</MenuItem>
    })
  }

  _renderDeleteQuestList(quests = {}) {
    const questList = Object.keys(quests)
    return questList.map((questId) => {
      return <MenuItem key={deleteQuestPrefix+questId}>{'Delete ' + questId}</MenuItem>
    })
  }

  _renderTagMenuItems(tags) {
    const { objectSelected } = this.props

    const tagList = Object.keys(tags)
    return tagList.map((tag) => {
      if(objectSelected.tags && objectSelected.tags[tag]) {
        return <MenuItem key={tag}>{tag}<i style={{marginLeft:'6px'}} className="fas fa-check"></i></MenuItem>
      } else {
        return <MenuItem key={tag}>{tag}</MenuItem>
      }
    })
  }

  _renderInputBehaviorMenu(behaviorProp, behaviorList) {
    const { objectSelected } = this.props

    const newBehavior = <MenuItem key={JSON.stringify({behaviorProp, new: true})}>Add new behavior</MenuItem>

    return [...behaviorList.map((behaviorName) => {
      const key = {
        behaviorProp,
        behaviorName
      }

      if(objectSelected[behaviorProp] && objectSelected[behaviorProp] === behaviorName) {
        return <MenuItem key={JSON.stringify(key)}>{behaviorName}<i style={{marginLeft:'6px'}} className="fas fa-check"></i></MenuItem>
      } else {
        return <MenuItem key={JSON.stringify(key)}>{behaviorName}</MenuItem>
      }
    }), newBehavior]
  }

  render() {
    const { objectSelected } = this.props

    return <Menu onClick={this._handleHeroMenuClick}>
      <MenuItem key='drag'>Drag</MenuItem>
      <MenuItem key='resize'>Resize</MenuItem>
      <MenuItem key='respawn'>Respawn</MenuItem>
      <SubMenu title="Color">
        <MenuItem key="select-color">Color Picker</MenuItem>
        <MenuItem key="toggle-filled">{ objectSelected.tags.filled ? 'On border only' : "Fill object" }</MenuItem>
      </SubMenu>
      <SubMenu title="Quests">
        <MenuItem key="add-quest">Add Quest</MenuItem>
        {this._renderEditQuestList(objectSelected.quests)}
        {this._renderDeleteQuestList(objectSelected.quests)}
      </SubMenu>
      <SubMenu title="Tags">
        <Menu onClick={this._handleTagMenuClick}>
          {this._renderTagMenuItems(window.heroTags)}
        </Menu>
      </SubMenu>
      <SubMenu title="Input">
        <SubMenu title="Arrow Keys">
          {this._renderInputBehaviorMenu('arrowKeysBehavior', window.heroArrowKeyBehaviors)}
        </SubMenu>
        <SubMenu title="Z Key">
          {this._renderInputBehaviorMenu('actionButtonBehavior', window.heroActionButtonBehaviors)}
        </SubMenu>
        <SubMenu title="Space Bar">
          {this._renderInputBehaviorMenu('spaceBarBehavior', window.heroSpaceBarBehaviors)}
        </SubMenu>
      </SubMenu>
      <SubMenu title="Advanced">
        <MenuItem key="copy-id">Copy id to clipboard</MenuItem>
        <MenuItem key={'add-new-subobject'}>Add new sub object</MenuItem>
        <MenuItem key="edit-properties-json">Edit Properties JSON</MenuItem>
        <MenuItem key="edit-state-json">Edit State JSON</MenuItem>
      </SubMenu>
      {Object.keys(objectSelected.subObjects || {}).length && <SubMenu title="Sub Objects">
        <SelectSubObjectMenu objectSelected={objectSelected} selectSubObject={this.props.selectSubObject}/>
      </SubMenu>}
      { GAME.gameState.started ? <MenuItem key="remove">Remove</MenuItem> : <MenuItem key="delete">Delete</MenuItem> }
    </Menu>
  }
}
