import Swal from 'sweetalert2';

function openSelectEffect(cb) {
  Swal.fire({
    title: 'Choose an effect',
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

function openWriteDialogueModal(dialogueStart = "", cb) {
  Swal.fire({
    title: 'Write the dialogue',
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    input: 'textarea',
    inputAttributes: {
      autocapitalize: 'off',
    },
    inputValue: dialogueStart,
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
  openEditCodeModal,
  openEditTextModal,
  openEditNumberModal,
  openWriteDialogueModal,
  openSelectEffect,
}
