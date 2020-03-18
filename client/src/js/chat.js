function drawChat(ctx, text){
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "20px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText(text, 200, ctx.canvas.height - 80);
}

const keysDown = {}
function init() {
	window.hero.chat = []
	window.hero.showChat = false
	
	window.addEventListener("keydown", function (e) {
		if(e.keyCode == '32'){
			window.hero.chat.shift()
			if(!window.hero.chat.length) {
				if(window.hero.chat.onChatEnd) window.hero.chat.onChatEnd()
				window.hero.showChat = false
				window.hero.paused = false
			}
		}
  }, false)
}

function render(ctx){
	if(window.hero.showChat){
		drawChat(ctx, window.hero.chat[0])
	}
}

export default {
	init,
	render
}
