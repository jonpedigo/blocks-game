import collisions from '../utils/collisions'

function getObjectRelations(object, game) {
  let parent = object
  let construct

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

  if(object.ownerId && !object.tags) {
    let objectsOwner = game.objectsById[object.ownerId]
    if(objectsOwner) {
      construct = objectsOwner
    }
  }

  if(construct) {
    return { parent: construct, children: construct.constructParts }
  } else if(parent) {
    let children = []
    game.objects.forEach((obj) => {
      if(obj.parentId === parent.id || obj.relativeId === parent.id) {
        children.push(obj)
      }
    })
    return { parent, children }
  }
}

function findSmallestObjectInArea(area, objects) {
  const objectsToSearch = [...objects]

  let smallestObject
  for(let i = 0; i < objectsToSearch.length; i++) {
    let object = objectsToSearch[i]
    if(object.removed) continue
    if(object.constructParts) {
      objectsToSearch.push(...object.constructParts)
      continue
    }
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
