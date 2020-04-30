import gridTool from '../grid.js'
import collisions from '../collisions'
import contextMenu from './contextMenu.jsx'
import drawTools from './drawTools';
import selectionTools from './selectionTools';
import keyInput from './keyInput';

window.mapEditor = {
  clickStart: {
    x: null,
    y: null,
  },
  mousePos: {
    x: null,
    y: null,
  },
  dragStart: {
    x: null,
    y: null,
  },
  copiedObject: null,
  objectHighlighted: null,
  resizingObject: null,
  draggingObject: null,
  pathfindingLimit: null,
  isSettingPathfindingLimit: false
}
window.defaultMapEditor = JSON.parse(JSON.stringify(mapEditor))

function onPageLoad(gameCanvas) {
  mapEditor.canvas = gameCanvas

  gameCanvas.addEventListener("mousedown", (e) => {
    if(mapEditor.game) handleMouseDown(event)
  })
  gameCanvas.addEventListener("mousemove", (e) => {
    if(mapEditor.game) handleMouseMove(event)
  })
  gameCanvas.addEventListener("mouseup", (e) => {
    if(mapEditor.game) handleMouseUp(event)
  })
  gameCanvas.addEventListener("mouseout", (e) => {
    if(mapEditor.game) handleMouseOut(event)
  })

  contextMenu.init(mapEditor, {
    onStartResize,
    onStartDrag,
    onDelete,
    onCopy,
    onStartSetPathfindingLimit,
  })
  keyInput.init()
}

function onGameLoad(ctx, game, camera) {
  mapEditor.game = game
  mapEditor.camera = camera
  mapEditor.ctx = ctx
}

function handleMouseUp(event) {
  const { camera } = mapEditor
  let clickEndX = ((event.offsetX + camera.x) / camera.multiplier)
  let clickEndY = ((event.offsetY + camera.y) / camera.multiplier)
}

function handleMouseDown(event) {
  const { camera } = mapEditor

  mapEditor.clickStart.x = ((event.offsetX + camera.x) / camera.multiplier)
  mapEditor.clickStart.y = ((event.offsetY + camera.y) / camera.multiplier)

  if(mapEditor.copiedObject) {
    window.addObjects([mapEditor.copiedObject])
    mapEditor.copiedObject = null
  } else if(mapEditor.isSettingPathfindingLimit) {
    if(mapEditor.pathfindingLimit) {
      const { pathfindingLimit, objectHighlighted } = mapEditor
      gridTool.snapDragToGrid(pathfindingLimit, {dragging: true})
      window.socket.emit('editObjects', [{id: objectHighlighted.id, pathfindingLimit, path: null}])
      document.body.style.cursor = "default";
      mapEditor.isSettingPathfindingLimit = false
      mapEditor.pathfindingLimit = null
    } else {
      mapEditor.pathfindingLimit = { ...mapEditor.clickStart }
      mapEditor.pathfindingLimit.width = 0
      mapEditor.pathfindingLimit.height = 0
    }
  } else if(mapEditor.resizingObject) {
    const { resizingObject } = mapEditor
    window.socket.emit('editObjects', [{id: resizingObject.id, x: resizingObject.x, y: resizingObject.y, width: resizingObject.width, height: resizingObject.height}])
    mapEditor.resizingObject = null
  } else if(mapEditor.draggingObject) {
    const { draggingObject } = mapEditor
    window.socket.emit('editObjects', [{id: draggingObject.id, x: draggingObject.x, y: draggingObject.y}])
    mapEditor.draggingObject = null
  }
}


function handleMouseOut(event) {
  if(role.isGhost) {
    mapEditor.skipRemoteStateUpdate = false
  }
}
function handleMouseMove(event) {
  const { camera } = mapEditor

  if(role.isGhost) {
    mapEditor.skipRemoteStateUpdate = true
  }

  mapEditor.mousePos.x = ((event.offsetX + camera.x) / camera.multiplier)
  mapEditor.mousePos.y = ((event.offsetY + camera.y) / camera.multiplier)

  if(mapEditor.copiedObject) {
    updateDraggingObject(mapEditor.copiedObject)
  } else if(mapEditor.isSettingPathfindingLimit) {
    if(mapEditor.pathfindingLimit) {
      updateResizingObject(mapEditor.pathfindingLimit, { allowTiny: false })
    }
  } else if(mapEditor.resizingObject) {
    updateResizingObject(mapEditor.resizingObject)
  } else if(mapEditor.draggingObject) {
    updateDraggingObject(mapEditor.draggingObject)
  } else {
    updateGridHighlight({x: mapEditor.mousePos.x, y: mapEditor.mousePos.y})
  }
}

