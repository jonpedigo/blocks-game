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

    if(window.currentTool === window.TOOLS.ADD_OBJECT) {
      const { x,y } = gridTool.createGridNodeAt(window.mousePos.x, window.mousePos.y)

      let location = {
        x,
        y,
      }

      if(window.dotAddToggle.checked) {
        location.width = Number(document.getElementById('add-dot-size').value)
        location.height = Number(document.getElementById('add-dot-size').value)
        location.x += (w.editingGame.grid.nodeSize/2 - location.width/2)
        location.y += (w.editingGame.grid.nodeSize/2 - location.height/2)
      }

      if(window.gridNodeAddToggle.checked) {
        location.width = w.editingGame.grid.nodeSize
        location.height = w.editingGame.grid.nodeSize
      }

      if(window.dragAddToggle.checked) {
        location.width = w.editingGame.grid.nodeSize
        location.height = w.editingGame.grid.nodeSize
      }

      if(window.useEditorSizeAddToggle.checked) {
        let oe = window.objecteditor.get()
        location.width = oe.width || w.editingGame.grid.nodeSize
        location.height = oe.height || w.editingGame.grid.nodeSize
        location.x += (w.editingGame.grid.nodeSize/2 - location.width/2)
        location.y += (w.editingGame.grid.nodeSize/2 - location.height/2)
      }

      window.gridHighlight = location
    } else window.gridHighlight = null

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
          window.sendHeroUpdate({id: window.editingHero.id, spawnPointX: click.x, spawnPointY: click.y})
        } else if(window.clickToSetHeroParentToggle.checked || window.clickToSetHeroRelativeToggle.checked){
          w.editingGame.objects
          .forEach((object, i) => {
            collisions.checkObject(click, object, () => {
              if(window.clickToSetHeroParentToggle.checked) {
                window.sendHeroUpdate({id: window.editingHero.id, parentId: object.id})
              }
              if(window.clickToSetHeroRelativeToggle.checked) {
                window.sendHeroUpdate({id: window.editingHero.id, relativeId: object.id})
              }
            })
          })
        } else {
          Object.keys(w.editingGame.heros).map((key) => w.editingGame.heros[key])
          .forEach((hero, i) => {
            collisions.checkObject(click, hero, () => {
              window.editingHero = hero
              window.heroeditor.update(w.editingGame.heros[window.editingHero.id])
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
          let spawnPoints = {spawnPointX: click.x, spawnPointY: click.y}
          // window.sendObjectUpdate(spawnPoints)
          window.objecteditor.saved = false
          window.objecteditor.update({...window.objecteditor.get(), ...spawnPoints})
        } else if(window.setObjectPathfindingLimitToggle.checked) {
          defaultFirstClick(e)
        } else {
          w.editingGame.objects
          .forEach((object, i) => {
            collisions.checkObject(click, object, () => {
              if(window.selectorObjectToggle.checked) {
                object.i = i
                window.objecteditor.saved = true
                window.objecteditor.update(object)
                window.updateObjectEditorNotifier()
              } else if(window.selectorParentToggle.checked) {
                window.sendObjectUpdate({parentId: object.id})
              } else if(window.selectorRelativeToggle.checked) {
                window.sendObjectUpdate({relativeId: object.id})
              }
            })
          })
          Object.keys(w.editingGame.heros).map((key) => w.editingGame.heros[key])
          .forEach((hero, i) => {
            collisions.checkObject(click, hero, () => {
              if(window.selectorParentToggle.checked) {
                window.sendObjectUpdate({parentId: hero.id})
              } else if(window.selectorRelativeToggle.checked) {
                window.sendObjectUpdate({relativeId: object.id})
              }
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
          gridTool.snapDragToGrid(value, {dragging: true})
          window.objecteditor.saved = false
          // window.sendObjectUpdate({ pathfindingLimit: value})
          window.objecteditor.update({...window.objecteditor.get(), pathfindingLimit: value})
          window.setObjectPathfindingLimitToggle.checked = false
          window.selectorObjectToggle.checked = true
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

          window.sendWorldUpdate({worldSpawnPointX: click.x, worldSpawnPointY: click.y})
        }

        defaultFirstClick(e)
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
          window.sendWorldUpdate({ proceduralBoundaries })
        }
        if(selectorCameraToggle.checked) {
          const lockCamera = { x, y, width, height, centerX: value.x + (value.width/2), centerY: value.y + (value.height/2), limitX: Math.abs(value.width/2), limitY: Math.abs(value.height/2) };
          window.sendWorldUpdate({ lockCamera })
        }
        if(selectorGameToggle.checked) {
          const gameBoundaries = { x, y, width, height };
          window.sendWorldUpdate({ gameBoundaries })
        }
        if(window.selectorHeroZoomToggle.checked) {
          let gridWidth = value.width/w.editingGame.grid.nodeSize
          Object.keys(w.editingGame.heros).forEach((id) => {
            let hero = w.editingGame.heros[id]
            window.sendHeroUpdate({id, zoomMultiplier: gridWidth/16})
          })
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
          let location = {
            width: w.editingGame.grid.nodeSize,
            height: w.editingGame.grid.nodeSize,
            x: x,
            y: y,
          }

          if(window.dotAddToggle.checked) {
            location.width = Number(document.getElementById('add-dot-size').value)
            location.height = Number(document.getElementById('add-dot-size').value)
            location.x += (w.editingGame.grid.nodeSize/2 - location.width/2)
            location.y += (w.editingGame.grid.nodeSize/2 - location.height/2)
          }

          let editorObject = window.objecteditor.get()

          let newObject = JSON.parse(JSON.stringify(editorObject))

          if(window.useEditorSizeAddToggle.checked) {
            location.width = editorObject.width || w.editingGame.grid.nodeSize
            location.height = editorObject.height || w.editingGame.grid.nodeSize
            location.x += (w.editingGame.grid.nodeSize/2 - location.width/2)
            location.y += (w.editingGame.grid.nodeSize/2 - location.height/2)
          }

          Object.assign(newObject, location)

          window.addObjects(newObject)
        }
      },
      onSecondClick: (e) => {
        let location = {
          width: (e.offsetX - window.clickStart.x + window.camera.x)/window.scaleMultiplier,
          height: (e.offsetY - window.clickStart.y + window.camera.y)/window.scaleMultiplier,
          x: window.clickStart.x/window.scaleMultiplier,
          y: window.clickStart.y/window.scaleMultiplier,
        }
        gridTool.snapDragToGrid(location, { dragging: true })

        let editorObject = window.objecteditor.get()

        let newObject = JSON.parse(JSON.stringify(editorObject))

        Object.assign(newObject, location)

        window.addObjects(newObject)
      },
    }
  }
  window.tools[TOOLS.PROCEDURAL] = window.tools[TOOLS.WORLD_EDITOR]
}


export default {
  init,
}
