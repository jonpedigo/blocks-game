import React from 'react'
import { Textfit } from 'react-textfit';

export default class DialogueBox extends React.Component{
  constructor(props) {
    super(props)
  }

  render() {
    const hero = GAME.heros[HERO.id]
    return <div className="DialogueBox">{hero.dialogue && hero.dialogue[0]}</div>
  }
}
