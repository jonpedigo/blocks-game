// import @geckos.io/snapshot-interpolation
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation'

// initialize the library
const SI = new SnapshotInterpolation(60)

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// CORE LOOP
///////////////////////////////
///////////////////////////////
let updateInterval = 1000/60
let renderInterval = 1000/24
let mapNetworkInterval = 1000/24
let completeNetworkInterval = 1000/.1
var frameCount = 0;
var fps, startTime, now, deltaRender, deltaMapNetwork, deltaCompleteNetwork, thenRender, thenMapNetwork, thenCompleteNetwork, thenUpdate, deltaUpdate;
window.w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
window.startGameLoop = function() {
  if(!GAME.objects || !GAME.world || !GAME.grid || !GAME.heros || (PAGE.role.isPlayer && !GAME.heros[HERO.id])) {
    console.log('game loaded without critical data, trying again soon', !GAME.objects, !GAME.world, !GAME.grid, !GAME.heros, (PAGE.role.isPlayer && !GAME.heros[HERO.id]))
    setTimeout(startGameLoop, 1000)
    return
  }

  if(PAGE.role.isHost && !PAGE.role.isTempHost) {
    window.socket.emit('hostJoined')
  }

  startTime = Date.now();
  thenMapNetwork = startTime;
  thenCompleteNetwork = startTime;
  thenUpdate = startTime;
  thenRender = startTime;

  // begin main loop
  mainLoop()
  if(PAGE.role.isHost) setInterval(() => {
    window.socket.emit('updateGameOnServerOnly', {
      id: GAME.id,
      metadata: GAME.metadata,
      version: GAME.version,
      heros: GAME.heros,
      gameState: GAME.gameState,
      objects: GAME.objects,
      world: GAME.world,
      grid: {...GAME.grid, nodes: null},
      defaultHero: GAME.defaultHero,
      library: GAME.library
    })
  }, 1000)
}

var mainLoop = function () {
  // Request to do this again ASAP
  requestAnimationFrame(mainLoop);

  // calc elapsed time since last loop
  now = Date.now();
  deltaRender = now - thenRender;
  deltaMapNetwork = now - thenMapNetwork;
  deltaCompleteNetwork = now - thenCompleteNetwork;
  deltaUpdate = now - thenUpdate;

  // if enough time has deltaRender, draw the next frame
  if (deltaRender > renderInterval) {
    if(deltaUpdate > 23) deltaRender = 23
      // Get ready for next frame by setting then=now, but...
      // Also, adjust for gameInterval not being multiple of 16.67
      thenRender = now - (deltaRender % renderInterval);
      render(deltaRender / 1000)
  }

  if (deltaUpdate > updateInterval) {
    if(deltaUpdate > 23) deltaUpdate = 23
    thenUpdate = now - (deltaUpdate % updateInterval);

    // TESTING...Report #seconds since start and achieved fps.
    var sinceStart = now - startTime;
    var currentUps = Math.round(1000 / (sinceStart / ++frameCount) * 100) / 100;
    if(frameCount > 10) {
      frameCount = 0
      startTime = Date.now()
    }

    PAGE.ups = currentUps;

    update(deltaUpdate / 1000);
  }

  if (PAGE.role.isHost && deltaCompleteNetwork > completeNetworkInterval) {
    thenCompleteNetwork = now - (deltaCompleteNetwork % completeNetworkInterval);
    // reset mapNetworkUpdate as well
    thenMapNetwork = thenCompleteNetwork
    completeNetworkUpdate()
  } else if (PAGE.role.isHost && deltaMapNetwork > mapNetworkInterval) {
    thenMapNetwork = now - (deltaMapNetwork % mapNetworkInterval);
    mapNetworkUpdate()
  }
};

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////// UPDATE GAME OBJECTS AND RENDER
///////////////////////////////
///////////////////////////////

function update(delta) {
  window.local.emit('onUpdate', delta)

  if(PAGE.role.isHost) {
    window.socket.emit('updateHerosPos', SI.snapshot.create(GAME.heroList.map((hero) => {
      return {
        id: hero.id,
        x: hero.x,
        y: hero.y,
      }
    })))
  }
}

function render(delta) {
  window.local.emit('onRender', delta)
}


window.updateHistory = {
  objectMap: {},
  heroMap: {},
  gameState: {},
  objectComplete: {},
  heroComplete: {},
}

function getDiff(historyProp, nextUpdate) {
  let diff
  if(window.updateHistory[historyProp]) {
    diff = window.getObjectDiff(nextUpdate, window.updateHistory[historyProp])
  } else {
    diff = nextUpdate
  }
  window.updateHistory[historyProp] = nextUpdate
  if(Array.isArray(diff)) diff = diff.filter((object) => !!object)
  return diff
}

let lastMapUpdate
function mapNetworkUpdate() {
  window.socket.emit('updateGameState', getDiff('gameState', _.cloneDeep(GAME.gameState) ))
  window.socket.emit('updateObjects', getDiff('objectMap', _.cloneDeep(GAME.objects.map(GAME.mod).map(OBJECTS.getMapState)) ))
  window.socket.emit('updateHeros', getDiff('heroMap', _.cloneDeep(GAME.heroList.map(GAME.mod).map(HERO.getMapState)) ))
}

function completeNetworkUpdate() {
  window.socket.emit('updateObjects', getDiff('objectComplete', _.cloneDeep(GAME.objects.map(GAME.mod)) ))
  const heroCompleteUpdate = getDiff('heroComplete', _.cloneDeep(GAME.heroList.map(GAME.mod)) )
  window.socket.emit('updateHeros', heroCompleteUpdate)
  // if(GAME.gameState.started && GAME.world.tags.storeEntireGameState) {
  //   let storedGameState = localStorage.getItem('gameStates')
  //   localStorage.setItem('gameStates', JSON.stringify({...JSON.parse(storedGameState), [GAME.id]: {...GAME, grid: {...GAME.grid, nodes: null }}}))
  // }
}
