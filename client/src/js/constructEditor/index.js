// most recently chosen colors
// toggle grid on and off
// fill tool
// CLOCK WISE parts, SCROLL THROUGH ENTIRE OBJECT COUNTERCLOCKWISE. Only those hit by counter clickwise are physics objects, the rest are aesthetic
// right now it just checks for widest objects, also check for tallest objects and pick between the two

import React from 'react'
import ReactDOM from 'react-dom'

import Grid from './grid'
import gridUtil from '../utils/grid'
import drawTools from '../mapeditor/drawTools'
import keyInput from './keyInput'
import Root from './Root.jsx'

class ConstructEditor {
  constructor() {
    keyInput.init()
    this.initState()

    this.cancel = this.cancel.bind(this)
    this.finish = this.finish.bind(this)
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
    this.objectId = null
    this.painting = false
    this.erasing = false
    this.selectedColor = null
  }

  cancel() {
    this.open = false
    this.close()
    window.local.emit('onConstructEditorClose', false)
  }

  close() {
    document.body.style.cursor = 'default';
    this.canvas.removeEventListener('mousedown', this._mouseDownListener)
    this.canvas.removeEventListener('mousemove', this._mouseMoveListener)
    this.canvas.removeEventListener('mouseup', this._mouseUpListener)
    this.ref.close()
    this.initState()
  }

  finish() {
    let constructParts = this.combineNodesIntoRectangles()
    constructParts.forEach((part) => {
      part.id = window.uniqueID()
    })
    const { x, y, width, height } = this.getBoundingBox(constructParts)
    this.close()
    window.local.emit('onConstructEditorClose', {constructParts, x, y, width, height})
  }

  start(object, startAtHero = false) {
    this.initState()
    this.objectId = object.id
    this.open = true
    this.tags = object.tags
    this.grid = new Grid(GAME.grid.startX, GAME.grid.startY, GAME.grid.width, GAME.grid.height, GAME.grid.nodeSize)
    this.spawnPointX = object.spawnPointX
    this.spawnPointY = object.spawnPointY
    this.initializeGridNodes(object)

    // const gridObject = {x: 0, y: 0, width: this.grid.gridWidth * this.grid.nodeSize, height: this.grid.gridHeight * this.grid.nodeSize}
    // this.camera.setLimitRect(gridObject)

    let gridWidth = (object.width/this.grid.nodeSize)
    let gridHeight = (object.height/this.grid.nodeSize)
    if(gridWidth < GAME.grid.nodeSize) gridWidth = GAME.grid.nodeSize
    if(gridHeight < GAME.grid.nodeSize) gridHeight = GAME.grid.nodeSize
    const zoomMultiplierX = (gridWidth)/16
    const zoomMultiplierY = (gridHeight)/16
    let zoomMultiplier = zoomMultiplierX
    if(zoomMultiplierY > zoomMultiplier) zoomMultiplier = zoomMultiplierY

    const width = zoomMultiplier * HERO.cameraWidth
    const height = zoomMultiplier * HERO.cameraHeight
    if(startAtHero) {
      const hero = GAME.heros[HERO.id]
      this.cameraController = {x: hero.x, width: hero.width, y: hero.y, height: hero.height, zoomMultiplier}
    } else {
      this.cameraController = {x: object.x, width: object.width, y: object.y, height: object.height, zoomMultiplier}
    }
    this.camera.set(this.cameraController)

    this._mouseDownListener = (e) => {
      if(!window.isClickingMap(e.target.className)) return
      if(e.which === 1) {
        if(!this.paused) this.handleMouseDown(event)
      }
    }
    document.body.addEventListener("mousedown", this._mouseDownListener)

    this._mouseMoveListener = (e) => {
      if(!window.isClickingMap(e.target.className)) return
      if(!this.paused && this.open) this.handleMouseMove(event)
    }
    document.body.addEventListener("mousemove", this._mouseMoveListener)

    this._mouseUpListener = (e) => {
      if(!this.paused) this.handleMouseUp(event)
    }
    document.body.addEventListener("mouseup", this._mouseUpListener)

    this.ref.open(object.color || GAME.world.defaultObjectColor || window.defaultObjectColor)
    this.selectColor(object.color)

    window.local.emit('onConstructEditorStart', object)
  }

  handleMouseUp() {
    this.painting = false
    this.erasing = false
  }

