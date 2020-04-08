function init() {
  var saveObjects = document.getElementById("save-factory");
  saveObjects.addEventListener('click', function(e){
    window.socket.emit('addObjects', window.objectFactory)
    window.objectFactory = []
  })

  var anticipatedObjectAdd = document.getElementById("anticipated-object-add");
  anticipatedObjectAdd.addEventListener('click', function(e){
    window.socket.emit('anticipateObject', window.editingObject);
  })

  var anticipatedWallAdd = document.getElementById("anticipated-wall-add");
  anticipatedWallAdd.addEventListener('click', function(e){
    window.socket.emit('anticipateObject', {...window.editingObject, wall: true});
  })

  window.gridNodeAddToggle = document.getElementById("add-object-grid-node")
  window.dragAddToggle = document.getElementById("add-object-drag")
  window.dotAddToggle = document.getElementById("add-object-dot")
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

    window.mergeDeep(window.editingObject, object)
    window.objecteditor.set(object)
    window.objecteditor.expandAll()
  }

  window.saveCompendiumObject = function(object) {
    if(!window.compendium[object.compendiumId]) alert('trying to save to compendium with no compendium Id, create one first')
    object = JSON.parse(JSON.stringify(object))
    if(object.i >= 0) delete object.i
    if(object.id) delete object.id

    window.mergeDeep(window.compendium[object.compendiumId], object)

    window.mergeDeep(window.editingObject, object)
    window.objecteditor.set(object)
    window.objecteditor.expandAll()
  }
}

function loaded() {
  if(window.game.compendium) window.compendium = game.compendium
}

export default {
  init,
  loaded,
}
