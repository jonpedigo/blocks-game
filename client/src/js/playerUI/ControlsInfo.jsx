import React from 'react'
import classnames from 'classnames'
import KeyboardSprite from '../components/KeyboardSprite.jsx'

export default class ControlsInfo extends React.Component {

  _getUsedKeys(hero) {
    const keys = []

    keys.push(...Object.keys(window.arrowKeysBehavior[hero.arrowKeysBehavior]).map((key) => {
      return window.arrowKeysBehavior[hero.arrowKeysBehavior][key]
    }))

    console.log(keys)
  }

  render() {
    const { onClose } = this.props;

    return <div className="ControlsInfo">
      <div className="Modal__item">Return to Game</div>
    </div>
  }
}
