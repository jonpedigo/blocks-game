import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

const selectSubObjectPrefix = 'select-subobject-'
const deleteSubObjectPrefix = 'delete-subobject-'

export default class SelectSubObjectMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleSelectSubObjectMenuClick = ({ key }) => {
      const { objectSelected, selectSubObject } = this.props;

      if(key === 'add-new-subobject') {
        modals.addNewSubObjectTemplate(objectSelected)
      }

      if(key.indexOf(selectSubObjectPrefix) === 0) {
        const subObjectName = key.substr(selectSubObjectPrefix.length)
        selectSubObject(objectSelected.subObjects[subObjectName], subObjectName)
      }

      if(key.indexOf(deleteSubObjectPrefix) === 0) {
        const subObjectName = key.substr(deleteSubObjectPrefix.length)
        window.socket.emit('deleteSubObject', objectSelected, subObjectName)
      }
    }
  }

  _renderSelectSubObjectMenuItems(subObjects = {}) {
    const { objectSelected } = this.props;

    const subObjectList = Object.keys(subObjects)
    return subObjectList.map((subObjectName) => {
      return <MenuItem className='dont-close-menu' key={selectSubObjectPrefix + subObjectName}>{'Edit ' + subObjectName}</MenuItem>
    })
  }

  _renderRemoveSubObjectMenuItems(subObjects = {}) {
    const { objectSelected } = this.props;

    const subObjectList = Object.keys(subObjects)
    return subObjectList.map((subObjectName) => {
      return <MenuItem key={deleteSubObjectPrefix + subObjectName}>{'Delete ' + subObjectName}</MenuItem>
    })
  }

  render() {
    const { objectSelected } = this.props;

    return <Menu onClick={this._handleSelectSubObjectMenuClick}>
      {this._renderSelectSubObjectMenuItems(objectSelected.subObjects)}
      <MenuItem key='add-new-subobject'>Add new sub object</MenuItem>
    </Menu>
  }
}