  handleMouseDown(event) {
    const { camera, grid, tool } = this
    if(tool === 'paintBrush') {
      this.painting = true
      this.paintNodeXY(this.mousePos.x, this.mousePos.y)
    } else if(tool === 'eraser') {
      this.erasing = true
      this.unfillNodeXY(this.mousePos.x, this.mousePos.y)
    } else if(tool === 'eyeDropper') {
      const color = this.getColorFromNodeXY(this.mousePos.x, this.mousePos.y)
      this.selectedColor = color || GAME.world.defaultObjectColor || window.defaultObjectColor
      this.ref.setColor(this.selectedColor)
    }
  }

  handleMouseMove(event) {
    const { camera, tool } = this

    if(this.painting) this.paintNodeXY(this.mousePos.x, this.mousePos.y)
    if(this.erasing) this.unfillNodeXY(this.mousePos.x, this.mousePos.y)

    this.mousePos.x = ((event.offsetX + camera.x) / camera.multiplier)
    this.mousePos.y = ((event.offsetY + 24 + camera.y) / camera.multiplier)

    this.updateNodeHighlight(this.mousePos)
  }

  selectColor(color) {
    this.selectedColor = color
  }

  toolChange(tool) {
    this.tool = tool
  }

  set(ctx, canvas, camera) {
    this.ctx = ctx
    this.canvas = canvas
    this.camera = camera
    this.camera.allowOcclusion = false

    const initialProps = {
      ref: ref => CONSTRUCTEDITOR.ref = ref,
      selectColor: this.selectColor.bind(this),
      toolChange: this.toolChange.bind(this),
      cancelConstruct: this.cancel,
      finishConstruct: this.finish,
    }

    const container = document.createElement('div')
    container.id = 'ConstructEditorContainer'
    document.body.appendChild(container)
    CONSTRUCTEDITOR.container = container

    // Mount React App
    ReactDOM.render(
      React.createElement(Root, initialProps),
      container
    )
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
          rectangles.push({x: node.x + this.grid.startX, y: node.y + this.grid.startY, width, height, color: node.data.color})
          this.unfillNodesBetween(node.gridX, node.gridY, possibleRectangleEnd.gridX, possibleRectangleEnd.gridY)
        } else {
          rectangles.push({ x: node.x + this.grid.startX, y: node.y + this.grid.startY, width: this.grid.nodeSize, height: this.grid.nodeSize, color: node.data.color })
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

  paintNodeXY(x, y) {
    const { selectedColor, grid } = this
    const { gridX, gridY } = grid.getGridXYfromXY(x, y, { closest: false })
    // console.log(x, y, gridX, gridY)
    this.fillNode(gridX, gridY, selectedColor)
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

  unfillNodeXY(x, y) {
    const { grid } = this
    const { gridX, gridY } = grid.getGridXYfromXY(x, y, { closest: false })
    this.unfillNode(gridX, gridY)
  }

  getColorFromNodeXY(x, y) {
    const { grid } = this
    const { gridX, gridY } = grid.getGridXYfromXY(x, y, { closest: false })
    let color = this.grid.nodes[gridX][gridY].data.color
    return color
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
    const {ctx, canvas, camera, grid, nodeHighlighted, tags, open, tool, selectedColor } = CONSTRUCTEDITOR
    if(!open) return

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawTools.drawGrid(ctx, grid, camera)

    grid.forEachNode((node) => {
      if(node.data.filled) {
        drawTools.drawObject(ctx, {x: node.x + grid.startX, y: node.y  + grid.startY, height: node.height, width: node.width, color: node.data.color, tags }, camera)
      }
    })

    if(tags.outline) {
      ctx.globalCompositeOperation='destination-out';

      grid.forEachNode((node) => {
        if(node.data.filled) {
          drawTools.drawObject(ctx, {x: node.x + grid.startX, y: node.y + grid.startY, height: node.height, width: node.width, tags }, camera)
        }
      })

      ctx.globalCompositeOperation='source-over';
    }

    if(nodeHighlighted) {
      if(tool === 'paintBrush') {
        drawTools.drawObject(ctx, {...nodeHighlighted, color: selectedColor }, camera)
      } else if(tool === 'eraser'){
        drawTools.drawObject(ctx, {...nodeHighlighted, color: GAME.world.backgroundColor || 'black'}, camera)
      } else {
        drawTools.drawObject(ctx, {...nodeHighlighted, color: 'rgba(255,255,255, 0.2)'}, camera)
      }
    }
  }
}

window.CONSTRUCTEDITOR = new ConstructEditor()
