import React from 'react'
import modals from './modals.js'
import Select from 'react-select';

const initialNextOptions = [
  { value: 'sequential', label: 'Next in list' },
  { value: 'end', label: 'End Scenario' },
  { value: 'disable', label: 'Disable Scenario' },
];

const conditionTypeOptions = [
  { value: 'matchJSON', label: 'matchJSON' },
  { value: 'insideOfObjectWithTag', label: 'insideOfObjectWithTag' },
  { value: 'hasTag', label: 'hasTag' },
  { value: 'hasMod', label: 'hasMod' },
  { value: 'hasSubObject', label: 'hasSubObject' },
  { value: 'isSubObjectEquipped', label: 'isSubObjectEquipped' },
  { value: 'isSubObjectInInventory', label: 'isSubObjectInInventory' },
  { value: 'hasCompletedQuest', label: 'hasCompletedQuest' },
  { value: 'hasStartedQuest', label: 'hasStartedQuest' },
  { value: 'duringTime', label: 'duringTime' },
]

export default class ScenarioItem extends React.Component{
  constructor(props) {
    super(props)
    const { scenarioItem } = this.props;

    this.state = {
      scenarioItem: {...scenarioItem},
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
    this._openEditCodeModal = this._openEditCodeModal.bind(this)
    this._openEditConditionValueModal = this._openEditConditionValueModal.bind(this)
    this._onChangeConditionType = this._onChangeConditionType.bind(this)
    this._onChangeEffectName = this._onChangeEffectName.bind(this)
  }

  componentDidMount() {
    this._updateNextOptions()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.scenarioList.length !== this.props.scenarioList.length) {
      this._updateNextOptions()
    }
  }

  getItemValue() {
    return this.state.scenarioItem
  }

  _updateNextOptions() {
    const { scenarioList } = this.props;

    this.setState({
      nextOptions: initialNextOptions.concat(scenarioList.map((scenarioItem) => {
        return {
          value: scenarioItem.id,
          label: 'Go to ' + scenarioItem.id
        }
      }))
    })
  }

  _openEditTextModal() {
    const { scenarioItem } = this.state;

    modals.openEditTextModal('edit effect value', scenarioItem.effectValue, (result) => {
      if(result && result.value) {
        scenarioItem.effectValue = result.value
        this.setState({scenarioItem})
      }
    })
  }

  _openEditCodeModal() {
    const { scenarioItem } = this.state;

    modals.openEditCodeModal('edit condition JSON', scenarioItem.conditionJSON, (result) => {
      if(result && result.value) {
        if(scenarioItem.type === 'branchCondition') {
          scenarioItem.conditionJSON = JSON.parse(result.value)
        } else if(scenarioItem.type === 'effect') {
          scenarioItem.effectJSON = JSON.parse(result.value)
        }
        this.setState({scenarioItem})
      }
    })
  }

  _openEditConditionValueModal() {
    const { scenarioItem } = this.state;

    modals.openEditTextModal('edit condition value', scenarioItem.conditionValue, (result) => {
      if(result && result.value) {
        scenarioItem.conditionValue = result.value
        this.setState({scenarioItem})
      }
    })
  }

  _onChangeConditionType(event) {
    const { scenarioItem } = this.state;
    scenarioItem.conditionType = event.value
    this.setState({scenarioItem})
  }

  _onChangeEffectName(event) {
    const { scenarioItem } = this.state;
    scenarioItem.effectName = event.value
    this.setState({scenarioItem})
  }

  _openWriteDialogueModal(index) {
    const { scenarioItem } = this.state;

    let initial = ''
    if(scenarioItem.type === 'dialogue' || scenarioItem.type === 'effect' ) {
      initial = scenarioItem.effectValue
    }
    if(scenarioItem.type === 'branchChoice') {
      initial = scenarioItem.options[index].effectValue
    }

    modals.openWriteDialogueModal(initial, (result) => {

      if(scenarioItem.type === 'dialogue' || scenarioItem.type === 'effect') {
        this.setState({
          scenarioItem: {...scenarioItem, effectValue: result.value}
        })
      }

      if(scenarioItem.type === 'branchChoice') {
        scenarioItem.options[index].effectValue = result.value
        this.setState({scenarioItem})
      }
    })
  }

