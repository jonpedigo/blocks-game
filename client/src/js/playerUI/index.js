import React from 'react'
import ReactDOM from 'react-dom'
import Root from './Root.jsx'

class PlayerUI {
  constructor() {
    this.container = null
    this.ref = null
    this.updateStateInterval = null
  }

  onGameLoaded() {
    // this.container = container

    const hero = GAME.heros[HERO.id]

    const initialProps = {
      ref: ref => PLAYERUI.ref = ref
    }

    const container = document.createElement('div')
    container.id = 'PlayerUIContainer'
    document.body.appendChild(container)
    PLAYERUI.container = container

    // Mount React App
    ReactDOM.render(
      React.createElement(Root, initialProps),
      container
    )

    if(!PLAYERUI.updateStateInterval) {
      PLAYERUI.updateStateInterval = setInterval(PLAYERUI.ref.onUpdateState, 1000)
    }
  }

  onStartQuest(hero, questId) {
    PLAYERUI.ref.onStartQuest(hero, questId)
  }

  onCompleteQuest(hero, questId) {
    PLAYERUI.ref.onCompleteQuest(hero, questId)
  }
}

window.PLAYERUI = new PlayerUI()
