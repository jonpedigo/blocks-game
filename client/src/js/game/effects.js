import onTalk from './heros/onTalk'
import { startSequence } from './sequence'

  // { effectName: remove, anything: true, hero: false, object: false, world: false, spawnZone: false, timer: false
  //allowed: [anything, hero, object, world, spawnZone, timer]
  // requirements: {
  // effector: false,
  // position: false,
  // JSON: false,
  // effectValue: false,
  // tag: false,
  // eventName: false,
  // id: false,
  // number: false,
  // smallText: false,
  // largeText: false
  //}
 //}
  window.triggerEffects = [
    'remove',
    'respawn',
    'destroy',
    'mutate',
    // 'goToStarView',
    'dialogue',
    // 'emitEvent',
    'startSequence',
    // 'morph',
    // 'coreBehavior',
    // 'duplicate',
    // 'talkToHero',
    // 'heroQuestStart',
    // 'heroQuestComplete',
    // 'heroPowerup',
    // 'spawnPoolIncrement',
    // 'spawnTotalIncrement',
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
    // 'pathfindTo',
    // 'moveTo',
    'tagAdd',
    'tagRemove',
    'tagToggle',
    //'emitCustomEvent',
  ]

function processEffect(effect, effected, effector) {
  const { effectName, effectValue, mutationJSON } = effect
  if(effectName === 'mutate' && mutationJSON) {
    window.mergeDeep(effected, mutationJSON)
  }

  // if(effectName === 'talkToHero' && hero) {
  //   onTalk(hero, owner)
  // }
  //
  // if(effectName === 'heroQuestStart' && hero) {
  //   startQuest(hero, effectValue)
  // }
  //
  // if(effectName === 'heroQuestComplete' && hero) {
  //   completeQuest(hero, effectValue)
  // }

  if(effectName === 'dialogue') {
    effected.dialogue = [effectValue]
    effected.flags.showDialogue = true
    effected.flags.paused = true
    if(effector.name) {
      effected.dialogueName = effector.name
    } else {
      effected.dialogueName = null
    }
  }

  if(effectName === 'destroy') {
    effected._destroyedBy = effector
    effected._destroy = true
  }

  if(effectName === 'respawn') {
    OBJECTS.respawnObject(effected)
  }
  if(effectName === 'remove') {
    OBJECTS.removeObject(effected)
  }

  if(effectName === 'spawnTotalIncrement') {
    effected.spawnTotal += effectValue || 1
  }

  //
  // if(effectName === 'spawnTotalRemove') {
  //   effected.spawnTotal = -1
  // }

  if(effectName === 'spawnPoolIncrement') {
    effected.spawnPool += effectValue || 1
    // effected.spawnWait=false
    // if(effected.spawnWaitTimerId) delete GAME.timeoutsById[effected.spawnWaitTimerId]
  }

  if(effectName === 'tagAdd') {
    let tag = effectValue
    effected.tags[tag] = false
  }

  if(effectName === 'tagRemove') {
    let tag = effectValue
    effected.tags[tag] = true
  }

  if(effectName === 'tagToggle') {
    let tag = effectValue
    effected.tags[tag] = !effected.tags[tag]
  }

  if(effectName === 'startSequence') {
    const context = {
      mainObject: effected,
      guestObject: effector,
    }
    startSequence(effectValue, context)
  }
}

export default {
  processEffect
}
