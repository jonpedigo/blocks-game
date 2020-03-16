
const modifiers = {
  pokemon: {
    arrowKeysBehavior: 'grid',
    gravity: false,
    velocityMax: 0,
  },
  asteroids: {
    arrowKeysBehavior: 'velocity',
    gravity: false,
    velocityMax: 600,
  },
  zelda: {
    arrowKeysBehavior: 'position',
    gravity: false,
    velocityMax: 0,
  },
  mario: {
    arrowKeysBehavior: 'position',
    gravity: true,
    jumpVelocity: -480,
    velocityMax: 480,
    velocityX: 0
  }
}
export default modifiers
