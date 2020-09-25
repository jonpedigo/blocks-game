import React from 'react'
import SequenceItem from './SequenceItem.jsx'
import SequenceListItem from './SequenceListItem.jsx'
import Select from 'react-select';
import modals from './modals';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

window.defaultSequence = {
  items: [],
  pauseGame: false,
  id: 'sequence-' + window.uniqueID(),
}

window.reactSelectStyle = {control: styles => ({ ...styles, backgroundColor: '#19191a', color: 'white' }),
option: styles => ({ ...styles, backgroundColor: '#19191a', color: 'white' }),
input: styles => ({ ...styles, backgroundColor: '#19191a', color: 'white', borderColor: 'black' }),
singleValue: styles => ({ ...styles, backgroundColor: '#19191a', color: 'white' })
}

window.defaultSequenceCondition =  {
  conditionJSON: {},
  conditionType: 'matchJSON', // 'insideOfObjectTag', 'duringTime', 'hasTag', 'hasSubObjectWithName',
  conditionValue: '',
  allTestedMustPass: false,
  testMainObject: false,
  testGuestObject: false,
  testWorldObject: false,
  testIds: [],
  testTags: [],
  passNext: 'sequential',
  failNext: 'sequential'
}

window.defaultSequenceWait = {
  conditionType: 'onTimerEnd',
  conditionValue: '',
  conditionEventName: '',
  mainObjectId: '',
  mainObjectTag: '',
  guestObjectId: '',
  guestObjectTag: '',
  next: ''
}

window.defaultSequenceChoice = {
  options: [
    { text: '', next: 'sequential' }
  ]
}

window.defaultSequenceEffect = {
  effectName: '',
  effectJSON: {},
  effectValue: '',
  effectedMainObject: true,
  effectedGuestObject: false,
  effectedWorldObject: false,
  effectedIds: [],
  effectedTags: [],
}


window.defaultSequenceTrigger = {
  "sequenceType": "sequenceTrigger",
  "effector": "ownerObject",
  "mainObjectTag": "",
  "mainObjectId": "",
  "guestObjectTag": "",
  "guestObjectId": "",
  "initialTriggerPool": -1,
  "eventThreshold": -1
}

window.reactSelectTheme = theme => ({
      ...theme,
      borderRadius: 0,
      colors: {
        ...theme.colors,
      },
    })

const alphaarray = "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,a1,b1,c1,d1,e1,f1,g1,h1,i1,j1,k1,l1,m1,n1,o1,p1,q1,r1,s1,t1,u1,v1,w1,x1,y1,z1,a2,b2,c2,d2,e2,f2,g2,h2,i2,j2,k2,l2,m2,n2,o2,p2,q2,r2,s2,t2,u2,v2,w2,x2,y2,z2,a3,b3,c3,d3,e3,f3,g3,h3,i3,j3,k3,l3,m3,n3,o3,p3,q3,r3,s3,t3,u3,v3,w3,x3,y3,z3".split(",")

