window.local.on('onFirstPageGameLoaded', () => {
  window.modLibrary = {
    spin: {
      effectJSON: {
        tags: {
          rotateable: true,
          realRotateFast: true
         }
      },
    },
    asteroids: {
      modEndOthers: true,
      effectJSON: {
        arrowKeysBehavior: 'angleAndVelocity',
        xButtonBehavior: 'accelerate',
        zButtonBehavior: 'brakeToZero',
        tags: {
          rotateable: true,
        }
      }
    },
    car: {
      modEndOthers: true,
      effectJSON: {
        arrowKeysBehavior: 'angle',
        zButtonBehavior: 'accelerate',
        xButtonBehavior: 'brakeToZero',
        tags: {
          rotateable: true,
        }
      }
    },
    ufo: {
      modEndOthers: true,
      effectJSON: {
        arrowKeysBehavior: 'velocity',
      }
    },
    zelda: {
      modEndOthers: true,
      effectJSON: {
        arrowKeysBehavior: 'flatDiagonal',
      }
    },
    kirby: {
      modEndOthers: true,
      effectJSON: {
        arrowKeysBehavior: 'flatDiagonal',
        spaceBarBehavior: 'floatJump',
        tags: {
          gravityY: true,
        },
        jumpVelocity: -480,
        velocityMax: 480,
      }
    },
    mario: {
      modEndOthers: true,
      effectJSON: {
        arrowKeysBehavior: 'flatDiagonal',
        spaceBarBehavior: 'groundJump',
        tags: {
          gravityY: true,
        },
        jumpVelocity: -480,
        velocityMax: 480,
      }
    },
    snake: {
      modEndOthers: true,
      effectJSON: {
        arrowKeysBehavior: 'skating',
      }
    },
  }
})
