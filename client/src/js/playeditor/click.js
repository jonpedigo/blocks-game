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

  window.dragStart = {
    x: null,
    y: null,
  }

  window.document.getElementById('game-canvas').addEventListener("mousedown", function(e) {
    if(window.currentTool !== window.TOOLS.SIMPLE_EDITOR || !window.dragObjectPosToggle.checked) return
    window.dragStart.x = ((e.offsetX + window.camera.x)/window.scaleMultiplier)
    window.dragStart.y = ((e.offsetY + window.camera.y)/window.scaleMultiplier)
    const { x,y } = gridTool.createGridNodeAt(window.dragStart.x, window.dragStart.y)
    let click = {
      x,
      y,
      width:1,
      height:1,
    }

    let editorState = window.objecteditor.get()
    if(editorState.parent) {
      window.dragTimeout = setTimeout(() => {
        window.draggingObject = editorState
      }, 118)
      return
    }

    for(let i = 0; i < w.editingGame.objects.length; i++) {
      let object = w.editingGame.objects[i]
      // if(window.objecteditor && object.id === window.objecteditor.get().id){
      //   continue
      // }
      if(collisions.checkObject(click, object, () => {
        window.dragTimeout = setTimeout(() => {
          window.draggingObject = JSON.parse(JSON.stringify(object))
          let children = window.getAllChildren(window.draggingObject)
          if(children.length) {
            window.draggingObject = {
              parent: window.draggingObject,
              children: children.map(obj => JSON.parse(JSON.stringify(obj))),
            }
          }
        }, 118)
        return
      })) return
    }
  })

  window.document.getElementById('game-canvas').addEventListener("mouseup", function(e) {
    let dragEndX = ((e.offsetX + window.camera.x)/window.scaleMultiplier)
    let dragEndY = ((e.offsetY + window.camera.y)/window.scaleMultiplier)

    if(!window.draggingObject && window.dragTimeout) {
      window.clearTimeout(window.dragTimeout)
    } else if(window.draggingObject) {
      const { x,y } = gridTool.createGridNodeAt(dragEndX, dragEndY)
      if(window.draggingObject.parent) {
        let parentGameObject
        if(window.draggingObject.forSelectionOnly) {
          let editorState = window.objecteditor.get()
          parentGameObject = editorState.parent
        } else if(window.draggingObject.parent.id){
          parentGameObject = w.editingGame.objectsById[window.draggingObject.parent.id]
        }
        let diffX = parentGameObject.x - x
        let diffY = parentGameObject.y - y
        parentGameObject.x = x
        parentGameObject.y = y

        window.draggingObject.children.forEach((obj) => {
          w.editingGame.objectsById[obj.id].x -= diffX
          w.editingGame.objectsById[obj.id].y -= diffY
        })
      } else {
        w.editingGame.objectsById[window.draggingObject.id].x = x
        w.editingGame.objectsById[window.draggingObject.id].y = y
      }

      window.emitEditObjectsPos()
      window.objecteditor.update({})
      //end the drag
    }

    window.draggingObject = null
    window.dragTimeout = null
  })

  window.document.getElementById('game-canvas').addEventListener("mousemove", function(e) {
    window.mousePos.x = ((e.offsetX + window.camera.x)/window.scaleMultiplier)
    window.mousePos.y = ((e.offsetY + window.camera.y)/window.scaleMultiplier)

    const { x,y } = gridTool.createGridNodeAt(window.mousePos.x, window.mousePos.y)

    let location = {
      x,
      y,
    }

    if(window.draggingObject) {
      if(window.draggingObject.parent) {
        window.draggingObject.parent.x = x
        window.draggingObject.parent.y = y

        let parentGameObject
        if(window.draggingObject.forSelectionOnly) {
          let editorState = window.objecteditor.get()
          parentGameObject = editorState.parent
        } else if(window.draggingObject.parent.id){
          parentGameObject = w.editingGame.objectsById[window.draggingObject.parent.id]
        }
        let diffX = parentGameObject.x - x
        let diffY = parentGameObject.y - y

        window.draggingObject.children.forEach((obj) => {
          obj.x = w.editingGame.objectsById[obj.id].x - diffX
          obj.y = w.editingGame.objectsById[obj.id].y - diffY
        })
      } else {
        window.draggingObject.x = x
        window.draggingObject.y = y
      }
      return
    }

    if(window.dotAddToggle.checked && window.currentTool === window.TOOLS.ADD_OBJECT) {
      location.width = Number(document.getElementById('add-dot-size').value)
      location.height = Number(document.getElementById('add-dot-size').value)
      location.x += (w.editingGame.grid.nodeSize/2 - location.width/2)
      location.y += (w.editingGame.grid.nodeSize/2 - location.height/2)
    }

    if(window.gridNodeAddToggle.checked  && window.currentTool === window.TOOLS.ADD_OBJECT) {
      location.width = w.editingGame.grid.nodeSize
      location.height = w.editingGame.grid.nodeSize
    }

    // console.log((window.setObjectPathfindingLimitToggle.checked && window.currentTool === window.TOOLS.SIMPLE_EDITOR) , (window.groupAddToggle.checked && window.currentTool === window.TOOLS.ADD_OBJECT) , (window.currentTool === window.TOOLS.WORLD_EDITOR && !window.selectorSpawnToggle.checked) , !!(window.clickStart.x || window.clickStart.x === 0))
    if(((window.setObjectPathfindingLimitToggle.checked && window.currentTool === window.TOOLS.SIMPLE_EDITOR) || (window.groupAddToggle.checked && window.currentTool === window.TOOLS.ADD_OBJECT) || (window.currentTool === window.TOOLS.WORLD_EDITOR && !window.selectorSpawnToggle.checked)) || (window.currentTool === window.TOOLS.ADD_OBJECT && window.addWallToggle.checked) && !!(window.clickStart.x || window.clickStart.x === 0)) {
      location = {
        width: (e.offsetX - window.clickStart.x + window.camera.x)/window.scaleMultiplier,
        height: (e.offsetY - window.clickStart.y + window.camera.y)/window.scaleMultiplier,
        x: window.clickStart.x/window.scaleMultiplier,
        y: window.clickStart.y/window.scaleMultiplier,
      }
      gridTool.snapDragToGrid(location, {dragging: true})
    }

    if(window.useEditorSizeAddToggle.checked  && window.currentTool === window.TOOLS.ADD_OBJECT) {
      let oe = window.objecteditor.get()
      location.width = oe.width || w.editingGame.grid.nodeSize
      location.height = oe.height || w.editingGame.grid.nodeSize
      location.x += (w.editingGame.grid.nodeSize/2 - location.width/2)
      location.y += (w.editingGame.grid.nodeSize/2 - location.height/2)
    }

    if(((window.currentTool === window.TOOLS.ADD_OBJECT && window.addParentToggle.checked) || (window.currentTool === window.TOOLS.SIMPLE_EDITOR && window.selectObjectGroupToggle.checked)) && !!(window.clickStart.x || window.clickStart.x === 0)) {
      location = {
        width: (e.offsetX - window.clickStart.x + window.camera.x)/window.scaleMultiplier,
        height: (e.offsetY - window.clickStart.y + window.camera.y)/window.scaleMultiplier,
        x: window.clickStart.x/window.scaleMultiplier,
        y: window.clickStart.y/window.scaleMultiplier,
      }

      window.highlightedObjectGroup = []
      w.editingGame.objects
      .forEach((object, i) => {
        collisions.checkObject(location, object, () => {
          window.highlightedObjectGroup.push(object)
        })
      })
    }
    window.gridHighlight = location

    let oe = window.objecteditor.get()
    if(oe.parent && window.currentTool === window.TOOLS.ADD_OBJECT) {
      const {parent, children} = window.copyParentAndChild(oe.parent, oe.children)
      parent.x = location.x
      parent.y = location.y
      children.forEach((child) => {
        child.x = parent.x + child.__relativeToParentX
        child.y = parent.y + child.__relativeToParentY
        delete child.__relativeToParentX
        delete child.__relativeToParentY
      })
      window.gridHighlight = { parent, children }
    }
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
              // if(window.clickToSetHeroRelativeToggle.checked) {
              //   window.sendHeroUpdate({id: window.editingHero.id, relativeId: object.id})
              // }
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
        } else if(window.setObjectPathfindingLimitToggle.checked || window.selectObjectGroupToggle.checked) {
          defaultFirstClick(e)
        } else {
          for(let i = 0; i < w.editingGame.objects.length; i++) {
            let object = w.editingGame.objects[i]
            if(window.objecteditor && object.id === window.objecteditor.get().id){
              continue
            }
            if(collisions.checkObject(click, object, () => {
              if(window.selectorObjectToggle.checked) {
                object.i = i
                window.objecteditor.saved = true
                window.objecteditor.update(object)
                window.updateObjectEditorNotifier()
              } else if(window.selectorParentToggle.checked) {
                window.objecteditor.saved = false
                window.objecteditor.update({...window.objecteditor.get(), parentId: object.id})
                // window.sendObjectUpdate({parentId: object.id})
              }
              // if(window.selectorRelativeToggle.checked) {
              //   window.sendObjectUpdate({relativeId: object.id})
              // }
            })) break
          }
          Object.keys(w.editingGame.heros).map((key) => w.editingGame.heros[key])
          .forEach((hero, i) => {
            collisions.checkObject(click, hero, () => {
              if(window.selectorParentToggle.checked) {
                window.objecteditor.saved = false
                window.objecteditor.update({...window.objecteditor.get(), parentId: hero.id})
                // window.sendObjectUpdate({parentId: hero.id})
              }
              // else if(window.selectorRelativeToggle.checked) {
              //  window.sendObjectUpdate({relativeId: object.id})
              // }
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
          // window.setObjectPathfindingLimitToggle.checked = false
          // window.selectorObjectToggle.checked = true
        } else if(window.selectObjectGroupToggle.checked) {
          window.objecteditor.update({
            parent: value,
            children: JSON.parse(JSON.stringify(window.highlightedObjectGroup)),
            forSelectionOnly: true,
          })
          window.highlightedObjectGroup = []
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
          const gameBoundaries = { x, y, width, height, behavior: w.game.world.gameBoundaries.behavior };
          window.sendWorldUpdate({ gameBoundaries } )
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
        let editorObject = window.objecteditor.get()

        if((window.groupAddToggle.checked || window.addParentToggle.checked || window.addWallToggle.checked) && !editorObject.parent) {
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

          if(editorObject.parent) {
            const { parent, children } = window.copyParentAndChild(editorObject.parent, editorObject.children)
            parent.x = location.x
            parent.y = location.y
            children.forEach((child) => {
              child.x = parent.x + child.__relativeToParentX
              child.y = parent.y + child.__relativeToParentY
              delete child.__relativeToParentX
              delete child.__relativeToParentY
              if(editorObject.forSelectionOnly) delete child.parentId
            })
            if(editorObject.forSelectionOnly) {
              window.addObjects(children)
            } else {
              window.addObjects([parent, ...children])
            }
            return
          }

          if(window.dotAddToggle.checked) {
            location.width = Number(document.getElementById('add-dot-size').value)
            location.height = Number(document.getElementById('add-dot-size').value)
            location.x += (w.editingGame.grid.nodeSize/2 - location.width/2)
            location.y += (w.editingGame.grid.nodeSize/2 - location.height/2)
          }

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

        if(window.addWallToggle.checked) {
          location.thickness = editorObject.width || w.game.grid.nodeSize
          window.createArena(location)
          return
        }

        let newObject = JSON.parse(JSON.stringify(editorObject))
        if(window.addParentToggle.checked) {
          newObject = {}
          newObject.id = 'parent-'+window.uniqueID()
          newObject.tags = window.tags
          newObject.tags.invisible = true
          newObject.tags.obstacle = false
        }
        Object.assign(newObject, location)

        window.addObjects(newObject)

        if(window.addParentToggle.checked) {
          window.highlightedObjectGroup.forEach((object) => {
            object.parentId = newObject.id
          })
          window.emitEditObjectsOther()
          window.highlightedObjectGroup = []
        }
      },
    }
  }
  window.tools[TOOLS.PROCEDURAL] = window.tools[TOOLS.WORLD_EDITOR]
}


export default {
  init,
}
