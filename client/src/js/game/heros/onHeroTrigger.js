import onHeroUpdate from './onHeroUpdate'
import onTalk from './onTalk'
import onGiveQuest from './onGiveQuest'
import onCompleteQuest from './onCompleteQuest'
import onBehavior from './onBehavior'

export default function onHeroTrigger(hero, collider, result, removeObjects, respawnObjects, options = { fromInteractButton: false }) {
  const isInteraction = options.fromInteractButton
  let triggered = false

  if(collider.tags['updateHeroOnHeroCollide'] && !isInteraction) {
    onHeroUpdate(hero, collider, result, removeObjects, respawnObjects, options)
    triggered = true
  } else {
    if(collider.ownerId !== hero.id){
     // if it collides with anything that it doesn't own..
     hero.lastHeroUpdateId = null
    }
  }
  if(collider.tags['updateHeroOnHeroInteract'] && isInteraction) {
    onHeroUpdate(hero, collider, result, removeObjects, respawnObjects, options)
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

  if(collider.tags['talkOnHeroCollide'] && !isInteraction) {
    onTalk(hero, collider, result, removeObjects, respawnObjects, options)
    triggered = true
  }
  
  if(collider.tags['talkOnHeroInteract'] && isInteraction) {
    onTalk(hero, collider, result, removeObjects, respawnObjects, options)
    triggered = true
  }

  if(collider.tags['giveQuestOnHeroCollide'] && !isInteraction) {
    onGiveQuest(hero, collider, result, removeObjects, respawnObjects, options)
    triggered = true
  }
  if(collider.tags['giveQuestOnHeroInteract'] && isInteraction) {
    onGiveQuest(hero, collider, result, removeObjects, respawnObjects, options)
    triggered = true
  }

  if(collider.tags['completeQuestOnHeroCollide'] && !isInteraction) {
    onCompleteQuest(hero, collider, result, removeObjects, respawnObjects, options)
    triggered = true
  }
  if(collider.tags['completeQuestOnHeroInteract'] && isInteraction) {
    onCompleteQuest(hero, collider, result, removeObjects, respawnObjects, options)
    triggered = true
  }

  if(collider.tags && triggered && collider.tags['destroyAfterTrigger']) {
    removeObjects.push(collider)
  }
}
