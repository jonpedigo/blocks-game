import React from 'react'
import SpriteSheetEditor from './SpriteSheetEditor.jsx'
import SpriteSelector from './SpriteSelector.jsx'
import modals from '../../mapeditor/modals'
import Collapsible from 'react-collapsible';

window.spriteSheetTags = {
  scifi: false,
  fantasy: false,
  modern : false,

  city: false,
  village: false,

  topdown: false,
  platformer: false,
  overworld: false,

  characters: false,

  environment: false,

  items: false,

  weapons: false,
  food: false,

  monsters: false,
  animals: false,
  vehicles: false,
  robots: false,
  farm: false,
  pets: false,

  indoors: false,
  outdoors: false,

  sports: false,
  road: false,

  crates: false,
  chests: false,
  dungeon: false,

  oryx: false,
  kenney: false,

  candy: false,
  retro: false,

  icons: false,
  ui: false,

  ['8px']: false,
  ['16px']: false,
  ['32px']: false,
  ['64px']: false,
  ['128px']: false,
}

export default class MediaManager extends React.Component {
  constructor(props) {
    super(props)

    this.selectedRef = React.createRef();
  }

  saveSelected = () => {
    if(this.selectedRef.current) {
      const json = this.selectedRef.current.getJSON()
      if(this.props.selectedMenu === 'SpriteSheetEditor') {
        window.socket.emit('saveSpriteSheetJSON', json.id, json)
        window.spriteSheets = window.spriteSheets.map((ss) => {
          if(ss.id === json.id) return json
          return ss
        })
      }
    }

    this.props.returnToList()
  }

  _newSpriteSheet() {
    Swal.fire({
      title: 'Select a spritesheet author',
      showClass: {
        popup: 'animated fadeInDown faster'
      },
      hideClass: {
        popup: 'animated fadeOutUp faster'
      },
      input: 'select',
      inputOptions: Object.keys(window.spriteSheetAuthors),
    }).then((result) => {
      const ssAuthor = Object.keys(window.spriteSheetAuthors)[result.value]

      Swal.fire({
        title: 'Give the sprite sheet an id',
        showClass: {
          popup: 'animated fadeInDown faster'
        },
        hideClass: {
          popup: 'animated fadeOutUp faster'
        },
        input: 'text',
      }).then((result) => {
        const id = result.value

        Swal.fire({
          title: 'What is the image path from /images/',
          showClass: {
            popup: 'animated fadeInDown faster'
          },
          hideClass: {
            popup: 'animated fadeOutUp faster'
          },
          input: 'text',
        }).then((result) => {
          const imageUrl = result.value
          modals.openEditCodeModal('Paste spritesheet JSON code here', [], (result) => {
            if(result && result.value) {
              const sprites = JSON.parse(result.value)
              const json = {
                sprites,
                id,
                imageUrl,
                author: ssAuthor
              }
              window.socket.emit('saveSpriteSheetJSON', id, json)
              window.reload()
            }
          })
        })
      })
    })
  }

  _organizeSpriteSheets() {
    const byTag = {}

    window.spriteSheets.forEach((ss) => {
      if(ss.tags) ss.tags.forEach((tag) => {
        if(!byTag[tag]) byTag[tag] = []
        byTag[tag].push(ss)
      })
    })

    return byTag
  }

  _renderSpriteSheets() {
    if(this.props.selectedMenu === 'SpriteSheetEditor') {
      return window.spriteSheets.map((ss) => {
        return <div className="Manager__list-item" onClick={() => this.props.openId(ss.id)}>{ss.name || ss.id}</div>
      })
    }

    const assetsByTag = this._organizeSpriteSheets()

    return Object.keys(assetsByTag).map((tag) => {
      const tagList = assetsByTag[tag]
      return <Collapsible trigger={tag}>{tagList.map((ss) => {
          return <div className="Manager__list-item" onClick={() => this.props.openId(ss.id)}>{ss.name || ss.id}</div>
      })}
      </Collapsible>
    })
  }

  render() {
    const { selectedMenu, selectedId } = this.props

    if(selectedId && selectedMenu === 'SpriteSheetEditor') {
      return <div className="Manager">
        <div className="ManagerMenu">
          <div className="ManagerMenu__right">
            <div className="Manager__button" onClick={this.props.returnToList}>Cancel</div>
            <div className="Manager__button" onClick={this.saveSelected}>Save</div>
          </div>
          <div className="ManagerMenu__id" onClick={this._openEditIdModal}>{selectedId}</div>
        </div>
        <SpriteSheetEditor ref={this.selectedRef} id={selectedId}/>
      </div>
    }

    if(selectedId && selectedMenu === 'SpriteSelector') {
      return <div className="Manager">
        <div className="ManagerMenu">
          <i className="fas fa-arrow-left Manager__button Manager__button--large " onClick={this.props.returnToList}></i>
        </div>
        <SpriteSelector objectSelected={this.props.objectSelected} ref={this.selectedRef} id={selectedId}/>
      </div>
    }

    return <div className="Manager">
      <i className="ManagerMenu__right Manager__button Manager__button--large fas fa-times" onClick={this.props.closeManager}/>
      <div className="Manager__list">
        {selectedMenu === 'SpriteSheetEditor' && <div className="Manager__list-item" onClick={this._newSpriteSheet}>New SpriteSheet</div>}
        {this._renderSpriteSheets()}
      </div>
    </div>
  }
}
