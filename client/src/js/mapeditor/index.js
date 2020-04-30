import gridTool from '../utils/grid.js'
import collisions from '../utils/collisions'
import contextMenu from './contextMenu.jsx'
import drawTools from './drawTools';
import selectionTools from './selectionTools';
import keyInput from './keyInput';

window.MAPEDITOR = {
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
  isSettingPathfindingLimit: false,

  canvas: null,
  game: null,
  camera: null,
  ctx: null,
}
window.defaultMapEditor = JSON.parse(JSON.stringify(MAPEDITOR))

function onPageLoad(gameCanvas) {
  MAPEDITOR.canvas = gameCanvas

  console.log('?')

  gameCanvas.addEventListener("mousedown", (e) => {
    if(MAPEDITOR.game) handleMouseDown(event)
  })
  gameCanvas.addEventListener("mousemove", (e) => {
    if(MAPEDITOR.game) handleMouseMove(event)
  })
  gameCanvas.addEventListener("mouseup", (e) => {
    if(MAPEDITOR.game) handleMouseUp(event)
  })
  gameCanvas.addEventListener("mouseout", (e) => {
    if(MAPEDITOR.game) handleMouseOut(event)
  })

  contextMenu.init(MAPEDITOR, {
    onStartResize,
    onStartDrag,
    onDelete,
    onCopy,
    onStartSetPathfindingLimit,
  })
  keyInput.init()
}

function onGameLoad(ctx, game, camera) {
  MAPEDITOR.game = game
  MAPEDITOR.camera = camera
  MAPEDITOR.ctx = ctx
}

function handleMouseUp(event) {
  const { camera } = MAPEDITOR
  let clickEndX = ((event.offsetX + camera.x) / camera.multiplier)
  let clickEndY = ((event.offsetY + camera.y) / camera.multiplier)
}

function handleMouseDown(event) {
  const { camera } = MAPEDITOR

  MAPEDITOR.clickStart.x = ((event.offsetX + camera.x) / camera.multiplier)
  MAPEDITOR.clickStart.y = ((event.offsetY + camera.y) / camera.multiplier)

  if(MAPEDITOR.copiedObject) {
    window.addObjects([MAPEDITOR.copiedObject])
    MAPEDITOR.copiedObject = null
  } else if(MAPEDITOR.isSettingPathfindingLimit) {
    if(MAPEDITOR.pathfindingLimit) {
      const { pathfindingLimit, objectHighlighted } = MAPEDITOR
      gridTool.snapDragToGrid(pathfindingLimit, {dragging: true})
      window.socket.emit('editObjects', [{id: objectHighlighted.id, pathfindingLimit, path: null}])
      document.body.style.cursor = "default";
      MAPEDITOR.isSettingPathfindingLimit = false
      MAPEDITOR.pathfindingLimit = null
    } else {
      MAPEDITOR.pathfindingLimit = { ...MAPEDITOR.clickStart }
      MAPEDITOR.pathfindingLimit.width = 0
      MAPEDITOR.pathfindingLimit.height = 0
    }
  } else if(MAPEDITOR.resizingObject) {
    const { resizingObject } = MAPEDITOR
    window.socket.emit('editObjects', [{id: resizingObject.id, x: resizingObject.x, y: resizingObject.y, width: resizingObject.width, height: resizingObject.height}])
    MAPEDITOR.resizingObject = null
  } else if(MAPEDITOR.draggingObject) {
    const { draggingObject } = MAPEDITOR
    window.socket.emit('editObjects', [{id: draggingObject.id, x: draggingObject.x, y: draggingObject.y}])
    MAPEDITOR.draggingObject = null
  }
}


