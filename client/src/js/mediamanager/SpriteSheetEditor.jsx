import React from 'react'
import classnames from 'classnames'
import {
  SpriteSheetTagsSelect,
  SpriteSheetAuthorSelect
} from '../components/SelectComponents.jsx'
import modals from '../sequenceeditor/modals.js'
import SpriteSheet from './SpriteSheet.jsx'

export default class SpriteSheetEditor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      spriteSheet: {
        sprites: []
      }
    }
  }

  componentDidMount() {
    const ss = window.spriteSheets.find(({id}) => id == this.props.id)
    if(!ss.tags) ss.tags= []
    this.setState({
      spriteSheet: ss
    })
  }

  getJSON = () => {
    return this.state.spriteSheet
  }

  _openEditTextModal = (title, value) => {
    const { spriteSheet } = this.state
    modals.openEditTextModal(title, spriteSheet[value], (result) => {
      if(result && result.value) {
        spriteSheet[value] = result.value
        this.setState({spriteSheet})
      }
    })
  }

  render() {
    const { spriteSheet } = this.state;

    return <div className="SpriteSheetEditor SpriteSheet">
      <div className="ManagerForm">
        <div className="ManagerInput__text"><i className="fa fas fa-edit Manager__button" onClick={() => this._openEditTextModal('Edit Name', 'name')}/>
          Name: <div className="ManagerInput__value">{spriteSheet.name}</div>
        </div>
        <SpriteSheetAuthorSelect currentValue={spriteSheet.author} onChange={(event) => {
          const { spriteSheet } = this.state;
          spriteSheet.author = event.value
          this.setState({spriteSheet})
        }}/>
        <div className="ManagerInput__text"><i className="fa fas fa-edit Manager__button" onClick={() => this._openEditTextModal('Edit image url', 'imageUrl')}/>
          Image url: <div className="ManagerInput__value">{spriteSheet.imageUrl}</div>
        </div>
        <SpriteSheetTagsSelect currentValue={spriteSheet.tags} onChange={(event) => {
          const { spriteSheet } = this.state;
          if(!event) spriteSheet.tags = []
          else spriteSheet.tags = event.map(({value}) => value)
          this.setState({spriteSheet})
        }}/>
      </div>
      <SpriteSheet spriteSheet={spriteSheet} onClick={(sprite) => {

      }}/>
    </div>
  }
}
