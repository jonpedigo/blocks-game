import React from 'react'
import DialogueBox from './DialogueBox.jsx'
import InventoryModal from './InventoryModal.jsx'
import MainMenuModal from './MainMenuModal.jsx'
import HeroMenuModal from './HeroMenuModal.jsx'
import ControlsInfo from './ControlsInfo.jsx'
import GameLogs from './GameLogs.jsx'
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
      showInventoryModal: false,
      showMainMenuModal: false,
      showControlsInfoModal: false,
      showHeroMenuModal: false,
      hero: GAME.heros[HERO.id],
    }

    this.gameLogRef = React.createRef()

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

  onSendNotification(data) {
    if(data.toast) {
      toast(data.text, {
        position: "top-right",
        autoClose: data.duration || 3000,
        newestOnTop: true,
      })
    }
  }

  _renderGameLog() {
    if(!GAME.world.tags.hasGameLog || !PAGE.isGameReady) return

    return <React.Fragment>
      {PAGE.isLogOpen && <GameLogs ref={this.gameLogRef} logs={GAME.gameState.logs}/>}
      {!PAGE.isLogOpen && <div className="PlayerUI__open-log"><i className="fa fas fa-chevron-left" onClick={PAGE.openLog}/></div>}
      {PAGE.isLogOpen && <div className="PlayerUI__close-log"><i className="fa fas fa-times" onClick={PAGE.closeLog}/></div>}
    </React.Fragment>
  }

  render() {
    const { showInventoryModal, showMainMenuModal, showControlsInfoModal, showHeroMenuModal, hero } = this.state;
    if (CONSTRUCTEDITOR.open) return null
    if (!GAME.gameState || !GAME.gameState.loaded) return null

    // <div className="ShortcutPanel">
    //   <i className="ShortcutPanel__main-menu fa fas fa-bars"></i>
    // </div>

    return (
      <div className="PlayerUI">
        {hero.flags && hero.flags.showDialogue && hero.dialogue && hero.dialogue.length > 0 && <DialogueBox dialogue={hero.dialogue} />}
        {hero.flags && hero.flags.showDialogue && hero.choiceOptions && <DialogueBox options={hero.choiceOptions} />}
        {showMainMenuModal && <MainMenuModal
          onClose={() => this.setState({ showMainMenuModal: false })}
          onOpenControlsInfoModal={() => this.setState({ showControlsInfoModal: true })}
        />}
        {showHeroMenuModal && <HeroMenuModal
          hero={hero}
          onClose={() => this.setState({ showHeroMenuModal: false })}
          onOpenInventoryModal={() => this.setState({ showInventoryModal: true })}
        />}
        {showControlsInfoModal && <Modal
          size="medium"
          onClose={this._closeControlsInfoModal}
        >
          <ControlsInfo onClose={this._closeControlsInfoModal}/>
        </Modal>}
        {showInventoryModal && <InventoryModal
          onClose={() => this.setState({ showInventoryModal: false })}
          inventoryItems={hero.subObjects}
        />}
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
      {this._renderGameLog()}
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

  _isModalOpen = () => {
    const { showInventoryModal, showMainMenuModal, showControlsInfoModal, showHeroMenuModal } = this.state;

    return showInventoryModal || showMainMenuModal || showControlsInfoModal || showHeroMenuModal
  }

  _onKeyDown = (event) => {
    const key = keycode(event.keyCode)

    if(GAME.world.tags.allowHeroChat && key === 'enter' && PAGE.isLogOpen) {
      this.gameLogRef.current.onEnterPressed()
    }

    if(key === 'esc') {
      this.gameLogRef.current.onEscPressed()
      return
    }

    if(PAGE.typingMode) return

    // if (key === "i") {
    //   this.setState({ showInventoryModal: !this.state.showInventoryModal })
    // }

    if(key === 'esc') {
      event.preventDefault();
      if(this.state.showMainMenuModal) {
        this.setState({ showMainMenuModal: false })
      } else if(this._isModalOpen()){
        this.setState({ showMainMenuModal: false, showInventoryModal: false, showControlsInfoModal: false, showHeroMenuModal: false })
      } else {
        this.setState({ showMainMenuModal: true })
      }
    }

    if(key === 'tab') {
      event.preventDefault();
      if(this.state.showHeroMenuModal) {
        this.setState({ showHeroMenuModal: false })
      } else if(this._isModalOpen()){
        this.setState({ showHeroMenuModal: true, showInventoryModal: false, showControlsInfoModal: false, showMainMenuModal: false })
      } else {
        this.setState({ showHeroMenuModal: true })
      }
    }
  }
}
