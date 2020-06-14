import React from 'react'
import ScenarioItem from './ScenarioItem.jsx'
import Select from 'react-select';

window.reactSelectStyle = {control: styles => ({ ...styles, backgroundColor: '#19191a', color: 'white' }),
option: styles => ({ ...styles, backgroundColor: '#19191a', color: 'white' }),
input: styles => ({ ...styles, backgroundColor: '#19191a', color: 'white' }),
singleValue: styles => ({ ...styles, backgroundColor: '#19191a', color: 'white' })
}

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
      scenario: {
        list: [
        {id: 'a', type: 'dialogue', text: 'hello', next: 'sequential'},
        {id: 'b', type: 'dialogue', text: 'hello', next: 'sequential'},
        {id: 'c', type: 'dialogue', text: 'hello', next: 'sequential'},
        {id: 'd', type: 'dialogue', text: 'hello', next: 'sequential'},
        {id: 'e', type: 'dialogue', text: 'hello', next: 'sequential'},
        ]
      },
      selectedType: null,
    }

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this._selectType = this._selectType.bind(this)
    this._onAddItem = this._onAddItem.bind(this)
  }

  _selectType(event) {
    this.setState({selectedType: event.value})
  };

  _findNextId() {
    const { scenario } = this.state

    let largestIndex = 0
    scenario.list.forEach((item) => {
      let index = alphaarray.indexOf(item.id)
      if(index > largestIndex) largestIndex = index
    })

    return alphaarray[largestIndex+1]
  }

  _onAddItem() {
    const { scenario, selectedType } = this.state
    if(!selectedType) return

    const scenarioItem = {id: this._findNextId(), type: selectedType, next: 'sequential' }

    if(selectedType === 'dialogue') {
      scenarioItem.text = ''
    }
    if(selectedType === 'branchCondition') {
      scenarioItem.JSON = ''
    }
    if(selectedType === 'branchChoice') {
      scenarioItem.options = []
    }
    if(selectedType === 'effect') {
      scenarioItem.effectName = ''
    }

    const newScenarioList = scenario.list.slice()
    newScenarioLisst.push(scenarioItem)
    this.setState({scenario: { ...scenario, list: newScenarioList }})
  }

  open(initialScenario) {
    this.setState({
      open: true,
      scenario: initialScenario || { list: []}
    })
  }

  close() {
    this.setState({
      open: false,
    })
  }

  render() {
    const { open, scenario, selectedType } = this.state

    // if(!open) return null

    return (
      <div className="ScenarioEditor">
        <div className="ScenarioMenu">
          <i className="ScenarioButton fa fas fa-times" onClick={this.close}></i>
          <div style={{width: '150px', display: 'inline-block'}}><Select
            onChange={this._selectType}
            options={typeOptions}
            styles={window.reactSelectStyle}/></div>
        <i className="ScenarioButton fa fas fa-plus" onClick={this._onAddItem}></i>
        <i className="ScenarioButton fa fas fa-download" onClick={this.close}></i>

        </div>
        {scenario.list.map((scenarioItem) => {
          return <ScenarioItem key={scenarioItem.id} scenarioList={scenario.list} scenarioItem={scenarioItem}/>
        })}
      </div>
    )
  }
}
