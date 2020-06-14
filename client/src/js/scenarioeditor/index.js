import React from 'react'
import ReactDOM from 'react-dom'
import Root from './Root.jsx'

class ScenarioEditor {
  constructor() {
    this.container = null
    this.ref = null
    this.updateStateInterval = null
  }

  open() {
    this.ref.open()
  }

  onGameLoaded() {
    const initialProps = {
      ref: ref => SCENARIOEDITOR.ref = ref
    }

    const container = document.createElement('div')
    container.id = 'ScenarioEditorContainer'
    document.body.appendChild(container)
    SCENARIOEDITOR.container = container

    // Mount React App
    ReactDOM.render(
      React.createElement(Root, initialProps),
      container
    )
  }
}

window.SCENARIOEDITOR = new ScenarioEditor()