const typeOptions = [
  { value: 'sequenceDialogue', label: 'Dialogue' },
  { value: 'sequenceEffect', label: 'Effect' },
  { value: 'sequenceCondition', label: 'Condition' },
  { value: 'sequenceNotification', label: 'Notification' },
  { value: 'sequenceChoice', label: 'Choice' },
  { value: 'sequenceWait', label: 'Wait' },
];

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default class SequenceEditor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      sequence: null,
      selectedType: null,
      sequenceItemRefs: [],
      sequenceIdList : []
    }

    this.download = this.download.bind(this)
    this._selectType = this._selectType.bind(this)
    this.openSequence = this.openSequence.bind(this)
    this.newSequence = this.newSequence.bind(this)
    this.closeSequence = this.closeSequence.bind(this)
    this.saveSequence = this.saveSequence.bind(this)
    this._onAddItem = this._onAddItem.bind(this)
    this._openEditIdModal = this._openEditIdModal.bind(this)
  }

  componentDidMount() {
    // const { sequence } = this.state
    // this._generateRefs(sequence.items)
    this.setState({
      sequenceIdList: Object.keys(GAME.library.sequences)
    })
  }

  _openEditIdModal() {
    const { sequence } = this.state

    modals.openEditTextModal('sequence id', sequence.id, (result) => {
      if(result && result.value && result.value.length) {
        sequence.id = result.value
        this.setState({ sequence })
      }
    })
  }

  _selectType(event) {
    this.setState({selectedType: event.value})
  };

  _findNextId() {
    const { sequence } = this.state

    if(sequence.items.length == 0) return alphaarray[0]

    let largestIndex = 0
    sequence.items.forEach((item) => {
      let index = alphaarray.indexOf(item.id)
      if(index > largestIndex) largestIndex = index
    })

    return alphaarray[largestIndex+1]
  }

  _onAddItem() {
    const { sequence, selectedType } = this.state
    if(!selectedType) return

    const sequenceItem = {id: this._findNextId(), sequenceType: selectedType }

    if(selectedType === 'sequenceDialogue') {
      sequenceItem.effectValue = ''
      sequenceItem.next = 'sequential'
    }
    if(selectedType === 'sequenceCondition') {
      Object.assign(sequenceItem, window.defaultSequenceCondition)
    }
    if(selectedType === 'sequenceChoice') {
      Object.assign(sequenceItem, window.defaultSequenceChoice)
    }
    if(selectedType === 'sequenceEffect') {
      Object.assign(sequenceItem, window.defaultSequenceEffect)
      sequenceItem.next = 'sequential'
    }
    if(selectedType === 'sequenceNotification') {
      Object.assign(sequenceItem, window.defaultSequenceNotification)
      sequenceItem.next = 'sequential'
    }
    if(selectedType === 'sequenceWait') {
      Object.assign(sequenceItem, window.defaultSequenceWait)
      sequenceItem.next = 'sequential'
    }

    const newSequenceItems = sequence.items.slice()
    newSequenceItems.push(sequenceItem)
    this.setState({sequence: { ...sequence, items: newSequenceItems }})
    this._generateRefs(newSequenceItems)
  }

  _generateRefs(items) {
    const sequenceItemRefs = []
    items.forEach(() => {
      sequenceItemRefs.push(React.createRef())
    })

    this.setState({
      sequenceItemRefs
    })
  }

  _getSequenceJSON() {
    const { sequence, sequenceItemRefs } = this.state;
    const sequenceItems = sequence.items.map((item, index) => {
      return sequenceItemRefs[index].current.getItemValue()
    })

    sequence.items = sequenceItems

    return sequence
  }

  open(initialSequence) {
    this.setState({
      open: true,
      sequence: null,
    })
  }

  openSequence(id) {
    this.setState({
      sequence: JSON.parse(JSON.stringify(GAME.library.sequences[id]))
    })
    this._generateRefs(GAME.library.sequences[id].items)
  }

  newSequence() {
    this.setState({
      sequence: JSON.parse(JSON.stringify(window.defaultSequence))
    })
    this._generateRefs([])
  }

  deleteSequence = (idToDelete) => {
    const { sequenceIdList } = this.state

    const newSequenceIdList = sequenceIdList.slice()

    const index = newSequenceIdList.indexOf(idToDelete)
    if(index !== -1) newSequenceIdList.splice(index, 1)

    this.setState({
      sequenceIdList: newSequenceIdList
    })

    delete GAME.library.sequences[idToDelete]
    window.socket.emit('updateLibrary', { sequences: GAME.library.sequences })
  }

  saveSequence() {
    const { sequence, sequenceIdList } = this.state

    GAME.library.sequences[sequence.id] = this._getSequenceJSON()
    window.socket.emit('updateLibrary', { sequences: GAME.library.sequences })

    if(sequenceIdList.indexOf(sequence.id) == -1) {
      const newSequenceIdList = sequenceIdList.slice()
      newSequenceIdList.push(sequence.id)
      this.setState({
        sequenceIdList: newSequenceIdList
      })
    }

    this.setState({
      sequence: null
    })
    this._generateRefs([])
  }


  _onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state.sequence.items,
      result.source.index,
      result.destination.index
    );

    this.setState({
      sequence: {
        ...this.state.sequence,
        items
      }
    });
}

  closeSequence() {
    this.setState({
      sequence: null
    })
    this._generateRefs([])
  }

  close() {
    this.setState({
      open: false,
    })
  }

  download() {
    const sequence = this._getSequenceJSON()
    PAGE.downloadObjectAsJson(sequence, 'sequence')
  }

  render() {
    const { sequence, selectedType, sequenceItemRefs, sequenceIdList } = this.state

    if(!sequence) {
      return <div className="SequenceEditor">
        <div className="ManagerMenu">
          <div className="ManagerMenu__right">
          <i className="Manager__button fa fas fa-times" onClick={BELOWMANAGER.close}></i>
          </div>
        </div>
        <div className="SequenceList">
          {sequenceIdList.map((id) => {
            return <SequenceListItem deleteSequence={this.deleteSequence} openSequence={this.openSequence} id={id}></SequenceListItem>
          })}
          <div className="SequenceList__sequence" onClick={this.newSequence}>New Sequence</div>
        </div>
      </div>
    }

    return (
      <div className="SequenceEditor">
        <div className="ManagerMenu">
          <div className="ManagerMenu__right">
            <div className="Manager__button" onClick={this.closeSequence}>Cancel</div>
            <div className="Manager__button" onClick={this.saveSequence}>Save</div>
            <i className="Manager__button fa fas fa-download" onClick={this.download}></i>
          </div>
          <div className="ManagerMenu__id" onClick={this._openEditIdModal}>{sequence.id}</div>
          <div className="ManagerMenu__left">
            <div style={{width: '150px', display: 'inline-block'}}><Select
              onChange={this._selectType}
              options={typeOptions}
              styles={window.reactSelectStyle}/></div>
            <i className="Manager__button fa fas fa-plus" onClick={this._onAddItem}></i>
          </div>
        </div>
        <DragDropContext onDragEnd={this._onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {sequence.items.map((sequenceItem, index) => {
                  return <Draggable key={sequenceItem.id} draggableId={sequenceItem.id} index={index}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <SequenceItem ref={sequenceItemRefs[index]} key={sequenceItem.id} sequenceList={sequence.items} sequenceItem={sequenceItem} onDelete={() => {
                          const newSequenceItems = sequence.items.slice()
                          newSequenceItems.splice(index, 1)
                          this.setState({sequence: { ...sequence, items: newSequenceItems }})
                          this._generateRefs(newSequenceItems)
                        }}/>
                      </div>
                    )}
                  </Draggable>
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    )
  }
}
