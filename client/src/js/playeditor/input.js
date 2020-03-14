const keysDown = {}

function init(hero){
  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true

    // q and a zoom in and out
    if(e.keyCode === 81) {
      window.scaleMultiplier = window.scaleMultiplier * 1.1
    }
    if(e.keyCode === 65) {
      window.scaleMultiplier = window.scaleMultiplier * .9
    }

    //if you press escape, cancel a drag
    if(e.keyCode === 27) {
      window.clickStart.x = null
      window.clickStart.y = null
    }
  }, false)

  window.addEventListener("keyup", function (e) {
     delete keysDown[e.keyCode]
  }, false)
}

function update(delta) {
  if (38 in keysDown) { // Player holding up
    window.camera.y -= (40 * window.scaleMultiplier)
  }
  if (40 in keysDown) { // Player holding down
    window.camera.y += (40 * window.scaleMultiplier)
  }
  if (37 in keysDown) { // Player holding left
    window.camera.x -= (40 * window.scaleMultiplier)
  }
  if (39 in keysDown) { // Player holding right
    window.camera.x += (40 * window.scaleMultiplier)
  }
}

export default {
  init,
  update,
}
