import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class DialogueMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleDialogueMenuClick = ({ key }) => {
      const { objectSelected } = this.props

      if(key === "add-dialogue") {
        if(!objectSelected.heroDialogue) {
          objectSelected.heroDialogue = []
        }
        objectSelected.heroDialogue.push('')
        modals.writeDialogue(objectSelected, objectSelected.heroDialogue.length-1)
      }

      if(key.indexOf("remove-dialogue") === 0) {
        let dialogueIndex = key[key.length-1]
        objectSelected.heroDialogue.splice(dialogueIndex, 1)
        window.socket.emit('editObjects', [{id: objectSelected.id, heroUpdate: objectSelected.heroUpdate}])
      }

      if(key.indexOf("edit-dialogue") === 0) {
        let dialogueIndex = key[key.length-1]
        modals.writeDialogue(objectSelected, dialogueIndex)
      }
    }
  }

  render() {
    const { objectSelected } = this.props

    return <Menu onClick={this._handleDialogueMenuClick}>
      <MenuItem key="add-dialogue">Add Dialogue</MenuItem>
      {objectSelected.heroDialogue && objectSelected.heroDialogue.map((dialogue, i) => {
        return <MenuItem key={"edit-dialogue-"+i}>{'Edit Dialogue ' + (i+1)}</MenuItem>
      })}
      {objectSelected.heroDialogue && objectSelected.heroDialogue.map((dialogue, i) => {
        return <MenuItem key={"remove-dialogue-"+i}>{'Remove Dialogue ' + (i+1)}</MenuItem>
      })}
    </Menu>
  }
}
