import React from 'react'
import SequenceItem from './SequenceItem.jsx'
import SequenceList from './SequenceList.jsx'
import Select from 'react-select';
import modals from './modals';

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

window.reactSelectTheme = theme => ({
      ...theme,
      borderRadius: 0,
      colors: {
        ...theme.colors,
      },
    })

const alphaarray = "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,a1,b1,c1,d1,e1,f1,g1,h1,i1,j1,k1,l1,m1,n1,o1,p1,q1,r1,s1,t1,u1,v1,w1,x1,y1,z1,a2,b2,c2,d2,e2,f2,g2,h2,i2,j2,k2,l2,m2,n2,o2,p2,q2,r2,s2,t2,u2,v2,w2,x2,y2,z2,a3,b3,c3,d3,e3,f3,g3,h3,i3,j3,k3,l3,m3,n3,o3,p3,q3,r3,s3,t3,u3,v3,w3,x3,y3,z3".split(",")

const typeOptions = [
  { value: 'dialogue', label: 'Dialogue' },
  { value: 'effect', label: 'Effect' },
  { value: 'branchCondition', label: 'Condition' },
  { value: 'branchChoice', label: 'Choice' },
];

export default class Root extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false,
      sequence: null,
      selectedType: null,
      sequenceItemRefs: [],
    }

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
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

    const sequenceItem = {id: this._findNextId(), type: selectedType }

    if(selectedType === 'dialogue') {
      sequenceItem.effectValue = ''
      sequenceItem.next = 'sequential'
    }
    if(selectedType === 'branchCondition') {
      sequenceItem.conditionJSON = {}
      sequenceItem.conditionType = 'matchJSON' // 'insideOfObject', 'duringTime', 'hasTag', 'hasSubObjectWithName'
      sequenceItem.conditionValue = ''
      sequenceItem.allTestedMustPass = false
      sequenceItem.testMainObject = false
      sequenceItem.testGuestObject = false
      sequenceItem.testWorldObject = false
      sequenceItem.testIds = []
      sequenceItem.testTags = []
      sequenceItem.passNext = 'sequential'
      sequenceItem.failNext = 'sequential'
    }
    if(selectedType === 'branchChoice') {
      sequenceItem.options = [
        { text: '', next: 'sequential' }
      ]
    }
    if(selectedType === 'effect') {
      sequenceItem.effectName = ''
      sequenceItem.effectJSON = {}
      sequenceItem.effectValue = ''
      sequenceItem.effectedMainObject = false
      sequenceItem.effectedGuestObject = false
      sequenceItem.effectedWorldObject = false
      sequenceItem.effectedIds = []
      sequenceItem.effectedTags = []
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
      sequence: JSON.parse(JSON.stringify(GAME.world.sequences[id]))
    })
    this._generateRefs(GAME.world.sequences[id].items)
  }

  newSequence() {
    this.setState({
      sequence: JSON.parse(JSON.stringify(window.defaultSequence))
    })
    this._generateRefs([])
  }

  saveSequence() {
    const { sequence } = this.state

    GAME.world.sequences[sequence.id] = this._getSequenceJSON()
    this.setState({
      sequence: null
    })
    this._generateRefs([])
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
    const { open, sequence, selectedType, sequenceItemRefs } = this.state

    if(!open) return null

    if(!sequence) {
      return <div className="SequenceEditor">
        <div className="SequenceMenu">
          <div className="SequenceMenu__top">
          <i className="SequenceButton fa fas fa-times" onClick={this.close}></i>
          </div>
        </div>
        <SequenceList openSequence={this.openSequence} newSequence={this.newSequence}></SequenceList>
      </div>
    }

    return (
      <div className="SequenceEditor">
        <div className="SequenceMenu">
          <div className="SequenceMenu__top">
            <div className="SequenceButton" onClick={this.closeSequence}>Cancel</div>
            <div className="SequenceButton" onClick={this.saveSequence}>Save</div>
            <i className="SequenceButton fa fas fa-download" onClick={this.download}></i>
          </div>
          <div className="SequenceMenu__id" onClick={this._openEditIdModal}>{sequence.id}</div>
          <div className="SequenceMenu__bottom">
            <div style={{width: '150px', display: 'inline-block'}}><Select
              onChange={this._selectType}
              options={typeOptions}
              styles={window.reactSelectStyle}/></div>
            <i className="SequenceButton fa fas fa-plus" onClick={this._onAddItem}></i>
          </div>
        </div>
        {sequence.items.map((sequenceItem, index) => {
          return <SequenceItem ref={sequenceItemRefs[index]} key={sequenceItem.id} sequenceList={sequence.items} sequenceItem={sequenceItem} onDelete={() => {
              const newSequenceItems = sequence.items.slice()
              newSequenceItems.splice(index, 1)
              this.setState({sequence: { ...sequence, items: newSequenceItems }})
              this._generateRefs(newSequenceItems)
            }}/>
        })}
      </div>
    )
  }
}
