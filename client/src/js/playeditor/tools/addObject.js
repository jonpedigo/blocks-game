function init() {
  var saveObjects = document.getElementById("save-factory");
  saveObjects.addEventListener('click', function(e){
    window.socket.emit('addObjects', window.objectFactory)
    window.objectFactory = []
  })

  var anticipatedObjectAdd = document.getElementById("anticipated-object-add");
  anticipatedObjectAdd.addEventListener('click', function(e){
    window.socket.emit('anticipateObject', window.objecteditor.get());
  })

  var anticipatedWallAdd = document.getElementById("anticipated-wall-add");
  anticipatedWallAdd.addEventListener('click', function(e){
    window.socket.emit('anticipateObject', {...window.objecteditor.get(), wall: true});
  })

  window.gridNodeAddToggle = document.getElementById("add-object-grid-node")
  window.dragAddToggle = document.getElementById("add-object-drag")
  window.dotAddToggle = document.getElementById("add-object-dot")
  window.useEditorSizeAddToggle = document.getElementById("add-object-editor")
  window.instantAddToggle = document.getElementById("instant-add")
  window.gridNodeAddToggle.checked = true;

  window.compendium = {}

  window.addToCompendium = function(object) {
    object = JSON.parse(JSON.stringify(object))
    if(object.i >= 0) delete object.i
    if(object.id) delete object.id
    object.compendiumId = 'compendium-' + Date.now()

    window.compendium[object.compendiumId] = object

    console.log('added: ' + object.compendiumId + ' to compendium')

    window.objecteditor.live = false
    window.objecteditor.update(object)
    window.updateObjectEditorNotifier()
    updateCompendium()
  }

  window.saveCompendiumObject = function(object) {
    if(!object.compendiumId) alert('trying to save to compendium with no compendium Id, create one first')
    object = JSON.parse(JSON.stringify(object))
    if(object.i >= 0) delete object.i
    if(object.id) delete object.id

    if(!window.compendium[object.compendiumId]) window.compendium[object.compendiumId] = object
    window.compendium[object.compendiumId] = object

    window.objecteditor.update(object)
    window.objecteditor.saved = true
    window.updateObjectEditorNotifier()
    updateCompendium()
  }
}

function updateCompendium() {
  let e=document.getElementsByClassName("compendium-select");  // Find the elements
  for(var i = 0; i < e.length; i++){
    e[i].innerHTML = '';
    for(let id in window.compendium) {
      let comEl = document.createElement('button')
      comEl.innerHTML = id
      comEl.onclick= function() {
        sendObjectUpdate(window.compendium[id])
      }
      e[i].appendChild(comEl)
    }
  }
}

function loaded() {
  if(window.game.compendium) window.compendium = game.compendium
}

export default {
  init,
  loaded,
}
