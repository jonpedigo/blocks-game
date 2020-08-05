import { startQuest, completeQuest } from './heros/quests'
import effects from './effects'
import { testEventMatch } from './conditions'

function onPageLoaded() {
  window.triggerEvents = {
    onHeroCollide: { mainObject: 'hero', guestObject: 'anything' },
    onHeroLand: { mainObject: 'hero', guestObject: 'anything' },
    onHeroInteract: { mainObject: 'hero', guestObject: 'anything' },
    onHeroDestroyed: { mainObject: 'hero', guestObject: 'anything', guestObjectOptional: true },
    onHeroStartQuest: { mainObject: 'hero', guestObject: 'questId', guestObjectOptional: true },
    onHeroCompleteQuest: { mainObject: 'hero', guestObject: 'questId', guestObjectOptional: true },
    onObjectDestroyed: { mainObject: 'object', guestObject: 'anything', guestObjectOptional: true },
    onObjectCollide: { mainObject: 'object', guestObject: 'anything' },
    onObjectInteractable: { mainObject: 'object', guestObject: 'hero' },
    onGameStart: { mainObject: null, guestObject: null },
    onStoryStart: { mainObject: null, guestObject: null },
  }
  // -> onHeroPickup
  // -> onHeroDrop
  // -> onHeroDeposit
  // -> onHeroWithdraw
  // -> onHeroDestroyed
  // -> onHeroRespawned
  // -> onHeroEquip
  // -> onHeroAware

    // 'onHeroChooseOption',
    // 'onObjectSpawn',
    // 'onObjectNoticed',
    // 'onObjectNotice',
    // 'onHeroCanInteract'
    // 'onHeroNoticed,
    // 'onHeroNotice,
    // 'onQuestFail',
    // 'onObjectAwake',
    // 'onTimerEnd',
    // 'onHeroEnter'
    // 'onObjectEnter'
    // 'onHeroLeave'
    // 'onObjectLeave'
    // 'onUpdate' -> for sequences with conditions
    // 'onTagDepleted', <-- ugh would be instead of crazy event thresholds
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
  Object.assign(ownerObject.triggers[trigger.id], {
    triggerPool: trigger.initialTriggerPool || 1,
    eventCount: 0,
    disabled: false,
  })

  ownerObject.triggers[trigger.id].removeEventListener = window.local.on(eventName, (mainObject, guestObject) => {
    let fx = () => triggerEffectSmart(trigger, ownerObject, mainObject, guestObject)
    const eventMatch = testEventMatch(eventName, mainObject, guestObject, trigger, ownerObject)

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

  effectedObjects.forEach((effected) => {
    effects.processEffect(trigger, effected, effector)
  })
}

export default {
  onPageLoaded,
  addTrigger,
  deleteTrigger,
  removeTriggerEventListener,
}
