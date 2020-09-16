import React from 'react'
import modals from './modals.js'
import Select from 'react-select'
import classnames from 'classnames'
import {
  SingleEventSelect,
  SingleTagSelect,
  SingleIdSelect,
  MultiIdSelect,
  MultiTagSelect,
  NextSelect,
} from '../components/SelectComponents.jsx'
import Collapsible from 'react-collapsible';

export default class Trigger extends React.Component {
  render() {
    const { sequenceItem } = this.props

    return <React.Fragment>
      <SingleEventSelect title="Event Name" valueProp='eventName' sequenceItem={sequenceItem} onChange={(event) => {
       if(event.value) {
         sequenceItem.eventName = event.value
         this.props.setState({sequenceItem})
       }
      }}/>
      <div className={classnames("SequenceItem__condition SequenceItem__condition-body")}>
      <Collapsible trigger="Event Match">
        <SingleIdSelect sequenceItem={sequenceItem} valueProp='mainObjectId' onChange={(result) => {
        this.props._onSetPropValue('mainObjectId', result.value)
      }} title='Main Object Id:'/>
      <SingleIdSelect sequenceItem={sequenceItem} valueProp='guestObjectId' onChange={(result) => {
          this.props._onSetPropValue('guestObjectId', result.value)
        }} title='Guest Object Id:'/>
      <SingleTagSelect sequenceItem={sequenceItem} valueProp='mainObjectTag' onChange={(result) => {
          this.props._onSetPropValue('mainObjectTag', result.value)
        }} title='Main Object Tag:'/>
      <SingleTagSelect sequenceItem={sequenceItem} valueProp='guestObjectTag' onChange={(result) => {
          this.props._onSetPropValue('guestObjectTag', result.value)
        }} title='Guest Object Tag:'/>
      </Collapsible>

      <Collapsible trigger="Trigger Options"><div className="SequenceItem__condition-form"><i className="fa fas fa-edit Manager__button" onClick={() => { this.props._openEditNumberModal('initialTriggerPool') }}/>
        {'Trigger Pool'} <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.initialTriggerPool}</div>
      </div>
      <div className="SequenceItem__condition-form"><i className="fa fas fa-edit Manager__button" onClick={() => { this.props._openEditNumberModal('eventThreshold') }}/>
        {'Event Threshold'} <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.eventThreshold}</div>
      </div></Collapsible>
    </div>
    </React.Fragment>
  }
}
