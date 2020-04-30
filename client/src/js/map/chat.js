const keysDown = {}

function render(ctx, hero){
	if(HERO.hero.flags.showChat){
		if(HERO.hero.chat.length) {
			drawChat(ctx, HERO.hero.chat)
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
	ctx.fillStyle="rgba(255,255,255, 0.1)"
	ctx.fillRect(MAP.canvas.width/2 - (210 * MAP.canvasMultiplier), (210 * MAP.canvasMultiplier) , (420 * MAP.canvasMultiplier), 95 * MAP.canvasMultiplier)

	// //portrait
	// if(HERO.hero.chat.portrait){
	// 	//portrait outline
	// 	ctx.fillStyle="rgba(255,255,255,.1)"
	// 	ctx.fillRect(MAP.canvas.width/2 - 200, 140, 80, 70)
	//
	// 	if(Game.textSequence.portrait === 'ship'){
	// 		drawShip.down(MAP.canvas.width/2 - 183, 147, context, 25)
	// 	}else{
	// 		ctx.drawImage(IMAGES[Game.textSequence.portrait], MAP.canvas.width/2 - 198, 142, 76, 66)
	// 	}
	// }

	ctx.textAlign = 'start'
	ctx.textBaseline = 'alphabetic'
	ctx.font =`${18 * MAP.canvasMultiplier}pt Arial`
	ctx.fillStyle="white"
	//portrait name
	if(HERO.hero.chatName) {
		ctx.fontWeight = "normal"
		let x = MAP.canvas.width/2
		ctx.fillText(HERO.hero.chatName, MAP.canvas.width/2 - (210 * MAP.canvasMultiplier), (210 * MAP.canvasMultiplier) )
	}

	//text
	ctx.fontWeight = "normal"
	ctx.fillStyle = "rgb(250, 250, 250)";
	let text = chat[0]
	ctx.font =`${18 * MAP.canvasMultiplier}pt Courier New`
	wrapText(ctx, text, MAP.canvas.width/2 - (200 * MAP.canvasMultiplier), 240 * MAP.canvasMultiplier, 410 * MAP.canvasMultiplier, 25 * MAP.canvasMultiplier)

	// more text icon
	// if(chat.length > 1){
		let x = MAP.canvas.width/2
		ctx.fillRect(x - (25 * MAP.canvasMultiplier), 302.5 * MAP.canvasMultiplier, 50 * MAP.canvasMultiplier, 7 * MAP.canvasMultiplier)
	// }
	// ctx.fillStyle = "rgb(250, 250, 250)";
	// ctx.font = "20px Helvetica";
	// ctx.textAlign = "left";
	// ctx.textBaseline = "top";
	// ctx.fillText(text, 200, MAP.canvas.height - 80);
}

export default {
	render
}
