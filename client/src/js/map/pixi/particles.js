import * as PIXI from 'pixi.js';
import { darken, lighten, getColorHex } from './utils.js'
import '../../libraries/particleLibrary.js'
import tinycolor from 'tinycolor2'

const pixiParticles = require('pixi-particles');

function updatePixiEmitterData(pixiChild, gameObject, options) {

  const emitter = pixiChild.emitter
  const data = gameObject.liveEmitterData
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

  if(PAGE.role.isHost && emitter.spawnType !== data.spawnType) {
    window.socket.emit('resetLiveParticle', gameObject.id)
    return
  }

  emitter.spawnType = data.spawnType

  if(emitter.spawnType === 'burst') {
    emitter.angleStart = data.angleStart
    emitter.particleSpacing = data.particleSpacing
    emitter.particlesPerWave = data.particlesPerWave
  }

  const usesCircle = (emitter.spawnType === 'ring' || emitter.spawnType === 'circle')
  if(emitter.spawnCircle && usesCircle) {
    emitter.spawnCircle.radius = data.spawnCircle.r
    emitter.spawnCircle.minRadius = data.spawnCircle.minR
  } else if(PAGE.role.isHost && usesCircle) {
    window.socket.emit('resetLiveParticle', gameObject.id)
    return
  }

  const usesRect = emitter.spawnType === 'rect'
  if(emitter.spawnRect && usesRect) {
    emitter.spawnRect.width = data.spawnRect.w
    emitter.spawnRect.height = data.spawnRect.h
    emitter.spawnRect.x = data.spawnRect.x
    emitter.spawnRect.y = data.spawnRect.y
  } else if(PAGE.role.isHost && usesRect) {
    window.socket.emit('resetLiveParticle', gameObject.id)
    return
  }
// particleImages: [Textures]

  if(data.scaleToGameObject) {
    const modifyScaleX = (gameObject.width/PIXIMAP.textures.solidcolorsprite._frame.width * MAP.camera.multiplier)
    data.scale.start = modifyScaleX
    data.scale.end = modifyScaleX
  }

  emitter.startScale.value = data.scale.start
  if(emitter.startScale.next) emitter.startScale.next.value = data.scale.end
  else if(PAGE.role.isHost && data.scale.start !== data.scale.end) {
   window.socket.emit('resetLiveParticle', gameObject.id)
   return
  }

  emitter.startAlpha.value = data.alpha.start
  if(emitter.startAlpha.next) emitter.startAlpha.next.value = data.alpha.end
  else if(PAGE.role.isHost && data.alpha.start !== data.alpha.end) {
   window.socket.emit('resetLiveParticle', gameObject.id)
   return
  }

  emitter.startSpeed.value = data.speed.start
  if(emitter.startSpeed.next) emitter.startSpeed.next.value = data.speed.end
  else if(PAGE.role.isHost && data.speed.start !== data.speed.end && data.acceleration.x === 0 && data.acceleration.y === 0) {
   window.socket.emit('resetLiveParticle', gameObject.id)
   return
  }

  emitter.startColor.value = tinycolor(data.color.start).toRgb()
  if(emitter.startColor.next) emitter.startColor.next.value = tinycolor(data.color.end).toRgb()
  else if(PAGE.role.isHost && data.color.start !== data.color.end) {
   window.socket.emit('resetLiveParticle', gameObject.id)
   return
  }
// startColor: PropertyNode
// value: {r: 255, g: 255, b: 255}
  // debugger;
  emitter.data = data
}

function createDefaultEmitter(stage, gameObject, emitterDataName, options) {
  const startPos = {x: gameObject.width/2 * MAP.camera.multiplier, y: gameObject.height/2 * MAP.camera.multiplier}

  let particleData
  if(emitterDataName === 'live') {
    particleData = {..._.cloneDeep(options), pos: startPos}
  } if(window.particleEmitterLibrary[emitterDataName]){
    particleData = {..._.cloneDeep(window.particleEmitterLibrary[emitterDataName]), pos: startPos}
  }
  if(GAME.library.animations[emitterDataName]){
    particleData = {..._.cloneDeep(GAME.library.animations[emitterDataName]), pos: startPos}
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
  // if(particleData.particles) {
  //   particles = particleData.particles
  //   particles = particles.map(p => PIXI.Texture.from(p))
  // }


  particleData.particle = particles

  if(options.scaleToGameObject) {
    const modifyScaleX = (gameObject.width/particles[0]._frame.width * MAP.camera.multiplier)
    // const modifyScaleY = (gameObject.height/particles[0]._frame.height)
    particleData.scale.start = modifyScaleX
    particleData.scale.end = modifyScaleX

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
