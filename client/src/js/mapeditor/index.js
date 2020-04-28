import grid from '../grid.js'
import collisions from '../collisions'
import contextMenu from './contextMenu.jsx'
import drawTools from './drawTools.js';

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
  objectHighlighted: null
}

function updateGridHighlight(location, game, camera) {
  if(mapEditor.contextMenuVisible) return

  const { x,y } = grid.snapXYToGrid(location.x, location.y)

  let mouseLocation = {
    x,
    y,
    width: w.game.grid.nodeSize,
    height: w.game.grid.nodeSize
  }

  mapEditor.objectHighlighted = mouseLocation

  // find the smallest one stacked up
  let smallestObject = findSmallestObjectInArea(mouseLocation, game.objects)
  if(smallestObject) mapEditor.objectHighlighted = smallestObject

  mapEditor.objectHighlightedChildren = []
  if(mapEditor.objectHighlighted.id) {
    // see if grid high light has children or is child
    const { parent, children } = getObjectRelations(mapEditor.objectHighlighted, game)
    if(children.length && parent.id === mapEditor.objectHighlighted.id) {
      mapEditor.objectHighlighted = parent
      mapEditor.objectHighlightedChildren = children
    }
  }
}

function handleMouseMove(event, game, camera) {
  mapEditor.mousePos.x = ((event.offsetX + camera.x) * camera.multiplier)
  mapEditor.mousePos.y = ((event.offsetY + camera.y) * camera.multiplier)

  if(mapEditor.resizingObject) updateResizingObject(mapEditor.resizingObject)
  else updateGridHighlight({x: mapEditor.mousePos.x, y: mapEditor.mousePos.y}, game, camera)

}

function handleMouseUp(e, camera) {
  let clickEndX = ((event.offsetX + camera.x) * camera.multiplier)
  let clickEndY = ((event.offsetY + camera.y) * camera.multiplier)
}

function handleMouseDown(e, camera) {
  mapEditor.clickStart.x = ((event.offsetX + camera.x) * camera.multiplier)
  mapEditor.clickStart.y = ((event.offsetY + camera.y) * camera.multiplier)

  if(mapEditor.resizingObject) {
    delete mapEditor.resizingObject.x
    delete mapEditor.resizingObject.y
    window.socket.emit('editObjects', [mapEditor.resizingObject])
    mapEditor.resizingObject = null
  }
}

function onResize(object) {
  mapEditor.resizingObject = JSON.parse(JSON.stringify(object))
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
    onResize
  })
}

function findSmallestObjectInArea(area, objects) {
  let smallestObject
  for(let i = 0; i < objects.length; i++) {
    let object = objects[i]
    collisions.checkObject(area, object, () => {
      if(!smallestObject) smallestObject = object
      else if(object.width < smallestObject.width) {
        smallestObject = object
      }
    })
  }

  return smallestObject
}

function getObjectRelations(object, game) {
  let parent = object
  if(object.parentId) {
    let objectsParent = game.objectsById[object.parentId]
    if(objectsParent) {
      parent = objectsParent
    }
  }

  let children = []
  game.objects.forEach((obj) => {
    if(obj.parentId === parent.id) {
      children.push(obj)
    }
  })

  return { parent, children }
}

function render(ctx, game, camera) {
  let tempCamera = JSON.parse(JSON.stringify(camera))
  tempCamera.multiplier = 1/tempCamera.multiplier

  const { objectHighlighted, objectHighlightedChildren, resizingObject } = mapEditor

  if(objectHighlighted) {
    let color = 'rgba(255,255,255,0.2)'
    if(objectHighlighted.tags && objectHighlighted.tags.invisible && objectHighlightedChildren.length === 0) {
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


}

export default {
  init,
  render,
}
