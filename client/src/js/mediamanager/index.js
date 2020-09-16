import React from 'react'
import ReactDOM from 'react-dom'
import Root from './Root.jsx'

class MediaManager {
  constructor() {
    this.container = null
    this.ref = null
  }

  open = (selectedMenu) => {
    this.ref.open(selectedMenu)
  }

  close = () => {
    this.ref.close()
  }

  onStopGame = () => {
    if(this.ref) this.ref.forceUpdate()
  }

  onGameStart() {
    if(this.ref) this.ref.forceUpdate()
  }

  onAssetsLoaded() {
    const initialProps = {
      ref: ref => MEDIAMANAGER.ref = ref
    }

    const container = document.createElement('div')
    container.id = 'MediaManagerContainer'
    document.body.appendChild(container)
    MEDIAMANAGER.container = container

    // Mount React App
    ReactDOM.render(
      React.createElement(Root, initialProps),
      container
    )
  }
}

window.MEDIAMANAGER = new MediaManager()
