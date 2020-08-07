import drawTools from './drawTools';

function update() {

  if(MAPEDITOR.paused) return
  let ctx = MAPEDITOR.ctx
  let camera = MAPEDITOR.camera
  if(!ctx) return

  if(PAGE.role.isAdmin) {
    drawTools.drawGrid(ctx, {...GAME.grid, gridWidth: GAME.grid.width, gridHeight: GAME.grid.height, color: 'white' }, camera)
  }

  // if(PAGE.role.isAdmin || PAGE.role.isCreator) {
    ctx.setLineDash([5, 15]);
    GAME.objects.forEach((object) => {
      if(object.tags.invisible || object.tags.light || object.tags.emitter) {
        drawTools.drawObject(ctx, {...object, tags: {invisible: false, outline: true }, color: 'rgba(255,255,255,1)'}, camera)
      }
    })
    ctx.setLineDash([]);
  // }

  const { draggingObject, copiedObject, objectHighlighted, objectHighlightedChildren, resizingObject, pathfindingLimit, draggingRelativeObject } = MAPEDITOR

  if(!GAME.gameState.started && objectHighlighted && objectHighlighted.tags && (objectHighlighted.tags.hero)) {
    const {x, y} = HERO.getSpawnCoords(objectHighlighted)
    drawTools.drawObject(ctx, {x: x, y: y - 20.5, width: 1, height: 40, color: 'white'}, camera)
    drawTools.drawObject(ctx, {x: x - 20.5, y: y, width: 40, height: 1, color: 'white'}, camera)
  }

  if(objectHighlighted && !objectHighlighted.CREATOR) {
    let color = 'rgba(255,255,255,0.2)'
    if(objectHighlighted.tags && objectHighlighted.tags.invisible && objectHighlightedChildren.length === 0 && (!resizingObject || objectHighlighted.id !== resizingObject.id)) {
      color = 'rgba(255,255,255,0.2)'
    }

    // if(objectHighlighted.tags && objectHighlighted.tags.subObject) {
    //   const
    //   drawTools.drawFilledObject(ctx, {...objectHighlighted, color x: }, camera)
    // } else {
      drawTools.drawFilledObject(ctx, {...objectHighlighted, color}, camera)
    // }

    if(!GAME.gameState.started) {
      const {x, y} = OBJECTS.getSpawnCoords(objectHighlighted)
      drawTools.drawObject(ctx, {x: x, y: y - 20.5, width: 1, height: 40, color: 'white'}, camera)
      drawTools.drawObject(ctx, {x: x - 20.5, y: y, width: 40, height: 1, color: 'white'}, camera)
    }
  }

  if(objectHighlightedChildren) {
    let color = 'rgba(255,255,255,0.1)'
    objectHighlightedChildren.forEach((object) => {
      if(object.tags && object.tags.invisible) {
        color = 'rgba(255,255,255,0.1)'
      }
      drawTools.drawFilledObject(ctx, {...object, color}, camera)
    })
  }

  let currentObject = resizingObject || pathfindingLimit || draggingObject || copiedObject || draggingRelativeObject
  if(objectHighlighted && objectHighlighted.CREATOR) {
    currentObject = objectHighlighted
  }
  if(currentObject) {
    if(currentObject.tags && currentObject.tags.invisible || currentObject.tags.light || currentObject.tags.emitter) {
      ctx.setLineDash([5, 15]);
      drawTools.drawObject(ctx, {...currentObject, tags: { invisible: false, outline: true }, color: 'rgba(255,255,255,1)'}, camera)
      ctx.setLineDash([]);
    } else {
      drawTools.drawObject(ctx, currentObject, camera)
      if(currentObject.constructParts) {
        drawTools.drawConstructParts(ctx, camera, currentObject)
      }
    }
  }

  if(draggingRelativeObject) {
    const owner = OBJECTS.getOwner(draggingRelativeObject)
    drawTools.drawLine(ctx, { x: owner.x + owner.width/2, y: owner.y + owner.height/2 }, { x: draggingRelativeObject.x + draggingRelativeObject.width/2, y: draggingRelativeObject.y + draggingRelativeObject.height/2 }, {color: 'white', thickness: 5 }, camera)
  }

  if(PAGE.role.isAdmin && GAME.world.lockCamera) {
    drawTools.drawBorder(ctx, { color: '#0A0', ...GAME.world.lockCamera }, camera, { thickness: 2} );
  }

  if(GAME.world && GAME.world.gameBoundaries) {
    if(GAME.world.gameBoundaries.behavior == 'purgatory') {
      if(PAGE.role.isAdmin) {
        ctx.strokeStyle='red';
        let valueRed = {
          x: GAME.world.gameBoundaries.x-1,
          y: GAME.world.gameBoundaries.y-1,
          width: GAME.world.gameBoundaries.width+1,
          height: GAME.world.gameBoundaries.height+1,
          color: 'red'
        }
        drawTools.drawBorder(ctx, valueRed, camera);
        ctx.strokeStyle='white';
        const hero = GAME.heros[HERO.id]
        let valueWhite = {
          x: GAME.world.gameBoundaries.x + ((HERO.cameraWidth * hero.zoomMultiplier)/2),
          y: GAME.world.gameBoundaries.y + ((HERO.cameraHeight * hero.zoomMultiplier)/2),
          width: GAME.world.gameBoundaries.width - ((HERO.cameraWidth * hero.zoomMultiplier)),
          height: GAME.world.gameBoundaries.height - ((HERO.cameraHeight * hero.zoomMultiplier)),
          color: 'white'
        }
        drawTools.drawBorder(ctx, valueWhite, camera);
      }
    } else {
      ctx.strokeStyle='white';
      let value = {
        x: GAME.world.gameBoundaries.x-1,
        y: GAME.world.gameBoundaries.y-1,
        width: GAME.world.gameBoundaries.width+1,
        height: GAME.world.gameBoundaries.height+1,
        color: 'white'
      }
      drawTools.drawBorder(ctx, value, camera);
    }
  }

  if(PAGE.role.isAdmin) {
    GAME.heroList.forEach((hero) => {
      if(!GAME.world.lockCamera || !GAME.world.lockCamera.x || ((HERO.cameraWidth * hero.zoomMultiplier)) < GAME.world.lockCamera.width) {
        drawTools.drawBorder(ctx, {color: '#0A0', x: hero.x - (HERO.cameraWidth * hero.zoomMultiplier)/2 + hero.width/2, y: hero.y - (HERO.cameraHeight * hero.zoomMultiplier)/2 + hero.height/2, width: (HERO.cameraWidth * hero.zoomMultiplier), height: (HERO.cameraHeight * hero.zoomMultiplier)}, camera)
      }

      if(hero.reachablePlatformHeight && hero.tags.gravityY) {
        let y = (hero.y + hero.height)
        let x = hero.x - hero.reachablePlatformWidth
        let width = (hero.reachablePlatformWidth * 2) + (hero.width)
        let height = hero.reachablePlatformHeight
        let color = 'rgba(50, 255, 50, 0.5)'
        drawTools.drawObject(ctx, {x, y, width, height, color}, camera)
      }
    });
  }

  const gameEligibleForLoading = (GAME.grid.width > 80 || GAME.objects.length > 300)
  const loadingState = (PAGE.loadingGame)
  PAGE.loadingScreen = gameEligibleForLoading && loadingState

  const hero = GAME.heros[HERO.id]
  if(hero && hero.animationZoomMultiplier) PAGE.loadingScreen = false

  if(PAGE.loadingScreen) {
    ctx.fillStyle = "#222"
    ctx.fillRect(0, 0, MAP.canvas.width, MAP.canvas.height)
    if(PAGE.role.isAdmin) {
      drawTools.drawGrid(ctx, {...GAME.grid, gridWidth: GAME.grid.width, gridHeight: GAME.grid.height }, camera)
    }
  }
}

export default {
  update
}
