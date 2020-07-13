import React from 'react'
import modals from './modals.js'
import Select from 'react-select'
import classnames from 'classnames'

const initialNextOptions = [
  { value: 'sequential', label: 'Next in list' },
  { value: 'end', label: 'End Sequence' },
  // { value: 'disable', label: 'Disable Sequence' },
];

export default class SequenceItem extends React.Component{
  constructor(props) {
    super(props)
    const { sequenceItem } = this.props;

    this.state = {
      sequenceItem: {...sequenceItem},
      nextOptions: initialNextOptions,
    }

    this._selectNext = this._selectNext.bind(this)
    this._addOption = this._addOption.bind(this)
    this._onAddConditionTestId = this._onAddConditionTestId.bind(this)
    this._onAddConditionTestTag = this._onAddConditionTestTag.bind(this)
    this._onAddEffectedId = this._onAddEffectedId.bind(this)
    this._onAddEffectedTag = this._onAddEffectedTag.bind(this)
    this._onToggleValue = this._onToggleValue.bind(this)
    this._openWriteDialogueModal = this._openWriteDialogueModal.bind(this)
    this._openEditTextModal = this._openEditTextModal.bind(this)
    this._openEditNumberModal = this._openEditNumberModal.bind(this)
    this._openEditCodeModal = this._openEditCodeModal.bind(this)
    this._openEditConditionValueModal = this._openEditConditionValueModal.bind(this)
    this._onChangeConditionType = this._onChangeConditionType.bind(this)
    this._onChangeEffectName = this._onChangeEffectName.bind(this)
  }

