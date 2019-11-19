import './styles/index.scss'
import './styles/jsoneditor.css'
import chat from './js/chat.js'
import input from './js/input.js'
import collisions from './js/collisions.js'
import camera from './js/camera.js'
import mapEditor from './js/mapeditor.js'
// import objects from './js/objects.js'
import battle from './js/battle.js'
import io from 'socket.io-client';
import JSONEditor from 'jsoneditor'

const socket = io('localhost:8081')
window.socket = socket
window.preferences = {}
window.CONSTANTS = {
	PLAYER_CANVAS_WIDTH: 500,
	PLAYER_CANVAS_HEIGHT: 300,
}

let objects = []
window.socket.on('onAddObjects', (objectsAdded) => {
	objects = objectsAdded
})
window.socket.on('onUpdateObjects', (updatedObjects) => {
	objects = updatedObjects
})
window.socket.emit('askObjects')

window.socket.emit('askPreferences')

window.useMapEditor = localStorage.getItem('useMapEditor')

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
  x: 20 , y: 20
}
hero._x = hero.x
hero._y = hero.y

let editor = null
if(window.useMapEditor === 'true') {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

  var button = document.getElementById("savebutton");
  button.id = 'savebutton'
  document.body.appendChild(button);

	var clearcameralock = document.getElementById("clearcameralock");
  clearcameralock.id = 'clearcameralock'
  document.body.appendChild(clearcameralock);
	clearcameralock.addEventListener('click', (e) => {
		camera.clearLimit();
		window.socket.emit('updatePreferences', { lockCamera: {} })
	})

  var nameinput = document.createElement("input");
  nameinput.id = 'nameinput'
  document.body.appendChild(nameinput);

	var jsoneditor = document.createElement("div");
	jsoneditor.id = 'jsoneditor'
	document.body.appendChild(jsoneditor);
  editor = new JSONEditor(jsoneditor, { onChangeJSON: (state) => {
		window.socket.emit('updateObjects', state.world)
		mapEditor.onChangeEditorState(state)
	}})
	window.socket.on('onHeroPosUpdate', (heroUpdated) => {
		hero = heroUpdated
	})
	window.socket.on('onUpdatePreferences', (updatedPreferences) => {
		for(let key in updatedPreferences) {
			const value = updatedPreferences[key]
			window.preferences[key] = value
		}
	})

	window.findHero = function() {
		mapEditor.setCamera(hero)
	}
} else {
	if(JSON.parse(localStorage.getItem('hero'))) window.hero = JSON.parse(localStorage.getItem('hero'))
	var button = document.getElementById("savebutton");
	document.body.removeChild(button);
	var clearcameralock = document.getElementById("clearcameralock");
	document.body.removeChild(clearcameralock);

	window.socket.on('onUpdatePreferences', (updatedPreferences) => {
		for(let key in updatedPreferences) {
			const value = updatedPreferences[key]
			window.preferences[key] = value

			if(key === 'lockCamera') {
				camera.setLimit(value.limitX, value.limitY, value.centerX, value.centerY)
			}
		}
	})
}

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
  if(useMapEditor === 'true') mapEditor.init(ctx, objects, editor)
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
}

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	if(useMapEditor === 'true') {
		mapEditor.update(delta)
    mapEditor.render(ctx, hero, objects);
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
start();
main();
