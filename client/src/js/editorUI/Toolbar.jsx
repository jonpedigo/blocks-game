import React from 'react'
import classnames from 'classnames'
import { SketchPicker, SwatchesPicker } from 'react-color';
import ToolbarItem from './ToolbarItem.jsx'

export default class Toolbar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: true,
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

  render() {
    const { open } = this.state

    if(!open || CONSTRUCTEDITOR.open) return null

    const hero = GAME.heros[HERO.id]

    return (
      <div className="Toolbar">
        {/* Map Actions -> Pull out
        <ToolbarItem open iconName='fa-map'>
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-object-group"></i>
        </ToolbarItem>

        Bulldoze -> Map Action
        <i className="Toolbar__tool-selector fa fas fa-snowplow" onMouseEnter={() => {
          console.log('?')
          window.setFontAwesomeCursor("\uf7d2", "#FFF")
        }} onMouseLeave={() => {
          document.body.style.cursor = 'default';
        }}></i>
        */}

        {/* World Edit -> Pull out */}
        <ToolbarItem iconName='fa-globe'>
          {/* Day Night Cycle -> Dat GUI */}
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-cloud-sun-rain" onClick={() => {
            LIVEEDITOR.open(GAME.world, 'daynightcycle')
          }}></i>
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-sliders-h" onClick={() => {
            LIVEEDITOR.open(GAME.world, 'world')
          }}></i>

          {/* Clear All Objects -> Map Action */}
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-trash-alt"></i>
        </ToolbarItem>

        <ToolbarItem iconName='fa-atlas'>
          <span className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor Toolbar__tool-selector--text">Mario</span>
          <span className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor Toolbar__tool-selector--text">Zelda</span>
          <span className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor Toolbar__tool-selector--text">Pacman</span>
          <span className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor Toolbar__tool-selector--text">Smash</span>
          <span className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor Toolbar__tool-selector--text">Purg</span>
        </ToolbarItem>

        {/* Hero Edit -> Pull out */}
        <ToolbarItem open iconName='fa-street-view'>
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-plus-square" onClick={() => {
            window.socket.emit('anticipateObject', { tags: { obstacle: true }});
            // window.socket.emit('anticipateObject', {...window.objecteditor.get(), wall: true});
          }}></i>
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-sliders-h" onClick={() => {
            LIVEEDITOR.open(hero, 'hero')
          }}></i>
          {/* star view */}
          {hero.animationZoomTarget === window.constellationDistance ? <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-globe-asia" onClick={() => {
              window.socket.emit('editHero', { id: hero.id, animationZoomTarget: hero.zoomMultiplier, endAnimation: true, })
          }}></i> : <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-star" onClick={() => {
              window.socket.emit('editHero', { id: hero.id, animationZoomTarget: window.constellationDistance, animationZoomMultiplier: hero.zoomMultiplier, endAnimation: false })
          }}></i>}

          {/* camera shake */}
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-camera" onClick={() => {
            window.socket.emit('heroCameraEffect', 'cameraShake', HERO.id, { duration: 500, frequency: 20, amplitude: 36 })
          }}></i>
          {/* go incognito */}
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-mask"></i>
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-code"></i>
          {/*
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-save"></i>
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-comment"></i>
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-gamepad"></i>
          */}
          {/*
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-skull"></i>
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-tag"></i>
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-briefcase"></i>
          */}
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-search-plus" onClick={() => {
            EDITOR.setHeroZoomTo('smaller')
          }}></i>
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-search-minus" onClick={() => {
            EDITOR.setHeroZoomTo('larger')
          }}></i>
        </ToolbarItem>

        <ToolbarItem open iconName='fa-chess'>
          {/* Quests -> Menu
            <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-check-square"></i>
          */}
          {/* Scenarios -> Menu */}
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-trophy"></i>
          {/* Story -> Menu */}
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-leanpub"></i>
          {/* Sequences -> Menu */}
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-sitemap" onClick={() => {
            SEQUENCEEDITOR.open()
          }}></i>
          {/* Default Heros -> Menu */}
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-theater-masks"></i>
          {/* Compendium -> Menu */}
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-book-dead"></i>
        </ToolbarItem>

        {/* Grid -> Menu
          <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-th"></i>*/}
        <br/>
        <ToolbarItem iconName='fa-search'>

        <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-search-plus" onClick={() => {
          EDITOR.preferences.zoomMultiplier -= (EDITOR.zoomDelta * 4)
          window.local.emit('onZoomChange', HERO.id)
        }}></i>
        <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-search-minus" onClick={() => {
          EDITOR.preferences.zoomMultiplier += (EDITOR.zoomDelta * 4)
          window.local.emit('onZoomChange', HERO.id)
        }}></i>
        <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-times" onClick={() => {
          EDITOR.preferences.zoomMultiplier = 0
          window.local.emit('onZoomChange', HERO.id)
        }}></i>
        </ToolbarItem>

        <br/>

        {PAGE.role.isHost &&
          <ToolbarItem open iconName='fa-cog'>
            <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-save" onClick={EDITOR.saveGame}></i>
            <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-folder-open" onClick={EDITOR.loadGame}></i>
            <i className="Toolbar__tool-selector Toolbar__tool-selector--normal-cursor fa fas fa-file" onClick={EDITOR.newGame}></i>
          </ToolbarItem>
        }
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
