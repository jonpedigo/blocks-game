import Swal from 'sweetalert2';
import '../../styles/dark.min.css';

function addTrigger(owner, event) {
  PAGE.typingMode = true
  openSelectEffect((result) => {
    if(result && result.value) {
      const effect = window.triggerEffects[result.value]
      window.socket.emit('addTrigger', owner.id, { id: 'trigger-' + window.uniqueID(), event, effect })
    }
    PAGE.typingMode = false
  })
}

function editTrigger(owner, trigger) {
  PAGE.typingMode = true
  openTriggerModal(trigger, ({value}) => {
    if(!value) return
    const id = value[0]
    const effectValue = value[1]
    const objectTag = value[2]
    const objectId = value[3]
    const subjectTag = value[4]
    const subjectId = value[5]
    const subObjectName = value[6]
    const initialPool = Number(value[7])
    const eventThreshold = Number(value[8])

    const triggerUpdate = {
      id,
      effectValue,
      subObjectName,
      objectTag,
      objectId,
      subjectTag,
      subjectId,
      initialPool,
      eventThreshold
    }
    window.removeProps(triggerUpdate, { empty: true, null: true, undefined: true })

    const oldId = trigger.id
    Object.assign(trigger, triggerUpdate)

    window.socket.emit('editTrigger', owner.id, oldId, trigger)
    PAGE.typingMode = false
  })
}

function addNewSubObject(owner) {
  PAGE.typingMode = true
  openNameSubObjectModal((result) => {
    if(result && result.value && result.value.length) {
      window.socket.emit('addSubObject', owner, {}, result.value)
    }
    PAGE.typingMode = false
  })
}

function editMutationJSON(owner, trigger) {
  PAGE.typingMode = true
  openEditCodeModal('Edit Mutation JSON', trigger.mutationJSON || {}, (result) => {
    if(result && result.value) {
      const editedCode = JSON.parse(result.value)
      trigger.mutationJSON = editedCode
      window.socket.emit('editTrigger', owner.id, trigger.id, trigger)
    }
    PAGE.typingMode = false
  })
}

function editObjectCode(object, title, code) {
  PAGE.typingMode = true
  openEditCodeModal(title, code, (result) => {
    if(result && result.value) {
      const editedCode = JSON.parse(result.value)
      MAPEDITOR.networkEditObject(object, editedCode)
    }
    PAGE.typingMode = false
  })
}

function editProperty(object, property, currentValue) {
  PAGE.typingMode = true
  openEditTextModal(property, currentValue, (result) => {
    if(result && result.value && result.value.length) {
      MAPEDITOR.networkEditObject(object, { [property]: result.value})
    }
    PAGE.typingMode = false
  })
}

function editPropertyNumber(object, property, currentValue, options = {}) {
  PAGE.typingMode = true
  openEditNumberModal(property, currentValue, options, (result) => {
    if(result && result.value && result.value.length) {
      MAPEDITOR.networkEditObject(object, { [property]: result.value})
    }
    PAGE.typingMode = false
  })
}

function writeDialogue(object, dialogueIndex, cb) {
  PAGE.typingMode = true
  openWriteDialogueModal(object, object.heroDialogue[dialogueIndex], (result) => {
    if(result && result.value && result.value[0] && result.value[0].length) {
      if(!object.heroDialogue) object.heroDialogue = []
      object.tags.talker = true
      object.heroDialogue[dialogueIndex] = result.value[0]
      if(object.tags.talkOnHeroInteract == false && object.tags.talkOnHeroCollide == false) {
        object.tags.talkOnHeroInteract = true
      }
      if(cb) cb(object)
      else MAPEDITOR.networkEditObject(object, { heroDialogue: object.heroDialogue, tags: object.tags})
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
      else MAPEDITOR.networkEditObject(object, { name: object.name, namePosition: object.namePosition})
    }
    PAGE.typingMode = false
  })
}

function editQuest(hero, quest, cb) {
  PAGE.typingMode = true
  openQuestModal(quest, ({value}) => {
    if(!value) return
    const id = value[0]
    const startMessage = value[1]
    const goal = value[2]
    const completionMessage = value[3]
    const nextQuestId = value[4]

    const quest = {
      id,
      startMessage,
      goal,
      completionMessage,
      nextQuestId
    }

    const state = {
      completed: false,
      started: false,
      active: false,
    }

    let quests = hero.quests
    if(!quests) {
      quests = {}
    }
    quests[id] = quest

    let questState = hero.questState
    if(!questState) {
      questState = {}
    }
    questState[id] = state

    window.socket.emit('editHero', { id: hero.id, quests, questState })
    PAGE.typingMode = false
  })

}

function openSelectEffect(cb) {
  Swal.fire({
    title: 'How does this event effect the object?',
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    input: 'select',
    inputOptions: window.triggerEffects,
  }).then(cb)
}

function addGameTag() {
  Swal.fire({
    title: 'What is the name of the new group?',
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off'
    },
  }).then((result) => {
    if(result && result.value && result.value.length) {
      window.socket.emit('addGameTag', result.value)
    }
  })
}

function openNameSubObjectModal(cb) {
  Swal.fire({
    title: 'What is the name of the Sub Object?',
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off'
    },
  }).then(cb)
}

