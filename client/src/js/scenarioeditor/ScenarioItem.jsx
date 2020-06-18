import React from 'react'
import modals from './modals.js'
import Select from 'react-select';

const initialNextOptions = [
  { value: 'sequential', label: 'Next in list' },
  { value: 'end', label: 'End Scenario' },
];

const conditionTypeOptions = [
  { value: 'matchJSON', label: 'matchJSON' },
  { value: 'inArea', label: 'inArea' },
  { value: 'hasTag', label: 'hasTag' },
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
    this._openWriteDialogueModal = this._openWriteDialogueModal.bind(this)
    this._openEditCodeModal = this._openEditCodeModal.bind(this)
    this._onChangeConditionType = this._onChangeConditionType.bind(this)
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

  _openEditCodeModal() {
    const { scenarioItem } = this.state;

    modals.openEditCodeModal('edit condition JSON', scenarioItem.conditionJSON, (result) => {
      if(result && result.value) {
        scenarioItem.conditionJSON = JSON.parse(result.value)
        this.setState({scenarioItem})
      }
    })
  }

  _onChangeConditionType(event) {
    const { scenarioItem } = this.state;
    scenarioItem.conditionType = event.value
    this.setState({scenarioItem})
  }

  _openWriteDialogueModal(index) {
    const { scenarioItem } = this.state;

    let initial = ''
    if(scenarioItem.type === 'dialogue') {
      initial = scenarioItem.effectValue
    }
    if(scenarioItem.type === 'branchChoice') {
      initial = scenarioItem.options[index].effectValue
    }

    modals.openWriteDialogueModal(initial, (result) => {

      if(scenarioItem.type === 'dialogue') {
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
    if(scenarioItem.type === 'dialogue') {
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

  _renderCondition() {
    const { scenarioItem } = this.state;

    const conditionTypeChooser = <div className="ScenarioItem__condition-type-chooser">
      Type: <Select
        value={{value: scenarioItem.conditionType, label: scenarioItem.conditionType}}
        onChange={this._onChangeConditionType}
        options={conditionTypeOptions}
        styles={window.reactSelectStyle}
        theme={window.reactSelectTheme}/>
    </div>

    let chosenConditionForm
    if(scenarioItem.conditionType === 'matchJSON') {
      chosenConditionForm = <div className="ScenarioItem__condition-form"><i className="fa fas fa-edit ScenarioButton" onClick={this._openEditCodeModal}/>
        <div className="ScenarioItem__summary ScenarioItem__summary--json">{JSON.stringify(scenarioItem.conditionJSON)}</div>
      </div>
    }

    return <div className="ScenarioItem__condition">
          {conditionTypeChooser}
          {chosenConditionForm}
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
