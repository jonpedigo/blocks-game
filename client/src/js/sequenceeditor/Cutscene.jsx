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

window.defaultSequenceCutscene = {
  notificationAllHeros: false,
  effectedMainObject: false,
  effectedGuestObject: false,
  effectedIds: [],
  effectedTags: [],
  scenes: [{
    duration: -1,
    text: '',
    imageUrl: null,
  }],
}

export default class Cutscene extends React.Component{
  _renderInvolved() {
    const { sequenceItem } = this.props
    const { effectName } = sequenceItem

    return <Collapsible trigger='Viewers'>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('notificationAllHeros')} checked={sequenceItem.notificationAllHeros} type="checkbox"></input>All Heros</div>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('effectedMainObject')} checked={sequenceItem.effectedMainObject} type="checkbox"></input>Main Object</div>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('effectedGuestObject')} checked={sequenceItem.effectedGuestObject} type="checkbox"></input>Guest Object</div>
      <div className="SequenceItem__effect-input"><input onChange={() => this.props._onToggleValue('effectedOwnerObject')} checked={sequenceItem.effectedOwnerObject} type="checkbox"></input>Owner Object</div>
      <MultiIdSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='effectedIds' onChange={this.props._onAddEffectedId} title='Viewer Ids:'/>
      <MultiTagSelect sequenceItem={sequenceItem} isTrigger={this.props.isTrigger} valueProp='effectedTags' onChange={this.props._onAddEffectedTag} title='Viewer Tags:'/>
    </Collapsible>
  }

  _renderScene(scene, index) {
    const { sequenceItem } = this.props;
    return <Collapsible trigger={'Scene - ' + index.toString()}>
        <div key={sequenceItem.id + '-' + index} className="SequenceItem__option" >
          <h4>{'Scene ' + (index + 1)}</h4>
          Text:
          <i className="fa fas fa-edit Manager__button" onClick={() => this.props._editScene('text', index)}/>
          <div className="SequenceItem__summary SequenceItem__summary--json">{scene.text}</div>
          Duration:
          <div className="SequenceItem__condition-form"><i className="fa fas fa-edit Manager__button" onClick={() => this.props._editScene('duration', index)}/>
          <div className="SequenceItem__summary SequenceItem__summary--json">{scene.duration}</div>
          </div>
          Image:
          <i className="fa fas fa-edit Manager__button" onClick={() => this.props._editScene('image', index)}/>
          {scene.image && <div className="SequenceItem__summary SequenceItem__summary--json">{scene.image.name}</div>}
        </div>
      </Collapsible>
  }

  render() {
    const { sequenceItem } = this.props

    return <div className="SequenceItem__effect SequenceItem--notification">
      <div className="SequenceItem__effect-body">
        <div className="SequenceItem__choice">
          {sequenceItem.scenes.map((scene, index) => {
            return this._renderScene(scene, index)
          })}
          <i className="fa fas fa-plus Manager__button" onClick={this.props._addScene}/>
        </div>
        {this._renderInvolved()}
      </div>
      <NextSelect isTrigger={this.props.isTrigger} sequenceItem={sequenceItem} nextOptions={this.props.nextOptions} nextValue={sequenceItem.next} onChange={this.props._selectNext}/>
    </div>
  }
}
