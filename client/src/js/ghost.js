const keysDown = {}

function init(){
  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true

    //select left
    if(keysDown['188']){
      let heroNames = Object.keys(window.game.heros)
      for(let i = 0; i < heroNames.length; i++) {
        if(window.hero.id === 'ghost') {
          window.hero = window.game.heros[heroNames[heroNames.length-1]]
          break
        }
        if(window.game.heros[heroNames[i]].id === window.hero.id) {
          if(i === 0) {
            window.hero = window.ghostHero
          } else {
            window.hero = window.game.heros[heroNames[i-1]]
          }
          break;
        }
      }

      return
    }

    //select right
    if(keysDown['190']){
      let heroNames = Object.keys(window.game.heros)
      for(let i = 0; i < heroNames.length; i++) {
        if(window.hero.id === 'ghost') {
          window.hero = window.game.heros[heroNames[0]]
          break
        }
        if(window.game.heros[heroNames[i]].id === window.hero.id) {
          if(i === heroNames.length - 1) {
            window.hero = window.ghostHero
          } else {
            window.hero = window.game.heros[heroNames[i+1]]
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

  window.heroId = 'ghost'
  window.hero = JSON.parse(JSON.stringify(window.defaultHero))
  window.hero.color = 'rgba(255,255,255,0.1)'
  window.hero.id = window.heroId
  window.ghostHero = window.hero
}

function update(delta) {
  localStorage.setItem('ghostData', JSON.stringify({selectedHeroId: window.hero.id, ghost: window.ghostHero}))
}

function loaded() {
  let ghostData = JSON.parse(localStorage.getItem('ghostData'));
  if(ghostData && ghostData.selectedHeroId) {
    window.ghostHero = ghostData.ghost
    if(window.game.heros[ghostData.selectedHeroId]) window.heroId = ghostData.selectedHeroId
    else {
      window.hero = window.ghostHero
    }
  }
}

export default {
  init,
  update,
  loaded,
}