function handleMouseOut(event) {
  if(PAGE.role.isGhost) {
    MAPEDITOR.skipRemoteStateUpdate = false
  }
}
function handleMouseMove(event) {
  const { camera } = MAPEDITOR

  if(PAGE.role.isGhost) {
    MAPEDITOR.skipRemoteStateUpdate = true
  }

  MAPEDITOR.mousePos.x = ((event.offsetX + camera.x) / camera.multiplier)
  MAPEDITOR.mousePos.y = ((event.offsetY + camera.y) / camera.multiplier)

  if(MAPEDITOR.copiedObject) {
    updateDraggingObject(MAPEDITOR.copiedObject)
  } else if(MAPEDITOR.isSettingPathfindingLimit) {
    if(MAPEDITOR.pathfindingLimit) {
      updateResizingObject(MAPEDITOR.pathfindingLimit, { allowTiny: false })
    }
  } else if(MAPEDITOR.resizingObject) {
    updateResizingObject(MAPEDITOR.resizingObject)
  } else if(MAPEDITOR.draggingObject) {
    updateDraggingObject(MAPEDITOR.draggingObject)
  } else {
    updateGridHighlight({x: MAPEDITOR.mousePos.x, y: MAPEDITOR.mousePos.y})
  }
}

function updateGridHighlight(location) {
  const { game } = MAPEDITOR

  if(MAPEDITOR.contextMenuVisible) return

  const { x,y } = gridTool.snapXYToGrid(location.x, location.y, { closest: false })

  let mouseLocation = {
    x,
    y,
    width: game.grid.nodeSize,
    height: game.grid.nodeSize
  }

  MAPEDITOR.objectHighlighted = mouseLocation

  // find the smallest one stacked up
  let smallestObject = selectionTools.findSmallestObjectInArea(mouseLocation, game.objects)
  if(smallestObject) MAPEDITOR.objectHighlighted = smallestObject

  MAPEDITOR.objectHighlightedChildren = []
  if(MAPEDITOR.objectHighlighted.id) {
    // see if grid high light has children or is child
    const { parent, children } = selectionTools.getObjectRelations(MAPEDITOR.objectHighlighted, game)
    if(children.length && parent.id === MAPEDITOR.objectHighlighted.id) {
      MAPEDITOR.objectHighlighted = parent
      MAPEDITOR.objectHighlightedChildren = children
    }
  }
}

function onStartResize(object) {
  MAPEDITOR.resizingObject = JSON.parse(JSON.stringify(object))
}

function onStartSetPathfindingLimit(object) {
  MAPEDITOR.isSettingPathfindingLimit = true
  document.body.style.cursor = "crosshair";
}

function onStartDrag(object) {
  MAPEDITOR.draggingObject = JSON.parse(JSON.stringify(object))
}

function onCopy(object) {
  MAPEDITOR.copiedObject = JSON.parse(JSON.stringify(object))
  delete MAPEDITOR.copiedObject.id
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
  const { mousePos, game } = MAPEDITOR
  if(mousePos.x < object.x || mousePos.y < object.y) {
    return
  }
  object.width = mousePos.x - object.x
  object.height = mousePos.y - object.y

  let tinySize
  if(object.width < game.grid.nodeSize - 4 && object.height < game.grid.nodeSize - 4 && options.allowTiny) {
    tinySize = object.width
  }

  if(tinySize) {
    gridTool.snapTinyObjectToGrid(object, tinySize)
  } else {
    gridTool.snapDragToGrid(object)
  }

}

function updateDraggingObject(object) {
  const { mousePos } = MAPEDITOR
  object.x = mousePos.x
  object.y = mousePos.y
  gridTool.snapDragToGrid(object, {dragging: true})
}

function render() {
  let ctx = MAPEDITOR.ctx
  let camera = MAPEDITOR.camera

  const { draggingObject, copiedObject, objectHighlighted, objectHighlightedChildren, resizingObject, pathfindingLimit } = MAPEDITOR

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

function update(delta) {
  if(MAPEDITOR.remoteState && !MAPEDITOR.skipRemoteStateUpdate) {
    updateGridHighlight(MAPEDITOR.remoteState.mousePos)
  }

  if(!PAGE.role.isGhost && PAGE.role.isPlayer && HERO.hero) {
    window.socket.emit('sendHeroMapEditor', { mousePos: MAPEDITOR.mousePos } , HERO.hero.id)
  }
}

export default {
  onPageLoad,
  onGameLoad,
  render,
  update,
}
