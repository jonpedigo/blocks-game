window.local.on('onFirstPageGameLoaded', () => {
  window.modLibrary = {
    spin: {
      tags: {
        rotateable: true,
        realRotateFast: true
       }
    },
    asteroids: {
      arrowKeysBehavior: 'angleAndVelocity',
      zButtonBehavior: 'brakeToZero',
      tags: {
        rotateable: true,
      }
    },
    car: {
      arrowKeysBehavior: 'angle',
      zButtonBehavior: 'accelerate',
      xButtonBehavior: 'brakeToZero',
      tags: {
        rotateable: true,
      }
    },
    ufo: {
      arrowKeysBehavior: 'velocity',
    },
    zelda: {
      arrowKeysBehavior: 'flatDiagonal',
    },
    kirby: {
      arrowKeysBehavior: 'flatDiagonal',
      spaceBarBehavior: 'floatJump',
      tags: {
        gravityY: true,
      },
      jumpVelocity: -480,
      velocityMax: 480,
    },
    mario: {
      arrowKeysBehavior: 'flatDiagonal',
      spaceBarBehavior: 'groundJump',
      tags: {
        gravityY: true,
      },
      jumpVelocity: -480,
      velocityMax: 480,
    },
    snake: {
      arrowKeysBehavior: 'skating',
    },
  }
})
