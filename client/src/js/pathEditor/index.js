import React from 'react'
import ReactDOM from 'react-dom'

import Grid from './grid'
import gridUtil from '../utils/grid'
import drawTools from '../mapeditor/drawTools'
import keyInput from './keyInput'
import Root from './Root.jsx'

//  the modes the editor are grid mode vs point mode
//  the type of each path node can be
  //  direct vs pathfind vs teleport


class PathEditor {
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
    this.pathParts = []
  }

  cancel() {
    this.open = false
    this.close()
    window.local.emit('onPathEditorClose', false)
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
    // const pathParts = []
    // this.grid.forEachNode((node) => {
    //   if(node.data.filled) {
    //     pathParts.push({ index: node.data.index, x: node.x, y: node.y, gridX: node.gridX, gridY: node.gridY, width: this.grid.nodeWidth, height: this.grid.nodeHeight})
    //   }
    // })
    //, x, y, width, height
    const pathParts = this.pathParts.map((part, index) => {
      part.index = index
      part.width = this.grid.nodeWidth
      part.height = this.grid.nodeHeight
      return part
    })
    if(this.grid.nodeWidth !== GAME.grid.nodeSize || this.grid.nodeHeight !== GAME.grid.nodeSize) {
      const { x, y, width, height } = this.getBoundingBox(pathParts)
      const customGridProps = {
        startX: x, startY: y, gridWidth: width/this.grid.nodeWidth, gridHeight: height/this.grid.nodeHeight,
        nodeWidth: this.grid.nodeWidth, nodeHeight: this.grid.nodeHeight
      }
      this.close()
      window.local.emit('onPathEditorClose', {pathParts, customGridProps })
    } else {
      this.close()
      window.local.emit('onPathEditorClose', {pathParts })
    }

  }

  start(object, startAtHero = false) {
    this.initState()
    this.objectId = object.id
    this.open = true
    if(PAGE.isLogOpen) PAGE.closeLog()
    if(GAME.world.gameBoundaries) {
      this.grid = new Grid(GAME.world.gameBoundaries.x, GAME.world.gameBoundaries.y, GAME.world.gameBoundaries.width/GAME.grid.nodeSize, GAME.world.gameBoundaries.height/GAME.grid.nodeSize, object.width, object.height)
    } else {
      this.grid = new Grid(GAME.grid.startX, GAME.grid.startY, GAME.grid.width, GAME.grid.height, object.width, object.height)
    }
    this.spawnPointX = object.spawnPointX
    this.spawnPointY = object.spawnPointY
    this.initializeGridNodes(object)

    // const gridObject = {x: 0, y: 0, width: this.grid.gridWidth * this.grid.nodeSize, height: this.grid.gridHeight * this.grid.nodeSize}
    // this.camera.setLimitRect(gridObject)

    let gridWidth = (object.width/this.grid.nodeWidth)
    let gridHeight = (object.height/this.grid.nodeHeight)
    if(gridWidth < GAME.grid.nodeWidth) gridWidth = GAME.grid.nodeWidth
    if(gridHeight < GAME.grid.nodeHeight) gridHeight = GAME.grid.nodeHeight
    const zoomMultiplierX = (gridWidth)/16
    const zoomMultiplierY = (gridHeight)/16
    let zoomMultiplier = zoomMultiplierX
    if(zoomMultiplierY > zoomMultiplier) zoomMultiplier = zoomMultiplierY
    if(zoomMultiplier < GAME.heros[HERO.id].zoomMultiplier) zoomMultiplier = GAME.heros[HERO.id].zoomMultiplier

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

    let color = 'rgba(0,0,255, 0.4)'
    this.ref.open(color)
    this.selectColor(color)

    window.local.emit('onPathEditorStart', object)
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
      ref: ref => PATHEDITOR.ref = ref,
      selectColor: this.selectColor.bind(this),
      toolChange: this.toolChange.bind(this),
      cancelConstruct: this.cancel,
      finishConstruct: this.finish,
    }

    const container = document.createElement('div')
    container.id = 'ConstructEditorContainer'
    document.body.appendChild(container)
    PATHEDITOR.container = container

    // Mount React App
    ReactDOM.render(
      React.createElement(Root, initialProps),
      container
    )
  }

  initializeGridNodes(object) {
    const squares = []

    if(object.pathParts) {
      if(object.pathParts[0].width !== this.grid.nodeWidth || object.pathParts[0].height !== this.grid.nodeHeight) {
        this.pathParts = []
        return
      }
    }

    this.pathParts = object.pathParts || []
    this.pathParts.forEach((square) => {
      this.grid.updateNode(square.gridX, square.gridY, { color: square.color, filled: true, index: square.index })
    })
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

    if(this.grid.nodes[gridX] && this.grid.nodes[gridX][gridY] && this.grid.nodes[gridX][gridY].data && typeof this.grid.nodes[gridX][gridY].data.index != 'number') {
      this.fillNode(gridX, gridY, selectedColor)
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
    if(this.grid.nodes[gridX] && this.grid.nodes[gridX][gridY] && this.grid.nodes[gridX][gridY].data && typeof this.grid.nodes[gridX][gridY].data.index == 'number') {
      this.grid.forEachNode((node) => {
        if(node.data.index > this.grid.nodes[gridX][gridY].data.index) {
          node.data.index--
        }
      })
      this.grid.updateNode(gridX, gridY, {filled: false, color: null, index: null})
      this.pathParts.splice(this.grid.nodes[gridX][gridY].data.index, 1)
    }
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
    this.grid.updateNode(gridX, gridY, {filled: true, color, index: this.pathParts.length})
    this.pathParts.push({
      x: (gridX * this.grid.nodeWidth) + this.grid.startX,
      y: (gridY * this.grid.nodeHeight) + this.grid.startY,
      gridX,
      gridY,
      index: this.pathParts.length,
    })
  }

  updateNodeHighlight(location) {
    const { x,y } = this.grid.snapXYToGrid(location.x, location.y, { closest: false })

    let mouseLocation = {
      x,
      y,
      width: this.grid.nodeWidth,
      height: this.grid.nodeHeight
    }

    this.nodeHighlighted = mouseLocation
  }

  onUpdate(delta) {
    const { open, camera, cameraController} = PATHEDITOR
    if(!open) return

    keyInput.update(delta)

    camera.set(cameraController)
  }

  onRender() {
    const {ctx, canvas, camera, grid, nodeHighlighted, open, tool, selectedColor } = PATHEDITOR
    if(!open) return

    // ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
    // ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawTools.drawGrid(ctx, grid, camera)

    grid.forEachNode((node) => {
      if(node.data.filled) {
        const object = {x: node.x, y: node.y, height: node.height, width: node.width, color: 'rgba(0,170,0, 0.4)', opacity: .4, characterTextInside: node.data.index + 1 }
        drawTools.drawObject(ctx, object, camera)
      }
    })

    if(nodeHighlighted) {
      if(tool === 'paintBrush') {
        drawTools.drawObject(ctx, {...nodeHighlighted, color: 'rgba(0,170,0, .6)', opacity: .4 }, camera)
      } else if(tool === 'eraser'){
        drawTools.drawObject(ctx, {...nodeHighlighted, color: GAME.world.backgroundColor || 'black'}, camera)
      } else {
        drawTools.drawObject(ctx, {...nodeHighlighted, color: 'rgba(255,255,255, 0.2)'}, camera)
      }
    }
  }
}

window.PATHEDITOR = new PathEditor()
