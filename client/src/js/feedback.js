let score = 0;

function draw(ctx) {
  ctx.font = "30px Arial";
  ctx.strokeText(score, 10,30)
}

function addScore(amount) {
  score += amount
}

export default {
  draw,
  addScore,
}
