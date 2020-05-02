// the more events we have hardcoded in the less we have to UNLOAD
window.templateGameString = `
function onGameLoaded() {

}

function onGameStart() {

}

function onKeyDown(keyCode, hero) {
  if(hero.flags.paused || GAME.gameState.paused) return

}

function onUpdate(delta) {

}

function onUpdateHero(hero, keysDown, delta) {
  if(hero.flags.paused || GAME.gameState.paused) return

}

function onUpdateObject(object, delta) {

}

function onHeroCollide(hero, collider, result, removeObjects, respawnObjects) {

}

function onHeroInteract(hero, collider, result, removeObjects, respawnObjects) {

}

function onObjectCollide(agent, collider, result, removeObjects, respawnObjects) {

}


function onRender(ctx) {

}

function onGameUnload() {

}
`
