function init() {
  window.tags = {
    // COLLISIONS
    obstacle: true,
    stationary: false,
    monster: false,
    coin: false,
    heroUpdate: false,
    objectUpdate: false,
    gameUpdate: false,
    deleteAfter: false,
    revertAfterTimeout: false,

    // PHYSICS
    gravity: false,
    movingPlatform: false,
    child: false,
    onlyHeroAllowed: false,
    noHeroAllowed: false,

    // UI
    chatter: false,

    // GRAPHICAL
    glowing: false,
    flashing: false,
    filled: false,
    jittery: false,
    invisible: false,

    // MOVEMENT
    pacer: false,
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
}

export default {
  init
}
