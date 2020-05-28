import { startQuest, completeQuest } from './heros/quests'
import onTalk from './heros/onTalk'

// trigger
// id
// event
// effect
// threshold
// effect value
// mutation
// subobject id
// remoteId
// remoteTag
// initialTriggerPool


// eventCount
// triggerPool

--
// ADD trigger/edit TRIGGER
// event
// effect

// OPTIONAL
// trigger X times
// trigger threshold
// remote tag
// remote id

// SEPERATE MODAL
// mutation JSON

// LATER
// morph - subobject name
// add subHERO

function init() {
  window.triggerEvents = [
    'onHeroCollide',
    'onHeroLand',
    'onHeroInteract',
    'onHeroDestroyed',
    'onObjectDestroyed',
    // 'OnTimerEnd',
    // 'OnDestroy',
    // 'OnHeroDestroy',
    // 'OnSpawn',
    'onObjectCollide',
    'onObjectInteractable',
    'onQuestStart',
    'onQuestComplete',
    // 'onQuestFail',
    // 'onAwake',
    'onGameStart',
    // 'OnAwareOfHero',
    // 'OnAwareOfObject,
    // 'onCustomEvent',
  ]

  window.triggerEffects = [
    'remove',
    'respawn',
    'mutate',
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
    trigger.eventCount
  } else if(trigger.remoteTag && object.tags[trigger.remoteTag]) {
    trigger.eventCount
  }
}

function addTrigger(object, trigger) {
  const event = trigger.event
  trigger.triggerPool = trigger.triggerPoolInitial

  window.local.on(event, (agent, subject) => {
    let fx = () => {}
    if(event.indexOf('Object')) {
      fx = () => triggerEffect(trigger, object)
      checkRemoteIdOrTagMatch(trigger, agent)
      if(!trigger.remoteId && !trigger.remoteTag && agent.id === object.id) {
        console.log('basic object event trigger')
        trigger.eventCount
      }
    }

    if(event.indexOf('Hero')) {
      fx = () => triggerEffect(trigger, object, agent)
      checkRemoteIdOrTagMatch(trigger, subject)
      if(!trigger.remoteId && !trigger.remoteTag && subject.id === object.id) {
        console.log('basic hero event trigger')
        trigger.eventCount
      }
    }

    if(event.indexOf('Game')) {
      fx = () => triggerEffect(trigger, object)
      trigger.eventCount
    }

    if(!trigger.threshold) {
      fx()
    } else if(trigger.times === trigger.threshold) {
      console.log('TRIGGERD', trigger.id)
      fx()
    }
  })
}

function triggerEffect(trigger, owner, hero) {
  const { effect, effectValue } = trigger

  if(effect === 'mutate') {
    window.mergeDeep(owner, trigger.mutation)
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
