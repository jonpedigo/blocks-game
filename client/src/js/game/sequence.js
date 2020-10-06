import effects from './effects'
import { testCondition, testEventMatch } from './conditions'
import _ from 'lodash'

function endSequence(sequence) {
  const { pauseGame, items } = sequence

  if(pauseGame) {
    GAME.gameState.paused = false
  }

  window.local.emit('onSequenceEnded', sequence.id)

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
    if(itemCopy.sequenceType === 'sequenceChoice') {
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

    if(itemCopy.sequenceType === 'sequenceCondition') {
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
  const sequence = {...GAME.library.sequences[sequenceId]}

  if(sequence.state && sequence.state.disabled) return console.log('sequence disabled', sequenceId)

  if(!sequence || !sequence.items) return console.log('no sequence with id ', sequenceId)

  const { pauseGame, items } = sequence
  if(pauseGame) {
    GAME.gameState.paused = true
  }

  sequence.mainObject = context.mainObject
  sequence.guestObject = context.guestObject
  sequence.ownerObject = context.ownerObject
  sequence.currentItemId = sequence.items[0].id
  sequence.eventListeners = []
  sequence.itemMap = mapSequenceItems(items)

  GAME.gameState.sequenceQueue.push(sequence)
}

function togglePauseSequence(sequence) {
  if(sequence.paused) {
    sequence.paused = false
    if(sequence.currentTimerId) {
      GAME.gameState.timeoutsById[sequence.currentTimerId] = false
    }
  } else {
    sequence.paused = true
    if(sequence.currentTimerId) {
      GAME.gameState.timeoutsById[sequence.currentTimerId] = true
    }
  }
}

function processSequence(sequence) {
  const item = sequence.itemMap[sequence.currentItemId]
  if(!item) {
    if(sequence.currentItemId === 'end' && !sequence.paused) {
      endSequence(sequence)
    }
    return
    // return console.log('sequenceid: ', sequence.id, ' without item: ', sequence.currentItemId)
  }
  if(item.waiting || sequence.paused) {
    return
  }

  let defaultEffected = sequence.mainObject
  let defaultEffector = sequence.guestObject

  console.log('processing', sequence.currentItemId, sequence.id)

  if(item.sequenceType === 'sequenceDialogue') {
    item.effectName = 'dialogue'
    effects.processEffect(item, defaultEffected, defaultEffector, sequence.ownerObject)
  }

  if(item.sequenceType === 'sequenceEffect') {
    const effectedObjects = effects.getEffectedObjects(item, item.mainObject, item.guestObject, sequence.ownerObject)

    let effector = defaultEffector
    if(item.effectorObject) {
      if(item.effectorObject === 'ownerObject') {
        effector = sequence.ownerObject
      } else if(item.effectorObject === 'mainObject') {
        effector = item.mainObject
      } else if(item.effectorObject === 'guestObject') {
        effector = item.guestObject
      } else if(item.effectorObject !== 'default') {
        effector = GAME.objectsById[item.effectorObject]
        if(!effector) {
          effector = GAME.heros[item.effectorObject]
        }
        if(!effector) {
          effector = defaultEffector
        }
      }
    }

    // inside of ObjectId is currently the only id selector that can also select main Object, guest Object, etc
    // this converts the condition value to an id if its not already an id essentially
    // this also exists when a trigger is fired
    if(item.conditionType === 'insideOfObjectId') {
      if(item.conditionValue === 'mainObject') {
        item.conditionValue = item.mainObject.id
      } else if(item.conditionValue === 'guestObject') {
        item.conditionValue = item.guestObject.id
      }
    }

    effectedObjects.forEach((effected) => {
      effects.processEffect(item, effected, effector, sequence.ownerObject)
    })
  }

  if(item.sequenceType === 'sequenceChoice') {
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

  if(item.sequenceType === 'sequenceWait') {
    item.waiting = true
    if(item.conditionType === 'onTimerEnd') {
      sequence.currentTimerId = GAME.addTimeout(window.uniqueID(), item.conditionValue || 10, () => {
        item.waiting = false
        sequence.currentItemId = item.next
        sequence.currentTimerId = null
        if(sequence.currentItemId === 'end') {
          endSequence(sequence)
        }
      })
    } else if(item.conditionType === 'onEvent') {
      if(item.conditionEventName === 'onAnticipateCompleted' && !OBJECTS.anticipatedForAdd) {
        sequence.currentItemId = item.next
      } else {
        const removeEventListener = window.local.on(item.conditionEventName, (mainObject, guestObject) => {
          const eventMatch = testEventMatch(item.conditionEventName, mainObject, guestObject, item, null, { testPassReverse: item.testPassReverse, testModdedVersion: item.testModdedVersion })
          if(eventMatch) {
            item.waiting = false
            sequence.currentItemId = item.next
            if(sequence.currentItemId === 'end') {
              endSequence(sequence)
            }
            removeEventListener()
          }
        })
        sequence.eventListeners.push(removeEventListener)
      }
    } else if(item.conditionType === 'onAdminApproval') {
      if(PAGE.role.isArcadeMode) {
        sequence.currentItemId = item.next
      } else {
        sequence.paused = true
        sequence.currentItemId = item.next
        window.socket.emit('requestAdminApproval', 'unpauseSequence', { sequenceId: sequence.id, text: item.conditionValue || 'Sequence ' + sequence.id + ' needs approval to continue', approveButtonText: 'Resume', rejectButtonText: 'Stop', requestId: 'request-'+window.uniqueID()})
        return
      }
    }
  }

  if(item.sequenceType === 'sequenceCondition') {
    if(item.conditionType === 'onAdminApproval') {
     if(PAGE.role.isArcadeMode) {
       sequence.currentItemId = item.passNext
     } else {
       sequence.paused = true
       const requestId = 'request-'+window.uniqueID()
       window.socket.emit('requestAdminApproval', 'custom', { sequenceId: sequence.id, text: item.conditionValue || 'Sequence ' + sequence.id + ' needs approval to continue', approveButtonText: 'Yes', rejectButtonText: 'No', requestId})
       const removeEventListener = window.local.on('onResolveAdminApproval', (id, passed) => {
         if(id === requestId) {
           if(passed) {
             sequence.currentItemId = item.passNext
           } else {
             sequence.currentItemId = item.failNext
           }
           sequence.paused = false
           removeEventListener()
         }
       })
       sequence.eventListeners.push(removeEventListener)
       return
     }
   } else {
     const { allTestedMustPass, conditionJSON, testMainObject, testGuestObject, testWorldObject, testIds, testTags } = item

     let testObjects = []
     if(testMainObject) testObjects.push(sequence.mainObject)
     if(testGuestObject) testObjects.push(sequence.guestObject)
     if(testWorldObject) testObjects.push(GAME.world)

     testObjects = testObjects.concat(testIds.map((id) => {
       if(GAME.objectsById[id]) return GAME.objectsById[id]
       if(GAME.heros[id]) return GAME.heros[id]
     }))

     testObjects = testObjects.concat(testTags.reduce((arr, tag) => {
       let newArr = arr
       if(GAME.objectsByTag[tag]) {
         newArr = newArr.concat(GAME.objectsByTag[tag])
       }
       return newArr
     }, []))

     const pass = testCondition(item, testObjects, { allTestedMustPass })

     if(pass) {
       sequence.currentItemId = item.passNext
     } else {
       sequence.currentItemId = item.failNext
     }
   }
  }

  if(item.sequenceType === 'sequenceCutscene') {
    const effectedObjects = effects.getEffectedObjects(item, item.mainObject, item.guestObject, sequence.ownerObject)

    const effect = {
      effectName: 'startCutscene',
      effectValue: item.scenes
    }
    effectedObjects.forEach((object) => {
      effects.processEffect(effect, object, defaultEffector, sequence.ownerObject)
    })

    if(item.notificationAllHeros) {
      GAME.heroList.forEach((hero) => {
        effects.processEffect(effect, hero, defaultEffector, sequence.ownerObject)
      })
    }
  }
  if(item.sequenceType === 'sequenceNotification') {
    const effectedObjects = effects.getEffectedObjects(item, item.mainObject, item.guestObject, sequence.ownerObject)

    const herosNotified = []
    effectedObjects.forEach((effected) => {
      if(item.notificationText) {
        if(effected.tags.hero) {
          window.socket.emit('sendNotification', { playerUIHeroId: effected.id, chatId: effected.id, logRecipientId: effected.id, toast: item.notificationToast, log: item.notificationLog, chat: item.notificationChat, modal: item.notificationModal, text: item.notificationText, modalHeader: item.notificationModalHeader, duration: item.notificationDuration })
          herosNotified.push(effected.id)
        } else window.socket.emit('sendNotification', { chatId: effected.id, log: item.notificationLog, chat: item.notificationChat, text: item.notificationText, duration: item.notificationDuration })
      }
    })

    if(item.notificationAllHeros) {
      GAME.heroList.forEach((hero) => {
        if(herosNotified.indexOf(hero.id) > -1) return
        window.socket.emit('sendNotification', { playerUIHeroId: hero.id, logRecipientId: hero.id, chatId: hero.id, toast: item.notificationToast, chat: item.notificationChat, text: item.notificationText, log: item.notificationLog, modal: item.notificationModal, modalHeader: item.notificationModalHeader, duration: item.notificationDuration})
      })
    }
  }

  if(item.sequenceType === 'sequenceGoal') {
    const effectedObjects = effects.getEffectedObjects(item, item.mainObject, item.guestObject, sequence.ownerObject)

    const effect = {
      effectName: 'startGoal',
      ...item
    }
    effectedObjects.forEach((object) => {
      effects.processEffect(effect, object, defaultEffector, sequence.ownerObject)
    })

    if(item.goalAllHeros) {
      GAME.heroList.forEach((hero) => {
        effects.processEffect(effect, hero, defaultEffector, sequence.ownerObject)
      })
    }
  }

  if(!item.waiting && item.next === 'end') {
    endSequence(sequence)
  } else if(!item.waiting && item.next) {
    sequence.currentItemId = item.next
  }
}

export {
  processSequence,
  startSequence,
  togglePauseSequence,
  endSequence,
}
