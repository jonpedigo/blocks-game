import React from 'react';
import DatGui, { DatBoolean, DatButton, DatFolder, DatColor, DatNumber, DatString, DatSelect } from 'react-dat-gui';

export default class WorldLive extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      world: GAME.world,
      grid: GAME.grid
    }
    this.handleUpdate = _.debounce(this.handleUpdate.bind(this), 100)
  }

  // Update current state with changes from controls
  handleUpdate(newData) {
    const { world } = this.state

    this.setState({
      ...newData
    })

    window.socket.emit('updateWorld', { ...newData.world })

    if(!this.compareGrids(newData.grid,GAME.grid)) {
      window.socket.emit('updateGrid', { ...newData.grid })
    }
  }

  compareGrids(grid1, grid2) {
    if(grid1.width !== grid2.width) return false
    if(grid1.height !== grid2.height) return false
    if(grid1.startX !== grid2.startX) return false
    if(grid1.startY !== grid2.startY) return false
    if(grid1.nodeSize !== grid2.nodeSize) return false

    return true
  }

  render() {
    return (
      <div className='WorldLive'>
        <DatGui labelWidth="60%" data={this.state} onUpdate={this.handleUpdate}>
          <DatFolder title='Physics'>
            <DatNumber path='world.gravityVelocityX' label='World Gravity Velocity X' min={0} max={5000} step={1} />
            <DatNumber path='world.gravityVelocityY' label='World Gravity Velocity Y' min={0} max={5000} step={1} />
          </DatFolder>
          <DatFolder title='Tags'>
            <DatBoolean label='Prevent Hero From Leaving Grid' path="world.tags.preventHeroGridBypass"/>
            <DatBoolean label='No Monster Camping' path="world.tags.noCamping"/>
            <DatBoolean label='Calculate Moving Obstacle Paths' path="world.tags.calculatePathCollisions"/>
            <DatBoolean label='Restore Hero Position When Reloaded' path="world.tags.shouldRestoreHero"/>
            <DatBoolean label='Store Game State in Local Storage' path="world.tags.storeEntireGameState"/>
            <DatBoolean label='Custom Editor Code Override Arcade' path="world.tags.overrideCustomGameCode"/>
          </DatFolder>
          <DatFolder title='Game Boundaries' closed={false}>
            <DatSelect path='world.gameBoundaries.behavior' label='Behavior' options={['default','boundaryAll','pacmanFlip','purgatory']}/>
            <DatButton label="Set to grid" onClick={() => {
              EDITOR.setGameBoundaryTo('grid')
            }}></DatButton>
            <DatButton label="Set to grid -1" onClick={() => {
              EDITOR.setGameBoundaryTo('gridMinusOne')
            }}></DatButton>
            <DatButton label="Set to camera lock" onClick={() => {
              EDITOR.setGameBoundaryTo('lockCamera')
            }}></DatButton>
            <DatButton label="Set to hero camera" onClick={() => {
              EDITOR.setGameBoundaryTo('heroCamera')
            }}></DatButton>
          <DatButton label="Make Smaller" onClick={() => {
              EDITOR.setGameBoundaryTo('smaller')
            }}></DatButton>
            <DatButton label="Make Larger" onClick={() => {
              EDITOR.setGameBoundaryTo('larger')
            }}></DatButton>
            <DatButton label="Clear" onClick={() => {
              EDITOR.clearProperty('gameBoundaries')
            }}></DatButton>
          </DatFolder>
          <DatFolder title='Camera Lock' closed={false}>
            <DatButton label="Set to grid" onClick={() => {
              EDITOR.setCameraLockTo('grid')
            }}></DatButton>
            <DatButton label="Set to grid -1" onClick={() => {
              EDITOR.setCameraLockTo('gridMinusOne')
            }}></DatButton>
            <DatButton label="Set to game boundaries" onClick={() => {
              EDITOR.setCameraLockTo('gameBoundaries')
            }}></DatButton>
            <DatButton label="Set to hero camera" onClick={() => {
              EDITOR.setCameraLockTo('heroCamera')
            }}></DatButton>
          <DatButton label="Make Smaller" onClick={() => {
              EDITOR.setCameraLockTo('smaller')
            }}></DatButton>
          <DatButton label="Make Larger" onClick={() => {
              EDITOR.setCameraLockTo('larger')
            }}></DatButton>
            <DatButton label="Clear" onClick={() => {
              EDITOR.clearProperty('lockCamera')
            }}></DatButton>
          </DatFolder>
          <DatFolder title='Grid' closed={false}>
            <DatNumber path='grid.width' label='Grid Width' min={0} max={1000} step={1} />
            <DatNumber path='grid.height' label='Grid Height' min={0} max={1000} step={1} />
            <DatButton label="Make Smaller" onClick={() => {
                EDITOR.setGridTo('smaller')
              }}></DatButton>
            <DatButton label="Make Larger" onClick={() => {
                EDITOR.setGridTo('larger')
              }}></DatButton>
          </DatFolder>
        </DatGui>
      </div>
    )
  }
}
