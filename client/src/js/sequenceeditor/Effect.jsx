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
    const { effectName, effectValue, effectSequenceId, notificationText } = sequenceItem

    const effectChooser = <div className="SequenceItem__condition-type-chooser">
      Effect Name: <Select
        value={{value: effectName, label: effectName}}
        onChange={this.props._onChangeEffectName}
        options={window.effectNameList.map(effectName => { return { value: effectName, label: effectName}})}
        styles={window.reactSelectStyle}
        theme={window.reactSelectTheme}/>
    </div>

    let chosenEffectForm = []
    const effectData = window.triggerEffects[effectName]
    if(effectName.length && effectData) {

      if(effectData.JSON) {
        chosenEffectForm.push(effectData.JSONlabel || '')
        chosenEffectForm.push(<i className="fa fas fa-edit Manager__button" onClick={() => this.props._openEditCodeModal('edit effect JSON', 'effectJSON')}/>)
        chosenEffectForm.push(<div className="SequenceItem__summary SequenceItem__summary--json">{JSON.stringify(sequenceItem.effectJSON)}</div>)
      }
      if(effectData.label) {
        chosenEffectForm.push(effectData.label)
      }
      if(effectData.smallText) {
        chosenEffectForm.push(<i className="fa fas fa-edit Manager__button" onClick={this.props._openEditTextModal}/>)
        chosenEffectForm.push(<div className="SequenceItem__summary SequenceItem__summary--json">{effectValue}</div>)
      } else if(effectData.largeText) {
        chosenEffectForm.push(<i className="fa fas fa-edit Manager__button" onClick={this.props._openWriteDialogueModal}/>)
        chosenEffectForm.push(<div className="SequenceItem__summary SequenceItem__summary--json">{effectValue}</div>)
      } else if(effectData.number) {
        chosenEffectForm.push(<div className="SequenceItem__condition-form"><i className="fa fas fa-edit Manager__button" onClick={() => { this.props._openEditNumberModal('effectValue') }}/>
        <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.effectValue}</div>
        </div>)
      }

      if(effectData.sequenceId) {
        chosenEffectForm.push(<div className="SequenceItem__effected">Sequence Id:<Select
          value={{value: effectSequenceId, label: effectSequenceId}}
          onChange={(event) => {
            sequenceItem.effectSequenceId = event.value
            this.props.setState({sequenceItem})
          }}
          options={Object.keys(GAME.library.sequences).map((id) => { return {value: id, label: id} })}
          styles={window.reactSelectStyle}
          theme={window.reactSelectTheme}/>
        </div>)
      }

      if(effectData.tag) {
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

      if(effectData.mapSelect) {
        chosenEffectForm.push(<div onClick={() => {
          if(BELOWMANAGER.editingSequenceItemId) return
          BELOWMANAGER.editingSequenceItemId = sequenceItem.id
          BELOWMANAGER.ref.forceUpdate()
          const removeEventListener = window.local.on('onSelectSequenceProperty', (option, objectSelected) => {
            const { sequenceItem } = this.props
            if(effectName === 'pathfindTo') {
              sequenceItem.effectValue = {
                x: objectSelected.x,
                y: objectSelected.y,
              }
            }
            if(effectName === 'goTo') {
              sequenceItem.effectValue = {
                x: objectSelected.x,
                y: objectSelected.y,
              }
            }
            if(effectName === 'teleportTo') {
              sequenceItem.effectValue = {
                x: objectSelected.x,
                y: objectSelected.y,
              }
            }
            if(effectName === 'pursue') {
              sequenceItem.effectValue = objectSelected.id
            }
            if(effectName === 'setPath') {
              sequenceItem.effectValue = objectSelected.id
            }

            this.props.setState({
              sequenceItem
            })
            removeEventListener()
          })
        }}>
          Select on map <i className="fas fa-map-marked-alt Manager__button"/>
          {typeof sequenceItem.effectValue === 'object' && sequenceItem.effectValue !== null ? <div className="SequenceItem__summary SequenceItem__summary--json">{JSON.stringify(sequenceItem.effectValue)}</div>
          : <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.effectValue}</div>}
        </div>)
      }

      if(effectName === 'mod' || effectName === 'libraryMod') {
        chosenEffectForm.push(<div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('modEndOthers')} checked={sequenceItem.modEndOthers} type="checkbox"></input>Mod End Others</div>)
        chosenEffectForm.push(<React.Fragment>
          <i className="fa fas fa-edit Manager__button" onClick={() => this.props._openEditTextValueModal('modId')}/>
          <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.modId}</div>
        </React.Fragment>)
      }
    }

    let notificationOptions = []
    if(isTrigger) {
      notificationOptions.push('Notification text:')
      notificationOptions.push(<i className="fa fas fa-edit Manager__button" onClick={() => this.props._openEditTextValueModal('notificationText')}/>)
      notificationOptions.push(<div className="SequenceItem__summary SequenceItem__summary--json">{notificationText}</div>)

      notificationOptions.push('Duration:');
      notificationOptions.push(<div className="SequenceItem__condition-form"><i className="fa fas fa-edit Manager__button" onClick={() => { this.props._openEditNumberModal('notificationDuration') }}/>
      <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.notificationDuration}</div>
      </div>);
      notificationOptions.push(<div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('notificationLog')} checked={sequenceItem.notificationLog} type="checkbox"></input>Log</div>)
      notificationOptions.push(<div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('notificationChat')} checked={sequenceItem.notificationChat} type="checkbox"></input>Chat</div>)
      notificationOptions.push(<div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('notificationToast')} checked={sequenceItem.notificationToast} type="checkbox"></input>Toast</div>)
      notificationOptions.push(<div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('notificationModal')} checked={sequenceItem.notificationModal} type="checkbox"></input>Modal</div>)
      notificationOptions.push(<div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('notificationAllHeros')} checked={sequenceItem.notificationAllHeros} type="checkbox"></input>Notify All Heros</div>)
      if(sequenceItem.notificationModal) {
        notificationOptions.push('Modal Header:');
        notificationOptions.push(<React.Fragment>
          <i className="fa fas fa-edit Manager__button" onClick={() => this.props._openEditTextValueModal('notificationModalHeader')}/>
          <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.notificationModalHeader}</div>
        </React.Fragment>)
      }
    }

    return <div className={classnames("SequenceItem__effect")}>
      {effectChooser}
      <div className="SequenceItem__effect-body">
        <div className="SequenceItem__effect-form">
          <Collapsible trigger='Effect properties'>{chosenEffectForm}</Collapsible>
          {notificationOptions.length > 0 && <Collapsible trigger='Notifications'>{notificationOptions}</Collapsible>}
        </div>
        <Collapsible trigger='Effected objects'>{this._renderEffecteds()}</Collapsible>
      </div>
      <NextSelect isTrigger={this.props.isTrigger} sequenceItem={sequenceItem} nextOptions={this.props.nextOptions} nextValue={sequenceItem.next} onChange={this.props._selectNext}/>
    </div>
  }
}
