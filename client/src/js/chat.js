function drawChat(ctx, text){
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "20px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText(text, 200, ctx.canvas.height - 80);
}

const keysDown = {}
function init(current, flags) {
	window.addEventListener("keydown", function (e) {
		if(e.keyCode == '32'){
			current.chat.shift()
			if(!current.chat.length) {
				if(current.chat.onChatEnd) current.chat.onChatEnd()
				flags.showChat = false
				flags.heroPaused = false
			}
		}
  }, false)
}

function update(currentChat){
	// if(keysDown['32']){
	// 	currentChat.shift()
  // }
}

function render(ctx, flags, currentChat){

	if(flags.showChat){
		// Score
		drawChat(ctx, currentChat[0][0])
	}
}

export default {
	init,
	update,
	render
}
