import gridTool from '../grid.js'
import collisions from '../collisions'

function init() {
  window.clickStart = {
    x: null,
    y: null,
  }
  window.mousePos = {
    x: null,
    y: null,
  }

  window.document.getElementById('game-canvas').addEventListener("mousemove", function(e) {
    window.mousePos.x = ((e.offsetX + window.camera.x)/window.scaleMultiplier)
    window.mousePos.y = ((e.offsetY + window.camera.y)/window.scaleMultiplier)
  })

  window.document.getElementById('game-canvas').addEventListener('click',function(e){
    if(window.clickStart.x && window.clickStart.y) {
      //second click
      if(window.tools[window.currentTool].onSecondClick) window.tools[window.currentTool].onSecondClick(e)
      window.clickStart.x = null
      window.clickStart.y = null
    } else {
      // first click
      if(window.tools[window.currentTool].onFirstClick) window.tools[window.currentTool].onFirstClick(e)
      else {
        defaultFirstClick(e)
      }
    }
  },false);


  /////////////////////
  //TOOL CLICKING
  /////////////////////
  /////////////////////
  function defaultFirstClick(e) {
    window.clickStart.x = (e.offsetX + window.camera.x)
    window.clickStart.y = (e.offsetY + window.camera.y)
  }

  window.tools = {
    [TOOLS.HERO_EDITOR]: {
      onFirstClick: (e) => {
        const click = {
          x: (e.offsetX + window.camera.x)/window.scaleMultiplier,
          y: (e.offsetY + window.camera.y)/window.scaleMultiplier,
          width: 1,
          height: 1,
        }

        if(window.clickToSetHeroSpawnToggle.checked) {
          window.socket.emit('updateHero', {id: window.editingHero.id, spawnPointX: click.x, spawnPointY: click.y})
        } else {
          Object.keys(window.heros).map((key) => window.heros[key])
          .forEach((hero, i) => {
            collisions.checkObject(click, hero, () => {
              window.editingHero = hero
              window.heroeditor.set(window.heros[window.editingHero.id])
              window.heroeditor.expandAll()
            })
          })
        }
      }
    },
    [TOOLS.SIMPLE_EDITOR]: {
      onFirstClick: (e) => {
        const click = {
          x: (e.offsetX + window.camera.x)/window.scaleMultiplier,
          y: (e.offsetY + window.camera.y)/window.scaleMultiplier,
          width: 1,
          height: 1,
        }

        if(window.setObjectSpawnToggle.checked) {
          window.sendObjectUpdate({spawnPointX: click.x, spawnPointY: click.y})
        } else if(window.setObjectPathfindingLimitToggle.checked) {
          defaultFirstClick(e)
        } else if(window.selectorObjectToggle.checked){
          window.objects
          .forEach((object, i) => {
            collisions.checkObject(click, object, () => {
              window.objecteditor.set(Object.assign({}, object))
              window.objecteditor.expandAll()
              window.editingObject = object
              window.editingObject.i = i
            })
          })
        }
      },
      onSecondClick: (e) => {
        const value = {
          width: (e.offsetX - window.clickStart.x + window.camera.x)/window.scaleMultiplier,
          height: (e.offsetY - window.clickStart.y + window.camera.y)/window.scaleMultiplier,
          x: window.clickStart.x/window.scaleMultiplier,
          y: window.clickStart.y/window.scaleMultiplier,
        }

        if(window.setObjectPathfindingLimitToggle.checked) {
          const {x, y, width, height} = gridTool.convertToGridXY(value);
          window.sendObjectUpdate({ pathfindingLimit: { x, y , width, height }})
        }
      }
    },
    [TOOLS.WORLD_EDITOR]: {
      onFirstClick: (e) => {
        if(window.selectorSpawnToggle.checked) {
          const click = {
            x: (e.offsetX + window.camera.x)/window.scaleMultiplier,
            y: (e.offsetY + window.camera.y)/window.scaleMultiplier,
          }

          window.socket.emit('updateWorld', {worldSpawnPointX: click.x, worldSpawnPointY: click.y})
        } else {
          defaultFirstClick(e)
        }
      },
      onSecondClick: (e) => {
        //translate
        const value = {
          width: (e.offsetX - window.clickStart.x + window.camera.x)/window.scaleMultiplier,
          height: (e.offsetY - window.clickStart.y + window.camera.y)/window.scaleMultiplier,
          x: window.clickStart.x/window.scaleMultiplier,
          y: window.clickStart.y/window.scaleMultiplier,
        }

        gridTool.snapDragToGrid(value, {dragging: true})

        const {x, y, width, height} = value;
        if(window.currentTool === TOOLS.PROCEDURAL || selectorProceduralToggle.checked) {
          const proceduralBoundaries = { x, y, width, height };
          window.socket.emit('updateWorld', { proceduralBoundaries })
        } else if(selectorCameraToggle.checked) {
          const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
          window.socket.emit('updateWorld', { lockCamera })
        } else if(selectorGameToggle.checked) {
          const gameBoundaries = { x, y, width, height };
          window.socket.emit('updateWorld', { gameBoundaries })
        }
      },
    },
    [TOOLS.ADD_OBJECT] : {
      onFirstClick: (e) => {
        if(window.dragAddToggle.checked) {
          defaultFirstClick(e)
        } else {
          const click = {
            x: (e.offsetX + window.camera.x)/window.scaleMultiplier,
            y: (e.offsetY + window.camera.y)/window.scaleMultiplier,
          }

          const { x, y } = gridTool.createGridNodeAt(click.x, click.y)
          let newObject = {
            width: window.grid.nodeSize,
            height: window.grid.nodeSize,
            x: x,
            y: y,
          }

          if(window.dotAddToggle.checked) {
            newObject.width = Number(document.getElementById('add-dot-size').value)
            newObject.height = Number(document.getElementById('add-dot-size').value)
            newObject.x += (window.grid.nodeSize/2 - newObject.width/2)
            newObject.y += (window.grid.nodeSize/2 - newObject.height/2)
          }

          window.addObjects(newObject)
        }
      },
      onSecondClick: (e) => {
        let newObject = {
          width: (e.offsetX - window.clickStart.x + window.camera.x)/window.scaleMultiplier,
          height: (e.offsetY - window.clickStart.y + window.camera.y)/window.scaleMultiplier,
          x: window.clickStart.x/window.scaleMultiplier,
          y: window.clickStart.y/window.scaleMultiplier,
        }

        gridTool.snapDragToGrid(newObject, { dragging: true })
        window.addObjects(newObject)
      },
    }
  }
  window.tools[TOOLS.PROCEDURAL] = window.tools[TOOLS.WORLD_EDITOR]
}


export default {
  init,
}
