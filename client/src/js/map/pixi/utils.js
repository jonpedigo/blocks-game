import tinycolor from 'tinycolor2'
import collisionsUtil from '../../utils/collisions'
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

function startAnimation(type, pixiChild, gameObject) {
  if(type === 'fadeIn') {
    pixiChild.alpha = 0
    pixiChild.isAnimatingAlpha = true
    pixiChild.fadeIn = ease.add(pixiChild, { alpha: 1 }, { duration: 1000, ease: 'linear' })
    pixiChild.fadeIn.on('complete', () => {
      delete pixiChild.fadeIn
      pixiChild.isAnimatingAlpha = false
    })
  }
}

function startPulse(pixiChild, gameObject, type) {
  if(type === 'darken') {
    const color = gameObject.color || GAME.world.defaultObjectColor
    pixiChild.pulseDarknessEase = ease.add(pixiChild, { blend: getHexColor(darken(color)) }, { repeat: true, duration: 1000, ease: 'linear' })
  }
  if(type === 'lighten') {
    const color = gameObject.color || GAME.world.defaultObjectColor
    pixiChild.pulseLightnessEase = ease.add(pixiChild, { blend: getHexColor(lighten(color)) }, { repeat: true, duration: 1000, ease: 'linear' })
  }

  // if(type === 'scale') {
  //   pixiChild.isAnimatingScale = ease.add(pixiChild, { scale: pixiChild.scale._x + 2 }, { reverse: true, repeat: true, duration: 1000, ease: 'linear' })
  // }

  if(type === 'alpha') {
    pixiChild.pulseAlphaEase = ease.add(pixiChild, { alpha: 0 }, { reverse: true, repeat: true, duration: 1000, ease: 'linear' })
  }

  if(type === 'shake') {
    pixiChild.shakeEase = ease.add(pixiChild, { shake: 5 }, { repeat: true, ease: 'linear' })
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
    if(pixiChild.shakeEase) {
      pixiChild.shakeEase.eases[0].start.x = (gameObject.x) * camera.multiplier
      pixiChild.shakeEase.eases[0].start.y = (gameObject.y) * camera.multiplier
    }

    if(!pixiChild.isAnimatingPosition){
      pixiChild.x = (gameObject.x) * camera.multiplier
      pixiChild.y = (gameObject.y) * camera.multiplier
    }

    if(gameObject.tags.shake && !pixiChild.shakeEase) {
      startPulse(pixiChild, gameObject, 'shake')
      pixiChild.isAnimatingPosition = true
    }

    if(!gameObject.tags.shake && pixiChild.shakeEase) {
      ease.removeEase(pixiChild, 'shake')
      pixiChild.isAnimatingPosition = false
      delete pixiChild.shakeEase
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
    } else if(gameObject.tags.foreground && gameObject.tags.seeThroughOnHeroCollide)  {
      if(isColliding(GAME.heros[HERO.id], gameObject)) {
        pixiChild.alpha = .3
      } else {
        pixiChild.alpha = 1
      }
    }
  }

  if(gameObject.tags.pulseAlpha && !pixiChild.pulseAlphaEase) {
    startPulse(pixiChild, gameObject, 'alpha')
    pixiChild.isAnimatingAlpha = true
  }

  if(!gameObject.tags.pulseAlpha && pixiChild.pulseAlphaEase) {
    ease.removeEase(pixiChild, 'alpha')
    pixiChild.isAnimatingAlpha = false
    delete pixiChild.pulseAlphaEase
  }
}

function updateColor(pixiChild, gameObject) {
  if(!pixiChild.isAnimatingColor) {
    setColor(pixiChild, gameObject)
  }

  if(gameObject.tags.pulseDarken && !pixiChild.pulseDarknessEase) {
    startPulse(pixiChild, gameObject, 'darken')
    pixiChild.isAnimatingColor = true
  }
  if(!gameObject.tags.pulseDarken && pixiChild.pulseDarknessEase) {
    ease.removeEase(pixiChild, 'blend')
    pixiChild.isAnimatingColor = false
    delete pixiChild.pulseDarknessEase
  }

  if(gameObject.tags.pulseLighten && !pixiChild.pulseLightnessEase) {
    startPulse(pixiChild, gameObject, 'lighten')
    pixiChild.isAnimatingColor = true
  }
  if(!gameObject.tags.pulseLighten && pixiChild.pulseLightnessEase) {
    ease.removeEase(pixiChild, 'blend')
    pixiChild.isAnimatingColor = false
    delete pixiChild.pulseDarknessEase
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

function isColliding(hero, gameObject) {
  return collisionsUtil.checkObject(hero, gameObject)
}

function getGameObjectStage(gameObject) {
  let object = gameObject
  if(gameObject.part) object = OBJECTS.getObjectOrHeroById(gameObject.ownerId)

  let stage = PIXIMAP.objectStage
  if(object.tags.foreground) stage = PIXIMAP.foregroundStage

  return stage
}

export {
  darken,
  lighten,
  getHexColor,
  getVisibility,
  setColor,
  startPulse,
  startAnimation,
  updatePosition,
  updateAlpha,
  updateColor,
  updateScale,
  updateSprite,
  getGameObjectStage,
  isColliding,
}
