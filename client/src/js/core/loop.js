import map from '../map/index.js'
import ghost from './ghost'
import constellation from '../map/constellation.js'
import mapEditor from '../mapeditor/index.js'
import PLAYEDITOR from '../playeditor/playeditor.js'

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// CORE LOOP
///////////////////////////////
///////////////////////////////
let updateInterval = 1000/60
let renderInterval = 1000/24
let networkInterval = 1000/8
var frameCount = 0;
var fps, startTime, now, deltaRender, deltaNetwork, thenRender, thenNetwork, thenUpdate, deltaUpdate;
window.w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
window.startGameLoop = function() {
  if(!GAME.objects || !GAME.world || !GAME.grid || !GAME.heros || (PAGE.role.isPlayer && !window.HERO.hero)) {
    console.log('game loaded without critical data, trying again soon', !GAME.objects, !GAME.world, !GAME.grid, !GAME.heros, (PAGE.role.isPlayer && !window.HERO.hero))
    setTimeout(startGameLoop, 1000)
    return
  }

  startTime = Date.now();
  thenNetwork = startTime;
  thenUpdate = startTime;
  thenRender = startTime;

  // begin main loop
  mainLoop()
}

var mainLoop = function () {
  // Request to do this again ASAP
  requestAnimationFrame(mainLoop);

  // calc elapsed time since last loop
  now = Date.now();
  deltaRender = now - thenRender;
  deltaNetwork = now - thenNetwork;
  deltaUpdate = now - thenUpdate;

  // if enough time has deltaRender, draw the next frame
  if (deltaRender > renderInterval) {
      // Get ready for next frame by setting then=now, but...
      // Also, adjust for gameInterval not being multiple of 16.67
      thenRender = now - (deltaRender % renderInterval);
      render(deltaRender / 1000)

      // TESTING...Report #seconds since start and achieved fps.
      var sinceStart = now - startTime;
      var currentFps = Math.round(1000 / (sinceStart / ++frameCount) * 100) / 100;
      if(frameCount > 10) {
        frameCount = 0
        startTime = Date.now()
      }

      window.fps = currentFps;
  }

  if (deltaUpdate > updateInterval) {
    if(deltaUpdate > 23) deltaUpdate = 23
    thenUpdate = now - (deltaUpdate % updateInterval);
    update(deltaUpdate / 1000);
  }

  if (PAGE.role.isHost && deltaNetwork > networkInterval) {
    thenNetwork = now - (deltaNetwork % networkInterval);
    networkUpdate()
  }
};

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// UPDATE GAME OBJECTS AND RENDER
///////////////////////////////
///////////////////////////////

function update(delta) {
  if(PAGE.role.isPlayer) {
    if(PAGE.role.isGhost) {
      ghost.update()
    }

    if(!PAGE.role.isGhost){
      localStorage.setItem('hero', JSON.stringify(HERO.hero))
      // we are locally updating the hero input as host
      if(!PAGE.role.isHost && !window.PAGE.typingMode) {
        window.socket.emit('sendHeroInput', GAME.keysDown, HERO.hero.id)
      }
    }
  }

  GAME.update(delta)
  mapEditor.update(delta)
}

function render(delta) {
  if(PAGE.role.isPlayEditor) {
    PLAYEDITOR.update(delta)
    PLAYEDITOR.render();
  }

  if(PAGE.role.isPlayer) {
    map.render(delta);
    /// DEFAULT GAME FX

    if(GAME.defaultCustomGame) {
      GAME.defaultCustomGame.render(MAP.ctx, delta)
    }

    /// CUSTOM GAME FX
    if(GAME.customGame) {
      GAME.customGame.render(MAP.ctx, delta)
    }

    /// CUSTOM GAME FX
    if(GAME.liveCustomGame) {
      GAME.liveCustomGame.render(MAP.ctx, delta)
    }
  }

  mapEditor.render()

  if(PAGE.role.isPlayer && HERO.hero.animationZoomMultiplier) {
    constellation.animate()
  }
}

function networkUpdate() {
  window.socket.emit('updateObjects', GAME.objects)
  window.socket.emit('updateGameState', GAME.gameState)
  window.socket.emit('updateWorldOnServerOnly', GAME.world)
  window.socket.emit('updateHeros', GAME.heros)
  if(GAME.gameState.started && GAME.world.storeEntireGameState) {
    let storedGameState = localStorage.getItem('gameStates')
    localStorage.setItem('gameStates', JSON.stringify({...JSON.parse(storedGameState), [GAME.id]: {...GAME, grid: {...GAME.grid, nodes: null }}}))
  }
  let timeout = window.lastDelta * 3
  if(timeout > 250) {
    timeout = 250
  }
}
