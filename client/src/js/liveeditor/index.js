import React from 'react'
import ReactDOM from 'react-dom'
import Root from './Root.jsx'

class LiveEditor {
  constructor() {
    this.container = null
    this.ref = null
  }

  onGameLoaded() {
    // this.container = container
    const initialProps = {
      ref: ref => LIVEEDITOR.ref = ref
    }

    const container = document.createElement('div')
    container.id = 'LiveEditorContainer'
    document.body.appendChild(container)
    LIVEEDITOR.container = container

    // Mount React App
    ReactDOM.render(
      React.createElement(Root, initialProps),
      container
    )
  }

  open(objectSelected, openEditorName) {
    LIVEEDITOR.ref.open(objectSelected, openEditorName)
  }
}

window.LIVEEDITOR = new LiveEditor()
