import tinycolor from 'tinycolor2'

function setColor(pixiChild, data) {
  if(data.color) {
    pixiChild.tint = getHexColor(data.color)
  } else if(GAME.world.defaultObjectColor) {
    pixiChild.tint = getHexColor(GAME.world.defaultObjectColor)
  } else {
    pixiChild.tint = getHexColor(window.defaultObjectColor)
  }
}

function getHexColor(color) {
  return parseInt(tinycolor(color).toHex(), 16)
}

export {
  getHexColor,
  setColor
}
