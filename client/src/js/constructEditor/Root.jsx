import { SketchPicker, SwatchesPicker } from 'react-color';
import React from 'react'
import PixiMapSprite from '../components/PixiMapSprite.jsx';
import ToolbarRow from '../editorUI/ToolbarRow.jsx'
import ToolbarButton from '../editorUI/ToolbarButton.jsx'

export default class Root extends React.Component{
  constructor(props) {
    super(props)

    this.state = {
      open: false,
      selectedColor: '',
      toolSelected: 'paintBrush',
      isMapVisible: true,
    }

    this._openColorPicker = this._openColorPicker.bind(this)
    this._closeColorPicker = this._closeColorPicker.bind(this)
    this._paintBrushClick = this._paintBrushClick.bind(this)
    this._eyeDropperClick = this._eyeDropperClick.bind(this)
    this._eraserClick = this._eraserClick.bind(this)
    this._saveClick = this._saveClick.bind(this)
    this._cancelClick = this._cancelClick.bind(this)
  }

  closeColorPicker() {
    this.setState({
      isColorPickerOpen: false
    })
  }

  setColor(color) {
    this.setState({
      selectedColor: color,
    })
  }

  setTextureId(id) {
    this.setState({
      textureIdSelected: id
    })
  }

  open(initialColor) {
    this.setState({
      open: true,
      selectedColor: initialColor,
    })
    this._paintBrushClick()
  }

  close() {
    this.setState({
      open: false,
    })
  }

  _renderColorPicker() {
    const { selectedColor, isColorPickerOpen } = this.state
    const { selectColor } = this.props

    if(!isColorPickerOpen) return null

    return <div className="ConstructEditor__color-picker"><SketchPicker
        color={selectedColor}
        onChange={(color) => {
          this.setState({
            selectedColor: color.hex
          })
          selectColor(color.hex)
        }}
        onChangeComplete={ (color) => {
          selectColor(color.hex)
        }}
      />
      <SwatchesPicker
          color={selectedColor}
          onChange={(color) => {
            this.setState({
              selectedColor: color.hex
            })
            selectColor(color.hex)
          }}
          onChangeComplete={ (color) => {
            selectColor(color.hex)
          }}
        />
    </div>
  }

  _renderSpriteSelector() {
    const { textureIdSelected } = this.state

    if(!textureIdSelected) {
      return <ToolbarButton iconName="fa-image" onClick={() => {
      BELOWMANAGER.open({ selectedManager: 'MediaManager', objectSelected: 'constructEditor', selectedMenu: 'SpriteSelector'})
      }}/>
    } else {
      return <ToolbarRow
        rowButtonChildren={<PixiMapSprite width="40" height="40" textureId={textureIdSelected}></PixiMapSprite>}
        onClick={() => {
          BELOWMANAGER.open({ selectedManager: 'MediaManager', objectSelected: 'constructEditor', selectedMenu: 'SpriteSelector'})
      }}>
        <ToolbarButton iconName="fa-times" onClick={() => {
          CONSTRUCTEDITOR.selectedTextureId = null
          this.setState({
            textureIdSelected: null,
          })
        }}/>
      </ToolbarRow>
    }

  }

