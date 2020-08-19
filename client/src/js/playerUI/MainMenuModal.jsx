import React from 'react'
import classnames from 'classnames'
import Modal from '../components/Modal.jsx'

export default class MainMenuModal extends React.Component {
  render() {
    const { onClose, onOpenControlsInfoModal } = this.props;

    // <div className="MainMenuModal__button">Pause Game</div>
    // <div className="MainMenuModal__item">About</div>
    // <div className="MainMenuModal__item">Quit to Main Menu</div>
    // <div className="MainMenuModal__item">Quit and close tab</div>
    return <Modal className="MainMenuModal" onContainerClick={onClose}>
      <div className="Modal__header">Main Menu</div>
      <div className="Modal__button">Return to Game</div>
      <div className="Modal__button" onClick={onOpenControlsInfoModal}>Controls</div>
    </Modal>
  }
}
