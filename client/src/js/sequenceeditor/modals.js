import ImageSelect from '../components/ImageSelect.jsx'
import React from 'react'
import ReactDOM from 'react-dom'

function openSelectEffect(cb) {
  swal.fire({
    title: 'Choose an effect',
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    input: 'select',
    inputOptions: window.effectNameList,
  }).then(cb)
}

function openImageSelectModal(cb) {
  swal.fire({
    title: 'Choose an Image',
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    html:`<div id='image-select-container'></div>`,
  })

  // Mount React App
  const ref = React.createRef()
  ReactDOM.render(
    React.createElement(ImageSelect, { ref, onSelect: (image) => {
      swal.close()
      cb(image)
    } }),
    document.getElementById('image-select-container')
  )
}

function openEditCodeModal(title, code, cb) {
  swal.fire({
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
  swal.fire({
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
  swal.fire({
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
  swal.fire({
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
  openImageSelectModal,
  openEditCodeModal,
  openEditTextModal,
  openEditNumberModal,
  openWriteDialogueModal,
  openSelectEffect,
}
