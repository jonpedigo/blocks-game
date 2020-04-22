import collisions from '../../collisions'
import gridTool from '../../grid.js'
import JSONEditor from 'jsoneditor'
import camera from '../camera.js'

function init() {
  var objectjsoneditor = document.createElement("div")
  objectjsoneditor.id = 'objectjsoneditor'
  document.body.appendChild(objectjsoneditor);
  window.objecteditor = new JSONEditor(objectjsoneditor, {
    modes: ['tree', 'code'], search: false, onChangeJSON: (editorState) => {
    if(editorState.id && !editorState.parent) {
      let object = w.editingGame.objectsById[editorState.id]

      if((object.tags.obstacle == true && editorState.tags.obstacle == false) || (object.tags.stationary == true && editorState.tags.stationary == false)) {
        gridTool.removeObstacle({...object, tags: editorState.tags})
      }
      if((object.tags.obstacle == false && editorState.tags.obstacle == true) || (object.tags.stationary == false && editorState.tags.stationary == true) || (object.tags.onlyHeroAllowed == false && editorState.tags.onlyHeroAllowed == true)) {
        gridTool.addObstacle({...object, tags: editorState.tags})
      }

      window.objecteditor.saved = false
      window.updateObjectEditorNotifier()
    } else {
      window.objecteditor.saved = false
      window.updateObjectEditorNotifier()
    }
  }});

  var sendObjectPos = document.getElementById("send-object-pos");
  sendObjectPos.addEventListener('click', () => {
    let editingObject = window.objecteditor.get();
    window.sendObjectUpdate({ x: editingObject.x, y: editingObject.y })
  })

  var sendObjectOther = document.getElementById("send-object-other");
  sendObjectOther.addEventListener('click', () => {
    let editingObject = window.objecteditor.get();
    window.sendObjectUpdateOther(editingObject)
  })

  var getObjectParentChildren = document.getElementById("get-object-parentchildren");
  getObjectParentChildren.addEventListener('click', () => {
    let object = window.objecteditor.get()

    let parent = object
    if(object.parentId) {
      parent = w.editingGame.objectsById[object.parentId]
    }

    let children = window.getAllChildren(parent)

    if(!object.id || !parent || children.length === 0) {
      Swal.fire({
        title: 'No parent/child relationship',
        icon: 'warning',
      })
      return
    }

    window.objecteditor.update({
      parent,
      children
    })
    window.objecteditor.saved = true
    window.updateObjectEditorNotifier()
  })

  var removeObjectButton = document.getElementById("remove-object");
  removeObjectButton.addEventListener('click', () => window.socket.emit('removeObject', window.objecteditor.get()))

  var askHeroToNameObject = document.getElementById("ask-hero-to-name-object");
  askHeroToNameObject.addEventListener('click', () => window.socket.emit('askHeroToNameObject', window.objecteditor.get(), window.editingHero.id))
  var askHeroToWriteChat = document.getElementById("ask-hero-to-write-chat");
  askHeroToWriteChat.addEventListener('click', () => window.socket.emit('askHeroToWriteChat', window.objecteditor.get(), window.editingHero.id))

  var deleteObjectButton = document.getElementById("delete-object");
  deleteObjectButton.addEventListener('click', () => window.socket.emit('deleteObject', window.objecteditor.get()))
  window.syncObjectsToggle = document.getElementById('sync-objects')
  window.syncObjectsToggle.onclick = (e) => {
    if(e.srcElement.checked) {
      window.socket.emit('updateWorld', { syncObjects: true })
    } else {
      window.socket.emit('updateWorld', { syncObjects: false })
    }
  }
  window.setObjectSpawnToggle = document.getElementById('set-spawn-object')
  window.selectorObjectToggle = document.getElementById('select-object')
  window.setObjectPathfindingLimitToggle = document.getElementById('set-pathfinding-limit')
  window.selectorParentToggle = document.getElementById('set-parent-object')
  window.dragObjectPosToggle = document.getElementById('drag-object-pos')
  window.selectObjectGroupToggle = document.getElementById("select-object-group");

  // window.selectorRelativeToggle = document.getElementById('set-relative-object')
}

window.updateEditorState = function() {
  window.objecteditor.update(w.editingGame.objectsById[window.objecteditor.get().id])
}

window.sendObjectUpdate = function(objectUpdate) {
  let editorState = window.objecteditor.get()
  window.mergeDeep(w.editingGame.objectsById[editorState.id], objectUpdate)
  if(window.editingGame.branch) {

  } else if(window.objecteditor.live && editorState.id) {
    window.socket.emit('editObjects', w.editingGame.objects)
  }
}

window.sendObjectUpdateOther = function(objectUpdate) {
  let editorState = window.objecteditor.get()
  window.mergeDeep(w.editingGame.objectsById[editorState.id], objectUpdate)
  if(window.editingGame.branch) {

  } else {
    window.emitEditObjectsOther()
  }
  window.objecteditor.saved = true
  window.updateObjectEditorNotifier()
}

window.emitEditObjectsOther = function() {
  window.socket.emit('editObjects', JSON.parse(JSON.stringify(w.editingGame.objects)).map((obj) => {
    delete obj.x
    delete obj.y
    return obj
  }))
}

window.emitEditObjectsPos = function() {
  window.socket.emit('editObjects', JSON.parse(JSON.stringify(w.editingGame.objects)).map((obj) => {
    return {id: obj.id, x: obj.x, y: obj.y}
  }))
}

window.findObject = function() {
  let editorState = window.objecteditor.get()
  if(editorState.id) {
    camera.setCamera(ctx, editorState)
  }
}

function loaded() {
  window.objecteditor.saved = true
  window.objecteditor.update(window.defaultObject)
  window.updateObjectEditorNotifier()
  window.objecteditor.expandAll()

  if(w.editingGame.world.syncObjects) {
    syncObjectsToggle.checked = true;
  }
}

export default {
  init,
  loaded,
}
