import React from 'react';
import DatGui, { DatBoolean, DatNumber } from 'react-dat-gui';

export default class DayNightLive extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cycleData: {},
      ambientLight: null,
      alwaysDay: false,
      alwaysNight: false
    }
    this.handleUpdate = this.handleUpdate.bind(this)
  }

  componentDidMount() {
    this.setState({ cycleData: GAME.world.dayNightCycle, ambientLight: GAME.world.ambientLight })
  }

  handleUpdate(newData) {
    const { cycleData, ambientLight, alwaysNight, alwaysDay } = this.state
    //Make sure alwaysDay and alwaysNight are exclusive

    // let oppositeAlwaysNight, oppositeAlwaysDay;
    // if (newData.alwaysDay && alwaysNight) {
    //   oppositeAlwaysNight = !alwaysNight;
    // } else {
    //   oppositeAlwaysNight = alwaysNight
    // }
    // if (newData.alwaysNight && alwaysDay) {
    //   oppositeAlwaysDay = !alwaysDay
    // } else {
    //   oppositeAlwaysDay = alwaysDay
    // }

    this.setState({
      cycleData: { ...cycleData, ...newData },
      ambientLight: newData.ambientLight,
      alwaysDay: newData.alwaysDay,
      alwaysNight: newData.alwaysNight
    })
    const updatedProps = {
      dayLength: newData.dayLength,
      nightLength: newData.nightLength,
      transitionTime: newData.transitionTime
    }
    let updatedAmbientLight;
    if (alwaysDay) {
      updatedAmbientLight = 1;
    }
    else if (alwaysNight) {
      updatedAmbientLight = 0;
    }
    else {
      updatedAmbientLight = ambientLight
    }
    if (PAGE.role.isHost) {
      GAME.world.dayNightCycle = Object.assign({}, updatedProps)
      GAME.world.ambientLight = updatedAmbientLight
    } else {
      window.socket.emit('updateWorld', [{ dayNightCycle: cycleData, ambientLight: updatedAmbientLight }])
    }
  }
  render() {
    const { cycleData, ambientLight, alwaysDay, alwaysNight } = this.state;
    return (
      <div className='PhysicsLive'>
        <DatGui data={{ ...cycleData, ambientLight, alwaysDay, alwaysNight }} onUpdate={this.handleUpdate}>
          <DatBoolean path='alwaysDay' label='alwaysDay' />
          <DatBoolean path='alwaysNight' label='alwaysNight' />
          <DatNumber path='ambientLight' label='dayAmbientLight' min={0} max={100} step={1} />
          <DatNumber path='dayLength' label="dayLength" min={0} max={1000} step={1} />
          <DatNumber path='nightLength' label="nightLength" min={0} max={100} step={1} />
          <DatNumber path='transitionTime' label="transitionTime" min={0} max={100} step={1} />
        </DatGui>
      </div>
    )
  }
}



