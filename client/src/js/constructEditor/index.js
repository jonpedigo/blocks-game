import Grid from './grid'
import gridUtil from '../utils/grid'
import drawTools from '../mapeditor/drawTools'
import keyInput from './keyInput'

class ConstructEditor {
  constructor() {
    keyInput.init()
    this.initState()
  }

  initState() {
    this.grid = null
    this.spawnPointX = 0
    this.spawnPointY = 0
    this.paused = false
    this.open = false
    this.nodeHighlighted = null
    this.mousePos = {
      x: null,
      y: null,
    }
    this.cameraController = {
      x: null,
      y: null,
      width: 0,
      height: 0,
      zoomMultiplier: null,
    }
  }

  cancel() {
    window.local.emit('onConstructEditorClose', false)
    this.close()
  }

  close() {
    this.open = false
    document.body.style.cursor = 'default';
    this.canvas.removeEventListener('mousedown', this._mouseDownListener)
    this.canvas.removeEventListener('mousemove', this._mouseMoveListener)
    this.canvas.removeEventListener('mouseup', this._mouseUpListener)
    this.initState()
  }

  finish() {
    const constructParts = this.combineNodesIntoRectangles()
    const { x, y, width, height } = this.getBoundingBox(constructParts)
    window.local.emit('onConstructEditorClose', {constructParts, x, y, width, height})
    this.close()
  }

  start(object) {
    this.initState()
    this.open = true
    this.tags = object.tags
    this.grid = new Grid(GAME.grid.startX, GAME.grid.startY, GAME.grid.width, GAME.grid.height, GAME.grid.nodeSize)
    this.spawnPointX = object.spawnPointX
    this.spawnPointY = object.spawnPointY
    this.initializeGridNodes(object)

    const gridObject = {x: 0, y: 0, width: this.grid.gridWidth * this.grid.nodeSize, height: this.grid.gridHeight * this.grid.nodeSize}
    this.camera.setLimitRect(gridObject)

    let gridWidth = (object.width/this.grid.nodeSize)
    let gridHeight = (object.height/this.grid.nodeSize)
    if(gridWidth < 40) gridWidth = 40
    if(gridHeight < 40) gridHeight = 40
    const zoomMultiplierX = (gridWidth)/16
    const zoomMultiplierY = (gridHeight)/16
    let zoomMultiplier = zoomMultiplierX
    if(zoomMultiplierY > zoomMultiplier) zoomMultiplier = zoomMultiplierY

    const width = zoomMultiplier * HERO.cameraWidth
    const height = zoomMultiplier * HERO.cameraHeight
    this.cameraController = {x: object.x, width: object.width, y: object.y, height: object.height, zoomMultiplier}
    this.camera.set(this.cameraController)

    this._mouseDownListener = (e) => {
      if(e.which === 1) {
        if(!this.paused) this.handleMouseDown(event)
      }
    }
    this.canvas.addEventListener("mousedown", this._mouseDownListener)

    this._mouseMoveListener = (e) => {
      if(!this.paused) this.handleMouseMove(event)
    }
    this.canvas.addEventListener("mousemove", this._mouseMoveListener)

    this._mouseUpListener = (e) => {
      if(!this.paused) this.handleMouseUp(event)
    }
    this.canvas.addEventListener("mouseup", this._mouseUpListener)

    document.body.style.cursor = 'crosshair';
  }

  handleMouseUp() {
    this.painting = false
  }

  handleMouseDown(event) {
    const { camera, grid } = this
    this.painting = true
    this.paintNodeXY(this.mousePos.x, this.mousePos.y)
  }

  handleMouseMove(event) {
    const { camera } = this

    if(this.painting) this.paintNodeXY(this.mousePos.x, this.mousePos.y)

    this.mousePos.x = ((event.offsetX + camera.x) / camera.multiplier)
    this.mousePos.y = ((event.offsetY + camera.y) / camera.multiplier)

    this.updateNodeHighlight(this.mousePos)
  }

  paintNodeXY(x, y) {
    const { selectedColor, grid } = this
    const { gridX, gridY } = grid.getGridXYfromXY(x, y, { closest: false })
    this.fillNode(gridX, gridY, 'red')
  }

  set(ctx, canvas, camera) {
    this.ctx = ctx
    this.canvas = canvas
    this.camera = camera
    this.camera.allowOcclusion = false
  }

  initializeGridNodes(object) {
    const squares = [];
    if(object.constructParts) {
      object.constructParts.forEach((part) => {
        squares.push(...this.seperateRectangleIntoSquares(part, object))
      })
    } else {
      squares.push(...this.seperateRectangleIntoSquares(object))
    }

    squares.forEach((square) => {
      this.grid.updateNode(square.gridX, square.gridY, { color: square.color, filled: true })
    })
  }

