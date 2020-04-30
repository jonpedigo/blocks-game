function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}


function draw(ctx) {
  if(HERO.hero.score < 0) {
    HERO.hero.score = 0
  }

  if(HERO.hero.lives < 0) {
    HERO.hero.lives = 0
  }
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'

  if(HERO.hero.flags.showScore) {
    ctx.fillStyle = 'white'
    ctx.font = "21px Courier New";
    ctx.fillText(pad(HERO.hero.score, 4), 18, 30)
  }

  if(HERO.hero.flags.showLives) {
    ctx.fillStyle = 'white'
    ctx.fillRect(20, 50, HERO.hero.width/3, HERO.hero.height/3)
    ctx.font = "16px Courier New";
    ctx.fillText('x' + HERO.hero.lives, 25 + HERO.hero.width/3, 50 + HERO.hero.height/3)
  }
}

export default {
  draw,
}
