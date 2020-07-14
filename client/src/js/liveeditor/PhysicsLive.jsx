import React from 'react';
import DatGui, { DatBoolean, DatColor, DatNumber, DatString } from 'react-dat-gui';

export default class PhysicsLive extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
          data: this.props.data
        }
        this.handleUpdate = this.handleUpdate.bind(this)
    }

    // Update current state with changes from controls
    handleUpdate(newData) {
      const { data } = this.state
      const id = data.id

      this.setState({
        data: {...data, ...newData}
      })

      const updatedProps = {
        speed: newData.speed,
        jumpVelocity: newData.jumpVelocity,
        velocityMax: newData.velocityMax
      }

      if(PAGE.role.isHost) {
        Object.assign(OBJECTS.getObjectOrHeroById(id), updatedProps)
      } else {
        if(data.tags.hero) {
          window.socket.emit('editHero', { id, ...updatedProps})
        // }
        // else if(data.tags.subObject) {
        // window.socket.emit('editSubObject', data.ownerId, data.subObjectName, updatedProps)
        } else {
          window.socket.emit('editObjects', [{ id, ...updatedProps }])
        }
      }
    }

    render() {
        const { data } = this.state;
        return (
            <div className='PhysicsLive'>
                <DatGui data={data} onUpdate={this.handleUpdate}>
                    <DatNumber path='speed' label='Speed' min={0} max={1000} step={1} />
                </DatGui>
            </div>
        )
    }
}
