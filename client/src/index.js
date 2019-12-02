import './styles/index.scss'
import './styles/jsoneditor.css'
import chat from './js/chat.js'
import physics from './js/physics.js'
import input from './js/input.js'
import collisions from './js/collisions.js'
import camera from './js/camera.js'
import playEditor from './js/playeditor.js'
import shadow from './js/shadow.js'
import shoot from './js/shoot.js'

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
	window.objects.push(...objectsAdded)
	objectsAdded.forEach((object) => {
		physics.addObject(object)
	})
})
window.socket.on('onUpdateObjects', (updatedObjects) => {
	Object.assign(window.objects, updatedObjects )
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
const defaultHero = {
	width: 40,
	height: 40,
  paused: false,
	name: 'hero',
  x: 50 , y: 250,
	velocityX: 0,
	velocityY: 0,
	velocityMax: 250,
	accY: 0,
	accX: 0,
	accDecayX: 0,
	accDecayY: 0,
	speed: 250,
	inputControlProp: 'position',
	gravity: 0,
}

window.hero = {...defaultHero}

if(!window.usePlayEditor) {
	var editor = document.getElementById("play-editor");
	editor.style = 'display:none';

	let savedHero = JSON.parse(localStorage.getItem('hero'));
	if(savedHero) window.hero = savedHero;
}

window.resetHero = function(heroIn) {
	physics.removeObject(window.hero)
	if(heroIn) {
		window.hero = heroIn
	} else {
		window.hero = { ...defaultHero }
	}
	localStorage.setItem('hero', JSON.stringify(window.hero));
	physics.addObject(window.hero)
}

window.socket.on('onUpdateHero', (updatedHero) => {
	window.resetHero(updatedHero)
})

physics.addObject(window.hero)

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
  input.init(hero)
  chat.init(current, flags)
	shoot.init(hero)
  if(usePlayEditor) playEditor.init(ctx, objects, hero, camera)
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
  input.update(flags, hero, modifier)
	physics.update(hero, objects, modifier)
  localStorage.setItem('hero', JSON.stringify(window.hero));
};

// Draw everything
var render = function () {
	let vertices = [...objects, window.hero].reduce((prev, object) => {
		prev.push({a:{x:object.x,y:object.y}, b:{x:object.x + object.width,y:object.y}})
		prev.push({a:{x:object.x + object.width,y:object.y}, b:{x:object.x + object.width,y:object.y + object.height}})
		prev.push({a:{x:object.x + object.width,y:object.y + object.height}, b:{x:object.x,y:object.y + object.height}})
		prev.push({a:{x:object.x,y:object.y + object.height}, b:{x:object.x,y:object.y}})
		return prev
	}, [])

  if(game.mode === 'battle'){
    battle.render(ctx)

    return
  }

  //reset background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	//set camera so we render everything in the right place
  camera.set(ctx, hero)

	window.preferences.renderStyle = 'outlines'
 	if (window.preferences.renderStyle === 'outlines') {
		ctx.strokeStyle = "#999";
		for(var i=0;i<vertices.length;i++){
			camera.drawVertice(ctx, vertices[i])
		}
	} else if(window.preferences.renderStyle === 'physics'){
		physics.drawSystem(ctx, vertices)
	} else {
		for(let i = 0; i < objects.length; i++){
			camera.drawObject(ctx, objects[i])
		}
	}

	// window.preferences.shadows = true
	if(window.preferences.shadows === true) {
		shadow.draw(ctx, vertices, hero)
	}

  camera.drawObject(ctx, hero);
  chat.render(ctx, flags, current.chat);
}

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;
	if(delta > 23) delta = 23

	if(usePlayEditor) {
		playEditor.update(delta)
    playEditor.render(ctx, hero, objects);
  }else {
		update(delta / 1000);
		window.socket.emit('updateHeroPos', hero)
    render();
		// physics.drawSystem(ctx, hero)
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
