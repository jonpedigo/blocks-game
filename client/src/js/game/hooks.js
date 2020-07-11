import { testCondition, testEventMatch } from './conditions'

window.hookEvents = {
  onHeroInteract: {},
  // onRespawn: {},
  // onDestroy: {},
  // onEffect: {},
}

function testHook(ownerObject, hook) {

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
  ownerObject.hooks.forEach((hook) => {
    if(hook.eventName === eventName) {
      hooks.push(hook)
    }
  })

  return hooks
}

export {
  testHook,
  addHook,
  deleteHook
}
