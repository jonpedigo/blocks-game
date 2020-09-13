import React from 'react'
import classnames from 'classnames'
import { SketchPicker, SwatchesPicker } from 'react-color';
import Swal from 'sweetalert2/src/sweetalert2.js';
import modals from '../mapeditor/modals'
import ToolbarRow from '../editorUI/ToolbarRow.jsx'
import ToolbarButton from '../editorUI/ToolbarButton.jsx'

export default class Toolbar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: true,
    }

    this._open = () => {
      this.setState({
        open: true,
      })
    }

    this._close = () => {
      this.setState({
        open: false,
      })
    }
  }

  _renderStartStop() {
    return <React.Fragment>{!GAME.gameState.started && <ToolbarButton iconName="fa-play" onClick={() => {
      window.socket.emit('requestAdminApproval', 'startGame', { text: 'Start Game Request', requestId: 'request-'+window.uniqueID()})
    }}/>}
    {GAME.gameState.started && <ToolbarButton iconName='fa-stop' onClick={() => {
      window.socket.emit('stopGame')
    }}/>}</React.Fragment>
  }

  render() {
    if(PAGE.role.isAdmin) return null
    const { open } = this.state

    const hero = GAME.heros[HERO.id]

    if(!hero || !open || CONSTRUCTEDITOR.open || PATHEDITOR.open) return null

    return (
      <div className="Toolbar">
        {hero.flags.canStartStopGame && this._renderStartStop()}
      </div>
    )
  }
}
