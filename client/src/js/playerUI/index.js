import React from 'react'
import ReactDOM from 'react-dom'
import Root from './Root.jsx'

class PlayerUI {
  constructor() {
    this.container = null
    this.ref = null
    this.updateStateInterval = null
  }

  onPageLoaded() {
    // this.container = container
    const initialProps = {
      ref: ref => PLAYERUI.ref = ref
    }

    const container = document.createElement('div')
    container.id = 'PlayerUIContainer'
    document.getElementById('GameContainer').appendChild(container)
    PLAYERUI.container = container

    // Mount React App
    ReactDOM.render(
      React.createElement(Root, initialProps),
      container
    )
  }

  onGameLoaded() {
    if(!PLAYERUI.updateStateInterval) {
      PLAYERUI.updateStateInterval = setInterval(PLAYERUI.ref.onUpdateState, 1000)
    }
  }

  onKeyDown(key, hero) {
    if(hero.id === HERO.id) {
      PLAYERUI.ref.onUpdateState()
    }
  }

  onNetworkUpdateHero(hero) {
    if(hero.id === HERO.id && GAME.heros[hero.id]) {
      if(GAME.heros[hero.id].dialogue !== hero.dialogue) {
        PLAYERUI.ref.onUpdateState()
      }
    }
  }

  onHeroStartQuest(hero, questId) {
    PLAYERUI.ref.onHeroStartQuest(hero, questId)
  }

  onHeroCompleteQuest(hero, questId) {
    PLAYERUI.ref.onHeroCompleteQuest(hero, questId)
  }
}

window.PLAYERUI = new PlayerUI()
