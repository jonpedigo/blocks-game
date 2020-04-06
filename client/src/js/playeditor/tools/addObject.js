function init() {
  var saveObjects = document.getElementById("save-factory");
  saveObjects.addEventListener('click', function(e){
    window.socket.emit('addObjects', window.objectFactory)
    window.objectFactory = []
  })

  var anticipatedObjectAdd = document.getElementById("anticipated-object-add");
  anticipatedObjectAdd.addEventListener('click', function(e){
    window.socket.emit('anticipateObject', {tags: getCheckedTags()});
  })

  var anticipatedObjectAdd = document.getElementById("anticipated-wall-add");
  anticipatedObjectAdd.addEventListener('click', function(e){
    window.socket.emit('anticipateObject', {wall: true, tags: getCheckedTags()});
  })

  function getCheckedTags() {
    return Object.keys(window.tagEls).reduce((acc, tag) => {
      acc[tag] = window.tagEls[tag].checked
      return acc
    }, {})
  }

  window.gridNodeAddToggle = document.getElementById("add-object-grid-node")
  window.dragAddToggle = document.getElementById("add-object-drag")
  window.dotAddToggle = document.getElementById("add-object-dot")
  window.instantAddToggle = document.getElementById("instant-add")
  window.gridNodeAddToggle.checked = true;
}

export default {
  init
}
