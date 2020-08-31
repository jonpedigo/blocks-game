import { testCondition } from './conditions'

window.hookEvents = {
  onObjectInteractable: {},
  // onRespawn: {},
  // onDestroy: {},
  // onEffect: {},
}

function testHookCondition(mainObject, guestObject, ownerObject, hook) {
  const { allTestedMustPass, testPassReverse, testModdedVersion, conditionJSON, testMainObject, testGuestObject, testOwnerObject, testWorldObject, testIds, testTags } = hook

  let testObjects = []
  if(testMainObject) testObjects.push(mainObject)
  if(testGuestObject) testObjects.push(guestObject)
  if(testOwnerObject) testObjects.push(ownerObject)
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

  return testCondition(hook, testObjects, { allTestedMustPass, testPassReverse, testModdedVersion })
}

function addHook(ownerObject, hook) {
  const eventName = hook.eventName

  if(!ownerObject.hooks) ownerObject.hooks = {}
  ownerObject.hooks[hook.id] = hook

  Object.assign(ownerObject.hooks[hook.id], {
    hookPool: hook.initialHookPool || 1,
    eventCount: 0,
    disabled: false,
  })
}

function deleteHook(ownerObject, hookId) {
  delete ownerObject.hooks[hookId]
}

window.getHooksByEventName = function(ownerObject, eventName) {
  const hooks = []

  if(!ownerObject.hooks) return []

  Object.keys(ownerObject.hooks).forEach((hookName) => {
    const hook = ownerObject.hooks[hookName]
    if(hook.eventName === eventName) {
      hooks.push(hook)
    }
  })

  return hooks
}

export {
  testHookCondition,
  addHook,
  deleteHook
}
