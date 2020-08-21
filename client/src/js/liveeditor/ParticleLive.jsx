import React from 'react';
import DatGui, { DatBoolean, DatColor, DatNumber, DatString } from 'react-dat-gui';

export default class ParticleLive extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      objectSelected: this.props.objectSelected
    }
    this.handleUpdate = this.handleUpdate.bind(this)
  }

  // Update current state with changes from controls
  handleUpdate(newData) {
    const { networkEditObject } = MAPEDITOR
    const { objectSelected } = this.state
    const id = objectSelected.id

    this.setState({
      objectSelected: { ...objectSelected, ...newData }
    })

    const emitterData = newData.liveEmitterData
    const updatedProps = {
      alpha: emitterData.alpha,
      scale: emitterData.scale,
      color: emitterData.color,
      speed: emitterData.speed,
      maxSpeed: emitterData.maxSpeed,
      acceleration: emitterData.acceleration,
      startRotation: emitterData.startRotation,
      rotationSpeed: emitterData.rotationSpeed,
      lifetime: emitterData.lifetime,

      "noRotation": false,
      blendMode: 'normal',
      addAtBack: false,

      spawnType: 'point',
      "pos": {
        "x": 0,
        "y": 0
      },
      // particles: emitterData.particles,
      frequency: (101 - emitterData.spawnWaitTime)/300,
      spawnWaitTime: emitterData.spawnWaitTime,
      emitterLifetime: emitterData.emitterLifetime,
      maxParticles: emitterData.maxParticles,
    }

    if (PAGE.role.isHost) {
      Object.assign(OBJECTS.getObjectOrHeroById(id), { tags: {liveEmitter: true}, liveEmitterData: updatedProps})
    } else {
      networkEditObject({id, tags: {...objectSelected.tags, liveEmitter: true }, liveEmitterData: updatedProps})
    }
  }

  render() {
    const { objectSelected } = this.state;

    return (
      <div className='ParticleLive'>
        <DatGui data={objectSelected} onUpdate={this.handleUpdate}>
          <div className="LiveEditor__title">{'Particle'}</div>
          <DatNumber path='liveEmitterData.alpha.start' label='Opacity Start' min={0} max={1} step={.1} />
          <DatNumber path='liveEmitterData.alpha.end' label="Opacity End" min={0} max={1} step={.1} />

          <DatNumber path='liveEmitterData.scale.start' label="Scale Start" min={0} max={5} step={.1} />
          <DatNumber path='liveEmitterData.scale.end' label="Scale End" min={0} max={5} step={.1} />
          <DatNumber path='liveEmitterData.scale.minimumScaleMultiplier' label="Minumum Scale Multiplier" min={0} max={5} step={.1} />

          <DatColor path='liveEmitterData.color.start' label="Color Start" />
          <DatColor path='liveEmitterData.color.end' label="Color End" />

          <DatNumber path='liveEmitterData.maxSpeed' label="Max Speed" min={0} max={2000} step={10} />
          <DatNumber path='liveEmitterData.speed.start' label="Speed Start" min={0} max={2000} step={10} />
          <DatNumber path='liveEmitterData.speed.end' label="Speed End" min={0} max={2000} step={10} />
          <DatNumber path='liveEmitterData.speed.minimumSpeedMultiplier' label="Minumum Speed Multiplier" min={0} max={5} step={.1} />

          <DatNumber path='liveEmitterData.acceleration.x' label="Acceleration X" min={0} max={2000} step={10} />
          <DatNumber path='liveEmitterData.acceleration.y' label="Acceleration Y" min={0} max={2000} step={10} />

          <DatNumber path='liveEmitterData.startRotation.min' label="Rotation Start Min" min={0} max={360} step={1} />
          <DatNumber path='liveEmitterData.startRotation.max' label="Rotation Start Max" min={0} max={360} step={1} />

          <DatNumber path='liveEmitterData.rotationSpeed.min' label="Rotation Speed Min" min={0} max={360} step={1} />
          <DatNumber path='liveEmitterData.rotationSpeed.max' label="Rotation Speed Max" min={0} max={360} step={1} />

          <DatNumber path='liveEmitterData.lifetime.min' label="Lifetime Min" min={0} max={10} step={.1} />
          <DatNumber path='liveEmitterData.lifetime.max' label="Lifetime Max" min={0} max={10} step={.1} />

          <DatNumber path='liveEmitterData.emitterLifetime' label="Emitter Lifetime" min={-1} max={100} step={1} />

          <DatNumber path='liveEmitterData.spawnWaitTime' label="Spawn Frequency" min={0} max={100} step={1} />
          <DatNumber path='liveEmitterData.maxParticles' label="Max Particles" min={1} max={10000} step={10} />
        </DatGui>
      </div>
    )
  }
}
