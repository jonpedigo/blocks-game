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
    tilingSprite: false, //cant change
    inputDirectionSprites: false,
    light: false,
    // shadowObscured: false,
    // shadowCaster: false,
    // invisibleOnHeroCollide
  }

  window.cameraTags = {
    heroCameraShakeOnHeroCollide_quickrumble: false,
    heroCameraShakeOnHeroCollide_longrumble: false,
    heroCameraShakeOnHeroCollide_quick: false,
    heroCameraShakeOnHeroCollide_short: false,
    heroCameraShakeOnHeroCollide_long: false,
  }

  window.inventoryTags = {
    pickupable: false,
    dontDestroyOnPickup: false,
    pickupOnHeroInteract: false,
    pickupOnHeroCollide: false,
    equippable: false,
    equipOnPickup: false,
    // potential: false,
    stackable: false,
    existsWhenEquipped: false, //cant change
  }

  window.particleTags = {
    emitter: false, //cant change
  }

  window.descriptiveTags = {
    fresh: false,
    spawned: false,
    removed: false,
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
    ...window.descriptiveTags,
    ...window.cameraTags,
    ...window.particleTags,
    ...window.inventoryTags,
  }

  window.plainObjectTags = {
    plain: true,
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
    potential: false, //cant change
  }

  window.keyInputTags = {
    disableUpKeyMovement: false,
  }

  window.tags = JSON.parse(JSON.stringify(window.defaultTags))

  window.allTags = {
    ...window.tags,
    ...window.keyInputTags,
    ...window.heroTags,
    ...window.subObjectTags,
  }
}

function addGameTags(tags) {
  Object.assign(window.tags, tags)
}

export default {
  setDefault,
  addGameTags,
}
