let lastJump = 0

function onPageLoaded(){
  GAME.keysDown = {}
  // this is the one for the host
  GAME.heroInputs = {}

  window.addEventListener("keydown", function (e) {

    if(PAGE.role.isGhost) {
      if(HERO.hero.id === 'ghost') onKeyDown(e.keyCode, HERO.hero)
    } else if(PAGE.role.isPlayer) {
      if(!PAGE.typingMode) {
        GAME.keysDown[e.keyCode] = true
      }
      //locally update the host input! ( teehee this is the magic! )
      if(PAGE.role.isHost) {
        GAME.heroInputs[HERO.hero.id] = GAME.keysDown
        onKeyDown(e.keyCode, HERO.hero)
      } else {
        window.socket.emit('sendHeroKeyDown', e.keyCode, HERO.hero.id)
      }
    }
  }, false)

  window.addEventListener("keyup", function (e) {
	   delete GAME.keysDown[e.keyCode]
  }, false)
}

function onUpdate(hero, keysDown, delta) {
  if(hero.flags.paused) return

  /*
    left arrow	37
    up arrow	38
    right arrow	39
    down arrow	40
    w 87
    a 65
    s 83
    d 68
  */
  /// DEFAULT GAME FX
  if(hero.flags.paused || GAME.gameState.paused) return

  if (38 in keysDown) { // Player holding up
    if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accY -= (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityY -= (hero.speed) * delta;
    }
  }
  if (40 in keysDown) { // Player holding down
    if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accY += (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityY += (hero.speed) * delta;
    }
  }
  if (37 in keysDown) { // Player holding left
    if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accX -= (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityX -= (hero.speed) * delta;
    }
  }
  if (39 in keysDown) { // Player holding right
    if(hero.arrowKeysBehavior === 'acc' || hero.arrowKeysBehavior === 'acceleration') {
      hero.accX += (hero.speed) * delta;
    } else if (hero.arrowKeysBehavior === 'velocity') {
      hero.velocityX += (hero.speed) * delta;
    }
  }

  if(hero.arrowKeysBehavior === 'skating') {
    if(hero.inputDirection === 'up') {
      hero.y -= Math.ceil(hero.speed * delta);
    } else if(hero.inputDirection === 'down') {
      hero.y += Math.ceil(hero.speed * delta);
    } else if(hero.inputDirection === 'left') {
      hero.x -= Math.ceil(hero.speed * delta);
    } else if(hero.inputDirection === 'right') {
      hero.x += Math.ceil(hero.speed * delta);
    }
  }

  function positionInput() {

    if(hero.arrowKeysBehavior === 'flatDiagonal') {
      if(!hero.tags.gravity) {
        if (38 in keysDown && !hero.tags.gravity) { // Player holding up
          hero.velocityY = -Math.ceil(hero.speed * delta) * 100
        } else if (40 in keysDown) { // Player holding down
          hero.velocityY = Math.ceil(hero.speed * delta) * 100
        } else {
          hero.velocityY = 0
        }
      }

      if (37 in keysDown) { // Player holding left
        hero.velocityX = -Math.ceil(hero.speed * delta) * 100
      } else if (39 in keysDown) { // Player holding right
        hero.velocityX = Math.ceil(hero.speed * delta) * 100
      } else {
        hero.velocityX = 0
      }
    }

    if(hero.arrowKeysBehavior === 'flatRecent') {
      hero.velocityX = 0
      if(!hero.tags.gravity) {
        hero.velocityY = 0
      }

      if (38 in keysDown && hero.inputDirection == 'up' && !hero.tags.gravity) { // Player holding up
        hero.velocityY = -Math.ceil(hero.speed * delta) * 100
        return
      }

      if (40 in keysDown && hero.inputDirection == 'down') { // Player holding down
        hero.velocityY = Math.ceil(hero.speed * delta) * 100
        return
      }

      if (37 in keysDown && hero.inputDirection == 'left') { // Player holding left
        hero.velocityX = -Math.ceil(hero.speed * delta) * 100
        return
      }

      if (39 in keysDown && hero.inputDirection == 'right') { // Player holding right
        hero.velocityX = Math.ceil(hero.speed * delta) * 100
        return
      }

      if (38 in keysDown && !hero.tags.gravity) { // Player holding up
        hero.velocityY = -Math.ceil(hero.speed * delta) * 100
      }

      if (40 in keysDown) { // Player holding down
        hero.velocityY = Math.ceil(hero.speed * delta) * 100
      }

      if (37 in keysDown) { // Player holding left
        hero.velocityX = -Math.ceil(hero.speed * delta) * 100
      }

      if (39 in keysDown) { // Player holding right
        hero.velocityX = Math.ceil(hero.speed * delta) * 100
      }
    }
  }

  positionInput()
}

function onKeyDown(keyCode, hero) {
  if(hero.flags.typingMode) return

  if(32 === keyCode) {
    if(hero.chat.length) {
      hero.chat.shift()
      if(!hero.chat.length) {
        hero.flags.showChat = false
        hero.flags.paused = false
        hero.onGround = false
      }
    }
  }

  if(hero.flags.paused || GAME.gameState.paused) return

  if(32 === keyCode) {
    if(hero.onGround && hero.tags.gravity) {
      hero.velocityY = hero.jumpVelocity
      lastJump = Date.now();
    }
  }

  if(hero.arrowKeysBehavior === 'grid') {
    if (38 === keyCode) { // Player holding up
      hero.y -= GAME.grid.nodeSize
    } else if (40 === keyCode) { // Player holding down
      hero.y += GAME.grid.nodeSize
    } else if (37 === keyCode) { // Player holding left
      hero.x -= GAME.grid.nodeSize
    } else if (39 === keyCode) { // Player holding right
      hero.x += GAME.grid.nodeSize
    }
  }

  if (38 === keyCode) { // Player holding up
    hero.inputDirection = 'up'
  }
  if (40 === keyCode) { // Player holding down
    hero.inputDirection = 'down'
  }
  if (37 === keyCode) { // Player holding left
    hero.inputDirection = 'left'
  }
  if (39 === keyCode) { // Player holding right
    hero.inputDirection = 'right'
  }

  window.local.on('onKeyDown', keyCode, hero)
}

export default {
  onPageLoaded,
  onUpdate,
  onKeyDown,
}
