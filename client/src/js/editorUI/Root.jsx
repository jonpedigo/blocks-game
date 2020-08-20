import React from 'react'
import Creator from '../components/Creator.jsx'
import Toolbar from './Toolbar.jsx'
import FileUploader from '../components/FileUploader.jsx'

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

    if(!PAGE.role.isAdmin) return null
    //
    // <div style={{backgroundColor: '#aaa', position: 'absolute', right: '0px', top:'0px'}}>
    //   <FileUploader/>
    //   <img src={awsURL + "116420308_10158756056302340_8773775433747760236_n.jpg"}></img>
    // </div>

    return (
      <div className="EditorUI">
        <Creator ref={this._creatorRef} creatorObjects={window.adminCreatorObjects}></Creator>
        <Toolbar></Toolbar>
      </div>
    )
  }
}