  _renderMenu() {
    const { toolChange, selectColor } = this.props
    const { selectedColor, isColorPickerOpen, toolSelected } = this.state

    const colorSelection = PAGE.role.isAdmin || GAME.heros[HERO.id].flags.constructEditorColor
    const spriteSelection = PAGE.role.isAdmin || GAME.heros[HERO.id].flags.constructEditorSprite
    //<div className="ConstructEditor__menu-item ConstructEditor__menu-item--text" onClick={this._cancelClick}>Cancel</div>

    return <div className="ConstructEditor__menu-list">
      {colorSelection && !isColorPickerOpen && <ToolbarRow iconName="fa-palette" rowButtonBackgroundColor={CONSTRUCTEDITOR.selectedColor} onClick={this._openColorPicker}>
        <ToolbarButton iconName="fa-times" onClick={() => {
            selectColor(GAME.world.defaultObjectColor || window.defaultObjectColor)
            this.setState({
              selectColor: GAME.world.defaultObjectColor || window.defaultObjectColor,
            })
          }}/>
      </ToolbarRow>}
      {isColorPickerOpen && <ToolbarButton backgroundColor={this.state.selectedColor} iconName="fa-times" onClick={this._closeColorPicker}/>}
      {spriteSelection && this._renderSpriteSelector()}
      <br/>
      <ToolbarButton active={toolSelected === 'paintBrush'} iconName="fa-paint-brush" onClick={this._paintBrushClick}/>
      <ToolbarButton active={toolSelected === 'eyeDropper'} iconName="fa-eye-dropper" onClick={this._eyeDropperClick}/>
      <ToolbarButton active={toolSelected === 'eraser'} iconName="fas fa-eraser" onClick={this._eraserClick}/>
      <ToolbarRow active={toolSelected.indexOf('fill') >= 0} iconName='fa-fill'>
        <ToolbarButton active={toolSelected === 'fill-area'} iconName="fa-fill-drip" onClick={() => {
          toolChange('fill-area')
          this.setState({
            toolSelected: 'fill-area'
          })
        }}/>
        {colorSelection && <ToolbarButton active={toolSelected === 'fill-same-color'} iconName="fa-palette" onClick={() => {
          toolChange('fill-same-color')
          this.setState({
            toolSelected: 'fill-same-color'
          })
        }}/>}
      {spriteSelection && <ToolbarButton active={toolSelected === 'fill-same-images'} iconName="fa-image" onClick={() => {
        toolChange('fill-same-images')
        this.setState({
          toolSelected: 'fill-same-images'
        })
      }}/>}
      {spriteSelection && <ToolbarButton active={toolSelected === 'fill-empty'} iconName="fa-eraser" onClick={() => {
        toolChange('fill-empty')
        this.setState({
          toolSelected: 'fill-empty'
        })
      }}/>}
      </ToolbarRow>
      <br/>
      <ToolbarRow iconName='fa-search'>
        <ToolbarButton iconName="fa-search-plus" onClick={() => {
            CONSTRUCTEDITOR.cameraController.zoomMultiplier -= (EDITOR.zoomDelta * 4)
            window.local.emit('onZoomChange')
        }}/>
        <ToolbarButton iconName="fa-search-minus" onClick={() => {
          CONSTRUCTEDITOR.cameraController.zoomMultiplier += (EDITOR.zoomDelta * 4)
          window.local.emit('onZoomChange')
        }}/>
      </ToolbarRow>
      <ToolbarButton active={!this.state.isMapVisible} iconName="fa-eye-slash" onClick={() => {
          CONSTRUCTEDITOR.toggleMapVisibility()
          this.setState({
            isMapVisible: CONSTRUCTEDITOR.mapVisible
          })
        }}/>
      <br/>
      {CONSTRUCTEDITOR.nodesHistory.length > 0 && <ToolbarButton text="undo" onClick={() => {
        if(CONSTRUCTEDITOR.nodesHistory.length) {
          CONSTRUCTEDITOR.grid.nodes = CONSTRUCTEDITOR.nodesHistory.shift()
          this.forceUpdate()
        }
        }}/>}
      <ToolbarButton text="close" onClick={this._saveClick}/>
    </div>
  }

  _openColorPicker() {
    this.setState({isColorPickerOpen: true})
  }

  _closeColorPicker() {
    this.setState({isColorPickerOpen: false})
  }

  _paintBrushClick() {
    const { toolChange } = this.props
    toolChange('paintBrush')
    this.setState({
      toolSelected: 'paintBrush'
    })
    // window.setFontAwesomeCursor("\uf1fc", 'white')
  }

  _eyeDropperClick() {
    const { toolChange } = this.props
    toolChange('eyeDropper')
    this.setState({
      toolSelected: 'eyeDropper'
    })
    // window.setFontAwesomeCursor("\uf1fb", 'white')
  }

  _eraserClick() {
    const { toolChange } = this.props
    this.setState({
      toolSelected: 'eraser'
    })
    // window.setFontAwesomeCursor("\uf12d", 'white')
    toolChange('eraser')
  }

  _saveClick() {
    this.props.finishConstruct()
  }

  _cancelClick() {
    this.props.cancelConstruct()
  }

  render() {
    const { open } = this.state

    if(!open) return null

    return (
      <div className="ConstructEditor">
        {this._renderMenu()}
        {this._renderColorPicker()}
      </div>
    )
  }
}
