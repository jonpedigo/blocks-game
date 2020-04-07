const keysDown = {}

function init(){

  window.hero = JSON.parse(JSON.stringify(window.defaultHero))
  window.hero.color = 'rgba(255,255,255,0.1)'
  window.hero.id = 'ghost'
  window.heros.ghost = window.hero

  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true

    //select left
    if(keysDown['188']){
      let heroNames = Object.keys(window.heros)
      for(let i = 0; i < heroNames.length; i++) {
        if(window.heros[heroNames[i]].id === window.hero.id) {
          if(i === 0) {
            window.hero = window.heros[heroNames[heroNames.length-1]]
          } else {
            window.hero = window.heros[heroNames[i-1]]
          }
          break;
        }
      }
      return
    }

    //select right
    if(keysDown['190']){
      let heroNames = Object.keys(window.heros)
      for(let i = 0; i < heroNames.length; i++) {
        if(window.heros[heroNames[i]].id === window.hero.id) {
          if(i === heroNames.length - 1) {
            window.hero = window.heros[heroNames[0]]
          } else {
            window.hero = window.heros[heroNames[i+1]]
          }
          break;
        }
      }
      return
    }

  }, false)

  window.addEventListener("keyup", function (e) {
	   delete keysDown[e.keyCode]
  }, false)


}

export default {
  init,
}
