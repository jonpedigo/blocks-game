import collisions from '../../utils/collisions'
import gridUtil from '../../utils/grid.js'
import pathfinding from '../../utils/pathfinding.js'
import particles from '../../map/particles.js'

export default class CustomGame{
  onGameLoaded() {

  }

  onGameUnload() {

  }

  onGameStart() {

  }

  onKeyDown(keyCode, hero) {
    if(hero.flags.paused || GAME.gameState.paused) return
  }

  onUpdateHero(hero, keysDown, delta) {
    if(hero.flags.paused || GAME.gameState.paused) return
  }

  onUpdateObject(object, delta) {

  }

  onObjectCollide(agent, collider, result, removeObjects, respawnObjects, hero) {

  }

  onUpdate(delta) {

  }

  onRender(ctx) {

  }

  onHeroCollide(hero, collider, result, removeObjects, respawnObjects) {

  }

  onHeroInteract(hero, collider, result, removeObjects, respawnObjects) {

  }
}
