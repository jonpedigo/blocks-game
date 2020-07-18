// spawnWait
// spawnPool
// spawnPoolInitial
// spawnWaitTimer
// spawnedIds
// spawnLimit

import gridUtil from '../utils/grid'
import collisionsUtil from '../utils/collisions'
import { testCondition } from './conditions'

function spawnObject(object) {
  if(object.tags && object.mod().tags['spawnZone']) {
    if(!object.spawnedIds) object.spawnedIds = []

    object.spawnedIds = object.spawnedIds.filter((id) => {
      if(GAME.objectsById[id] && !GAME.objectsById[id].removed) {
        return true
      } else return false
    })

    if(object.spawnPoolInitial && (object.spawnPool === undefined || object.spawnPool === null)) {
      object.spawnPool = object.spawnPoolInitial
    }

    if((object.spawnedIds.length < object.spawnLimit || object.spawnLimit < 0) && !object.spawnWait && (object.spawnPool === undefined || object.spawnPool === null || object.spawnPool > 0 || object.spawnPool < 0)) {
      forceObjectSpawn(object)
      object.spawnPool--

      object.spawnWait = true
      object.spawnWaitTimerId = GAME.addTimeout('spawnWait-' + window.uniqueID(), object.spawnWaitTimer || 10, () => {
        object.spawnWait = false
      })
    }
  }
}

window.getSubObjectFromChances = function(mainObject, guestObject, ownerObject) {
  let subObjectNames = Object.keys(ownerObject.subObjectChances)

  subObjectNames = subObjectNames.filter((name) => {
    return ownerObject.subObjects[name]
  })

  if(subObjectNames.length === 1) return ownerObject.subObjects[subObjectNames[0]]

  subObjectNames = subObjectNames.filter((name) => {
    if(!ownerObject.subObjectChances[name].conditionList) return true
    if(ownerObject.subObjectChances[name].conditionList.length === 0) return true

    return ownerObject.subObjectChances[name].conditionList.every((condition) => {
      return testChanceCondition(mainObject, guestObject, ownerObject, condition)
    })
  })

  if(subObjectNames.length === 1) return ownerObject.subObjects[subObjectNames[0]]
  if(subObjectNames.length === 0) return null

  const totalWeight = subObjectNames.reduce((acc, name) => { return acc + ownerObject.subObjectChances[name].randomWeight }, 0)
  const weightMap = subObjectNames.reduce((acc, name) => {
    const start = acc.lastNumber
    const weight = ownerObject.subObjectChances[name].randomWeight
    let i = start
    for(i = start; i < weight + start; i++) {
      acc[i] = ownerObject.subObjects[name]
    }
    acc.lastNumber = i
    return acc
  }, { lastNumber: 0 })

  let random = Math.ceil(Math.random() * totalWeight)
  return weightMap[random]
}

function testChanceCondition(mainObject, guestObject, ownerObject, condition) {
  const { allTestedMustPass, testPassReverse, testModdedVersion, conditionJSON, testMainObject, testGuestObject, testOwnerObject, testWorldObject, testIds, testTags } = condition

  let testObjects = []
  if(mainObject && testMainObject) testObjects.push(mainObject)
  if(guestObject && testGuestObject) testObjects.push(guestObject)
  if(ownerObject && testOwnerObject) testObjects.push(ownerObject)
  if(testWorldObject) testObjects.push(GAME.world)

  if(testIds) {
    testObjects = testObjects.concat(testIds.map((id) => {
      if(GAME.objectsById[id]) return GAME.objectsById[id]
      if(GAME.heros[id]) return GAME.heros[id]
    }))
  }

  if(testTags) {
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
  }

  return testCondition(condition, testObjects, { allTestedMustPass, testPassReverse, testModdedVersion })
}

function forceObjectSpawn(object) {
  const spawnSubObject = window.getSubObjectFromChances(null, null, object)

  if(!spawnSubObject) return
  let newObject = {
    x: object.x,
    y: object.y,
    width: object.width,
    height: object.height,
    ...JSON.parse(JSON.stringify(spawnSubObject)),
    id: 'spawned-' + window.uniqueID(),
    spawned: true,
  }

  if(object.tags.spawnRandomlyWithin) {
    for(var i = 0; i <= 10; i++) {
      newObject.x = gridUtil.getRandomGridWithinXY(object.x, object.x + object.width)
      newObject.y = gridUtil.getRandomGridWithinXY(object.y, object.y + object.height)
      if(!collisionsUtil.check(newObject, GAME.objects)) {
        // console.log('found sspot', newObject.x, newObject.y)
        break
      }

      if(i == 10) {
        console.log('no room for spawn ', object.id)
        return
      }
    }

  }
  newObject.tags.potential = false
  newObject.tags.subObject = false
  delete newObject.subObjectName
  delete newObject.ownerId

  // let x = gridUtil.getRandomGridWithinXY(object.x, object.x+width)
  // let y = gridUtil.getRandomGridWithinXY(object.y, object.y+height)

  let createdObject = OBJECTS.create([newObject], { fromLiveGame: true })
  object.spawnedIds.push(createdObject[0].id)
}

export {
  spawnObject,
  forceObjectSpawn
}
