import { startQuest, completeQuest } from './heros/quests'
import effects from './effects'

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
    onStartGame: { mainObject: null, guestObject: null },
  }
    // 'onHeroChooseOption',
    // 'OnObjectSpawn',
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

function checkIdOrTagMatch(id, tag, object) {
  if(id && id === object.id) {
    return true
  }
  if(tag && object.mod().tags[tag]) {
    return true
  }
}

function deleteTrigger(object, triggerId) {
  if(GAME.gameState.started) object.triggers[triggerId].removeEventListener()
  delete object.triggers[triggerId]
}

function removeTriggerEventListener(object, triggerId) {
  object.triggers[triggerId].removeEventListener()
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
    let eventMatch = false

    let { mainObjectId, mainObjectTag, guestObjectId, guestObjectTag } = trigger

    // the code below attempts to automatically determine the main object or the guest object
    // based on the name of the event
    if(ownerObject.mod().tags.hero) {
      if(!guestObjectId && !guestObjectTag && eventName.indexOf('Object') >= 0) {
        guestObjectId = ownerObject.id
      }
      if(!mainObjectId && !mainObjectTag && eventName.indexOf('Hero') >= 0) {
        mainObjectId = ownerObject.id
      }
    } else {
      if(!mainObjectId && !mainObjectTag && eventName.indexOf('Object') >= 0) {
        mainObjectId = ownerObject.id
      }
      if(!guestObjectId && !guestObjectTag && eventName.indexOf('Hero') >= 0) {
        guestObjectId = ownerObject.id
      }
    }

    // now that we have potential main/guests object ids/tags, we try to match them with the REAL main/guest objects from the event
    if(eventName.indexOf('Object') >= 0 || eventName.indexOf('Hero') >= 0) {
      // just check object
      if((mainObjectId || mainObjectTag) && !guestObjectId && !guestObjectTag && checkIdOrTagMatch(mainObjectId, mainObjectTag, mainObject)) {
        eventMatch = true
        // just check guestObject
      } else if((guestObjectId || guestObjectTag) && !mainObjectId && !mainObjectTag && checkIdOrTagMatch(guestObjectId, guestObjectTag, guestObject)) {
        eventMatch = true
        // check guestObject and object
      } else if((guestObjectId || guestObjectTag) && (mainObjectId || mainObjectTag) && checkIdOrTagMatch(mainObjectId, mainObjectTag, mainObject) && checkIdOrTagMatch(guestObjectId, guestObjectTag, guestObject)) {
        eventMatch = true
      }
    }

    if(eventName.indexOf('Game') >= 0 || eventName.indexOf('Quest') >= 0) {
      eventMatch = true
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
