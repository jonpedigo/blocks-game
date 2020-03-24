const modifiers = {
  pokemon: {
    arrowKeysBehavior: 'grid',
    gravity: false,
    velocityMax: 0,
  },
  asteroids: {
    arrowKeysBehavior: 'velocity',
    gravity: false,
    velocityMax: 400,
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
  },
  chatter: {
    chat: ['Hello'],
  },
  gun: {
    actionBehavior: 'dropWall',
  }
}
export default modifiers
