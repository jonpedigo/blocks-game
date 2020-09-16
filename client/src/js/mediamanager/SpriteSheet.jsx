import React from 'react'
import classnames from 'classnames'
import PixiMapSprite from '../components/PixiMapSprite.jsx'
import {
  SpriteSheetTagsSelect,
  SpriteSheetAuthorSelect
} from '../components/SelectComponents.jsx'
import modals from '../sequenceeditor/modals.js'

export default class SpriteSheet extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      spriteSheet: {
        sprites: []
      }
    }
  }

  componentDidMount() {
    const ss = window.spriteSheets.find(({id}) => id == this.props.id)
    if(!ss.tags) ss.tags= []
    this.setState({
      spriteSheet: ss
    })
  }

  getJSON = () => {
    return this.state.spriteSheet
  }

  _renderSprite(sprite, index) {
    const { textureId } = sprite
    return <div className={classnames("SpriteContainer", {"SpriteContainer--selected": this.state.textureIdSelected === textureId})}
      onClick={() => {
        this.setState({
          textureIdSelected: textureId,
          textureIndexSelected: index
        })
      }}
      style={{backgroundColor: GAME.world.backgroundColor || 'black'}}>
        <PixiMapSprite width="40" height="40" textureId={textureId}/>
    </div>
  }

  _openEditTextModal = (title, value) => {
    const { spriteSheet } = this.state
    modals.openEditTextModal(title, spriteSheet[value], (result) => {
      if(result && result.value) {
        spriteSheet[value] = result.value
        this.setState({spriteSheet})
      }
    })
  }

  render() {
    const { spriteSheet } = this.state;

    return <div className="SpriteSheet">
      <div className="ManagerForm">
        <div className="ManagerInput__text"><i className="fa fas fa-edit Manager__button" onClick={() => this._openEditTextModal('Edit Name', 'name')}/>
          Name: <div className="ManagerInput__value">{spriteSheet.name}</div>
        </div>
        <SpriteSheetAuthorSelect currentValue={spriteSheet.author} onChange={(event) => {
          const { spriteSheet } = this.state;
          spriteSheet.author = event.value
          this.setState({spriteSheet})
        }}/>
        <div className="ManagerInput__text"><i className="fa fas fa-edit Manager__button" onClick={() => this._openEditTextModal('Edit image url', 'imageUrl')}/>
          Image url: <div className="ManagerInput__value">{spriteSheet.imageUrl}</div>
        </div>
        <SpriteSheetTagsSelect currentValue={spriteSheet.tags} onChange={(event) => {
          const { spriteSheet } = this.state;
          if(!event) spriteSheet.tags = []
          else spriteSheet.tags = event.map(({value}) => value)
          this.setState({spriteSheet})
        }}/>
      </div>
      {spriteSheet.sprites.map((sprite, index) => {
        return this._renderSprite(sprite, index)
      })}
    </div>
  }
}
