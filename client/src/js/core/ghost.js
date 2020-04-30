const keysDown = {}
import gridTool from '../utils/grid.js'

function init(){
  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true

    //select left
    if(keysDown['188']){
      let heroNames = Object.keys(GAME.heros)
      for(let i = 0; i < heroNames.length; i++) {
        if(HERO.hero.id === 'ghost') {
          HERO.hero = GAME.heros[heroNames[heroNames.length-1]]
          break
        }
        if(GAME.heros[heroNames[i]].id === HERO.hero.id) {
          if(i === 0) {
            HERO.hero = HERO.ghost
          } else {
            HERO.hero = GAME.heros[heroNames[i-1]]
          }
          break;
        }
      }

      return
    }

    //select right
    if(keysDown['190']){
      let heroNames = Object.keys(GAME.heros)
      for(let i = 0; i < heroNames.length; i++) {
        if(HERO.hero.id === 'ghost') {
          HERO.hero = GAME.heros[heroNames[0]]
          break
        }
        if(GAME.heros[heroNames[i]].id === HERO.hero.id) {
          if(i === heroNames.length - 1) {
            HERO.hero = HERO.ghost
          } else {
            HERO.hero = GAME.heros[heroNames[i+1]]
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
  localStorage.setItem('ghostData', JSON.stringify({selectedHeroId: HERO.hero.id, ghost: PAGE.role.isGhostHero}))

  if(HERO.hero.id === 'ghost' && 16 in keysDown) {
    if (38 in keysDown) { // Player holding up
      HERO.hero.y -= GAME.grid.nodeSize
    }
    if (40 in keysDown) { // Player holding down
      HERO.hero.y += GAME.grid.nodeSize
    }

    if (37 in keysDown) { // Player holding left
      HERO.hero.x -= GAME.grid.nodeSize
    }

    if (39 in keysDown) { // Player holding right
      HERO.hero.x += GAME.grid.nodeSize
    }
  }

}

function getHero() {
  let ghostData = JSON.parse(localStorage.getItem('ghostData'));
  if(ghostData && ghostData.selectedHeroId) {
    HERO.ghost = ghostData.ghost
    if(GAME.heros[ghostData.selectedHeroId]) HERO.hero = GAME.heros[ghostData.selectedHeroId]
  }

  if(!HERO.ghost) HERO.ghost = JSON.parse(JSON.stringify(window.defaultHero))
  HERO.ghost.color = 'rgba(255,255,255,0.1)'
  HERO.ghost.arrowKeysBehavior = 'grid'
  HERO.ghost.id = 'ghost'
  gridTool.snapObjectToGrid(HERO.ghost)
  HERO.hero = HERO.ghost
  GAME.heros.ghost = HERO.ghost
}

export default {
  init,
  update,
  getHero,
}
