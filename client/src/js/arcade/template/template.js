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

  onKeyDown(key, hero) {
    if(hero.flags.paused || GAME.gameState.paused) return
  }

  onUpdateHero(hero, keysDown, delta) {
    if(hero.flags.paused || GAME.gameState.paused) return
  }

  onUpdateObject(object, delta) {

  }

  onObjectCollide(agent, collider, result) {

  }

  onUpdate(delta) {

  }

  onRender(ctx) {

  }

  onHeroCollide(hero, collider, result) {

  }

  onHeroInteract(hero, collider, result) {

  }
}
