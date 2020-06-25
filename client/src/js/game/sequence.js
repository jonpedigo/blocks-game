import effects from './effects'
import { testCondition } from './conditions'
import _ from 'lodash'

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
    if(itemCopy.type === 'sequenceChoice') {
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

    if(itemCopy.type === 'sequenceCondition') {
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

  if(sequence.state && sequence.state.disabled) return console.log('sequence disabled', sequenceId)

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
  if(!item) return console.log('sequenceid: ', sequence.id, ' without item: ', sequence.currentItemId)
  let defaultEffected = sequence.mainObject
  let defaultEffector = sequence.guestObject

  if(item.type === 'sequenceDialogue') {
    item.effectName = 'dialogue'
    effects.processEffect(item, defaultEffected, defaultEffector)
  }

  if(item.type === 'sequenceEffect') {
    const effectedObjects = effects.getEffectedObjects(item, item.mainObject, item.guestObject)

    let effector = defaultEffector
    if(item.effectorObject) {
      if(item.effectorObject === 'mainObject') {
        effector = item.mainObject
      } else if(item.effectorObject === 'guestObject') {
        effector = item.guestObject
      }
    }
    effectedObjects.forEach((effected) => {
      effects.processEffect(item, effected, effector)
    })
  }

  if(item.type === 'sequenceChoice') {
    defaultEffected.choiceOptions = item.options.slice()
    defaultEffected.flags.showDialogue = true
    defaultEffected.flags.paused = true
    if(defaultEffector.name) {
      defaultEffected.dialogueName = defaultEffector.name
    } else {
      defaultEffected.dialogueName = null
    }
    const removeEventListener = window.local.on('onHeroChooseOption', (heroId, choiceId) => {
      if(defaultEffected.id === heroId && sequence.itemMap[choiceId]) {
        removeEventListener()
        defaultEffected.flags.showDialogue = false
        defaultEffected.flags.paused = false
        defaultEffected.dialogueName = null
        defaultEffected.choiceOptions = null
        sequence.currentItemId = sequence.itemMap[choiceId].next
        if(sequence.currentItemId === 'end') {
          endSequence(sequence)
        }
      }
    })
    sequence.eventListeners.push(removeEventListener)
  }

  if(item.type === 'sequenceCondition') {
    const { allTestedMustPass, conditionJSON, testMainObject, testGuestObject, testWorldObject, testIds, testTags } = item

    let testObjects = []
    if(testMainObject) testObjects.push(sequence.mainObject)
    if(testGuestObject) testObjects.push(sequence.guestObject)
    if(testWorldObject) testObjects.push(GAME.world)

    testObjects = testObjects.concat(testIds.map((id) => {
      if(GAME.objectsById[id]) return GAME.objectsById[id]
      if(GAME.heros[id]) return GAME.heros[id]
    }))

    window.getObjectsByTag()

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

    const pass = testCondition(item, testObjects, { allTestedMustPass })

    console.log('passing?', pass)

    if(pass) {
      sequence.currentItemId = item.passNext
    } else {
      sequence.currentItemId = item.failNext
    }

  }

  console.log('processing', sequence.currentItemId, sequence.id)

  if(item.next === 'end') {
    endSequence(sequence)
  } else if(item.next) {
    sequence.currentItemId = item.next
  }
}

window.getObjectsByTag = function() {
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
}

export {
  processSequence,
  startSequence,
}
