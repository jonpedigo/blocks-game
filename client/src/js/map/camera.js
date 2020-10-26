function camera() {
  this.x = null
  this.y = null
  this.targetX = 0
  this.targetY = 0
  this.tweenToTarget = true
  this.tweenSpeed = 2
  this.limitX = null
  this.limitY = null
  this.centerX = null
  this.centerY = null
  this.hasHitLimit = false
  this.allowOcclusion = true

  this.setLimit = function(limitX = null, limitY = null, centerX = this.x, centerY = this.y) {
    this.centerX = centerX
    this.centerY = centerY

    this.limitX = limitX
    this.limitY = limitY
  }

  this.setLimitRect = function({ x, y, width, height }) {
    this.centerX = x + width/2
    this.centerY = y + height/2
    this.limitX = width/2
    this.limitY = height/2
  }

  this.clearLimit = function() {
    this.centerX = null
    this.centerY = null

    this.limitX = null
    this.limitY = null
  }

  this.setHeroX = function (hero = GAME.heros[HERO.id]) {
    this.targetX = (((hero.x + hero.width/2)*this.multiplier)) - MAP.canvas.width/2
  }
  this.setHeroY = function(hero = GAME.heros[HERO.id]) {
    this.targetY = (((hero.y + hero.height/2)*this.multiplier)) - MAP.canvas.height/2
  }


  this.get = function(){
    return camera
  }

  this.set = function(hero) {
    let editorZoom = EDITOR.preferences.zoomMultiplier
    if(GAME.gameState.started && !PAGE.role.isAdmin) editorZoom = 0

    let multiplier = (editorZoom + hero.zoomMultiplier)
    if(multiplier == 0) multiplier = .2
    this.multiplier =  multiplier / MAP.canvasMultiplier

    if(hero.animationZoomMultiplier) {
      this.multiplier = hero.animationZoomMultiplier / MAP.canvasMultiplier
      this.multiplier = 1/this.multiplier
      this.allowOcclusion = false
      this.setHeroX(hero)
      this.setHeroY(hero)
      // dont trap on zoom animation...
      return
    } else {
      this.allowOcclusion = true
    }

    this.multiplier = 1/this.multiplier
    this.hasHitLimit = false

    if(editorZoom > 0 || editorZoom < 0){
      this.setHeroX(hero)
      this.setHeroY(hero)
      return
    }

    if (this.limitX !== null && this.limitX >= 0) {
      const potentialX = ((hero.x + hero.width/2)*this.multiplier)
      if(potentialX > ((((this.centerX + this.limitX)*this.multiplier)) - (MAP.canvas.width/2))) {
        this.targetX = (((this.centerX + this.limitX)*this.multiplier)) - MAP.canvas.width
        this.hasHitLimit = true
      } else if (potentialX < ((((this.centerX - this.limitX)*this.multiplier)) + (MAP.canvas.width/2))) {
        this.targetX = (((this.centerX - this.limitX)*this.multiplier))
        this.hasHitLimit = true
      } else {
        this.setHeroX(hero)
      }
    } else {
      this.setHeroX(hero)
    }

    if (this.limitY !== null && this.limitY >= 0) {
      const potentialY = ((hero.y + hero.height/2)*this.multiplier)

      if (potentialY > ((((this.centerY + this.limitY)*this.multiplier))- (MAP.canvas.height/2))) {
        this.targetY = (((this.centerY + this.limitY)*this.multiplier)) - MAP.canvas.height
        this.hasHitLimit = true
      } else if (potentialY < ((((this.centerY - this.limitY)*this.multiplier)) + (MAP.canvas.height/2))) {
        this.targetY = ((this.centerY - this.limitY)*this.multiplier)
        this.hasHitLimit = true
      } else {
        this.setHeroY(hero)
      }
    } else {
      this.setHeroY(hero)
    }
  }

  this.shake = function() {
    if(this.xShake && this.xShake.isShaking) {
      this.x -= this.xShake.amplitude() * this.shakeAmplitude
    }
    if(this.yShake && this.yShake.isShaking) {
      this.y -= this.yShake.amplitude() * this.shakeAmplitude
    }
  }

  function easeInOutQuad(t, b, c, d) {
      t /= d/2;
      if (t < 1) return c/2*t*t + b;
      t--;
      return -c/2 * (t*(t-2) - 1) + b;
  };

  this.update = function(hero, delta) {
    const cameraTweenSpeedX = hero.cameraTweenSpeed + hero.cameraTweenSpeedXExtra
    if(hero.cameraTweenToTargetX && typeof this.x == 'number') {
      const distanceX = this.targetX - this.x
      this.x += (distanceX) * delta * cameraTweenSpeedX
    } else {
      this.x = this.targetX
    }

    const cameraTweenSpeedY = hero.cameraTweenSpeed + hero.cameraTweenSpeedYExtra
    if(hero.cameraTweenToTargetY && typeof this.y == 'number') {
      const distanceY = this.targetY - this.y
      this.y += (distanceY) * delta * cameraTweenSpeedY
    } else {
      this.y = this.targetY
    }

    this.shake()
  }
}

export default camera
