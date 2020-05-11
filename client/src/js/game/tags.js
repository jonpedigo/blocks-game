function setDefault() {
  window.movementTags = {
    // MOVEMENT
    pacer: false,
    spelunker: false,
    lemmings: false,
    wander: false,
    goomba: false,
    goombaSideways: false,
    homing: false,
    zombie: false,
  }

  window.triggerBehaviorTags = {
    monster: false,
    monsterDestroyer: false,
    monsterVictim: false,
    coin: false,
    deleteAfter: false,
    requireActionButton: false,
  }

  window.behaviorTags = {
    spawnZone: false,
  }

  window.heroUpdateTags = {
    heroUpdate: false,
    oneTimeUpdate: false,
    revertAfterTimeout: false,
  }

  window.physicsTags = {
    gravity: false,
    obstacle: false,
    stationary: false,
    onlyHeroAllowed: false,
    noHeroAllowed: false,
    movingPlatform: false,
    heroPushable: false,
  }

  window.graphicalTags = {
    glowing: false,
    filled: false,
    invisible: false,
  }

  window.defaultTags = {
    ...window.physicsTags,
    ...window.collisionBehaviorTags,
    ...window.behaviorTags,
    ...window.heroUpdateTags,
    ...window.movementTags,
    ...window.graphicalTags,
    fresh: false,
  }

  window.tags = JSON.parse(JSON.stringify(window.defaultTags))

}

export default {
  setDefault
}
