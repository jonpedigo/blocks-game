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

  stopTracking(stopId) {
    GAME.gameState.trackers = GAME.gameState.trackers.filter(({trackerId}) => {
      if(stopId === trackerId) return false
      return true
    })
  }

  tagMatch(targetTags, object) {
    return targetTags.some((tag) => {
      if(object.mod().tags[tag]) return true
    })
  }

  eventHappened(tracker) {
    const { targetCount, onTargetCountReached } = tracker
    tracker.count++
    if(targetCount && targetCount === tracker.count) {
      if(onTargetCountReached) onTargetCountReached()
      this.stopTracking(tracker.trackerId)
    }
  }

  onUpdate() {
    GAME.gameState.trackers.forEach((tracker) => {
      GAME.gameState.trackersById[tracker.trackerId] = tracker
    })
  }

  onHeroTouchStart = (hero, object) => {
    GAME.gameState.trackers.forEach((tracker) => {
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
