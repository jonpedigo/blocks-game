// this is gonna be a pretty crazy file
// basically this is a hidden, high-performance physics system for objects on the grid
// If we want intelligent objects, they have to be on a grid.
// If I create a grid using the procedural system it very much means I want to use an alternate physics system
// If we decide to use this physics system that means we need to update it constantly.
// we have a couple choices for a physics grid..
// only visual
// pathfinding around static objects
// pathfinding around static and moving objects
  // I think that the editor just tells the client the size of the grid, etc
  // but then the client when pathfinding is enabled, it starts running on a tick
  // on that tick it updates the pathfinding on the grid and sets new goal points for all objects
  // this is outside of the physics updating.. Does it perhaps just tell physics which way its going?
  // does it just give it velocity in the right direction? OK! why not?
  // ok so pathfinding just sets velocity and

// UPDATE
  // basically this system can be used under two conditions
  // 1) No new obstacles are made
  // 2) All obstacles that are made are aligned to the grid

import gridTool from './grid.js'

const PF = require('pathfinding')
const finder = new PF.AStarFinder()
window.pfgrid = null

function convertGridToPathfindingGrid(grid, saveToWindow = true) {
  const pfgrid = new PF.Grid(grid.length, grid[0].length);

  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if(grid[x][y].hasObstacle) {
        pfgrid.setWalkableAt(x, y, false);
      }
    }
  }

  if(saveToWindow) {
    window.pfgrid = pfgrid
  }

  return pfgrid;
}

function findOpenPath({ fromPosition, toPosition, prioritizeNear = { x: fromPosition.x, y: fromPosition.x }, onFail = () => {} }) {
  const fromX = fromPosition.x
  const fromY = fromPosition.y
  const toX = toPosition.x
  const toY = toPosition.y
  const openGrid = findOpenGridNear({ position: toPosition, prioritizeNear: {x: prioritizeNear.x, y: prioritizeNear.y}, onFail})
  return finder.findPath(fromX, fromY, openGrid.x, openGrid.y, window.pfgrid);
}

function findPath({fromPosition, toPosition}) {
  const fromX = fromPosition.x
  const fromY = fromPosition.y
  const toX = toPosition.x
  const toY = toPosition.y
  return finder.findPath(fromX, fromY, toX, toY, window.pfgrid);
}

// searches nearby grids for open space
// returns null on fail
function findOpenGridNear({ position, onlySurrounding = false, prioritizeNear, onFail = () => {} }){
  const { x, y } = position

  window.pfgrid = _convertGridToPathfindingGrid(window.grid)
  // console.log('looking for open grid near', x, y)

  if(!onlySurrounding && isGridWalkable(x, y)) return { x, y }

  const nearbyGrids = [
    { x, y: y-1},
    { x: x+1, y},
    { x: x, y: y+1},
    { x: x-1, y},
  ]

  if(prioritizeNear) {
    nearbyGrids.sort((a, b) => sortByDistance(a, b, prioritizeNear))
  }

  for (let i = 0; i < nearbyGrids.length; i++) {
    let { x, y } = nearbyGrids[i]
    if(isGridWalkable(x, y)) return nearbyGrids[i]
  }

  console.log('failed to find nearby grid for object');
  onFail()
  // EVERYTHING SHOULD HAVE A DEFAULT X THAT WHEN IT FAILS IT MUST RETURN TO AND BEGIND EFAULT BEHJAVIOR
  return { x: 10, y: 10}
}

// will search entire map before it gives up.
// using during runTime could fail
function forceFindOpenGridNear({position, level = 0}){
  const {x, y} = position

  if(level == 0) {
    window.pfgrid = _convertGridToPathfindingGrid(window.grid)
  }

  console.log('looking for open grid near', x, y)

  if(isGridWalkable(x, y)) return { x, y }

  const nearbyGrids = [
    { x, y: y-1},
    { x: x+1, y: y-1},
    { x: x+1, y},
    { x: x+1, y: y+1},
    { x: x, y: y+1},
    { x: x-1, y: y+1},
    { x: x-1, y},
    { x: x-1, y: y-1},
  ]

  for (let i = 0; i < nearbyGrids.length; i++) {
    let { x, y } = nearbyGrids[i]
    if(isGridWalkable(x, y)) return nearbyGrids[i]
  }

  console.log('failed to find nearby grid for object going recursive..')
  const nextGrid = nearbyGrids[Math.random() * nearbyGrids.length]
  forceFindOpenGridNear(nextGrid.x, nextGrid.y, level++)
}

function isGridWalkable( x, y) {
  if(!window.pfgrid.nodes[y]) return false
  if(!window.pfgrid.nodes[y][x]) return false
  if(!window.pfgrid.nodes[y][x].walkable) return false
  return true
}

