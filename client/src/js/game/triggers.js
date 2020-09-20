import { startQuest, completeQuest } from './heros/quests'
import effects from './effects'
import { testEventMatch } from './conditions'

function onPlayerIdentified() {
  window.triggerEvents = {
    onHeroCollide: { mainObject: 'hero', guestObject: 'anything' },
    onHeroLand: { mainObject: 'hero', guestObject: 'anything' },
    onHeroInteract: { mainObject: 'hero', guestObject: 'anything' },
    onHeroDestroyed: { mainObject: 'hero', guestObject: 'anything', guestObjectOptional: true },
    onHeroAware: { mainObject: 'hero', guestObject: 'anything' },
    onHeroUnaware: { mainObject: 'hero', guestObject: 'anything' },
    onHeroEnter: { mainObject: 'hero', guestObject: 'anything' },
    onHeroLeave: { mainObject: 'hero', guestObject: 'anything' },
    onHeroStartQuest: { mainObject: 'hero', guestObject: 'questId', guestObjectOptional: true },
    onHeroCompleteQuest: { mainObject: 'hero', guestObject: 'questId', guestObjectOptional: true },
    onHeroPickup: { mainObject: 'hero', guestObject: 'object' },
    onHeroDrop: { mainObject: 'hero', guestObject: 'subobject' },
    onHeroWithdraw: { mainObject: 'hero', guestObject: 'anything' },
    onHeroDeposit: { mainObject: 'hero', guestObject: 'object' },
    // onHeroRespawn: { mainObject: 'hero', guestObject: null },
    // onHeroEquip: { mainObject: 'hero', guestObject: 'anything'},
    onGameStart: { mainObject: null, guestObject: null },
    onStoryStart: { mainObject: null, guestObject: null },
    onObjectDestroyed: { mainObject: 'object', guestObject: 'anything', guestObjectOptional: true },
    onObjectAware: { mainObject: 'object', guestObject: 'anything' },
    onObjectUnaware: { mainObject: 'object', guestObject: 'anything' },
    onObjectEnter: { mainObject: 'object', guestObject: 'anything' },
    onObjectLeave: { mainObject: 'object', guestObject: 'anything' },
    onObjectCollide: { mainObject: 'object', guestObject: 'anything' },
    onObjectInteractable: { mainObject: 'object', guestObject: 'hero' },
    onTagDepleted: { mainObject: 'tag' },
    onAnticipateCompleted: {},
    onSequenceEnded: {}
  }
  // 'onHeroExamine' <-- only for notifications/logs
  // 'onHeroSwitch'

    // 'onHeroChooseOption',
    // 'onObjectSpawn',
    // 'onHeroCanInteract'
    // 'onQuestFail',
    // 'onObjectAwake',
    // 'onTimerEnd',
    // 'onUpdate' -> for sequences with conditions
}

function deleteTrigger(object, triggerId) {
  if(object.triggers[triggerId].removeEventListener) object.triggers[triggerId].removeEventListener()
  delete object.triggers[triggerId]
}

function removeTriggerEventListener(object, triggerId) {
  if(object.triggers[triggerId].removeEventListener) object.triggers[triggerId].removeEventListener()
}

function addTrigger(ownerObject, trigger) {
  const eventName = trigger.eventName

  if(!ownerObject.triggers) ownerObject.triggers = {}

  ownerObject.triggers[trigger.id] = trigger

  // make sure not to reinitilize this trigger on page reload
  if(typeof trigger.triggerPool !== 'number') {
    let initialTriggerPool = trigger.initialTriggerPool
    if(typeof initialTriggerPool !== 'number') {
      initialTriggerPool = -1
    }
    Object.assign(ownerObject.triggers[trigger.id], {
       triggerPool: initialTriggerPool,
       eventCount: 0,
       disabled: false,
     })
  }

  // honestly cant believe this was happening..lol I got a lot of work to do
  if(!PAGE.role.isHost) return

  ownerObject.triggers[trigger.id].removeEventListener = window.local.on(eventName, (mainObject, guestObject) => {
    let fx = () => triggerEffectSmart(trigger, ownerObject, mainObject, guestObject)

    let eventMatch = false

    if(eventName === 'onTagDepleted') {
      eventMatch = mainObject === trigger.mainObjectTag
    } else {
      eventMatch = testEventMatch(eventName, mainObject, guestObject, trigger, ownerObject)
    }

    if(eventMatch) {
      if(trigger.triggerPool == 0) return
      trigger.eventCount++
      if(!trigger.eventThreshold) {
        fx()
        if(trigger.triggerPool > 0) trigger.triggerPool--
      } else if(trigger.eventCount >= trigger.eventThreshold) {
        fx()
        if(trigger.triggerPool > 0) trigger.triggerPool--
      }
    }
  })
}

