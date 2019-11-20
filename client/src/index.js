import './styles/index.scss'
import './styles/jsoneditor.css'
import chat from './js/chat.js'
import physics from './js/physics.js'
import input from './js/input.js'
import collisions from './js/collisions.js'
import camera from './js/camera.js'
import playEditor from './js/playeditor.js'
// import objects from './js/objects.js'
import battle from './js/battle.js'
import io from 'socket.io-client';

const socket = io('localhost:8081')
window.socket = socket
window.preferences = {}
window.objects = []
window.CONSTANTS = {
	PLAYER_CANVAS_WIDTH: 800,
	PLAYER_CANVAS_HEIGHT: 500,
}

window.socket.on('onAddObjects', (objectsAdded) => {
	window.objects = objectsAdded
})
window.socket.on('onUpdateObjects', (updatedObjects) => {
	window.objects = updatedObjects
})
window.socket.emit('askObjects')

window.socket.emit('askPreferences')

window.usePlayEditor = localStorage.getItem('useMapEditor') === 'true'


// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.CONSTANTS.PLAYER_CANVAS_WIDTH;
canvas.height = window.CONSTANTS.PLAYER_CANVAS_HEIGHT;
canvas.id = 'game'
document.body.appendChild(canvas);

// Game objects
window.hero = {
	speed: 256, // movement in pixels per second
	width: 40,
	height: 40,
  paused: false,
  x: 20 , y: 20,
}
hero._x = hero.x
hero._y = hero.y

if(!window.usePlayEditor) {
	var editor = document.getElementById("play-editor");
	editor.style = 'display:none';

	let savedHero = JSON.parse(localStorage.getItem('hero'));
	if(savedHero) window.hero = savedHero;
}

window.socket.on('onUpdatePreferences', (updatedPreferences) => {
	for(let key in updatedPreferences) {
		const value = updatedPreferences[key]
		window.preferences[key] = value

		if(key === 'lockCamera' && !window.usePlayEditor) {
			if(value.limitX) {
				camera.setLimit(value.limitX, value.limitY, value.centerX, value.centerY)
			} else {
				camera.clearLimit();
			}
		}

		if(key === 'gravity' && !window.usePlayEditor) {

		}
	}
})

var game = {
  paused: false,
}

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
  if(usePlayEditor) playEditor.init(ctx, objects, camera)
	main();
};

// Update game objects
var update = function (modifier) {
  if(game.mode === 'battle'){
    battle.update(ctx, modifier)
    return
  }
  if(game.paused) return

  chat.update(current.chat)
	physics.update(hero, objects, modifier)
  input.update(flags, hero, modifier)
  collisions.check(hero, objects)
  localStorage.setItem('hero', JSON.stringify(window.hero));
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
}

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	if(usePlayEditor) {
		playEditor.update(delta)
    playEditor.render(ctx, hero, objects);
  }else {
		update(delta / 1000);
		window.socket.emit('updateHeroPos', hero)
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
setTimeout(start, 1000);
