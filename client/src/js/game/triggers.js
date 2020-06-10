import { startQuest, completeQuest } from './heros/quests'
import onTalk from './heros/onTalk'

// LATER
// morph - subobject name
// add subHERO

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
  const event = trigger.event
  trigger.triggerPool = trigger.triggerPoolInitial

  if(!owner.triggers) owner.triggers = {}

  owner.triggers[trigger.id] = trigger
  Object.assign(owner.triggers[trigger.id], {
    pool: trigger.initialPool || 1,
    eventCount: 0,
    disabled: false,
  })
  owner.triggers[trigger.id].removeEventListener = window.local.on(event, (object, subject) => {
    let fx = () => triggerEffect(trigger, owner.id, object, subject)
    let eventMatch = false

    let { objectId, objectTag, subjectId, subjectTag } = trigger

    if(owner.tags.hero) {
      if(!subjectId && !subjectTag && event.indexOf('Object') >= 0) {
        subjectId = owner.id
      }
      if(!objectId && !objectTag && event.indexOf('Hero') >= 0) {
        objectId = owner.id
      }
    } else {
      if(!objectId && !objectTag && event.indexOf('Object') >= 0) {
        objectId = owner.id
      }
      if(!subjectId && !subjectTag && event.indexOf('Hero') >= 0) {
        subjectId = owner.id
      }
    }

    if(event.indexOf('Object') >= 0 || event.indexOf('Hero') >= 0) {
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

    if(event.indexOf('Game') >= 0 || event.indexOf('Quest') >= 0) {
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

function triggerEffect(trigger, ownerId, object, subject) {
  const { effect, effectValue } = trigger
  const owner = OBJECTS.getObjectOrHeroById(ownerId)

  if(effect === 'mutate' && trigger.mutationJSON) {
    window.mergeDeep(owner, trigger.mutationJSON)
  }

  // if(effect === 'talkToHero' && hero) {
  //   onTalk(hero, owner)
  // }
  //
  // if(effect === 'heroQuestStart' && hero) {
  //   startQuest(hero, effectValue)
  // }
  //
  // if(effect === 'heroQuestComplete' && hero) {
  //   completeQuest(hero, effectValue)
  // }

  if(effect === 'destroy') {
    if(object && subject && object.id === owner.id) {
      object._destroyedBy = subject
    }
    if(object && subject && subject.id === owner.id) {
      subject._destroyedBy = object
    }
    owner._destroy = true
  }

  if(effect === 'respawn') {
    OBJECTS.respawnObject(owner)
  }
  if(effect === 'remove') {
    OBJECTS.removeObject(owner)
  }

  if(effect === 'spawnTotalIncrement') {
    owner.spawnTotal += effectValue || 1
  }

  //
  // if(effect === 'spawnTotalRemove') {
  //   owner.spawnTotal = -1
  // }

  if(effect === 'spawnPoolIncrement') {
    owner.spawnPool += effectValue || 1
    // owner.spawnWait=false
    // if(owner.spawnWaitTimerId) delete GAME.timeoutsById[owner.spawnWaitTimerId]
  }

  if(effect === 'tagAdd') {
    let tag = effectValue
    owner.tags[tag] = false
  }

  if(effect === 'tagRemove') {
    let tag = effectValue
    owner.tags[tag] = true
  }

  if(effect === 'tagToggle') {
    let tag = effectValue
    owner.tags[tag] = !owner.tags[tag]
  }
}

export default {
  onPageLoaded,
  addTrigger,
  deleteTrigger,
}
