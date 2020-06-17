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

  window.triggerEffects = [
    'remove',
    'respawn',
    'destroy',
    'mutate',
    'goToStarView',
    'dialogue',
    'emitEvent',
    // 'morph',
    // 'coreBehavior',
    // 'duplicate',
    // 'talkToHero',
    // 'heroQuestStart',
    // 'heroQuestComplete',
    // 'heroPowerup',
    'spawnPoolIncrement',
    'spawnTotalIncrement',
    // 'spawnTotalRemove',
    // 'spawnHold',
    // 'spawnRelease',
    // 'spawnToggle',
    // 'movementToggle',
    // 'movementRelease',
    // 'movementHold',
    // 'timerStart',
    // 'timerHold',
    // 'timerRelease',
    // 'timerToggle',
    // 'disableTrigger',
    // 'enableTrigger',
    // 'toggleTrigger',
    // 'increaseFacingVelocity',
    'tagAdd',
    'tagRemove',
    'tagToggle',
    //'emitCustomEvent',
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
  owner.triggers[trigger.id].removeEventListener = window.local.on(eventName, (object, subject) => {
    let fx = () => triggerEffect(trigger, owner, object, subject)
    let eventMatch = false

    let { objectId, objectTag, subjectId, subjectTag } = trigger

    if(owner.tags.hero) {
      if(!subjectId && !subjectTag && eventName.indexOf('Object') >= 0) {
        subjectId = owner.id
      }
      if(!objectId && !objectTag && eventName.indexOf('Hero') >= 0) {
        objectId = owner.id
      }
    } else {
      if(!objectId && !objectTag && eventName.indexOf('Object') >= 0) {
        objectId = owner.id
      }
      if(!subjectId && !subjectTag && eventName.indexOf('Hero') >= 0) {
        subjectId = owner.id
      }
    }

    if(eventName.indexOf('Object') >= 0 || eventName.indexOf('Hero') >= 0) {
      // just check object
      if((objectId || objectTag) && !subjectId && !subjectTag && checkIdOrTagMatch(objectId, objectTag, object)) {
        eventMatch = true
      // just check subject
      } else if((subjectId || subjectTag) && !objectId && !objectTag && checkIdOrTagMatch(subjectId, subjectTag, subject)) {
        eventMatch = true
      // check subject and object
      } else if((subjectId || subjectTag) && (objectId || objectTag) && checkIdOrTagMatch(objectId, objectTag, object) && checkIdOrTagMatch(subjectId, subjectTag, subject)) {
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

function triggerEffect(trigger, owner, object, subject) {
  const { effectName, effectValue } = trigger
  let effector
  if(object && subject && object.id === owner.id) {
    effector = subject
  }
  if(object && subject && subject.id === owner.id) {
    effector = object
  }
  effects.processEffect(trigger, owner, effector)
}

export default {
  onPageLoaded,
  addTrigger,
  deleteTrigger,
}
