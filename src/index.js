import './styles/index.scss'
import chat from './js/chat.js'

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

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Reset the game when the player catches a monster
var start = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;
	hero._x = hero.x
	hero._y = hero.y

	// Throw the monster somewhere on the screen randomly
	objects[0].x = Math.floor(32 + (Math.random() * (canvas.width - 64)));
	objects[0].y = Math.floor(32 + (Math.random() * (canvas.height - 64)));
};

// Update game objects
var update = function (modifier) {
	let illegal = false

	if (38 in keysDown) { // Player holding up
		hero._y = hero.y - hero.speed * modifier;
	}
	if (40 in keysDown) { // Player holding down
		hero._y = hero.y + hero.speed * modifier;
	}
	if (37 in keysDown) { // Player holding left
		hero._x = hero.x - hero.speed * modifier;
	}
	if (39 in keysDown) { // Player holding right
		hero._x = hero.x + hero.speed * modifier;
	}

	// Are they touching?
	for(let i = 0; i < objects.length; i++){
		if (
			hero._x < (objects[i].x + objects[i].width)
			&& objects[i].x < (hero._x + hero.width)
			&& hero._y < (objects[i].y + objects[i].height)
			&& objects[i].y < (hero._y + hero.height)
		) {
			if(objects[i].obstacle) illegal = true
			if(objects[i].onCollide) objects[i].onCollide()
		}
	}

	if(illegal) {
		hero._x = hero.x
		hero._y = hero.y
	}

	if(!illegal){
		hero.x = hero._x
		hero.y = hero._y
	}
};

// Draw everything
var render = function () {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'white';
	ctx.fillRect(hero.x, hero.y, hero.width, hero.height);

	for(let i = 0; i < objects.length; i++){
		ctx.fillRect(objects[i].x, objects[i].y, objects[i].width, objects[i].height);
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
