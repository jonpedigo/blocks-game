import Grid from './grid'
import gridUtil from '../utils/grid'
import drawTools from '../mapeditor/drawTools'

class ConstructEditor {
  constructor() {
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
      zoomMultiplier: null,
    }
  }

  finish() {
    this.open = false
    const constructParts = this.combineNodesIntoRectangles()
    window.local.emit('onConstructEditorFinished', constructParts)
    this.initState()

    document.body.style.cursor = 'default';

    this.canvas.removeEventListener('mousedown', this._mouseDownListener)
    this.canvas.removeEventListener('mousemove', this._mouseMoveListener)
  }

  start(object) {
    this.initState()
    this.open = true
    this.grid = new Grid(GAME.grid.startX, GAME.grid.startY, GAME.grid.width, GAME.grid.height, GAME.grid.nodeSize)
    this.spawnPointX = object.spawnPointX
    this.spawnPointY = object.spawnPointY
    this.initializeGridNodes(object)

    const gridObject = {x: 0, y: 0, width: this.grid.gridWidth * this.grid.nodeSize, height: this.grid.gridHeight * this.grid.nodeSize}
    this.camera.setLimitRect(gridObject)

    this.cameraController = {x: object.x, width: object.width, y: object.y, height: object.height, zoomMultiplier: ((object.width/this.grid.nodeSize) + 20)/16 }
    this.camera.set(this.cameraController)

    this._mouseDownListener = (e) => {
      if(!this.paused) this.handleMouseDown(event)
    }
    this.canvas.addEventListener("mousedown", this._mouseDownListener)

    this._mouseMoveListener = (e) => {
      if(!this.paused) this.handleMouseMove(event)
    }
    this.canvas.addEventListener("mousemove", this._mouseMoveListener)

    document.body.style.cursor = 'none';
  }

  handleMouseDown(event) {
    const { camera, selectedColor, grid } = this
    const { gridX, gridY } = grid.getGridXYfromXY(this.mousePos.x, this.mousePos.y, { closest: false })

    this.fillNode(gridX, gridY, 'red')
  }

  handleMouseMove(event) {
    const { camera } = this

    this.mousePos.x = ((event.offsetX + camera.x) / camera.multiplier)
    this.mousePos.y = ((event.offsetY + camera.y) / camera.multiplier)

    this.updateNodeHighlight(this.mousePos)
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
        const possibleRectangleEnd = this.grid.findFurthestNodeInDirection(node, 'right', 'filled', true)
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
          if(rect1.y + rect1.height === rect2.y) {
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

  onRender() {
    if(!CONSTRUCTEDITOR.open) return

    const {ctx, canvas, camera, grid, nodeHighlighted } = CONSTRUCTEDITOR
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawTools.drawGrid(ctx, grid, camera)

    grid.forEachNode((node) => {
      if(node.data.filled) {
        drawTools.drawObject(ctx, {...node, color: node.data.color}, camera)
      }
    })

    if(nodeHighlighted) {
      drawTools.drawObject(ctx, nodeHighlighted, camera)
    }
  }
}

window.CONSTRUCTEDITOR = new ConstructEditor()
