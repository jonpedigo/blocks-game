import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import modals from './modals.js'

const editQuestPrefix = 'edit-quest-'
const deleteQuestPrefix = 'delete-quest-'

export default class HeroContextMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleHeroMenuClick = ({ key }) => {
      const { editor, onStartResize, onStartDrag, onDelete, openColorPicker } = this.props;
      const { objectHighlighted } = editor

      if(key === 'resize') {
        onStartResize(objectHighlighted)
      }

      if(key === 'drag') {
        onStartDrag(objectHighlighted)
      }

      if(key === 'delete') {
        onDelete(objectHighlighted)
      }

      if(key === 'select-color') {
        openColorPicker()
      }

      if(key === 'respawn') {
        window.socket.emit('respawnHero', objectHighlighted)
      }

      if(key === 'toggle-filled') {
        window.socket.emit('editHero', {id: objectHighlighted.id, tags: { filled: !objectHighlighted.tags.filled }})
      }

      if(key === 'copy-id') {
        PAGE.copyToClipBoard(objectHighlighted.id)
      }

      if(key === 'add-quest') {
        modals.editQuest(objectHighlighted)
      }

      if(key.indexOf(editQuestPrefix) === 0) {
        let questId = key.substr(editQuestPrefix.length)
        modals.editQuest(objectHighlighted, objectHighlighted.quests[questId])
      }

      if(key.indexOf(deleteQuestPrefix) === 0) {
        let questId = key.substr(deleteQuestPrefix.length)
        window.socket.emit('deleteQuest', objectHighlighted.id, questId)
      }

      if(key[0] === '{') {
        this._handleInputBehaviorMenuClick(key)
      }
    }

    this._handleTagMenuClick = ({ key }) => {
      const { editor } = this.props;
      const { objectHighlighted } = editor;

      window.socket.emit('editHero', {id: objectHighlighted.id, tags: { [key]: !objectHighlighted.tags[key] }})
    }

    this._handleInputBehaviorMenuClick = (key) => {
      const { editor } = this.props;
      const { objectHighlighted } = editor;

      const data = JSON.parse(key)
      if(data.new) {
        modals.addCustomInputBehavior(data.behaviorProp)
      } else if(data.behaviorName && data.behaviorProp) {
        window.socket.emit('editHero', {id: objectHighlighted.id, [data.behaviorProp]: data.behaviorName })
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
    const { editor } = this.props;
    const { objectHighlighted } = editor;

    const tagList = Object.keys(tags)
    return tagList.map((tag) => {
      if(objectHighlighted.tags && objectHighlighted.tags[tag]) {
        return <MenuItem key={tag}>{tag}<i style={{marginLeft:'6px'}} className="fas fa-check"></i></MenuItem>
      } else {
        return <MenuItem key={tag}>{tag}</MenuItem>
      }
    })
  }

  _renderInputBehaviorMenu(behaviorProp, behaviorList) {
    const { editor } = this.props;
    const { objectHighlighted } = editor;

    const newBehavior = <MenuItem key={JSON.stringify({behaviorProp, new: true})}>Add new behavior</MenuItem>

    return [...behaviorList.map((behaviorName) => {
      const key = {
        behaviorProp,
        behaviorName
      }

      if(objectHighlighted[behaviorProp] && objectHighlighted[behaviorProp] === behaviorName) {
        return <MenuItem key={JSON.stringify(key)}>{behaviorName}<i style={{marginLeft:'6px'}} className="fas fa-check"></i></MenuItem>
      } else {
        return <MenuItem key={JSON.stringify(key)}>{behaviorName}</MenuItem>
      }
    }), newBehavior]
  }

  render() {
    const { editor } = this.props
    const { objectHighlighted } = editor

    return <Menu onClick={this._handleHeroMenuClick}>
      <MenuItem key='drag'>Drag</MenuItem>
      <MenuItem key='resize'>Resize</MenuItem>
      <MenuItem key='respawn'>Respawn</MenuItem>
      <SubMenu title="Color">
        <MenuItem key="select-color">Color Picker</MenuItem>
        <MenuItem key="toggle-filled">{ objectHighlighted.tags.filled ? 'On border only' : "Fill object" }</MenuItem>
      </SubMenu>
      <SubMenu title="Quests">
        <MenuItem key="add-quest">Add Quest</MenuItem>
        {this._renderEditQuestList(objectHighlighted.quests)}
        {this._renderDeleteQuestList(objectHighlighted.quests)}
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
        <MenuItem key="edit-properties-json">Edit Properties JSON</MenuItem>
        <MenuItem key="edit-state-json">Edit State JSON</MenuItem>
      </SubMenu>
      <MenuItem key='delete'>Delete</MenuItem>
    </Menu>
  }
}
