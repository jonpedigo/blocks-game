import gridTool from '../grid.js'
import pathfinding from './pathfinding.js'

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
    window.defaultWorld.worldSpawnPointX = w.game.grid.startX + (w.game.grid.width * w.game.grid.nodeSize)/2
    window.defaultWorld.worldSpawnPointY = w.game.grid.startY + (w.game.grid.height * w.game.grid.nodeSize)/2
  })
}


window.handleWorldUpdate = function(updatedWorld) {
  for(let key in updatedWorld) {
    const value = updatedWorld[key]

    if(key === 'lockCamera' && !role.isPlayEditor) {
      if(value && value.limitX) {
        camera.setLimit(value.limitX, value.limitY, value.centerX, value.centerY)
      } else {
        camera.clearLimit();
      }
    }

    if(key === 'gameBoundaries') {
      gridTool.updateGridObstacles()
      if(role.isHost) window.resetPaths = true
      if(role.isHost) window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
    }

    if(key === 'globalTags' || key === 'editorTags') {
      for(let tag in updatedWorld.globalTags) {
        if(tag === 'calculatePathCollisions' && w.game.grid.nodes) {
          gridTool.updateGridObstacles()
          if(role.isHost) window.pfgrid = pathfinding.convertGridToPathfindingGrid(w.game.grid.nodes)
        }
      }
      if(key === 'syncHero' && role.isPlayEditor) {
        window.syncHeroToggle.checked = value
      }
      if(key === 'syncObjects' && role.isPlayEditor) {
        window.syncObjectsToggle.checked = value
      }
      if(key === 'syncGameState' && role.isPlayEditor) {
        window.syncGameStateToggle.checked = value
      }
    }
  }

  if(role.isPlayEditor) {
    window.worldeditor.update(w.game.world)
    window.worldeditor.expandAll()
  }
}

export default {
  setDefault
}
