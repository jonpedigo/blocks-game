import React from 'react'
import classnames from 'classnames'
import PixiMapSprite from '../components/PixiMapSprite.jsx'

export default class SpriteSheet extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      textureIdSelected:props.selectedTextureId || null,
      textureIndexSelected:null
    }
  }

  _renderSprite(sprite, index) {
    const { textureId } = sprite
    return <div className={classnames("SpriteContainer", {"SpriteContainer--selected": this.state.textureIdSelected === textureId})}
      onClick={() => {
        this.setState({
          textureIdSelected: textureId,
          textureIndexSelected: index
        })
        if(this.props.onClick) this.props.onClick(sprite, index)
      }}
      style={{backgroundColor: GAME.world.backgroundColor || 'black'}}>
        <PixiMapSprite width="40" height="40" textureId={textureId}/>
    </div>
  }

  render() {
    const { spriteSheet } = this.props;

    return <React.Fragment>
      {spriteSheet.sprites.map((sprite, index) => {
        return this._renderSprite(sprite, index)
      })}
    </React.Fragment>
  }
}
