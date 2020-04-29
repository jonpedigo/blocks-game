const keysDown = {}
import gridTool from './grid.js'

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
            window.hero = window.ghost
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
            window.hero = window.ghost
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
  window.hero.id = window.heroId
}

function update(delta) {
  localStorage.setItem('ghostData', JSON.stringify({selectedHeroId: window.hero.id, ghost: role.isGhostHero}))

  if(window.hero.id === 'ghost' && 16 in keysDown) {
    if (38 in keysDown) { // Player holding up
      hero.y -= w.game.grid.nodeSize
    }
    if (40 in keysDown) { // Player holding down
      hero.y += w.game.grid.nodeSize
    }

    if (37 in keysDown) { // Player holding left
      hero.x -= w.game.grid.nodeSize
    }

    if (39 in keysDown) { // Player holding right
      hero.x += w.game.grid.nodeSize
    }
  }

}

function loaded() {
  let ghostData = JSON.parse(localStorage.getItem('ghostData'));
  if(ghostData && ghostData.selectedHeroId) {
    window.ghost = ghostData.ghost
    if(window.game.heros[ghostData.selectedHeroId]) window.hero = window.game.heros[ghostData.selectedHeroId]
  }

  if(!window.ghost) window.ghost = JSON.parse(JSON.stringify(window.defaultHero))
  window.ghost.color = 'rgba(255,255,255,0.1)'
  window.ghost.arrowKeysBehavior = 'grid'
  window.ghost.id = 'ghost'
  gridTool.snapObjectToGrid(window.ghost)
  window.hero = window.ghost
  window.game.heros.ghost = window.ghost
}

export default {
  init,
  update,
  loaded,
}
