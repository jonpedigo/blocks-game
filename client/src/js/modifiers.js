window.divideScreenSizeBy = 3
const modifiers = {
  pokemon: {
    arrowKeysBehavior: 'grid',
    gravity: false,
    velocityMax: 0,
  },
  asteroids: {
    arrowKeysBehavior: 'velocity',
    gravity: false,
    velocityMax: 1500/window.divideScreenSizeBy,
  },
  zelda: {
    arrowKeysBehavior: 'position',
    gravity: false,
    velocityMax: 0,
  },
  mario: {
    arrowKeysBehavior: 'position',
    gravity: true,
    jumpVelocity: -1200/window.divideScreenSizeBy,
    velocityMax: 1200/window.divideScreenSizeBy,
    velocityX: 0
  }
}
export default modifiers
