const keysDown = {}

let justChangedHerosLeft = false
let justChangedHerosRight = false

function init(hero){
  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true

    // q and a zoom in and out
    if(e.keyCode === 81) {
      window.scaleMultiplier = window.scaleMultiplier * 1.1
    }
    if(e.keyCode === 65) {
      window.scaleMultiplier = window.scaleMultiplier * .9
    }

    //if you press escape, cancel a drag
    if(e.keyCode === 27) {
      window.clickStart.x = null
      window.clickStart.y = null
    }

    if(keysDown['32']){
      console.log('x: ' + window.mousePos.x, ', y: ' + window.mousePos.y)
      return
    }


    if(keysDown['188'] || keysDown['190']){
      delete window.heros['undefined']
      if(Object.keys(window.heros).length === 1 || !window.editingHero.id) {
        for(var heroId in window.heros) {
          window.setEditingHero(window.heros[heroId])
        }
        return
      }
    }

    //select left
    if(keysDown['188']){
      delete window.heros['undefined']
      if(window.currentTool === window.TOOLS.HERO_EDITOR) {
        let heroNames = Object.keys(window.heros)
        for(let i = 0; i < heroNames.length; i++) {
          if(window.heros[heroNames[i]].id === window.editingHero.id) {
            if(i === 0) {
              window.setEditingHero(window.heros[heroNames[heroNames.length-1]])
            } else {
              window.setEditingHero(window.heros[heroNames[i-1]])
            }
            break;
          }
        }
      }

      if(window.currentTool === window.TOOLS.SIMPLE_EDITOR) {

      }
      return
    }

    //select right
    if(keysDown['190']){
      delete window.heros['undefined']
      if(window.currentTool === window.TOOLS.HERO_EDITOR) {
        let heroNames = Object.keys(window.heros)
        for(let i = 0; i < heroNames.length; i++) {
          if(window.heros[heroNames[i]].id === window.editingHero.id) {
            if(i === heroNames.length - 1) {
              window.setEditingHero(window.heros[heroNames[0]])
            } else {
              window.setEditingHero(window.heros[heroNames[i+1]])
            }
            break;
          }
        }
      }

      if(window.currentTool === window.TOOLS.SIMPLE_EDITOR) {

      }
      return
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
