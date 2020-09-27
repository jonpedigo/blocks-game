window.local.on('onFirstPageGameLoaded', () => {
  window.modLibrary = {
    spin: {
      modId: 'spin',
      effectJSON: {
        tags: {
          rotateable: true,
          realRotateFast: true
         }
      },
    },
    asteroids: {
      modId: 'asteroids',
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
      modId: 'car',
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
      modId: 'ufo',
      modEndOthers: true,
      effectJSON: {
        arrowKeysBehavior: 'velocity',
        color: 'yellow',
      }
    },
    zelda: {
      modId: 'zelda',
      modEndOthers: true,
      effectJSON: {
        arrowKeysBehavior: 'flatDiagonal',
      }
    },
    kirby: {
      modEndOthers: true,
      modId: 'kirby',
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
      modId: 'mario',
      effectJSON: {
        "color": "#b71c1c",
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
      modId: 'snake',
      modEndOthers: true,
      effectJSON: {
        arrowKeysBehavior: 'skating',
      }
    },
  }
})
