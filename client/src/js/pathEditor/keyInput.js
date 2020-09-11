import keycode from 'keycode'
import gridUtil from '../utils/grid'

const keysDown = {}
function init (){
  window.addEventListener("keydown", function (e) {
    const key = keycode(e.keyCode)
    keysDown[key] = true

    if(!PATHEDITOR.open) return

    if(key === 'esc') {
      PATHEDITOR.cancel()
    }

    if(key === 'enter') {
      PATHEDITOR.finish()
    }
  })

  window.addEventListener("keyup", function (e) {
    const key = keycode(e.keyCode)
    keysDown[key] = false
  })
}

function update(delta) {
  const { cameraController, grid } = PATHEDITOR

  if(keysDown.up) {
    cameraController.y -= 600 * delta
  }
  if(keysDown.down) {
    cameraController.y += 600 * delta
  }
  if(keysDown.left) {
    cameraController.x -= 600 * delta
  }
  if(keysDown.right) {
    cameraController.x += 600 * delta
  }

  if(cameraController.x > grid.x + grid.width) cameraController.x = grid.x + grid.width
  if(cameraController.y > grid.y + grid.height) cameraController.y = grid.y + grid.height
  if(cameraController.y < grid.y) cameraController.y = grid.y
  if(cameraController.x < grid.x) cameraController.x = grid.x

  gridUtil.keepXYWithinBoundaries(cameraController)
}

export default {
  init,
  update
}
