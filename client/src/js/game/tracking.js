class Tracking {
  onGameLoaded() {
    GAME.gameState.trackers = []
    GAME.gameState.trackersById = {}
  }

  //{ trackingObject, targetEvent, targetCount, targetTags }
  startTracking(tracker) {
    tracker.trackerId = 'tracker-' + window.uniqueID()
    tracker.count = 0
    GAME.gameState.trackers.push(tracker)
    return tracker
  }

  stopTracking(id) {
    if(GAME.gameState.trackers.length) GAME.gameState.trackers.forEach((tracker) => {
      if(id === tracker.trackerId) tracker.stopped = true
    })
  }

  tagMatch(targetTags, object) {
    return targetTags.some((tag) => {
      if(object.mod().tags[tag]) return true
    })
  }

  eventHappened(tracker) {
    const { targetCount, onTargetCountReached, trackingObject, isGoal } = tracker
    tracker.count++

    if(targetCount) window.emitGameEvent('onUpdatePlayerUI', trackingObject)
    if(targetCount && targetCount === tracker.count) {
      if(onTargetCountReached) onTargetCountReached()
      this.stopTracking(tracker.trackerId)
    }
  }

  onUpdate() {
    if(GAME.gameState.trackers.length) GAME.gameState.trackers.forEach((tracker) => {
      GAME.gameState.trackersById[tracker.trackerId] = tracker
      if(tracker.showTrackingNavigationTargets) {
        const possibleObjects = GAME.objectsByTag[tracker.targetTags[0]]
        if(possibleObjects && possibleObjects.length) {
          tracker.trackingObject.navigationTargetId = possibleObjects[0].id
        }
      }
    })
  }

  onHeroTouchStart = (hero, object) => {
    if(GAME.gameState.trackers.length) GAME.gameState.trackers.forEach((tracker) => {
      if(tracker.stopped) return
      const { trackingObject, targetEvent, targetTags } = tracker
      if(targetEvent === 'touchX' &&
        trackingObject.id === hero.id &&
        this.tagMatch(targetTags, object)) {
          this.eventHappened(tracker)
      }
    })
  }
}

window.TRACKING = new Tracking()
