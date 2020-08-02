import tinycolor from 'tinycolor2'
import { Ease, ease } from 'pixi-ease'

function setColor(pixiChild, data) {
  if(pixiChild.animationColor) {
    pixiChild.tint = getHexColor(pixiChild.animationColor)
  } else if(data.color) {
    pixiChild.tint = getHexColor(data.color)
  } else if(pixiChild.texture.id === 'solidcolorsprite') {
    if(GAME.world.defaultObjectColor) {
      pixiChild.tint = getHexColor(GAME.world.defaultObjectColor)
    } else {
      pixiChild.tint = getHexColor(window.defaultObjectColor)
    }
  } else {
    delete pixiChild.tint
  }
}

function getHexColor(color) {
  return parseInt(tinycolor(color).toHex(), 16)
}

function darken(color, amount = 20) {
  return tinycolor(color).darken(amount).toHex()
}

function lighten(color, amount = 20) {
  return tinycolor(color).lighten(amount).toHex()
}

function startPulse(pixiChild, gameObject, type) {
  if(type === 'darken') {
    pixiChild.isAnimatingColor = ease.add(pixiChild, { blend: getHexColor(tinycolor(gameObject.color).darken(20)) }, { repeat: true, duration: 3000, ease: 'linear' })
  }

  if(type === 'scale') {
    pixiChild.isAnimatingScale = ease.add(pixiChild, { scale: pixiChild.scale._x + 2 }, { reverse: true, repeat: true, duration: 3000, ease: 'linear' })
  }

  if(type === 'alpha') {
    pixiChild.isAnimatingAlpha = ease.add(pixiChild, { alpha: 0 }, { reverse: true, repeat: true, duration: 3000, ease: 'linear' })
  }

  if(type === 'shake') {
    pixiChild.isAnimatingPosition = ease.add(pixiChild, { shake: 5 }, { repeat: true, ease: 'linear' })
  }
}

export {
  darken,
  lighten,
  getHexColor,
  setColor,
  startPulse
}
