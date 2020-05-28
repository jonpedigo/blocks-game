function init() {
  window.triggerEvents = [
    'onObjectCollide',
    'onHeroCollide',
    'onHeroLand',
    'onHeroInteract',
    'onDestroy',
    // 'OnTimerEnd',
    // 'OnDestroy',
    // 'OnHeroDestroy',
    // 'OnSpawn',
    'onInteractable',
    'onQuestStart',
    'onQuestComplete',
    // 'onQuestFail',
    // 'onAwake',
    'onGameStart',
    // 'OnAwareOfHero',
    // 'OnAwareOfObject,
  ]

  window.triggerEffects = [

  ]
}

function addTrigger(object, trigger) {
  window.local.on(trigger.event, () => {
    triggerEffect(object, trigger)
  })
}

function triggerEffect(object, trigger) {

  if(trigger.effectName === 'addSpawnPool') {

  }

  if(trigger.effectName === 'addSpawnPool') {
    object.spawnPool+= trigger.effectValue || 1
    // object.spawnWait=false
    // if(object.spawnWaitTimerId) delete GAME.timeoutsById[object.spawnWaitTimerId]
  }

  if(trigger.effectName === 'removeTag') {
    let tag = trigger.effectValue
    object.tags[tag] = false
  }

  if(trigger.effectName === 'addTag') {
    let tag = trigger.effectValue
    object.tags[tag] = true
  }

  if(trigger.effectName === 'toggleTag') {
    let tag = trigger.effectValue
    object.tags[tag] = !object.tags[tag]
  }


}
