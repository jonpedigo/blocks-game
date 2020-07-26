import React from 'react';
import DatGui, { DatBoolean, DatButton, DatFolder, DatColor, DatNumber, DatString } from 'react-dat-gui';

export default class HeroLive extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      objectSelected: this.props.objectSelected,
      quakeColor: '#FFF',
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

    const updatedObjectProps = {
      speed: newData.objectSelected.speed,
      jumpVelocity: newData.objectSelected.jumpVelocity,
      velocityMax: newData.objectSelected.velocityMax,
      zoomMultiplier: newData.objectSelected.zoomMultiplier
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
        <DatGui data={this.state} onUpdate={this.handleUpdate}>
          <DatFolder title='Physics' closed={false}>
            <DatNumber path='objectSelected.speed' label='Speed' min={0} max={1000} step={1} />
            <DatNumber path='objectSelected.velocityMax' label="velocityMax" min={0} max={1000} step={1} />
            <DatNumber path='objectSelected.jumpVelocity' label="jumpVelocity" min={-1000} max={1000} />
          </DatFolder>
          <DatFolder title='Animations' closed={false}>
            <DatFolder title='Quake' closed>
              <DatColor path='quakeColor' label="Color"/>
              <DatBoolean path='quakeIsPowerWave' label="Power Wave"/>
              <DatNumber path='quakeSpeed' label='Speed' min={0} max={1000} step={1} />
              <DatButton label="Send Quake" onClick={() => {
                  window.socket.emit('objectAnimation', 'quake', objectSelected.id, { tags: {}, color: this.state.quakeColor, powerWave: this.state.quakeIsPowerWave, speed: this.state.quakeSpeed })
                }}></DatButton>
            </DatFolder>
          </DatFolder>
          <DatFolder title='Hero Camera' closed={false}>
            <DatNumber path='objectSelected.zoomMultiplier' label="Zoom" min={0} max={20} step={EDITOR.zoomDelta}/>
            <DatFolder title='Shake' closed>
              <DatNumber path='cameraShakeDuration' label='Duration' min={0} max={1000} step={1} />
              <DatNumber path='cameraShakeFrequency' label='Frequency' min={0} max={1000} step={1} />
              <DatNumber path='cameraShakeAmplitude' label='Amplitude' min={0} max={1000} step={1} />
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
