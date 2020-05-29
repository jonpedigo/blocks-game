import { startQuest, completeQuest } from './heros/quests'
import onTalk from './heros/onTalk'

// PROPS
// id,
// event,
// effect,
// effectValue,
// eventThreshold,
// subObjectName,
// remoteId,
// remoteTag,
// initialPool,

// mutationJSON,

// STATE
// pool
// eventCount
// disabled

// --
// ADD trigger/edit TRIGGER
// event
// effect

// OPTIONAL
// trigger X times
// trigger eventThreshold
// remote tag
// remote id

// SEPERATE MODAL
// mutation JSON

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
    'onGameStart',
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

function checkRemoteIdOrTagMatch(trigger, object) {
  if(trigger.remoteId && trigger.remoteId === object.id) {
    return true
  } else if(trigger.remoteTag && object.tags[trigger.remoteTag]) {
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
    let fx = () => triggerEffect(trigger, owner, subject)
    let eventMatch = false

    if(owner.tags.hero) {
      if(event.indexOf('Hero') >= 0) {
        if(checkRemoteIdOrTagMatch(trigger, object)) eventMatch = true
        if(!trigger.remoteId && !trigger.remoteTag && object.id === owner.id) {
          eventMatch = true
        }
      }

      if(event.indexOf('Object') >= 0) {
        fx = () => triggerEffect(trigger, owner, object)
        if(checkRemoteIdOrTagMatch(trigger, object)) eventMatch = true
      }
    } else {
      if(event.indexOf('Object') >= 0) {
        // if(checkRemoteIdOrTagMatch(trigger, object)) eventMatch = true
        if(!trigger.remoteId && !trigger.remoteTag && object.id === owner.id) {
          eventMatch = true
        }
      }

      if(event.indexOf('Hero') >= 0) {
        fx = () => triggerEffect(trigger, owner, object)
        // if(checkRemoteIdOrTagMatch(trigger, object)) eventMatch = true
        if(!trigger.remoteId && !trigger.remoteTag && subject.id === owner.id) {
          eventMatch = true
        }
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

function triggerEffect(trigger, object, subject) {
  const { effect, effectValue } = trigger

  if(effect === 'mutate') {
    console.log('mutating')
    // window.mergeDeep(owner, trigger.mutationJSON)
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
    object._destroy = true
  }

  if(effect === 'respawn') {
    OBJECTS.respawnObject(object)
  }
  if(effect === 'remove') {
    OBJECTS.removeObject(object)
  }

  if(effect === 'spawnTotalIncrement') {
    object.spawnTotal += effectValue || 1
  }

  //
  // if(effect === 'spawnTotalRemove') {
  //   object.spawnTotal = -1
  // }

  if(effect === 'spawnPoolIncrement') {
    object.spawnPool += effectValue || 1
    // object.spawnWait=false
    // if(object.spawnWaitTimerId) delete GAME.timeoutsById[object.spawnWaitTimerId]
  }

  if(effect === 'tagAdd') {
    let tag = effectValue
    object.tags[tag] = false
  }

  if(effect === 'tagRemove') {
    let tag = effectValue
    object.tags[tag] = true
  }

  if(effect === 'tagToggle') {
    let tag = effectValue
    object.tags[tag] = !object.tags[tag]
  }
}

export default {
  onPageLoaded,
  addTrigger,
  deleteTrigger,
}
