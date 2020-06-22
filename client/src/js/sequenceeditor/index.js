import React from 'react'
import ReactDOM from 'react-dom'
import Root from './Root.jsx'

class SequenceEditor {
  constructor() {
    this.container = null
    this.ref = null
    this.updateStateInterval = null
  }

  open() {
    this.ref.open()
  }

  onPageLoaded() {
    const initialProps = {
      ref: ref => SEQUENCEEDITOR.ref = ref
    }

    const container = document.createElement('div')
    container.id = 'SequenceEditorContainer'
    document.body.appendChild(container)
    SEQUENCEEDITOR.container = container

    // Mount React App
    ReactDOM.render(
      React.createElement(Root, initialProps),
      container
    )
  }
}

window.SEQUENCEEDITOR = new SequenceEditor()
