import grid from '../grid.js'
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
  objectHighlighted: null,
  resizingObject: null,
  draggingObject: null,
}
window.defaultMapEditor = JSON.parse(JSON.stringify(mapEditor))

function init(ctx, game, camera) {
  window.document.getElementById('game-canvas').addEventListener("mousedown", (e) => {
    handleMouseDown(event, game, camera)
  })
  window.document.getElementById('game-canvas').addEventListener("mousemove", (e) => {
    handleMouseMove(event, game, camera)
  })
  window.document.getElementById('game-canvas').addEventListener("mouseup", (e) => {
    handleMouseUp(event, game, camera)
  })

  contextMenu.init(mapEditor, {
    onResize,
    onDrag,
    onDelete,
  })
  keyInput.init()
}

function handleMouseUp(e, camera) {
  let clickEndX = ((event.offsetX + camera.x) * camera.multiplier)
  let clickEndY = ((event.offsetY + camera.y) * camera.multiplier)
}

function handleMouseDown(e, camera) {
  mapEditor.clickStart.x = ((event.offsetX + camera.x) * camera.multiplier)
  mapEditor.clickStart.y = ((event.offsetY + camera.y) * camera.multiplier)

  if(mapEditor.resizingObject) {
    const { resizingObject } = mapEditor
    window.socket.emit('editObjects', [{id: resizingObject.id, width: resizingObject.width, height: resizingObject.height}])
    mapEditor.resizingObject = null
  }

  if(mapEditor.draggingObject) {
    const { draggingObject } = mapEditor
    window.socket.emit('editObjects', [{id: draggingObject.id, x: draggingObject.x, y: draggingObject.y}])
    mapEditor.draggingObject = null
  }
}

function handleMouseMove(event, game, camera) {
  mapEditor.mousePos.x = ((event.offsetX + camera.x) * camera.multiplier)
  mapEditor.mousePos.y = ((event.offsetY + camera.y) * camera.multiplier)

  if(mapEditor.resizingObject) updateResizingObject(mapEditor.resizingObject)
  else if(mapEditor.draggingObject) updateDraggingObject(mapEditor.draggingObject)
  else updateGridHighlight({x: mapEditor.mousePos.x, y: mapEditor.mousePos.y}, game, camera)
}

function updateGridHighlight(location, game, camera) {
  if(mapEditor.contextMenuVisible) return

  const { x,y } = grid.snapXYToGrid(location.x, location.y, { closest: false })

  let mouseLocation = {
    x,
    y,
    width: w.game.grid.nodeSize,
    height: w.game.grid.nodeSize
  }

  mapEditor.objectHighlighted = mouseLocation

  // find the smallest one stacked up
  let smallestObject = selectionTools.findSmallestObjectInArea(mouseLocation, game.objects.filter((object) => !object.actionTriggerArea))
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

function onResize(object) {
  mapEditor.resizingObject = JSON.parse(JSON.stringify(object))
}

function onDrag(object) {
  mapEditor.draggingObject = JSON.parse(JSON.stringify(object))
}

function onDelete(object) {
  if(object.id) {
    window.socket.emit('deleteObject', object)
    window.objectHighlighted = null
  } else {
    console.error('trying to delete object without id')
  }
}


function updateResizingObject(object) {
  const { mousePos } = mapEditor
  if(mousePos.x < object.x || mousePos.y < object.y) {
    return
  }
  object.width = mousePos.x - object.x
  object.height = mousePos.y - object.y
  grid.snapDragToGrid(object, {dragging: true})
}

function updateDraggingObject(object) {
  const { mousePos } = mapEditor
  object.x = mousePos.x
  object.y = mousePos.y
  grid.snapDragToGrid(object, {dragging: true})
}

function render(ctx, game, camera) {
  let tempCamera = JSON.parse(JSON.stringify(camera))
  tempCamera.multiplier = 1/tempCamera.multiplier

  const { draggingObject, objectHighlighted, objectHighlightedChildren, resizingObject } = mapEditor

  if(objectHighlighted) {
    let color = 'rgba(255,255,255,0.2)'
    if(objectHighlighted.tags && objectHighlighted.tags.invisible && objectHighlightedChildren.length === 0 && (!resizingObject || objectHighlighted.id !== resizingObject.id)) {
      color = 'rgba(255,255,255,0.6)'
    }
    drawTools.drawObject(ctx, {...objectHighlighted, color}, tempCamera)
  }

  if(objectHighlightedChildren) {
    let color = 'rgba(255,255,255,0.1)'
    objectHighlightedChildren.forEach((object) => {
      if(object.tags && object.tags.invisible) {
        color = 'rgba(255,255,255,0.4)'
      }
      drawTools.drawObject(ctx, {...object, color}, tempCamera)
    })
  }

  if(resizingObject) {
    drawTools.getObjectVertices(ctx, resizingObject, tempCamera).forEach((vertice) => {
      drawTools.drawVertice(ctx, vertice, tempCamera)
    })
  }

  if(draggingObject) {
    drawTools.getObjectVertices(ctx, draggingObject, tempCamera).forEach((vertice) => {
      drawTools.drawVertice(ctx, vertice, tempCamera)
    })
  }

}

export default {
  init,
  render,
}
