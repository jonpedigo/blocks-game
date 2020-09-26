import React from 'react'
import SequenceEditor from '../../sequenceeditor/SequenceEditor.jsx'
import SequenceItem from '../../sequenceeditor/SequenceItem.jsx'
import modals from '../../mapeditor/modals'

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Collapsible from 'react-collapsible';

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

    // const triggerData = JSON.parse(JSON.stringify(window.defaultSequenceTrigger))
    // const newEffect = JSON.parse(JSON.stringify(window.defaultSequenceEffect))
    // Object.assign(newEffect, triggerData, effect)

    if(tabName === 'triggers') {
      return <div className="Manager">
          <div className="Manager__triggers Manager__list">
            <div className="Manager__list-item" onClick={() => {
              modals.addTrigger(this.props.objectSelected)
            }}>
              Add Trigger
            </div>
            {Object.keys(this.props.objectSelected.triggers || {}).map((triggerName) => {
            const trigger = this.props.objectSelected.triggers[triggerName]
            trigger.sequenceType = 'sequenceEffect'

            const ref = React.createRef()
            return <Collapsible trigger={triggerName}>
              <i className="fas fa-save Manager__button" onClick={() => {
                const triggerUpdate = ref.current.getItemValue()
                const oldId = trigger.id
                window.socket.emit('editTrigger', this.props.objectSelected.id, oldId, triggerUpdate)
              }}></i>
              <SequenceItem sequenceItem={trigger} ref={ref} isTrigger/>
            </Collapsible>
          })}
        </div>
        <SequenceEditor/>
      </div>
    }
  }

  render() {
    const { selectedMenu } = this.props

    return <Tabs defaultIndex={Object.keys(objectManagerTabs).indexOf(selectedMenu)} >
      <TabList>
        {Object.keys(objectManagerTabs).map((tabName) => {
          return <Tab style={{textTransform: 'capitalize'}}>{tabName}</Tab>
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
