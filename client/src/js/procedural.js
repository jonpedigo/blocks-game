import generateMaze from 'generate-maze-by-clustering'
const parameters = {

}


window.mazeWidthMultiplier = 2;
function genMaze (width = 10, height = 10, xOff, yOff) {
  let maze = generateMaze([height, width])

  return maze.cells.reduce((acc, row, y) => {
    acc.push(...row.map((cell, x) => {
      if(cell.isBroken) {
        return null
      } else if(cell.position) {
        return {id: Date.now() + '-maze-' + y + ',' + x, x: xOff + cell.position[0] * (window.gridNodeSize * mazeWidthMultiplier), y: yOff + cell.position[1] * (window.gridNodeSize * mazeWidthMultiplier), width: (window.gridNodeSize * mazeWidthMultiplier), height: (window.gridNodeSize * mazeWidthMultiplier), tags: { obstacle: true }}
      }
    }).filter((cell) => !!cell))

    return acc
  }, [])
}

export default {
  genMaze,
}
