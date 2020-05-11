import collisions from '../../utils/collisions'
import gridUtil from '../../utils/grid.js'
import pathfinding from '../../utils/pathfinding.js'
import particles from '../../map/particles.js'

export default class CustomGame{
  onGameLoaded() {

  }

  onGameStart() {

  }

  onKeyDown(keyCode, hero) {
    if(hero.flags.paused || GAME.gameState.paused) return
  }

  onUpdate(delta) {

  }

  onUpdateHero(hero, keysDown, delta) {


  }

  onUpdateObject(object, delta) {

  }

  onHeroCollide(hero, collider, result, removeObjects, respawnObjects) {
    if(collider.id === 'object-1271882112670-0') {
        setTimeout(() => {
            GAME.objectsById['object-990554355304-0'].spawnPool = 3
        }, 30000)
    }
  }

  onHeroInteract(hero, collider, result, removeObjects, respawnObjects) {

  }

  onObjectCollide(agent, collider, result, removeObjects, respawnObjects) {

  }


  onRender(ctx) {

  }

  onGameUnload() {

  }
}
