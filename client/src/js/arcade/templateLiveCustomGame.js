// the more events we have hardcoded in the less we have to UNLOAD
window.templateGameString = `class CustomGame{
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
    if(hero.flags.paused || GAME.gameState.paused) return

  }

  onUpdateObject(object, delta) {

  }

  onHeroCollide(hero, collider, result, removeObjects, respawnObjects) {

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
`
