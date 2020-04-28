function init(){
  window.addEventListener("keydown", function (e) {
    //if you press escape, cancel everything
    if(e.keyCode === 27) {
      window.mergeDeep(window.mapEditor, window.defaultMapEditor)
    }
  })
}

export default {
  init
}
