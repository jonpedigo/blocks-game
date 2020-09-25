import React from 'react'
import SequenceEditor from '../../sequenceeditor/SequenceEditor.jsx'

export default class GameManager extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { selectedMenu } = this.props

    if(selectedMenu === 'sequence') {
      return <div className="Manager">
          <SequenceEditor/>
      </div>
    }
  }
}
