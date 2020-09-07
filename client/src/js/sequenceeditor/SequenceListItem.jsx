import React from 'react'
import Select from 'react-select';
import modals from './modals';

export default class SequenceListItem extends React.Component {
  constructor(props) {
    super(props)

    const sequence = GAME.gameState.sequenceQueue.find(({id}) => props.id)
    this.state = {
      showOptions: false,
      isStarted: sequence,
      isPaused: sequence && sequence.paused,
    }
  }

  _renderSequenceOptions() {
    const { id } = this.props;
    const { isStarted, isPaused } = this.state;

    if(isStarted) {
      let icon = 'fa-pause'
      if(isPaused) icon = 'fa-play'

      return <React.Fragment>
        <i
          className="fas fa-stop SequenceList__sequence-option"
          onClick={(e) => {
            window.socket.emit('stopSequence', id, HERO.editingId)
            e.stopPropagation()
            this.setState({
              isPaused: false,
              isStarted: false,
            })
          }}
        />
        <i
          className={"fas SequenceList__sequence-option " + icon}
          onClick={(e) => {
            window.socket.emit('togglePauseSequence', id, HERO.editingId)
            e.stopPropagation()
            this.setState({
              isPaused: !this.state.isPaused
            })
          }}
        />
      </React.Fragment>
    } else {
      return <i
        className="fas fa-play SequenceList__sequence-option"
        onClick={(e) => {
          window.socket.emit('startSequence', id, HERO.editingId)
          e.stopPropagation()
          this.setState({
            isStarted: true
          })
        }}
      />
    }
  }

  render() {
    const { sequenceIdList, showOptions } = this.state
    const { openSequence, id } = this.props

    return (
      <div
        key={id}
        className="SequenceList__sequence"
        onMouseEnter={() => {
          this.setState({showOptions: true})
        }}
        onMouseLeave={() => {
          this.setState({showOptions: false})
        }}
        onClick={() => {
          openSequence(id)
        }}
      >
        {id}
        {showOptions &&
          <div
          className="SequenceList__sequence-options"
          >
            {this._renderSequenceOptions()}
          </div>
        }
      </div>
    )
  }
}
