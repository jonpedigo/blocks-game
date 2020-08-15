import React from 'react';
import DatGui, { DatBoolean, DatButton, DatFolder, DatColor, DatNumber, DatString } from 'react-dat-gui';
import {
  SingleEventSelect,
  SingleTagSelect,
  SingleIdSelect,
  MultiIdSelect,
  MultiTagSelect,
  NextSelect,
} from '../sequenceeditor/SelectComponents.jsx'

export default class HeroLive extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      objectSelected: this.props.objectSelected,
      animationColor: '#FFF',
      quakeSpeed: 150,
      cameraShakeAmplitude: 32,
      cameraShakeDuration: 2000,
      cameraShakeFrequency: 40,
    }

    this.handleUpdate = this.handleUpdate.bind(this)
  }

  // Update current state with changes from controls
  handleUpdate(newData) {
    const id = this.state.objectSelected.id

    this.setState({
      ...newData
    })

    const hero = newData.objectSelected
    const updatedObjectProps = {
      zoomMultiplier: hero.zoomMultiplier,
      cameraTweenToTargetX: hero.cameraTweenToTargetX,
      cameraTweenToTargetY: hero.cameraTweenToTargetY,
      cameraTweenSpeedXExtra: hero.cameraTweenSpeedXExtra,
      cameraTweenSpeedYExtra: hero.cameraTweenSpeedYExtra,
      cameraTweenSpeed: hero.cameraTweenSpeed,
      speed: hero.speed,
      speedXExtra: hero.speedXExtra,
      speedYExtra: hero.speedYExtra,
      jumpVelocity: hero.jumpVelocity,
      velocityMax: hero.velocityMax,
      velocityMaxXExtra: hero.velocityMaxXExtra,
      velocityMaxYExtra: hero.velocityMaxYExtra,
      dashVelocity: hero.dashVelocity,
      velocityDecay: hero.velocityDecay,
      velocityDecayXExtra: hero.velocityDecayXExtra,
      velocityDecayYExtra: hero.velocityDecayYExtra,
    }

    if (PAGE.role.isHost) {
      Object.assign(OBJECTS.getObjectOrHeroById(id), updatedObjectProps)
    } else {
      window.socket.emit('editHero', { id, ...updatedObjectProps })
    }
  }

  render() {
    const { objectSelected } = this.state

    return (
      <div className='HeroLive'>
        <DatGui labelWidth="64%" data={this.state} onUpdate={this.handleUpdate}>
          <DatFolder title='Physics'>
            <DatNumber path='objectSelected.speed' label='Speed' min={0} max={1000} step={1} />
            <DatNumber path='objectSelected.velocityMax' label="Maximum Velocity" min={0} max={1000} step={1} />
            <DatNumber path='objectSelected.jumpVelocity' label="Jump Velocity" min={-1000} max={1000} />
            <DatNumber path='objectSelected.velocityDecay' label="Velocity Decay" min={0} max={1000} />
            <DatFolder title='Additional X/Y'>
              <DatNumber path='objectSelected.speedXExtra' label="Additional Speed X" min={0} max={1000} step={1} />
              <DatNumber path='objectSelected.speedYExtra' label="Additional Speed Y" min={0} max={1000} step={1} />
              <DatNumber path='objectSelected.velocityMaxXExtra' label="Additional Maximum Velocity X" min={0} max={1000} step={1} />
              <DatNumber path='objectSelected.velocityMaxYExtra' label="Additional Maximum Velocity Y" min={0} max={1000} step={1} />
              <DatNumber path='objectSelected.velocityDecayXExtra' label="Additional Velocity Decay X" min={0} max={1000} step={1} />
              <DatNumber path='objectSelected.velocityDecayYExtra' label="Additional Velocity Decay Y" min={0} max={1000} step={1} />
            </DatFolder>
          </DatFolder>
          <DatFolder title='Animations'>
            <DatColor path='animationColor' label="Color"/>
            <DatFolder title='Quake'>
              <DatBoolean path='quakeIsPowerWave' label="Power Wave"/>
              <DatNumber path='quakeSpeed' label='Speed' min={0} max={1000} step={1} />
              <DatButton label="Send Quake" onClick={() => {
                  window.socket.emit('objectAnimation', 'quake', objectSelected.id, { tags: {}, color: this.state.animationColor, powerWave: this.state.quakeIsPowerWave, speed: this.state.quakeSpeed })
                }}></DatButton>
            </DatFolder>
            <DatButton label="Send Explode" onClick={() => {
                window.socket.emit('objectAnimation', 'explode', objectSelected.id)
            }}></DatButton>
            <DatButton label="Send Spin Off" onClick={() => {
                window.socket.emit('objectAnimation', 'spinOff', objectSelected.id)
            }}></DatButton>
            <DatButton label="Send Flash" onClick={() => {
                window.socket.emit('objectAnimation', 'flash', objectSelected.id)
            }}></DatButton>
            <DatButton label="Send Quick Trail" onClick={() => {
                window.socket.emit('objectAnimation', 'quickTrail', objectSelected.id)
            }}></DatButton>
          </DatFolder>
          <DatFolder title='Camera'>
            <DatNumber path='objectSelected.cameraTweenSpeed' label="Delay Speed" min={0} max={6} step={.02}/>
            <DatBoolean path='objectSelected.cameraTweenToTargetX' label="Delay X"/>
            <DatNumber path='objectSelected.cameraTweenSpeedXExtra' label="Delay Speed X Additional" min={0} max={6} step={.02}/>
            <DatBoolean path='objectSelected.cameraTweenToTargetYExtra' label="Delay Y"/>
            <DatNumber path='objectSelected.cameraTweenSpeedY' label="Delay Speed Y Additonal" min={0} max={6} step={.02}/>
            <DatNumber path='objectSelected.zoomMultiplier' label="Zoom" min={0} max={20} step={EDITOR.zoomDelta}/>
            <DatFolder title='Shake'>
              <DatNumber path='cameraShakeDuration' label='Duration' min={0} max={5000} step={1} />
              <DatNumber path='cameraShakeFrequency' label='Frequency' min={0} max={1000} step={1} />
              <DatNumber path='cameraShakeAmplitude' label='Amplitude' min={0} max={400} step={1} />
              <DatButton label="Send Camera Shake" onClick={() => {
                  window.socket.emit('heroCameraEffect', 'cameraShake', objectSelected.id, { amplitude: this.state.cameraShakeAmplitude, frequency: this.state.cameraShakeFrequency, duration: this.state.cameraShakeDuration })
                }}></DatButton>
            </DatFolder>
          </DatFolder>
        </DatGui>
      </div>
    )
  }
}
