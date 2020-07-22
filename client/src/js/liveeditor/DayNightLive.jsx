import React from 'react';
import DatGui, { DatBoolean, DatNumber } from 'react-dat-gui';

export default class DayNightLive extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cycleData: {},
      ambientLight: null,
      alwaysDay: false,
      alwaysNight: false,
    }
    this.handleUpdate = this.handleUpdate.bind(this)
    this.handleLightUpdate = this.handleLightUpdate.bind(this)
  }

  componentDidMount() {
    this.setState({ cycleData: GAME.world.dayNightCycle, ambientLight: GAME.gameState.ambientLight })
  }

  handleUpdate(newData) {
    const { cycleData } = this.state

    this.setState({
      cycleData: { ...cycleData, ...newData },
    })
    const updatedProps = {
      dayLength: newData.dayLength,
      nightLength: newData.nightLength,
      transitionTime: newData.transitionTime,
      alwaysDay: newData.alwaysDay,
      alwaysNight: newData.alwaysNight,
      dayAmbientLight: newData.dayAmbientLight,
      nightAmbientLight: newData.nightAmbientLight
    }

    if (PAGE.role.isHost) {
      GAME.world.dayNightCycle = Object.assign({}, updatedProps)
    } else {
      window.socket.emit('updateWorld', [{ dayNightCycle: cycleData, ambientLight: updatedAmbientLight }])
    }
  }

  handleLightUpdate(newData) {
    const { ambientLight } = newData;

    this.setState({
      ambientLight
    })
    console.log(newData, 'newDataHandleLightUpdate')

    let updatedAmbientLight;
    updatedAmbientLight = ambientLight

    if (GAME.gameState.ambientLight !== updatedAmbientLight) {
      if (PAGE.role.isHost) {
        GAME.gameState.ambientLight = updatedAmbientLight
      } else {
        window.socket.emit('updateGameState', [{ ambientLight: updatedAmbientLight }])
      }
    }

  }


  render() {
    const { cycleData, ambientLight } = this.state;
    console.log(GAME.gameState.ambientLight, 'AMBIENT LIGHT')
    return (
      <div className='DayNightLive'>
        <div>
          <DatGui data={{ ambientLight }} onUpdate={this.handleLightUpdate}>
            <DatNumber path='ambientLight' label='ambientLight' min={0} max={1} step={.01} />
          </DatGui>
        </div>
        <div>
          <DatGui style={{ left: '0%' }} data={cycleData} onUpdate={this.handleUpdate}>
            <DatBoolean path='alwaysDay' label='alwaysDay' />
            <DatBoolean path='alwaysNight' label='alwaysNight' />
            <DatNumber path='dayLength' label="dayLength" min={0} max={100} step={1} />
            <DatNumber path='nightLength' label="nightLength" min={0} max={100} step={1} />
            <DatNumber path='transitionTime' label="transitionTime" min={0} max={100} step={1} />
            <DatNumber path='dayAmbientLight' label="dayAmbientLight" min={0} max={1} step={.01} />
            <DatNumber path='nightAmbientLight' label="nightAmbientLight" min={0} max={1} step={.01} />
          </DatGui>
        </div>
      </div>
    )
  }
}
