function openModal(title, body, icon) {
  return Swal.fire({
    icon,
    showClass: {
      popup: 'animated fadeInDown faster'
    },
    hideClass: {
      popup: 'animated fadeOutUp faster'
    },
    title: title,
    text: body,
  })
}

const QuestToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showClass: {
    popup: 'animated fadeInDown faster'
  },
  hideClass: {
    popup: 'animated fadeOutUp faster'
  },
  showConfirmButton: false,
  timer: 6000,
  timerProgressBar: true,
  onOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

function openQuestToast(title) {
  QuestToast.fire({
    title
  })
}

export default {
  openModal,
  openQuestToast,
}
