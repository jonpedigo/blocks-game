import onTalk from './heros/onTalk'
import { startSequence } from './sequence'
import { setPathTarget, setTarget } from './ai/pathfinders.js'
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
    branchApply: {
      libraryBranch: true,
    },
    branchModApply: {
      libraryBranch: true,
    },
    branchModRevert: {
      libraryBranch: true,
    },
    libraryMod: {
      libraryMod: true,
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

    goTo: {
      mapSelect: true,
    },
    pathfindTo: {
      mapSelect: true,
    },
    // pursue: {
    //   mapSelect: true,
    // },
    setPath: {
      mapSelect: true,
    },

    //EDITOR
    openWorld: {
      smallText: true,
      noEffected: true,
    },
    clearToWorld: {
      smallText: true,
      noEffected: true,
    },
    starViewGo: {},
    starViewReturn: {},
    endPrologue: {},
    stopGameLite: {},

    //create
    anticipatedAdd: {
      libraryObject: true,
      number: true,
    },
    anticipatedAddWall: {
      libraryObject: true,
      number: true,
    },
    anticipatedAddPlatform: {
      libraryObject: true,
      number: true,
    },
    viewAdd: {
      libraryObject: true,
      number: true,
    },
    viewAddBlock: {
      libraryObject: true,
      number: true,
    },
    viewAddWall: {
      libraryObject: true,
      number: true,
    },
    viewAddPlatform: {
      libraryObject: true,
      number: true,
    },
    addOnTop: {
      tag: true,
      number: true,
      libraryObject: true,
      label: 'How many nodes on top'
    },

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
    //
    // Teleport
    //
    // Deposit object
    //
    // Withdraw object


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
    OBJECTS.respawn(effected)
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
    startSequence(effect.effectSequenceId, context)
  }

  if(effectName === 'branchApply') {
    GAME.onBranchApply(effect.effectBranchName)
  }

  if(effectName === 'branchModApply') {
    GAME.onBranchModApply(effect.effectBranchName)
  }

  if(effectName === 'branchModRevert') {
    GAME.onBranchModRevert(effect.effectBranchName)
  }

  if(effectName === 'mod') {
    window.emitGameEvent('onStartMod', {ownerId: effected.id, ...effect})
  }

  if(effectName === 'libraryMod') {
    const libraryMod = window.modLibrary[effect.effectLibraryMod]
    const mod = {
      ownerId: effected.id,
      manualRevertId: effect.effectLibraryMod,
      ...libraryMod
    }
    window.emitGameEvent('onStartMod', mod)
  }

  if(effectName === 'openWorld') {
    EDITOR.transformWorldTo(effectValue)
  }
  if(effectName === 'clearToWorld') {
    EDITOR.shiftPressed = true
    EDITOR.transformWorldTo(effectValue)
    EDITOR.shiftPressed = false
  }

  if(effectName === 'anticipatedAdd' && effect.effectLibraryObject) {
    const object = window.objectLibrary[effect.effectLibraryObject]
    window.local.emit('onAnticipateObject', object);
  }
  if(effectName === 'anticipatedAddWall' && effect.effectLibraryObject) {
    const object = window.objectLibrary[effect.effectLibraryObject]
    window.local.emit('onAnticipateObject', { ...object, wall: true, numberToAdd: effectValue  });
  }
  if(effectName === 'anticipatedAddPlatform' && effect.effectLibraryObject) {
    const object = window.objectLibrary[effect.effectLibraryObject]
    window.local.emit('onAnticipateObject', { ...object, platform: true, numberToAdd: effectValue  });
  }
  if(effectName === 'viewAdd' && effect.effectLibraryObject) {
    const object = window.objectLibrary[effect.effectLibraryObject]
    window.local.emit('onAnticipateObject', {...object, random: true, numberToAdd: effectValue });
  }
  if(effectName === 'viewAddWall' && effect.effectLibraryObject) {
    const object = window.objectLibrary[effect.effectLibraryObject]
    window.local.emit('onAnticipateObject', { ...object, wall: true, random: true, numberToAdd: effectValue });
  }
  if(effectName === 'viewAddBlock' && effect.effectLibraryObject) {
    const object = window.objectLibrary[effect.effectLibraryObject]
    window.local.emit('onAnticipateObject', { ...object, block: true, random: true, numberToAdd: effectValue });
  }
  if(effectName === 'viewAddPlatform' && effect.effectLibraryObject) {
    const object = window.objectLibrary[effect.effectLibraryObject]
    window.local.emit('onAnticipateObject', { ...object, platform: true, random: true, numberToAdd: effectValue });
  }
  if(effectName === 'addOnTop' && effect.effectLibraryObject) {
    const object = window.objectLibrary[effect.effectLibraryObject]
    window.local.emit('onAnticipateObject', { ...object, onTop: true, nodesAbove: effectValue, targetTags: effect.effectTags });
  }

  if(effectName === 'starViewGo') {
    const hero = GAME.heros[effected.id]
    window.socket.emit('editHero', { id: effected.id, animationZoomTarget: window.constellationDistance, animationZoomMultiplier: hero.zoomMultiplier, endAnimation: false })
  }

  if(effectName === 'starViewReturn') {
    const hero = GAME.heros[effected.id]
    window.socket.emit('editHero', { id: effected.id, animationZoomTarget: hero.zoomMultiplier, endAnimation: true, })
  }

  if(effectName === 'endPrologue') {
    GAME.gameState.started = false
    GAME.removeListeners()
    GAME.gameState.sequenceQueue = []
    GAME.gameState.activeModList = []
    GAME.gameState.activeMods = {}
    GAME.heros.forEach((hero, i) => {
      if(hero.triggers) hero.triggers = {}
    });
  }

  if(effectName === 'pathfindTo') {
    setPathTarget(effected, effectValue)
  }

  if(effectName === 'goTo') {
    setTarget(effected, effectValue)
  }

  if(effectName === 'pursue') {
    effected._targetPursueId = effectValue
  }

  if(effectName === 'setPath') {
    effected.pathId = effectValue
  }

  if(effectName === 'startCutscene') {
    if(effected.tags.hero) {
      effected.cutscenes = _.cloneDeep(effectValue)
      effected.flags.showCutscene = true
      effected.flags.paused = true
      window.emitGameEvent('onUpdatePlayerUI', effected)
    } else {
      console.log('cannot start cutscene effect non hero')
    }
  }

  if(effectName === 'startGoal') {
    if(effected.tags.hero) {
      function startTimer() {
        GAME.addTimeout(effect.goalId, effect.goalTimeLimit, () => {
          effect.goalChances--
          if(effect.goalChances <= 0) {
            processEffect({ effectName: 'startSequence', effectSequenceId: effect.successSequenceId }, effected, effector, ownerObject)
            GAME.gameState.goals[effect.goalId].failed = true
            return
          }
          startTimer()
        })
      }

      const tracker = TRACKING.startTracking({
        targetCount: effect.goalTargetCount,
        trackingObject: effected,
        targetEvent: effect.goalName,
        targetTags: effect.goalTargetTags,
        showTrackingNavigationTargets: effect.goalShowNavigation,
        onTargetCountReached: () => {
          GAME.gameState.goals[effect.goalId].succeeded = true
          if(GAME.gameState.timeoutsById[effect.goalId]) GAME.gameState.timeoutsById[effect.goalId].paused = true
          if(GAME.gameState.trackers[effect.trackerId]) GAME.gameState.trackers[effect.trackerId].stopped = true
          if(effect.successSequenceId) {
            processEffect({ effectName: 'startSequence', effectSequenceId: effect.successSequenceId }, effected, effector, ownerObject)
          }
        },
      })

      effect.goalId = 'goal-'+window.uniqueID()
      if(!GAME.gameState.goals) GAME.gameState.goals = {}
      GAME.gameState.goals[effect.goalId] = effect

      if(effect.goalTimeLimit) startTimer()

      if(!effected.goals) effected.goals = []
      effected.goals.push({
        goalId: effect.goalId,
        trackerId: tracker.trackerId,
        tags: effect.goalTargetTags,
        show: true,
      })

      window.emitGameEvent('onUpdatePlayerUI', effected)
    } else {
      console.log('cannot start goal effect non hero')
    }
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
