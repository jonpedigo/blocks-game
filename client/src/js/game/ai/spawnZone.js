// spawnWait
// spawnPool
// spawnPoolInitial
// spawnWaitTimer
// spawnedIds
// spawnLimit
// spawnSubObjectName

export default function spawnZoneIntelligence(object) {
  if(object.tags && object.tags['spawnZone']) {
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
      let newObject = {
        x: object.x,
        y: object.y,
        width: object.width,
        height: object.height,
        ...JSON.parse(JSON.stringify(object.subObjects[object.spawnSubObjectName])),
        id: 'spawned-' + window.uniqueID(),
        spawned: true,
      }
      newObject.tags.potential = false
      newObject.tags.subObject = false
      delete newObject.subObjectName
      delete newObject.ownerId

      // let x = gridUtil.getRandomGridWithinXY(object.x, object.x+width)
      // let y = gridUtil.getRandomGridWithinXY(object.y, object.y+height)

      let createdObject = OBJECTS.create([newObject], { fromLiveGame: true })
      object.spawnedIds.push(createdObject[0].id)
      object.spawnPool--

      object.spawnWait = true
      object.spawnWaitTimerId = GAME.addTimeout('spawnWait-' + window.uniqueID(), object.spawnWaitTimer || 10, () => {
        object.spawnWait = false
      })
    }
  }
}
