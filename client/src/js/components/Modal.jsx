import React from 'react'
import classnames from 'classnames'
export default class Modal extends React.Component {
  render() {
    const { size, children, onClose, onContainerClick } = this.props

    return <div className="ModalContainer" onClick={onContainerClick || onClose} style={{height: PIXIMAP.app.screen.height, width: PIXIMAP.app.screen.width }}>
      <div className={classnames("Modal", {
        "Modal--small": size=='small',
        "Modal--medium": size=='medium',
        "Modal--large": size=='large',
      })}>
        {onClose && <div className="fa fas fa-times Modal__close" onClick={onClose}></div>}
        {children}
      </div>
    </div>
  }
}
