import React from 'react';
import DatGui, { DatBoolean, DatButton, DatFolder, DatColor, DatNumber, DatString } from 'react-dat-gui';

export default class GuidanceLive extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      objectSelected: this.props.objectSelected,
      animationColor: '#FFF',
    }

    this.handleUpdate = _.debounce(this.handleUpdate.bind(this), 100)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.objectSelected.id !== prevState.objectSelected.id) {
      return { objectSelected: nextProps.objectSelected };
    }
    else return null;
  }

  // Update current state with changes from controls
  handleUpdate(newData) {
    const id = this.state.objectSelected.id

    this.setState({
      ...newData
    })

    const hero = newData.objectSelected
    const updatedObjectProps = {
      heroMenu: hero.heroMenu,
      objectMenu: hero.objectMenu,
      creator: hero.creator,
      flags: hero.flags
    }

    window.socket.emit('editHero', { id, ...updatedObjectProps })
  }

  _renderLibrary(libraryProp, libraryObjectNames) {
    return Object.keys(libraryObjectNames).map((name) => {
      const path = 'objectSelected.'+libraryProp+'.'+name
      return <DatBoolean path={path} label={name} />
    })
  }

  render() {
    const { objectSelected } = this.state

    return (
      <div className='GuidanceLive'>
        <DatGui labelWidth="64%" data={this.state} onUpdate={this.handleUpdate}>
          <div className="LiveEditor__title">{'Guidance'}</div>
          <DatFolder title='Creator Library'>
            {this._renderLibrary('creator', window.homemadearcadeBasicLibrary)}
          </DatFolder>
          <DatFolder title='Right Click Menu'>
            <DatFolder title='Hero'>
              {this._renderLibrary('heroMenu', window.heroMenuLibrary)}
            </DatFolder>
            <DatFolder title='Objects'>
              {this._renderLibrary('objectMenu', window.objectMenuLibrary)}
            </DatFolder>
          </DatFolder>
          <DatFolder title='Other'>
            {this._renderLibrary('flags', window.heroFlags)}
          </DatFolder>
          <DatFolder title='Demo'>
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
            <DatButton label="Send Camera Shake" onClick={() => {
                window.socket.emit('heroCameraEffect', 'cameraShake', objectSelected.id, {})
              }}></DatButton>
            <DatButton label="Send Camera Shake" onClick={() => {
                window.socket.emit('heroCameraEffect', 'cameraShake', objectSelected.id, {})
              }}></DatButton>
          </DatFolder>
        </DatGui>
      </div>
    )
  }
}
