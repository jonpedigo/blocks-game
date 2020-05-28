export default function onCombat(hero, collider, result, options) {
  if(collider.tags && collider.tags['monster']) {
    if(hero.tags['monsterDestroyer']) {
      collider._destroyedBy = hero
      if(collider.spawnPointX >= 0 && collider.tags['respawn']) {
        collider._respawn = true
      } else {
        collider._remove = true
      }
    } else {
      // hero.lives--
      hero._respawn = true
    }
  }
}
