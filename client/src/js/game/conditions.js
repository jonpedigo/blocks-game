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

function testCondition(condition, testObjects, options = { allTestedMustPass: false, testPassReverse: false, testModdedVersion: false }) {

  if(!Array.isArray(testObjects)) testObjects = [testObjects]

  const { allTestedMustPass, testPassReverse } = options

  let pass = false
  if(condition.conditionType === 'matchJSON') {
    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return testMatchJSONCondition(conditionJSON, testObject, options)
      })
    } else {
      pass = testObjects.some((testObject) => {
        return testMatchJSONCondition(conditionJSON, testObject, options)
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
          return testIsWithinObject(areaObject, testObject, options)
        })
      })
    } else {
      pass = testObjects.some((testObject) => {
        return areaObjects.some((areaObject) => {
          return testIsWithinObject(areaObject, testObject, options)
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
          return testIsWithinObject(areaObject, testObject, options)
        })
      })
    } else {
      pass = testObjects.some((testObject) => {
        return areaObjects.some((areaObject) => {
          return testIsWithinObject(areaObject, testObject, options)
        })
      })
    }
  }


  if(condition.conditionType === 'hasTag') {
    const tag = condition.conditionValue

    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return testHasTag(tag, testObject, options)
      })
    } else {
      pass = testObjects.some((testObject) => {
        return testHasTag(tag, testObject, options)
      })
    }
  }

  if(condition.conditionType === 'hasCompletedQuest') {
    const quest = condition.conditionValue

    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return testHasCompletedQuest(quest, testObject, options)
      })
    } else {
      pass = testObjects.some((testObject) => {
        return testHasCompletedQuest(quest, testObject, options)
      })
    }
  }

  if(condition.conditionType === 'hasStartedQuest') {
    const quest = condition.conditionValue

    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return testHasStartedQuest(quest, testObject, options)
      })
    } else {
      pass = testObjects.some((testObject) => {
        return testHasStartedQuest(quest, testObject, options)
      })
    }
  }

  if(condition.conditionType === 'hasSubObject') {
    const name = condition.conditionValue

    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return testHasSubObject(name, testObject, options)
      })
    } else {
      pass = testObjects.some((testObject) => {
        return testHasSubObject(name, testObject, options)
      })
    }
  }

  if(condition.conditionType === 'isSubObjectEquipped') {
    const name = condition.conditionValue

    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return testIsSubObjectEquipped(name, testObject, options)
      })
    } else {
      pass = testObjects.some((testObject) => {
        return testIsSubObjectEquipped(name, testObject, options)
      })
    }
  }

  if(condition.conditionType === 'isSubObjectInInventory') {
    const name = condition.conditionValue

    if(allTestedMustPass) {
      pass = testObjects.every((testObject) => {
        return testIsSubObjectInInvestory(name, testObject, options)
      })
    } else {
      pass = testObjects.some((testObject) => {
        return testIsSubObjectInInvestory(name, testObject, options)
      })
    }
  }

  if(testPassReverse) return !pass

  return pass
}


function testMatchJSONCondition(JSON, testObject, options) {
  if(options.testModdedVersion) testObject = testObject.mod()
  return _.isMatch(testObject, JSON)
}

function testIsWithinObject(object, testObject, options) {
  if(options.testModdedVersion) testObject = testObject.mod()
  return collisions.checkObject(object, testObject, options)
}

function testHasCompletedQuest(questName, testObject, options) {
  if(options.testModdedVersion) testObject = testObject.mod()
  return testObject.questState[questName] && testObject.questState[questName].completed
}

function testHasStartedQuest(questName, testObject, options) {
  if(options.testModdedVersion) testObject = testObject.mod()
  return testObject.questState[questName] && testObject.questState[questName].started
}

function testHasSubObject(name, testObject, options) {
  if(options.testModdedVersion) testObject = testObject.mod()
  return testObject.subObjects[name]
}

function testIsSubObjectEquipped(name, testObject, options) {
  if(options.testModdedVersion) testObject = testObject.mod()
  return testObject.subObjects[name] && testObject.subObjects[name].isEquipped
}

function testIsSubObjectInInvestory(name, testObject, options) {
  if(options.testModdedVersion) testObject = testObject.mod()
  return testObject.subObjects[name] && testObject.subObjects[name].isInInventory
}

function testHasTag(tag, testObject, options) {
  if(options.testModdedVersion) testObject = testObject.mod()
  return testObject.tags[tag]
}

export {
  testCondition
}
