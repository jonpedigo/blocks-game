import React from 'react';
import DatGui, { DatBoolean, DatNumber } from 'react-dat-gui';

export default class DayNightLive extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cycleData: {},
      ambientLight: null,
    }
    this.handleUpdate = _.debounce(this.handleUpdate.bind(this), 100)
    this.handleLightUpdate = _.debounce(this.handleLightUpdate.bind(this), 100)
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
      nightAmbientLight: newData.nightAmbientLight,
      autoCycle: newData.autoCycle
    }

    window.socket.emit('updateWorld', { dayNightCycle: updatedProps })
  }

  handleLightUpdate(newData) {
    const { ambientLight } = newData;

    this.setState({
      ambientLight
    })

    let updatedAmbientLight;
    updatedAmbientLight = ambientLight

    if (GAME.gameState.ambientLight !== updatedAmbientLight) {
      if (PAGE.role.isHost) {
        GAME.gameState.ambientLight = updatedAmbientLight
        GAME.gameState.ambientLightDelta = 0
      } else {
        window.socket.emit('updateGameState', { ambientLight: updatedAmbientLight, ambientLightDelta: 0 })
      }
    }

  }


  render() {
    const { cycleData, ambientLight } = this.state;

    return (
      <div className='DayNightLive'>
        <div>
          <DatGui style={{ marginTop: '330px' }} data={{ ambientLight }} onUpdate={this.handleLightUpdate}>
            <DatNumber path='ambientLight' label='ambientLight' min={0} max={1} step={.01} />
          </DatGui>
        </div>
        <div>
          <DatGui data={cycleData} onUpdate={this.handleUpdate}>
            <div className="LiveEditor__title">{'Day Night Cycle'}</div>
            <DatBoolean path='autoCycle' label='autoCycle' />
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
