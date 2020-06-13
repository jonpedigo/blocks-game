import React from 'react'
import DialogueBox from './DialogueBox.jsx'
import { ToastContainer, toast, Slide, Zoom, Flip, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import modals from './modals.js';

export default class Root extends React.Component{
  constructor(props) {
    super(props)

    this.state = {
      activeQuest: {},
      gameState: {},
      toastingActiveQuestGoalId: null,
      toastingActiveQuestGoalToastId : null,
    }

    this.onUpdateState = () => {
      const hero = GAME.heros[HERO.id]

      this.setState({
        activeQuest: this._getActiveQuest(hero),
        quests: hero.quests,
      }, () => {
        this._showActiveQuestGoalToast()
      })
    }

    this.onStartQuest = function(hero, questId) {
      const quest = hero.quests[questId]
      if(hero.id === HERO.id && quest) {
        if(quest.startMessage.length) {
          modals.openModal(quest.id + ' Started!', quest.startMessage)
        } else {
          toast('quest started: ' + quest.id , {
             position:"top-right",
             autoClose: 6000,
             newestOnTop:true,
          })
        }
      }
    }

    this.onCompleteQuest = function(hero, questId) {
      const quest = hero.quests[questId]
      if(hero.id === HERO.id && quest) {
        if(quest.completionMessage.length) {
          modals.openModal(quest.id + ' Complete!', quest.completionMessage)
        } else {
          toast('quest completed: ' + quest.id , {
             position:"top-right",
             autoClose: 6000,
             newestOnTop:true,
          })
        }
      }
    }
  }

  _getActiveQuest(hero) {
    let activeQuest;
    if(hero.questState) {
      Object.keys(hero.questState).forEach((questId) => {
        if(hero.questState[questId].active) {
          activeQuest = hero.quests[questId]
        }
      })
    }
    return activeQuest
  }

  _showActiveQuestGoalToast() {
    const {
      activeQuest,
      toastingActiveQuestGoalId,
      toastingActiveQuestGoalToastId
    } = this.state;

    if(!activeQuest) {
      if(toastingActiveQuestGoalToastId) {
        toast.dismiss(toastingActiveQuestGoalToastId)
      }
      this.setState({
        toastingActiveQuestGoalId: null,
        toastingActiveQuestGoalToastId: null,
      })

      return
    }

    if(activeQuest && activeQuest.id !== toastingActiveQuestGoalId) {
      if(toastingActiveQuestGoalToastId) {
        toast.dismiss(toastingActiveQuestGoalToastId)
      }

      this.setState({
        toastingActiveQuestGoalId: activeQuest.id,
        toastingActiveQuestGoalToastId: toast(activeQuest.goal)
      })
    }
  }

  render() {
    if(CONSTRUCTEDITOR.open) return null
    if(!GAME.gameState || !GAME.gameState.loaded) return null

    const hero = GAME.heros[HERO.id]

    return (
      <div className="PlayerUI">
        <ToastContainer
          position="top-center"
          autoClose={false}
          hideProgressBar={true}
          closeOnClick={false}
          newestOnTop={false}
          closeButton={false}
          draggable={false}
          transition={Slide}
        />
        {hero.dialogue && hero.dialogue.length && <DialogueBox/>}
      </div>
    )
  }
}
