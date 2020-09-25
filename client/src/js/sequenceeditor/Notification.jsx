import React from 'react'
import modals from './modals.js'
import Select from 'react-select'
import classnames from 'classnames'
import Collapsible from 'react-collapsible';
import {
  SingleLibraryModSelect,
  SingleLibraryObjectSelect,
  SingleEventSelect,
  SingleTagSelect,
  SingleIdSelect,
  MultiIdSelect,
  MultiTagSelect,
  NextSelect,
} from '../components/SelectComponents.jsx'

window.defaultSequenceNotification = {
  notificationAllHeros: false,
  notificationDuration: null,
  notificationToast: false,
  notificationLog: false,
  notificationChat: false,
  notificationModal: false,
  effectedMainObject: false,
  effectedGuestObject: false,
  effectedIds: [],
  effectedTags: [],
}

export default class Notification extends React.Component{
  _renderInvolved() {
    const { sequenceItem } = this.props
    const { effectName } = sequenceItem

    return <Collapsible trigger='Involved'>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('notificationAllHeros')} checked={sequenceItem.notificationAllHeros} type="checkbox"></input>All Heros</div>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('effectedMainObject')} checked={sequenceItem.effectedMainObject} type="checkbox"></input>Main Object</div>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('effectedGuestObject')} checked={sequenceItem.effectedGuestObject} type="checkbox"></input>Guest Object</div>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('effectedOwnerObject')} checked={sequenceItem.effectedOwnerObject} type="checkbox"></input>Owner Object</div>
      <MultiIdSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='effectedIds' onChange={this.props._onAddEffectedId} title='Involved Ids:'/>
      <MultiTagSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='effectedTags' onChange={this.props._onAddEffectedTag} title='Involved Tags:'/>
    </Collapsible>
  }
  render() {
    const { isTrigger } = this.props
    const { sequenceItem } = this.props
    const { notificationText } = sequenceItem

    return <div className="SequenceItem__effect SequenceItem--notification">
      <div className="SequenceItem__effect-body">
        <div className="SequenceItem__effect-form">
          Text:
          <i className="fa fas fa-edit Manager__button" onClick={() => this.props._openEditTextValueModal('notificationText')}/>
          <div className="SequenceItem__summary SequenceItem__summary--json">{notificationText}</div>
          Duration:
          <div className="SequenceItem__condition-form"><i className="fa fas fa-edit Manager__button" onClick={() => { this.props._openEditNumberModal('notificationDuration') }}/>
          <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.notificationDuration}</div>
          </div>
          <Collapsible trigger='Type'>
            <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('notificationLog')} checked={sequenceItem.notificationLog} type="checkbox"></input>Log</div>
            <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('notificationChat')} checked={sequenceItem.notificationChat} type="checkbox"></input>Chat</div>
            <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('notificationToast')} checked={sequenceItem.notificationToast} type="checkbox"></input>Toast</div>
            <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('notificationModal')} checked={sequenceItem.notificationModal} type="checkbox"></input>Modal</div>
            {sequenceItem.notificationModal &&
              <React.Fragment>
                <i className="fa fas fa-edit Manager__button" onClick={() => this.props._openEditTextValueModal('notificationModalHeader')}/>
                <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.notificationModalHeader}</div>
              </React.Fragment>
            }
          </Collapsible>
        </div>
        {this._renderInvolved()}
      </div>
      <NextSelect isTrigger={this.props.isTrigger} sequenceItem={sequenceItem} nextOptions={this.props.nextOptions} nextValue={sequenceItem.next} onChange={this.props._selectNext}/>
    </div>
  }
}
