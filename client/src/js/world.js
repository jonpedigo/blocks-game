function init() {
  window.defaultWorld = {
    id: 'world-' + Date.now(),
  	lockCamera: {},
  	gameBoundaries: {},
    procedural: {},
    worldSpawnPointX: null,
    worldSpawnPointY: null,
    globalTags: {
      calculatePathCollisions: false,
      noCamping: true,
      targetOnSight: true,
      paused: false,
      isAsymmetric: false,
      shouldRestoreHero: false,
    }
  }
  window.world = JSON.parse(JSON.stringify(window.defaultWorld));
}

export default {
  init
}
