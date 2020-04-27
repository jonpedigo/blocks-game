import grid from '../grid.js'
import collisions from '../collisions'
import contextMenu from './contextMenu.jsx'

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

  const { x,y } = grid.createGridNodeAt(location.x, location.y)

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

  let deltaX = mapEditor.mousePos.x - mapEditor.clickStart.x
  let deltaY = mapEditor.mousePos.y - mapEditor.clickStart.y
  // if(deltaX > 10 && deltaY > 10) {
  //   onSizeObjectStart(objectHighlighted)
  // }



  
  //
  // if(draggingObject) {
  //   if(window.draggingObject.parent) {
  //     window.draggingObject.parent.x = x
  //     window.draggingObject.parent.y = y
  //
  //     let parentGameObject
  //     if(window.draggingObject.forSelectionOnly) {
  //       let editorState = window.objecteditor.get()
  //       parentGameObject = editorState.parent
  //     } else if(window.draggingObject.parent.id){
  //       parentGameObject = w.editingGame.objectsById[window.draggingObject.parent.id]
  //     }
  //     let diffX = parentGameObject.x - x
  //     let diffY = parentGameObject.y - y
  //
  //     window.draggingObject.children.forEach((obj) => {
  //       obj.x = w.editingGame.objectsById[obj.id].x - diffX
  //       obj.y = w.editingGame.objectsById[obj.id].y - diffY
  //     })
  //   } else {
  //     window.draggingObject.x = x
  //     window.draggingObject.y = y
  //   }
  //   return
  // }
  //
  // if(window.dotAddToggle.checked && window.currentTool === window.TOOLS.ADD_OBJECT) {
  //   location.width = Number(document.getElementById('add-dot-size').value)
  //   location.height = Number(document.getElementById('add-dot-size').value)
  //   location.x += (w.editingGame.grid.nodeSize/2 - location.width/2)
  //   location.y += (w.editingGame.grid.nodeSize/2 - location.height/2)
  // }
  //
  // if(window.gridNodeAddToggle.checked  && window.currentTool === window.TOOLS.ADD_OBJECT) {
  //   location.width = w.editingGame.grid.nodeSize
  //   location.height = w.editingGame.grid.nodeSize
  // }
  //
  // // console.log((window.setObjectPathfindingLimitToggle.checked && window.currentTool === window.TOOLS.SIMPLE_EDITOR) , (window.groupAddToggle.checked && window.currentTool === window.TOOLS.ADD_OBJECT) , (window.currentTool === window.TOOLS.WORLD_EDITOR && !window.selectorSpawnToggle.checked) , !!(window.clickStart.x || window.clickStart.x === 0))
  // if(((window.setObjectPathfindingLimitToggle.checked && window.currentTool === window.TOOLS.SIMPLE_EDITOR) || (window.groupAddToggle.checked && window.currentTool === window.TOOLS.ADD_OBJECT) || (window.currentTool === window.TOOLS.WORLD_EDITOR && !window.selectorSpawnToggle.checked) || (window.currentTool === window.TOOLS.ADD_OBJECT && window.addWallToggle.checked)) && !!(window.clickStart.x || window.clickStart.x === 0)) {
  //   location = {
  //     width: (event.offsetX - window.clickStart.x + window.camera.x)/window.scaleMultiplier,
  //     height: (event.offsetY - window.clickStart.y + window.camera.y)/window.scaleMultiplier,
  //     x: window.clickStart.x/window.scaleMultiplier,
  //     y: window.clickStart.y/window.scaleMultiplier,
  //   }
  //   gridTool.snapDragToGrid(location, {dragging: true})
  // }
  //
  // if(window.useEditorSizeAddToggle.checked  && window.currentTool === window.TOOLS.ADD_OBJECT) {
  //   let oe = window.objecteditor.get()
  //   location.width = oe.width || w.editingGame.grid.nodeSize
  //   location.height = oe.height || w.editingGame.grid.nodeSize
  //   location.x += (w.editingGame.grid.nodeSize/2 - location.width/2)
  //   location.y += (w.editingGame.grid.nodeSize/2 - location.height/2)
  // }
  //
  // if(((window.currentTool === window.TOOLS.ADD_OBJECT && window.addParentToggle.checked) || (window.currentTool === window.TOOLS.SIMPLE_EDITOR && window.selectObjectGroupToggle.checked)) && !!(window.clickStart.x || window.clickStart.x === 0)) {
  //   location = {
  //     width: (event.offsetX - window.clickStart.x + window.camera.x)/window.scaleMultiplier,
  //     height: (event.offsetY - window.clickStart.y + window.camera.y)/window.scaleMultiplier,
  //     x: window.clickStart.x/window.scaleMultiplier,
  //     y: window.clickStart.y/window.scaleMultiplier,
  //   }
  //
  //   window.highlightedObjectGroup = []
  //   w.editingGame.objects
  //   .forEach((object, i) => {
  //     collisions.checkObject(location, object, () => {
  //       window.highlightedObjectGroup.push(object)
  //     })
  //   })
  //   gridTool.snapDragToGrid(location, {dragging: true})
  // }


  // let oe = window.objecteditor.get()
  // if(oe.parent && window.currentTool === window.TOOLS.ADD_OBJECT) {
  //   const {parent, children} = window.copyParentAndChild(oe.parent, oe.children)
  //   parent.x = location.x
  //   parent.y = location.y
  //   children.forEach((child) => {
  //     child.x = parent.x + child.__relativeToParentX
  //     child.y = parent.y + child.__relativeToParentY
  //     delete child.__relativeToParentX
  //     delete child.__relativeToParentY
  //   })
  //   objectHighlighted = { parent, children }
  // }
}

