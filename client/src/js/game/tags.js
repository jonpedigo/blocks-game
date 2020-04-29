function setDefault() {
  window.defaultTags = {
    // COLLISIONS
    obstacle: true,
    stationary: false,
    monster: false,
    victim: false,
    coin: false,
    heroUpdate: false,
    // objectUpdate: false,
    // worldUpdate: false,
    // gameStateUpdate: false,
    deleteAfter: false,
    revertAfterTimeout: false,

    // BUTTONS
    requireActionButton: false,

    // PHYSICS
    gravity: false,
    movingPlatform: false,
    // child: false,
    onlyHeroAllowed: false,
    noHeroAllowed: false,
    heroPushable: false,

    // // UI
    // chatter: false,

    // GRAPHICAL
    glowing: false,
    filled: false,
    invisible: false,

    // MOVEMENT
    pacer: false,
    spelunker: false,
    lemmings: false,
    wander: false,
    goomba: false,
    goombaSideways: false,
    homing: false,
    zombie: false,

    // ZONE
    spawnZone: false,

    // TEMPORARY STATE ( are temporary things...flags? )
    fresh: false,

  }

  window.tags = JSON.parse(JSON.stringify(window.defaultTags))

}

export default {
  setDefault
}
