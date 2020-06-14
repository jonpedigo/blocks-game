import React from 'react'
import modals from './modals.js'
import Select from 'react-select';

const initialNextOptions = [
  { value: 'sequential', label: 'Next in list' },
  { value: 'end', label: 'End' },
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
  }

  componentDidMount() {
    this._updateNextOptions()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.scenarioList.length !== this.props.scenarioList.length) {
      this._updateNextOptions()
    }
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

  _renderDialogue() {
    const { scenarioItem } = this.state;
    return <div className="ScenarioItem__dialogue">
      <i className="fa fas fa-edit ScenarioButton" onClick={() => {
        modals.openWriteDialogueModal(scenarioItem.value, (result) => {
          this.setState({
            scenarioItem: {...scenarioItem, value: result.value}
          })
        })
      }}/>
      Dialogue: <div className="ScenarioItem__summary">{scenarioItem.value}</div>
    </div>
  }

  _selectNext(event) {
    const { scenarioItem } = this.state;
    scenarioItem.next = event.value
    this.setState({scenarioItem})
  };

  render() {
    const { scenarioItem, nextOptions } = this.state;

    const selectedNext = nextOptions.filter((option) => {
      if(option.value === scenarioItem.next) return true
    })[0]

    return (
      <div className="ScenarioItem">
        <div className="ScenarioItem__identifier">{scenarioItem.id}</div>
        <div className="ScenarioItem__type">{scenarioItem.type}</div>
        <div className="ScenarioItem__body">
          {scenarioItem.type == 'dialogue' && this._renderDialogue()}
          <div className="ScenarioItem__next">Next: <Select
            value={selectedNext}
            onChange={this._selectNext}
            options={nextOptions}
            styles={window.reactSelectStyle}/></div>
        </div>
      </div>
    )
  }
}
