import React from 'react'
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
