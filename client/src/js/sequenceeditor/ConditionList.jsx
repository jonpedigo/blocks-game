import React from 'react'
import SequenceItem from './SequenceItem.jsx'

const alphaarray = "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,a1,b1,c1,d1,e1,f1,g1,h1,i1,j1,k1,l1,m1,n1,o1,p1,q1,r1,s1,t1,u1,v1,w1,x1,y1,z1,a2,b2,c2,d2,e2,f2,g2,h2,i2,j2,k2,l2,m2,n2,o2,p2,q2,r2,s2,t2,u2,v2,w2,x2,y2,z2,a3,b3,c3,d3,e3,f3,g3,h3,i3,j3,k3,l3,m3,n3,o3,p3,q3,r3,s3,t3,u3,v3,w3,x3,y3,z3".split(",")

export default class ConditionList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false,
      sequenceItems: this.props.sequenceItems || [{...JSON.parse(JSON.stringify(window.defaultSequenceCondition)), id: 'a', sequenceType: 'sequenceCondition' }],
      selectedType: null,
      sequenceItemRefs: [],
    }

    if(!this.state.sequenceItems.length) {
      this._onAddItem()
    }

    this.download = this.download.bind(this)
    this._onAddItem = this._onAddItem.bind(this)
  }

  componentDidMount() {
    const { sequenceItems } = this.state
    this._generateRefs(sequenceItems)
  }

  _findNextId() {
    const { sequenceItems } = this.state

    if(sequenceItems.length == 0) return alphaarray[0]

    let largestIndex = 0
    sequenceItems.forEach((item) => {
      let index = alphaarray.indexOf(item.id)
      if(index > largestIndex) largestIndex = index
    })

    return alphaarray[largestIndex+1]
  }

  _onAddItem() {
    const { sequenceItems } = this.state

    const sequenceItem = {id: this._findNextId(), sequenceType: 'sequenceCondition' }
    Object.assign(sequenceItem, window.defaultSequenceCondition)
    const newSequenceItems = sequenceItems.slice()
    newSequenceItems.push(sequenceItem)
    this.setState({sequenceItems: newSequenceItems })
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

  getSequenceJSON() {
    const { sequenceItemRefs, sequenceItems } = this.state;
    return sequenceItems.map((item, index) => {
      return sequenceItemRefs[index].current.getItemValue()
    })
  }

  download() {
    const sequence = this.getSequenceJSON()
    PAGE.downloadObjectAsJson(sequence, 'sequence')
  }

  render() {
    const { sequenceItems, sequenceItemRefs } = this.state

    return (
      <div className="SequenceEditor--condition-list">
        <div className="ManagerMenu">
          <div className="ManagerMenu__right">
            <i className="Manager__button fa fas fa-download" onClick={this.download}></i>
          </div>
          <div className="ManagerMenu__left">
            <i className="Manager__button fa fas fa-plus" onClick={this._onAddItem}></i>
          </div>
        </div>
        {sequenceItems.map((sequenceItem, index) => {
          return <SequenceItem ref={sequenceItemRefs[index]} nested key={sequenceItem.id} sequenceList={sequenceItems} sequenceItem={sequenceItem} isHook onDelete={() => {
              const newSequenceItems = sequenceItems.slice()
              newSequenceItems.splice(index, 1)
              this.setState({sequenceItems: newSequenceItems })
              this._generateRefs(newSequenceItems)
            }}/>
        })}
      </div>
    )
  }
}
