function setDefault() {
  window.movementTags = {
    pacer: false,
    spelunker: false,
    lemmings: false,
    wander: false,
    goomba: false,
    goombaSideways: false,
    homing: false,
    zombie: false,
  }

  window.otherTags = {
    removeAfterTrigger: false,
    showInteractBorder: false,
  }

  window.combatTags = {
    monsterDestroyer: false,
    monsterVictim: false,
    monster: false,
    respawn: false,
  }

  window.behaviorTags = {
    coin: false,
    behaviorOnHeroCollide: false,
    behaviorOnHeroInteract: false,
    // behaviorOnDestroy: false,
  }

  window.spawnZoneTags = {
    spawnZone: false,
    // spawnOnStart: false,
    // spawnOnHeroCollide: false,
    // spawnOnHeroInteract: false,
    // spawnOnDestroy: false,
  }

  window.dialogueTags = {
    talker: false,
    talkOnStart: false,
    talkOnHeroCollide: false,
    talkOnHeroInteract: false,
    // talkOnDestroy: false,
    oneTimeTalker: false,
  }

  window.heroUpdateTags = {
    heroUpdate: false,
    oneTimeHeroUpdate: false,
    revertHeroUpdateAfterTimeout: false,
    incrementRevertHeroUpdateTimeout: false,
    updateHeroOnHeroCollide: false,
    updateHeroOnHeroInteract: false,
    // updateHeroOnDestroy: false,
  }

  window.physicsTags = {
    gravity: false,
    obstacle: false,
    stationary: false,
    onlyHeroAllowed: false,
    noHeroAllowed: false,
    movingPlatform: false,
    heroPushable: false,
    skipHeroGravityOnCollide: false,
    rotateable: false,
  }

  window.questTags = {
    questGiver: false,
    giveQuestOnStart: false,
    giveQuestOnHeroCollide: false,
    giveQuestOnHeroInteract: false,
    // giveQuestOnDestroy: false,
    questCompleter: false,
    completeQuestOnHeroCollide: false,
    completeQuestOnHeroInteract: false,
    // completeQuestOnDestroy: false,
  }

  window.graphicalTags = {
    glowing: false,
    filled: false,
    invisible: false,
    tilingSprite: false,
  }

  window.defaultTags = {
    ...window.physicsTags,
    ...window.spawnZoneTags,
    ...window.behaviorTags,
    ...window.combatBehaviorTags,
    ...window.triggerTags,
    ...window.heroUpdateTags,
    ...window.dialogueTags,
    ...window.questTags,
    ...window.movementTags,
    ...window.graphicalTags,
    fresh: false,
  }

  window.heroTags = {
    hero: true,
    filled: true,
    gravityY: false,
    default: false,
    monsterDestroyer: false,
    obstacle: false,
    rotateable: false,
  }

  window.subObjectTags = {
    subObject: true,
    heroInteractTriggerArea: false,
    objectInteractTriggerArea: false,
    relativeToDirection: false,
    relativeToAngle: false,
    potential: false,
  }

  window.keyInputTags = {
    disableUpKeyMovement: false,
  }

  window.tags = JSON.parse(JSON.stringify(window.defaultTags))
}

function addGameTags(tags) {
  Object.assign(window.tags, tags)
}

export default {
  setDefault,
  addGameTags,
}
