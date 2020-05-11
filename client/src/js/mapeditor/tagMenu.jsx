import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu';

export default class TagMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleTagMenuClick = ({ key }) => {
      const { objectHighlighted } = this.props;

      if(objectHighlighted.tags.hero) {

      } else {
        window.socket.emit('editObjects', [{id: objectHighlighted.id, tags: { [key]: !objectHighlighted.tags[key] }}])
      }
    }
  }

  _renderTagMenuItems(tags) {
    const { objectHighlighted } = this.props;

    const tagList = Object.keys(tags)
    return tagList.map((tag) => {
      if(objectHighlighted.tags && objectHighlighted.tags[tag]) {
        return <MenuItem key={tag}>{tag}<i style={{marginLeft:'6px'}} className="fas fa-check"></i></MenuItem>
      } else {
        return <MenuItem key={tag}>{tag}</MenuItem>
      }
    })
  }

  render() {
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
        {this._renderTagMenuItems(window.triggerBehaviorTags)}
      </SubMenu>
      <SubMenu title="Hero Update">
        {this._renderTagMenuItems(window.heroUpdateTags)}
      </SubMenu>
      <SubMenu title="Graphical">
        {this._renderTagMenuItems(window.graphicalTags)}
      </SubMenu>
    </Menu>
  }
}
