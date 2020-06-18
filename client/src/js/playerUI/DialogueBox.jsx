import React from 'react'
import { Textfit } from 'react-textfit';

export default class DialogueBox extends React.Component{
  constructor(props) {
    super(props)
  }

  render() {
    const { dialogue, options } = this.props

    if(dialogue) {
      return <Textfit id='fitty' max={22} className="DialogueBox">{dialogue[0]}
        <i className="DialogueBox__arrow fa fas fa-sort-down"></i>
      </Textfit>
    }

    if(options) {
      return <div className="DialogueBox DialogueBox--options">{options.map((option, index) => {
        return <div key={option.id} className="DialogueBox__option" onClick={() => {
            window.socket.emit('heroChooseOption', HERO.id, option.id)
          }}>{(index + 1) + '. ' + option.effectValue}</div>
      })}</div>
    }
  }
}
