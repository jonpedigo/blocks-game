import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu';

export default class TagMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleTagMenuClick = ({ key }) => {
      const { objectSelected } = this.props;
      const { networkEditObject } = MAPEDITOR

      networkEditObject(objectSelected, { tags: { [key]: !objectSelected.tags[key] }})
    }
  }

  _renderTagMenuItems(tags) {
    const { objectSelected } = this.props;

    const tagList = Object.keys(tags)
    return tagList.map((tag) => {
      if(objectSelected.tags && objectSelected.tags[tag]) {
        return <MenuItem key={tag}>{tag}<i style={{marginLeft:'6px'}} className="fas fa-check"></i></MenuItem>
      } else {
        return <MenuItem key={tag}>{tag}</MenuItem>
      }
    })
  }

  render() {
    const { subObject } = this.props

    return <Menu onClick={this._handleTagMenuClick}>
      <SubMenu title="Physics">
        {this._renderTagMenuItems(window.physicsTags)}
      </SubMenu>
      <SubMenu title="Movement">
        {this._renderTagMenuItems(window.movementTags)}
      </SubMenu>
      <SubMenu title="Behavior">
        {this._renderTagMenuItems(window.behaviorTags)}
      </SubMenu>
      <SubMenu title="Trigger Behavior">
        {this._renderTagMenuItems(window.triggerTags)}
      </SubMenu>
      <SubMenu title="Hero Update">
        {this._renderTagMenuItems(window.heroUpdateTags)}
      </SubMenu>
      <SubMenu title="Quest">
        {this._renderTagMenuItems(window.questTags)}
      </SubMenu>
      <SubMenu title="Dialogue">
        {this._renderTagMenuItems(window.dialogueTags)}
      </SubMenu>
      <SubMenu title="Combat">
        {this._renderTagMenuItems(window.combatTags)}
      </SubMenu>
      <SubMenu title="Spawn Zone">
        {this._renderTagMenuItems(window.spawnZoneTags)}
      </SubMenu>
      <SubMenu title="Graphical">
        {this._renderTagMenuItems(window.graphicalTags)}
      </SubMenu>
      {subObject && <SubMenu title="Sub Object">
        {this._renderTagMenuItems(window.subObjectTags)}
      </SubMenu>}
    </Menu>
  }
}
