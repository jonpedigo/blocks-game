// the more events we have hardcoded in the less we have to UNLOAD
window.templateGameString = `class CustomGame{
  onGameLoaded() {

  }

  onStartGame() {

  }

  onKeyDown(key, hero) {
    if(hero.flags.paused || GAME.gameState.paused) return

  }

  onUpdate(delta) {

  }

  onUpdateHero(hero, keysDown, delta) {
    if(hero.flags.paused || GAME.gameState.paused) return

  }

  onUpdateObject(object, delta) {

  }

  onHeroCollide(hero, collider, result) {

  }

  onHeroInteract(hero, collider, result) {

  }

  onObjectCollide(agent, collider, result) {

  }


  onRender(ctx) {

  }

  onGameUnload() {

  }
}
`
