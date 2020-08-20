import React from 'react'
import ReactDOM from 'react-dom'
import Root from './Root.jsx'

import creatorLibrary from '../libraries/creatorLibrary.js'

class Creator {
  constructor() {
    this.container = null
    this.ref = null
  }

  onFirstPageGameLoaded() {
    creatorLibrary.onGameLoaded()

    // this.container = container
    const initialProps = {
      ref: ref => CREATOR.ref = ref
    }

    const container = document.getElementById('Creator')
    CREATOR.container = container

    console.log(container)
    // Mount React App
    ReactDOM.render(
      React.createElement(Root, initialProps),
      container
    )
  }

  onEditHero() {

  }

  close() {
    CREATOR.ref.close()
  }

  open() {
    CREATOR.ref.open()
  }

  onConstructEditorClose() {
    CREATOR.ref.forceUpdate()
  }
  onConstructEditorStart() {
    CREATOR.ref.forceUpdate()
  }
}

window.CREATOR = new Creator()
