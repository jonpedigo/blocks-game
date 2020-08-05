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

function darken(color, amount = 30) {
  return tinycolor(color).darken(amount).toString()
}

function lighten(color, amount = 30) {
  return tinycolor(color).lighten(amount).toString()
}

function startPulse(pixiChild, gameObject, type) {
  if(type === 'darken') {
    const color = gameObject.color || GAME.world.defaultObjectColor
    pixiChild.isAnimatingDarkness = ease.add(pixiChild, { blend: getHexColor(darken(color)) }, { repeat: true, duration: 1000, ease: 'linear' })
  }
  if(type === 'lighten') {
    const color = gameObject.color || GAME.world.defaultObjectColor
    pixiChild.isAnimatingLightness = ease.add(pixiChild, { blend: getHexColor(lighten(color)) }, { repeat: true, duration: 1000, ease: 'linear' })
  }

  // if(type === 'scale') {
  //   pixiChild.isAnimatingScale = ease.add(pixiChild, { scale: pixiChild.scale._x + 2 }, { reverse: true, repeat: true, duration: 1000, ease: 'linear' })
  // }

  if(type === 'alpha') {
    pixiChild.isAnimatingAlpha = ease.add(pixiChild, { alpha: 0 }, { reverse: true, repeat: true, duration: 1000, ease: 'linear' })
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
    if(pixiChild.isAnimatingPosition) {
      pixiChild.isAnimatingPosition.eases[0].start.x = (gameObject.x) * camera.multiplier
      pixiChild.isAnimatingPosition.eases[0].start.y = (gameObject.y) * camera.multiplier
    } else {
      pixiChild.x = (gameObject.x) * camera.multiplier
      pixiChild.y = (gameObject.y) * camera.multiplier
    }

    if(gameObject.tags.shake && !pixiChild.isAnimatingPosition) {
      startPulse(pixiChild, gameObject, 'shake')
    }

    // This is the main obstacle if I want to add another position animation
    // id rather not name these two different animations, why not just add to the ease object what tags it comes from?
    if(!gameObject.tags.shake && pixiChild.isAnimatingPosition) {
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
  }

  if(gameObject.tags.pulseAlpha && !pixiChild.isAnimatingAlpha) {
    startPulse(pixiChild, gameObject, 'alpha')
  }

  if(!gameObject.tags.pulseAlpha && pixiChild.isAnimatingAlpha) {
    ease.removeEase(pixiChild, 'alpha')
    delete pixiChild.isAnimatingAlpha
  }
}

function updateColor(pixiChild, gameObject) {
  if(!pixiChild.isAnimatingDarkness && !pixiChild.isAnimatingLightness) {
    setColor(pixiChild, gameObject)
  }

  if(gameObject.tags.pulseDarken && !pixiChild.isAnimatingDarkness) {
    startPulse(pixiChild, gameObject, 'darken')
  }
  if(!gameObject.tags.pulseDarken && pixiChild.isAnimatingDarkness) {
    ease.removeEase(pixiChild, 'blend')
    delete pixiChild.isAnimatingDarkness
  }

  if(gameObject.tags.pulseLighten && !pixiChild.isAnimatingLightness) {
    startPulse(pixiChild, gameObject, 'lighten')
  }
  if(!gameObject.tags.pulseLighten && pixiChild.isAnimatingLightness) {
    ease.removeEase(pixiChild, 'blend')
    delete pixiChild.isAnimatingDarkness
  }
}

function updateScale(pixiChild, gameObject) {
  let camera = MAP.camera
  if(CONSTRUCTEDITOR.open) {
    camera = CONSTRUCTEDITOR.camera
  }

  if(!pixiChild.isAnimatingScale) {
    if(gameObject.tags.tilingSprite) {
      pixiChild.transform.scale.x = camera.multiplier
      pixiChild.transform.scale.y = camera.multiplier
    } else if(pixiChild.texture){
      pixiChild.transform.scale.x = (gameObject.width/pixiChild.texture._frame.width) * camera.multiplier
      pixiChild.transform.scale.y = (gameObject.height/pixiChild.texture._frame.height) * camera.multiplier
    }
  }
}

function updateSprite(pixiChild, gameObject) {
  /////////////////////
  /////////////////////
  // CHANGE SPRITE
  if(gameObject.tags.solidColor) {
    pixiChild.texture = PIXIMAP.textures['solidcolorsprite']
  } else {
    if(gameObject.tags.inputDirectionSprites) {
      if(gameObject.inputDirection === 'right') {
        if(gameObject.rightSprite) {
          gameObject.sprite = gameObject.rightSprite
        } else gameObject.sprite = gameObject.defaultSprite
      }
      if(gameObject.inputDirection === 'left') {
        if(gameObject.leftSprite) {
          gameObject.sprite = gameObject.leftSprite
        } else gameObject.sprite = gameObject.defaultSprite
      }
      if(gameObject.inputDirection === 'up') {
        if(gameObject.upSprite) {
          gameObject.sprite = gameObject.upSprite
        } else gameObject.sprite = gameObject.defaultSprite
      }
      if(gameObject.inputDirection === 'down') {
        if(gameObject.downSprite) {
          gameObject.sprite = gameObject.downSprite
        } else gameObject.sprite = gameObject.defaultSprite
      }
    } else {
      if(gameObject.defaultSprite != gameObject.sprite) {
        gameObject.sprite = gameObject.defaultSprite
      }
    }

    if(!pixiChild.texture || gameObject.sprite != pixiChild.texture.id) {
      pixiChild.texture = PIXIMAP.textures[gameObject.sprite]
    }
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
  updateColor,
  updateScale,
  updateSprite,
}
