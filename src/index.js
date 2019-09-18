import './styles/index.scss'
import chat from './js/chat.js'
import input from './js/input.js'
import collisions from './js/collisions.js'
import camera from './js/camera.js'
import mapEditor from './js/mapeditor.js'
import objects from './js/objects.js'
import battle from './js/battle.js'

objects.push({
	width: 50,
	height: 50,
	obstacle: true,
	onCollide: () => {
    flags.showChat = true

    flags.heroPaused = true
    current.chat = [
      ["They call me unstoppable joe because I kind"],
      ["of have a reputation around here."],
      ["I’ve never been beaten in a fight"],
      ["Because I am both strong and agile."],
      ["What’s that, punk? You don’t believe me!?"],
      ["You think you have what it takes?"],
      ["Hope you like delis..."],
      ["cuz I’m about to give you a knuckle sandwich"],
      ["extra ham"]
    ]
    current.chat.onChatEnd = function(){
      battle.start(game, 20, 1000)
    }
  },
  x: 3290 , y: 580,
  name: 'unstoppable joe',
})

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 380;
canvas.id = 'game'
document.body.appendChild(canvas);

const useMapEditor = localStorage.getItem('useMapEditor')
if(useMapEditor){
  var button = document.createElement("button");
  button.value = 'save new objects'
  button.id = 'savebutton'
  document.body.appendChild(button);

  var nameinput = document.createElement("input");
  nameinput.id = 'nameinput'
  document.body.appendChild(nameinput);
}

var game = {
  paused: false,
}

// Game objects
var hero = {
	speed: 256, // movement in pixels per second
	width: 40,
	height: 40,
  paused: false,
  x: 3266.666666666667 , y: 483.33333333333337
};
hero._x = hero.x
hero._y = hero.y


// hero = JSON.parse(localStorage.getItem('hero'))

var flags = {
  showChat: false,
  heroPaused: false,
}

const current = {
  chat: []
}

var start = function () {
  input.start()
  chat.start(current, flags)
  if(useMapEditor) mapEditor.init(ctx, objects)

	// // Throw the monster somewhere on the screen randomly
	// objects[0].x = Math.floor(32 + (Math.random() * (canvas.width - 64)));
	// objects[0].y = Math.floor(32 + (Math.random() * (canvas.height - 64)));
};

// Update game objects
var update = function (modifier) {
  if(game.mode === 'battle'){
    battle.update(ctx, modifier)

    return
  }
  if(game.paused) return

  chat.update(current.chat)
  input.update(flags, hero, modifier)
  collisions.check(hero, objects)
  localStorage.setItem('hero', JSON.stringify(hero));
};

// Draw everything
var render = function () {

  if(game.mode === 'battle'){
    battle.render(ctx)

    return
  }

  //reset background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

  camera.set(ctx, hero)
	ctx.fillStyle = 'white';
	for(let i = 0; i < objects.length; i++){
    camera.drawObject(ctx, objects[i])
	}

  camera.drawObject(ctx, hero);

  chat.render(ctx, flags, current.chat);
};

// Draw everything
var renderMapEditor = function () {
  //reset background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = 'white';
	for(let i = 0; i < objects.length; i++){
    if(objects[i].color) ctx.fillStyle = objects[i].color
    mapEditor.drawObject(ctx, objects[i])
    ctx.fillStyle = 'white';
	}
  mapEditor.drawObject(ctx, hero);

  mapEditor.render(ctx)
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	if(useMapEditor === 'true') {
    renderMapEditor()
  }else {
    render();
  }

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
start();
main();
