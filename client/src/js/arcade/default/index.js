import collisions from '../../utils/collisions'
import gridTool from '../../utils/grid.js'
import pathfinding from '../../utils/pathfinding.js'
import action from './action'
import particles from '../../map/particles.js'

// once we have loaded up the game from the server for the first time
// interact with values loaded by the game, the values of other services
function onGameLoaded() {

}

function onGameUnload() {

}

function onGameStart() {

}

function onKeyDown(keyCode, hero) {
  if(hero.flags.paused || GAME.gameState.paused) return
  // for keyCode 88 ( x ) can conflict with interact engine - && !hero._interactableObject

  if(keyCode === 90) {
    if(hero.actionButtonBehavior === 'shootBullet') {
      action.shootBullet(hero)
    }
    if(hero.actionButtonBehavior === 'dropWall') {
      action.dropWall(hero)
    }
  }
}

function onUpdateHero(hero, keysDown, delta) {
  if(hero.flags.paused || GAME.gameState.paused) return
}

function onUpdateObject(object, delta) {

}

function onObjectCollide(agent, collider, result, removeObjects, respawnObjects, hero) {

}

function onUpdate(delta) {

}

function onRender(ctx) {
  if(HERO.hero) {

    // got some gradients to work..
    // let startx = (HERO.hero.x + 20)/window.camera.multiplier - window.camera.x
    // let starty = (HERO.hero.y - 40)/window.camera.multiplier - window.camera.y
    // let endx = (HERO.hero.x + 20)/window.camera.multiplier - window.camera.x
    // let endy = (HERO.hero.y - 20)/window.camera.multiplier - window.camera.y
    // var cx=250;
    // var cy=250;
    // var r=30;
    // var PI2=Math.PI*2;
    //
    // var gradient=ctx.createLinearGradient(startx,starty, endx, endy);
    // gradient.addColorStop(0.00,"transparent");
    // gradient.addColorStop(1.00,"white");
    //
    // ctx.lineWidth=40/window.camera.multiplier
    // ctx.lineCap="square";
    // ctx.beginPath();
    // ctx.moveTo(startx,starty);
    // ctx.lineTo(endx,endy);
    // ctx.strokeStyle=gradient;
    // ctx.stroke();

    // ctx.beginPath();
    // ctx.arc(75,75,20,0,PI2);
    // ctx.closePath();
    // ctx.fillStyle="gold";
    // ctx.globalAlpha=0.50;
    // ctx.fill();
    // ctx.globalAlpha=1.00;
    //
    // ctx.beginPath();
    // ctx.arc(75,75,20,0,PI2);
    // ctx.closePath();
    // ctx.fillStyle="gold";
    // ctx.shadowColor="gold";
    // ctx.shadowBlur=5;
    // ctx.fill();

    // ctx.strokeStyle = 'white'
    // ctx.lineWidth=1;
    //
    // if(HERO.hero.directions.down) {
    //   let sWidth = 17.5;
    //   let sHeight = 20;
    //   var path=new Path2D();
    //   let x = HERO.hero.x/window.camera.multiplier - window.camera.x
    //   let y = (HERO.hero.y-20)/window.camera.multiplier - window.camera.y
    //   path.moveTo(x + (sWidth/2) +5, y+ sHeight/2);
    //   path.lineTo(x + (sWidth/2), y+ (sHeight/2)-10);
    //   path.lineTo(x + (sWidth/2)-5, y + sHeight/2);
    //   ctx.fill(path);
    // } else {
    //
    // }
  }
}

function onHeroCollide(hero, collider, result, removeObjects, respawnObjects) {

}

function onHeroInteract(hero, collider, result, removeObjects, respawnObjects) {

}

export default {
  onGameLoaded,
  onGameStart,
  onGameUnload,
  onKeyDown,
  onUpdateHero,
  onUpdate,
  onUpdateObject,
  onRender,
  onObjectCollide,
  onHeroCollide,
  onHeroInteract
}
