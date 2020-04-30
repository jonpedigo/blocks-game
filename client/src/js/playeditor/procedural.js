import generateMaze from 'generate-maze-by-clustering'
const parameters = {

}

function genMaze (width = 10, height = 10, xOff, yOff) {
  let maze = generateMaze([height, width])
  let mazeWidthMultiplier = 1;

  return maze.cells.reduce((acc, row, y) => {
    acc.push(...row.map((cell, x) => {
      if(cell.isBroken) {
        return null
      } else if(cell.position) {
        return {id: window.uniqueID() + '-maze-' + y + ',' + x, x: xOff + cell.position[0] * (w.editingGame.grid.nodeSize * mazeWidthMultiplier), y: yOff + cell.position[1] * (w.editingGame.grid.nodeSize * mazeWidthMultiplier), width: (w.editingGame.grid.nodeSize * mazeWidthMultiplier), height: (w.editingGame.grid.nodeSize * mazeWidthMultiplier), tags: { obstacle: true, stationary: true }}
      }
    }).filter((cell) => !!cell))

    return acc
  }, [])
}

export default {
  genMaze,
}
