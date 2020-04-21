function init() {
  var anticipatedObjectAdd = document.getElementById("anticipated-object-add");
  anticipatedObjectAdd.addEventListener('click', function(e){
    window.socket.emit('anticipateObject', window.objecteditor.get());
  })

  var anticipatedWallAdd = document.getElementById("anticipated-wall-add");
  anticipatedWallAdd.addEventListener('click', function(e){
    window.socket.emit('anticipateObject', {...window.objecteditor.get(), wall: true});
  })

  window.gridNodeAddToggle = document.getElementById("add-object-grid-node")
  window.groupAddToggle = document.getElementById("add-object-group")
  window.dotAddToggle = document.getElementById("add-object-dot")
  window.useEditorSizeAddToggle = document.getElementById("add-object-editor")
  window.addParentToggle = document.getElementById("add-parent-group")

  window.compendium = {}

  window.addToCompendium = function(object) {
    object = JSON.parse(JSON.stringify(object))
    delete object.i
    delete object.id
    object.compendiumId = 'compendium-' + window.uniqueID()

    window.removeObjectState(object)
    console.log('added: ' + object.compendiumId + ' to compendium')
    window.objecteditor.saved = false
    window.objecteditor.defaultCompendium = false
    window.objecteditor.update(object)
    updateCompendium()
    window.updateObjectEditorNotifier()
  }

  window.saveCompendiumObject = function(object) {
    object = JSON.parse(JSON.stringify(object))
    delete object.i
    delete object.id

    if(!window.compendium[object.compendiumId]) {
      var id = prompt("Give this compendium item an id", object.compendiumId);
      if(id) {
        window.compendium[id] = object
        object.compendiumId = id
      } else return
    } else {
      window.compendium[object.compendiumId] = object
    }

    window.removeObjectState(object)
    window.objecteditor.update(object)
    window.objecteditor.saved = true
    updateCompendium()
    window.updateObjectEditorNotifier()
  }
}

function clickOnCompendium(rightClick, compendium) {
  // right click
  if(rightClick) {
    if(window.objecteditor.live) {
      if(confirm('this will merge this object to adopt all properties of ' + compendium.compendiumId)) {
        let editorState = window.objecteditor.get()
        let objectById = w.editingGame.objectsById[editorState.id]
        let compendiumCopy = JSON.parse(JSON.stringify(compendium))
        delete compendiumCopy.compendiumId
        let updated = window.mergeDeep(objectById, compendiumCopy)
        window.objecteditor.update(updated)
        window.objecteditor.saved = false
        window.updateObjectEditorNotifier()
      }
    } else {
      if(confirm('this will merge compendium ' + compendium.compendiumId + ' into editor')) {
        let editorState = window.objecteditor.get()
        let compendiumCopy = JSON.parse(JSON.stringify(compendium))
        delete compendiumCopy.compendiumId
        window.objecteditor.update(window.mergeDeep(editorState, compendiumCopy))
        window.objecteditor.saved = false
        window.updateObjectEditorNotifier()
      }
    }
  } else {
    window.objecteditor.saved = true
    window.objecteditor.update(compendium)
    window.updateObjectEditorNotifier()
  }
}

function updateCompendium() {
  let e=document.getElementsByClassName("compendium-select");  // Find the elements
  for(var i = 0; i < e.length; i++){
    e[i].innerHTML = '';

    let defaultEl = document.createElement('button')
    defaultEl.innerHTML = 'Default Object'
    defaultEl.onclick= function(e) {
      window.objecteditor.defaultCompendium = false
      clickOnCompendium(false, window.defaultObject)
    }
    defaultEl.oncontextmenu = function(e) {
      e.preventDefault()
      clickOnCompendium(true, window.defaultObject)
    }
    e[i].appendChild(defaultEl)

    for(let id in window.defaultCompendium.object) {
      let comEl = document.createElement('button')
      comEl.innerHTML = id
      comEl.onclick= function(e) {
        window.objecteditor.defaultCompendium = true
        clickOnCompendium(false, window.defaultCompendium.object[id])
      }
      comEl.oncontextmenu = function(e) {
        e.preventDefault()
        clickOnCompendium(true, window.defaultCompendium.object[id])
      }
      e[i].appendChild(comEl)
    }


    for(let id in window.compendium) {
      let comEl = document.createElement('button')
      comEl.innerHTML = id
      comEl.className='live-compendium-select button'
      comEl.id = id
      comEl.onclick= function(e) {
        window.objecteditor.defaultCompendium = false
        clickOnCompendium(false, window.compendium[id])
      }
      comEl.oncontextmenu = function(e) {
        e.preventDefault()
        clickOnCompendium(true, window.compendium[id])
      }
      e[i].appendChild(comEl)
    }
  }
}

window.updateObjectEditorNotifier = function() {
  let editorState = window.objecteditor.get()
  if(editorState.id && !editorState.parent) window.objecteditor.live = true
  else window.objecteditor.live = false

  let els=document.getElementsByClassName("live-compendium-select");  // Find the elements
  for(var i = 0; i < els.length; i++) {
    els[i].className='live-compendium-select button'
    if(els[i].id === editorState.compendiumId) {
      els[i].className='live-compendium-select selected button'
    }
  }

  let x=document.getElementsByClassName("is-edit-live");  // Find the elements
  for(var i = 0; i < x.length; i++){
    if(window.objecteditor.live) {
      x[i].style.display = 'inline-block'
      x[i].style.backgroundColor = 'red'
      if(window.objecteditor.saved) {
        x[i].style.opacity = '0.3'
      } else {
        x[i].style.opacity = '1'
      }
    } else if (editorState.compendiumId && !window.objecteditor.defaultCompendium) {
      x[i].style.display = 'inline-block'
      x[i].style.backgroundColor = 'white'
      if(window.objecteditor.saved) {
        x[i].style.opacity = '0.3'
      } else {
        x[i].style.opacity = '1'
      }
    } else {
      x[i].style.display = 'none'
    }
  }
}

window.getAllChildren = function(parent) {
  let children = []
  w.editingGame.objects.forEach((obj) => {
    if(obj.parentId === parent.id) {
      children.push(obj)
    }
  })
  return children
}

window.copyParentAndChild = function(parent, children) {
  let parentCopy = JSON.parse(JSON.stringify(parent))
  parentCopy.id = 'parent-'+window.uniqueID()
  children = children.map((obj) => {
    let objCopy = JSON.parse(JSON.stringify(obj))
    objCopy.id = 'object'+window.uniqueID()
    objCopy.parentId = parentCopy.id
    objCopy.__relativeToParentX = objCopy.x - parentCopy.x
    objCopy.__relativeToParentY = objCopy.y - parentCopy.y
    window.removeObjectState(objCopy)
    return objCopy
  })
  window.removeObjectState(parentCopy)
  return { parent: parentCopy, children }
}

function loaded() {
  if(window.game.compendium) window.compendium = game.compendium
  updateCompendium()
}

export default {
  init,
  loaded,
}
