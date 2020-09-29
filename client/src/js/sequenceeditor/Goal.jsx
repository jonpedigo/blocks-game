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

window.goalTypes = {
  'collectX': {
    number: true,
    tag: true,
  },
  'touchX' : {
    number: true,
    tag: true,
  },
  'createX' : {
    number: true,
    tag: true,
  },
  'destroyX' : {
    number: true,
    tag: true,
  },
  'scoreX' : {
    number: true,
    tag: true,
  }
}

window.defaultSequenceGoal = {
  goalName: 'collectX',
  goalTargetCount: 1,
  goalTargetTags: [],
  goalTimeLimit: -1,
  goalChances: -1,
  goalWithoutDestroyed: false,
  effectedMainObject: true,
  effectedGuestObject: false,
  effectedOwnerObject: false,
  effectedIds: [],
  effectedTags: [],
  successSequenceId: null,
  failSequenceId: null,
  goalShowNavigation: false,
  goalDescription: '',
}

window.goalNameList = Object.keys(window.goalTypes)

export default class Goal extends React.Component{
  _renderEffecteds() {
    const { isTrigger } = this.props
    const { sequenceItem } = this.props
    const { goalName } = sequenceItem
    const goalData = window.goalTypes[goalName]

    return <React.Fragment>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('goalAllHeros')} checked={sequenceItem.goalAllHeros} type="checkbox"></input>All Heros</div>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('effectedMainObject')} checked={sequenceItem.effectedMainObject} type="checkbox"></input>Main Object</div>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('effectedGuestObject')} checked={sequenceItem.effectedGuestObject} type="checkbox"></input>Guest Object</div>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('effectedOwnerObject')} checked={sequenceItem.effectedOwnerObject} type="checkbox"></input>Owner Object</div>
      <MultiIdSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='effectedIds' onChange={this.props._onAddEffectedId} title='Ids:'/>
      <MultiTagSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='effectedTags' onChange={this.props._onAddEffectedTag} title='Tags:'/>
    </React.Fragment>
  }

  render() {
    const { isTrigger } = this.props
    const { sequenceItem } = this.props
    const { goalName } = sequenceItem

    const goalChooser = <div className="SequenceItem__condition-type-chooser">
      Goal Type: <Select
        value={{value: goalName, label: goalName}}
        onChange={this.props._onChangeGoalName}
        options={window.goalNameList.map(goalName => { return { value: goalName, label: goalName}})}
        styles={window.reactSelectStyle}
        theme={window.reactSelectTheme}/>
    </div>

    let chosenGoalForm = []
    const goalData = window.goalTypes[goalName]
    if(goalName.length && goalData) {

      // if(goalData.JSON) {
      //   chosenGoalForm.push(goalData.JSONlabel || '')
      //   chosenGoalForm.push(<i className="fa fas fa-edit Manager__button" onClick={() => this.props._openEditCodeModal('edit effect JSON', 'effectJSON')}/>)
      //   chosenGoalForm.push(<div className="SequenceItem__summary SequenceItem__summary--json">{JSON.stringify(sequenceItem.effectJSON)}</div>)
      // }
      if(goalData.number) {
        chosenGoalForm.push('Goal Target Count');
        chosenGoalForm.push(<div className="SequenceItem__condition-form"><i className="fa fas fa-edit Manager__button" onClick={() => { this.props._openEditNumberModal('goalTargetCount') }}/>
        <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.goalTargetCount}</div>
        </div>)
      }
      if(goalData.tag) {
        chosenGoalForm.push(<MultiTagSelect title="Goal Target Tags:" sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='goalTargetTags' onChange={ (event) => {
          if(event) {
            sequenceItem.goalTargetTags = event.map(({value}) => value)
            this.props.setState({sequenceItem})
          }
        }}/>)
      }

      // if(goalData.mapSelect) {
      //   chosenGoalForm.push(<div onClick={() => {
      //     if(BELOWMANAGER.editingSequenceItemId) return
      //     BELOWMANAGER.editingSequenceItemId = sequenceItem.id
      //     BELOWMANAGER.ref.forceUpdate()
      //     const removeEventListener = window.local.on('onSelectSequenceProperty', (option, objectSelected) => {
      //       const { sequenceItem } = this.props
      //       if(goalName === 'pathfindTo') {
      //         sequenceItem.effectValue = {
      //           x: objectSelected.x,
      //           y: objectSelected.y,
      //         }
      //       }
      //       if(goalName === 'goTo') {
      //         sequenceItem.effectValue = {
      //           x: objectSelected.x,
      //           y: objectSelected.y,
      //         }
      //       }
      //       if(goalName === 'teleportTo') {
      //         sequenceItem.effectValue = {
      //           x: objectSelected.x,
      //           y: objectSelected.y,
      //         }
      //       }
      //       if(goalName === 'pursue') {
      //         sequenceItem.effectValue = objectSelected.id
      //       }
      //       if(goalName === 'setPath') {
      //         sequenceItem.effectValue = objectSelected.id
      //       }
      //
      //       this.props.setState({
      //         sequenceItem
      //       })
      //       removeEventListener()
      //     })
      //   }}>
      //     Select on map <i className="fas fa-map-marked-alt Manager__button"/>
      //     {typeof sequenceItem.effectValue === 'object' && sequenceItem.effectValue !== null ? <div className="SequenceItem__summary SequenceItem__summary--json">{JSON.stringify(sequenceItem.effectValue)}</div>
      //     : <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.effectValue}</div>}
      //   </div>)
      // }
    }

    // <React.Fragment>
    //   <i className="fa fas fa-edit Manager__button" onClick={() => this.props._openEditTextValueModal('notificationModalHeader')}/>
    //   <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.notificationModalHeader}</div>
    // </React.Fragment>

    return <div className={classnames("SequenceItem__effect")}>
      {goalChooser}
      <div className="SequenceItem__effect-body">
        <div className="SequenceItem__effect-form">
          <Collapsible trigger='Goal Properties'>
            Description:
            <i className="fa fas fa-edit Manager__button" onClick={() => this.props._openEditTextValueModal('goalDescription')}/>
            <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.goalDescription}</div>
            {chosenGoalForm}
            Time Limit: <div className="SequenceItem__condition-form"><i className="fa fas fa-edit Manager__button" onClick={() => { this.props._openEditNumberModal('goalTimeLimit') }}/>
              <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.goalTimeLimit}</div>
            </div>
            Chances: <div className="SequenceItem__condition-form"><i className="fa fas fa-edit Manager__button" onClick={() => { this.props._openEditNumberModal('goalChances') }}/>
              <div className="SequenceItem__summary SequenceItem__summary--json">{sequenceItem.goalChances}</div>
            </div>
            <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('goalWithoutDestroyed')} checked={sequenceItem.goalWithoutDestroyed} type="checkbox"></input>Fail on Destroy</div>
            <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('goalShowNavigation')} checked={sequenceItem.goalShowNavigation} type="checkbox"></input>Show Navigation Arrow</div>
            <div className="SequenceItem__effected">Success Sequence Id:<Select
              value={{value: sequenceItem.successSequenceId, label: sequenceItem.successSequenceId}}
              onChange={(event) => {
                sequenceItem.successSequenceId = event.value
                this.props.setState({sequenceItem})
              }}
              options={Object.keys(GAME.library.sequences).map((id) => { return {value: id, label: id} })}
              styles={window.reactSelectStyle}
              theme={window.reactSelectTheme}/>
            </div>
            <div className="SequenceItem__effected">Fail Sequence Id:<Select
              value={{value: sequenceItem.failSequenceId, label: sequenceItem.failSequenceId}}
              onChange={(event) => {
                sequenceItem.failSequenceId = event.value
                this.props.setState({sequenceItem})
              }}
              options={Object.keys(GAME.library.sequences).map((id) => { return {value: id, label: id} })}
              styles={window.reactSelectStyle}
              theme={window.reactSelectTheme}/>
            </div>
          </Collapsible>
        </div>
        <Collapsible trigger='Goal Heros'>{this._renderEffecteds()}</Collapsible>
      </div>
      <NextSelect sequenceItem={sequenceItem} nextOptions={this.props.nextOptions} nextValue={sequenceItem.next} onChange={this.props._selectNext}/>
    </div>
  }
}