function updateGridHighlight(location) {
  const { game } = mapEditor

  if(mapEditor.contextMenuVisible) return

  const { x,y } = gridTool.snapXYToGrid(location.x, location.y, { closest: false })

  let mouseLocation = {
    x,
    y,
    width: GAME.grid.nodeSize,
    height: GAME.grid.nodeSize
  }

  mapEditor.objectHighlighted = mouseLocation

  // find the smallest one stacked up
  let smallestObject = selectionTools.findSmallestObjectInArea(mouseLocation, game.objects)
  if(smallestObject) mapEditor.objectHighlighted = smallestObject

  mapEditor.objectHighlightedChildren = []
  if(mapEditor.objectHighlighted.id) {
    // see if grid high light has children or is child
    const { parent, children } = selectionTools.getObjectRelations(mapEditor.objectHighlighted, game)
    if(children.length && parent.id === mapEditor.objectHighlighted.id) {
      mapEditor.objectHighlighted = parent
      mapEditor.objectHighlightedChildren = children
    }
  }
}

function onStartResize(object) {
  mapEditor.resizingObject = JSON.parse(JSON.stringify(object))
}

function onStartSetPathfindingLimit(object) {
  mapEditor.isSettingPathfindingLimit = true
  document.body.style.cursor = "crosshair";
}

function onStartDrag(object) {
  mapEditor.draggingObject = JSON.parse(JSON.stringify(object))
}

function onCopy(object) {
  mapEditor.copiedObject = JSON.parse(JSON.stringify(object))
  delete mapEditor.copiedObject.id
}

function onDelete(object) {
  if(object.id) {
    window.socket.emit('deleteObject', object)
    window.objectHighlighted = null
  } else {
    console.error('trying to delete object without id')
  }
}

function updateResizingObject(object, options = { allowTiny : true }) {
  const { mousePos } = mapEditor
  if(mousePos.x < object.x || mousePos.y < object.y) {
    return
  }
  object.width = mousePos.x - object.x
  object.height = mousePos.y - object.y

  let tinySize
  if(object.width < GAME.grid.nodeSize - 4 && object.height < GAME.grid.nodeSize - 4 && options.allowTiny) {
    tinySize = object.width
  }

  if(tinySize) {
    gridTool.snapTinyObjectToGrid(object, tinySize)
  } else {
    gridTool.snapDragToGrid(object)
  }

}

function updateDraggingObject(object) {
  const { mousePos } = mapEditor
  object.x = mousePos.x
  object.y = mousePos.y
  gridTool.snapDragToGrid(object, {dragging: true})
}

function render() {
  let ctx = mapEditor.ctx
  let camera = mapEditor.camera
  const { draggingObject, copiedObject, objectHighlighted, objectHighlightedChildren, resizingObject, pathfindingLimit } = mapEditor

  if(objectHighlighted) {
    let color = 'rgba(255,255,255,0.2)'
    if(objectHighlighted.tags && objectHighlighted.tags.invisible && objectHighlightedChildren.length === 0 && (!resizingObject || objectHighlighted.id !== resizingObject.id)) {
      color = 'rgba(255,255,255,0.6)'
    }
    drawTools.drawFilledObject(ctx, {...objectHighlighted, color}, camera)
  }

  if(objectHighlightedChildren) {
    let color = 'rgba(255,255,255,0.1)'
    objectHighlightedChildren.forEach((object) => {
      if(object.tags && object.tags.invisible) {
        color = 'rgba(255,255,255,0.4)'
      }
      drawTools.drawFilledObject(ctx, {...object, color}, camera)
    })
  }

  let currentObject = resizingObject || pathfindingLimit || draggingObject || copiedObject
  if(currentObject) {
    drawTools.drawObject(ctx, currentObject, camera)
  }
}

function update(delta, remoteState) {
  if(remoteState && !window.mapEditor.skipRemoteStateUpdate) {
    updateGridHighlight(remoteState.mousePos, mapEditor.game, mapEditor.camera)
  }

  if(!role.isGhost && role.isPlayer && window.hero) {
    window.socket.emit('sendHeroMapEditor', { mousePos: mapEditor.mousePos } , window.hero.id)
  }
}

export default {
  onPageLoad,
  onGameLoad,
  render,
  update,
}
