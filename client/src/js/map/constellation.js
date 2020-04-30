window.showUniverse = false
window.constellationDistance = 4000

function Star(x,y,r,color){
    this.x = x;
    this.y = y;
    this.r = r;
    this.rChange = 0.006;
    // this.vx = Math.floor(Math.random()*4+1);
    // this.vy = Math.floor(Math.random()*4+1);
    this.color = color;
}

let camera = {
  x: 0,
  y: 0
}

Star.prototype = {
    constructor: Star,
    render: function(){

      let hero = window.hero
      if(role.isPlayEditor) hero = window.editingHero
      let multiplier = (hero.animationZoomMultiplier)/window.constellationDistance

      context.beginPath();
      context.arc(((this.x/multiplier ) -  camera.x) , ((this.y/multiplier ) -  camera.y) , (this.r / multiplier), 0, 2*Math.PI, false);
      context.shadowBlur = 2;
      context.shadowColor = "white";
      context.fillStyle = this.color;
      context.fill();
    },
    update: function(){
       if (this.r > .505 || this.r < .01 || ((Math.random() * 1) < .1)){
           this.rChange = - this.rChange;
       }
       this.r += this.rChange;
    }
}

function randomColor(){
        var arrColors = ["ffffff", "ffecd3"];
        return "#"+arrColors[Math.floor((Math.random()*2))];
}


function update(){
  for(let i = 0; i < arrStars.length; i ++){
      arrStars[i].update();
  }
}

function animate(){
  if(window.constellationDistance === window.hero.animationZoomMultiplier) {
    update();
  }

  let hero = window.hero
  if(role.isPlayEditor) hero = window.editingHero
  /*
    Remove comments below these for a cool trailing effect & comment
    out the context.clearRect.
  */
    // context.fillStyle = 'rgba(255, 255, 255, .1)';
    // context.fillRect(0,0,window.playerCanvasWidth,window.playerCanvasHeight);
    // context.clearRect(0,0,window.playerCanvasWidth,window.playerCanvasHeight);
    let multiplier = (hero.animationZoomMultiplier)/window.constellationDistance

    camera.x = ((window.playerCanvasWidth/2)/multiplier) - window.playerCanvasWidth /2
    camera.y = ((window.playerCanvasHeight/2)/multiplier) -window.playerCanvasHeight /2

    for(var i = 0; i < arrStars.length; i++){
      arrStars[i].render();
    }
}

window.arrStars = [];
let context;
function init(ctx) {
  context = ctx
  for(let i = 0; i < 800; i++){
      var randX = Math.floor((Math.random()*(window.playerCanvasWidth))+1);
      var randY = Math.floor((Math.random()*(window.playerCanvasHeight))+1);
      var randR = Math.random() * .3 + .01;

      var star = new Star(randX, randY, randR, randomColor());
      arrStars.push(star);
  }

}

export default {
  init,
  animate
}
