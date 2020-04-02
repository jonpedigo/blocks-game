import camera from './camera'

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

function init() {
  window.hero.score = 0;
  window.hero.flags.showScore = false
}

function draw(ctx) {
  if(window.hero.score < 0) {
    window.hero.score = 0
  }

  if(window.hero.lives < 0) {
    window.hero.lives = 0
  }

  if(window.hero.flags.showScore) {
    ctx.font = "21px Courier New";
    ctx.fillText(pad(window.hero.score, 4), 18, 30)
  }

  if(window.hero.flags.showLives) {
    ctx.fillStyle = 'white'
    ctx.fillRect(20, 50, window.hero.width/3, window.hero.height/3)
    ctx.font = "16px Courier New";
    ctx.fillText('x' + window.hero.lives, 25 + window.hero.width/3, 50 + window.hero.height/3)
  }
}

export default {
  init,
  draw,
}
