import collisions from '../utils/collisions'

class Grid {
  constructor(startX, startY, gridWidth, gridHeight, nodeSize) {
    this.startX = startX
    this.startY = startY
    this.nodeSize = nodeSize
    this.gridWidth = gridWidth
    this.gridHeight = gridHeight
    this.x = startX
    this.y = startY
    this.width = startX + (gridWidth * nodeSize)
    this.height = startX + (gridHeight * nodeSize)
    this.nodes = this.generateNodes(gridWidth, gridHeight)
  }

  getGridXYfromXY(x, y) {
    // pretend we are dealing with a 0,0 plane
    x = x - this.startX
    y = y - this.startY

    let diffX = x % this.nodeSize
    x -= diffX
    let gridX = x/this.nodeSize

    let diffY = y % this.nodeSize
    y -= diffY
    let gridY = y/this.nodeSize

    // const gridX = Math.floor(x/this.nodeSize)
    // const gridY = Math.floor(y/this.nodeSize)

    return {
      gridX,
      gridY
    }
  }

  generateNodes(gridWidth, gridHeight) {
    const grid = []

    for(var i = 0; i < gridWidth; i++) {
      grid.push([])
      for(var j = 0; j < gridHeight; j++) {
        grid[i].push({x: this.startX + (i * this.nodeSize), y: this.startY + (j * this.nodeSize), width: this.nodeSize, height: this.nodeSize, gridX: i, gridY: j, data: {}})
      }
    }

    return grid
  }

  updateNode(gridX, gridY, update) {
    window.mergeDeep(this.nodes[gridX][gridY].data, update)
  }

  updateNodeXY(x, y, update) {
    const { gridX, gridY } = this.getGridXYfromXY(x, y)
    this.updateNode(gridX, gridY, update)
  }

  findNeighborNodes(gridX, gridY) {
    const nodes = this.nodes
    const neighbors = []

    ['up', 'left', 'down', 'right'].forEach((dir) => {
      let neighbor = this.findNeighborInDirection(gridX, gridY, dir)
      if(neighbor) neighbors.push(neighbor)
    })

    return neighbors
  }

  findNeighborInDirection(gridX, gridY, direction) {
    const nodes = this.nodes

    if(direction === 'up' && nodes[gridX][gridY - 1]) {
      return nodes[gridX][gridY - 1]
    }

    if(direction === 'down' && nodes[gridX][gridY + 1]) {
      return nodes[gridX][gridY + 1]
    }

    if(direction === 'right' && nodes[gridX + 1] && nodes[gridX + 1][gridY]) {
      return nodes[gridX + 1][gridY]
    }

    if(direction === 'left' && nodes[gridX - 1] && nodes[gridX - 1][gridY]) {
      return nodes[gridX - 1][gridY]
    }
  }

  findFurthestNodeInDirection(startNode, direction, targetProp, targetValue) {
    const neighbor = this.findNeighborInDirection(startNode.gridX, startNode.gridY, direction)
    if(neighbor) {
      if(neighbor.data && neighbor.data.filled && neighbor.data[targetProp] === targetValue && !neighbor.data.defaultSprite) {
        return this.findFurthestNodeInDirection(neighbor, direction, targetProp, targetValue)
      } else {
        return startNode
      }
    } else return null
  }

  removeNodeData(gridX, gridY) {
    this.nodes[gridX][gridY].data = {}
  }

  forEachNode(fx) {
    for(var i = 0; i < this.gridWidth; i++) {
      for(var j = 0; j < this.gridHeight; j++) {
        fx(this.nodes[i][j])
      }
    }
  }
}

export default Grid
