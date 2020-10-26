import React from 'react'
import classnames from 'classnames'
import { SketchPicker, SwatchesPicker } from 'react-color';
import ToolbarButton from './ToolbarButton.jsx';

export default class ToolbarRow extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false
    }
  }

  render() {
    let { active, iconName, children, column, onClick, onShiftClick, rowButtonChildren, rowButtonBackgroundColor } = this.props

    const { open } = this.state

    if(!children.map) children = [children]

    return (
      <div className="Toolbar__row">
        <div className={classnames("Toolbar__tool-container", {"Toolbar__tool-container--open": open, "Toolbar__tool-container--closed": !open })} onMouseEnter={() => {
          this.setState({ open: true })
        }}
        onMouseLeave={(event) => {
          this.setState({ open: false })
        }}
        >
          <ToolbarButton iconName={iconName} onClick={onClick} active={active} onShiftClick={onShiftClick} backgroundColor={rowButtonBackgroundColor}>
            {rowButtonChildren}
          </ToolbarButton>
          <div className={classnames({"Toolbar__tool-children": !column, "Toolbar__tool-children--column": column })}>
            {children && open && children.map((child) => {
              return <div className="Toolbar__tool-child">
                {child}
              </div>
            })}
          </div>
        </div>
      </div>
    )
  }
}
