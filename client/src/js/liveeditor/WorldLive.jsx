import React from 'react';
import DatGui, { DatBoolean, DatButton, DatFolder, DatColor, DatNumber, DatString } from 'react-dat-gui';

export default class HeroLive extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      objectSelected: this.props.objectSelected
    }
    this.handleUpdate = this.handleUpdate.bind(this)
  }

  // Update current state with changes from controls
  handleUpdate(newData) {
    const { objectSelected } = this.state
    const id = objectSelected.id

    this.setState({
      objectSelected: { ...objectSelected, ...newData }
    })

    const updatedProps = {
      speed: newData.speed,
      jumpVelocity: newData.jumpVelocity,
      velocityMax: newData.velocityMax
    }

    if (PAGE.role.isHost) {
      Object.assign(OBJECTS.getObjectOrHeroById(id), updatedProps)
    } else {
      window.socket.emit('editHero', { id, ...updatedProps })
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.objectSelected.id !== prevState.objectSelected.id) {
      return { objectSelected: nextProps.objectSelected };
    }
    else return null;
  }

  render() {
    const { objectSelected } = this.state;

    return (
      <div className='WorldLive'>
        <DatGui data={objectSelected} onUpdate={this.handleUpdate}>
          <DatFolder title='Game Boundaries'>

          </DatFolder>
          <DatFolder title='Camera Lock'>

          </DatFolder>
          <DatFolder title='Grid'>

          </DatFolder>
          <DatFolder title='All'>

          </DatFolder>
        </DatGui>
      </div>
    )
  }
}
