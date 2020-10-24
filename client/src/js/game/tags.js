function setDefault() {
  window.movementTags = {
    moving: false,
    pacer: false,
    spelunker: false,
    lemmings: false,
    wander: false,
    goomba: false,
    goombaSideways: false,
  }

  window.targetTags = {
    homing: false,
    zombie: false,
    targetAuto: false,
    targetHeroOnAware: false,
    targetVictimOnAware: false,
    targetSwitchOnAware: false,
    targetClearOnUnaware: false,
  }

  window.physicsTags = {
    gravityY: false,
    ignoreWorldGravity: false,
    obstacle: false,
    // projectile: false,
    onlyHeroAllowed: false,
    noHeroAllowed: false,
    movingPlatform: false,
    heroPushable: false,
    skipHeroGravityOnCollide: false,
    rotateable: false,
  }

  window.featureOptimizationTags = {
    //no awareness, oncollide, interact, correction, anything
    notInCollisions: false,

    //skips correction phase ( it will not move for obstacles ) ( replace with stationary )
    skipCorrectionPhase: false,

    //skips awareness areas if false
    noticeable: false,

    // skips objects within tracking if false
    trackObjectsWithin: false,

    // shows interact border and checks for interaction
    interactable: false,

    // allows corrections and physics movement
    moving: false,

    trackObjectsTouching: false,

    seperateParts: false,
  }

  // window.otherTags = {
  //   removeAfterTrigger: false,
  //   showInteractBorder: false,
  // }

  window.combatTags = {
    monsterDestroyer: false,
    monsterVictim: false,
    monster: false,
    respawn: false,
    // knockBackOnHit,
    // explodeOnDestroy,
    // fadeOutOnDestroy,
    // flashWhiteOnHit,
  }

  window.behaviorTags = {
    coin: false,
    behaviorOnHeroCollide: false,
    behaviorOnHeroInteract: false,
    // behaviorOnDestroy: false,
  }

  window.resourceZoneTags = {
    resource: false,
    resourceZone: false,
    resourceDepositOnInteract: false,
    resourceDepositOnCollide: false,
    resourceWithdrawOnInteract: false,
    resourceWithdrawOnCollide: false,
    // resourceOnMap: false,
    // resourceStealable: false,
    // resourceFlammable: false,
  }

  window.spawnZoneTags = {
    spawnZone: false,
    spawnRandomlyWithin: false,
    spawnOnInterval: false,

    // spawnAllOnStart: false,
    // spawnOnHeroCollide: false,
    // spawnAllOnDestroy: false,
    spawnAllInHeroInventoryOnHeroInteract: false,
    // spawnOnHeroInteract: false,
    // spawnDontOverlap: false
    spawnOverObstacles: false,
    spawnOverNonObstacles: false,
    spawnClearAllObjects: false,
    spawnClearSpawnedObjects: false,
    destroyOnSpawnPoolDepleted: false,
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
    outline: false,
    invisible: false,
    tilingSprite: false, //cant change
    inputDirectionSprites: false,
    light: false,
    background: false,
    foreground: false,
    seeThroughOnHeroCollide: false,
    hidden: false,
    // invisibleOnHeroCollide: false

    // randomColor: false,
  }

  window.cameraTags = {
    cameraShakeOnCollide_quickrumble: false,
    cameraShakeOnCollide_longrumble: false,
    cameraShakeOnCollide_quick: false,
    cameraShakeOnCollide_short: false,
    cameraShakeOnCollide_long: false,
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
    onMapWhenEquipped: false, //cant change
    // dropOnOwnerDestroyed: false,
  }

  window.particleTags = {
    emitter: false, //cant change
    liveEmitter: false,
    hasTrail: false,
    explodeOnDestroy: false,
    spinOffOnDestroy: false,
  }

  window.animationTags = {
    shake: false,
    realRotate: false,
    realRotateFast: false,
    pulseAlpha: false,
    pulseDarken: false,
    pulseLighten: false,
    fadeInOnInit: false,
    flipYAtMaxVelocity: false,
    // realHover: false,
  }

  window.descriptiveTags = {
    plain: false,
    hero: false,
    fresh: false,
    spawned: false,
    npc: false,
    alive: false,
    removed: false,
  }

  window.proceduralTags = {
    heroHomePlatform: false,
  }

  window.pathTags = {
    path: false,
    pathfindLoop: false,
    pathfindPatrol: false,
    pathfindDumb: false,
    pathfindWait: false,
  }

  window.defaultTags = {
    ...window.physicsTags,
    ...window.spawnZoneTags,
    ...window.resourceZoneTags,
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
    ...window.animationTags,
    ...window.featureOptimizationTags,
    ...window.proceduralTags,
    ...window.pathTags,
  }

  window.heroTags = {
    hero: true,
    respawn: true,
    gravityY: false,
    saveAsDefaultHero: false,
    monsterDestroyer: false,
    obstacle: false,
    rotateable: false,
    hidden: false,
    hasTrail: false,
    moving: true,
    noticeable: true,
    centerOfAttention: false,
    trackObjectsWithin: false,
    trackObjectsTouching: true,
    // allowCameraRotation: false,
  }

  window.subObjectTags = {
    subObject: true,
    heroInteractTriggerArea: false,
    awarenessTriggerArea: false,
    objectInteractTriggerArea: false,
    relativeToDirection: false,
    relativeToAngle: false,
    potential: false, //cant change
  }

  window.keyInputTags = {
    disableUpKeyMovement: false,
    zButtonOnce: false,
    xButtonOnce: false,
    cButtonOnce: false,
  }

  window.generatedTags = {
    lastAnticipatedObject: false,
  }

  window.tags = JSON.parse(JSON.stringify(window.defaultTags))

  window.allTags = {
    ...window.tags,
    ...window.keyInputTags,
    ...window.heroTags,
    ...window.subObjectTags,
    ...window.descriptiveTags,
    ...window.generatedTags,
    ...window.targetTags,
  }


  window.propertyTags = {
    ...window.combatTags,
    ...window.movementTags,
    ...window.physicsTags,

    glowing: window.graphicalTags.glowing,
    invisible: window.graphicalTags.invisible,

    shake: window.animationTags.shake,
    realRotate: window.animationTags.realRotate,
    realRotateFast: window.animationTags.realRotateFast,
    pulseAlpha: window.animationTags.pulseAlpha,
    pulseDarken: window.animationTags.pulseDarken,
    pulseLighten: window.animationTags.pulseLighten,

    //
    hasTrail: window.particleTags.hasTrail,
    explodeOnDestroy: window.particleTags.explodeOnDestroy,
    spinOffOnDestroy: window.particleTags.spinOffOnDestroy,

    ...window.cameraTags,
  }
}

function addGameTags(tags) {
  Object.assign(window.tags, tags)
  Object.assign(window.allTags, tags)
}

export default {
  setDefault,
  addGameTags,
}
