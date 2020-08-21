import * as PIXI from 'pixi.js';
import { darken, lighten, getColorHex } from './utils.js'
import '../../libraries/particleLibrary.js'
import tinycolor from 'tinycolor2'

const pixiParticles = require('pixi-particles');

function updatePixiEmitterData(pixiChild, data, options) {

  const emitter = pixiChild.emitter
  // console.log(emitter, data)

  emitter.maxSpeed = data.maxSpeed
  emitter.acceleration.x = data.acceleration.x
  emitter.acceleration.y = data.acceleration.y

  emitter.maxLifetime = data.lifetime.max
  emitter.minLifetime = data.lifetime.min

  emitter.maxParticles= data.maxParticles
  emitter.minStartRotation = data.startRotation.min
  emitter.maxStartRotation = data.startRotation.max

  emitter.minimumScaleMultiplier = data.scale.minimumScaleMultiplier
  emitter.minimumSpeedMultiplier = data.speed.minimumSpeedMultiplier

  emitter.maxRotationSpeed = data.rotationSpeed.max
  emitter.minRotationSpeed = data.rotationSpeed.min

  emitter.frequency = data.frequency
  // emitter._frequency = data.frequency

  emitter.emitterLifetime = data.emitterLifetime
  // emitter._emitterLifetime = data.emitterLifetime

  emitter.noRotation = data.noRotation
  emitter.spawnType = data.spawnType
// particleImages: [Textures]
// frequency: getter?
// emitterLifetime: 10


  emitter.startScale.value = data.scale.start
  if(emitter.startScale.next) emitter.startScale.next.value = data.scale.end

  emitter.startAlpha.value = data.alpha.start
  if(emitter.startAlpha.next) emitter.startAlpha.next.value = data.alpha.end

  emitter.startSpeed.value = data.speed.start
  if(emitter.startSpeed.next) emitter.startSpeed.next.value = data.speed.end

  emitter.startColor.value = tinycolor(data.color.start).toRgb()
  if(emitter.startColor.next) emitter.startColor.next.value = tinycolor(data.color.end).toRgb()

// startColor: PropertyNode
// value: {r: 255, g: 255, b: 255}
  // debugger;
  emitter.data = data
}

function createDefaultEmitter(stage, gameObject, emitterDataName, options) {
  const startPos = {x: gameObject.width/2 * MAP.camera.multiplier, y: gameObject.height/2 * MAP.camera.multiplier}

  let particleData
  if(emitterDataName === 'custom' && options) {
    particleData = {..._.cloneDeep(options), pos: startPos}
  } else if(window.particleEmitterLibrary[emitterDataName]){
    particleData = {..._.cloneDeep(window.particleEmitterLibrary[emitterDataName]), pos: startPos}
  }

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
    const modifyScaleX = (gameObject.width/particles[0]._frame.width * MAP.camera.multiplier)
    // const modifyScaleY = (gameObject.height/particles[0]._frame.height)
    particleData.scale.start = modifyScaleX * particleData.scale.start
    particleData.scale.end = modifyScaleX * particleData.scale.end
    // particleData.scale.minimumScaleMultiplier = particleData.scale.minimumScaleMultiplier * MAP.camera.multiplier
  } else {
    particleData.scale.start = MAP.camera.multiplier * particleData.scale.start
    particleData.scale.end = MAP.camera.multiplier * particleData.scale.end
    // particleData.scale.minimumScaleMultiplier = particleData.scale.minimumScaleMultiplier * MAP.camera.multiplier
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
  updatePixiEmitterData,
  createDefaultEmitter
}
