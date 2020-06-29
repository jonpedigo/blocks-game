import onHeroUpdate from './onHeroUpdate'
import onTalk from './onTalk'
import onBehavior from './onBehavior'
import onCombat from './onCombat'
import { startQuest, completeQuest } from './quests'

export default function onHeroTrigger(hero, collider, result, options = { fromInteractButton: false }) {
  const isInteraction = options.fromInteractButton
  let triggered = false

  if(!isInteraction) {
    onCombat(hero, collider, result, options)
    triggered = true
  }

  if(collider.mod().tags['skipHeroGravityOnCollide']) {
    hero._skipNextGravity = true
  }

  if(collider.mod().tags['behaviorOnHeroCollide'] && !isInteraction) {
    onBehavior(hero, collider, result, options)
    triggered = true
  }
  if(collider.mod().tags['behaviorOnHeroInteract'] && isInteraction) {
    onBehavior(hero, collider, result, options)
    triggered = true
  }

  if(collider.mod().tags['updateHeroOnHeroCollide'] && !isInteraction) {
    onHeroUpdate(hero, collider, result, options)
    triggered = true
  }

  if(collider.mod().tags['updateHeroOnHeroInteract'] && isInteraction) {
    onHeroUpdate(hero, collider, result, options)
    triggered = true
  }

  if(collider.tags && collider.mod().tags['talker'] && collider.heroDialogue && collider.heroDialogue.length) {
    if(collider.mod().tags['talkOnHeroCollide'] && !isInteraction) {
      onTalk(hero, collider, result, options)
      triggered = true
    }

    if(collider.mod().tags['talkOnHeroInteract'] && isInteraction) {
      onTalk(hero, collider, result, options)
      triggered = true
    }
  }

  if(collider.tags && collider.mod().tags['questGiver'] && collider.questGivingId && hero.quests && hero.questState && hero.questState[collider.questGivingId] && !hero.questState[collider.questGivingId].started && !hero.questState[collider.questGivingId].completed) {
    if(collider.mod().tags['giveQuestOnHeroCollide'] && !isInteraction) {
      startQuest(hero, collider.mod().questGivingId)
      triggered = true
    }
    if(collider.mod().tags['giveQuestOnHeroInteract'] && isInteraction) {
      startQuest(hero, collider.mod().questGivingId)
      triggered = true
    }
  }

  if(collider.tags && collider.mod().tags['questCompleter'] && collider.questCompleterId && hero.quests && hero.questState && hero.questState[collider.questCompleterId] && hero.questState[collider.questCompleterId].started && !hero.questState[collider.questCompleterId].completed) {
    if(collider.mod().tags['completeQuestOnHeroCollide'] && !isInteraction) {
      completeQuest(hero, collider.mod().questCompleterId)
      triggered = true
    }
    if(collider.mod().tags['completeQuestOnHeroInteract'] && isInteraction) {
      completeQuest(hero, collider.mod().questCompleterId)
      triggered = true
    }
  }

  if(collider.tags && collider.mod().tags['heroCameraShakeOnHeroCollide_quickrumble']) {
    window.socket.emit('heroCameraEffect', 'cameraShake', hero.id, { duration: 50, frequency: 10, amplitude: 5})
    triggered = true
  }

  if(collider.tags && collider.mod().tags['heroCameraShakeOnHeroCollide_longrumble']) {
    window.socket.emit('heroCameraEffect', 'cameraShake', hero.id, { duration: 3000, frequency: 10, amplitude: 8 })
    triggered = true
  }

  if(collider.tags && collider.mod().tags['heroCameraShakeOnHeroCollide_quick']) {
    window.socket.emit('heroCameraEffect', 'cameraShake', hero.id, { duration: 50, frequency: 10, amplitude: 24})
    triggered = true
  }

  if(collider.tags && collider.mod().tags['heroCameraShakeOnHeroCollide_short']) {
    window.socket.emit('heroCameraEffect', 'cameraShake', hero.id, { duration: 500, frequency: 20, amplitude: 36 })
    triggered = true
  }

  if(collider.tags && collider.mod().tags['heroCameraShakeOnHeroCollide_long']) {
    window.socket.emit('heroCameraEffect', 'cameraShake', hero.id, { duration: 2000, frequency: 40, amplitude: 36 })
    triggered = true
  }



  if(collider.tags && triggered && collider.mod().tags['destroyAfterTrigger']) {
    collider._remove = true
  }
}
