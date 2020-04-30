function camera() {

  this.x = 0
  this.y = 0
  this.limitX = null
  this.limitY = null
  this.centerX = null
  this.centerY = null

this.setLimit = function(limitX = null, limitY = null, centerX = this.x, centerY = this.y) {
  this.centerX = centerX
  this.centerY = centerY

  this.limitX = limitX
  this.limitY = limitY
}

this.clearLimit = function() {
  this.centerX = null
  this.centerY = null

  this.limitX = null
  this.limitY = null
}

this.setHeroX = function (ctx, hero = HERO.hero) {
  this.x = (((hero.x + hero.width/2)*this.multiplier)) - window.playerCanvasWidth/2
}
this.setHeroY = function(ctx, hero = HERO.hero) {
  this.y = (((hero.y + hero.height/2)*this.multiplier)) - window.playerCanvasHeight/2
}


this.get = function(){
  return camera
}

this.set = function(ctx = window.ctx, hero = HERO.hero) {
  this.multiplier = hero.zoomMultiplier / window.canvasMultiplier
  if(hero.animationZoomMultiplier) this.multiplier = hero.animationZoomMultiplier / window.canvasMultiplier
  this.multiplier = 1/this.multiplier

  if (this.limitX) {
    const potentialX = ((hero.x + hero.width/2)*this.multiplier)

    // too late, more
    if(potentialX > ((((this.centerX + this.limitX)*this.multiplier)) - (window.playerCanvasWidth/2))) {
      this.x = (((this.centerX + this.limitX)*this.multiplier)) - window.playerCanvasWidth
    // too soon, less
  } else if (potentialX < ((((this.centerX - this.limitX)*this.multiplier)) + (window.playerCanvasWidth/2))) {
      this.x = (((this.centerX - this.limitX)*this.multiplier))
    } else {
      this.setHeroX(ctx, hero)
    }
  } else {
    this.setHeroX(ctx, hero)
  }

  if (this.limitY) {
    const potentialY = ((hero.y + hero.height/2)*this.multiplier)

    if (potentialY > ((((this.centerY + this.limitY)*this.multiplier))- (window.playerCanvasHeight/2))) {
      this.y = (((this.centerY + this.limitY)*this.multiplier)) - window.playerCanvasHeight
    } else if (potentialY < ((((this.centerY - this.limitY)*this.multiplier)) + (window.playerCanvasHeight/2))) {
      this.y = ((this.centerY - this.limitY)*this.multiplier)
    } else {
      this.setHeroY(ctx, hero)
    }
  } else {
    this.setHeroY(ctx, hero)
  }

}
}

export default camera
