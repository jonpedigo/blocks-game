function init() {
  window.defaultWorld = {
    id: 'world-' + Date.now(),
  	lockCamera: null,
  	gameBoundaries: null,
    procedural: null,
    worldSpawnPointX: null,
    worldSpawnPointY: null,
    globalTags: {
      calculatePathCollisions: false,
      noCamping: true,
      targetOnSight: true,
      isAsymmetric: false,
      shouldRestoreHero: false,
    }
  }
  window.world = JSON.parse(JSON.stringify(window.defaultWorld));
}

export default {
  init
}
