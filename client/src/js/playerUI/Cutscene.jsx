import React from 'react'
import { Textfit } from 'react-textfit';
import DialogueBox from './DialogueBox.jsx'

export default class Cutscene extends React.Component{
  constructor(props) {
    super(props)
  }

  render() {
    const { scenes } = this.props

    const scene = scenes[0]

    if(!scene) return null

    let backgroundImage = null
    if(scene.image) backgroundImage = "url('"+scene.image.url+"')"

    return <div className="Cutscene" style={{backgroundImage }}>
      {scene.text && <DialogueBox dialogue={[scene.text]}/>}
    </div>
  }
}