  _selectNext(event, prop) {
    const { scenarioItem } = this.state;
    if(scenarioItem.type === 'dialogue' || scenarioItem.type === 'effect') {
      scenarioItem.next = event.value
    }
    if(scenarioItem.type === 'branchChoice') {
      scenarioItem.options[prop].next = event.value
    }
    if(scenarioItem.type === 'branchCondition') {
      scenarioItem[prop] = event.value
    }
    this.setState({scenarioItem})
  };

  _addOption() {
    const { scenarioItem } = this.state;
    const newOptions = scenarioItem.options.slice()
    newOptions.push({ effectValue: '', next: 'sequential' })
    scenarioItem.options = newOptions
    this.setState(scenarioItem)
  }

  _onAddConditionTestId(event) {
    const { scenarioItem } = this.state;
    scenarioItem.testIds = event.map(({value}) => value)
    this.setState(scenarioItem)
  }

  _onAddConditionTestTag(event) {
    const { scenarioItem } = this.state;
    scenarioItem.testTags = event.map(({value}) => value)
    this.setState(scenarioItem)
  }

  _onAddEffectedId(event) {
    const { scenarioItem } = this.state;
    scenarioItem.effectedIds = event.map(({value}) => value)
    this.setState(scenarioItem)
  }

  _onAddEffectedTag(event) {
    const { scenarioItem } = this.state;
    scenarioItem.effectedTags = event.map(({value}) => value)
    this.setState(scenarioItem)
  }

  _onToggleValue(value) {
    const { scenarioItem } = this.state;
    scenarioItem[value] = !scenarioItem[value]
    this.setState(scenarioItem)
  }

  _renderDialogue() {
    const { scenarioItem } = this.state;
    return <div className="ScenarioItem__dialogue">
      <i className="fa fas fa-edit ScenarioButton" onClick={this._openWriteDialogueModal}/>
      Dialogue: <div className="ScenarioItem__summary">{scenarioItem.effectValue}</div>
      {this._renderNextSelect(scenarioItem.next, this._selectNext)}
    </div>
  }

  _renderChoice() {
    const { scenarioItem } = this.state;
    return <div className="ScenarioItem__choice">
      {scenarioItem.options.map((option, index) => {
        return <div key={scenarioItem.id + '-' + index} className="ScenarioItem__option" >
          <h4>{'Option ' + (index + 1)}</h4>
          <i className="fa fas fa-edit ScenarioButton" onClick={() => {
            this._openWriteDialogueModal(index)
          }}/>
        Text:<div className="ScenarioItem__summary">{option.effectValue}</div>
          {this._renderNextSelect(option.next, (event) => {
            this._selectNext(event, index)
          })}
        </div>
      })}
      <i className="fa fas fa-plus ScenarioButton" onClick={this._addOption}/>
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
    const { scenarioItem } = this.state
    const { effectName } = scenarioItem

    const effectChooser = <div className="ScenarioItem__condition-type-chooser">
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

      const { effectValue } = scenarioItem
      if(effectData.JSON) {
        chosenEffectForm.push(<i className="fa fas fa-edit ScenarioButton" onClick={this._openEditCodeModal}/>)
        chosenEffectForm.push(<div className="ScenarioItem__summary ScenarioItem__summary--json">{JSON.stringify(scenarioItem.effectJSON)}</div>)
      }
      if(effectData.smallText) {
        chosenEffectForm.push(<i className="fa fas fa-edit ScenarioButton" onClick={this._openEditTextModal}/>)
        chosenEffectForm.push(<div className="ScenarioItem__summary ScenarioItem__summary--json">{effectValue}</div>)
      } else if(effectData.largeText) {
        chosenEffectForm.push(<i className="fa fas fa-edit ScenarioButton" onClick={this._openWriteDialogueModal}/>)
        chosenEffectForm.push(<div className="ScenarioItem__summary ScenarioItem__summary--json">{effectValue}</div>)
      } else if(effectData.number) {

      } else if(effectData.sequenceId) {
        chosenEffectForm.push(<div className="ScenarioItem__effected">Sequence Id:<Select
          value={{value: effectValue, label: effectValue}}
          onChange={(event) => {
            scenarioItem.sequenceId = event.value
            this.setState({scenarioItem})
          }}
          options={Object.keys(GAME.world.sequences).map((id) => { return {value: id, label: id} })}
          styles={window.reactSelectStyle}
          theme={window.reactSelectTheme}/>
        </div>)
      } else if(effectData.tag) {
        chosenEffectForm.push(this._renderTagSelect('effectTags', (event) => {
          if(event) {
            scenarioItem.effectTags = event.map(({value}) => value)
            this.setState({scenarioItem})
          }
        }, 'Add Tags:'))
      }

      if(effectData.effector) {
        chosenEffectForm.push(this._renderSingleIdSelect('effector', this._onChangeEffector, 'Effector:'))
      }
    }

