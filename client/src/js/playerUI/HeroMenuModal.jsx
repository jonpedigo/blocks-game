import React from 'react'
import classnames from 'classnames'
import Modal from '../components/Modal.jsx'

export default class HeroMenuModal extends React.Component {
  render() {
    const { onClose, onOpenInventoryModal, onOpenControlsInfoModal, hero } = this.props;

    return <Modal className="HeroMenuModal" onContainerClick={onClose}>
      <div className="Modal__header">{'Menu'}</div>
      <div className="Modal__button">Return to Game</div>
      <div className="Modal__button" onClick={onOpenControlsInfoModal}>Controls</div>
      <div className="Modal__button" onClick={onOpenInventoryModal}>Inventory</div>
    </Modal>
  }
}
