import keycode from 'keycode'

function setDefault() {
  window.heroArrowKeyBehaviors = [
    'flatDiagonal',
    'velocity',
    'skating',
    'flatRecent',
    'angleAndVelocity',
    'none'
  ]

  window.heroActionButtonBehaviors = [
    'dropWall',
    'shootBullet',
    'none'
  ]

  window.heroSpaceBarBehaviors = [
    'groundJump',
    'floatJump',
    'none',
  ]
}

function addCustomInputBehavior(behaviorList) {
  behaviorList.forEach((behavior) => {
    const { behaviorProp, behaviorName } = behavior
    if(behaviorProp === 'spaceBarBehavior') {
      window.heroSpaceBarBehaviors.unshift(behaviorName)
    }
    if(behaviorProp === 'actionButtonBehavior') {
      window.heroActionButtonBehaviors.unshift(behaviorName)
    }
    if(behaviorProp === 'arrowKeysBehavior') {
      window.heroArrowKeyBehaviors.unshift(behaviorName)
    }
  })
}

function onPageLoaded(){
  GAME.keysDown = {}
  // this is the one for the host
  GAME.heroInputs = {}

  window.addEventListener("keydown", function (e) {
    const key = keycode(e.keyCode)

    if(PAGE.role.isGhost) {

    } else if(PAGE.role.isPlayer) {
      if(!PAGE.typingMode) {
        GAME.keysDown[key] = true
      }
      //locally update the host input! ( teehee this is the magic! )
      if(PAGE.role.isHost) {
        GAME.heroInputs[HERO.id] = GAME.keysDown
        onKeyDown(key, GAME.heros[HERO.id])
      } else {
        window.socket.emit('sendHeroKeyDown', key, HERO.id)
      }
    }
  }, false)

  window.addEventListener("keyup", function (e) {
	   delete GAME.keysDown[keycode(e.keyCode)]
  }, false)
}

function onUpdate(hero, keysDown, delta) {
  if(hero.flags.paused) return

  if(!GAME.gameState.started && 'shift' in keysDown) {
    if ('w' in keysDown) {
      hero.y -= GAME.grid.nodeSize
    }
    if ('s' in keysDown) {
      hero.y += GAME.grid.nodeSize
    }

    if ('a' in keysDown) {
      hero.x -= GAME.grid.nodeSize
    }

    if ('d' in keysDown) {
      hero.x += GAME.grid.nodeSize
    }

    hero._skipPosUpdate = true

    return
  }

  /*
    left arrow	'left'
    up arrow	'up'
    right arrow	'right'
    down arrow	'down'
    w 87
    a 65
    s 83
    d 68
  */
  /// DEFAULT GAME FX
  if(hero.flags.paused || GAME.gameState.paused) return


  const xSpeed = hero.mod().speed + (hero.mod().speedXExtra || 0)
  const ySpeed = hero.mod().speed + (hero.mod().speedYExtra || 0)

  if ('w' in keysDown) {
    if(hero.mod().arrowKeysBehavior === 'acc' || hero.mod().arrowKeysBehavior === 'acceleration') {
      hero.accY -= (ySpeed) * delta;
    } else if (hero.mod().arrowKeysBehavior === 'velocity') {
      hero.velocityY -= (ySpeed) * delta;
    }
  }
  if ('s' in keysDown) {
    if(hero.mod().arrowKeysBehavior === 'acc' || hero.mod().arrowKeysBehavior === 'acceleration') {
      hero.accY += (ySpeed) * delta;
    } else if (hero.mod().arrowKeysBehavior === 'velocity') {
      hero.velocityY += (ySpeed) * delta;
    }
  }
  if ('a' in keysDown) {
    if(hero.mod().arrowKeysBehavior === 'acc' || hero.mod().arrowKeysBehavior === 'acceleration') {
      hero.accX -= (xSpeed) * delta;
    } else if (hero.mod().arrowKeysBehavior === 'velocity') {
      hero.velocityX -= (xSpeed) * delta;
    }
  }
  if ('d' in keysDown) {
    if(hero.mod().arrowKeysBehavior === 'acc' || hero.mod().arrowKeysBehavior === 'acceleration') {
      hero.accX += (xSpeed) * delta;
    } else if (hero.mod().arrowKeysBehavior === 'velocity') {
      hero.velocityX += (xSpeed) * delta;
    }
  }

  if(hero.mod().arrowKeysBehavior === 'angleAndVelocity') {
    if(typeof hero.angle !== 'number') hero.angle = 0
    if(typeof hero.velocityAngle !== 'number') hero.velocityAngle = 0

    if ('w' in keysDown) {
      hero.velocityAngle += (hero.mod().speed) * delta;
    }
    if ('s' in keysDown) {
      hero.velocityAngle -= (hero.mod().speed) * delta;
    }
    if ('a' in keysDown) {
      hero.angle -= 1 * delta;
    }
    if ('d' in keysDown) {
      hero.angle += 1 * delta
    }

    const angleCorrection = window.degreesToRadians(90)
    hero.velocityX = hero.velocityAngle * Math.cos(hero.angle - angleCorrection)
    hero.velocityY = hero.velocityAngle * Math.sin(hero.angle - angleCorrection)
  }

  if(hero.mod().arrowKeysBehavior === 'skating') {
    if(hero.inputDirection === 'up') {
      hero.y -= Math.ceil(ySpeed * delta);
    } else if(hero.inputDirection === 'down') {
      hero.y += Math.ceil(ySpeed * delta);
    } else if(hero.inputDirection === 'left') {
      hero.x -= Math.ceil(xSpeed * delta);
    } else if(hero.inputDirection === 'right') {
      hero.x += Math.ceil(xSpeed * delta);
    }
  }

  function positionInput() {

    if(hero.mod().arrowKeysBehavior === 'flatDiagonal') {
      if ('w' in keysDown && !hero.mod().tags.disableUpKeyMovement) {
        hero._flatVelocityY = -ySpeed
      } else if ('s' in keysDown) {
        hero._flatVelocityY = ySpeed
      } else {
        hero._flatVelocityY = 0
      }

      if ('a' in keysDown) {
        hero._flatVelocityX = -xSpeed
      } else if ('d' in keysDown) {
        hero._flatVelocityX = xSpeed
      } else {
        hero._flatVelocityX = 0
      }
    }

    if(hero.mod().arrowKeysBehavior === 'flatRecent') {
      hero._flatVelocityX = 0
      if(!hero.mod().tags.disableUpKeyMovement) {
        hero._flatVelocityY = 0
      }

      if ('w' in keysDown && hero.inputDirection == 'up' && !hero.mod().tags.disableUpKeyMovement) {
        hero._flatVelocityY = -Math.ceil(ySpeed * delta) * 100
        return
      }

      if ('s' in keysDown && hero.inputDirection == 'down') {
        hero._flatVelocityY = Math.ceil(ySpeed * delta) * 100
        return
      }

      if ('a' in keysDown && hero.inputDirection == 'left') {
        hero._flatVelocityX = -Math.ceil(xSpeed * delta) * 100
        return
      }

      if ('d' in keysDown && hero.inputDirection == 'right') {
        hero._flatVelocityX = Math.ceil(xSpeed * delta) * 100
        return
      }

      if ('w' in keysDown && !hero.tags.disableUpKeyMovement) {
        hero._flatVelocityY = -Math.ceil(ySpeed * delta) * 100
      }

      if ('s' in keysDown) {
        hero._flatVelocityY = Math.ceil(ySpeed * delta) * 100
      }

      if ('a' in keysDown) {
        hero._flatVelocityX = -Math.ceil(xSpeed * delta) * 100
      }

      if ('d' in keysDown) {
        hero._flatVelocityX = Math.ceil(xSpeed * delta) * 100
      }
    }
  }

  positionInput()

  // if(hero.mod().tags.allowCameraRotation) {
  //   if ('right' in keysDown) {
  //     hero.cameraRotation += delta
  //   }
  //   if ('left' in keysDown) {
  //     hero.cameraRotation -= delta
  //   }
  // }
}

