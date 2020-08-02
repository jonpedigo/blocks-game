import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu';

export default class TagMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleTagMenuClick = ({ key }) => {
      const { objectSelected } = this.props;
      const { networkEditObject } = MAPEDITOR

      const newValue = !this.state.localTags[key]
      this.setState({ localTags: {
        ...this.state.localTags,
        [key]: newValue
      }})

      networkEditObject(objectSelected, { tags: { [key]: newValue }})
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
      <SubMenu title="Resource Zone">
        {this._renderTagMenuItems(window.resourceZoneTags)}
      </SubMenu>
      <SubMenu title="Graphical">
        {this._renderTagMenuItems(window.graphicalTags)}
      </SubMenu>
      <SubMenu title="Camera">
        {this._renderTagMenuItems(window.cameraTags)}
      </SubMenu>
      <SubMenu title="Particle">
        {this._renderTagMenuItems(window.particleTags)}
      </SubMenu>
      <SubMenu title="Animation">
        {this._renderTagMenuItems(window.animationTags)}
      </SubMenu>
      <SubMenu title="Inventory">
        {this._renderTagMenuItems(window.inventoryTags)}
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
