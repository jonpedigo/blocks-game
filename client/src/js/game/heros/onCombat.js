export default function onCombat(hero, collider, result, options) {
  if(collider.tags && collider.mod().tags['monster']) {
    if(hero.mod().tags['monsterDestroyer']) {
      if(typeof collider.mod().spawnPointX == 'number' && collider.mod().tags['respawn']) {
        collider._respawn = true
      } else {
        collider._destroyedById = hero.id
        collider._destroy = true
      }
    } else if(hero.mod().tags['monsterVictim']) {
      // hero.lives--
      // I think heros should almost always respawn
      // if(hero.mod().tags.respawn) {
        hero._respawn = true
      // } else {}
    }
  }
}
