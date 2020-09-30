import React from 'react'
import ReactDOM from 'react-dom'
import Root from './Root.jsx'

class PlayerUI {
  constructor() {
    this.container = null
    this.ref = null
    this.updateStateInterval = null
  }

  onFirstPageGameLoaded() {
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

    if(!PLAYERUI.updateStateInterval) {
      PLAYERUI.updateStateInterval = setInterval(PLAYERUI.ref.forceUpdate.bind(PLAYERUI.ref), 1000)
    }
  }

  onKeyDown(key, hero) {
    if(hero.id === HERO.id) {
      PLAYERUI.ref.onUpdateState()
    }
  }

  onUpdatePlayerUI(hero) {
    if(hero.id === HERO.id) {
      PLAYERUI.ref.onUpdateState(hero)
    }
  }

  onOpenLog() {
    PLAYERUI.ref.onUpdateState()
  }

  onCloseLog() {
    PLAYERUI.ref.onUpdateState()
  }

  onSendNotification(data) {
    if((data.toast || data.modal) && (!data.playerUIHeroId || data.playerUIHeroId === HERO.id)) {
      PLAYERUI.ref.onSendNotification(data)
    } else if(data.log) {
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

  onHeroStartQuest(heroId, questId) {
    PLAYERUI.ref.onHeroStartQuest(heroId, questId)
  }

  onHeroCompleteQuest(heroId, questId) {
    PLAYERUI.ref.onHeroCompleteQuest(heroId, questId)
  }

  onShowUIGoalToast(text) {
    PLAYERUI.ref.onShowUIGoalToast(text)
  }
  onCloseUIGoalToast() {
    PLAYERUI.ref.onCloseUIGoalToast()
  }
}

window.PLAYERUI = new PlayerUI()
