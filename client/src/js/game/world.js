import gridUtil from '../utils/grid.js'
import pathfinding from '../utils/pathfinding.js'

function setDefault() {
  window.defaultWorld = {
    id: 'world-' + window.uniqueID(),
  	lockCamera: null,
  	gameBoundaries: null,
    proceduralBoundaries: null,
    worldSpawnPointX: null,
    worldSpawnPointY: null,
    tags: {
      preventHeroGridBypass: false,
      calculatePathCollisions: false,
      noCamping: false,
      // targetOnSight: false,
      // isAsymmetric: false,
      shouldRestoreHero: false,
      storeEntireGameState: false,
      overrideCustomGameCode: false,
      // shadows: false,
    },
    gravityVelocityY: 1000,
    gravityVelocityX: 1000,
    sequences: {},
    ambientLight: 1,
  }

  window.local.on('onGridLoaded', () => {
    window.defaultWorld.worldSpawnPointX = GAME.grid.startX + (GAME.grid.width * GAME.grid.nodeSize)/2
    window.defaultWorld.worldSpawnPointY = GAME.grid.startY + (GAME.grid.height * GAME.grid.nodeSize)/2
  })
}

export default {
  setDefault
}
