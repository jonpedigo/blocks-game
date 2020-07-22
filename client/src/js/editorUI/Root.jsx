import React from 'react'
import Creator from './Creator.jsx'
import Toolbar from './Toolbar.jsx'

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

    this._handleKeyDown = (e) => {
      if(e.keyCode === 27) {
        this._creatorRef.current.clearSelectedCreatorObject()
      }
    }

    this._creatorRef = React.createRef()
  }

  componentDidMount() {
    document.addEventListener("keydown", this._handleKeyDown, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this._handleKeyDown, false);
  }

  render() {
    const { objectSelected } = this.state

    return (
      <div className="EditorUI">
        <Creator ref={this._creatorRef}></Creator>
        <Toolbar></Toolbar>
      </div>
    )
  }
}
