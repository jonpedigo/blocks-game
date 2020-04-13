import gridTool from './grid.js'
import camera from './camera.js'
import pathfinding from './pathfinding.js'

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
      noCamping: false,
      targetOnSight: false,
      isAsymmetric: false,
      shouldRestoreHero: false,
    },
    storeEntireGameState: false,
  }

  window.client.on('onGridLoaded', () => {
    window.defaultWorld.worldSpawnPointX = window.grid.startX + (window.grid.width * window.grid.nodeSize)/2
    window.defaultWorld.worldSpawnPointY = window.grid.startY + (window.grid.height * window.grid.nodeSize)/2
  })
}


window.handleWorldUpdate = function(updatedWorld) {
  for(let key in updatedWorld) {
    const value = updatedWorld[key]

    if(key === 'lockCamera' && !window.usePlayEditor) {
      if(value && value.limitX) {
        camera.setLimit(value.limitX, value.limitY, value.centerX, value.centerY)
      } else {
        camera.clearLimit();
      }
    }

    if(key === 'gameBoundaries') {
      gridTool.updateGridObstacles()
      if(window.host) window.resetPaths = true
      if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
    }

    if(key === 'globalTags' || key === 'editorTags') {
      for(let tag in updatedWorld.globalTags) {
        if(tag === 'calculatePathCollisions' && window.grid.nodes) {
          gridTool.updateGridObstacles()
          if(window.host) window.pfgrid = pathfinding.convertGridToPathfindingGrid(window.grid.nodes)
        }
      }
      if(key === 'syncHero' && window.usePlayEditor) {
        window.syncHeroToggle.checked = value
      }
      if(key === 'syncObjects' && window.usePlayEditor) {
        window.syncObjectsToggle.checked = value
      }
      if(key === 'syncGameState' && window.usePlayEditor) {
        window.syncGameStateToggle.checked = value
      }
    }
  }

  if(window.usePlayEditor) {
    window.worldeditor.update(window.world)
    window.worldeditor.expandAll()
  }
}

export default {
  init
}