function addCustomInputBehavior(behaviorProp) {
  Swal.fire({
    title: `What is the name of the new ${behaviorProp}?`,
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off'
    },
  }).then((result) => {
    if(result && result.value && result.value.length) {
      const behaviorObject = {
        behaviorProp,
        behaviorName: result.value,
      }
      console.log(result.value, behaviorProp)
      window.socket.emit('updateGameCustomInputBehavior', [...GAME.customInputBehavior, behaviorObject])
    }
  })
}

function openEditCodeModal(title, code, cb) {
  Swal.fire({
    title,
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    customClass: 'swal-wide',
    html:"<div id='code-editor'></div>",
    preConfirm: () => {
      return codeEditor.getValue()
    }
  }).then(cb)

  const codeEditor = ace.edit("code-editor");
  codeEditor.setTheme("ace/theme/monokai");
  codeEditor.session.setMode("ace/mode/json");
  codeEditor.setValue(JSON.stringify(code, null, '\t'))
  codeEditor.setOptions({
    fontSize: "12pt",
  });
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
    preConfirm: (result) => {
      return [
        result
      ]
    }
  }).then(cb)
}

function openQuestModal(quest = { id: '', startMessage: '', goal: '', completionMessage: '', nextQuestId: ''}, cb) {
  Swal.fire({
    title: 'Quest Editor',
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    html:`<div class='swal-modal-input-label'>Name of Quest</div><input autocomplete="new-password" class='swal-modal-input' id='quest-id' value='${quest.id}'></input>
    <div class='swal-modal-input-label'>Start Message</div><textarea class='swal-modal-input' id='start-message'>${quest.startMessage}</textarea>
    <div class='swal-modal-input-label'>Quest Goal</div><input class='swal-modal-input' id='quest-goal' value='${quest.goal}'>
    <div class='swal-modal-input-label'>Completion Message</div><textarea class='swal-modal-input' id='completion-message'>${quest.completionMessage}</textarea>
    <div class='swal-modal-input-label'>Name quest to start on completion</div><input autocomplete="new-password" class='swal-modal-input' id='next-quest-id' value='${quest.nextQuestId}'></input>`,
    preConfirm: (result) => {
      return [
        document.getElementById('quest-id').value,
        document.getElementById('start-message').value,
        document.getElementById('quest-goal').value,
        document.getElementById('completion-message').value,
        document.getElementById('next-quest-id').value,
      ]
    }
  }).then(cb)
}

function openTriggerModal(trigger, cb) {
  const newTrigger = Object.assign({ id: '', effectValue: '', subObjectName: '', objectId: '', objectTag: '', subjectId: '', subjectTag: '', initialPool: 1, eventThreshold: -1}, trigger)
  Swal.fire({
    title: 'Trigger Editor',
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    html:`<div class='swal-modal-input-label'>Trigger Id</div><input autocomplete="new-password" class='swal-modal-input' id='trigger-id' value='${newTrigger.id}'></input>
    <div class='swal-modal-input-label'>Effect Value</div><input class='swal-modal-input' id='effect-value' value='${newTrigger.effectValue}'>
    <div class='swal-modal-input-label'>Object Tag</div><input class='swal-modal-input' id='object-tag' value='${newTrigger.objectTag}'>
    <div class='swal-modal-input-label'>Object Id</div><input class='swal-modal-input' id='object-id' value='${newTrigger.objectId}'>
    <div class='swal-modal-input-label'>Subject Tag</div><input class='swal-modal-input' id='subject-tag' value='${newTrigger.subjectTag}'>
    <div class='swal-modal-input-label'>Subject Id</div><input class='swal-modal-input' id='subject-id' value='${newTrigger.subjectId}'>
    <div class='swal-modal-input-label'>Sub Object Name</div><input class='swal-modal-input' id='sub-object-name' value='${newTrigger.subObjectName}'>
    <div class='swal-modal-input-label'>Initial Pool</div><input type="number" class='swal-modal-input' id='initial-pool' value='${newTrigger.initialPool}'>
    <div class='swal-modal-input-label'>Event Threshold</div><input type="number" class='swal-modal-input' id='event-threshold' value='${newTrigger.eventThreshold}'>`,
    preConfirm: (result) => {
      return [
        document.getElementById('trigger-id').value,
        document.getElementById('effect-value').value,
        document.getElementById('object-tag').value,
        document.getElementById('object-id').value,
        document.getElementById('subject-tag').value,
        document.getElementById('subject-id').value,
        document.getElementById('sub-object-name').value,
        document.getElementById('initial-pool').value,
        document.getElementById('event-threshold').value,
      ]
    }
  }).then(cb)
}

function openEditTextModal(property, currentValue, cb) {
  Swal.fire({
    title: 'Edit ' + property,
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    input: 'text',
    inputValue: currentValue,
    inputAttributes: {
      autocapitalize: 'off'
    }
  }).then(cb)
}

function openEditNumberModal(property, currentValue = 0, options = { range: false, min: null, max: null, step: 1 }, cb) {
  Swal.fire({
    title: 'Edit ' + property,
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    input: options.range ? 'range' : 'number',
    inputAttributes: {
      min: options.min,
      max: options.max,
      step: options.step,
    },
    inputValue: currentValue
  }).then(cb)
}

export default {
  addCustomInputBehavior,
  addGameTag,
  addNewSubObject,
  editObjectCode,
  editProperty,
  editPropertyNumber,
  editQuest,
  editMutationJSON,
  writeDialogue,
  nameObject,
  openEditCodeModal,
  addTrigger,
  editTrigger,
}
