import React from 'react'
import modals from './modals.js'
import Select from 'react-select'
import classnames from 'classnames'
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
import Condition from './Condition.jsx'

export default class Effect extends React.Component{
  _renderEffecteds() {
    const { isTrigger } = this.props
    const { sequenceItem } = this.props
    const { effectName } = sequenceItem
    const effectData = window.triggerEffects[effectName]

    if(effectName.length && effectData.noEffected) return null

    return <React.Fragment>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('effectedMainObject')} checked={sequenceItem.effectedMainObject} type="checkbox"></input>Effect Main Object</div>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('effectedGuestObject')} checked={sequenceItem.effectedGuestObject} type="checkbox"></input>Effect Guest Object</div>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('effectedOwnerObject')} checked={sequenceItem.effectedOwnerObject} type="checkbox"></input>Effect Owner Object</div>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('effectedWorldObject')} checked={sequenceItem.effectedWorldObject} type="checkbox"></input>Effect World Object</div>
      <MultiIdSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='effectedIds' onChange={this.props._onAddEffectedId} title='Effected Ids:'/>
      <MultiTagSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='effectedTags' onChange={this.props._onAddEffectedTag} title='Effected Tags:'/>
    </React.Fragment>
  }
  render() {
    // effector: false,
    // position: false,
    // JSON: false,
    // effectValue: false,
    // tag: false,
    // eventName: false,
    // id: false,
    // number: false,
    // smallText: false,
    // largeText: false
    // heroOnly: false
    // sequenceId: false
    const { isTrigger } = this.props
    const { sequenceItem } = this.props
    const { effectName } = sequenceItem

    const effectChooser = <div className="SequenceItem__condition-type-chooser">
      Effect Name: <Select
        value={{value: effectName, label: effectName}}
        onChange={this.props._onChangeEffectName}
        options={window.effectNameList.map(effectName => { return { value: effectName, label: effectName}})}
        styles={window.reactSelectStyle}
        theme={window.reactSelectTheme}/>
    </div>

    let chosenEffectForm = []
    if(effectName.length) {
      const effectData = window.triggerEffects[effectName]

      const { effectValue, effectSequenceId } = sequenceItem
      if(effectData.JSON) {
        chosenEffectForm.push(effectData.JSONlabel || '')
        chosenEffectForm.push(<i className="fa fas fa-edit SequenceButton" onClick={() => this.props._openEditCodeModal('edit effect JSON', 'effectJSON')}/>)
        chosenEffectForm.push(<div className="SequenceItem__summary SequenceItem__summary--json">{JSON.stringify(sequenceItem.effectJSON)}</div>)
      }
      if(effectData.label) {
        chosenEffectForm.push(effectData.label)
      }
      if(effectData.smallText) {
        chosenEffectForm.push(<i className="fa fas fa-edit SequenceButton" onClick={this.props._openEditTextModal}/>)
        chosenEffectForm.push(<div className="SequenceItem__summary SequenceItem__summary--json">{effectValue}</div>)
      } else if(effectData.largeText) {
        chosenEffectForm.push(<i className="fa fas fa-edit SequenceButton" onClick={this.props._openWriteDialogueModal}/>)
        chosenEffectForm.push(<div className="SequenceItem__summary SequenceItem__summary--json">{effectValue}</div>)
      } else if(effectData.number) {
        chosenEffectForm.push(<div className="SequenceItem__condition-form"><i className="fa fas fa-edit SequenceButton" onClick={() => { this.props._openEditNumberModal('effectValue') }}/>
      {effectData.label} <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.effectValue}</div>
        </div>)
      } else if(effectData.sequenceId) {
        chosenEffectForm.push(<div className="SequenceItem__effected">Sequence Id:<Select
          value={{value: effectSequenceId, label: effectSequenceId}}
          onChange={(event) => {
            sequenceItem.effectSequenceId = event.value
            this.props.setState({sequenceItem})
          }}
          options={Object.keys(GAME.world.sequences).map((id) => { return {value: id, label: id} })}
          styles={window.reactSelectStyle}
          theme={window.reactSelectTheme}/>
        </div>)
      } else if(effectData.tag) {
        chosenEffectForm.push(<MultiTagSelect title="Add Tags:" sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='effectTags' onChange={ (event) => {
          if(event) {
            sequenceItem.effectTags = event.map(({value}) => value)
            this.props.setState({sequenceItem})
          }
        }}/>)
      }

      if(effectData.effectorObject) {
        chosenEffectForm.push(<SingleIdSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='effector' onChange={(event) => {
         if(event.value) {
           sequenceItem.effector = event.value
           this.props.setState({sequenceItem})
         }
       }}
       title ='Effector:'/>)
      }

      if(effectData.condition) {
        chosenEffectForm.push(<Condition nested {...this.props} setState={this.props.setState}/>)
      }

      if(effectData.libraryObject) {
        chosenEffectForm.push(<SingleLibraryObjectSelect sequenceItem={sequenceItem} valueProp='effectLibraryObject' onChange={(event) => {
         if(event.value) {
           sequenceItem.effectLibraryObject = event.value
           this.props.setState({sequenceItem})
         }
       }}/>)
      }

      if(effectData.libraryMod) {
        chosenEffectForm.push(<SingleLibraryModSelect sequenceItem={sequenceItem} valueProp='effectLibraryMod' onChange={(event) => {
         if(event.value) {
           sequenceItem.effectLibraryMod = event.value
           this.props.setState({sequenceItem})
         }
       }}/>)
      }
    }

    return <div className="SequenceItem__effect">
      {effectChooser}
      <div className="SequenceItem__effect-body">
        <div className="SequenceItem__effect-form">
          {chosenEffectForm}
        </div>
        {this._renderEffecteds()}
      </div>
      <NextSelect isTrigger={this.props.isTrigger} sequenceItem={sequenceItem} nextOptions={this.props.nextOptions} nextValue={sequenceItem.next} onChange={this.props._selectNext}/>
    </div>
  }
}
