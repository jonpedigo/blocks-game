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
      if(HERO.id === 'ghost') onKeyDown(key, GAME.heros[HERO.id])
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
    if ('up' in keysDown) { // Player holding up
      hero.y -= GAME.grid.nodeSize
    }
    if ('down' in keysDown) { // Player holding down
      hero.y += GAME.grid.nodeSize
    }

    if ('left' in keysDown) { // Player holding left
      hero.x -= GAME.grid.nodeSize
    }

    if ('right' in keysDown) { // Player holding right
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

  if ('up' in keysDown) { // Player holding up
    if(hero.mod().arrowKeysBehavior === 'acc' || hero.mod().arrowKeysBehavior === 'acceleration') {
      hero.accY -= (hero.mod().speed) * delta;
    } else if (hero.mod().arrowKeysBehavior === 'velocity') {
      hero.velocityY -= (hero.mod().speed) * delta;
    }
  }
  if ('down' in keysDown) { // Player holding down
    if(hero.mod().arrowKeysBehavior === 'acc' || hero.mod().arrowKeysBehavior === 'acceleration') {
      hero.accY += (hero.mod().speed) * delta;
    } else if (hero.mod().arrowKeysBehavior === 'velocity') {
      hero.velocityY += (hero.mod().speed) * delta;
    }
  }
  if ('left' in keysDown) { // Player holding left
    if(hero.mod().arrowKeysBehavior === 'acc' || hero.mod().arrowKeysBehavior === 'acceleration') {
      hero.accX -= (hero.mod().speed) * delta;
    } else if (hero.mod().arrowKeysBehavior === 'velocity') {
      hero.velocityX -= (hero.mod().speed) * delta;
    }
  }
  if ('right' in keysDown) { // Player holding right
    if(hero.mod().arrowKeysBehavior === 'acc' || hero.mod().arrowKeysBehavior === 'acceleration') {
      hero.accX += (hero.mod().speed) * delta;
    } else if (hero.mod().arrowKeysBehavior === 'velocity') {
      hero.velocityX += (hero.mod().speed) * delta;
    }
  }

  if(hero.mod().arrowKeysBehavior === 'angleAndVelocity') {
    if(typeof hero.angle !== 'number') hero.angle = 0
    if(typeof hero.velocityAngle !== 'number') hero.velocityAngle = 0

    if ('up' in keysDown) { // Player holding up
      hero.velocityAngle += (hero.mod().speed) * delta;
    }
    if ('down' in keysDown) { // Player holding down
      hero.velocityAngle -= (hero.mod().speed) * delta;
    }
    if ('left' in keysDown) { // Player holding left
      hero.angle -= 1 * delta;
    }
    if ('right' in keysDown) { // Player holding right
      hero.angle += 1 * delta
    }

    const angleCorrection = window.degreesToRadians(90)
    hero.velocityX = hero.velocityAngle * Math.cos(hero.angle - angleCorrection)
    hero.velocityY = hero.velocityAngle * Math.sin(hero.angle - angleCorrection)
  }

  if(hero.mod().arrowKeysBehavior === 'skating') {
    if(hero.inputDirection === 'up') {
      hero.y -= Math.ceil(hero.mod().speed * delta);
    } else if(hero.inputDirection === 'down') {
      hero.y += Math.ceil(hero.mod().speed * delta);
    } else if(hero.inputDirection === 'left') {
      hero.x -= Math.ceil(hero.mod().speed * delta);
    } else if(hero.inputDirection === 'right') {
      hero.x += Math.ceil(hero.mod().speed * delta);
    }
  }

  function positionInput() {

    if(hero.mod().arrowKeysBehavior === 'flatDiagonal') {
      if ('up' in keysDown && !hero.mod().tags.disableUpKeyMovement) { // Player holding up
        hero._flatVelocityY = -hero.mod().speed
      } else if ('down' in keysDown) { // Player holding down
        hero._flatVelocityY = hero.mod().speed
      } else {
        hero._flatVelocityY = 0
      }

      if ('left' in keysDown) { // Player holding left
        hero._flatVelocityX = -hero.mod().speed
      } else if ('right' in keysDown) { // Player holding right
        hero._flatVelocityX = hero.mod().speed
      } else {
        hero._flatVelocityX = 0
      }
    }

    if(hero.mod().arrowKeysBehavior === 'flatRecent') {
      hero._flatVelocityX = 0
      if(!hero.mod().tags.disableUpKeyMovement) {
        hero._flatVelocityY = 0
      }

      if ('up' in keysDown && hero.inputDirection == 'up' && !hero.mod().tags.disableUpKeyMovement) { // Player holding up
        hero._flatVelocityY = -Math.ceil(hero.mod().speed * delta) * 100
        return
      }

      if ('down' in keysDown && hero.inputDirection == 'down') { // Player holding down
        hero._flatVelocityY = Math.ceil(hero.mod().speed * delta) * 100
        return
      }

      if ('left' in keysDown && hero.inputDirection == 'left') { // Player holding left
        hero._flatVelocityX = -Math.ceil(hero.mod().speed * delta) * 100
        return
      }

      if ('right' in keysDown && hero.inputDirection == 'right') { // Player holding right
        hero._flatVelocityX = Math.ceil(hero.mod().speed * delta) * 100
        return
      }

      if ('up' in keysDown && !hero.tags.disableUpKeyMovement) { // Player holding up
        hero._flatVelocityY = -Math.ceil(hero.mod().speed * delta) * 100
      }

      if ('down' in keysDown) { // Player holding down
        hero._flatVelocityY = Math.ceil(hero.mod().speed * delta) * 100
      }

      if ('left' in keysDown) { // Player holding left
        hero._flatVelocityX = -Math.ceil(hero.mod().speed * delta) * 100
      }

      if ('right' in keysDown) { // Player holding right
        hero._flatVelocityX = Math.ceil(hero.mod().speed * delta) * 100
      }
    }
  }

  positionInput()
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
    if ('up' === key) { // Player holding up
      hero.y -= GAME.grid.nodeSize
    } else if ('down' === key) { // Player holding down
      hero.y += GAME.grid.nodeSize
    } else if ('left' === key) { // Player holding left
      hero.x -= GAME.grid.nodeSize
    } else if ('right' === key) { // Player holding right
      hero.x += GAME.grid.nodeSize
    }
  }

  if ('up' === key) { // Player holding up
    hero.inputDirection = 'up'
  }
  if ('down' === key) { // Player holding down
    hero.inputDirection = 'down'
  }
  if ('left' === key) { // Player holding left
    hero.inputDirection = 'left'
  }
  if ('right' === key) { // Player holding right
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
