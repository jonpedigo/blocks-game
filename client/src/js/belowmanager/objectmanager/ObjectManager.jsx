import React from 'react'
import SequenceEditor from '../../sequenceeditor/SequenceEditor.jsx'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

window.objectManagerTabs = {
  detail: false,
  triggers: false,
}

export default class ObjectManager extends React.Component {
  constructor(props) {
    super(props)
  }

  _renderMenu(tabName) {
    if(tabName === 'detail') {
      return <div className="Manager">

      </div>
    }

    if(tabName === 'triggers') {
      return <div className="Manager">

      </div>
    }
  }

  render() {
    const { selectedMenu } = this.props
    
    return <Tabs defaultIndex={Object.keys(objectManagerTabs).indexOf(selectedMenu)} >
      <TabList>
        {Object.keys(objectManagerTabs).map((tabName) => {
          return <Tab>{tabName}</Tab>
        })}
      </TabList>
      {Object.keys(objectManagerTabs).map((tabName) => {
        return <TabPanel>
          {this._renderMenu(tabName)}
        </TabPanel>
      })}
    </Tabs>
  }
}
