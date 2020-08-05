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
} from './SelectComponents.jsx'

export default class Condition extends React.Component {
  render() {
    const nested = this.props.nested
    const { sequenceItem } = this.props
    const { conditionType } = sequenceItem

    const conditionTypeOptions = Object.keys(window.conditionTypes).map((conditionType) => {
      return { value: conditionType, label: conditionType }
    })

    const conditionTypeChooser = <div className="SequenceItem__condition-type-chooser">
      Type: <Select
        value={{value: conditionType, label: conditionType}}
        onChange={this.props._onChangeConditionType}
        options={conditionTypeOptions}
        styles={window.reactSelectStyle}
        theme={window.reactSelectTheme}/>
    </div>

    const conditionData = window.conditionTypes[conditionType]

    let chosenConditionForm = []
    if(conditionData) {
      if(conditionData.JSON) {
        chosenConditionForm.push(<div className="SequenceItem__condition-form"><i className="fa fas fa-edit SequenceButton" onClick={() => this.props._openEditCodeModal('edit condition JSON', 'conditionJSON')}/>
          {conditionData.label || ''} <div className="SequenceItem__summary SequenceItem__summary--json">{JSON.stringify(sequenceItem.conditionJSON)}</div>
        </div>)
      }
      if(conditionData.smallText) {
        chosenConditionForm.push(<div className="SequenceItem__condition-form"><i className="fa fas fa-edit SequenceButton" onClick={this.props._openEditConditionValueModal}/>
          {conditionData.label} <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.conditionValue}</div>
        </div>)
      }
      if(conditionData.number) {
        chosenConditionForm.push(<div className="SequenceItem__condition-form"><i className="fa fas fa-edit SequenceButton" onClick={() => { this.props._openEditNumberModal('conditionValue') }}/>
          {conditionData.label} <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.conditionValue}</div>
        </div>)
      }

      if(conditionData.tag) {
        chosenConditionForm.push(<SingleTagSelect isTrigger={this.props.isTrigger} sequenceItem={sequenceItem} valueProp='conditionValue' onChange={(event) => {
         if(event.value) {
           sequenceItem.conditionValue = event.value
           this.props.setState({sequenceItem})
         }
        }} title='Tag:'/>)
      }

      if(conditionData.id) {
        chosenConditionForm.push(<SingleIdSelect isTrigger={this.props.isTrigger} sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='conditionValue' onChange={(event) => {
         if(event.value) {
           sequenceItem.conditionValue = event.value
           this.props.setState({sequenceItem})
         }
       }} title='Object:'/>)
      }

      if(conditionData.event) {
        chosenConditionForm.push(<SingleEventSelect isTrigger={this.props.isTrigger} valueProp='conditionEventName' onChange={(event) => {
         if(event.value) {
           sequenceItem.conditionEventName = event.value
           this.props.setState({sequenceItem})
         }
        }}/>)
      }
    }

    if(sequenceItem.conditionType === "onEvent") {
      chosenConditionForm.push(<React.Fragment>
          <SingleIdSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='conditionMainObjectId' onChange={(result) => {
            this.props._onSetPropValue('conditionMainObjectId', result.value)
          }} title='Main Object Id:'/>
          <SingleIdSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='conditionGuestObjectId' onChange={(result) => {
            this.props._onSetPropValue('conditionGuestObjectId', result.value)
          }} title='Guest Object Id:'/>
          <SingleTagSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='conditionMainObjectTag' onChange={(result) => {
            this.props._onSetPropValue('conditionMainObjectTag', result.value)
          }} title='Main Object Tag:'/>
          <SingleTagSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='conditionGuestObjectTag' onChange={(result) => {
            this.props._onSetPropValue('conditionGuestObjectTag', result.value)
          }} title='Guest Object Tag:'/>
        </React.Fragment>)
    }

    const isWait = sequenceItem.conditionType === 'onEvent' || sequenceItem.conditionType === 'onTimerEnd'
    const isMod = sequenceItem.effectName && sequenceItem.effectName === 'mod'
    const isHook = this.props.isHook

    return <div className={classnames("SequenceItem__condition", {"SequenceItem__condition--nested": nested})}>
          {nested && <hr></hr>}
          {nested && <h4>Mod Condition</h4>}
          {conditionTypeChooser}
          <div className="SequenceItem__condition-body">
            {chosenConditionForm}
            {!isMod && !isWait && <React.Fragment>
              <div className="SequenceItem__condition-input"><input onChange={() => this.props._onToggleValue('testMainObject')} checked={sequenceItem.testMainObject} type="checkbox"></input>Test Main Object</div>
              <div className="SequenceItem__condition-input"><input onChange={() => this.props._onToggleValue('testGuestObject')} checked={sequenceItem.testGuestObject} type="checkbox"></input>Test Guest Object</div>
              <div className="SequenceItem__condition-input"><input onChange={() => this.props._onToggleValue('testWorldObject')} checked={sequenceItem.testWorldObject} type="checkbox"></input>Test World Object</div>
              <MultiIdSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='testIds' onChange={this.props._onAddConditionTestId}/>
              <MultiTagSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='testTags' onChange={this.props._onAddConditionTestTag}/>
              <div className="SequenceItem__condition-input"><input onChange={() => this.props._onToggleValue('allTestedMustPass')} checked={sequenceItem.allTestedMustPass} type="checkbox"></input>All Tested Must Pass</div>
            </React.Fragment>}
            <div className="SequenceItem__condition-input"><input onChange={() => this.props._onToggleValue('testPassReverse')} checked={sequenceItem.testPassReverse} type="checkbox"></input>Reverse Pass and Fail</div>
            <div className="SequenceItem__condition-input"><input onChange={() => this.props._onToggleValue('testModdedVersion')} checked={sequenceItem.testModdedVersion} type="checkbox"></input>Test Modded Version</div>
            {nested && <hr></hr>}
          </div>
          {!isHook && !isWait && !nested && <NextSelect isTrigger={this.props.isTrigger} sequenceItem={sequenceItem} nextOptions={this.props.nextOptions} nextValue={sequenceItem.passNext} onChange={(event) => {
            this.props._selectNext(event, 'passNext')
          }} title='Pass Next:'/>}
          {!isHook && !isWait && !nested && <NextSelect isTrigger={this.props.isTrigger} sequenceItem={sequenceItem} nextOptions={this.props.nextOptions} nextValue={sequenceItem.failNext} onChange={(event) => {
            this.props._selectNext(event, 'failNext')
          }} title='Fail Next:'/>}
          {!isHook && isWait && <NextSelect isTrigger={this.props.isTrigger} sequenceItem={sequenceItem} nextOptions={this.props.nextOptions} nextValue={sequenceItem.next} onChange={(event) => {
            this.props._selectNext(event, 'next')
          }} title='Next:'/>}
        </div>
  }
}
