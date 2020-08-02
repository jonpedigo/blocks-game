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

function updatePosition(pixiChild, gameObject) {
  let camera = MAP.camera
  if(CONSTRUCTEDITOR.open) {
    camera = CONSTRUCTEDITOR.camera
  }

  const isContainer = pixiChild.children && pixiChild.children.length

  if(gameObject.tags.rotateable) {
    if(isContainer) {
      pixiChild.pivot.set(gameObject.width/2, gameObject.height/2)
    } else {
      pixiChild.anchor.set(0.5, 0.5)
    }
    pixiChild.rotation = gameObject.angle || 0
    pixiChild.x = (gameObject.x + gameObject.width/2) * camera.multiplier
    pixiChild.y = (gameObject.y + gameObject.height/2) * camera.multiplier
  } else {
    pixiChild.x = (gameObject.x) * camera.multiplier
    pixiChild.y = (gameObject.y) * camera.multiplier

    if(pixiChild.isAnimatingPosition) {
      pixiChild.isAnimatingPosition.eases[0].start.x = (gameObject.x) * camera.multiplier
      pixiChild.isAnimatingPosition.eases[0].start.y = (gameObject.y) * camera.multiplier
    }
    if(gameObject.tags.shake) {
      startPulse(pixiChild, gameObject, 'shake')
    } else if(pixiChild.isAnimatingPosition) {
      ease.removeEase(pixiChild, 'shake')
      delete pixiChild.isAnimatingPosition
    }
  }
}

function updateAlpha(pixiChild, gameObject) {
  if(!pixiChild.isAnimatingAlpha) {
    if(typeof gameObject.opacity === 'number') {
      pixiChild.alpha = gameObject.opacity
    } else {
      pixiChild.alpha = 1
    }

    if(gameObject.tags.hidden) {
      if(gameObject.id === HERO.originalId) {
        pixiChild.alpha = .3
      } else {
        pixiChild.alpha = 0
      }
    }
    // 
    // if(gameObject.tags.hero) {
    //   startPulse(pixiChild, gameObject, 'alpha')
    // }
  }
}

function getVisibility(pixiChild, gameObject) {
  return gameObject.tags.outline || gameObject.tags.invisible || gameObject.removed || gameObject.tags.potential || gameObject.constructParts
}

export {
  darken,
  lighten,
  getHexColor,
  getVisibility,
  setColor,
  startPulse,
  updatePosition,
  updateAlpha,
}
