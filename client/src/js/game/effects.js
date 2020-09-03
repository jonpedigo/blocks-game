import onTalk from './heros/onTalk'
import { startSequence } from './sequence'

  // { effectName: remove, anything: true, hero: false, object: false, world: false, spawnZone: false, timer: false
  //allowed: [anything, plain, hero, object, world, spawnZone, timer]
  // requirements: {
  // effector: false,
  // position: false,
  // JSON: false,
  // effectValue: false,
  // tag: false,
  // eventName: false,
  // id: false,
  // number: false,
  // smallText: false,
  // largeText: false
  // heroOnly: false
  //}
 //}
  window.triggerEffects = {
    remove: {
    },
    respawn: {
    },
    destroy: {
      effectorObject: true,
    },
    mutate: {
      JSON: true,
    },
    mod: {
      JSON: true,
      JSONlabel: 'Mod JSON: ',
      condition: true,
      // smallText: true,
      // label: 'Mod name: ',
      footer: 'Mod Condition:'
    },
    dialogue: {
      heroOnly: true,
      largeText: true,
      effectorObject: true,
    },
    startSequence: {
      sequenceId: true,
      effectorObject: true,
    },
    tagAdd: {
      tag: true,
    },
    tagRemove: {
      tag: true,
    },
    tagToggle: {
      tag: true,
    },
    openWorld: {
      smallText: true,
      noEffected: true,
    },
    anticipatedAdd: {
      libraryObject: true,
    },
    anticipatedAddWall: {
      libraryObject: true,
    }
    // need global library of these
    // 'animation',
    // notification -> chat, private chat, log, toast, modal
    // camera effect

    // move Camera to, cameraAnimateZoomTo, ( lets use the camera delay tool ...)
    // this ^ can also include showing UI popover on game object.. I mean welcome to CLEAR onboarding

    // 'anticipatedAdd',
    // 'goToStarView',
    // 'sequenceDisable'
    // 'sequenceEnable'
    // 'stopSequence',
    // 'morph',
    // 'duplicate',
    // 'heroQuestStart',
    // 'heroQuestComplete',
    // 'spawnPoolIncrement',
    // 'spawnTotalIncrement',
    // 'spawnTotalRemove',
    // 'spawnPause',
    // 'spawnResume',
    // 'spawnPauseToggle',
    // 'movementPauseToggle',
    // 'movementResume',
    // 'movementPause',
    // 'timerStart',
    // 'timerPause',
    // 'timerResume',
    // 'timerPauseToggle',
    // 'triggerDisable',
    // 'triggerEnable',
    // 'triggerToggleEnable',
    // 'increaseInputDirectionVelocity',
    // 'increaseMovementDirectionVelocity',
    // 'pathfindTo',
    // 'moveTo',
    // 'attachToEffectorAsParent'
    // 'attachToEffectorAsRelative'
    // 'emitCustomEvent',
    // skipHeroGravity
    // skipHeroPosUpdate
    // setPathTarget
    // setTarget

    // play sound FX
    // stop music
    // start music
  }

  // stop player (velocity)


  // apply mod from library
  // add library object to open space
  // send to star view
  // anticipatedAdd
  //

  window.effectNameList = Object.keys(window.triggerEffects)

