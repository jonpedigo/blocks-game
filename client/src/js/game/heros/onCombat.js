export default function onCombat(hero, collider, result, options) {
  if(collider.tags && collider.mod().tags['monster']) {
    if(hero.mod().tags['monsterDestroyer']) {
      if(typeof collider.mod().spawnPointX == 'number' && collider.mod().tags['respawn']) {
        collider._respawn = true
      } else {
        collider._destroyedBy = hero
        collider._destroy = true
      }
    } else {
      // hero.lives--
      hero._respawn = true
    }
  }
}
