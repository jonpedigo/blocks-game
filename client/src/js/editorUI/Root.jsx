import React from 'react'
import Toolbar from './Toolbar.jsx'
import FileUploader from '../components/FileUploader.jsx'
import { ToastContainer, toast, Slide, Zoom, Flip, Bounce } from 'react-toastify';

window.toastIds = {}
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

  onRequestAdminApproval = (action, data) => {
    const toastInfo = {
      autoClose: false,
      newestOnTop: true,
      closeOnClick: false,
    }

    const toastId = toast(<div>
      <div>
        {data.text}
      </div>
      <button onClick={() => {
        if(action === 'startGame') window.socket.emit('startGame')
        if(action === 'stopGame') window.socket.emit('stopGame')
        if(action === 'resolveSequenceItem') window.socket.emit('resolveSequenceItem', data.sequenceId)
        if(action === 'unpauseSequence') window.socket.emit('togglePauseSequence', data.sequenceId)
        window.socket.emit('resolveAdminApproval', data.requestId, true)
      }}>
        {data.approveButtonText || 'Approve'}
      </button>
      <button onClick={() => {
        if(action === 'unpauseSequence') window.socket.emit('stopSequence', data.sequenceId)
        window.socket.emit('resolveAdminApproval', data.requestId, false)
      }}>
        {data.rejectButtonText || 'Reject'}
      </button>
    </div>, toastInfo)

    window.toastIds[data.requestId] = toastId
  }

  onResolveAdminApproval(id) {
    toast.dismiss(window.toastIds[id])
  }

  render() {
    const { objectSelected } = this.state

    if(!PAGE.role.isAdmin) return null
    //
    // <div style={{backgroundColor: '#aaa', position: 'absolute', right: '0px', top:'0px'}}>
    //   <FileUploader/>
    //   <img src={awsURL + "116420308_10158756056302340_8773775433747760236_n.jpg"}></img>
    // </div>

    return (
      <div className="EditorUI">
        <Toolbar></Toolbar>
      </div>
    )
  }
}
