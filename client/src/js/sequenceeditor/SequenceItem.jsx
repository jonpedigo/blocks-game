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
import Condition from './Condition.jsx'
import Effect from './Effect.jsx'

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
      <NextSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} nextOptions={this.state.nextOptions} nextValue={sequenceItem.next} onChange={this._selectNext}/>
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
          <NextSelect sequenceItem={sequenceItem} nextOptions={this.state.nextOptions} isTrigger={this.props.isTrigger} nextValue={option.next} onChange={(event) => {
            this._selectNext(event, index)
          }}/>
        </div>
      })}
      <i className="fa fas fa-plus SequenceButton" onClick={this._addOption}/>
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
          {sequenceItem.sequenceType == 'sequenceCondition' && <Condition {...this} {...this.props} {...this.state} setState={this.setState}/>}
          {sequenceItem.sequenceType == 'sequenceEffect' && <Effect {...this} {...this.props} {...this.state} setState={this.setState}/>}
          {sequenceItem.sequenceType == 'sequenceWait' && <Condition {...this} {...this.props} {...this.state} setState={this.setState}/>}
        </div>
      </div>
    )
  }
}
