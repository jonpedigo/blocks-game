import { startQuest, completeQuest } from './heros/quests'
import effects from './effects'

// LATER
// morph - subobject name
// add subHERO

// SO WHAT IM GOING TO DO IS IM GOING TO
// objects can have sequences, heros can have sequences, and the game can have sequences
// a context can consist of 0, 1, or 2 objects.
// I want to know what the context of a sequence is or what the context of a trigger is right?
// The context of a trigger changes what it can effect. If it has both an object and a subject you can select those in the interface
// for every effect or condition you can survey or effect the subject, the object, an object id or a group of objects with a tag

/*
 effect
 {
  subjects: [] // subject, object, tag, id
  effects: [] // effect name + effect value + mutationJSON + other such as revert option
 }
*/

/*
 condition
 {
  list: [
    { subject: // subject, object, tag, id,
      condition: // JSON match, is within tag, is within id, is during time
    }
  }
  pass:
  fail:
 }
*/


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
    // 'onNoticeHero',
    // 'onNoticeObject'
    // 'onObjectNoticed',
    // 'onHeroNoticed,
    // 'onQuestFail',
    // 'onObjectAwake',
    // 'OnTimerEnd',
}

function checkIdOrTagMatch(id, tag, object) {
  if(id && id === object.id) {
    return true
  }
  if(tag && object.tags[tag]) {
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
    if(ownerObject.tags.hero) {
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
  const { effectName, effectValue } = trigger

  // the default effected is the ownerObject of the trigger
  let effected
  let effector

  if(trigger.effectedObject === 'ownerObject') {
    effected = ownerObject
  } else if(trigger.effectedObject === 'mainObject') {
    effected = mainObject
  } else if(trigger.effectedObject === 'guestObject') {
    effected = guestObject
  } else {
    effected = ownerObject
  }

  if(trigger.effectorObject === 'ownerObject') {
    effector = ownerObject
  } else if(trigger.effectorObject === 'mainObject') {
    effector = mainObject
  } else if(trigger.effectorObject === 'guestObject') {
    effector = guestObject
  // this finds if the effected is the mainObject or the guestObject
  // the non effected one will be the effector
  } else if(mainObject && guestObject && mainObject.id === effected.id) {
    effector = guestObject
  } else if(mainObject && guestObject && guestObject.id === effected.id) {
    effector = mainObject
  } else {
    // if the ownerObject is neither, this object is remote
    // we use the default effector, the guest object
    effector = guestObject
  }

  // every thing else below could be considered a 'smart trigger effect'
  // if its a ddialogue effect its only for heros and therefore we can bypass the default plan
  // if(true || trigger.smart) {
  //   if(effectName === 'dialogue') {
  //     if(mainObject.tags.hero) {
  //       effected = mainObject
  //       effector = guestObject
  //     } else if(guestObject.tags.hero) {
  //       effected = guestObject
  //       effector = mainObject
  //     }
  //   }
  // }

  effects.processEffect(trigger, effected, effector)
}

export default {
  onPageLoaded,
  addTrigger,
  deleteTrigger,
  removeTriggerEventListener,
}
