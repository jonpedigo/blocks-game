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
  window.triggerEvents = [
    'onHeroCollide',
    'onHeroLand',
    'onHeroInteract',
    'onHeroDestroyed',
    // 'onHeroChooseOption',
    // 'OnObjectSpawn',
    'onObjectDestroyed',
    'onObjectCollide',
    'onObjectInteractable',
    // 'onNoticeHero',
    // 'onNoticeObject'
    // 'onObjectNoticed',
    // 'onHeroNoticed,
    'onQuestStart',
    'onQuestComplete',
    // 'onQuestFail',
    // 'onObjectAwake',
    // 'OnTimerEnd',
    'onStartGame',
  ]
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

function addTrigger(owner, trigger) {
  const eventName = trigger.eventName
  trigger.triggerPool = trigger.triggerPoolInitial

  if(!owner.triggers) owner.triggers = {}

  owner.triggers[trigger.id] = trigger
  Object.assign(owner.triggers[trigger.id], {
    pool: trigger.initialPool || 1,
    eventCount: 0,
    disabled: false,
  })

  owner.triggers[trigger.id].removeEventListener = window.local.on(eventName, (mainObject, otherObject) => {
    let fx = () => triggerEffectSmart(trigger, owner, mainObject, otherObject)
    let eventMatch = false

    let { mainObjectId, mainObjectTag, otherObjectId, otherObjectTag } = trigger

    // the code below attempts to automatically determine the main object or the other object
    // based on the name of the event
    if(owner.tags.hero) {
      if(!otherObjectId && !otherObjectTag && eventName.indexOf('Object') >= 0) {
        otherObjectId = owner.id
      }
      if(!mainObjectId && !mainObjectTag && eventName.indexOf('Hero') >= 0) {
        mainObjectId = owner.id
      }
    } else {
      if(!mainObjectId && !mainObjectTag && eventName.indexOf('Object') >= 0) {
        mainObjectId = owner.id
      }
      if(!otherObjectId && !otherObjectTag && eventName.indexOf('Hero') >= 0) {
        otherObjectId = owner.id
      }
    }

    // now that we have potential main/others object ids/tags, we try to match them with the REAL main/other objects from the event
    if(eventName.indexOf('Object') >= 0 || eventName.indexOf('Hero') >= 0) {
      // just check object
      if((mainObjectId || mainObjectTag) && !otherObjectId && !otherObjectTag && checkIdOrTagMatch(mainObjectId, mainObjectTag, mainObject)) {
        eventMatch = true
        // just check otherObject
      } else if((otherObjectId || otherObjectTag) && !mainObjectId && !mainObjectTag && checkIdOrTagMatch(otherObjectId, otherObjectTag, otherObject)) {
        eventMatch = true
        // check otherObject and object
      } else if((otherObjectId || otherObjectTag) && (mainObjectId || mainObjectTag) && checkIdOrTagMatch(mainObjectId, mainObjectTag, mainObject) && checkIdOrTagMatch(otherObjectId, otherObjectTag, otherObject)) {
        eventMatch = true
      }
    }

    if(eventName.indexOf('Game') >= 0 || eventName.indexOf('Quest') >= 0) {
      eventMatch = true
    }

    if(eventMatch) {
      if(trigger.pool == 0) return
      trigger.eventCount++
      if(!trigger.eventThreshold) {
        fx()
        if(trigger.pool > 0) trigger.pool--
      } else if(trigger.eventCount >= trigger.eventThreshold) {
        fx()
        if(trigger.pool > 0) trigger.pool--
      }
    }
  })
}

function triggerEffectSmart(trigger, owner, mainObject, otherObject) {
  const { effectName, effectValue } = trigger

  // when the trigger is remote, the main object will not be the owner, it will be another remote object
  let effected = owner
  let effector = otherObject

  // the default effected is the owner of the trigger
  // this finds if the owner is the mainObject or the otherObject
  // the remaining one will be the effector
  if(mainObject && otherObject && mainObject.id === owner.id) {
    effector = otherObject
  }
  if(mainObject && otherObject && otherObject.id === owner.id) {
    effector = mainObject
  }

  // every thing else below could be considered a 'smart trigger effect'
  // if its a ddialogue effect its only for heros and therefore we can bypass the default plan
  if(true || trigger.smart) {
    if(effectName === 'dialogue') {
      if(mainObject.tags.hero) {
        effected = mainObject
        effector = otherObject
      } else if(otherObject.tags.hero) {
        effected = otherObject
        effector = mainObject
      }
    }
  }

  effects.processEffect(trigger, effected, effector)
}

export default {
  onPageLoaded,
  addTrigger,
  deleteTrigger,
}
