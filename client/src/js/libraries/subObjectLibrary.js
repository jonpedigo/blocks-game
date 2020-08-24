window.local.on('onFirstPageGameLoaded', () => {

  window.subObjectLibrary = {
    spear: {
      // x: 0, y: 0, width: 6, height: 30,
        x: 0, y: 0, width: 40, height: 40,
        relativeX: GAME.grid.nodeSize/5,
        relativeY: -GAME.grid.nodeSize,
        relativeWidth: -GAME.grid.nodeSize * .75,
        relativeHeight: -GAME.grid.nodeSize + 40,
      // opacity: 1,
      color: 'yellow',
      tags: { monsterDestroyer: true, rotateable: true, relativeToAngle: true, relativeToDirection: true },
    },
    gun: {
      x: 0, y: 0, width: 40, height: 5,
      relativeX: GAME.grid.nodeSize/5,
      relativeY: -GAME.grid.nodeSize,
      relativeWidth: -GAME.grid.nodeSize * .75,
      relativeHeight: -GAME.grid.nodeSize * .75,
      tags: { monsterDestroyer: true, rotateable: true, relativeToAngle: true, relativeToDirection: true },
      actionButtonBehavior: 'shoot',
      actionProps: {
        shootTimeout: 2,
        shootTags: {
          monsterDestroyer: true,
        }
      }
    }
  }

})
