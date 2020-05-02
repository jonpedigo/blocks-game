import onEffectHero from './onEffectHero'
import onObjectCollide from './onObjectCollide'

window.local.on('onHeroInteract', (hero, interactor, result, removeObjects, respawnObjects) => {
  onEffectHero(hero, interactor, result, removeObjects, respawnObjects, { fromInteractButton: true })

  /// DEFAULT GAME FX
  if(GAME.defaultCustomGame) {
    GAME.defaultCustomGame.onHeroInteract(hero, interactor, result, removeObjects, respawnObjects)
  }

  /// CUSTOM GAME FX
  if(GAME.customGame) {
    GAME.customGame.onHeroInteract(hero, interactor, result, removeObjects, respawnObjects)
  }

  /// LIVE CUSTOM GAME FX
  if(GAME.liveCustomGame) {
    GAME.liveCustomGame.onHeroInteract(hero, interactor, result, removeObjects, respawnObjects)
  }
})

window.local.on('onHeroCollide', (hero, collider, result, removeObjects, respawnObjects) => {
  if(collider.tags['requireActionButton']) return

  onEffectHero(hero, collider, result, removeObjects, respawnObjects, { fromInteractButton: false })

  /// DEFAULT GAME FX
  if(GAME.defaultCustomGame) {
    GAME.defaultCustomGame.onHeroCollide(hero, collider, result, removeObjects, respawnObjects)
  }

  /// CUSTOM GAME FX
  if(GAME.customGame) {
    GAME.customGame.onHeroCollide(hero, collider, result, removeObjects, respawnObjects)
  }

  /// LIVE CUSTOM GAME FX
  if(GAME.liveCustomGame) {
    GAME.liveCustomGame.onHeroCollide(hero, collider, result, removeObjects, respawnObjects)
  }
})

window.local.on('onObjectCollide', (agent, collider, result, removeObjects, respawnObjects) => {
  onObjectCollide(agent, collider, result, removeObjects, respawnObjects)

  /// DEFAULT GAME FX
  if(GAME.defaultCustomGame) {
    GAME.defaultCustomGame.onObjectCollide(agent, collider, result, removeObjects, respawnObjects)
  }

  /// CUSTOM GAME FX
  if(GAME.customGame) {
    GAME.customGame.onObjectCollide(agent, collider, result, removeObjects, respawnObjects)
  }

  /// LIVE CUSTOM GAME FX
  if(GAME.liveCustomGame) {
    GAME.liveCustomGame.onObjectCollide(agent, collider, result, removeObjects, respawnObjects)
  }
})
