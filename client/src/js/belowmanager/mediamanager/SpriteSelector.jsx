import React from 'react'
import classnames from 'classnames'
import {
  SpriteSheetTagsSelect,
  SpriteSheetAuthorSelect
} from '../../components/SelectComponents.jsx'
import modals from '../../sequenceeditor/modals.js'
import SpriteSheet from './SpriteSheet.jsx'

export default class SpriteSelector extends React.Component {
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

  render() {
    const { spriteSheet } = this.state;

    return <div className="SpriteSelector SpriteSheet">
      <SpriteSheet spriteSheet={spriteSheet} selectedTextureId={this.props.objectSelected.sprite} onClick={(sprite) => {
          if(this.props.objectSelected === 'creator') {
            window.local.emit('onSelectTextureId', sprite.textureId, 'creator')
          } else if(this.props.objectSelected === 'constructEditor') {
            window.local.emit('onSelectTextureId', sprite.textureId, 'constructEditor')
          } else if(this.props.objectSelected.id) {
            MAPEDITOR.networkEditObject(this.props.objectSelected, { id: this.props.objectSelected.id, defaultSprite: sprite.textureId })
          }
      }}/>
    </div>
  }
}
