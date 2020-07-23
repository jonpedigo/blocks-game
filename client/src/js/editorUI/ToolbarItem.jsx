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
    const { iconName, children } = this.props

    const { open } = this.state

    return (
      <div className="Toolbar__tool-container" onMouseEnter={() => {
        this.setState({ open: true })
      }}
      onMouseLeave={() => {
        this.setState({ open: false })
      }}
      >
        <i className={"Toolbar__tool-selector fa fas " + iconName}>
        </i>
        <div className="Toolbar__tool-children">
          {open && children.map((child) => {
            return <div className="Toolbar__tool-child">
              {child}
            </div>
          })}
        </div>
      </div>
    )
  }
}
