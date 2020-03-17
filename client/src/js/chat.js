function drawChat(ctx, text){
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "20px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText(text, 200, ctx.canvas.height - 80);
}

window.currentChat = []
window.showChat = false

const keysDown = {}
function init() {
	window.addEventListener("keydown", function (e) {
		if(e.keyCode == '32'){
			window.currentChat.shift()
			if(!window.currentChat.length) {
				if(window.currentChat.onChatEnd) window.currentChat.onChatEnd()
				window.showChat = false
				window.hero.paused = false
			}
		}
  }, false)
}

function render(ctx){
	if(window.showChat){
		drawChat(ctx, window.currentChat[0])
	}
}

export default {
	init,
	render
}
