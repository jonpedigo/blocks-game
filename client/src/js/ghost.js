const keysDown = {}

function init(){
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

function update(delta) {
  localStorage.setItem('ghostData', JSON.stringify({selectedHeroId: window.hero.id, ghost: window.heros.ghost}))
}

function loaded() {
  let ghostData = JSON.parse(localStorage.getItem('ghostData'));
  if(ghostData && ghostData.selectedHeroId) {
    window.hero = JSON.parse(JSON.stringify(window.defaultHero))
    if(window.heros[ghostData.selectedHeroId]) window.hero.id = ghostData.selectedHeroId
    else window.hero.id = 'ghost'
    if(window.hero.id == 'ghost') {
      window.hero.color = 'rgba(255,255,255,0.1)'
      window.heros.ghost = window.hero
    } else {
      window.heros = {'ghost': ghostData.ghost}
    }
  } else {
    window.hero = JSON.parse(JSON.stringify(window.defaultHero))
    window.hero.color = 'rgba(255,255,255,0.1)'
    window.hero.id = 'ghost'
    window.heros.ghost = window.hero
  }
}

export default {
  init,
  update,
  loaded,
}
