import tinycolor from 'tinycolor2'

function setColor(pixiChild, data) {
  if(data.color) {
    pixiChild.tint = parseInt(tinycolor(data.color).toHex(), 16)
  } else if(GAME.world.defaultObjectColor) {
    pixiChild.tint = parseInt(tinycolor(GAME.world.defaultObjectColor).toHex(), 16)
  } else {
    pixiChild.tint = parseInt(tinycolor(window.defaultObjectColor).toHex(), 16)
  }
}

export {
  setColor
}
