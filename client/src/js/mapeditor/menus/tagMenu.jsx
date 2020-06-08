import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu';

export default class TagMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleTagMenuClick = ({ key }) => {
      const { objectSelected } = this.props;
      const { networkEditObject } = MAPEDITOR

      // LOCAL TAGS ALLOWS US TO SEE WHAT TAGS WE HAVE ADDED W CHECKMARSK!!
      this.setState({ localTags: {
        ...this.state.localTags,
        [key]: !this.state.localTags[key]
      }})


      networkEditObject(objectSelected, { tags: { [key]: !objectSelected.tags[key] }})
    }

    this.state = {
      localTags: this.props.objectSelected.tags
    }
  }

  _renderTagMenuItems(tags) {
    const { objectSelected } = this.props
    const { localTags } = this.state

    const tagList = Object.keys(tags)
    return tagList.map((tag) => {
      if(localTags[tag]) {
        return <MenuItem className='dont-close-menu' key={tag}>{tag}<i style={{marginLeft:'6px'}} className="fas fa-check"></i></MenuItem>
      } else {
        return <MenuItem className='dont-close-menu' key={tag}>{tag}</MenuItem>
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
      <SubMenu title="Other">
        {this._renderTagMenuItems(window.otherTags)}
      </SubMenu>
    </Menu>
  }
}
