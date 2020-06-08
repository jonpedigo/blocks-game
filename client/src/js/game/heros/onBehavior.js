export default function onBehavior(hero, collider, result, options) {
  if(collider.tags && collider.tags['coin']) {
    hero.score++
    collider._destroy = true
    collider._destroyedBy = hero
  }
}
