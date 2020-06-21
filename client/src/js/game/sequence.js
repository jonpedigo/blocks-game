import effects from './effects'
import _ from 'lodash'

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

    if(itemCopy.type === 'branchCondition') {
      if(itemCopy.failNext === 'sequential') {
        if(sequenceItems[index+1]) {
          itemCopy.failNext = sequenceItems[index+1].id
        } else {
          itemCopy.failNext = 'end'
        }
      }
      if(itemCopy.passNext === 'sequential') {
        if(sequenceItems[index+1]) {
          itemCopy.passNext = sequenceItems[index+1].id
        } else {
          itemCopy.passNext = 'end'
        }
      }
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
  sequence.guestObject = context.guestObject
  sequence.remoteObject = context.remoteObject
  sequence.currentItemId = sequence.items[0].id
  sequence.eventListeners = []
  sequence.itemMap = mapSequenceItems(items)
  delete sequence.items

  GAME.gameState.sequenceQueue.push(sequence)
}

function processSequence(sequence) {
  const item = sequence.itemMap[sequence.currentItemId]

  let effected = sequence.mainObject
  let effector = sequence.guestObject
  if(item.mainObject) effected = item.mainObject
  if(item.guestObject) effector = item.guestObject

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
        effected.choiceOptions = null
        sequence.currentItemId = sequence.itemMap[choiceId].next
        if(sequence.currentItemId === 'end') {
          endSequence(sequence)
        }
      }
    })
    sequence.eventListeners.push(removeEventListener)
  }

  if(item.type === 'branchCondition') {
    const { allTestedMustPass, conditionJSON, testMainObject, testGuestObject, testIds, testTags } = item

    let testObjects = []
    if(testMainObject) testObjects.push(sequence.mainObject)
    if(testGuestObject) testObjects.push(sequence.guestObject)

    testObjects = testObjects.concat(testIds.map((id) => {
      if(GAME.objectsById[id]) return GAME.objectsById[id]
      if(GAME.heros[id]) return GAME.heros[id]
    }))

    GAME.objectsByTag = GAME.objects.reduce((map, object) => {
      Object.keys(object.tags).forEach((tag) => {
        if(!map[tag]) map[tag] = []
        if(object.tags[tag] === true) map[tag].push(object)
      })
      return map
    }, {})
    GAME.herosByTag = GAME.heroList.reduce((map, hero) => {
      Object.keys(hero.tags).forEach((tag) => {
        if(!map[tag]) map[tag] = []
        if(hero.tags[tag] === true) map[tag].push(hero)
      })
      return map
    }, {})

    testObjects = testObjects.concat(testTags.reduce((arr, tag) => {
      let newArr = arr
      if(GAME.objectsByTag[tag]) {
        newArr = newArr.concat(GAME.objectsByTag[tag])
      }
      if(GAME.herosByTag[tag]) {
        newArr = newArr.concat(GAME.herosByTag[tag])
      }
      return newArr
    }, []))

    let pass = false
    if(item.conditionType === 'matchJSON') {
      if(allTestedMustPass) {
        pass = testObjects.every((testObject) => {
          return testMatchJSONCondition(conditionJSON, testObject)
        })
      } else {
        pass = testObjects.some((testObject) => {
          return testMatchJSONCondition(conditionJSON, testObject)
        })
      }

      if(pass) {
        sequence.currentItemId = item.passNext
      } else {
        sequence.currentItemId = item.failNext
      }
    }
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

function testMatchJSONCondition(JSON, testObject) {
  return _.isMatch(testObject, JSON)
}

export {
  processSequence,
  startSequence
}
