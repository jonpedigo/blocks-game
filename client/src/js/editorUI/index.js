import React from 'react'
import ReactDOM from 'react-dom'
import Root from './Root.jsx'
import './editor.js'

class EditorUI {
  constructor() {
    this.container = null
    this.ref = null
  }

  onFirstPageGameLoaded() {
    // this.container = container
    const initialProps = {
      ref: ref => EDITORUI.ref = ref
    }

    const container = document.createElement('div')
    container.id = 'EditorUIContainer'
    document.getElementById('GameContainer').appendChild(container)
    EDITORUI.container = container

    // Mount React App
    ReactDOM.render(
      React.createElement(Root, initialProps),
      container
    )
  }

  open(objectSelected, openEditorName) {
    EDITORUI.ref.open(objectSelected, openEditorName)
  }

  onConstructEditorClose() {
    EDITORUI.ref.forceUpdate()
  }
  onConstructEditorStart() {
    EDITORUI.ref.forceUpdate()
  }

  onStopGame() {
    setTimeout(() => {
      EDITORUI.ref.forceUpdate()
    }, 100)
  }
  onGameStart() {
    setTimeout(() => {
      EDITORUI.ref.forceUpdate()
    }, 100)
  }

  onUpdateGameState() {
    if(EDITORUI.ref) EDITORUI.ref.forceUpdate()
  }

  onEditHero(hero) {
    if(hero.id === HERO.id && GAME.heros[hero.id]) {
      EDITORUI.ref.forceUpdate()
    }
  }
}

window.EDITORUI = new EditorUI()
