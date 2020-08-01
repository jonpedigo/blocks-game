window.defaultParticleEmitterData = {
  smallFire: {
    "alpha": {
      "start": 0.62,
      "end": 0
    },
    "scale": {
      "start": 0.05,
      "end": 0.3,
      "minimumScaleMultiplier": .05
    },
    "color": {
      "start": "#fff191",
      "end": "#ff622c"
    },
    "speed": {
      "start": 100,
      "end": 50,
      "minimumSpeedMultiplier": 1
    },
    "acceleration": {
      "x": 0,
      "y": 0
    },
    "maxSpeed": 0,
    "startRotation": {
      "min": 265,
      "max": 275
    },
    "noRotation": false,
    "rotationSpeed": {
      "min": 50,
      "max": 50
    },
    "lifetime": {
      "min": 0.01,
      "max": 0.1
    },
    "blendMode": "normal",
    "frequency": 0.001,
    "emitterLifetime": -1,
    "maxParticles": 1000,
    "pos": {
      "x": 0,
      "y": 0,
    },
    "addAtBack": false,
    "spawnType": "circle",
    "spawnCircle": {
      "x": 0,
      "y": 0,
      "r": 2,
    },
    particles: ['https://pixijs.io/pixi-particles-editor/assets/images/particle.png', 'https://pixijs.io/pixi-particles-editor/assets/images/Fire.png']
  },
  trail: {
  	"alpha": {
  		"start": 0.5,
  		"end": 0.01
  	},
  	"scale": {
  		"start": 1,
  		"end": 0.3,
  		"minimumScaleMultiplier": 1
  	},
  	"color": {
  		"start": "#e3f9ff",
  		"end": "#0ec8f8"
  	},
  	"speed": {
  		"start": 0,
  		"end": 0,
  		"minimumSpeedMultiplier": 1
  	},
  	"acceleration": {
  		"x": 0,
  		"y": 0
  	},
  	"maxSpeed": 0,
  	"startRotation": {
  		"min": 0,
  		"max": 0
  	},
  	"noRotation": false,
  	"rotationSpeed": {
  		"min": 0,
  		"max": 0
  	},
  	"lifetime": {
  		"min": 0.025,
  		"max": 0.025
  	},
  	"blendMode": "normal",
  	"frequency": 0.001,
  	"emitterLifetime": -1,
  	"maxParticles": 1000,
  	"pos": {
  		"x": 0,
  		"y": 0
  	},
  	"addAtBack": false,
  	"spawnType": "point"
  },
  spinOff: {
  	"alpha": {
  		"start": 1,
  		"end": 1,
  	},
  	"scale": {
  		"start": 1,
  		"end": 1,
  		"minimumScaleMultiplier": 1
  	},
  	"color": {
  		"start": "#ffffff",
  		"end": "#757575"
  	},
  	"speed": {
  		"start": 40000,
  		"end": 40000,
  		"minimumSpeedMultiplier": 1
  	},
  	"acceleration": {
  		"x": 0,
  		"y": 0
  	},
  	"maxSpeed": 0,
  	"startRotation": {
  		"min": 0,
  		"max": 360,
  	},
  	"noRotation": false,
  	"rotationSpeed": {
  		"min": 20000,
  		"max": 20000
  	},
  	"lifetime": {
  		"min": 100,
  		"max": 100,
  	},
  	"blendMode": "normal",
  	"ease": [
  		{
  			"s": 0,
  			"cp": 0.329,
  			"e": 0.548
  		},
  		{
  			"s": 0.548,
  			"cp": 0.767,
  			"e": 0.876
  		},
  		{
  			"s": 0.876,
  			"cp": 0.985,
  			"e": 1
  		}
  	],
  	"frequency": 0.001,
  	"emitterLifetime": 100,
  	"maxParticles": 1,
  	"pos": {
  		"x": 0,
  		"y": 0
  	},
  	"addAtBack": true,
  	"spawnType": "point"
  },
  explode: {
  	"alpha": {
  		"start": 1,
  		"end": 1
  	},
  	"scale": {
  		"start": 1,
  		"end": 1,
  		"minimumScaleMultiplier": 1
  	},
  	"color": {
  		"start": "#ffffff",
  		"end": "#ffffff"
  	},
  	"speed": {
  		"start": 20000,
  		"end": 0,
  		"minimumSpeedMultiplier": 0.4
  	},
  	"acceleration": {
  		"x": 0,
  		"y": 0
  	},
  	"maxSpeed": 0,
  	"startRotation": {
  		"min": 0,
  		"max": 360
  	},
  	"noRotation": false,
  	"rotationSpeed": {
  		"min": 0,
  		"max": 0
  	},
  	"lifetime": {
  		"min": 1000,
  		"max": 1000
  	},
  	"blendMode": "normal",
  	"ease": [
  		{
  			"s": 0,
  			"cp": 0.329,
  			"e": 0.548
  		},
  		{
  			"s": 0.548,
  			"cp": 0.767,
  			"e": 0.876
  		},
  		{
  			"s": 0.876,
  			"cp": 0.985,
  			"e": 1
  		}
  	],
  	"frequency": 0.00001,
  	"emitterLifetime": 10,
  	"maxParticles": 20,
  	"pos": {
  		"x": 0,
  		"y": 0
  	},
  	"addAtBack": true,
  	"spawnType": "point"
  }
}

window.particleEmitters = {...window.defaultParticleEmitterData}
