import collisions from '../collisions'

function getObjectRelations(object, game) {
  let parent = object
  if(object.parentId) {
    let objectsParent = game.objectsById[object.parentId] || game.heros[object.parentId]
    if(objectsParent) {
      parent = objectsParent
    }
  }

  if(object.relativeId) {
    let objectsRelative = game.objectsById[object.relativeId] || game.heros[object.relativeId]
    if(objectsRelative) {
      parent = objectsRelative
    }
  }

  let children = []
  game.objects.forEach((obj) => {
    if(obj.parentId === parent.id || obj.relativeId === parent.id) {
      children.push(obj)
    }
  })

  return { parent, children }
}

function findSmallestObjectInArea(area, objects) {
  let smallestObject
  for(let i = 0; i < objects.length; i++) {
    let object = objects[i]
    collisions.checkObject(area, object, () => {
      if(!smallestObject) smallestObject = object
      else if(object.width < smallestObject.width) {
        smallestObject = object
      }
    })
  }

  return smallestObject
}

export default {
  getObjectRelations,
  findSmallestObjectInArea,
}
