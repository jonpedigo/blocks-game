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
    //Make sure alwaysDay and alwaysNight are exclusive



    this.setState({
      cycleData: { ...cycleData, ...newData },
    })
    const updatedProps = {
      dayLength: newData.dayLength,
      nightLength: newData.nightLength,
      transitionTime: newData.transitionTime
    }

    if (PAGE.role.isHost) {
      GAME.world.dayNightCycle = Object.assign({}, updatedProps)
      GAME.gameState.ambientLight = updatedAmbientLight
    } else {
      window.socket.emit('updateWorld', [{ dayNightCycle: cycleData, ambientLight: updatedAmbientLight }])
    }
  }

  handleLightUpdate(newData) {
    const { ambientLight, alwaysDay, alwaysNight } = this.state;
    console.log(newData, 'newDataHandleLightUpdate')
    if (newData.alwaysNight) {
      this.setState({ alwaysDay: false, ambientLight: 0, alwaysNight: newData.alwaysNight })
    } else if (newData.alwaysDay) {
      this.setState({ alwaysNight: false, ambientLight: 1, alwaysDay: newData.alwaysDay })
    } else {
      this.setState({ alwaysNight: newData.alwaysNight, ambientLight: newData.ambientLight, alwaysDay: newData.alwaysDay })
    }
    let updatedAmbientLight;
    if (alwaysDay) {
      updatedAmbientLight = 1
    } else if (alwaysNight) {
      updatedAmbientLight = 0;
    } else {
      updatedAmbientLight = ambientLight
    }

    if (GAME.gameState.ambientLight !== updatedAmbientLight) {
      if (PAGE.role.isHost) {
        console.log(GAME.gameState.ambientLight, 'light before')
        GAME.gameState.ambientLight = updatedAmbientLight
        console.log(GAME.gameState.ambientLight, 'after loight')
      } else {
        window.socket.emit('updateGameState', [{ ambientLight: updatedAmbientLight }])
      }
    }

  }


  render() {
    const { cycleData, ambientLight, alwaysDay, alwaysNight } = this.state;
    console.log(GAME.gameState.ambientLight, 'AMBIENT LIGHT')
    return (
      <div className='DayNightLive'>
        <div>
          <DatGui data={{ ambientLight, alwaysNight, alwaysDay }} onUpdate={this.handleLightUpdate}>
            <DatBoolean path='alwaysDay' label='alwaysDay' />
            <DatBoolean path='alwaysNight' label='alwaysNight' />
            <DatNumber path='ambientLight' label='dayAmbientLight' min={0} max={100} step={1} />
          </DatGui>
        </div>
        <div>
          <DatGui style={{ left: '0%' }} data={cycleData} onUpdate={this.handleUpdate}>
            <DatNumber path='dayLength' label="dayLength" min={0} max={1000} step={1} />
            <DatNumber path='nightLength' label="nightLength" min={0} max={100} step={1} />
            <DatNumber path='transitionTime' label="transitionTime" min={0} max={100} step={1} />
          </DatGui>
        </div>
      </div>
    )
  }
}



