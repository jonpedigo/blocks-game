import drawTools from './drawTools';

function drawTextCenter(ctx, object, color, text, camera) {
  ctx.fillStyle = color || "rgb(250, 250, 250)";
  let fontSize = 20*(camera.multiplier)
  if(fontSize < 12) fontSize = 12
  ctx.font = `${fontSize}px Courier New`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  let lineWidth = (object.width - fontSize)*camera.multiplier
  let { width, height } = window.measureWrapText(ctx, text, 0, 0, lineWidth, fontSize)
  window.wrapText(ctx, text, (object.x+(object.width/2))*camera.multiplier - camera.x, ((object.y+(object.height/2))*camera.multiplier - camera.y - (height/2)), lineWidth, fontSize)
}

function update() {

  if(MAPEDITOR.paused) return
  let ctx = MAPEDITOR.ctx
  let camera = MAPEDITOR.camera
  if(!ctx) return

  if(PAGE.role.isAdmin) {
    drawTools.drawGrid(ctx, {...GAME.grid, gridWidth: GAME.grid.width, gridHeight: GAME.grid.height, color: '#999' }, camera)
  }

  if(PAGE.role.isAdmin || !GAME.gameState.started) {
    ctx.setLineDash([5, 15]);
    GAME.objects.forEach((object) => {
      if(object.tags.invisible || object.tags.light || object.tags.emitter) {
        drawTools.drawObject(ctx, {...object, tags: {invisible: false, outline: true }, color: 'rgba(255,255,255,1)'}, camera)
      }
    })
    ctx.setLineDash([]);
  }

  const { draggingObject, copiedObject, objectHighlighted, objectHighlightedChildren, resizingObject, pathfindingLimit, draggingRelativeObject } = MAPEDITOR

  if((PAGE.role.isAdmin || !GAME.gameState.started) && objectHighlighted && objectHighlighted.tags && (objectHighlighted.tags.hero)) {
    const {x, y} = HERO.getSpawnCoords(objectHighlighted)
    drawTools.drawObject(ctx, {x: x, y: y - 20.5, width: 1, height: 40, color: 'white'}, camera)
    drawTools.drawObject(ctx, {x: x - 20.5, y: y, width: 40, height: 1, color: 'white'}, camera)
  }

  if((PAGE.role.isAdmin || !GAME.gameState.started) && objectHighlighted && !objectHighlighted.CREATOR) {
    if(objectHighlighted.tags && objectHighlighted.tags.invisible && objectHighlightedChildren.length === 0 && (!resizingObject || objectHighlighted.id !== resizingObject.id)) {
      let color = 'rgba(255,255,255,0.2)'
      drawTools.drawFilledObject(ctx, {...objectHighlighted, color}, camera)
    } else {
      let color = 'white'
      drawTools.drawBorder(ctx, {...objectHighlighted, color}, camera)
    }

    // if(objectHighlighted.tags && objectHighlighted.tags.subObject) {
    //   const
    //   drawTools.drawFilledObject(ctx, {...objectHighlighted, color x: }, camera)
    // } else {
    // }

    if(PAGE.role.isAdmin || !GAME.gameState.started) {
      if(objectHighlighted.path) {
        let pathX, pathY, pathWidth, pathHeight;

        objectHighlighted.path.forEach((path, i) => {
          if(objectHighlighted.pathfindingGridId && GAME.objectsById[objectHighlighted.pathfindingGridId]) {
            const grid = GAME.objectsById[objectHighlighted.pathfindingGridId].customGridProps
            pathX = (path.x * grid.nodeWidth) + grid.startX
            pathY = (path.y * grid.nodeHeight) + grid.startY
            pathWidth = grid.nodeWidth
            pathHeight = grid.nodeHeight
          } else {
            pathX = (path.x * GAME.grid.nodeSize) + GAME.grid.startX
            pathY = (path.y * GAME.grid.nodeSize) + GAME.grid.startY
            pathWidth = GAME.grid.nodeSize
            pathHeight = GAME.grid.nodeSize
          }
          const object = {x: pathX, y: pathY, width: pathWidth, height: pathHeight, color: 'rgba(0,170,0, .6)' }
          drawTools.drawObject(ctx, object, camera)
        });
      }

      if(objectHighlighted.pathParts) {
        objectHighlighted.pathParts.forEach((part, i) => {
          const object = {x: part.x, y: part.y, height: part.height, width: part.width, color: 'rgba(0,170,0, .6)', opacity: .4, characterTextInside: part.index + 1 }
          drawTools.drawObject(ctx, object, camera)
        });
      }

      if(objectHighlighted._pfGrid) {
        const _pfGrid = objectHighlighted._pfGrid
        const customGridProps = objectHighlighted.customGridProps
        drawTools.drawGrid(ctx, {...objectHighlighted.customGridProps, color:'rgba(0,170,0, 1)', normalLineWidth: .6, specialLineWidth: .6}, camera)
        drawTools.drawPFGrid(ctx, camera, _pfGrid, customGridProps, { style: 'alt'})
      }

      const {x, y} = OBJECTS.getSpawnCoords(objectHighlighted)
      drawTools.drawObject(ctx, {x: x, y: y - 20.5, width: 1, height: 40, color: 'white'}, camera)
      drawTools.drawObject(ctx, {x: x - 20.5, y: y, width: 40, height: 1, color: 'white'}, camera)

      if(objectHighlighted.targetXY) {
        let {x, y}= objectHighlighted.targetXY
        if(!x) x= objectHighlighted.x
        if(!y) y= objectHighlighted.y

        drawTools.drawVertice(ctx, { thickness: 4, color: 'rgba(0,170,0, .6)', a: { x: objectHighlighted.x, y: objectHighlighted.y}, b: {x: x, y: y}}, camera)
      }
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

  if(MAPEDITOR.groupGridHighlights && (PAGE.role.isAdmin || GAME.heros[HERO.id] && GAME.heros[HERO.id].flags && GAME.heros[HERO.id].flags.showOtherUsersMapHighlight)) {
    Object.keys(MAPEDITOR.groupGridHighlights).forEach((heroId) => {
      if(heroId !== HERO.originalId) {
        drawTools.drawBorder(ctx, {...MAPEDITOR.groupGridHighlights[heroId], color: 'rgba(255,255,255,0.4)'}, camera)
      }
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
    } else if(currentObject.defaultSprite && currentObject.defaultSprite !== 'solidcolorsprite'){
      drawTools.drawSprite(ctx, camera, currentObject.defaultSprite, currentObject)
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

  if(PAGE.role.isAdmin && GAME.pfgrid) drawTools.drawPFGrid(ctx, camera, GAME.pfgrid, { nodeWidth: GAME.grid.nodeSize, nodeHeight: GAME.grid.nodeSize, startX: GAME.grid.startX, startY: GAME.grid.startY})

  if(OBJECTS.editingId) {
    const editingObject = OBJECTS.getObjectOrHeroById(OBJECTS.editingId)
    drawTools.drawBorder(ctx, {...editingObject, color: '#0A0'}, camera, {thickness: 5})
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
      if(PAGE.role.isAdmin) {
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
  }


  if(PAGE.role.isAdmin) {
    GAME.heroList.forEach((hero) => {
      if(!GAME.world.lockCamera || !GAME.world.lockCamera.x || ((HERO.cameraWidth * hero.zoomMultiplier)) < GAME.world.lockCamera.width) {
        drawTools.drawBorder(ctx, {color: '#0A0', x: hero.x - (HERO.cameraWidth * hero.zoomMultiplier)/2 + hero.width/2, y: hero.y - (HERO.cameraHeight * hero.zoomMultiplier)/2 + hero.height/2, width: (HERO.cameraWidth * hero.zoomMultiplier), height: (HERO.cameraHeight * hero.zoomMultiplier)}, camera)
      }

      if(hero.reachablePlatformHeight && (hero.tags.gravityY || GAME.world.allMovingObjectsHaveGravityY)) {
        let y = (hero.y + hero.height)
        let x = hero.x - hero.reachablePlatformWidth
        let width = (hero.reachablePlatformWidth * 2) + (hero.width)
        let height = hero.reachablePlatformHeight
        let color = 'rgba(0, 150, 0, 0.3)'
        drawTools.drawObject(ctx, {x, y, width, height, color}, camera)
      }

      if(hero.flags.isAdmin) {
        drawTextCenter(ctx, hero, '#0A0', 'admin', camera)
      } else {
        drawTextCenter(ctx, hero, '#0A0', 'player', camera)
      }
    });

    const editingHero = GAME.heros[HERO.editingId]
    drawTools.drawBorder(ctx, {...editingHero, color: '#0A0'}, camera, {thickness: 5})
  }

  const gameEligibleForLoading = (GAME.grid.width > 80 || GAME.objects.length > 300)
  const loadingState = (PAGE.loadingGame)
  PAGE.loadingScreen = gameEligibleForLoading && loadingState

  const hero = GAME.heros[HERO.id]
  if(hero && hero.animationZoomMultiplier) PAGE.loadingScreen = false

  if(PAGE.loadingScreen) {
    ctx.fillStyle = "#222"
    ctx.fillRect(0, 0, MAP.canvas.width, MAP.canvas.height)
    // if(PAGE.role.isAdmin) {
      drawTools.drawGrid(ctx, {...GAME.grid, gridWidth: GAME.grid.width, gridHeight: GAME.grid.height }, camera)
    // }
    MAPEDITOR.loaderElement.style.display = "block"
  } else {
    MAPEDITOR.loaderElement.style.display = "none"
  }
}

export default {
  update
}
