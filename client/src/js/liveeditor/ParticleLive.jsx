import React from 'react';
import DatGui, { DatFolder, DatBoolean, DatButton, DatColor, DatNumber, DatString } from 'react-dat-gui';

export default class ParticleLive extends React.Component {
  constructor(props) {
    super(props)
    const objectSelected = this.props.objectSelected

    if(!objectSelected.liveEmitterData) {
      objectSelected.liveEmitterData = window.particleEmitterLibrary.smallFire
      objectSelected.liveEmitterData.spawnWaitTime = 100
    }
    if(!objectSelected.tags.liveEmitter) {
      MAPEDITOR.networkEditObject({id: objectSelected.id, tags:{ ...objectSelected.tags, liveEmitter: true }})
      objectSelected.tags.liveEmitter = true
    }
    this.state = {
      objectSelected
    }
    this.handleUpdate = _.debounce(this.handleUpdate.bind(this), 20)
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
      liveEmitterData: {
        ...objectSelected.liveEmitterData,
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
      },
      tags: {
        ...objectSelected.liveEmitterData,
        ...newData.tags
      },
      opacity: newData.opacity
    }

    if (PAGE.role.isHost) {
      Object.assign(OBJECTS.getObjectOrHeroById(id), updatedProps)
    } else {
      networkEditObject({id, ...updatedProps})
    }
  }

  render() {
    const { objectSelected } = this.state;

    return (
      <div className='ParticleLive'>
        <DatGui labelWidth="64%" data={objectSelected} onUpdate={this.handleUpdate}>
          <div className="LiveEditor__title">{'Particle'}</div>
          <DatBoolean path={'tags.liveEmitter'} label="Live Update" />
          <DatNumber path='opacity' label='Object opacity' min={0} max={1} step={.1} />
          <DatButton label="Save Animation" onClick={async () => {
            const { value: name } = await Swal.fire({
              title: "What is the name of this animation?",
              input: 'text',
              inputAttributes: {
                autocapitalize: 'off'
              },
              showClass: {
                popup: 'animated fadeInDown faster'
              },
              hideClass: {
                popup: 'animated fadeOutUp faster'
              },
              confirmButtonText: 'Submit',
            })
            if(name) {
              objectSelected.liveEmitterData.animationType = 'particle';
              window.socket.emit('addAnimation', name, objectSelected.liveEmitterData)
            }
            }}></DatButton>
            <DatButton label="Reset Animation" onClick={() => {
              window.socket.emit('resetLiveParticle', objectSelected.id)
            }}/>
          <hr/>
          <DatFolder title='Color'>
            <DatNumber path='liveEmitterData.alpha.start' label='Opacity Start' min={0} max={1} step={.1} />
            <DatNumber path='liveEmitterData.alpha.end' label="Opacity End" min={0} max={1} step={.1} />
            <DatColor path='liveEmitterData.color.start' label="Color Start" />
            <DatColor path='liveEmitterData.color.end' label="Color End" />
            <DatBoolean path={'liveEmitterData.matchObjectColor'} label="Match color of object" />
          </DatFolder>
          <DatFolder title='Size'>
            <DatNumber path='liveEmitterData.scale.start' label="Size Start" min={0} max={5} step={.1} />
            <DatNumber path='liveEmitterData.scale.end' label="Size End" min={0} max={5} step={.1} />
            <DatNumber path='liveEmitterData.scale.minimumScaleMultiplier' label="Minumum Size Multiplier" min={0} max={5} step={.1} />
            <DatBoolean path={'liveEmitterData.scaleToGameObject'} label="Match object size" />
          </DatFolder>
          <DatFolder title='Speed'>
            <DatNumber path='liveEmitterData.maxSpeed' label="Max Speed" min={0} max={2000} step={10} />
            <DatNumber path='liveEmitterData.speed.start' label="Speed Start" min={0} max={2000} step={10} />
            <DatNumber path='liveEmitterData.speed.end' label="Speed End" min={0} max={2000} step={10} />
            <DatNumber path='liveEmitterData.speed.minimumSpeedMultiplier' label="Minumum Speed Multiplier" min={0} max={5} step={.1} />
            <DatNumber path='liveEmitterData.acceleration.x' label="Acceleration X" min={0} max={2000} step={10} />
            <DatNumber path='liveEmitterData.acceleration.y' label="Acceleration Y" min={0} max={2000} step={10} />
          </DatFolder>
          <DatFolder title='Rotation'>
            <DatNumber path='liveEmitterData.startRotation.min' label="Rotation Start Min" min={0} max={360} step={1} />
            <DatNumber path='liveEmitterData.startRotation.max' label="Rotation Start Max" min={0} max={360} step={1} />
            <DatNumber path='liveEmitterData.rotationSpeed.min' label="Rotation Speed Min" min={0} max={360} step={1} />
            <DatNumber path='liveEmitterData.rotationSpeed.max' label="Rotation Speed Max" min={0} max={360} step={1} />
          </DatFolder>

          <DatFolder title='Lifetime'>
            <DatNumber path='liveEmitterData.lifetime.min' label="Particle Lifetime Min" min={0} max={10} step={.01} />
            <DatNumber path='liveEmitterData.lifetime.max' label="Particle Lifetime Max" min={0} max={10} step={.01} />
            <DatNumber path='liveEmitterData.emitterLifetime' label="Emitter Lifetime" min={-1} max={100} step={1} />
            <DatBoolean path={'liveEmitterData.persistAfterRemoved'} label="Continue emitting after object removed" />
          </DatFolder>

          <DatFolder title='Frequency'>
            <DatNumber path='liveEmitterData.spawnWaitTime' label="Spawn Frequency" min={0} max={100} step={1} />
            <DatNumber path='liveEmitterData.maxParticles' label="Max Particles" min={1} max={10000} step={10} />
          </DatFolder>
        </DatGui>
      </div>
    )
  }
}
