const keysDown = {}
function init() {

}

function render(ctx){
	if(window.hero.flags.showChat){
		if(window.hero.chat.length) {
			drawChat(ctx, window.hero.chat)
		}
	}
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ');
  var line = '';

  for(var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = ctx.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
window.wrapText = wrapText

function drawChat(ctx, chat){
	//textbox
	ctx.fillStyle="rgba(255,255,255, 0.03)"
	ctx.fillRect(window.CONSTANTS.PLAYER_CANVAS_WIDTH/2 - (210 * window.canvasMultiplier), (210 * window.canvasMultiplier) , (420 * window.canvasMultiplier), 95 * window.canvasMultiplier)

	// //portrait
	// if(window.hero.chat.portrait){
	// 	//portrait outline
	// 	ctx.fillStyle="rgba(255,255,255,.1)"
	// 	ctx.fillRect(window.CONSTANTS.PLAYER_CANVAS_WIDTH/2 - 200, 140, 80, 70)
	//
	// 	if(Game.textSequence.portrait === 'ship'){
	// 		drawShip.down(window.CONSTANTS.PLAYER_CANVAS_WIDTH/2 - 183, 147, context, 25)
	// 	}else{
	// 		ctx.drawImage(IMAGES[Game.textSequence.portrait], window.CONSTANTS.PLAYER_CANVAS_WIDTH/2 - 198, 142, 76, 66)
	// 	}
	// }

	ctx.font =`24pt Arial`
	ctx.fillStyle="white"
	//portrait name
	if(chat.name) {
		ctx.fillText(chat.name ? chat.name : '???', window.CONSTANTS.PLAYER_CANVAS_WIDTH/2 - 110, 205)
	}

	//text
	ctx.fillStyle = "rgb(250, 250, 250)";
	let text = chat[0]
	ctx.font =`${18 * window.canvasMultiplier}pt Arial`
	wrapText(ctx, text, window.CONSTANTS.PLAYER_CANVAS_WIDTH/2 - (200 * window.canvasMultiplier), 240 * window.canvasMultiplier, 410 * window.canvasMultiplier, 25 * window.canvasMultiplier)

	// more text icon
	// if(chat.length > 1){
		let x = window.CONSTANTS.PLAYER_CANVAS_WIDTH/2
		ctx.fillRect(x - (25 * window.canvasMultiplier), 302.5 * window.canvasMultiplier, 50 * window.canvasMultiplier, 7 * window.canvasMultiplier)
	// }
	// ctx.fillStyle = "rgb(250, 250, 250)";
	// ctx.font = "20px Helvetica";
	// ctx.textAlign = "left";
	// ctx.textBaseline = "top";
	// ctx.fillText(text, 200, window.CONSTANTS.PLAYER_CANVAS_HEIGHT - 80);
}

export default {
	init,
	render
}
