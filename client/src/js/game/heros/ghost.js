const keysDown = {}
import gridUtil from '../../utils/grid.js'
import input from '../input.js'

class Ghost{
  onPageLoaded(){
    window.addEventListener("keydown", function (e) {
      keysDown[e.keyCode] = true

      //select left
      if(keysDown['188']){
        let heroIds = Object.keys(GAME.heros)
        for(let i = 0; i < heroIds.length; i++) {
          if(GAME.heros[heroIds[i]].id === HERO.id) {
            if(i === 0) {
              HERO.id = GAME.heros[heroIds[heroIds.length-1]].id
            } else {
              HERO.id = GAME.heros[heroIds[i-1]].id
            }
            break;
          }
        }

        return
      }

      //select right
      if(keysDown['190']){
        let heroIds = Object.keys(GAME.heros)
        for(let i = 0; i < heroIds.length; i++) {
          if(GAME.heros[heroIds[i]].id === HERO.id) {
            if(i === heroIds.length - 1) {
              HERO.id = GAME.heros[heroIds[0]].id
            } else {
              HERO.id = GAME.heros[heroIds[i+1]].id
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

  onUpdate(delta) {
    localStorage.setItem('ghostData', JSON.stringify({selectedHeroId: HERO.id, ghost: PAGE.role.isGhostHero}))

    if(HERO.id === 'ghost' && 16 in keysDown) {
      if (38 in keysDown) { // Player holding up
        GAME.heros[HERO.id].y -= GAME.grid.nodeSize
      }
      if (40 in keysDown) { // Player holding down
        GAME.heros[HERO.id].y += GAME.grid.nodeSize
      }

      if (37 in keysDown) { // Player holding left
        GAME.heros[HERO.id].x -= GAME.grid.nodeSize
      }

      if (39 in keysDown) { // Player holding right
        GAME.heros[HERO.id].x += GAME.grid.nodeSize
      }
      input.onUpdate(GAME.heros[HERO.id], GAME.keysDown, delta)
    }

    window.addEventListener('scroll', (e) => {
      console.log(e)
    })
  }

  onGameLoaded() {
    let ghostData = JSON.parse(localStorage.getItem('ghostData'));
    if(ghostData && ghostData.selectedHeroId) {
      HERO.ghost = ghostData.ghost
      if(GAME.heros[ghostData.selectedHeroId]) HERO.id = ghostData.selectedHeroId
    }

    if(!HERO.ghost) HERO.ghost = JSON.parse(JSON.stringify(window.defaultHero))
    HERO.ghost.color = 'rgba(255,255,255,0.1)'
    HERO.ghost.arrowKeysBehavior = 'grid'
    HERO.ghost.id = 'ghost'
    gridUtil.snapObjectToGrid(HERO.ghost)
    GAME.heros.ghost = HERO.ghost
  }
}

window.GHOST = new Ghost()
