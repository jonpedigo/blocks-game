// the more events we have hardcoded in the less we have to UNLOAD
window.templateGameString = `
// once we have loaded up the game from the server for the first time
// interact with values loaded by the game, the values of other services
function onGameLoaded() {

}

function onGameUnloaded() {

}

function onGameStart() {

}

function onKeyDown(keyCode, hero) {
  if(hero.flags.paused || game.gameState.paused) return

}


function input(hero, keysDown, delta) {
  if(hero.flags.paused || game.gameState.paused) return

}

function intelligence(object, delta) {

}

function onCollide(agent, collider, result, removeObjects, respawnObjects) {

}

function onHeroCollide(hero, collider, result, removeObjects, respawnObjects) {

}

function onHeroInteract(hero, collider, result, removeObjects, respawnObjects) {

}

// after input, intel, physics, but before render
function update(delta) {

}

function render(ctx) {
}
`
