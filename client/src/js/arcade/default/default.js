import collisions from '../../utils/collisions'
import gridUtil from '../../utils/grid.js'
import pathfinding from '../../utils/pathfinding.js'
import action from './action'
import particles from '../../map/particles.js'

export default class CustomGame{
  onGameLoaded() {

  }

  onGameUnload() {

  }

  onGameStart() {

  }

  onKeyDown(keyCode, hero) {
    if(hero.flags.paused || GAME.gameState.paused) return
    // for keyCode 88 ( x ) can conflict with interact engine - && !hero.interactableObject

    if(keyCode === 90) {
      if(hero.actionButtonBehavior === 'shootBullet') {
        action.shootBullet(hero)
      }
      if(hero.actionButtonBehavior === 'dropWall') {
        action.dropWall(hero)
      }
    }
  }

  onUpdateHero(hero, keysDown, delta) {
    if(hero.flags.paused || GAME.gameState.paused) return
  }

  onUpdateObject(object, delta) {

  }

  onObjectCollide(agent, collider, result, removeObjects, respawnObjects, hero) {

  }

  onUpdate(delta) {

  }

  onRender(ctx) {
    if(GAME.heros[HERO.id]) {

      // got some gradients to work..
      // let startx = (GAME.heros[HERO.id].x + 20)/window.camera.multiplier - window.camera.x
      // let starty = (GAME.heros[HERO.id].y - 40)/window.camera.multiplier - window.camera.y
      // let endx = (GAME.heros[HERO.id].x + 20)/window.camera.multiplier - window.camera.x
      // let endy = (GAME.heros[HERO.id].y - 20)/window.camera.multiplier - window.camera.y
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
      // if(GAME.heros[HERO.id].directions.down) {
      //   let sWidth = 17.5;
      //   let sHeight = 20;
      //   var path=new Path2D();
      //   let x = GAME.heros[HERO.id].x/window.camera.multiplier - window.camera.x
      //   let y = (GAME.heros[HERO.id].y-20)/window.camera.multiplier - window.camera.y
      //   path.moveTo(x + (sWidth/2) +5, y+ sHeight/2);
      //   path.lineTo(x + (sWidth/2), y+ (sHeight/2)-10);
      //   path.lineTo(x + (sWidth/2)-5, y + sHeight/2);
      //   ctx.fill(path);
      // } else {
      //
      // }
    }
  }

  onHeroCollide(hero, collider, result, removeObjects, respawnObjects) {

  }

  onHeroInteract(hero, collider, result, removeObjects, respawnObjects) {

  }
}