  componentDidMount() {
    this._updateNextOptions()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.sequenceList && prevProps.sequenceList.length !== this.props.sequenceList.length) {
      this._updateNextOptions()
    }
  }

  getItemValue() {
    return this.state.sequenceItem
  }

  _updateNextOptions() {
    const { isTrigger, sequenceList } = this.props;
    if(isTrigger) return

    this.setState({
      nextOptions: initialNextOptions.concat(sequenceList.map((sequenceItem) => {
        return {
          value: sequenceItem.id,
          label: 'Go to ' + sequenceItem.id
        }
      }))
    })
  }

  _openEditTextModal() {
    const { sequenceItem } = this.state;

    modals.openEditTextModal('edit effect value', sequenceItem.effectValue, (result) => {
      if(result && result.value) {
        sequenceItem.effectValue = result.value
        this.setState({sequenceItem})
      }
    })
  }

  _openEditCodeModal(label, value) {
    const { sequenceItem } = this.state;

    modals.openEditCodeModal(label, sequenceItem[value], (result) => {
      if(result && result.value) {
        sequenceItem[value] = JSON.parse(result.value)
        this.setState({sequenceItem})
      }
    })
  }

  _openEditNumberModal(value) {
    const { sequenceItem } = this.state;

    modals.openEditNumberModal(value, sequenceItem[value], {}, (result) => {
      if(result && result.value) {
        sequenceItem[value] = Number(result.value)
        this.setState({sequenceItem})
      }
    })
  }

  _openEditConditionValueModal() {
    const { sequenceItem } = this.state;

    modals.openEditTextModal('edit condition value', sequenceItem.conditionValue, (result) => {
      if(result && result.value) {
        sequenceItem.conditionValue = result.value
        this.setState({sequenceItem})
      }
    })
  }

  _onChangeConditionType(event) {
    const { sequenceItem } = this.state;
    const type = event.value

    const isWait = sequenceItem.conditionType === 'onEvent' || sequenceItem.conditionType === 'onTimerEnd'
    const isMod = sequenceItem.effectName && sequenceItem.effectName === 'mod'

    if(!isWait && !isMod) {
      if(type === 'onTimerEnd' || type === 'onEvent') {
        sequenceItem.sequenceType = 'sequenceWait'
      } else {
        sequenceItem.sequenceType = 'sequenceCondition'
      }
    }

    sequenceItem.conditionType = event.value
    this.setState({sequenceItem})
  }

  _onChangeEffectName(event) {
    const { sequenceItem } = this.state;
    sequenceItem.effectName = event.value
    this.setState({sequenceItem})
  }

  _openWriteDialogueModal(index) {
    const { sequenceItem } = this.state;

    let initial = ''
    if(sequenceItem.sequenceType === 'sequenceDialogue' || sequenceItem.sequenceType === 'sequenceEffect' ) {
      initial = sequenceItem.effectValue
    }
    if(sequenceItem.sequenceType === 'sequenceChoice') {
      initial = sequenceItem.options[index].effectValue
    }

    modals.openWriteDialogueModal(initial, (result) => {

      if(sequenceItem.sequenceType === 'sequenceDialogue' || sequenceItem.sequenceType === 'sequenceEffect') {
        this.setState({
          sequenceItem: {...sequenceItem, effectValue: result.value}
        })
      }

      if(sequenceItem.sequenceType === 'sequenceChoice') {
        sequenceItem.options[index].effectValue = result.value
        this.setState({sequenceItem})
      }
    })
  }

  _selectNext(event, prop) {
    const { sequenceItem } = this.state;
    if(sequenceItem.sequenceType === 'sequenceDialogue' || sequenceItem.sequenceType === 'sequenceEffect') {
      sequenceItem.next = event.value
    }
    if(sequenceItem.sequenceType === 'sequenceChoice') {
      sequenceItem.options[prop].next = event.value
    }
    if(sequenceItem.sequenceType === 'sequenceCondition') {
      sequenceItem[prop] = event.value
    }
    this.setState({sequenceItem})
  };

  _addOption() {
    const { sequenceItem } = this.state;
    const newOptions = sequenceItem.options.slice()
    newOptions.push({ effectValue: '', next: 'sequential' })
    sequenceItem.options = newOptions
    this.setState(sequenceItem)
  }

  _onAddConditionTestId(event) {
    const { sequenceItem } = this.state;
    sequenceItem.testIds = event.map(({value}) => value)
    this.setState(sequenceItem)
  }

  _onAddConditionTestTag(event) {
    const { sequenceItem } = this.state;
    sequenceItem.testTags = event.map(({value}) => value)
    this.setState(sequenceItem)
  }

  _onAddEffectedId(event) {
    const { sequenceItem } = this.state;
    sequenceItem.effectedIds = event.map(({value}) => value)
    this.setState(sequenceItem)
  }

  _onAddEffectedTag(event) {
    const { sequenceItem } = this.state;
    sequenceItem.effectedTags = event.map(({value}) => value)
    this.setState(sequenceItem)
  }

  _onToggleValue(value) {
    const { sequenceItem } = this.state;
    sequenceItem[value] = !sequenceItem[value]
    this.setState(sequenceItem)
  }

  _onSetPropValue(prop, value) {
    const { sequenceItem } = this.state;
    sequenceItem[prop] = value
    this.setState(sequenceItem)
  }

  _renderDialogue() {
    const { sequenceItem } = this.state;
    return <div className="SequenceItem__dialogue">
      <i className="fa fas fa-edit SequenceButton" onClick={this._openWriteDialogueModal}/>
      Dialogue: <div className="SequenceItem__summary">{sequenceItem.effectValue}</div>
      {this._renderNextSelect(sequenceItem.next, this._selectNext)}
    </div>
  }

  _renderChoice() {
    const { sequenceItem } = this.state;
    return <div className="SequenceItem__choice">
      {sequenceItem.options.map((option, index) => {
        return <div key={sequenceItem.id + '-' + index} className="SequenceItem__option" >
          <h4>{'Option ' + (index + 1)}</h4>
          <i className="fa fas fa-edit SequenceButton" onClick={() => {
            this._openWriteDialogueModal(index)
          }}/>
        Text:<div className="SequenceItem__summary">{option.effectValue}</div>
          {this._renderNextSelect(option.next, (event) => {
            this._selectNext(event, index)
          })}
        </div>
      })}
      <i className="fa fas fa-plus SequenceButton" onClick={this._addOption}/>
    </div>
  }

  _renderEffect() {
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
    const { sequenceItem } = this.state
    const { effectName } = sequenceItem

    const effectChooser = <div className="SequenceItem__condition-type-chooser">
      Effect Name: <Select
        value={{value: effectName, label: effectName}}
        onChange={this._onChangeEffectName}
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
        chosenEffectForm.push(<i className="fa fas fa-edit SequenceButton" onClick={() => this._openEditCodeModal('edit effect JSON', 'effectJSON')}/>)
        chosenEffectForm.push(<div className="SequenceItem__summary SequenceItem__summary--json">{JSON.stringify(sequenceItem.effectJSON)}</div>)
      }
      if(effectData.label) {
        chosenEffectForm.push(effectData.label)
      }
      if(effectData.smallText) {
        chosenEffectForm.push(<i className="fa fas fa-edit SequenceButton" onClick={this._openEditTextModal}/>)
        chosenEffectForm.push(<div className="SequenceItem__summary SequenceItem__summary--json">{effectValue}</div>)
      } else if(effectData.largeText) {
        chosenEffectForm.push(<i className="fa fas fa-edit SequenceButton" onClick={this._openWriteDialogueModal}/>)
        chosenEffectForm.push(<div className="SequenceItem__summary SequenceItem__summary--json">{effectValue}</div>)
      } else if(effectData.number) {

      } else if(effectData.sequenceId) {
        chosenEffectForm.push(<div className="SequenceItem__effected">Sequence Id:<Select
          value={{value: effectSequenceId, label: effectSequenceId}}
          onChange={(event) => {
            sequenceItem.effectSequenceId = event.value
            this.setState({sequenceItem})
          }}
          options={Object.keys(GAME.world.sequences).map((id) => { return {value: id, label: id} })}
          styles={window.reactSelectStyle}
          theme={window.reactSelectTheme}/>
        </div>)
      } else if(effectData.tag) {
        chosenEffectForm.push(this._renderTagSelect('effectTags', (event) => {
          if(event) {
            sequenceItem.effectTags = event.map(({value}) => value)
            this.setState({sequenceItem})
          }
        }, 'Add Tags:'))
      }

      if(effectData.effectorObject) {
        chosenEffectForm.push(this._renderSingleIdSelect('effector', (event) => {
         if(event.value) {
           sequenceItem.effector = event.value
           this.setState({sequenceItem})
         }}, 'Effector:'))
      }

      if(effectData.condition) {
        chosenEffectForm.push(this._renderCondition(true))
      }
    }

    return <div className="SequenceItem__effect">
      {effectChooser}
      <div className="SequenceItem__effect-body">
        <div className="SequenceItem__effect-form">
          {chosenEffectForm}
        </div>
        {isTrigger && <div className="SequenceItem__effect-input"><input onChange={() => this._onToggleValue('effectedOwnerObject')} checked={sequenceItem.effectedOwnerObject} type="checkbox"></input>Effect Owner Object</div>}
        <div className="SequenceItem__effect-input"><input onChange={() => this._onToggleValue('effectedMainObject')} checked={sequenceItem.effectedMainObject} type="checkbox"></input>Effect Main Object</div>
        <div className="SequenceItem__effect-input"><input onChange={() => this._onToggleValue('effectedOwnerObject')} checked={sequenceItem.effectedGuestObject} type="checkbox"></input>Effect Guest Object</div>
        <div className="SequenceItem__effect-input"><input onChange={() => this._onToggleValue('effectedWorldObject')} checked={sequenceItem.effectedWorldObject} type="checkbox"></input>Effect World Object</div>
        {this._renderIdSelect('effectedIds', this._onAddEffectedId, 'Effected Ids:')}
        {this._renderTagSelect('effectedTags', this._onAddEffectedTag, 'Effected Tags:')}
      </div>
      {this._renderNextSelect(sequenceItem.next, this._selectNext)}
    </div>
  }

  _renderCondition(nested) {
    const { sequenceItem } = this.state
    const { conditionType } = sequenceItem

    const conditionTypeOptions = Object.keys(window.conditionTypes).map((conditionType) => {
      return { value: conditionType, label: conditionType }
    })

    const conditionTypeChooser = <div className="SequenceItem__condition-type-chooser">
      Type: <Select
        value={{value: conditionType, label: conditionType}}
        onChange={this._onChangeConditionType}
        options={conditionTypeOptions}
        styles={window.reactSelectStyle}
        theme={window.reactSelectTheme}/>
    </div>

    const conditionData = window.conditionTypes[conditionType]

    let chosenConditionForm = []
    if(conditionData) {
      if(conditionData.JSON) {
        chosenConditionForm.push(<div className="SequenceItem__condition-form"><i className="fa fas fa-edit SequenceButton" onClick={() => this._openEditCodeModal('edit condition JSON', 'conditionJSON')}/>
          {conditionData.label || ''} <div className="SequenceItem__summary SequenceItem__summary--json">{JSON.stringify(sequenceItem.conditionJSON)}</div>
        </div>)
      }
      if(conditionData.smallText) {
        chosenConditionForm.push(<div className="SequenceItem__condition-form"><i className="fa fas fa-edit SequenceButton" onClick={this._openEditConditionValueModal}/>
          {conditionData.label} <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.conditionValue}</div>
        </div>)
      }
      if(conditionData.number) {
        chosenConditionForm.push(<div className="SequenceItem__condition-form"><i className="fa fas fa-edit SequenceButton" onClick={() => { this._openEditNumberModal('conditionValue') }}/>
          {conditionData.label} <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.conditionValue}</div>
        </div>)
      }

      if(conditionData.tag) {
        chosenConditionForm.push(this._renderSingleTagSelect('conditionValue', (event) => {
         if(event.value) {
           sequenceItem.conditionValue = event.value
           this.setState({sequenceItem})
         }
        }, 'Tag:'))
      }

      if(conditionData.id) {
        chosenConditionForm.push(this._renderSingleIdSelect('conditionValue', (event) => {
         if(event.value) {
           sequenceItem.conditionValue = event.value
           this.setState({sequenceItem})
         }
        }, 'Object:'))
      }

      if(conditionData.event) {
        chosenConditionForm.push(this._renderSingleEventSelect('conditionEventName', (event) => {
         if(event.value) {
           sequenceItem.conditionEventName = event.value
           this.setState({sequenceItem})
         }
        }))
      }
    }

    if(sequenceItem.conditionType === "onEvent") {
      chosenConditionForm.push(<React.Fragment>
          {this._renderSingleIdSelect('mainObjectId', (result) => {
            this._onSetPropValue('mainObjectId', result.value)
          }, 'Main Object Id:')}
          {this._renderSingleIdSelect('guestObjectId', (result) => {
            this._onSetPropValue('guestObjectId', result.value)
          }, 'Guest Object Id:')}
          {this._renderSingleTagSelect('mainObjectTag', (result) => {
            this._onSetPropValue('mainObjectTag', result.value)
          }, 'Main Object Tag:')}
          {this._renderSingleTagSelect('guestObjectTag', (result) => {
            this._onSetPropValue('guestObjectTag', result.value)
          }, 'Guest Object Tag:')}
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
              <div className="SequenceItem__condition-input"><input onChange={() => this._onToggleValue('testMainObject')} checked={sequenceItem.testMainObject} type="checkbox"></input>Test Main Object</div>
              <div className="SequenceItem__condition-input"><input onChange={() => this._onToggleValue('testGuestObject')} checked={sequenceItem.testGuestObject} type="checkbox"></input>Test Guest Object</div>
              <div className="SequenceItem__condition-input"><input onChange={() => this._onToggleValue('testWorldObject')} checked={sequenceItem.testWorldObject} type="checkbox"></input>Test World Object</div>
              {this._renderIdSelect('testIds', this._onAddConditionTestId)}
              {this._renderTagSelect('testTags', this._onAddConditionTestTag)}
              <div className="SequenceItem__condition-input"><input onChange={() => this._onToggleValue('allTestedMustPass')} checked={sequenceItem.allTestedMustPass} type="checkbox"></input>All Tested Must Pass</div>
            </React.Fragment>}
            <div className="SequenceItem__condition-input"><input onChange={() => this._onToggleValue('testPassReverse')} checked={sequenceItem.testPassReverse} type="checkbox"></input>Reverse Pass and Fail</div>
            <div className="SequenceItem__condition-input"><input onChange={() => this._onToggleValue('testModdedVersion')} checked={sequenceItem.testModdedVersion} type="checkbox"></input>Test Modded Version</div>
            {nested && <hr></hr>}
          </div>
          {!isHook && !isWait && !nested && this._renderNextSelect(sequenceItem.passNext, (event) => {
            this._selectNext(event, 'passNext')
          }, 'Pass Next:')}
          {!isHook && !isWait && !nested && this._renderNextSelect(sequenceItem.failNext, (event) => {
            this._selectNext(event, 'failNext')
          }, 'Fail Next:')}
          {!isHook && isWait && this._renderNextSelect(sequenceItem.next, (event) => {
            this._selectNext(event, 'next')
          }, 'Next:')}
        </div>
  }

  _renderNextSelect(nextValue, onChange, title) {
    const { sequenceItem, nextOptions } = this.state;
    const { isTrigger } = this.props;

    if(isTrigger) return null

    const selectedNext = nextOptions.filter((option) => {
      if(option.value === nextValue) return true
    })[0]

    return <div className="SequenceItem__next">{title || 'Next:'}<Select
      value={selectedNext}
      onChange={onChange}
      options={nextOptions}
      styles={window.reactSelectStyle}
      theme={window.reactSelectTheme}/></div>
  }


  _renderSingleEventSelect(valueProp, onChange, title) {
    const { sequenceItem } = this.state;

    return <div className="SequenceItem__test">{title || 'Event: '}<Select
      value={{ value: sequenceItem[valueProp], label: sequenceItem[valueProp]}}
      onChange={onChange}
      options={Object.keys(window.triggerEvents).map(eventName => { return { value: eventName, label: eventName}})}
      styles={window.reactSelectStyle}
      theme={window.reactSelectTheme}/>
    </div>
  }

  _renderTagSelect(valueProp, onChange, title) {
    const { sequenceItem } = this.state;

    return <div className="SequenceItem__test">{title || 'Test Tags:'}<Select
      value={sequenceItem[valueProp] && sequenceItem[valueProp].map((tags) => { return { value: tags, label: tags} })}
      onChange={onChange}
      options={Object.keys({...GAME.tags, ...window.allTags}).map(tag => { return { value: tag, label: tag}})}
      styles={window.reactSelectStyle}
      isMulti
      theme={window.reactSelectTheme}/>
    </div>
  }

  _renderIdSelect(valueProp, onChange, title) {
    const { sequenceItem } = this.state;

    return <div className="SequenceItem__test">{title || 'Test Ids:'}<Select
      value={sequenceItem[valueProp] && sequenceItem[valueProp].map((id) => { return {value: id, label: id} })}
      onChange={onChange}
      options={GAME.objects.map(({id}) => { return {value: id, label: id} }).concat(GAME.heroList.map(({id}) => { return { value: id, label: id} }))}
      styles={window.reactSelectStyle}
      isMulti
      theme={window.reactSelectTheme}/>
    </div>
  }

  _renderSingleIdSelect(valueProp, onChange, title) {
    const { sequenceItem } = this.state;
    const { isTrigger } = this.props;

    const options = [{value: 'default', label: 'default'}, {value: 'mainObject', label: 'mainObject'}, {value: 'guestObject', label: 'guestObject'}, ...GAME.objects.map(({id}) => { return {value: id, label: id} }).concat(GAME.heroList.map(({id}) => { return { value: id, label: id} }))]
    if(isTrigger) {
      options.unshift({value: 'ownerObject', label: 'ownerObject'})
    }

    return <div className="SequenceItem__test">{title || 'Test Ids:'}<Select
      value={{value: sequenceItem[valueProp], label: sequenceItem[valueProp]}}
      onChange={onChange}
      options={options}
      styles={window.reactSelectStyle}
      theme={window.reactSelectTheme}/>
    </div>
  }

  _renderSingleTagSelect(valueProp, onChange, title) {
    const { sequenceItem } = this.state;

    return <div className="SequenceItem__test">{title || 'Test Tags:'}<Select
      value={{ value: sequenceItem[valueProp], label: sequenceItem[valueProp]}}
      onChange={onChange}
      options={Object.keys({...GAME.tags, ...window.allTags}).map(tag => { return { value: tag, label: tag}})}
      styles={window.reactSelectStyle}
      theme={window.reactSelectTheme}/>
    </div>
  }

  render() {
    const { sequenceItem } = this.state;
    const { onDelete, isTrigger } = this.props;

    return (
      <div className={classnames("SequenceItem SequenceItem--" + sequenceItem.sequenceType, { "SequenceItem--trigger": isTrigger })}>
        {!isTrigger && <div className="SequenceItem__identifier">{sequenceItem.id}</div>}
        {!isTrigger && <div className="SequenceItem__type">{sequenceItem.sequenceType}</div>}
        {!isTrigger && <i className="SequenceButton SequenceItem__delete fa fas fa-times" onClick={onDelete}></i>}
        <div className="SequenceItem__body">
          {sequenceItem.sequenceType == 'sequenceDialogue' && this._renderDialogue()}
          {sequenceItem.sequenceType == 'sequenceChoice' && this._renderChoice()}
          {sequenceItem.sequenceType == 'sequenceCondition' && this._renderCondition()}
          {sequenceItem.sequenceType == 'sequenceEffect' && this._renderEffect()}
          {sequenceItem.sequenceType == 'sequenceWait' && this._renderCondition()}
        </div>
      </div>
    )
  }
}
