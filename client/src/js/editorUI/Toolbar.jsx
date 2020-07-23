import React from 'react'
import classnames from 'classnames'
import { SketchPicker, SwatchesPicker } from 'react-color';
import ToolbarItem from './ToolbarItem.jsx'

export default class Toolbar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: true,
      isColorPickerOpen: false,
      colorSelected: '#FFFFFF'
    }

    this._open = () => {
      this.setState({
        open: true,
      })
    }

    this._close = () => {
      this.setState({
        open: false,
      })
    }
  }

  _openColorPicker() {
    this.setState({isColorPickerOpen: true})
  }

  _closeColorPicker() {
    this.setState({isColorPickerOpen: false})
  }

  _renderColorPicker() {
    const { colorSelected, isColorPickerOpen } = this.state

    if(!isColorPickerOpen) return null

    return <div className="Creator__color-picker"><SketchPicker
        color={colorSelected}
        onChange={(color) => {
          this.setState({
            colorSelected: color.hex
          })
        }}
        onChangeComplete={ (color) => {
          this.setState({
            colorSelected: color.hex
          })
        }}
      />
    <br/>
    <SwatchesPicker
      color={colorSelected}
      onChangeComplete={ (color) => {
        this.setState({
          colorSelected: color.hex
        })
      }}/>
    </div>
  }

  _renderColorCategory() {
    const { isColorPickerOpen, colorSelected } = this.state

    return <div className="Creator__category-container">
      {!isColorPickerOpen && <div className="Creator__category Creator__category-top" style={{backgroundColor: colorSelected}} onClick={this._openColorPicker}></div>}
      {isColorPickerOpen && <div className="Creator__category Creator__category-top" style={{backgroundColor: colorSelected}} onClick={this._closeColorPicker}><i className="fa fas fa-chevron-down"></i></div>}
      {this._renderColorPicker()}
    </div>
  }

  render() {
    const { open } = this.state

    if(!open || CONSTRUCTEDITOR.open) return null

    return (
      <div className="Toolbar">
        {/* Map Actions -> Pull out */}
        <ToolbarItem open iconName='fa-map'>
          {/* Group Object Select -> Map Action */}
          <i className="Toolbar__tool-selector fa fas fa-object-group"></i>
          {/* Bulldoze -> Map Action */}
          <i className="Toolbar__tool-selector fa fas fa-snowplow"></i>
          <i className="Toolbar__tool-selector fa fas fa-trash-alt"></i>

        </ToolbarItem>

        {/* World Edit -> Pull out */}
        <ToolbarItem open iconName='fa-globe'>
          {/* Day Night Cycle -> Dat GUI */}
          <i className="Toolbar__tool-selector fa fas fa-cloud-sun-rain"></i>
          <i className="Toolbar__tool-selector fa fas fa-sliders-h"></i>
          <span className="Toolbar__tool-selector Toolbar__tool-selector--text">Mario</span>
          <span className="Toolbar__tool-selector Toolbar__tool-selector--text">Zelda</span>
          <span className="Toolbar__tool-selector Toolbar__tool-selector--text">Pacman</span>
          <span className="Toolbar__tool-selector Toolbar__tool-selector--text">Smash</span>
          <span className="Toolbar__tool-selector Toolbar__tool-selector--text">Purg</span>
        </ToolbarItem>


        {/* Hero Edit -> Pull out */}
        <ToolbarItem open iconName='fa-street-view'>
          <i className="Toolbar__tool-selector fa fas fa-plus-square"></i>
          <i className="Toolbar__tool-selector fa fas fa-sliders-h"></i>
          {/* star view */}
          <i className="Toolbar__tool-selector fa fas fa-star"></i>
          {/* camera shake */}
          <i className="Toolbar__tool-selector fa fas fa-camera"></i>
          {/* go incognito */}
          <i className="Toolbar__tool-selector fa fas fa-mask"></i>
          {/* save as default */}
          <i className="Toolbar__tool-selector fa fas fa-save"></i>
          <i className="Toolbar__tool-selector fa fas fa-comment"></i>
          <i className="Toolbar__tool-selector fa fas fa-briefcase"></i>
          <i className="Toolbar__tool-selector fa fas fa-gamepad"></i>
          <i className="Toolbar__tool-selector fa fas fa-code"></i>
          {/*
          <i className="Toolbar__tool-selector fa fas fa-skull"></i>
          <i className="Toolbar__tool-selector fa fas fa-tag"></i>
          */}
        </ToolbarItem>

        <ToolbarItem open iconName='fa-chess'>
          {/* Quests -> Menu
            <i className="Toolbar__tool-selector fa fas fa-check-square"></i>
          */}
          {/* Scenarios -> Menu */}
          <i className="Toolbar__tool-selector fa fas fa-trophy"></i>
          {/* Story -> Menu */}
          <i className="Toolbar__tool-selector fa fas fa-leanpub"></i>
          {/* Sequences -> Menu */}
          <i className="Toolbar__tool-selector fa fas fa-sitemap"></i>
          {/* Default Heros -> Menu */}
          <i className="Toolbar__tool-selector fa fas fa-theater-masks"></i>
          {/* Compendium -> Menu */}
          <i className="Toolbar__tool-selector fa fas fa-book-dead"></i>
        </ToolbarItem>

        <ToolbarItem open iconName='fa-cog'>
          <i className="Toolbar__tool-selector fa fas fa-save"></i>
          <i className="Toolbar__tool-selector fa fas fa-folder-open"></i>
          <i className="Toolbar__tool-selector fa fas fa-file"></i>
        </ToolbarItem>
        {/* Grid -> Menu
          <i className="Toolbar__tool-selector fa fas fa-th"></i>*/}
      </div>
    )
  }
}

// world transform
// set to mario ( hold shift to also change objects, hero )
// set to smash
// set to pacman
// set to zelda
// set to purgatory

// world actions
// edit day night
// edit world OTHER

// special map actions
// bulldoze
// select group
// clear all objects ( Set to platformer, maze, etc )
// clear spawned objects

// currentHero actions
// anticipate add
// CAMERA SHAKE
// SEND TO STAR VIEW
// ?
// Turn invisible
// change controls
// change chat service
// view inventory
// reset to default, respawn
// Live Edit
