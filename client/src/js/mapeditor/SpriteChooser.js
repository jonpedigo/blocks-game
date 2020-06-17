import * as PIXI from 'pixi.js'
import Swal from 'sweetalert2/src/sweetalert2.js';
import tinycolor from 'tinycolor2';

function open(object, spriteName) {
  Swal.fire({
    title: 'Select sprite',
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    html:"<canvas id='pixi-sprite-chooser'></canvas>",
    input: 'text',
    inputAttributes: {
      id: 'pixi-sprite-chosen',
      autocapitalize: 'off',
      value: object[spriteName],
    },
    width: '840px'
  }).then((result) => {
    if(result.value) {
      const { networkEditObject } = MAPEDITOR
      app.destroy(true)
      networkEditObject(object, { [spriteName]: result.value })
    }
  })

  const appWidth = 800
  const app = new PIXI.Application({
    width: appWidth, height: 1600, view: document.getElementById('pixi-sprite-chooser')
  });

  let y = 0
  let x = 0
  let rowMaxHeight = 0
  Object.keys(PIXIMAP.textures).forEach((textureId, index) => {
    const texture = PIXIMAP.textures[textureId]
    const width = texture._frame.width * 5
    const height = texture._frame.height * 5
    let sprite = new PIXI.Sprite(texture)
    sprite.transform.scale.x = 5
    sprite.transform.scale.y = 5
    sprite.interactive = true

    sprite.x = x

    if(height > rowMaxHeight) {
      rowMaxHeight = height
    }

    if(x + width > appWidth) {
      y += rowMaxHeight
      rowMaxHeight = 0
      sprite.x = 0
      x = 0
    } else {
      x+= width
    }

    sprite.y = y

    sprite.on('pointerover', function() {
      this.tint = parseInt(tinycolor('green').toHex(), 16)
    })
    sprite.on('pointerout', function() {
      this.tint = 0xFFFFFF
    })
    sprite.on('click', function() {
      document.getElementById('pixi-sprite-chosen').value = this.texture.id
    })

    app.stage.addChild(sprite);
  })
}

export default {
  open
}