function onKeyDown(key, hero) {
  if('space' === key) {
    if(hero.dialogue && hero.dialogue.length) {
      hero.dialogue.shift()
      if(!hero.dialogue.length) {
        hero.flags.showDialogue = false
        hero.flags.paused = false
        hero.onGround = false
      }
    }
  }

  if(hero.flags.paused || GAME.gameState.paused) {
    window.local.emit('onKeyDown', key, hero)
    return
  }

  if('space' === key) {
    if(hero.onGround && hero.mod().spaceBarBehavior === 'groundJump') {
      hero.velocityY = hero.mod().jumpVelocity
      // lastJump = Date.now();
    }

    if(hero.mod().spaceBarBehavior === 'floatJump') {
      if(hero._floatable === false && hero.onGround) {
        if(GAME.gameState.timeoutsById[hero.id + '-floatable']) GAME.completeTimeout(hero.id + '-floatable')
        hero._floatable = true
      }

      if(hero._floatable === true) {
        hero.velocityY = hero.mod().jumpVelocity
        GAME.addTimeout(hero.id + '-floatable', hero.mod().floatJumpTimeout || .6, () => {
          hero._floatable = true
        })
        hero._floatable = false
        // lastJump = Date.now();
      }

      if(hero._floatable === undefined || hero._floatable === null || !GAME.gameState.timeoutsById[hero.id + '-floatable']) {
        hero._floatable = true
      }
    }
  }

  if(hero.mod().arrowKeysBehavior === 'grid') {
    if ('w' === key) {
      hero.y -= GAME.grid.nodeSize
    } else if ('s' === key) {
      hero.y += GAME.grid.nodeSize
    } else if ('a' === key) {
      hero.x -= GAME.grid.nodeSize
    } else if ('d' === key) {
      hero.x += GAME.grid.nodeSize
    }
  }

  if ('w' === key) {
    hero.inputDirection = 'up'
  }
  if ('s' === key) {
    hero.inputDirection = 'down'
  }
  if ('a' === key) {
    hero.inputDirection = 'left'
  }
  if ('d' === key) {
    hero.inputDirection = 'right'
  }

  window.local.emit('onKeyDown', key, hero)
}

export default {
  addCustomInputBehavior,
  setDefault,
  onPageLoaded,
  onUpdate,
  onKeyDown,
}