function triggerEffectSmart(trigger, ownerObject, mainObject, guestObject) {
  const effectedObjects = effects.getEffectedObjects(trigger, mainObject, guestObject, ownerObject)

  let effector = guestObject
  if(trigger.effectorObject) {
    if(trigger.effectorObject === 'mainObject') {
      effector = mainObject
    } else if(trigger.effectorObject === 'guestObject') {
      effector = guestObject
    } else if(trigger.effectorObject === 'ownerObject') {
      effector = ownerObject
    } else if(trigger.effectorObject !== 'default') {
      effector = GAME.objectsById[trigger.effectorObject]
      if(!effector) {
        effector = GAME.heros[trigger.effectorObject]
      }
      if(!effector) {
        effector = defaultEffector
      }
    }
  }

  // inside of ObjectId is currently the only id selector that can also select main Object, guest Object, etc
  // this converts the condition value to an id if its not already an id essentially
  // this also exists when a sequence item is processed
  if(trigger.conditionType === 'insideOfObjectId') {
    if(trigger.conditionValue === 'mainObject') {
      trigger.conditionValue = mainObject.id
    } else if(trigger.conditionValue === 'guestObject') {
      trigger.conditionValue = guestObject.id
    } else if(trigger.conditionValue === 'ownerObject') {
      trigger.conditionValue = ownerObject.id
    }
  }

  const herosNotified = []
  effectedObjects.forEach((effected) => {
    if(trigger.notificationText) {
      if(effected.tags.hero) {
        window.socket.emit('sendNotification', { playerUIHeroId: effected.id, chatId: effected.id, logRecipientId: effected.id, toast: trigger.notificationToast, log: trigger.notificationLog, chat: trigger.notificationChat, modal: trigger.notificationModal, text: trigger.notificationText, modalHeader: trigger.notificationModalHeader, duration: trigger.notificationDuration })
        herosNotified.push(effected.id)
      } else window.socket.emit('sendNotification', { chatId: effected.id, log: trigger.notificationLog, chat: trigger.notificationChat, text: trigger.notificationText, duration: trigger.notificationDuration })
    }

    effects.processEffect(trigger, effected, effector, ownerObject)
  })

  // if(trigger.notificationAllHerosInvolved) {
  //   let heroId = null
  //   if(ownerObject.tags.hero) {
  //     heroId = ownerObject.id
  //   }
  //   if(mainObject.tags.hero) {
  //     heroId = ownerObject.id
  //   }
  //   if(guestObject.tags.hero) {
  //     heroId = ownerObject.id
  //   }
  //   window.socket.emit('sendNotification', { heroId, toast: trigger.notificationToast, log: trigger.notificationLog, chat: trigger.notificationChat, text: trigger.notificationText })
  // }

  if(trigger.notificationAllHeros) {
    GAME.heroList.forEach((hero) => {
      if(herosNotified.indexOf(hero.id) > -1) return
      window.socket.emit('sendNotification', { playerUIHeroId: hero.id, logRecipientId: hero.id, chatId: hero.id, toast: trigger.notificationToast, chat: trigger.notificationChat, text: trigger.notificationText, log: trigger.notificationLog, modal: trigger.notificationModal, modalHeader: trigger.notificationModalHeader, duration: trigger.notificationDuration})
    })
  }

  // if(trigger.triggerRemoverOwnerAfter) {
  //   GAME.objectsById[trigger.ownerId]._remove = true
  // }
}

export default {
  onPlayerIdentified,
  addTrigger,
  deleteTrigger,
  removeTriggerEventListener,
}
