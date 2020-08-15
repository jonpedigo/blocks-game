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
    const key = keycode(e.keyCode)
    delete GAME.keysDown[key]

    if(PAGE.role.isGhost) {

    } else if(PAGE.role.isPlayer) {
      //locally update the host input! ( teehee this is the magic! )
      if(PAGE.role.isHost) {
        GAME.heroInputs[HERO.id] = GAME.keysDown
        onKeyUp(key, GAME.heros[HERO.id])
      } else {
        window.socket.emit('sendHeroKeyUp', key, HERO.id)
      }
    }
    window.socket.emit('sendHeroKeyUp', key, HERO.id)
  }, false)
}

function onKeyUp(key, hero) {
  if(key === 'e') {
    hero._cantInteract = false
  }

  window.local.emit('onKeyUp', key, hero)
}

function onUpdate(hero, keysDown, delta) {
  if(hero.flags.paused) return

  const upPressed = 'w' in keysDown || 'up' in keysDown
  const rightPressed = 'd' in keysDown || 'right' in keysDown
  const downPressed = 's' in keysDown || 'down' in keysDown
  const leftPressed = 'a' in keysDown || 'left' in keysDown

  if(!GAME.gameState.started && 'shift' in keysDown) {
    if (upPressed) {
      hero.y -= GAME.grid.nodeSize
    }
    if (downPressed) {
      hero.y += GAME.grid.nodeSize
    }

    if (leftPressed) {
      hero.x -= GAME.grid.nodeSize
    }

    if (rightPressed) {
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

  if (upPressed) {
    if(hero.mod().arrowKeysBehavior === 'acc' || hero.mod().arrowKeysBehavior === 'acceleration') {
      hero.accY -= (ySpeed) * delta;
    } else if (hero.mod().arrowKeysBehavior === 'velocity') {
      hero.velocityY -= (ySpeed) * delta;
    }
  }
  if (downPressed) {
    if(hero.mod().arrowKeysBehavior === 'acc' || hero.mod().arrowKeysBehavior === 'acceleration') {
      hero.accY += (ySpeed) * delta;
    } else if (hero.mod().arrowKeysBehavior === 'velocity') {
      hero.velocityY += (ySpeed) * delta;
    }
  }
  if (leftPressed) {
    if(hero.mod().arrowKeysBehavior === 'acc' || hero.mod().arrowKeysBehavior === 'acceleration') {
      hero.accX -= (xSpeed) * delta;
    } else if (hero.mod().arrowKeysBehavior === 'velocity') {
      hero.velocityX -= (xSpeed) * delta;
    }
  }
  if (rightPressed) {
    if(hero.mod().arrowKeysBehavior === 'acc' || hero.mod().arrowKeysBehavior === 'acceleration') {
      hero.accX += (xSpeed) * delta;
    } else if (hero.mod().arrowKeysBehavior === 'velocity') {
      hero.velocityX += (xSpeed) * delta;
    }
  }

  if(hero.mod().arrowKeysBehavior === 'angleAndVelocity') {
    if(typeof hero.angle !== 'number') hero.angle = 0
    if(typeof hero.velocityAngle !== 'number') hero.velocityAngle = 0

    if (upPressed) {
      hero.velocityAngle += (hero.mod().speed) * delta;
    }
    if (downPressed) {
      hero.velocityAngle -= (hero.mod().speed) * delta;
    }
    if (leftPressed) {
      hero.angle -= 1 * delta;
    }
    if (rightPressed) {
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
      if (upPressed && !hero.mod().tags.disableUpKeyMovement) {
        hero._flatVelocityY = -ySpeed
      } else if (downPressed) {
        hero._flatVelocityY = ySpeed
      } else {
        hero._flatVelocityY = 0
      }

      if (leftPressed) {
        hero._flatVelocityX = -xSpeed
      } else if (rightPressed) {
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

      if (upPressed && hero.inputDirection == 'up' && !hero.mod().tags.disableUpKeyMovement) {
        hero._flatVelocityY = -Math.ceil(ySpeed * delta) * 100
        return
      }

      if (downPressed && hero.inputDirection == 'down') {
        hero._flatVelocityY = Math.ceil(ySpeed * delta) * 100
        return
      }

      if (leftPressed && hero.inputDirection == 'left') {
        hero._flatVelocityX = -Math.ceil(xSpeed * delta) * 100
        return
      }

      if (rightPressed && hero.inputDirection == 'right') {
        hero._flatVelocityX = Math.ceil(xSpeed * delta) * 100
        return
      }

      if (upPressed && !hero.tags.disableUpKeyMovement) {
        hero._flatVelocityY = -Math.ceil(ySpeed * delta) * 100
      }

      if (downPressed) {
        hero._flatVelocityY = Math.ceil(ySpeed * delta) * 100
      }

      if (leftPressed) {
        hero._flatVelocityX = -Math.ceil(xSpeed * delta) * 100
      }

      if (rightPressed) {
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
  if('e' === key) {
    if(hero.dialogue && hero.dialogue.length && !hero._cantInteract) {
      hero._cantInteract = true
      hero.dialogue.shift()
      if(!hero.dialogue.length) {
        hero.flags.showDialogue = false
        hero.flags.paused = false
        hero.onGround = false
      }
      window.emitGameEvent('onUpdatePlayerUI', hero.mod())
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

  const upPressed = 'w' === key || 'up' === key
  const rightPressed = 'd' === key || 'right' === key
  const downPressed = 's' === key || 'down' === key
  const leftPressed = 'a' === key || 'left' === key

  if(hero.mod().arrowKeysBehavior === 'grid') {
    if (upPressed) {
      hero.y -= GAME.grid.nodeSize
    } else if (downPressed) {
      hero.y += GAME.grid.nodeSize
    } else if (leftPressed) {
      hero.x -= GAME.grid.nodeSize
    } else if (rightPressed) {
      hero.x += GAME.grid.nodeSize
    }
  }

  if (upPressed) {
    hero.inputDirection = 'up'
  }
  if (downPressed) {
    hero.inputDirection = 'down'
  }
  if (leftPressed) {
    hero.inputDirection = 'left'
  }
  if (rightPressed) {
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
  onKeyUp,
}
