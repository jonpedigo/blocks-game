import gridTool from '../utils/grid.js'
import collisions from '../utils/collisions'
import contextMenu from './contextMenu.jsx'
import drawTools from './drawTools';
import selectionTools from './selectionTools';
import keyInput from './keyInput';

class MapEditor{
  constructor() {
    this.clickStart = {
      x: null,
      y: null,
    }

    this.mousePos = {
      x: null,
      y: null,
    }

    this.dragStart = {
      x: null,
      y: null,
    }

    this.copiedObject = null
    this.objectHighlighted = null
    this.resizingObject = null
    this.draggingObject = null
    this.pathfindingLimit = null
    this.isSettingPathfindingLimit = false

    this.canvas = null
    this.camera = null
    this.ctx =null

    window.defaultMapEditor = JSON.parse(JSON.stringify(this))
  }

  set(ctx, canvas, camera) {
    MAPEDITOR.ctx = ctx
    MAPEDITOR.canvas = canvas
    MAPEDITOR.camera = camera

    canvas.addEventListener("mousedown", (e) => {
      handleMouseDown(event)
    })
    canvas.addEventListener("mousemove", (e) => {
      handleMouseMove(event)
    })
    canvas.addEventListener("mouseup", (e) => {
      handleMouseUp(event)
    })
    canvas.addEventListener("mouseout", (e) => {
      handleMouseOut(event)
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



  onUpdate(delta) {
    if(MAPEDITOR.remoteState && !MAPEDITOR.skipRemoteStateUpdate) {
      updateGridHighlight(MAPEDITOR.remoteState.mousePos)
    }

    if(!PAGE.role.isGhost && PAGE.role.isPlayer && GAME.heros[HERO.id]) {
      window.socket.emit('sendHeroMapEditor', { mousePos: MAPEDITOR.mousePos } , HERO.id)
    }
  }

  onRender() {
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
      if(currentObject.tags.invisible) {
        drawTools.drawObject(ctx, {...currentObject, tags: {invisible: false, filled: true}, color: 'rgba(255,255,255,0.2)'}, camera)
      } else {
        drawTools.drawObject(ctx, currentObject, camera)
      }
    }
  }

  onSendHeroMapEditor(remoteState, heroId) {
    if(GAME.heros[HERO.id] && HERO.id === heroId) {
      MAPEDITOR.remoteState = remoteState
    }
  }

  onAskHeroToNameObject(object, heroId) {
    if(PAGE.role.isPlayer && !PAGE.role.isGhost && HERO.id === heroId) {
      modals.nameObject(object)
    }
  }

  onAskHeroToWriteChat(object, heroId) {
    if(PAGE.role.isPlayer && !PAGE.role.isGhost && HERO.id === heroId) {
      modals.writeDialogue(object)
    }
  }
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
    OBJECTS.create([MAPEDITOR.copiedObject])
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
  if(MAPEDITOR.contextMenuVisible) return

  const { x,y } = gridTool.snapXYToGrid(location.x, location.y, { closest: false })

  let mouseLocation = {
    x,
    y,
    width: GAME.grid.nodeSize,
    height: GAME.grid.nodeSize
  }

  MAPEDITOR.objectHighlighted = mouseLocation

  // find the smallest one stacked up
  let smallestObject = selectionTools.findSmallestObjectInArea(mouseLocation, GAME.objects)
  if(smallestObject) MAPEDITOR.objectHighlighted = smallestObject

  MAPEDITOR.objectHighlightedChildren = []
  if(MAPEDITOR.objectHighlighted.id) {
    // see if grid high light has children or is child
    const { parent, children } = selectionTools.getObjectRelations(MAPEDITOR.objectHighlighted, GAME)
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
  const { mousePos } = MAPEDITOR
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
  const { mousePos } = MAPEDITOR
  object.x = mousePos.x
  object.y = mousePos.y
  gridTool.snapDragToGrid(object, {dragging: true})
}

window.MAPEDITOR = new MapEditor()
