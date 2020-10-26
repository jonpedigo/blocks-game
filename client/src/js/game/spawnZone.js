// spawnWait
// spawnPool
// spawnPoolInitial
// spawnWaitTimer
// spawnedIds
// spawnLimit

// as of now the game will not keep anything marked as .spawned
// spawned Ids are used to keep track of how many spawned are allowed

import gridUtil from '../utils/grid'
import collisionsUtil from '../utils/collisions'
import { testCondition } from './conditions'

function spawnObject(object) {
  if(object.tags && object.mod().tags['spawnZone'] && object.mod().tags['spawnOnInterval']) {
    if(!object.spawnedIds) object.spawnedIds = []

    object.spawnedIds = object.spawnedIds.filter((id) => {
      if(GAME.objectsById[id] && !GAME.objectsById[id].mod().removed) {
        return true
      } else {
        return false
      }
    })

    if(object.spawnPoolInitial && (object.spawnPool === undefined || object.spawnPool === null)) {
      object.spawnPool = object.spawnPoolInitial
    }

    if((object.spawnedIds.length < object.spawnLimit || object.spawnLimit < 0) && !object.spawnWait && (object.spawnPool === undefined || object.spawnPool === null || object.spawnPool > 0 || object.spawnPool < 0)) {
      extraSpawnFunctionality(object)

      const spawnSubObject = window.getSubObjectFromChances(null, null, object)
      if(!spawnSubObject) return
      const newObject = getSpawnObjectData(object, spawnSubObject)
      if(newObject) {
        spawnObjectOnMap(object, newObject)
        object.spawnPool--
        object.spawnWait = true
        object.spawnWaitTimerId = GAME.addTimeout('spawnWait-' + window.uniqueID(), object.spawnWaitTimer || 10, () => {
          object.spawnWait = false
        })
      } else {
        console.log('no room in spawn zone... stopping spawn')
        object.spawnWait = true
      }
    }
  }

  if(object.spawnPool === 0 && object.mod().tags.destroyOnSpawnPoolDepleted) {
    object._destroy = true
  }
}

function spawnObjectOnMap(object, newObject) {
  let createdObject = OBJECTS.create([newObject], { fromLiveGame: true })

  if(!object.spawnedIds) object.spawnedIds = []
  object.spawnedIds.push(createdObject[0].id)

  return createdObject[0]
}

window.getSubObjectFromChances = function(mainObject, guestObject, ownerObject) {
  let subObjectNames = Object.keys(ownerObject.subObjectChances)

  if(!ownerObject.subObjects) return

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

  let random = Math.floor(Math.random() * totalWeight)
  return _.cloneDeep(weightMap[random])
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
      return newArr
    }, []))
  }

  return testCondition(condition, testObjects, { allTestedMustPass, testPassReverse, testModdedVersion })
}

function getSpawnObjectData(object, subObject, spawnPending = [], isRespawn = false) {
  let newObject = {
    x: object.x,
    y: object.y,
    ...JSON.parse(JSON.stringify(subObject.mod())),
    id: 'spawned-' + window.uniqueID(),
    spawned: !isRespawn,
  }

  if(object.tags.spawnRandomlyWithin) {
    const check = [...spawnPending, ...GAME.objects.filter(({id}) => id !== object.id) ]

    for(var i = 0; i <= 1000; i++) {
      newObject.x = gridUtil.getRandomGridWithinXY(object.x, object.x + object.width)
      newObject.y = gridUtil.getRandomGridWithinXY(object.y, object.y + object.height)

      if(object.mod().tags.spawnOverObstacles) {
        break
      } else if(object.mod().tags.spawnOverNonObstacles) {
        if(!collisionsUtil.check(newObject, check)) {
          // console.log('found spot', newObject.x, newObject.y)
          break
        }
      } else {
        if(!collisionsUtil.checkAnything(newObject, check)) {
          // console.log('found spot', newObject.x, newObject.y)
          break
        }
      }

      if(i == 10) {
        console.log('no room for spawn ', object.id)
        return null
      }
    }

  }
  newObject.tags.potential = false
  newObject.tags.subObject = false
  delete newObject.ownerId

  // let x = gridUtil.getRandomGridWithinXY(object.x, object.x+width)
  // let y = gridUtil.getRandomGridWithinXY(object.y, object.y+height)

  return newObject
}

function spawnAllNow(spawningObject, spawnInto) {
  extraSpawnFunctionality(spawningObject)

  if(spawningObject.spawnPoolInitial && (spawningObject.spawnPool === undefined || spawningObject.spawnPool === null)) {
    spawningObject.spawnPool = spawningObject.spawnPoolInitial
  }

  let pool = spawningObject.spawnPoolInitial
  if(GAME.gameState.started){
    pool = spawningObject.spawnPool
  }

  const spawnSubObjects = []
  for(let i = 0; i < pool; i++) {
    let sso

    if(spawnInto) {
      // spawnAllInHeroInventoryOnHeroInteract means spawnInto is the hero
      sso = window.getSubObjectFromChances(spawnInto, spawningObject, spawningObject)
    } else {
      sso = window.getSubObjectFromChances(null, null, spawningObject)
    }

    if(!sso) {
      i--
      continue
    }
    spawnSubObjects.push(sso)
  }

  if(spawnInto) {
    spawnSubObjects.forEach((sso) => {
      sso = _.cloneDeep(sso.mod())
      sso.inInventory = true
      sso.id = 'spawned-' + window.uniqueID()
      sso.tags.potential = true
      sso.tags.subObject = true
      window.local.emit('onAddSubObject', spawnInto, sso, sso.subObjectName)
    })
  } else {
    const readyToSpawn = []
    spawnSubObjects.forEach((sso) => {
      const willSpawn = getSpawnObjectData(spawningObject, sso, readyToSpawn)
      if(willSpawn) readyToSpawn.push(willSpawn)
    })

    readyToSpawn.forEach((spawnMe) => {
      spawnObjectOnMap(spawningObject, spawnMe)
    })
  }

  if(GAME.gameState.started){
    spawningObject.spawnPool = 0
  }

  if(spawningObject.spawnPool === 0 && spawningObject.mod().tags.destroyOnSpawnPoolDepleted) {
    // need a destroy object event
    window.socket.emit('deleteObject', spawningObject)
  }
}

function destroySpawnIds(object) {
  if(object.spawnedIds && object.spawnedIds.length) {
    object.spawnedIds.forEach((id) => {
      if(GAME.objectsById[id]) {
        window.socket.emit('deleteObject', GAME.objectsById[id])
      }
    })
  }
}

function extraSpawnFunctionality(object) {
  if(object.mod().tags.spawnClearAllObjects) {
    collisionsUtil.checkAnything(object, GAME.objects, (collided) => {
      window.socket.emit('deleteObject', collided)
    })
  }

  if(object.mod().tags.spawnClearSpawnedObjects) {
    destroySpawnIds()
  }
}

export {
  spawnObject,
  spawnAllNow,
  destroySpawnIds,
}
