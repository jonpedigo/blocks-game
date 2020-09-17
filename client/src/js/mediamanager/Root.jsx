import React from 'react'
import SpriteSheet from './SpriteSheet.jsx'
import modals from '../mapeditor/modals'

window.spriteSheetTags = {
  scifi: false,
  fantasy: false,
  
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

export default class Root extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false,
      selectedMenu: 'spritesheet',
      selectedId: null,
    }

    this.selectedRef = React.createRef();
  }

  open(selectedMenu, selectedId) {
    this.setState({
      open: true,
      selectedMenu,
      selectedId,
    })
  }

  close = () => {
    this.setState({
      open: false,
      selectedMenu: null,
      selectedId: null,
    })
  }

  saveSelected = () => {
    if(this.selectedRef.current) {
      const json = this.selectedRef.current.getJSON()
      if(this.state.selectedMenu === 'spritesheet') {
        window.socket.emit('saveSpriteSheetJSON', json.id, json)
        window.spriteSheets = window.spriteSheets.map((ss) => {
          if(ss.id === json.id) return json
          return ss
        })
      }
    }

    this.returnToList()
  }

  returnToList = () => {
    this.setState({
      selectedId: null,
    })
  }

  _openId(id) {
    this.setState({
      selectedId: id
    })
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

  render() {
    const { open, selectedMenu, selectedId } = this.state

    if(!open) return null

    if(selectedId) {
      return <div className="Manager">
        <div className="ManagerMenu">
          <div className="ManagerMenu__right">
            <div className="Manager__button" onClick={this.returnToList}>Cancel</div>
            <div className="Manager__button" onClick={this.saveSelected}>Save</div>
          </div>
          <div className="ManagerMenu__id" onClick={this._openEditIdModal}>{selectedId}</div>
        </div>
        <SpriteSheet ref={this.selectedRef} id={selectedId}/>
      </div>
    }

    return <div className="Manager">
      <i className="ManagerMenu__right Manager__button fas fa-times" onClick={this.close}/>
      <div className="Manager__list">
        <div className="Manager__list-item" onClick={this._newSpriteSheet}>New SpriteSheet</div>
        {window.spriteSheets.map((ss) => {
          return <div className="Manager__list-item" onClick={() => this._openId(ss.id)}>{ss.id}</div>
      })}
      </div>
    </div>
  }
}
