import onEffectHero from './onEffectHero'
import onObjectCollide from './onObjectCollide'

window.local.on('onHeroInteract', (hero, interactor, result, removeObjects, respawnObjects) => {
  onEffectHero(hero, interactor, result, removeObjects, respawnObjects, { fromInteractButton: true })

  /// DEFAULT GAME FX
  if(window.defaultCustomGame) {
    window.defaultCustomGame.onHeroInteract(hero, interactor, result, removeObjects, respawnObjects)
  }

  /// CUSTOM GAME FX
  if(window.customGame) {
    window.customGame.onHeroInteract(hero, interactor, result, removeObjects, respawnObjects)
  }

  /// LIVE CUSTOM GAME FX
  if(window.liveCustomGame) {
    window.liveCustomGame.onHeroInteract(hero, interactor, result, removeObjects, respawnObjects)
  }
})

window.local.on('onHeroCollide', (hero, collider, result, removeObjects, respawnObjects) => {
  if(collider.tags['requireActionButton']) return

  onEffectHero(hero, collider, result, removeObjects, respawnObjects, { fromInteractButton: false })

  /// DEFAULT GAME FX
  if(window.defaultCustomGame) {
    window.defaultCustomGame.onHeroCollide(hero, collider, result, removeObjects, respawnObjects)
  }

  /// CUSTOM GAME FX
  if(window.customGame) {
    window.customGame.onHeroCollide(hero, collider, result, removeObjects, respawnObjects)
  }

  /// LIVE CUSTOM GAME FX
  if(window.liveCustomGame) {
    window.liveCustomGame.onHeroCollide(hero, collider, result, removeObjects, respawnObjects)
  }
})

window.local.on('onObjectCollide', (agent, collider, result, removeObjects, respawnObjects) => {
  onObjectCollide(agent, collider, result, removeObjects, respawnObjects)

  /// DEFAULT GAME FX
  if(window.defaultCustomGame) {
    window.defaultCustomGame.onCollide(agent, collider, result, removeObjects, respawnObjects)
  }

  /// CUSTOM GAME FX
  if(window.customGame) {
    window.customGame.onCollide(agent, collider, result, removeObjects, respawnObjects)
  }

  /// LIVE CUSTOM GAME FX
  if(window.liveCustomGame) {
    window.liveCustomGame.onCollide(agent, collider, result, removeObjects, respawnObjects)
  }
})
