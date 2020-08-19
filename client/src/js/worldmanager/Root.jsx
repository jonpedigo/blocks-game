import React from 'react'
import SequenceEditor from '../sequenceeditor/SequenceEditor.jsx'

export default class Root extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false,
      selectedMenu: null
    }
  }

  open(selectedMenu) {
    this.setState({
      open: true,
      selectedMenu
    })
  }

  close() {
    this.setState({
      open: false,
      selectedMenu: null,
    })
  }

  render() {
    const { open, selectedMenu } = this.state

    if(!open) return null

    if(selectedMenu === 'sequence') {
      return <SequenceEditor/>
    }
  }
}
