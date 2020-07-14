import React from 'react'
import PhysicsLive from './PhysicsLive.jsx'
import 'react-dat-gui/dist/index.css';

export default class Root extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      objectSelected: {},
      openEditorName: ''
    }

    this.open = (objectSelected, openEditorName) => {
      this.setState({
        objectSelected,
        openEditorName
      })
    }
  }

  render() {
    const { objectSelected, openEditorName } = this.state

    return (
      <div className="LiveEditor">
        {openEditorName === 'physics' && <PhysicsLive objectSelected={objectSelected} />}
      </div>
    )
  }
}