function handleMouseUp(e, camera) {
  let clickEndX = ((event.offsetX + camera.x) * camera.multiplier)
  let clickEndY = ((event.offsetY + camera.y) * camera.multiplier)
  let deltaX = clickEndX - mapEditor.clickStart.x
  let deltaY = clickEndY - mapEditor.clickStart.y

  if(mapEditor.draggingObject) {
    onSizeObjectEnd(objectHighlighted)
  }

  // else {
  //   if(deltaX > 10 && deltaY > 10) {
  //     onDragStart(objectHighlighted)
  //   }
  // }
}

function onSizeObjectStart() {
  grid.snapDragToGrid(location, {dragging: true})

}

function onSizeObjectEnd() {
  grid.snapDragToGrid(location, {dragging: true})

}

function handleMouseDown(e, camera) {
  mapEditor.clickStart.x = ((event.offsetX + camera.x) * camera.multiplier)
  mapEditor.clickStart.y = ((event.offsetY + camera.y) * camera.multiplier)

}

function init(ctx, game, camera) {
  window.document.getElementById('game-canvas').addEventListener("mousedown", (e) => {
    handleMouseDown(event, game, camera)
  })
  window.document.getElementById('game-canvas').addEventListener("mousemove", (e) => {
    handleMouseMove(event, game, camera)
    updateGridHighlight({x: mapEditor.mousePos.x, y: mapEditor.mousePos.y}, game, camera)

  })
  window.document.getElementById('game-canvas').addEventListener("mouseup", (e) => {
    handleMouseUp(event, game, camera)
  })

  contextMenu.init(mapEditor)
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
  const { objectHighlighted, objectHighlightedChildren } = mapEditor

  if(objectHighlighted) {
    camera.drawObject(ctx, {...objectHighlighted, color: 'rgba(255,255,255,0.2)'})
  }

  if(objectHighlightedChildren) {
    objectHighlightedChildren.forEach((object) => {
      camera.drawObject(ctx, {...object, color: 'rgba(255,255,255,0.1)'})
    })
  }
}

export default {
  init,
  render,
}
