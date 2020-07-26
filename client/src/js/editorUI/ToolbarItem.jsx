import React from 'react'
import classnames from 'classnames'
import { SketchPicker, SwatchesPicker } from 'react-color';

export default class Toolbar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false
    }
  }

  render() {
    const { iconName, children, column } = this.props

    const { open } = this.state

    return (
      <div className="Toolbar__tool-item">
        <div className={classnames("Toolbar__tool-container", {"Toolbar__tool-container--open": open, "Toolbar__tool-container--closed": !open })} onMouseEnter={() => {
          this.setState({ open: true })
        }}
        onMouseLeave={(event) => {
          this.setState({ open: false })
        }}
        >
          <i className={"Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas " + iconName}>
          </i>
          <div className={classnames({"Toolbar__tool-children": !column, "Toolbar__tool-children--column": column })}>
            {open && children.map((child) => {
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
