// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var monster = {};
var monstersCaught = 0;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Reset the game when the player catches a monster
var reset = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;
	hero._x = hero.x
	hero._y = hero.y

	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 64));
	monster.y = 32 + (Math.random() * (canvas.height - 64));
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
	if (
		hero._x < (monster.x + 40)
		&& monster.x < (hero._x + 40)
		&& hero._y < (monster.y + 40)
		&& monster.y < (hero._y + 40)
	) {
		illegal = true
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
	ctx.fillRect(hero.x, hero.y, 40, 40);
	ctx.fillRect(monster.x, monster.y, 40, 40);

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	// ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);
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
reset();
main();
