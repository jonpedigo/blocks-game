function writeDialogue(object, dialogueIndex, cb) {
  PAGE.typingMode = true
  openWriteDialogueModal(object, object.heroUpdate.chat[dialogueIndex], (result) => {
    if(result && result.value[0] && result.value[0].length) {
      if(!object.heroUpdate) object.heroUpdate = {}
      if(!object.heroUpdate.chat) object.heroUpdate.chat = []
      object.tags.heroUpdate = true
      object.heroUpdate.chat[dialogueIndex] = result.value[0]
      if(!object.heroUpdate.flags) object.heroUpdate.flags = {}
      object.heroUpdate.flags.showChat = true
      object.heroUpdate.flags.paused = true
      if(result.value[1]) {
        object.tags.requireActionButton = true
      } else {
        object.tags.requireActionButton = false
      }
      if(cb) cb(object)
      else window.socket.emit('editObjects', [{id: object.id, heroUpdate: object.heroUpdate, tags: object.tags}])
    }
    PAGE.typingMode = false
  })
}

function nameObject(object, cb) {
  PAGE.typingMode = true
  openNameObjectModal(object, (result) => {
    if(result && result.value[0] && result.value[0].length) {
      object.name = result.value[0]
      object.namePosition = "center"
      if(result.value[1]) object.namePosition = "center"
      if(result.value[2]) object.namePosition = "above"
      if(cb) cb(object)
      else window.socket.emit('editObjects', [{id: object.id, name: object.name, namePosition: object.namePosition}])
    }
    PAGE.typingMode = false
  })
}

function openNameObjectModal(object, cb) {
  Swal.fire({
    title: 'Name object',
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    // html:'<canvas id="swal-canvas" width="200" height="200"></canvas>',
    html:"<input type='radio' name='name-where' checked id='center-name'>Center name within object</input><br><input type='radio' name='name-where' id='name-above'>Display name above object</input>",
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off'
    },
    preConfirm: (result) => {
      return [
        result,
        document.getElementById('center-name').checked,
        document.getElementById('name-above').checked,
      ]
    }
  }).then(cb)
}

function openWriteDialogueModal(object, dialogueStart = "", cb) {
  console.log(dialogueStart)
  Swal.fire({
    title: 'What does this object say?',
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    // html:'<canvas id="swal-canvas" width="200" height="200"></canvas>',
    // html:"<input type='radio' name='name-where' checked id='center-name'>Center name within object</input><br><input type='radio' name='name-where' id='name-above'>Display name above object</input>",
    input: 'textarea',
    inputAttributes: {
      autocapitalize: 'off',
    },
    inputValue: dialogueStart,
    html:"<input id='press-x' type='checkbox'>Press X to activate dialogue</input>",
    preConfirm: (result) => {
      return [
        result,
        document.getElementById('press-x').checked,
      ]
    }
  }).then(cb)
}

export default {
  writeDialogue,
  nameObject,
}
