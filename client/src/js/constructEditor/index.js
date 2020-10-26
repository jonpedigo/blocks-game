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
import Swal from 'sweetalert2/src/sweetalert2.js';

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
    this.mapVisible = {
      all: true,
      drawing: true,
      objects: true,
      background: true,
      foreground: true,
      structure: true,
      hero: true
    }
  }

  cancel() {
    this.open = false
    this.close()
    window.local.emit('onConstructEditorClose', false)
  }

  close() {
    document.body.draggable=true
    clearInterval(this._autoSave)
    // document.body.style.cursor = 'default';
    this.canvas.removeEventListener('mousedown', this._mouseDownListener)
    this.canvas.removeEventListener('mousemove', this._mouseMoveListener)
    this.canvas.removeEventListener('mouseup', this._mouseUpListener)
    this.ref.close()
    this.nodesHistory = []
    this.initState()

    // if(object.tags.background) {
    //   PIXIMAP.app.view.style.zIndex = null
    // }
  }


  save() {
    let constructParts = this.combineNodesIntoRectangles()
    constructParts.forEach((part) => {
      part.id = window.uniqueID()
      if(part.color == GAME.world.defaultObjectColor || part.color == window.defaultObjectColor) {
        part.color = null
      }
    })
    const { x, y, width, height } = this.getBoundingBox(constructParts)
    window.local.emit('onConstructEditorSave', {constructParts, x, y, width, height})
    this.initializeGridNodes({constructParts, x, y, width, height})
  }

  finish() {
    this.save()
    this.close()
    window.local.emit('onConstructEditorClose')
  }

  start(object, startColor, startAtHero = false) {
    document.body.draggable=false
    this._autoSave = setInterval(() => {
      // window.local.emit('onSendNotification', { playerUIHeroId: HERO.id, toast: true, text: 'Drawing Autosaved'})
      this.save()
    }, 10000)
    this.initState()
    this.objectId = object.id
    this.open = true
    this.tags = object.tags
    if(PAGE.isLogOpen) PAGE.closeLog()
    if(GAME.world.gameBoundaries) {
      this.grid = new Grid(GAME.world.gameBoundaries.x, GAME.world.gameBoundaries.y, GAME.world.gameBoundaries.width/GAME.grid.nodeSize, GAME.world.gameBoundaries.height/GAME.grid.nodeSize, GAME.grid.nodeSize)
    } else {
      this.grid = new Grid(GAME.grid.startX, GAME.grid.startY, GAME.grid.width, GAME.grid.height, GAME.grid.nodeSize)
    }
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

    let color = startColor || EDITOR.preferences.creatorColorSelected || object.color || GAME.world.defaultObjectColor || window.defaultObjectColor
    this.ref.open(color)
    this.selectColor(color)

    this.nodesHistory = []

    window.local.emit('onConstructEditorStart', object)

    // if(object.tags.background) {
    //   PIXIMAP.app.view.style.zIndex = '1'
    // }
  }

  handleMouseUp() {
    this.painting = false
    this.erasing = false
  }

  handleMouseDown(event) {
    const { camera, grid, tool } = this
    if(event.target.className=== '' && event.target.id.length == 0) return
    if(tool === 'paintBrush') {
      this.nodesHistory.unshift(_.cloneDeep(this.grid.nodes))
      this.painting = true
      this.paintNodeXY(this.mousePos.x, this.mousePos.y)
      this.ref.closeColorPicker()
    } else if(tool === 'eraser') {
      this.nodesHistory.unshift(_.cloneDeep(this.grid.nodes))
      this.erasing = true
      this.unfillNodeXY(this.mousePos.x, this.mousePos.y)
      this.ref.closeColorPicker()
    } else if(tool === 'eyeDropper') {
      const { color, defaultSprite } = this.getDataFromNodeXY(this.mousePos.x, this.mousePos.y)
      this.selectedColor = color || GAME.world.defaultObjectColor || window.defaultObjectColor
      this.selectedTextureId = defaultSprite
      this.ref.setColor(this.selectedColor)
      this.ref.setTextureId(this.selectedTextureId)
    } else if(tool === 'fill-area') {
      this.nodesHistory.unshift(_.cloneDeep(this.grid.nodes))
      this.bucketFill()
      this.ref.closeColorPicker()
    } else if(tool === 'fill-same-images') {
      const { gridX, gridY } = grid.getGridXYfromXY(this.mousePos.x, this.mousePos.y, { closest: false })
      const originalNode = _.cloneDeep(grid.nodes[gridX][gridY])
      this.nodesHistory.unshift(_.cloneDeep(this.grid.nodes))
      this.grid.forEachNode((node) => {
        if(node.data.filled && node.data.defaultSprite === originalNode.data.defaultSprite) {
          node.data.defaultSprite = this.selectedTextureId
          node.data.color = this.selectedColor
        }
      })
      this.ref.closeColorPicker()
    } else if(tool === 'fill-same-color') {
      const { gridX, gridY } = grid.getGridXYfromXY(this.mousePos.x, this.mousePos.y, { closest: false })
      const originalNode = _.cloneDeep(grid.nodes[gridX][gridY])
      this.nodesHistory.unshift(_.cloneDeep(this.grid.nodes))
      this.grid.forEachNode((node) => {
        if(node.data.filled && node.data.color === originalNode.data.color) {
          node.data.color = this.selectedColor
          node.data.defaultSprite = this.selectedTextureId
        }
      })
      this.ref.closeColorPicker()
    } else if(tool === 'fill-empty') {
      this.nodesHistory.unshift(_.cloneDeep(this.grid.nodes))
      this.bucketFill(true)
      this.ref.closeColorPicker()
    }

    CONSTRUCTEDITOR.ref.forceUpdate()

    if(this.nodesHistory.length > 10) this.nodesHistory.length = 10
  }

  handleMouseMove(event) {
    const { camera, tool } = this

    if(event.target.className=== '' && event.target.id.length == 0) {
      this.nodeHighlighted = null
      return
    }

    if(this.painting) this.paintNodeXY(this.mousePos.x, this.mousePos.y)
    if(this.erasing) this.unfillNodeXY(this.mousePos.x, this.mousePos.y)

    const { x, y } = window.convertToGameXY(event)

    this.mousePos.x = ((x + camera.x) / camera.multiplier)
    this.mousePos.y = ((y + camera.y) / camera.multiplier)

    this.updateNodeHighlight(this.mousePos)
  }

  onSelectTextureId = (id, service) => {
    if(service === 'constructEditor') {
      this.selectedTextureId = id
      this.ref.setTextureId(id)
      this.selectedColor = GAME.world.defaultObjectColor
    }
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
      this.grid.updateNode(square.gridX, square.gridY, { color: square.color, defaultSprite: square.defaultSprite, filled: true })
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
            defaultSprite: object.defaultSprite,
          })
        }
      }
    } else {
      squares.push({
        x: object.x,
        y: object.y,
        ...this.grid.getGridXYfromXY(object.x, object.y),
        color: object.color,
        defaultSprite: object.defaultSprite,
      })
    }

    return squares
  }

  combineNodesIntoRectangles() {
    const rectangles = []

    this.grid.forEachNode((node) => {
      if(node.data.filled) {
        if(node.data.defaultSprite || CONSTRUCTEDITOR.tags.seperateParts) {
          rectangles.push({ x: node.x, y: node.y, width: this.grid.nodeSize, height: this.grid.nodeSize, color: node.data.color, defaultSprite: node.data.defaultSprite })
          this.unfillNode(node.gridX, node.gridY)
          return
        }
        const possibleRectangleEnd = this.grid.findFurthestNodeInDirection(node, 'right', 'color', node.data.color)
        if(possibleRectangleEnd && possibleRectangleEnd.gridX !== node.gridX) {
          const width = possibleRectangleEnd.x + this.grid.nodeSize - node.x
          const height = possibleRectangleEnd.y + this.grid.nodeSize - node.y
          rectangles.push({x: node.x, y: node.y, width, height, color: node.data.color, defaultSprite: node.data.defaultSprite })
          this.unfillNodesBetween(node.gridX, node.gridY, possibleRectangleEnd.gridX, possibleRectangleEnd.gridY)
        } else {
          rectangles.push({ x: node.x, y: node.y, width: this.grid.nodeSize, height: this.grid.nodeSize, color: node.data.color, defaultSprite: node.data.defaultSprite })
          this.unfillNode(node.gridX, node.gridY)
        }
      }
    })

    rectangles.forEach((rect1) => {
      rectangles.forEach((rect2) => {
        if(!rect1.claimed && !rect2.claimed && rect1.x === rect2.x && rect1.width === rect2.width && !rect1.defaultSprite && !rect2.defaultSprite && !CONSTRUCTEDITOR.tags.seperateParts) {
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

  bucketFill(empty) {
    const { selectedColor, grid, selectedTextureId } = this
    const { gridX, gridY } = grid.getGridXYfromXY(this.mousePos.x, this.mousePos.y, { closest: false })

    if(!grid.nodes[gridX] || !grid.nodes[gridX][gridY]) return

    const originalNode = _.cloneDeep(grid.nodes[gridX][gridY])
    // if(!originalNode.data.filled) {
    //   return
    //   const { result: yes } = await Swal.fire
    // }
    const nodesSeen = {}
    const findAndFillSimilarNeighbors = (node) => {
      const neighbors = grid.findNeighborNodes(node.gridX, node.gridY)
      nodesSeen[node.id] = true
      if(empty) {
        this.unfillNode(node.gridX, node.gridY)
      } else {
        this.fillNode(node.gridX, node.gridY, selectedColor, selectedTextureId)
      }
      neighbors.forEach((neighbor) => {
        if(nodesSeen[neighbor.id]) {
          return
        }
        if(neighbor.data.filled == originalNode.data.filled && neighbor.data.color == originalNode.data.color &&  neighbor.data.defaultSprite == originalNode.data.defaultSprite) {
          findAndFillSimilarNeighbors(neighbor)
        }
      })
    }
    findAndFillSimilarNeighbors(originalNode)
  }

  paintNodeXY(x, y) {
    const { selectedColor, grid, selectedTextureId } = this
    const { gridX, gridY } = grid.getGridXYfromXY(x, y, { closest: false })
    this.fillNode(gridX, gridY, selectedColor, selectedTextureId)
  }

  unfillNodesBetween(startGridX, startGridY, endGridX, endGridY) {
    for(let gridX = startGridX; gridX < endGridX + 1; gridX++) {
      for(let gridY = startGridY; gridY < endGridY + 1; gridY++) {
        this.unfillNode(gridX, gridY)
      }
    }
  }

  unfillNode(gridX, gridY) {
    this.grid.updateNode(gridX, gridY, {filled: false, color: null, defaultSprite: null })
  }

  unfillNodeXY(x, y) {
    const { grid } = this
    const { gridX, gridY } = grid.getGridXYfromXY(x, y, { closest: false })
    this.unfillNode(gridX, gridY)
  }

  getDataFromNodeXY(x, y) {
    const { grid } = this
    const { gridX, gridY } = grid.getGridXYfromXY(x, y, { closest: false })
    let data = this.grid.nodes[gridX][gridY].data
    return data
  }

  fillNode(gridX, gridY, color, textureId) {
    this.grid.updateNode(gridX, gridY, {filled: true, color, defaultSprite: textureId })
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

  toggleMapVisibility(type) {
    this.mapVisible[type] = !this.mapVisible[type]
    PIXIMAP.resetConstructParts()
  }

  onRender = () => {
    const {ctx, canvas, camera, grid, nodeHighlighted, tags, open, tool, selectedColor } = CONSTRUCTEDITOR
    if(!open) return

    if(!this.mapVisible.all) {
      ctx.fillStyle = GAME.world.backgroundColor || 'black'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    drawTools.drawGrid(ctx, {...grid, color: 'white'}, camera)

    if(!this.mapVisible.drawing) return

    grid.forEachNode((node) => {
      if(node.data.filled) {
        if(node.data.defaultSprite && node.data.defaultSprite !== 'solidcolorsprite') {
          drawTools.drawSprite(ctx, camera, node.data.defaultSprite, {x: node.x, y: node.y, height: node.height, width: node.width, color: node.data.color, tags })
          // drawTools.drawObject(ctx, {x: node.x, y: node.y, height: node.height, width: node.width, color: node.data.color, tags }, camera)
        } else {
          drawTools.drawObject(ctx, {x: node.x, y: node.y, height: node.height, width: node.width, color: node.data.color, tags }, camera)
        }
      }
    })

    if(tags.outline) {
      ctx.globalCompositeOperation='destination-out';

      grid.forEachNode((node) => {
        if(node.data.filled) {
          drawTools.drawObject(ctx, {x: node.x, y: node.y, height: node.height, width: node.width, tags }, camera)
        }
      })

      ctx.globalCompositeOperation='source-over';
    }

    if(nodeHighlighted) {
      if(tool === 'paintBrush' || tool.indexOf('fill') >= 0) {
        if(this.selectedTextureId) {
          drawTools.drawSprite(ctx, camera, this.selectedTextureId, {...nodeHighlighted, color: selectedColor })
        } else drawTools.drawObject(ctx, {...nodeHighlighted, color: selectedColor }, camera)
      } else if(tool === 'eraser'){
        drawTools.drawObject(ctx, {...nodeHighlighted, color: GAME.world.backgroundColor || 'black'}, camera)
      } else {
        drawTools.drawObject(ctx, {...nodeHighlighted, color: 'rgba(255,255,255, 0.2)'}, camera)
      }
    }

    drawTools.drawLoadingScreen(ctx, camera)
  }
}

window.CONSTRUCTEDITOR = new ConstructEditor()
