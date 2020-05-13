import onHeroUpdate from './onHeroUpdate'
import onTalk from './onTalk'
import onBehavior from './onBehavior'
import onCombat from './onCombat'
import { startQuest, completeQuest } from './quests'

export default function onHeroTrigger(hero, collider, result, removeObjects, respawnObjects, options = { fromInteractButton: false }) {
  const isInteraction = options.fromInteractButton
  let triggered = false

  if(!isInteraction) {
    onCombat(hero, collider, result, removeObjects, respawnObjects, options)
    triggered = true
  }

  if(collider.tags['behaviorOnHeroCollide'] && !isInteraction) {
    onBehavior(hero, collider, result, removeObjects, respawnObjects, options)
    triggered = true
  }
  if(collider.tags['behaviorOnHeroInteract'] && isInteraction) {
    onBehavior(hero, collider, result, removeObjects, respawnObjects, options)
    triggered = true
  }

  if(collider.tags['updateHeroOnHeroCollide'] && !isInteraction) {
    onHeroUpdate(hero, collider, result, removeObjects, respawnObjects, options)
    triggered = true
  }

  if(collider.tags['updateHeroOnHeroInteract'] && isInteraction) {
    onHeroUpdate(hero, collider, result, removeObjects, respawnObjects, options)
    triggered = true
  }

  if(collider.tags && collider.tags['talker'] && collider.heroDialogue && collider.heroDialogue.length) {
    if(collider.tags['talkOnHeroCollide'] && !isInteraction) {
      onTalk(hero, collider, result, removeObjects, respawnObjects, options)
      triggered = true
    }

    if(collider.tags['talkOnHeroInteract'] && isInteraction) {
      onTalk(hero, collider, result, removeObjects, respawnObjects, options)
      triggered = true
    }
  }

  if(collider.tags && collider.tags['questGiver'] && collider.questGivingId && hero.quests && hero.questState && hero.questState[collider.questGivingId] && !hero.questState[collider.questGivingId].started && !hero.questState[collider.questGivingId].completed) {
    if(collider.tags['giveQuestOnHeroCollide'] && !isInteraction) {
      startQuest(hero, collider.questGivingId)
      triggered = true
    }
    if(collider.tags['giveQuestOnHeroInteract'] && isInteraction) {
      startQuest(hero, collider.questGivingId)
      triggered = true
    }
  }

  if(collider.tags && collider.tags['questCompleter'] && collider.questCompleterId && hero.quests && hero.questState && hero.questState[collider.questCompleterId] && hero.questState[collider.questCompleterId].started && !hero.questState[collider.questCompleterId].completed) {
    if(collider.tags['completeQuestOnHeroCollide'] && !isInteraction) {
      completeQuest(hero, collider.questCompleterId)
      triggered = true
    }
    if(collider.tags['completeQuestOnHeroInteract'] && isInteraction) {
      completeQuest(hero, collider.questCompleterId)
      triggered = true
    }
  }

  if(collider.tags && triggered && collider.tags['destroyAfterTrigger']) {
    removeObjects.push(collider)
  }
}
