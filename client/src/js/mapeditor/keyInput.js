function init(){
  window.addEventListener("keydown", function (e) {
    //if you press escape, cancel everything
    if(e.keyCode === 27) {
      MAPEDITOR.initState()
    }
  })
}

export default {
  init
}
