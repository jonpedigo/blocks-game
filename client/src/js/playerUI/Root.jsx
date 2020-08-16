import React from 'react'
import DialogueBox from './DialogueBox.jsx'
import Inventory from './Inventory.jsx'
import MainMenuModal from './MainMenuModal.jsx'
import ControlsInfo from './ControlsInfo.jsx'
import Modal from '../components/Modal.jsx'
import { ToastContainer, toast, Slide, Zoom, Flip, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import modals from './modals.js';
import keycode from 'keycode'

export default class Root extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      activeQuest: {},
      gameState: {},
      toastingActiveQuestGoalId: null,
      toastingActiveQuestGoalToastId: null,
      showInventory: false,
      showMainMenuModal: false,
      hero: GAME.heros[HERO.id],
      showControlsInfoModal: false,
    }

    this.onUpdateState = (heroOverride) => {
      const hero = GAME.heros[HERO.id]
      this.setState({
        hero: heroOverride || hero,
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
  }

  componentDidMount() {
    document.addEventListener("keydown", this._onKeyDown, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this._onKeyDown, false);
  }

  onHeroNotification(data) {
    if(data.type === 'toast') {
      toast(data.message, {
        position: "top-right",
        autoClose: data.duration || 3000,
        newestOnTop: true,
      })
    }
  }

  render() {
    const { showInventory, showMainMenuModal, showControlsInfoModal, hero } = this.state;
    if (CONSTRUCTEDITOR.open) return null
    if (!GAME.gameState || !GAME.gameState.loaded) return null

    return (
      <div className="PlayerUI">
        <div className="ShortcutPanel">
          <i className="ShortcutPanel__main-menu fa fas fa-bars"></i>
        </div>
        {showMainMenuModal && <MainMenuModal
          onClose={() => this.setState({ showMainMenuModal: false })}
          onOpenControlsInfoModal={() => this.setState({ showControlsInfoModal: true })}
        />}
        {showControlsInfoModal && <Modal
          size="medium"
          onClose={this._closeControlsInfoModal}
        >
          <ControlsInfo onClose={this._closeControlsInfoModal}/>
        </Modal>}
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

  _closeControlsInfoModal = () => {
    this.setState({ showControlsInfoModal: false })
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

  _onKeyDown = (event) => {
    if(PAGE.typingMode) return

    const key = keycode(event.keyCode)
    if (key === "i") {
      this.setState({ showInventory: !this.state.showInventory })
    }
    if (key === "enter" || key === 'esc') {
      this.setState({ showMainMenuModal: !this.state.showMainMenuModal })
    }
  }
}
