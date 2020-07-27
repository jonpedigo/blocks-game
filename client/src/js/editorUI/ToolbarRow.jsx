import React from 'react'
import classnames from 'classnames'
import { SketchPicker, SwatchesPicker } from 'react-color';

export default class ToolbarRow extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false
    }
  }

  render() {
    const { active, iconName, children, column } = this.props

    const { open } = this.state

    return (
      <div className="Toolbar__row">
        <div className={classnames("Toolbar__tool-container", {"Toolbar__tool-container--open": open, "Toolbar__tool-container--closed": !open })} onMouseEnter={() => {
          this.setState({ open: true })
        }}
        onMouseLeave={(event) => {
          this.setState({ open: false })
        }}
        >
          <i className={classnames("Toolbar__tool-selector fa fas ", iconName, { "Toolbar__tool-selector--normal-cursor": true, "Toolbar__tool-selector--active": active })}>
          </i>
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
