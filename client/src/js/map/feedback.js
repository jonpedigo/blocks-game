function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}


function draw(ctx) {
  if(GAME.heros[HERO.id].score < 0) {
    GAME.heros[HERO.id].score = 0
  }

  if(GAME.heros[HERO.id].lives < 0) {
    GAME.heros[HERO.id].lives = 0
  }
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'

  if(GAME.heros[HERO.id].flags.showScore) {
    ctx.fillStyle = 'white'
    ctx.font = "21px Courier New";
    ctx.fillText(pad(GAME.heros[HERO.id].score, 4), 18, 30)
  }

  if(GAME.heros[HERO.id].flags.showLives) {
    ctx.fillStyle = 'white'
    ctx.fillRect(20, 50, GAME.heros[HERO.id].width/3, GAME.heros[HERO.id].height/3)
    ctx.font = "16px Courier New";
    ctx.fillText('x' + GAME.heros[HERO.id].lives, 25 + GAME.heros[HERO.id].width/3, 50 + GAME.heros[HERO.id].height/3)
  }
}

export default {
  draw,
}
