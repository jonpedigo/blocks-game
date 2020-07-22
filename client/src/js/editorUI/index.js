import React from 'react'
import ReactDOM from 'react-dom'
import Root from './Root.jsx'

import creatorObjectLibrary from './creatorObjectLibrary.js'

class EditorUI {
  constructor() {
    this.container = null
    this.ref = null
  }

  onGameLoaded() {
    creatorObjectLibrary.onGameLoaded()

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
}

window.EDITORUI = new EditorUI()
