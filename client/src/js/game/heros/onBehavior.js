export default function onBehavior(hero, collider, result, removeObjects, respawnObjects, options) {
  if(collider.tags && collider.tags['coin']) {
    hero.score++
  }
}