  seperateRectangleIntoSquares(object, parent) {
    const squares = []
    if(object.height !== this.grid.nodeSize || object.width !== this.grid.nodeSize) {
      for(let x = object.x; x < object.x + object.width; x += this.grid.nodeSize) {
        for(let y = object.y; y < object.y + object.height; y += this.grid.nodeSize) {
          squares.push({
            x, y,
            ...this.grid.getGridXYfromXY(x, y),
            color: object.color,
          })
        }
      }
    } else {
      squares.push({
        x: object.x,
        y: object.y,
        ...this.grid.getGridXYfromXY(object.x, object.y),
        color: object.color,
      })
    }

    return squares
  }

  combineNodesIntoRectangles() {
    const rectangles = []

    this.grid.forEachNode((node) => {
      if(node.data.filled) {
        const possibleRectangleEnd = this.grid.findFurthestNodeInDirection(node, 'right', 'color', node.data.color)
        if(possibleRectangleEnd && possibleRectangleEnd.gridX !== node.gridX) {
          const width = possibleRectangleEnd.x + this.grid.nodeSize - node.x
          const height = possibleRectangleEnd.y + this.grid.nodeSize - node.y
          rectangles.push({x: node.x, y: node.y, width, height, color: node.data.color})
          this.unfillNodesBetween(node.gridX, node.gridY, possibleRectangleEnd.gridX, possibleRectangleEnd.gridY)
        } else {
          rectangles.push({ x: node.x, y: node.y, width: this.grid.nodeSize, height: this.grid.nodeSize, color: node.data.color })
          this.unfillNode(node.gridX, node.gridY)
        }
      }
    })

    rectangles.forEach((rect1) => {
      rectangles.forEach((rect2) => {
        if(!rect1.claimed && !rect2.claimed && rect1.x === rect2.x && rect1.width === rect2.width) {
          if(rect1.y + rect1.height === rect2.y && rect1.color === rect2.color) {
            let higherRect = rect1
            let lowerRect = rect2
            higherRect.height += lowerRect.height
            lowerRect.claimed = true
          }
        }
      })
    })

    return rectangles.filter((rect) => !rect.claimed)
  }

  getBoundingBox(rectangles) {
    let minX = this.grid.x + this.grid.width
    let minY = this.grid.y + this.grid.height
    let maxX = this.grid.x
    let maxY = this.grid.y

    rectangles.forEach((rect) => {
      if(rect.x < minX) minX = rect.x
      if(rect.y < minY) minY = rect.y
      if(rect.x + rect.width > maxX) maxX = rect.x + rect.width
      if(rect.y + rect.height > maxY) maxY = rect.y + rect.height
    })

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  unfillNodesBetween(startGridX, startGridY, endGridX, endGridY) {
    for(let gridX = startGridX; gridX < endGridX + 1; gridX++) {
      for(let gridY = startGridY; gridY < endGridY + 1; gridY++) {
        this.unfillNode(gridX, gridY)
      }
    }
  }

  unfillNode(gridX, gridY) {
    this.grid.updateNode(gridX, gridY, {filled: false, color: null})
  }

  fillNode(gridX, gridY, color) {
    this.grid.updateNode(gridX, gridY, {filled: true, color})
  }


  updateNodeHighlight(location) {
    const { x,y } = gridUtil.snapXYToGrid(location.x, location.y, { closest: false })

    let mouseLocation = {
      x,
      y,
      width: this.grid.nodeSize,
      height: this.grid.nodeSize
    }

    this.nodeHighlighted = mouseLocation
  }

  onUpdate(delta) {
    const { open , grid, camera, cameraController, tags } = CONSTRUCTEDITOR
    if(!open) return

    keyInput.update(delta)

    camera.set(cameraController)
  }

  onRender() {
    const {ctx, canvas, camera, grid, nodeHighlighted, tags, open } = CONSTRUCTEDITOR
    if(!open) return

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawTools.drawGrid(ctx, grid, camera)

    grid.forEachNode((node) => {
      if(node.data.filled) {
        drawTools.drawObject(ctx, {x: node.x, y: node.y, height: node.height, width: node.width, color: node.data.color, tags }, camera)
      }
    })

    if(!tags.filled) {
      ctx.globalCompositeOperation='destination-out';

      grid.forEachNode((node) => {
        if(node.data.filled) {
          drawTools.drawObject(ctx, {x: node.x, y: node.y, height: node.height, width: node.width }, camera)
        }
      })

      ctx.globalCompositeOperation='source-over';
    }

    if(nodeHighlighted) {
      drawTools.drawObject(ctx, nodeHighlighted, camera)
    }
  }
}

window.CONSTRUCTEDITOR = new ConstructEditor()
