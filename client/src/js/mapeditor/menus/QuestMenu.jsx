import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

export default class QuestMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleQuestMenuClick = ({ key }) => {
      const { objectSelected } = this.props

      if(key === 'enter-quest-giver-id') {
        modals.editProperty(objectSelected, 'questGivingId', objectSelected.questGivingId || '')
      }

      if(key === 'enter-quest-completer-id') {
        modals.editProperty(objectSelected, 'questCompleterId', objectSelected.questCompleterId || '')
      }
    }
  }

  _renderQuestMenu() {
    const { objectSelected } = this.props
    const { questGiver, questCompleter } = objectSelected.tags

    const list = []

    if(questGiver) {
      list.push(<MenuItem key="enter-quest-giver-id">Enter giving quest name</MenuItem>)
    }

    if(questCompleter) {
      list.push(<MenuItem key="enter-quest-completer-id">Enter completing quest name</MenuItem>)
    }

    if(list.length) {
      return list
    } else {
      return null
    }
  }

  render() {
    return <Menu onClick={this._handleQuestMenuClick}>
      {this._renderQuestMenu()}
    </Menu>
  }
}
