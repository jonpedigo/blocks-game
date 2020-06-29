function camera() {
  this.x = 0
  this.y = 0
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
    this.x = (((hero.x + hero.width/2)*this.multiplier)) - MAP.canvas.width/2
  }
  this.setHeroY = function(hero = GAME.heros[HERO.id]) {
    this.y = (((hero.y + hero.height/2)*this.multiplier)) - MAP.canvas.height/2
  }


  this.get = function(){
    return camera
  }

  this.set = function(hero) {
    this.multiplier = hero.zoomMultiplier / MAP.canvasMultiplier

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

    if (this.limitX !== null && this.limitX >= 0) {
      const potentialX = ((hero.x + hero.width/2)*this.multiplier)
      if(potentialX > ((((this.centerX + this.limitX)*this.multiplier)) - (MAP.canvas.width/2))) {
        this.x = (((this.centerX + this.limitX)*this.multiplier)) - MAP.canvas.width
        this.hasHitLimit = true
      } else if (potentialX < ((((this.centerX - this.limitX)*this.multiplier)) + (MAP.canvas.width/2))) {
        this.x = (((this.centerX - this.limitX)*this.multiplier))
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
        this.y = (((this.centerY + this.limitY)*this.multiplier)) - MAP.canvas.height
        this.hasHitLimit = true
      } else if (potentialY < ((((this.centerY - this.limitY)*this.multiplier)) + (MAP.canvas.height/2))) {
        this.y = ((this.centerY - this.limitY)*this.multiplier)
        this.hasHitLimit = true
      } else {
        this.setHeroY(hero)
      }
    } else {
      this.setHeroY(hero)
    }
  }
}

export default camera
