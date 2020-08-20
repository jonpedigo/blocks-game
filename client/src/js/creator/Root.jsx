import React from 'react'
import Creator from './Creator.jsx'

export default class Root extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: true,
    }

    this.open = () => {
      this.setState({
        open: true,
      })
    }

    this.close = () => {
      this.setState({
        open: false,
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
    if(!PAGE.role.isAdmin) {
      const hero = GAME.heros[HERO.id]
      return <Creator ref={this._creatorRef} creatorObjects={hero.creator}></Creator>
    }

    return (
      <Creator ref={this._creatorRef} creatorObjects={window.adminCreatorObjects}></Creator>
    )
  }
}