function walkAround(object) {
  const { x, y } = gridTool.convertToGridXY(object)

  let direction = ''
  if(object.direction) {
    direction = object.direction
  }

  if(Math.random() > .5){
    // go right
    if(Math.random() > .5 && direction !=='left'){
      if ( isGridWalkable(x + 1, y) ){
        object.direction = 'right'
        return { x: x + 1, y: y}
      }
    }

    // go left
    if(direction !== 'right') {
      if ( isGridWalkable(x - 1, y) ) {
        object.direction = 'left'
        return { x: x - 1, y: y}
      }
    }
  }

  // go down
  if(Math.random() > .5 && direction !== 'up'){
    if ( isGridWalkable(x, y + 1) ){
      object.direction = 'down'
      return { x: x, y: y + 1}
    }
  }

  // go up
  if(direction !== 'down') {
    if ( isGridWalkable(x, y - 1) ){
      object.direction = 'up'
      return { x: x, y: y - 1}
    }
  }

  // random failed, find somewhere to move
  object.direction = ''
  console.log('couldnt do rando movement, finding space')
  const nearbyGrids = [
    { x, y: y-1},
    { x: x+1, y},
    { x: x, y: y+1},
    { x: x-1, y},
  ]

  if(Math.random() > .5){
    nearbyGrids.reverse()
  }

  for (let i = 0; i < nearbyGrids.length; i++) {
    let { x, y } = nearbyGrids[i]
    if (isGridWalkable(nearbyGrids[i].x, nearbyGrids[i].y)) {
      return nearbyGrids[i]
    }
  }

  console.log('found nowhere to move')
  return { x, y }
}

function getDistance(coords, comparedTo) {
  return Math.abs(comparedTo.x - coords.x) +  Math.abs(comparedTo.y - coords.y)
}

function sortByDistance(coordsA, coordsB, comparedTo){
  const diffA = getDistance(coordsA, comparedTo)
  const diffB = getDistance(coordsB, comparedTo)
  if(diffA < diffB) return -1
  else if(diffA > diffB)return 1
  else return 0
}

function goombaWalk(object) {
  const { x, y } = gridTool.convertToGridXY(object)
  if(!object.direction) {
    object.direction = 'right'
  }

  if(object.direction === 'right' ) {
    if(isGridWalkable(x + 1, y)) {
      object.path = [{ x: x + 1, y: y}]
    } else {
      object.direction = 'left'
    }
  }

  if(object.direction === 'left') {
    if(isGridWalkable(x - 1, y)) {
      object.path = [{ x: x - 1, y: y}]
    } else {
      object.direction = 'right'
    }
  }
}

export default {
  convertGridToPathfindingGrid,
  walkAround,
  goombaWalk
}


// function findItemNearby({position, tags, prioritizeNear, distance = { x: 1, y: 1} }) {
//   if(!Array.isArray(tags)) tags = [tags]
//
//   // console.log(position)
//
//   const { x, y } = position
//   let matchingItems = getGameItemsFromGridByTags({ position, tags})
//   if (matchingItems.length) {
//     return matchingItems
//   }
//
//   const startX = position.x - distance.x/2
//   const startY = position.y - distance.y/2
//   const nearbyGrids = []
//   for(let xI = startX; xI < startX + distance.x; xI++) {
//     for(let yI = startX; yI < startY + distance.y; yI++) {
//       nearbyGrids.push({
//         x: xI, y: yI
//       })
//     }
//   }
//
//   if(prioritizeNear) {
//     nearbyGrids.sort((a, b) => sortByDistance(a, b, prioritizeNear))
//   }
//
//   for (let i = 0; i < nearbyGrids.length; i++) {
//     let { x, y } = nearbyGrids[i]
//     let matchingItems = getGameItemsFromGridByTags({ position: nearbyGrids[i], tags})
//     if(matchingItems.length) return matchingItems
//   }
//
//   console.log(`found no items of tag ${tags} nearby x:${x}y:${y}`)
//   return []
// }
//
// function getGameItemsFromGridByTag({ position, tag}) {
//   const {x, y} = position
//   return grid[x][y].filter(({tags}) => {
//     if(!tags) return false
//     return tags.indexOf(tag) >= 0
//   })
// }
//
// function getGameItemsFromGridByTags({position, tags}) {
//   const { x, y } = position
//   if(!grid[x]) return []
//   if(!grid[x][y]) return []
//   return grid[x][y].filter((item) => {
//     if(!item.tags) return false
//     return tags.some(tag => item.tags.indexOf(tag) >= 0)
//   })
// }
