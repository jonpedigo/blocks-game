import onEffectHero from './onEffectHero'
import hero from './hero.js'
import ghost from './ghost.js'

function onPageLoad() {
  GAME.onHeroInteract = function(hero, interactor, result, removeObjects, respawnObjects) {
    onEffectHero(hero, interactor, result, removeObjects, respawnObjects, { fromInteractButton: true })
  }

  GAME.onHeroCollide = function (hero, collider, result, removeObjects, respawnObjects) {
    if(collider.tags['requireActionButton']) return
    onEffectHero(hero, collider, result, removeObjects, respawnObjects, { fromInteractButton: false })
  }
}

export default {
  onPageLoad
}
