import collisions from '../utils/collisions'

window.conditionTypes = {
  matchJSON: {
    JSON: true,
  },
  insideOfObjectTag: {
    tag: true,
    label: 'Tag:'
  },
  insideOfObjectId: {
    id: true,
    label: 'Id:'
  },
  hasTag: {
    tag: true,
    label: 'Tag:'
  },
  hasCompletedQuest: {
    smallText: true,
    label: 'Quest Name:'
  },
  hasStartedQuest: {
    smallText: true,
    label: 'Quest Name:'
  },
  hasSubObject: {
    smallText: true,
    label: 'Sub Object Name:'
  },
  isSubObjectInInventory: {
    smallText: true,
    label: 'Sub Object Name:'
  },
  isSubObjectEquipped: {
    smallText: true,
    label: 'Sub Object Name:'
  },

  // reverts only work for mods really ATM
  revertOnEvent: {
    // number: true,
    event: true,
  },
  revertOnTimerEnd: {
    number: true,
    label: 'Timer seconds:'
  },
}

function testCondition(condition, testObjects, options = { allTestedMustPass: false, testPassReverse: false }) {

  if(!Array.isArray(testObjects)) testObjects = [testObjects]

  const { allTestedMustPass, testPassReverse } = options

  let pass = false
  if(condition.conditionType === 'matchJSON') {
    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return testMatchJSONCondition(conditionJSON, testObject)
      })
    } else {
      pass = testObjects.some((testObject) => {
        return testMatchJSONCondition(conditionJSON, testObject)
      })
    }
  }

  if(condition.conditionType === 'insideOfObjectTag') {
    const tag = condition.conditionValue

    window.getObjectsByTag()

    let areaObjects = []
    if(GAME.objectsByTag[tag]) {
      areaObjects = areaObjects.concat(GAME.objectsByTag[tag])
    }
    if(GAME.herosByTag[tag]) {
      areaObjects = areaObjects.concat(GAME.herosByTag[tag])
    }

    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return areaObjects.some((areaObject) => {
          return testIsWithinObject(areaObject, testObject)
        })
      })
    } else {
      pass = testObjects.some((testObject) => {
        return areaObjects.some((areaObject) => {
          return testIsWithinObject(areaObject, testObject)
        })
      })
    }
  }

  if(condition.conditionType === 'insideOfObjectId') {
    const id = condition.conditionValue

    let areaObjects = []
    if(GAME.objectsById[id]) {
      areaObjects = areaObjects.concat(GAME.objectsById[id])
    }
    if(GAME.heros[id]) {
      areaObjects = areaObjects.concat(GAME.heros[id])
    }

    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return areaObjects.some((areaObject) => {
          return testIsWithinObject(areaObject, testObject)
        })
      })
    } else {
      pass = testObjects.some((testObject) => {
        return areaObjects.some((areaObject) => {
          return testIsWithinObject(areaObject, testObject)
        })
      })
    }
  }


  if(condition.conditionType === 'hasTag') {
    const tag = condition.conditionValue

    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return testObject.tags[tag]
      })
    } else {
      pass = testObjects.some((testObject) => {
        return testObject.tags[tag]
      })
    }
  }

  if(condition.conditionType === 'hasCompletedQuest') {
    const quest = condition.conditionValue

    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return testObject.questState[quest] && testObject.questState[quest].completed
      })
    } else {
      pass = testObjects.some((testObject) => {
        return testObject.questState[quest] && testObject.questState[quest].completed
      })
    }
  }

  if(condition.conditionType === 'hasStartedQuest') {
    const quest = condition.conditionValue

    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return testObject.questState[quest] && testObject.questState[quest].started
      })
    } else {
      pass = testObjects.some((testObject) => {
        return testObject.questState[quest] && testObject.questState[quest].started
      })
    }
  }

  if(condition.conditionType === 'hasSubObject') {
    const name = condition.conditionValue

    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return testObject.subObjects[name]
      })
    } else {
      pass = testObjects.some((testObject) => {
        return testObject.subObjects[name]
      })
    }
  }

  if(condition.conditionType === 'isSubObjectEquipped') {
    const name = condition.conditionValue

    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return testObject.subObjects[name] && testObject.subObjects[name].isEquipped
      })
    } else {
      pass = testObjects.some((testObject) => {
        return testObject.subObjects[name] && testObject.subObjects[name].isEquipped
      })
    }
  }

  if(condition.conditionType === 'isSubObjectInInventory') {
    const name = condition.conditionValue

    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return testObject.subObjects[name] && testObject.subObjects[name].isInInventory
      })
    } else {
      pass = testObjects.some((testObject) => {
        return testObject.subObjects[name] && testObject.subObjects[name].isInInventory
      })
    }
  }

  if(testPassReverse) return !pass

  return pass
}


function testMatchJSONCondition(JSON, testObject) {
  return _.isMatch(testObject, JSON)
}

function testIsWithinObject(object, testObject) {
  return collisions.checkObject(object, testObject)
}

export {
  testCondition
}
