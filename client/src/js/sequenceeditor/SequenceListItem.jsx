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

    let playIcons
    if(isStarted) {
      let icon = 'fa-pause'
      if(isPaused) icon = 'fa-play'

      playIcons= <React.Fragment>
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
      playIcons= <i
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

    return <React.Fragment>
      {playIcons}
      <i
        className="fas fa-trash SequenceList__sequence-option"
        onClick={async (e) => {
          e.stopPropagation()
          const { value: confirm } = await Swal.fire({
            title: "Are you sure you want to delete this sequence?",
            showClass: {
              popup: 'animated fadeInDown faster'
            },
            hideClass: {
              popup: 'animated fadeOutUp faster'
            },
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete this sequence',
          })
          if(confirm) {
            this.props.deleteSequence(id)
          }
        }}
      />
    </React.Fragment>

  }

  handleDragStart = (e) => {
    const { openSequence, id } = this.props
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.type == 'sequence'
    e.dataTransfer.setData('text/plain', GAME.library.sequences[id]);
    e.stopPropagation()
  }


  render() {
    const { sequenceIdList, showOptions } = this.state
    const { openSequence, id } = this.props
    return (
      <div
        key={id}
        className="SequenceList__sequence"
        draggable="true"
        onDragStart={this.handleDragStart}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(e) => {
          if (e.dataTransfer.type == 'sequence') {
            e.stopPropagation();
            const draggedSequence = JSON.parse(e.dataTransfer.getData('text/plain'))
            this.saveSequence(draggedSequence)
          }
        }}
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
