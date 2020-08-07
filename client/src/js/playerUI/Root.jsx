import React from 'react'
import DialogueBox from './DialogueBox.jsx'
import Inventory from './Inventory.jsx'
import { ToastContainer, toast, Slide, Zoom, Flip, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import modals from './modals.js';

export default class Root extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      activeQuest: {},
      gameState: {},
      toastingActiveQuestGoalId: null,
      toastingActiveQuestGoalToastId: null,
      showInventory: false,
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

    this.onHeroStartQuest = function (hero, questId) {
      const quest = hero.quests[questId]
      if (hero.id === HERO.id && quest) {
        if (quest.startMessage.length) {
          modals.openModal(quest.id + ' Started!', quest.startMessage)
        } else {
          toast('quest started: ' + quest.id, {
            position: "top-right",
            autoClose: 6000,
            newestOnTop: true,
          })
        }
      }
    }

    this.onHeroCompleteQuest = function (hero, questId) {
      const quest = hero.quests[questId]
      if (hero.id === HERO.id && quest) {
        if (quest.completionMessage.length) {
          modals.openModal(quest.id + ' Complete!', quest.completionMessage)
        } else {
          toast('quest completed: ' + quest.id, {
            position: "top-right",
            autoClose: 6000,
            newestOnTop: true,
          })
        }
      }
    }
    this._toggleInventory = this._toggleInventory.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this._toggleInventory, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this._toggleInventory, false);
  }

  _getActiveQuest(hero) {
    let activeQuest;
    if (hero.questState) {
      Object.keys(hero.questState).forEach((questId) => {
        if (hero.questState[questId].active) {
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

    if (!activeQuest) {
      if (toastingActiveQuestGoalToastId) {
        toast.dismiss(toastingActiveQuestGoalToastId)
      }
      this.setState({
        toastingActiveQuestGoalId: null,
        toastingActiveQuestGoalToastId: null,
      })

      return
    }

    if (activeQuest && activeQuest.id !== toastingActiveQuestGoalId) {
      if (toastingActiveQuestGoalToastId) {
        toast.dismiss(toastingActiveQuestGoalToastId)
      }

      this.setState({
        toastingActiveQuestGoalId: activeQuest.id,
        toastingActiveQuestGoalToastId: toast(activeQuest.goal)
      })
    }
  }

  _toggleInventory(event) {
    if (event.code === "KeyI") {
      this.setState({ showInventory: !this.state.showInventory })
    }
  }

  onHeroNotification(data) {
    if(data.type === 'toast') {
      toast(data.message, {
        position: "top-right",
        autoClose: data.duration || 1500,
        newestOnTop: true,
      })
    }
  }

  render() {
    const { showInventory } = this.state;
    if (CONSTRUCTEDITOR.open) return null
    if (!GAME.gameState || !GAME.gameState.loaded) return null
    const hero = GAME.heros[HERO.id]
    return (
      <div className="PlayerUI">
        {showInventory ? <Inventory inventoryItems={hero.subObjects} /> : null}
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
        {hero.flags && hero.flags.showDialogue && hero.dialogue && hero.dialogue.length > 0 && <DialogueBox dialogue={hero.dialogue} />}
        {hero.flags && hero.flags.showDialogue && hero.choiceOptions && <DialogueBox options={hero.choiceOptions} />}
      </div>
    )
  }
}
