import React from 'react'
import ReactDOM from 'react-dom'
import Root from './Root.jsx'

class WorldManager {
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

  }

  onPlayerIdentified() {
    const initialProps = {
      ref: ref => WORLDMANAGER.ref = ref
    }

    const container = document.createElement('div')
    container.id = 'WorldManagerContainer'
    document.body.appendChild(container)
    WORLDMANAGER.container = container

    // Mount React App
    ReactDOM.render(
      React.createElement(Root, initialProps),
      container
    )
  }
}

window.WORLDMANAGER = new WorldManager()
