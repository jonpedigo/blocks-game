import keycode from 'keycode'
import { shootBullet, dropWall } from './action.js';

window.defaultWASD =  {
  w: 'Move Up',
  s: 'Move Down',
  a: 'Move Left',
  d: 'Move Right',
}
window.defaultArrowKeys =  {
  up: 'Move Up',
  down: 'Move Down',
  left: 'Move Left',
  right: 'Move Right',
}

function setDefault() {
  window.arrowKeysBehavior = {
    'flatDiagonal' : {
      ...window.defaultArrowKeys,
    },
    'velocity': {
      ...window.defaultArrowKeys,
    },
    'skating': {
      ...window.defaultArrowKeys,
    },
    'flatRecent': {
      ...window.defaultArrowKeys,
    },
    'angle' : {
      up: 'Face Up',
      down: 'Face Down',
      left: 'Face Left',
      right: 'Face Right',
    },
    'angleAndVelocity' : {
      up: 'Move Forward',
      down: 'Move Backward',
      left: 'Rotate Left',
      right: 'Rotate Right',
    },
    'none' : {
    }
  }

  window.arrowKeysBehavior2 = {
    'flatDiagonal' : {
      ...window.defaultWASD,
    },
    'velocity': {
      ...window.defaultWASD,
    },
    'skating': {
      ...window.defaultWASD,
    },
    'flatRecent': {
      ...window.defaultWASD,
    },
    'angleAndVelocity' : {
      w: 'Move Forward',
      s: 'Move Backward',
      a: 'Rotate Left',
      d: 'Rotate Right',
    },
    'angle' : {
      w: 'Face Up',
      s: 'Face Down',
      a: 'Face Left',
      d: 'Face Right',
    },
    'none' : {
    }

  }

  window.actionButtonBehavior = {
    'dropWall': 'Drop Wall',
    'shoot': 'Shoot Bullet',
    'accelerate': 'Accelerate',
    'accelerateBackwards': 'Go Backwards',
    'deccelerateToZero': 'Slow Down',
    'brakeToZero': 'Fast Stop'
  }

  window.spaceBarBehavior = {
    'groundJump': {
      'space': 'Jump ( On Ground )'
    },
    'floatJump': {
      'space': 'Jump ( On Ground or In Air )'
    },
    'none': {

    }
  }
}

function addCustomInputBehavior(behaviorList) {
  behaviorList.forEach((behavior) => {
    const { behaviorProp, behaviorName } = behavior
    if(behaviorProp === 'spaceBarBehavior') {
      window.spaceBarBehavior.unshift(behaviorName)
    }
    if(behaviorProp === 'actionButtonBehavior') {
      window.actionButtonBehavior.unshift(behaviorName)
    }
    if(behaviorProp === 'arrowKeysBehavior') {
      window.arrowKeysBehavior.unshift(behaviorName)
    }
  })
}

function onPlayerIdentified(){
  GAME.keysDown = {}
  // this is the one for the host
  GAME.heroInputs = {}

  window.addEventListener("keydown", function (e) {
    const key = keycode(e.keyCode)

    if(key === 'space' || key === 'left' || key === 'right' || key === 'up' || key === 'down') {
      e.preventDefault()
    }

    if(PAGE.role.isGhost && !HERO.ghostControl) {

    } else if(PAGE.role.isPlayer) {
      if(!PAGE.typingMode && !CONSTRUCTEDITOR.open) {
        GAME.keysDown[key] = true
      }
      //locally update the host input! ( teehee this is the magic! )
      if(PAGE.role.isHost && !CONSTRUCTEDITOR.open) {
        if(!GAME.heroInputs[HERO.id]) GAME.heroInputs[HERO.id] = {}
        GAME.heroInputs[HERO.id][key] = true
        GAME.heros[HERO.id].keysDown = GAME.heroInputs[HERO.id]
        onKeyDown(key, GAME.heros[HERO.id])
      } else {
        onKeyDown(key, GAME.heros[HERO.id])
        window.socket.emit('sendHeroKeyDown', key, HERO.id)
      }
    }
  }, false)

  window.addEventListener("keyup", function (e) {
    const key = keycode(e.keyCode)

    if(PAGE.role.isGhost && !HERO.ghostControl) {

    } else if(PAGE.role.isPlayer) {
      GAME.keysDown[key] = false
      //locally update the host input! ( teehee this is the magic! )
      if(PAGE.role.isHost) {
        if(!GAME.heroInputs[HERO.id]) GAME.heroInputs[HERO.id] = {}
        onKeyUp(key, GAME.heros[HERO.id])
        GAME.heros[HERO.id].keysDown = GAME.heroInputs[HERO.id]
        GAME.heroInputs[HERO.id][key] = false
      } else {
        window.socket.emit('sendHeroKeyUp', key, HERO.id)
      }
    }
    // window.socket.emit('sendHeroKeyUp', key, HERO.id)
  }, false)
}

function onKeyUp(key, hero) {
  if(key === 'e' || key === 'v') {
    hero._cantInteract = false
  }
  GAME.heroInputs[hero.id][key] = false

  window.local.emit('onKeyUp', key, hero)
}

