export default function onCombat(hero, collider, result, options) {
  if(collider.tags && collider.mod().tags['monster']) {
    if(hero.mod().tags['monsterDestroyer']) {
      collider._destroyedBy = hero
      if(collider.mod().spawnPointX >= 0 && collider.d().motags['respawn']) {
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
