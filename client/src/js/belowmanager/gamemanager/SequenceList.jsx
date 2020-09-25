import React from 'react'
import Select from 'react-select';
import modals from './modals';

export default class SequenceList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      sequenceIdList : []
    }
  }

  componentDidMount() {
    this.setState({
      sequenceIdList: Object.keys(GAME.library.sequences)
    })
  }

  render() {
    const { sequenceIdList } = this.state
    const { openSequence, newSequence } = this.props

    return (
      <div className="SequenceList">
        {sequenceIdList.map((id) => {
          return <div key={id} className="SequenceList__sequence" onClick={() => openSequence(id)}>{id}</div>
        })}
        <div className="SequenceList__sequence" onClick={newSequence}>New Sequence</div>
      </div>
    )
  }
}
