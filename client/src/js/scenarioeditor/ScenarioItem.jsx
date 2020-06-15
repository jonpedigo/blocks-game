import React from 'react'
import modals from './modals.js'
import Select from 'react-select';

const initialNextOptions = [
  { value: 'sequential', label: 'Next in list' },
  { value: 'end', label: 'End Scenario' },
];

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

  _openWriteDialogueModal(index) {
    const { scenarioItem } = this.state;

    let initial = ''
    if(scenarioItem.type === 'dialogue') {
      initial = scenarioItem.text
    }
    if(scenarioItem.type === 'branchChoice') {
      initial = scenarioItem.options[index].text
    }

    modals.openWriteDialogueModal(initial, (result) => {

      if(scenarioItem.type === 'dialogue') {
        this.setState({
          scenarioItem: {...scenarioItem, text: result.value}
        })
      }

      if(scenarioItem.type === 'branchChoice') {
        scenarioItem.options[index].text = result.value
        this.setState({scenarioItem})
      }
    })
  }

  _selectNext(event, index) {
    const { scenarioItem } = this.state;
    if(scenarioItem.type === 'dialogue') {
      scenarioItem.next = event.value
    }
    if(scenarioItem.type === 'branchChoice') {
      scenarioItem.options[index].next = event.value
    }
    this.setState({scenarioItem})
  };

  _addOption() {
    const { scenarioItem } = this.state;
    const newOptions = scenarioItem.options.slice()
    newOptions.push({ text: '', next: 'sequential' })
    scenarioItem.options = newOptions
    this.setState(scenarioItem)
  }

  _renderDialogue() {
    const { scenarioItem } = this.state;
    return <div className="ScenarioItem__dialogue">
      <i className="fa fas fa-edit ScenarioButton" onClick={this._openWriteDialogueModal}/>
      Dialogue: <div className="ScenarioItem__summary">{scenarioItem.text}</div>
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
          Text:<div className="ScenarioItem__summary">{option.text}</div>
          {this._renderNextSelect(option.next, (event) => {
            this._selectNext(event, index)
          })}
        </div>
      })}
      <i className="fa fas fa-plus ScenarioButton" onClick={this._addOption}/>
    </div>
  }

  _renderNextSelect(nextValue, onChange) {
    const { scenarioItem, nextOptions } = this.state;

    const selectedNext = nextOptions.filter((option) => {
      if(option.value === nextValue) return true
    })[0]

    return <div className="ScenarioItem__next">Next: <Select
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
