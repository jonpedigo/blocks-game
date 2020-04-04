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

  let tagSelectEl = document.getElementById("tag-select")
  for(var tag in window.tags) {
    let tagEl = document.createElement('input')
    tagEl.type ='checkbox'
    tagEl.checked = window.tags[tag]
    tagEl.id = 'tag-'+tag
    tags[tag] = tagEl
    let tagContainerEl = document.createElement('div')
    tagContainerEl.innerHTML = tag
    tagContainerEl.appendChild(tagEl)

    tagSelectEl.appendChild(tagContainerEl)
  }
}

export default {
  init
}
