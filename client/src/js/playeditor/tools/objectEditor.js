import objectModifiers from '../objectModifiers.js'
import heroModifiers from '../heroModifiers.js'
import worldModifiers from '../worldModifiers.js'
import collisions from '../../collisions'
import gridTool from '../../grid.js'
import JSONEditor from 'jsoneditor'

function init() {
  window.editingObject = {
    i: null,
    id: null,
  }

  var objectjsoneditor = document.createElement("div")
  objectjsoneditor.id = 'objectjsoneditor'
  document.getElementById('tool-'+TOOLS.SIMPLE_EDITOR).appendChild(objectjsoneditor);
  window.objecteditor = new JSONEditor(objectjsoneditor, { modes: ['tree', 'code'], search: false, onChangeJSON: (objectEdited) => {
    let object = window.objects[window.editingObject.i]

    if((object.tags.obstacle == true && objectEdited.tags.obstacle == false) || (object.tags.stationary == true && objectEdited.tags.stationary == false)) {
      gridTool.removeObstacle({...object, tags: objectEdited.tags})
    }

    if((object.tags.obstacle == false && objectEdited.tags.obstacle == true) || (object.tags.stationary == false && objectEdited.tags.stationary == true) || (object.tags.onlyHeroAllowed == false && objectEdited.tags.onlyHeroAllowed == true)) {
      gridTool.addObstacle({...object, tags: objectEdited.tags})
    }

    window.sendObjectUpdate({ tags: objectEdited.tags })
  }});

  let applyObjectModEl = document.getElementById("apply-object-mod")
  for(let modifierName in objectModifiers) {
    let modEl = document.createElement('div')
    modEl.className = 'button';
    modEl.innerHTML = modifierName
    modEl.onclick=function() {
      window.sendObjectUpdate(objectModifiers[modifierName])
      window.updateEditorState()
    }
    applyObjectModEl.appendChild(modEl)
  }

  //mod select functionality
  let modSelectHerosEl = document.getElementById("modifier-select-heros")
  for(let modifierName in heroModifiers) {
    let modEl = document.createElement('div')
    modEl.className = 'button';
    modEl.innerHTML = modifierName
    modEl.onclick=function() {
      window.sendObjectUpdate({ heroUpdate : heroModifiers[modifierName]})
      window.updateEditorState()
    }
    modSelectHerosEl.appendChild(modEl)
  }

  //mod select functionality
  let modSelectObjectsEl = document.getElementById("modifier-select-objects")
  for(let modifierName in objectModifiers) {
    let modEl = document.createElement('div')
    modEl.className = 'button';
    modEl.innerHTML =  modifierName
    modEl.onclick=function() {
      window.sendObjectUpdate({ objectUpdate : objectModifiers[modifierName]})
      window.updateEditorState()
    }
    modSelectObjectsEl.appendChild(modEl)
  }

  //mod select functionality
  let modSelectWorldEl = document.getElementById("modifier-select-world")
  for(let modifierName in worldModifiers) {
    let modEl = document.createElement('div')
    modEl.className = 'button';
    modEl.innerHTML = modifierName
    modEl.onclick=function() {
      window.sendObjectUpdate({ worldUpdate : worldModifiers[modifierName]})
      window.updateEditorState()
    }
    modSelectWorldEl.appendChild(modEl)
  }

  var sendObjectPos = document.getElementById("send-object-pos");
  sendObjectPos.addEventListener('click', () => {
    let editingObj = window.objecteditor.get();
    window.sendObjectUpdate({ x: editingObj.x, y: editingObj.y })
  })

  var sendObjectOther = document.getElementById("send-object-other");
  sendObjectOther.addEventListener('click', () => {
    let editingObj = window.objecteditor.get();
    delete editingObj.x
    delete editingObj.y
    window.sendObjectUpdate(editingObj)
  })

  var removeObjectButton = document.getElementById("remove-object");
  removeObjectButton.addEventListener('click', () => window.socket.emit('removeObject', window.editingObject))
  var deleteObjectButton = document.getElementById("delete-object");
  deleteObjectButton.addEventListener('click', () => window.socket.emit('deleteObject', window.editingObject))
  window.syncObjectsToggle = document.getElementById('sync-objects')
  window.syncObjectsToggle.onclick = (e) => {
    if(e.srcElement.checked) {
      window.socket.emit('updateWorld', { syncObjects: true })
    } else {
      window.socket.emit('updateWorld', { syncObjects: false })
    }
  }
  if(window.world.syncObjects) {
    syncObjectsToggle.checked = true;
  }
  window.setObjectSpawnToggle = document.getElementById('set-spawn-object')
  window.selectorObjectToggle = document.getElementById('select-object')
  window.setObjectPathfindingLimitToggle = document.getElementById('set-pathfinding-limit')
}

window.updateEditorState = function() {
  window.objecteditor.set(window.objects[window.editingObject.i])
  window.objecteditor.expandAll()
}

window.sendObjectUpdate = function(objectUpdate) {
  let objectCopy = { ...objectUpdate }
  window.mergeDeep(window.editingObject, objectCopy)
  window.mergeDeep(window.objects[window.editingObject.i], objectCopy)
  window.socket.emit('editObjects', window.objects)
}

window.findObject = function() {
  camera.setCamera(ctx, window.editingObject)
}

export default {
  init
}
