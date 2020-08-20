import * as PIXI from 'pixi.js';
import { darken, lighten, getColorHex } from './utils.js'
import '../../libraries/particleLibrary.js'

const pixiParticles = require('pixi-particles');

function createDefaultEmitter(stage, gameObject, emitterDataName, options) {
  const startPos = {x: gameObject.width/2 * MAP.camera.multiplier, y: gameObject.height/2 * MAP.camera.multiplier}

  const particleData = {..._.cloneDeep(window.defaultParticleEmitterData[emitterDataName]), pos: startPos}

  if(options.matchObjectColor) {
    let color = gameObject.color || GAME.world.defaultObjectColor
    particleData.color.start = color
    // if(emitterDataName == 'trail') {
    //   particleData.color.end = lighten(color)
    // } else {
      particleData.color.end = color
    // }
  }

  let particles = [PIXIMAP.textures.solidcolorsprite]
  if(particleData.particles) {
    particles = particleData.particles
    particles = particles.map(p => PIXI.Texture.from(p))
  }

  if(options.scaleToGameObject) {
    const modifyScaleX = (gameObject.width/particles[0]._frame.width)
    // const modifyScaleY = (gameObject.height/particles[0]._frame.height)
    particleData.scale.start = modifyScaleX * particleData.scale.start
    particleData.scale.end = modifyScaleX * particleData.scale.end
    // particleData.scale.minimumScaleMultiplier += modifyScaleX
  }

  var emitter = new pixiParticles.Emitter(
    stage,
    particles,
    particleData
  );

  emitter.data = particleData

  if(options.persistAfterRemoved) {
    emitter.persistAfterRemoved = true
  }

  // if (startEmitting) {
    emitter.emit = true
  // }

  return emitter;
}

function smallFire(arg) {
  createDefaultEmitter(arg, 'smallFire')
}

function trail(arg) {
  createDefaultEmitter(arg, 'trail')
}

export {
  createDefaultEmitter
}
