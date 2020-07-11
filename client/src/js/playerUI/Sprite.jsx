import React from 'react'
export default class Sprite extends React.Component {
  render() {
    const texture = PIXIMAP.textures[this.props.textureId]

    const backgroundImage = "url('"+texture.baseTexture.textureCacheIds[0]+"')"
    const backgroundPositionX = -texture.orig.x
    const backgroundPositionY = -texture.orig.y
    const width = texture.orig.width
    const height = texture.orig.height

    const desiredWidth = this.props.width || GAME.grid.nodeSize
    const desiredHeight = this.props.height || GAME.grid.nodeSize

    const scale = desiredWidth/width
    const translate = (desiredWidth - width)/2 + 'px'

    const transform = `scale(${scale})`;

    const transformContainer = `translateX(${translate}) translateY(${translate})`
    return <div style={{transform: transformContainer, width: desiredWidth, height: desiredHeight}}>
      <div className="Sprite" style = {{
          backgroundImage,
          backgroundPositionY,
          backgroundPositionX,
          width,
          height,
          transform,
        }}>
      </div>
    </div>
  }
}
