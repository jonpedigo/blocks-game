import React from 'react';
import DatGui, { DatFolder, DatSelect, DatBoolean, DatButton, DatColor, DatNumber, DatString } from 'react-dat-gui';

export default class ParticleLive extends React.Component {
  constructor(props) {
    super(props)
    const objectSelected = this.props.objectSelected

    if(!objectSelected.liveEmitterData) {
      objectSelected.liveEmitterData = window.particleEmitterLibrary.smallFire
      objectSelected.liveEmitterData.spawnWaitTime = 100
      objectSelected.liveEmitterData.speedType = 'very fast'
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

    if(emitterData.spawnType == 'rect') {
      if(!emitterData.spawnRect) {
        emitterData.spawnRect = {}
      }
      if(!emitterData.spawnRect.w) {
        emitterData.spawnRect.w = 200
      }
      if(!emitterData.spawnRect.h) {
        emitterData.spawnRect.h = 200
      }
      if(emitterData.spawnRect) {
        if(emitterData.spawnRect.w) {
          emitterData.spawnRect.x = -(emitterData.spawnRect.w/2)
        }
        if(emitterData.spawnRect.h) {
          emitterData.spawnRect.y = -(emitterData.spawnRect.h/2)
        }
      }
    }

    let frequencyDivider = 1000
    if(emitterData.speedType == 'slow') {
      frequencyDivider = 100
    }
    if(emitterData.speedType == 'normal') {
      frequencyDivider = 1000
    }
    if(emitterData.speedType == 'fast') {
      frequencyDivider = 10000
    }

    if(emitterData.spawnType !== 'burst') {
      delete emitterData.angleStart
      delete emitterData.particleSpacing
      delete emitterData.particlesPerWave
    }

    const frequency =  (101 - emitterData.spawnWaitTime)/frequencyDivider
    console.log(frequency)

    const updatedProps = {
      liveEmitterData: {
        ...objectSelected.liveEmitterData,
        ...emitterData,
        // alpha: emitterData.alpha,
        // scale: emitterData.scale,
        // color: emitterData.color,
        // speed: emitterData.speed,
        // maxSpeed: emitterData.maxSpeed,
        // acceleration: emitterData.acceleration,
        // startRotation: emitterData.startRotation,
        // rotationSpeed: emitterData.rotationSpeed,
        // lifetime: emitterData.lifetime,
        //
        // spawnWaitTime: emitterData.spawnWaitTime,
        // emitterLifetime: emitterData.emitterLifetime,
        // maxParticles: emitterData.maxParticles,
        //
        "noRotation": false,
        blendMode: 'normal',
        addAtBack: false,
        "pos": {
          "x": 0,
          "y": 0
        },
        // particles: emitterData.particles,
        frequency,
      },
      tags: {
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

  _renderEmitterShape() {
    const { objectSelected } = this.state;

    if(objectSelected.liveEmitterData.spawnType === 'rect') {
      // <DatNumber path='liveEmitterData.pos.x' label="x" min={0} max={100} step={1} />
      // <DatNumber path='liveEmitterData.pos.y' label="y" min={1} max={10000} step={10} />
      // <DatNumber path='liveEmitterData.spawnRect.x' label="x" min={-100} max={100} step={1} />
      // <DatNumber path='liveEmitterData.spawnRect.y' label="y" min={-100} max={100} step={1} />
      //
      return <DatFolder title='Emitter Shape'>
        <DatSelect path='liveEmitterData.spawnType' label="Emitter Shape" options={['point', 'circle', 'rect', 'ring', 'burst']}/>
        <DatNumber path='liveEmitterData.spawnRect.w' label="Width" min={0} max={1000} step={1} />
        <DatNumber path='liveEmitterData.spawnRect.h' label="Height" min={0} max={1000} step={1} />
      </DatFolder>
    }
    if(objectSelected.liveEmitterData.spawnType === 'circle') {
      // <DatNumber path='liveEmitterData.pos.x' label="Position x" min={0} max={100} step={1} />
      // <DatNumber path='liveEmitterData.pos.y' label="Position y" min={1} max={10000} step={10} />
      // <DatNumber path='liveEmitterData.spawnCircle.x' label="x" min={-100} max={100} step={1} />
      // <DatNumber path='liveEmitterData.spawnCircle.y' label="y" min={-100} max={100} step={1} />
      //
      return <DatFolder title='Emitter Shape'>
        <DatSelect path='liveEmitterData.spawnType' label="Emitter Shape" options={['point', 'circle', 'rect', 'ring', 'burst']}/>
        <DatNumber path='liveEmitterData.spawnCircle.r' label="Radius" min={0} max={1000} step={1} />
      </DatFolder>
    }
    if(objectSelected.liveEmitterData.spawnType === 'ring') {

      // <DatNumber path='liveEmitterData.pos.x' label="x" min={0} max={100} step={1} />
      // <DatNumber path='liveEmitterData.pos.y' label="y" min={1} max={10000} step={10} />
      // <DatNumber path='liveEmitterData.spawnCircle.x' label="x" min={-100} max={100} step={1} />
      // <DatNumber path='liveEmitterData.spawnCircle.y' label="y" min={-100} max={100} step={1} />
      //
      return <DatFolder title='Emitter Shape'>
        <DatSelect path='liveEmitterData.spawnType' label="Emitter Shape" options={['point', 'circle', 'rect', 'ring', 'burst']}/>
        <DatNumber path='liveEmitterData.spawnCircle.r' label="Max Radius" min={0} max={1000} step={1} />
        <DatNumber path='liveEmitterData.spawnCircle.minR' label="Min Radius" min={0} max={1000} step={1} />
      </DatFolder>
    }
    if(objectSelected.liveEmitterData.spawnType === 'burst') {
      // <DatNumber path='liveEmitterData.pos.x' label="x" min={0} max={100} step={1} />
      // <DatNumber path='liveEmitterData.pos.y' label="y" min={1} max={10000} step={10} />

      return <DatFolder title='Emitter Shape'>
        <DatSelect path='liveEmitterData.spawnType' label="Emitter Shape" options={['point', 'circle', 'rect', 'ring', 'burst']}/>
        <DatNumber path='liveEmitterData.particlesPerWave' label="Particles Per Burst" min={0} max={1000} step={1} />
        <DatNumber path='liveEmitterData.particleSpacing' label="Particle Spacing" min={0} max={360} step={1} />
        <DatNumber path='liveEmitterData.angleStart' label="Start Rotation" min={0} max={360} step={1} />
      </DatFolder>
    } else {
      // <DatNumber path='liveEmitterData.pos.x' label="x" min={0} max={100} step={1} />
      // <DatNumber path='liveEmitterData.pos.y' label="y" min={1} max={10000} step={10} />

      return <DatFolder title='Emitter Shape'>
        <DatSelect path='liveEmitterData.spawnType' label="Emitter Shape" options={['point', 'circle', 'rect', 'ring', 'burst']}/>
        </DatFolder>
    }


  }

  render() {
    const { objectSelected } = this.state;

    return (
      <div className='ParticleLive'>
        <DatGui labelWidth="54%" data={objectSelected} onUpdate={this.handleUpdate}>
          <div className="LiveEditor__title">{'Particle'}</div>
          <DatBoolean path={'tags.liveEmitter'} label="Live Update" />
          <DatNumber path='opacity' label='Object opacity' min={0} max={1} step={.1} />
          <DatButton label="Save Animation" onClick={async () => {
            PAGE.typingMode = true
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
            PAGE.typingMode = false
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
            <DatNumber path='liveEmitterData.speed.start' label="Speed Start" min={0} max={20000} step={10} />
            <DatNumber path='liveEmitterData.speed.end' label="Speed End" min={0} max={20000} step={10} />
            <DatNumber path='liveEmitterData.speed.minimumSpeedMultiplier' label="Minumum Speed Multiplier" min={0} max={5} step={.1} />
            <DatNumber path='liveEmitterData.acceleration.x' label="Acceleration X" min={0} max={20000} step={10} />
            <DatNumber path='liveEmitterData.acceleration.y' label="Acceleration Y" min={0} max={20000} step={10} />
            <DatNumber path='liveEmitterData.maxSpeed' label="Max Speed" min={0} max={20000} step={10} />
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
            <DatSelect path='liveEmitterData.speedType' label="Class" options={['slow', 'normal', 'fast']}/>
            <DatNumber path='liveEmitterData.spawnWaitTime' label="Frequency" min={0} max={100} step={1} />
            <DatNumber path='liveEmitterData.maxParticles' label="Max Particles" min={1} max={1000} step={10} />
          </DatFolder>

          {this._renderEmitterShape()}
        </DatGui>
      </div>
    )
  }
}
