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
    return <React.Fragment>{!GAME.gameState.started && !GAME.gameState.branch && <ToolbarButton iconName="fa-play" onClick={() => {
      window.socket.emit('requestAdminApproval', 'startGame', { text: 'Start Game Request', requestId: 'request-'+window.uniqueID()})
    }}/>}
    {GAME.gameState.started && <ToolbarButton iconName='fa-stop' onClick={() => {
      window.socket.emit('stopGame')
    }}/>}
    </React.Fragment>
  }

  _renderBranchButtons() {
    if(!GAME.gameState.branch) return

    return <ToolbarRow iconName="fa-code-branch" active={true} onClick={() => {
        window.socket.emit('branchGameSave')
      }}>
      <ToolbarButton iconName='fa-save' onClick={() => {
        window.socket.emit('branchGameSave')
      }}/>
      <ToolbarButton iconName='fa-trash' onClick={() => {
        window.socket.emit('branchGameCancel')
      }}/>
    </ToolbarRow>
  }

  render() {
    if(PAGE.role.isAdmin) return null
    const { open } = this.state

    const hero = GAME.heros[HERO.id]

    if(!hero || !open || CONSTRUCTEDITOR.open || PATHEDITOR.open) return null

    return (
      <div className="Toolbar">
        {hero.flags.canStartStopGame && this._renderStartStop()}
        {this._renderBranchButtons()}
        {hero.flags.canTakeMapSnapshots && <ToolbarButton iconName="fa-camera-retro" onClick={async () => {
          const { value: name } = await Swal.fire({
            title: "What is the name of this photo?",
            showClass: {
              popup: 'animated fadeInDown faster'
            },
            hideClass: {
              popup: 'animated fadeOutUp faster'
            },
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'Take picture',
          })
          if(name) {
            PIXIMAP.snapCamera(name)
          }
        }}
        onShiftClick={() => {
          PIXIMAP.snapCamera()
        }}/>}
      </div>
    )
  }
}