function handleActionButtonBehavior(hero, action, delta) {
  let subObject = false
  Object.keys(hero.subObjects).forEach((name) => {
    const so = hero.subObjects[name]
    if(so.id === action) {
      action = so.actionButtonBehavior
      subObject = so
    }
  })

  if(action === 'shoot') {
    if(subObject) {
      shootBullet({direction: hero.inputDirection, pos: subObject, tags: subObject.actionProps.shootTags})
    } else {
      shootBullet({direction: hero.inputDirection, pos: hero, tags: { monsterDestroyer: true }})
    }
  }

  if(action === 'accelerate') {
    hero.velocityAngle += hero.speed * delta
  }
  if(action === 'deccelerateToZero') {
    if((hero.velocityAngle < .1 && hero.velocityAngle > 0) ||  (hero.velocityAngle > -.1 && hero.velocityAngle < 0)) {
      hero.velocityAngle = 0
      hero.velocityX = 0
      hero.velocityY = 0
      return
    }
    if(hero.velocityAngle > 0) {
      hero.velocityAngle -= hero.speed * delta
      return
    }
    if(hero.velocityAngle < 0) {
      hero.velocityAngle += hero.speed * delta
      return
    }
  }
  if(action === 'brakeToZero') {
    if((hero.velocityAngle < 20 && hero.velocityAngle > 0) ||  (hero.velocityAngle > -20 && hero.velocityAngle < 0)) {
      hero.velocityAngle = 0
      hero.velocityX = 0
      hero.velocityY = 0
      return
    }
    if(hero.velocityAngle > 0) {
      hero.velocityAngle -= hero.speed * delta * 4
      return
    }
    if(hero.velocityAngle < 0) {
      hero.velocityAngle += hero.speed * delta * 4
      return
    }
  }
  if(action === 'accelerateBackwards') {
    hero.velocityAngle -= hero.speed * delta
  }
}

function onUpdate(hero, keysDown, delta) {
  if(hero.flags.paused) return

  const upPressed = keysDown['w'] || keysDown['up']
  const rightPressed = keysDown['d'] || keysDown['right']
  const downPressed = keysDown['s'] || keysDown['down']
  const leftPressed = keysDown['a'] || keysDown['left']

  if((!GAME.gameState.started || hero.flags.isAdmin) && (keysDown['shift'] || keysDown['caps lock'])) {
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

  if(keysDown['z'] && hero.mod().tags.zButtonOnce != true && hero.mod().zButtonBehavior) {
    handleActionButtonBehavior(hero, hero.mod().zButtonBehavior, delta)
  }
  if(keysDown['x'] && hero.mod().tags.xButtonOnce != true && hero.mod().xButtonBehavior) {
    handleActionButtonBehavior(hero, hero.mod().xButtonBehavior, delta)
  }
  if(keysDown['c'] && hero.mod().tags.cButtonOnce != true && hero.mod().cButtonBehavior) {
    handleActionButtonBehavior(hero, hero.mod().cButtonBehavior, delta)
  }

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

  if(hero.mod().arrowKeysBehavior === 'angle') {
    if(typeof hero.angle !== 'number') hero.angle = 0
    if(typeof hero.velocityAngle !== 'number') hero.velocityAngle = 0

    if (upPressed) {
      hero.angle = angleTowardsDegree(hero.angle, window.degreesToRadians(0), delta)
    }
    if (downPressed) {
      // console.log(hero.angle, window.degreesToRadians(180))
      hero.angle = angleTowardsDegree(hero.angle, window.degreesToRadians(180), delta)
    }
    if (leftPressed) {
      hero.angle = angleTowardsDegree(hero.angle, window.degreesToRadians(270), delta)
    }
    if (rightPressed) {
      hero.angle = angleTowardsDegree(hero.angle, window.degreesToRadians(90), delta)
    }

    const angleCorrection = window.degreesToRadians(90)
    hero.velocityX = hero.velocityAngle * Math.cos(hero.angle - angleCorrection)
    hero.velocityY = hero.velocityAngle * Math.sin(hero.angle - angleCorrection)
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

      if (upPressed && !hero.mod().tags.disableUpKeyMovement) {
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
  if('e' === key || 'v' === key) {
    if(hero.dialogue && hero.dialogue.length) {
      hero.dialogue.shift()
      if(!hero.dialogue.length) {
        hero.flags.showDialogue = false
        hero.flags.paused = false
        hero.onGround = false
      }
      hero._cantInteract = true
      window.emitGameEvent('onUpdatePlayerUI', hero)
    }

    if(hero.cutscenes && hero.cutscenes.length) {
      hero.cutscenes.shift()
      if(!hero.cutscenes.length) {
        hero.flags.showCutscene = false
        hero.flags.paused = false
        hero.onGround = false
      }
      hero._cantInteract = true
      window.emitGameEvent('onUpdatePlayerUI', hero)
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
        if(GAME.gameState.timeoutsById[hero.id + '-floatable']) GAME.clearTimeout(hero.id + '-floatable')
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

// cool that I pulled this off put please remove someday
Object.defineProperty(Number.prototype, 'mod', { value: function(n) {
  return ((this % n) + n) % n;
}})

const oneEighty = window.degreesToRadians(180)
const threeSixty = window.degreesToRadians(360)
function angleTowardsDegree(current, goal, delta) {
  current = (current % threeSixty)
  let distance = goal - current

  const verySmallDistance = (distance < .1 && distance >= 0) || (distance <= 0 && distance > -.1)
  const altDistance = threeSixty - distance
  const wrappedAllAround = (altDistance < .1 && altDistance >= 0) || (altDistance <= 0 && altDistance > -.1)

  if(verySmallDistance || wrappedAllAround) {
    return goal
  }

  if(distance > oneEighty) {
    goal = -(threeSixty - goal)
  }

  if(distance < -oneEighty) {
    goal = threeSixty + goal
  }

  if(current < goal) return current + (1 * delta)
  if(current > goal) return current - (1 * delta)
}

export default {
  addCustomInputBehavior,
  setDefault,
  onPlayerIdentified,
  onUpdate,
  onKeyDown,
  onKeyUp,
}
