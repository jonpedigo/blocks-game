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
    },
    randomAdd: {
      libraryObject: true,
      number: true,
    },
    randomAddBlock: {
      libraryObject: true,
      number: true,
    },
    randomAddWall: {
      libraryObject: true,
      number: true,
    },
    starViewGo: {},
    starViewReturn: {},
    // 'animation',
    // notification -> chat, private chat, log, toast, modal
    // camera effect

    // move Camera to, cameraAnimateZoomTo, ( lets use the camera delay tool ...)
    // this ^ can also include showing UI popover on game object.. I mean welcome to CLEAR onboarding

    // 'sequenceDisable'
    // 'sequenceEnable'
    // 'stopSequence',
    // 'morph',
    // 'duplicate',
    // 'questStart',
    // 'questComplete',

    // 'increaseInputDirectionVelocity',
    // 'increaseMovementDirectionVelocity',

    // 'pathfindTo',
    // 'moveTo',
    // 'attachToEffectorAsParent'
    // 'attachToEffectorAsRelative'
    // 'emitCustomEvent',

    // setPathTarget
    // setTarget

    // play sound FX
    // stop music
    // start music

    // rest player physics



    // THESE ARE MAYBE JUST MUTATE? EXCEPT FOR TOGGLE, MAYBE ADD THAT TO SPECIAL SYNTAX
    // skipHeroGravity
    // skipHeroPosUpdate
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
  }

  // apply mod from library
  // add library object to open space

  window.effectNameList = Object.keys(window.triggerEffects)

// owner object is just for sequences
function processEffect(effect, effected, effector, ownerObject) {
  const { effectName, effectValue, effectJSON } = effect
  if(effectName === 'mutate' && effectJSON) {
    OBJECTS.mergeWithJSON(effected, effectJSON)
  }

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

  // if(effectName === 'spawnTotalIncrement') {
  //   effected.spawnTotal += effectValue || 1
  // }

  //
  // if(effectName === 'spawnTotalRemove') {
  //   effected.spawnTotal = -1
  // }

  // if(effectName === 'spawnPoolIncrement') {
  //   effected.spawnPool += effectValue || 1
  //   // effected.spawnWait=false
  //   // if(effected.spawnWaitTimerId) delete GAME.gameState.timeoutsById[effected.spawnWaitTimerId]
  // }

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
      ownerObject,
    }
    console.log('ctx owner', context.ownerObject)
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
  if(effectName === 'randomAdd' && effect.effectLibraryObject) {
    const object = window.objectLibrary[effect.effectLibraryObject]
    window.socket.emit('anticipateObject', {...object, random: true, numberToAdd: effectValue });
  }
  if(effectName === 'randomAddWall' && effect.effectLibraryObject) {
    const object = window.objectLibrary[effect.effectLibraryObject]
    window.socket.emit('anticipateObject', { ...object, wall: true, random: true, numberToAdd: effectValue });
  }
  if(effectName === 'randomAddBlock' && effect.effectLibraryObject) {
    const object = window.objectLibrary[effect.effectLibraryObject]
    window.socket.emit('anticipateObject', { ...object, block: true, random: true, numberToAdd: effectValue });
  }


  if(effectName === 'starViewGo') {
    const hero = GAME.heros[effected.id]
    window.socket.emit('editHero', { id: effected.id, animationZoomTarget: window.constellationDistance, animationZoomMultiplier: hero.zoomMultiplier, endAnimation: false })
  }

  if(effectName === 'starViewReturn') {
    const hero = GAME.heros[effected.id]
    window.socket.emit('editHero', { id: effected.id, animationZoomTarget: hero.zoomMultiplier, endAnimation: true, })
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
