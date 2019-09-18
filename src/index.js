import './styles/index.scss'
import chat from './js/chat.js'
import input from './js/input.js'
import collisions from './js/collisions.js'
import camera from './js/camera.js'

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

var game = {
  paused: false,
}

// Game objects
var hero = {
	speed: 256, // movement in pixels per second
	width: 40,
	height: 40,
  paused: false,
};
hero.x = canvas.width / 2;
hero.y = canvas.height / 2;
hero._x = hero.x
hero._y = hero.y

if(true){
  hero = JSON.parse(localStorage.getItem('hero'));
}

var objects = [{
	width: 20,
	height: 20,
	obstacle: true,
	onCollide: () => {
    flags.showChat = true
    hero.paused = true
  }
}];

var flags = {
  showChat: false,
}

// Reset the game when the player catches a monster
var start = function () {
  input.start()

	// Throw the monster somewhere on the screen randomly
	objects[0].x = Math.floor(32 + (Math.random() * (canvas.width - 64)));
	objects[0].y = Math.floor(32 + (Math.random() * (canvas.height - 64)));
};

// Update game objects
var update = function (modifier) {
  if(game.paused) return
  input.update(hero, modifier)
  collisions.check(hero, objects)
  localStorage.setItem('hero', JSON.stringify(hero));
};

// Draw everything
var render = function () {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

  camera.set(ctx, hero)
	ctx.fillStyle = 'white';
	camera.drawObject(ctx, hero);
	for(let i = 0; i < objects.length; i++){
    camera.drawObject(ctx, objects[i])
	}

  chat.render(ctx, flags);
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

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
