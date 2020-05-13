function startQuest(hero, questId) {
  const quest = hero.quests[questId]
  const questState = hero.questState[questId]
  questState.started = true
  questState.active = true
  window.socket.emit('startQuest', hero, questId)
}

function completeQuest(hero, questId) {
  const quest = hero.quests[questId]
  const questState = hero.questState[questId]
  questState.started = true
  questState.completed = true
  questState.active = false
  if(quest.nextQuestId) {
    startQuest(hero, quest.nextQuestId)
  }
  window.socket.emit('completeQuest', hero, questId)
}

export {
  startQuest,
  completeQuest,
}
