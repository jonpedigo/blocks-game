import React from 'react'
import { Textfit } from 'react-textfit';
import PixiMapSprite from '../components/PixiMapSprite.jsx'

export default class Goals extends React.Component{
  constructor(props) {
    super(props)
  }

  _renderGoal(goal) {
    if(!GAME.gameState.trackersById || !GAME.gameState.activeGoals) {
      return
    }
    const activeGoal = GAME.gameState.activeGoals[goal.goalId]
    let timeRemaining
    if(GAME.gameState.timeoutsById[goal.goalId]) timeRemaining = GAME.gameState.timeoutsById[goal.goalId].timeRemaining
    const tracker = GAME.gameState.trackersById[goal.trackerId]

    if(!tracker || !activeGoal) return

    return <div className="Goal">
      {timeRemaining && <div>{'Time remaining: '+ timeRemaining}</div>}
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