function processEffect(effect, effected, effector) {
  const { effectName, effectValue, effectJSON } = effect
  if(effectName === 'mutate' && effectJSON) {
    OBJECTS.mergeWithJSON(effected, effectJSON)
  }

  // if(effectName === 'talkToHero' && hero) {
  //   onTalk(hero, owner)
  // }
  //
  // if(effectName === 'heroQuestStart' && hero) {
  //   startQuest(hero, effectValue)
  // }
  //
  // if(effectName === 'heroQuestComplete' && hero) {
  //   completeQuest(hero, effectValue)
  // }

  if(effectName === 'dialogue') {
    if(effected.tags.hero) {
      effected.dialogue = [effectValue]
      effected.flags.showDialogue = true
      effected.flags.paused = true
      if(effector.name) {
        effected.dialogueName = effector.mod().name
      } else {
        effected.dialogueName = null
      }
      window.emitGameEvent('onUpdatePlayerUI', effected)
    } else {
      console.log('cannot dialogue effect non hero')
    }
  }

  if(effectName === 'destroy') {
    effected._destroyedBy = effector
    effected._destroy = true
  }

  if(effectName === 'respawn') {
    OBJECTS.respawnObject(effected)
  }
  if(effectName === 'remove') {
    OBJECTS.removeObject(effected)
  }

  if(effectName === 'spawnTotalIncrement') {
    effected.spawnTotal += effectValue || 1
  }

  //
  // if(effectName === 'spawnTotalRemove') {
  //   effected.spawnTotal = -1
  // }

  if(effectName === 'spawnPoolIncrement') {
    effected.spawnPool += effectValue || 1
    // effected.spawnWait=false
    // if(effected.spawnWaitTimerId) delete GAME.gameState.timeoutsById[effected.spawnWaitTimerId]
  }

  if(effectName === 'tagAdd') {
    if(effect.effectTags) {
      effect.effectTags.forEach((tag) => {
        effected.tags[tag] = true
      })
    } else {
      let tag = effectValue
      effected.tags[tag] = true
    }
  }

  if(effectName === 'tagRemove') {
    if(effect.effectTags) {
      effect.effectTags.forEach((tag) => {
        effected.tags[tag] = false
      })
    } else {
      let tag = effectValue
      effected.tags[tag] = false
    }
  }

  if(effectName === 'tagToggle') {
    if(effect.effectTags) {
      effect.effectTags.forEach((tag) => {
        effected.tags[tag] = !effected.tags[tag]
      })
    } else {
      let tag = effectValue
      effected.tags[tag] = !effected.tags[tag]
    }
  }

  if(effectName === 'startSequence') {
    const context = {
      mainObject: effected,
      guestObject: effector,
    }
    startSequence(effect.effectSequenceId, context)
  }

  if(effectName === 'mod') {
    GAME.startMod(effected.id, effect)
  }

  if(effectName === 'openWorld') {
    EDITOR.transformWorldTo(effectValue)
  }

  if(effectName === 'anticipatedAdd' && effect.effectLibraryObject) {
    const object = window.objectLibrary[effect.effectLibraryObject]
    window.socket.emit('anticipateObject', object);
  }
  if(effectName === 'anticipatedAddWall' && effect.effectLibraryObject) {
    const object = window.objectLibrary[effect.effectLibraryObject]
    window.socket.emit('anticipateObject', { ...object, wall: true });
  }
}

function getEffectedObjects(effect, mainObject, guestObject, ownerObject) {
  const { effectedMainObject, effectedGuestObject, effectedWorldObject, effectedOwnerObject, effectedIds, effectedTags } = effect

  let effectedObjects = []
  if(effectedMainObject) effectedObjects.push(mainObject)
  if(effectedGuestObject) effectedObjects.push(guestObject)
  if(effectedOwnerObject) effectedObjects.push(ownerObject)
  if(effectedWorldObject) effectedObjects.push(GAME.world)

  if(effectedIds) effectedObjects = effectedObjects.concat(effectedIds.map((id) => {
    if(GAME.objectsById[id]) return GAME.objectsById[id]
    if(GAME.heros[id]) return GAME.heros[id]
  }))

  if(effectedTags) effectedObjects = effectedObjects.concat(effectedTags.reduce((arr, tag) => {
    let newArr = arr
    if(GAME.objectsByTag[tag]) {
      newArr = newArr.concat(GAME.objectsByTag[tag])
    }
    return newArr
  }, []))

  return effectedObjects
}

export default {
  processEffect,
  getEffectedObjects
}
