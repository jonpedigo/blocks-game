const keysDown = {}

let justChangedHerosLeft = false
let justChangedHerosRight = false

function init(hero){
  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true

    //if you press escape, cancel a drag
    if(e.keyCode === 27) {
      window.clickStart.x = null
      window.clickStart.y = null
    }

    if(keysDown['32']){
      console.log('x: ' + window.mousePos.x, ', y: ' + window.mousePos.y)
      return
    }


    // if shift +
    if(keysDown['16']) {

      // q and a zoom in and out
      if(e.keyCode === 81) {
        window.scaleMultiplier = window.scaleMultiplier * 1.1
      }
      if(e.keyCode === 65) {
        window.scaleMultiplier = window.scaleMultiplier * .9
      }

      //, .
      if(keysDown['188'] || keysDown['190']){
        if(window.currentTool === window.TOOLS.HERO_EDITOR) {
          if(Object.keys(window.heros).length === 1 || !window.editingHero.id) {
            for(var heroId in window.heros) {
              window.setEditingHero(window.heros[heroId])
              window.findHero()
            }
            return
          }
        }
      }

      //select left
      if(keysDown['188']){
        if(window.currentTool === window.TOOLS.HERO_EDITOR) {
          let heroNames = Object.keys(window.heros)
          for(let i = 0; i < heroNames.length; i++) {
            if(window.heros[heroNames[i]].id === window.editingHero.id) {
              if(i === 0) {
                window.setEditingHero(window.heros[heroNames[heroNames.length-1]])
              } else {
                window.setEditingHero(window.heros[heroNames[i-1]])
              }
              window.findHero()

              break;
            }
          }
        }

        if(window.currentTool === window.TOOLS.SIMPLE_EDITOR) {
          if(window.objects.length == 0) return
          let newI = window.editingObject.i
          if(!window.editingObject.i) {
            newI = window.objects.length - 1
          } else {
            newI -= 1
          }
          window.editingObject = window.objects[newI]
          window.editingObject.i = newI
          window.objecteditor.set(window.editingObject)
          window.findObject()
        }
        return
      }

      //select right
      if(keysDown['190']){
        if(window.currentTool === window.TOOLS.HERO_EDITOR) {
          let heroNames = Object.keys(window.heros)
          for(let i = 0; i < heroNames.length; i++) {
            if(window.heros[heroNames[i]].id === window.editingHero.id) {
              if(i === heroNames.length - 1) {
                window.setEditingHero(window.heros[heroNames[0]])
              } else {
                window.setEditingHero(window.heros[heroNames[i+1]])
              }
              window.findHero()

              break;
            }
          }
        }

        if(window.currentTool === window.TOOLS.SIMPLE_EDITOR) {
          if(window.objects.length == 0) return
          let newI = window.editingObject.i
          if(window.editingObject.i === window.objects.length -1 || window.editingObject.i == null) {
            newI = 0
          } else {
            newI += 1
          }
          window.editingObject = window.objects[newI]
          window.editingObject.i = newI
          window.objecteditor.set(window.editingObject)
          window.findObject()
        }
        return
      }
    }

  }, false)

  window.addEventListener("keyup", function (e) {
     delete keysDown[e.keyCode]
  }, false)
}

function update(delta) {
  if (38 in keysDown) { // Player holding up
    window.camera.y -= (40 * window.scaleMultiplier)
  }
  if (40 in keysDown) { // Player holding down
    window.camera.y += (40 * window.scaleMultiplier)
  }
  if (37 in keysDown) { // Player holding left
    window.camera.x -= (40 * window.scaleMultiplier)
  }
  if (39 in keysDown) { // Player holding right
    window.camera.x += (40 * window.scaleMultiplier)
  }
}

export default {
  init,
  update,
}
