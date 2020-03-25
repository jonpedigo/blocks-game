function init() {
  window.hero.score = 0;
  window.hero.flags.showScore = false
}

function draw(ctx) {
  if(window.hero.flags.showScore) {
    ctx.font = "30px Arial";
    ctx.fillText(window.hero.score, 10,30)
  }
}

export default {
  init,
  draw,
}
