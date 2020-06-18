import effects from './effects'

function mapSequenceItems(sequenceItems) {
  return sequenceItems.slice().reduce((map, item, index) => {
    const itemCopy = { ...item }
    if(itemCopy.next === 'sequential') {
      if(sequenceItems[index+1]) {
        itemCopy.next = sequenceItems[index+1].id
      } else {
        itemCopy.next = 'end'
      }
    }
    if(itemCopy.type === 'branchChoice') {
      itemCopy.options = itemCopy.options.map((option) => {
        const optionCopy = {...option}
        if(optionCopy.next === 'sequential') {
          if(sequenceItems[index+1]) {
            optionCopy.next = sequenceItems[index+1].id
          } else {
            optionCopy.next = 'end'
          }
        }
        optionCopy.id = 'option-'+window.uniqueID()
        map[optionCopy.id] = optionCopy
        return optionCopy
      })
    }
    map[itemCopy.id] = itemCopy
    return map
  }, {})
}

function startSequence(sequenceId, context) {
  const sequence = {...GAME.world.sequences[sequenceId]}

  if(!sequence) return console.log('no sequence with id ', sequenceId)

  const { pauseGame, items } = sequence
  if(pauseGame) {
    GAME.gameState.paused = true
  }

  sequence.mainObject = context.mainObject
  sequence.otherObject = context.otherObject
  sequence.remoteObject = context.remoteObject
  sequence.currentItemId = sequence.items[0].id
  sequence.itemMap = mapSequenceItems(items)
  delete sequence.items

  GAME.gameState.sequenceQueue.push(sequence)
}

function processSequence(sequence) {
  const item = sequence.itemMap[sequence.currentItemId]

  let effected = sequence.mainObject
  let effector = sequence.otherObject

  if(item.mainObject) effected = item.mainObject
  if(item.otherObject) effector = item.otherObject

  if(item.type === 'dialogue') {
    item.effectName = 'dialogue'
    effects.processEffect(item, effected, effector)
  }

  if(item.type === 'branchChoice') {
    effected.choiceOptions = item.options.slice()
    effected.flags.showDialogue = true
    effected.flags.paused = true
    if(effector.name) {
      effected.dialogueName = effector.name
    } else {
      effected.dialogueName = null
    }
    const removeEventListener = window.local.on('onHeroChooseOption', (heroId, choiceId) => {
      if(effected.id === heroId && sequence.itemMap[choiceId]) {
        removeEventListener()
        effected.flags.showDialogue = false
        effected.flags.paused = false
        effected.dialogueName = null
        delete effected.choiceOptions
        sequence.currentItemId = sequence.itemMap[choiceId].next
        if(sequence.currentItemId === 'end') {
          endSequence(sequence)
        }
      }
    })
  }

  if(item.next === 'end') {
    endSequence(sequence)
  } else if(item.next) {
    sequence.currentItemId = item.next
  }
}

function endSequence(sequence) {
  const { pauseGame, items } = sequence

  if(pauseGame) {
    GAME.gameState.paused = false
  }

  GAME.gameState.sequenceQueue = GAME.gameState.sequenceQueue.filter((s) => {
    if(s.id === sequence.id) return false
    return true
  })
}

export {
  processSequence,
  startSequence
}
