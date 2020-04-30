import gridTool from '../utils/grid.js'
import pathfinding from '../utils/pathfinding.js'

function setDefault() {
  window.defaultWorld = {
    id: 'world-' + window.uniqueID(),
  	lockCamera: null,
  	gameBoundaries: null,
    proceduralBoundaries: null,
    worldSpawnPointX: null,
    worldSpawnPointY: null,
    globalTags: {
      calculatePathCollisions: false,
      noCamping: false,
      targetOnSight: false,
      isAsymmetric: false,
      shouldRestoreHero: false,
    },
    storeEntireGameState: false,
  }

  window.local.on('onGridLoaded', () => {
    window.defaultWorld.worldSpawnPointX = GAME.grid.startX + (GAME.grid.width * GAME.grid.nodeSize)/2
    window.defaultWorld.worldSpawnPointY = GAME.grid.startY + (GAME.grid.height * GAME.grid.nodeSize)/2
  })
}


window.handleWorldUpdate = function(updatedWorld) {
  for(let key in updatedWorld) {
    const value = updatedWorld[key]

    if(key === 'lockCamera' && !PAGE.role.isPlayEditor) {
      if(value && value.limitX) {
        MAP.camera.setLimit(value.limitX, value.limitY, value.centerX, value.centerY)
      } else {
        MAP.camera.clearLimit();
      }
    }

    if(key === 'gameBoundaries') {
      gridTool.updateGridObstacles()
      if(PAGE.role.isHost) window.resetPaths = true
      if(PAGE.role.isHost) window.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
    }

    if(key === 'globalTags' || key === 'editorTags') {
      for(let tag in updatedWorld.globalTags) {
        if(tag === 'calculatePathCollisions' && GAME.grid.nodes) {
          gridTool.updateGridObstacles()
          if(PAGE.role.isHost) window.pfgrid = pathfinding.convertGridToPathfindingGrid(GAME.grid.nodes)
        }
      }
      if(key === 'syncHero' && PAGE.role.isPlayEditor) {
        window.syncHeroToggle.checked = value
      }
      if(key === 'syncObjects' && PAGE.role.isPlayEditor) {
        window.syncObjectsToggle.checked = value
      }
      if(key === 'syncGameState' && PAGE.role.isPlayEditor) {
        window.syncGameStateToggle.checked = value
      }
    }
  }

  if(PAGE.role.isPlayEditor) {
    window.worldeditor.update(GAME.world)
    window.worldeditor.expandAll()
  }
}

export default {
  setDefault
}