    return <div className="ScenarioItem__effect">
      {effectChooser}
      <div className="ScenarioItem__effect-body">
        <div className="ScenarioItem__effect-form">
          {chosenEffectForm}
        </div>
        <div className="ScenarioItem__effect-input"><input onClick={() => this._onToggleValue('effectedMainObject')} value={scenarioItem.effectedMainObject} type="checkbox"></input>Effect Main Object</div>
        <div className="ScenarioItem__effect-input"><input onClick={() => this._onToggleValue('effectedGuestObject')} value={scenarioItem.effectedGuestObject} type="checkbox"></input>Effect Guest Object</div>
        <div className="ScenarioItem__effect-input"><input onClick={() => this._onToggleValue('effectedWorldObject')} value={scenarioItem.effectedWorldObject} type="checkbox"></input>Effect World Object</div>
        {this._renderIdSelect('effectedIds', this._onAddEffectedId, 'Effected Ids:')}
        {this._renderTagSelect('effectedTags', this._onAddEffectedTag, 'Effected Tags:')}
      </div>
      {this._renderNextSelect(scenarioItem.next, this._selectNext)}
    </div>
  }

  _renderCondition() {
    const { scenarioItem } = this.state
    const { conditionType } = scenarioItem

    const conditionTypeChooser = <div className="ScenarioItem__condition-type-chooser">
      Type: <Select
        value={{value: conditionType, label: conditionType}}
        onChange={this._onChangeConditionType}
        options={conditionTypeOptions}
        styles={window.reactSelectStyle}
        theme={window.reactSelectTheme}/>
    </div>

    let chosenConditionForm
    if(conditionType === 'matchJSON') {
      chosenConditionForm = <div className="ScenarioItem__condition-form"><i className="fa fas fa-edit ScenarioButton" onClick={this._openEditCodeModal}/>
        <div className="ScenarioItem__summary ScenarioItem__summary--json">{JSON.stringify(scenarioItem.conditionJSON)}</div>
      </div>
    }
    if(conditionType === 'insideOfObjectWithTag' || conditionType === 'hasTag') {
      chosenConditionForm = <div className="ScenarioItem__condition-form"><i className="fa fas fa-edit ScenarioButton" onClick={this._openEditConditionValueModal}/>
        Tag: <div className="ScenarioItem__summary ScenarioItem__summary--json">{scenarioItem.conditionValue}</div>
      </div>
    }
    if(conditionType === 'hasSubObject' || conditionType === 'isSubObjectEquipped' || conditionType === 'isSubObjectInInventory') {
      chosenConditionForm = <div className="ScenarioItem__condition-form"><i className="fa fas fa-edit ScenarioButton" onClick={this._openEditConditionValueModal}/>
        Sub Object name: <div className="ScenarioItem__summary ScenarioItem__summary--json">{scenarioItem.conditionValue}</div>
      </div>
    }
    if(conditionType === 'hasCompletedQuest' || conditionType === 'hasStartedQuest') {
      chosenConditionForm = <div className="ScenarioItem__condition-form"><i className="fa fas fa-edit ScenarioButton" onClick={this._openEditConditionValueModal}/>
        Quest name: <div className="ScenarioItem__summary ScenarioItem__summary--json">{scenarioItem.conditionValue}</div>
      </div>
    }
    if(conditionType === 'hasMod') {
      chosenConditionForm = <div className="ScenarioItem__condition-form"><i className="fa fas fa-edit ScenarioButton" onClick={this._openEditConditionValueModal}/>
        Mod: <div className="ScenarioItem__summary ScenarioItem__summary--json">{scenarioItem.conditionValue}</div>
      </div>
    }

    return <div className="ScenarioItem__condition">
          {conditionTypeChooser}
          <div className="ScenarioItem__condition-body">
            {chosenConditionForm}
            <div className="ScenarioItem__condition-input"><input onClick={() => this._onToggleValue('testMainObject')} value={scenarioItem.testMainObject} type="checkbox"></input>Test Main Object</div>
            <div className="ScenarioItem__condition-input"><input onClick={() => this._onToggleValue('testGuestObject')} value={scenarioItem.testGuestObject} type="checkbox"></input>Test Guest Object</div>
            <div className="ScenarioItem__condition-input"><input onClick={() => this._onToggleValue('testWorldObject')} value={scenarioItem.testWorldObject} type="checkbox"></input>Test World Object</div>
            {this._renderIdSelect('testIds', this._onAddConditionTestId)}
            {this._renderTagSelect('testTags', this._onAddConditionTestTag)}
            <div className="ScenarioItem__condition-input"><input onClick={() => this._onToggleValue('allTestedMustPass')} value={scenarioItem.allTestedMustPass} type="checkbox"></input>All Tested Must Pass</div>
          </div>
          {this._renderNextSelect(scenarioItem.passNext, (event) => {
            this._selectNext(event, 'passNext')
          }, 'Pass Next:')}
          {this._renderNextSelect(scenarioItem.failNext, (event) => {
            this._selectNext(event, 'failNext')
          }, 'Fail Next:')}
        </div>
  }

  _renderNextSelect(nextValue, onChange, title) {
    const { scenarioItem, nextOptions } = this.state;

    const selectedNext = nextOptions.filter((option) => {
      if(option.value === nextValue) return true
    })[0]

    return <div className="ScenarioItem__next">{title || 'Next:'}<Select
      value={selectedNext}
      onChange={onChange}
      options={nextOptions}
      styles={window.reactSelectStyle}
      theme={window.reactSelectTheme}/></div>
  }

  _renderTagSelect(valueProp, onChange, title) {
    const { scenarioItem } = this.state;

    return <div className="ScenarioItem__test">{title || 'Test Tags:'}<Select
      value={scenarioItem[valueProp] && scenarioItem[valueProp].map((tags) => { return { value: tags, label: tags} })}
      onChange={onChange}
      options={Object.keys(window.allTags).map(tag => { return { value: tag, label: tag}})}
      styles={window.reactSelectStyle}
      isMulti
      theme={window.reactSelectTheme}/>
    </div>
  }

  _renderIdSelect(valueProp, onChange, title) {
    const { scenarioItem } = this.state;

    return <div className="ScenarioItem__test">{title || 'Test Ids:'}<Select
      value={scenarioItem[valueProp] && scenarioItem[valueProp].map((id) => { return {value: id, label: id} })}
      onChange={onChange}
      options={GAME.objects.map(({id}) => { return {value: id, label: id} }).concat(GAME.heroList.map(({id}) => { return { value: id, label: id} }))}
      styles={window.reactSelectStyle}
      isMulti
      theme={window.reactSelectTheme}/>
    </div>
  }

  _renderSingleIdSelect(valueProp, onChange, title) {
    const { scenarioItem } = this.state;

    return <div className="ScenarioItem__test">{title || 'Test Ids:'}<Select
      value={scenarioItem[valueProp] && scenarioItem[valueProp].map((id) => { return {value: id, label: id} })}
      onChange={onChange}
      options={[{value: 'default', label: 'default'}, {value: 'mainObject', label: 'mainObject'}, {value: 'guestObject', label: 'guestObject'}, ...GAME.objects.map(({id}) => { return {value: id, label: id} }).concat(GAME.heroList.map(({id}) => { return { value: id, label: id} }))]}
      styles={window.reactSelectStyle}
      theme={window.reactSelectTheme}/>
    </div>
  }

  render() {
    const { scenarioItem } = this.state;
    const { onDelete } = this.props;

    return (
      <div className="ScenarioItem">
        <div className="ScenarioItem__identifier">{scenarioItem.id}</div>
        <div className="ScenarioItem__type">{scenarioItem.type}</div>
        <i className="ScenarioButton ScenarioItem__delete fa fas fa-times" onClick={onDelete}></i>
        <div className="ScenarioItem__body">
          {scenarioItem.type == 'dialogue' && this._renderDialogue()}
          {scenarioItem.type == 'branchChoice' && this._renderChoice()}
          {scenarioItem.type == 'branchCondition' && this._renderCondition()}
          {scenarioItem.type == 'effect' && this._renderEffect()}
        </div>
      </div>
    )
  }
}
