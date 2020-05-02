import onObjectCollide from './onObjectCollide'
import objects from './objects.js'

function onPageLoaded() {
  objects.setDefault()
  
  GAME.onObjectCollide = function (agent, collider, result, removeObjects, respawnObjects) {
    onObjectCollide(agent, collider, result, removeObjects, respawnObjects)
  }
}

export default {
  onPageLoaded
}
