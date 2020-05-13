export default function onGiveQuest(hero, collider, result, removeObjects, respawnObjects, options) {
  const id = collider.questGivingId
  const quest = hero.quests[id]
  const questState = hero.questState[id]
  questState.started = true
  questState.active = true
  window.socket.emit('startQuest', hero, id)
}
