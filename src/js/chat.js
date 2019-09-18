function drawChat(ctx, text){
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "20px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText(text, 200, ctx.canvas.height - 80);
}

function start() {

}

function update(){

}

function render(ctx, flags){

	if(flags.showChat){
		// Score
		drawChat(ctx, 'you hit me')
	}
}

export default {
	start,
	update,
	render
}
