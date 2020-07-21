import React from 'react'
import Creator from './Creator.jsx'

export default class Root extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      objectSelected: {},
    }

    this.open = () => {
      this.setState({
        open: true,
      })
    }

    this.close = () => {
      this.setState({
        open: false,
        objectSelected: {},
      })
    }

  }

  render() {
    const { objectSelected } = this.state

    return (
      <div className="EditorUI">
        <Creator></Creator>
      </div>
    )
  }
}
