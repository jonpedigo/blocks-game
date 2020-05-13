export default function onBehavior(hero, collider, result, removeObjects, respawnObjects, options) {
  if(collider.tags && collider.tags['monster']) {
    if(hero.tags['monsterDestroyer']) {
      window.local.emit('onHeroDestroyMonster', hero, collider, result, removeObjects, respawnObjects, options)
      if(collider.spawnPointX >= 0 && collider.tags['respawn']) {
        respawnObjects.push(collider)
      } else {
        removeObjects.push(collider)
      }
    } else {
      // hero.lives--
      respawnObjects.push(hero)
    }
  }

  if(collider.tags && collider.tags['coin']) {
    hero.score++
  }
}
