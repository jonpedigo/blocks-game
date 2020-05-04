export default function spawnZoneIntelligence(object) {
  if(object.tags && object.tags['spawnZone']) {
    if(!object.spawnedIds) object.spawnedIds = []

    object.spawnedIds = object.spawnedIds.filter((id) => {
      if(GAME.objectsById[id] && !GAME.objectsById[id].removed) {
        return true
      } else return false
    })

    if(object.initialSpawnPool && (object.spawnPool === undefined || object.spawnPool === null)) {
      object.spawnPool = object.initialSpawnPool
    }

    if(object.spawnedIds.length < object.spawnTotal && !object.spawnWait && (object.spawnPool === undefined || object.spawnPool === null || object.spawnPool > 0)) {
      let newObject = {
        x: object.x,
        y: object.y,
        width: object.width,
        height: object.height,
        id: 'spawned-' + window.uniqueID(),
        ...object.spawnObject,
        spawned: true,
      }
      // let x = gridUtil.getRandomGridWithinXY(object.x, object.x+width)
      // let y = gridUtil.getRandomGridWithinXY(object.y, object.y+height)

      let createdObject = OBJECTS.create([newObject], { fromLiveGame: true })
      object.spawnedIds.push(createdObject[0].id)
      if(object.spawnPool) object.spawnPool--

      object.spawnWait = true
      setTimeout(() => {
        object.spawnWait = false
      }, object.spawnWaitTime || 1000)
    }
  }
}
