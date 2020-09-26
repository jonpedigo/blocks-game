import React from 'react'
import SpriteSheetEditor from './mediamanager/SpriteSheetEditor.jsx'
import SpriteSelector from './mediamanager/SpriteSelector.jsx'
import MediaManager from './mediamanager/MediaManager.jsx'
import GameManager from './gamemanager/GameManager.jsx'
import ObjectManager from './objectmanager/ObjectManager.jsx'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import modals from '../mapeditor/modals'

export default class Root extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false,
      selectedMenu: null,
      selectedId: null,
      selectedManager: null,
      objectSelected: null,
      selectedHistory: [],
      tabIndex: 0,
    }

    this.selectedRef = React.createRef();
  }

  open({ objectSelected, selectedMenu, selectedId, selectedManager }) {

    const selectedHistory = this.state.selectedHistory.slice()
    selectedHistory.push({ objectSelected, selectedMenu, selectedId, selectedManager })
    this.setState({
      open: true,
      selectedHistory,
      tabIndex: selectedHistory.length -1
    })
  }

  close = () => {
    this.setState({
      open: false,
      selectedHistory: [],
      tabIndex: 0,
    })
  }

  clearId = (index) => {
    this.setState({
      selectedHistory: this.state.selectedHistory.map((selected, i) => {
        if(index === i) {
          selected.selectedId = null
        }

        return selected
      })
    })
  }

  openId = (index, id) => {
    this.setState({
      selectedHistory: this.state.selectedHistory.map((selected, i) => {
        if(index === i) {
          selected.selectedId = id
        }
        return selected
      })
    })
  }

  closeTab = (index) => {
    let tabIndex = this.state.tabIndex

    if(tabIndex > index) {
      tabIndex--
    } else if(this.state.selectedHistory.length === 1) {
      this.close()
    } else tabIndex++

    this.setState({
      selectedHistory: this.state.selectedHistory.filter((selected, i) => {
        if(index === i) {
          return false
        }
        return true
      })
    }, () => {
      this.setState({
        tabIndex
      })
    })
  }

  _renderTabList() {
    const { open, selectedHistory } = this.state

    return <TabList>
      {selectedHistory.map(({ objectSelected, selectedMenu, selectedId, selectedManager, tabName }, index) => {
        let name = tabName
        if(!name) {
          name = selectedManager
          if(selectedMenu) name += ' - ' + selectedMenu
        }
        return <Tab className="react-tabs__tab ManagerTab">{name}
          <i className="fas fa-times ManagerTab__close" onClick={() => this.closeTab(index)}/>
        </Tab>
      })}
    </TabList>
  }

  _renderPanel({ objectSelected, selectedMenu, selectedId, selectedManager }, index) {
    if(selectedManager === 'MediaManager') {
      return <MediaManager index={index} returnToList={this.clearId} openId={this.openId} selectedMenu={selectedMenu} selectedId={selectedId} objectSelected={objectSelected} closeManager={this.close}/>
    }

    if(selectedManager === 'GameManager') {
      return <GameManager index={index} returnToList={this.clearId} openId={this.openId} selectedMenu={selectedMenu} selectedId={selectedId} objectSelected={objectSelected} closeManager={this.close}/>
    }

    if(selectedManager === 'ObjectManager') {
      return <ObjectManager index={index} returnToList={this.clearId} openId={this.openId} selectedMenu={selectedMenu} selectedId={selectedId} objectSelected={objectSelected} closeManager={this.close}/>
    }
  }

  render() {
    const { open, selectedHistory, tabIndex } = this.state

    if(!open || selectedHistory.length == 0) return null

    return <Tabs selectedIndex={tabIndex} onSelect={index => {
      this.setState({tabIndex: index})
    }}>
      {this._renderTabList()}
      {selectedHistory.map((selected, index) => {
        return <TabPanel>
          {this._renderPanel(selected, index)}
        </TabPanel>
      })}
    </Tabs>
  }
}
