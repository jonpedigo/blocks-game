import React from 'react'
import { Textfit } from 'react-textfit';
import PixiMapSprite from '../components/PixiMapSprite.jsx'
import classnames from 'classnames';
import Arrow from '@elsdoerfer/react-arrow';

export default class Goals extends React.Component{
  constructor(props) {
    super(props)
  }

  _renderNavigationArrow(activeGoal) {
    const hero = GAME.heros[HERO.id]

    if(activeGoal.succeeded || activeGoal.failed || !GAME.objectsByTag) return

    const possibleObjects = GAME.objectsByTag[activeGoal.goalTargetTags[0]]
    if(possibleObjects && possibleObjects.length) {
      const target = possibleObjects[0]
      const p1 = {
        x: hero.x + hero.width/2,
        y: hero.y + hero.height/2,
      }
      const p2 = {
        x: target.x + target.width/2,
        y: target.y + target.height/2,
      }
      const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI) + 90
      let distance = (Math.abs(p2.y - p1.y) + Math.abs(p2.x - p1.x))/100
      if(distance > 300) distance = 300
      if(distance < 10) distance = 10
      return <Arrow
        angle={angle}
        length={distance}
        color={'white'}
        style={{
          width: '100px',
          height: '100px'
        }}
      />
    }
  }

  componentDidMount() {
    this._arrowSmoothnessInterval = setInterval(() => {
      this.forceUpdate()
    }, 60)
  }

  componentWillUnmount() {
    clearInterval(this._arrowSmoothnessInterval)
  }

  _renderGoal(goal) {

    if(!GAME.gameState.trackersById || !GAME.gameState.goals) {
      return
    }
    const activeGoal = GAME.gameState.goals[goal.goalId]

    let timeRemaining
    if(GAME.gameState.timeoutsById[goal.goalId]) timeRemaining = GAME.gameState.timeoutsById[goal.goalId].timeRemaining
    if(timeRemaining > 60) {
      timeRemaining = Math.floor(timeRemaining/60) + ' minutes remaining'
    } else timeRemaining = Math.floor(timeRemaining) + ' second remaining'

    const tracker = GAME.gameState.trackersById[goal.trackerId]

    if(!tracker || !activeGoal) return

    return <div className={classnames("Goal", { 'Goal--succeeded': activeGoal.succeeded, 'Goal--failed': activeGoal.failed})}>
      {activeGoal.goalShowNavigation && this._renderNavigationArrow(activeGoal)}
      {activeGoal.goalDescription && <div>{'Goal: ' + activeGoal.goalDescription}</div>}
      {activeGoal.goalDescription && <br/>}
      {timeRemaining && <div>{timeRemaining}</div>}
      {timeRemaining && <br/>}
      <div>Progress: {tracker.count}</div>
      <div>Goal: {tracker.targetCount}</div>
    </div>
  }

  render() {
    const { goals } = this.props

    return <div className="Goals">
      {goals.map((goal) => {
        return this._renderGoal(goal)
      })}
    </div>
  }
}
