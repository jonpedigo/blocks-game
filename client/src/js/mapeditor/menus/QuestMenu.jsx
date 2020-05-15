import React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import modals from '../modals.js'

function getCompleteQuestList() {
  const quests = []
  GAME.heroList.forEach((hero) => {
    Object.keys(hero.quests).forEach((questId) => {
      quests.push(questId)
    })
  })
  return quests
}

const questCompleterIdSelectPrefix = 'complete-id-'
const questGivingIdSelectPrefix = 'quest-id-'

export default class QuestMenu extends React.Component{
  constructor(props) {
    super(props)

    this._handleQuestMenuClick = ({ key }) => {
      const { objectSelected } = this.props
      const { networkEditObject } = MAPEDITOR

      if(key === 'enter-quest-giving-id') {
        modals.editProperty(objectSelected, 'questGivingId', objectSelected.questGivingId || '')
      }

      if(key === 'enter-quest-completer-id') {
        modals.editProperty(objectSelected, 'questCompleterId', objectSelected.questCompleterId || '')
      }

      if(key.indexOf(questGivingIdSelectPrefix) === 0) {
        const questId = key.substr(questGivingIdSelectPrefix.length)
        networkEditObject(objectSelected, { questGivingId: questId })
      }

      if(key.indexOf(questCompleterIdSelectPrefix) === 0) {
        const questId = key.substr(questCompleterIdSelectPrefix.length)
        networkEditObject(objectSelected, { questCompleterId: questId })
      }
    }
  }

  _renderQuestMenu() {
    const { objectSelected } = this.props
    const { questGiver, questCompleter } = objectSelected.tags

    const list = []

    const questList = getCompleteQuestList()

    if(questGiver) {
      list.push(<MenuItem key="enter-quest-giving-id">Enter giving quest name</MenuItem>)
      list.push(questList.map((questId) => {
        if(objectSelected.questGivingId === questId) {
          return <MenuItem key={questGivingIdSelectPrefix+questId}>{'Give quest ' + questId}<i style={{marginLeft:'6px'}} className="fas fa-check"></i></MenuItem>
        } else {
          return <MenuItem key={questGivingIdSelectPrefix+questId}>{'Give quest ' + questId}</MenuItem>
        }
      }))
    }

    if(questCompleter) {
      list.push(<MenuItem key="enter-quest-completer-id">Enter completing quest name</MenuItem>)
      list.push(questList.map((questId) => {
        if(objectSelected.questCompleterId === questId) {
          return <MenuItem key={questCompleterIdSelectPrefix+questId}>{'Complete quest ' + questId}<i style={{marginLeft:'6px'}} className="fas fa-check"></i></MenuItem>
        } else {
          return <MenuItem key={questCompleterIdSelectPrefix+questId}>{'Complete quest ' + questId}</MenuItem>
        }
      }))
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
