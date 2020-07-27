import React from 'react'
import classnames from 'classnames'
import { SketchPicker, SwatchesPicker } from 'react-color';
import Swal from 'sweetalert2/src/sweetalert2.js';
import modals from '../mapeditor/modals'
import ToolbarRow from './ToolbarRow.jsx'
import ToolbarButton from './ToolbarButton.jsx'

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
        <ToolbarRow open iconName='fa-map'>
          <ToolbarButton iconName="fa-object-group"></i>
        </ToolbarRow>

        Bulldoze -> Map Action
        <i className="Toolbar__tool-selector fa fas fa-snowplow" onMouseEnter={() => {
          console.log('?')
          window.setFontAwesomeCursor("\uf7d2", "#FFF")
        }} onMouseLeave={() => {
          document.body.style.cursor = 'default';
        }}></i>
        */}

        {/* World Edit -> Pull out */}
        <ToolbarRow iconName='fa-globe'>
          {/* Day Night Cycle -> Dat GUI */}
          <ToolbarButton iconName="fa-cloud-sun-rain" onClick={() => {
            LIVEEDITOR.open(GAME.world, 'daynightcycle')
          }}/>
          <ToolbarButton iconName="fa-sliders-h" onClick={() => {
            LIVEEDITOR.open(GAME.world, 'world')
          }}/>

          {/* Clear All Objects -> Map Action */}
          <ToolbarButton iconName="fa-trash-alt" onClick={async () => {
            const { value: confirm } = await Swal.fire({
              title: "Are you sure you want to delete all objects on the map?",
              showClass: {
                popup: 'animated fadeInDown faster'
              },
              hideClass: {
                popup: 'animated fadeOutUp faster'
              },
              showCancelButton: true,
              confirmButtonText: 'Yes, Delete all objects',
            })
            if(confirm) {
              window.socket.emit('resetObjects')
            }
          }}/>
        </ToolbarRow>

        <ToolbarRow iconName='fa-atlas'>
          <ToolbarButton text="Mario" onShiftClick onClick={() => {
            EDITOR.transformWorldTo('Mario')
          }}/>
          <ToolbarButton text="Zelda" onShiftClick onClick={() => {
            EDITOR.transformWorldTo('Zelda')
          }}/>
          <ToolbarButton text="Pacman" onShiftClick onClick={() => {
            EDITOR.transformWorldTo('Pacman')
          }}/>
          <ToolbarButton text="Smash" onShiftClick onClick={() => {
            EDITOR.transformWorldTo('Smash')
          }}/>
          <ToolbarButton text="Purg" onShiftClick onClick={() => {
            EDITOR.transformWorldTo('Purgatory')
          }}/>
          <ToolbarButton text="Default" onShiftClick onClick={() => {
            EDITOR.transformWorldTo('Default')
          }}/>
        </ToolbarRow>

        {/* Hero Edit -> Pull out */}
        <ToolbarRow open iconName='fa-street-view'>
          <ToolbarButton iconName="fa-plus-square" onClick={() => {
            window.socket.emit('anticipateObject', { tags: { obstacle: true }});
            // window.socket.emit('anticipateObject', {...window.objecteditor.get(), wall: true});
          }}/>
          <ToolbarButton iconName="fa-sliders-h" onClick={() => {
            LIVEEDITOR.open(hero, 'hero')
          }}/>
          {/* star view */}
          {hero.animationZoomTarget === window.constellationDistance ? <ToolbarButton iconName="fa-globe-asia" onClick={() => {
              window.socket.emit('editHero', { id: hero.id, animationZoomTarget: hero.zoomMultiplier, endAnimation: true, })
          }}/> : <ToolbarButton iconName="fa-star" onClick={() => {
              window.socket.emit('editHero', { id: hero.id, animationZoomTarget: window.constellationDistance, animationZoomMultiplier: hero.zoomMultiplier, endAnimation: false })
          }}/>}

          {/* camera shake */}
          <ToolbarButton iconName="fa-camera" onClick={() => {
            window.socket.emit('heroCameraEffect', 'cameraShake', HERO.id, { duration: 500, frequency: 20, amplitude: 36 })
          }}/>
          <ToolbarButton iconName="fa-code"/>
          {/*
            {/* go incognito}
            <ToolbarButton iconName="fa-mask"/>
          <ToolbarButton iconName="fa-save"></i>
          <ToolbarButton iconName="fa-comment"></i>
          <ToolbarButton iconName="fa-gamepad"></i>
          */}
          {/*
          <ToolbarButton iconName="fa-skull"></i>
          <ToolbarButton iconName="fa-tag"></i>
          <ToolbarButton iconName="fa-briefcase"></i>
          */}
          <ToolbarButton iconName="fa-search-plus" onClick={() => {
            EDITOR.setHeroZoomTo('smaller')
          }}/>
          <ToolbarButton iconName="fa-search-minus" onClick={() => {
            EDITOR.setHeroZoomTo('larger')
          }}/>
        </ToolbarRow>

        <ToolbarRow open iconName='fa-chess'>
          {/* Quests -> Menu
            <ToolbarButton iconName="fa-check-square"></i>
          */}
          {/* Scenarios -> Menu */}
          <ToolbarButton iconName="fa-trophy"/>
          {/* Story -> Menu */}
          <ToolbarButton iconName="fa-leanpub"/>
          {/* Sequences -> Menu */}
          <ToolbarButton iconName="fa-sitemap" onClick={() => {
            SEQUENCEEDITOR.open()
          }}/>
          {/* Default Heros -> Menu */}
          <ToolbarButton iconName="fa-theater-masks"/>
          {/* Compendium -> Menu */}
          <ToolbarButton iconName="fa-book-dead"/>
        </ToolbarRow>

        {/* Grid -> Menu
          <ToolbarButton iconName="fa-th"></i>*/}
        <br/>
        <ToolbarRow iconName='fa-search'>
          <ToolbarButton iconName="fa-search-plus" onClick={() => {
            EDITOR.preferences.zoomMultiplier -= (EDITOR.zoomDelta * 4)
            window.local.emit('onZoomChange', HERO.id)
          }}/>
          <ToolbarButton iconName="fa-search-minus" onClick={() => {
            EDITOR.preferences.zoomMultiplier += (EDITOR.zoomDelta * 4)
            window.local.emit('onZoomChange', HERO.id)
          }}/>
          <ToolbarButton iconName="fa-times" onClick={() => {
            EDITOR.preferences.zoomMultiplier = 0
            window.local.emit('onZoomChange', HERO.id)
          }}/>
        </ToolbarRow>

        <br/>

        {/* go incognito */}
        {HERO.originalId && <ToolbarButton active={GAME.heros[HERO.originalId].tags.hidden} iconName="fa-eye-slash" onClick={() => {
          if(GAME.heros[HERO.originalId].tags.hidden) {
            window.socket.emit('editHero', { id: HERO.originalId, tags: { hidden: false } })
          } else {
            window.socket.emit('editHero', { id: HERO.originalId, tags: { hidden: true } })
          }
        }}/>}

        <br/>

        {PAGE.role.isHost &&
          <ToolbarRow open iconName='fa-cog'>
            <ToolbarButton iconName="fa-save" onClick={EDITOR.saveGame}/>
            <ToolbarButton iconName="fa-folder-open" onClick={EDITOR.loadGame}/>
            <ToolbarButton iconName="fa-file" onClick={EDITOR.newGame}/>
            <ToolbarButton iconName="fa-download" onClick={() => {
              let saveGame = GAME.cleanForSave(GAME)
              PAGE.downloadObjectAsJson(saveGame, GAME.id)
            }}/>
            <ToolbarButton iconName="fa-upload" onClick={() => {
              modals.openEditCodeModal('Paste JSON code here', {}, (result) => {
                if(result && result.value) {
                  window.local.emit('onLoadingScreenStart')
                  GAME.unload()
                  const game = JSON.parse(result.value)
                  GAME.loadAndJoin(game)
                }
              })
            }}/>
          </ToolbarRow>
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
