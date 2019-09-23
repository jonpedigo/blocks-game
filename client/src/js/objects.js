const objects = [
{
  color: "grey",
  height: 196.66666666666669,
  name: "road",
  width: 1313.3333333333335,
  x: 2593.3333333333335,
  y: 453.33333333333337,
},
{"name":"road-2","width":1333.3333333333335,"height":176.66666666666669,"x":2606.666666666667,"y":1070,"color":"grey"},
{"name":"road-connecter-1","width":83.33333333333334,"height":420,"x":2983.3333333333335,"y":650,"color":"grey"},
{"name":"road-connecter-2","width":83.33333333333334,"height":420,"x":3583.3333333333335,"y":650,"color":"grey"},
{"name":"road-to-town","width":-1680,"height":198.33333333333334,"x":2600,"y":453.33333333333337,"color":"grey"},
{"name":"hellojhios OK","width":-626.6666666666667,"height":86.66666666666667,"x":913.3333333333334,"y":513.3333333333334,"color":"grey"},{"name":"","width":80,"height":506.6666666666667,"x":206.66666666666669,"y":526.6666666666667,"color":"grey"},{"name":"","width":586.6666666666667,"height":80,"x":303.33333333333337,"y":836.6666666666667,"color":"grey"},{"name":"","width":90,"height":330,"x":836.6666666666667,"y":860,"color":"grey"},{"name":"","width":-556.6666666666667,"height":-40,"x":916.6666666666667,"y":1196.6666666666667,"color":"grey"},{"name":"","width":493.33333333333337,"height":53.333333333333336,"x":336.6666666666667,"y":1120,"color":"grey"},{"name":"","width":-536.6666666666667,"height":-60,"x":850,"y":1180,"color":"grey"},{"name":"","width":43.333333333333336,"height":10,"x":323.33333333333337,"y":1173.3333333333335,"color":"grey"},

{"name":"road-00","width":-806.6666666666667,"height":30,"x":2613.3333333333335,"y":1133.3333333333335,"color":"grey"},
{"name":"makeoutpoint","width":86.66666666666667,"height":63.333333333333336,"x":1730,"y":1113.3333333333335,"color":"#154880 ","obstacle":true},
/// houses

{"name":"jeffreyestate","width":310,"height":210,"x":3570,"y":223.33333333333334,"color":"#cb4154","obstacle":true},{"name":"pedigoabode","width":310,"height":190,"x":3130,"y":246.66666666666669,"color":"#cb4154","obstacle":true},{"name":"gabeterrace","width":343.33333333333337,"height":193.33333333333334,"x":2650,"y":256.6666666666667,"color":"#cb4154","obstacle":true},{"name":"theslickcabin","width":96.66666666666667,"height":66.66666666666667,"x":3780,"y":986.6666666666667,"color":"#cb4154","obstacle":true},{"name":"susanscove","width":156.66666666666669,"height":133.33333333333334,"x":3390,"y":910,"color":"#cb4154","obstacle":true},{"name":"ericsloft","width":186.66666666666669,"height":96.66666666666667,"x":3116.666666666667,"y":936.6666666666667,"color":"#cb4154","obstacle":true},{"name":"jenniferscrashpad","width":316.6666666666667,"height":190,"x":2626.666666666667,"y":863.3333333333334,"color":"#cb4154","obstacle":true},


// town

{"name":"motel","width":143.33333333333334,"height":96.66666666666667,"x":736.6666666666667,"y":403.33333333333337,"color":"#154880 ","obstacle":true},{"name":"gas-station","width":103.33333333333334,"height":66.66666666666667,"x":606.6666666666667,"y":423.33333333333337,"color":"#154880 ","obstacle":true},{"name":"bar","width":183.33333333333334,"height":86.66666666666667,"x":393.33333333333337,"y":400,"color":"#154880 ","obstacle":true},{"name":"school","width":146.66666666666669,"height":400,"x":200,"y":76.66666666666667,"color":"#154880 ","obstacle":true},{"name":"cafe","width":133.33333333333334,"height":83.33333333333334,"x":323.33333333333337,"y":736.6666666666667,"color":"#154880 ","obstacle":true},{"name":"rivalcafe","width":150,"height":66.66666666666667,"x":493.33333333333337,"y":746.6666666666667,"color":"#154880 ","obstacle":true},{"name":"townhall","width":16.666666666666668,"height":96.66666666666667,"x":763.3333333333334,"y":730,"color":"#154880 ","obstacle":true},{"name":"watchtower","width":116.66666666666667,"height":136.66666666666669,"x":340,"y":973.3333333333334,"color":"#154880 ","obstacle":true},{"name":"haberdashery","width":83.33333333333334,"height":86.66666666666667,"x":500,"y":1023.3333333333334,"color":"#154880 ","obstacle":true},{"name":"generalstore","width":126.66666666666667,"height":76.66666666666667,"x":623.3333333333334,"y":1030,"color":"#154880 ","obstacle":true},{"name":"","width":256.6666666666667,"height":190,"x":960,"y":906.6666666666667,"color":"#154880 ","obstacle":true},

{"name":"","width":10,"height":63.33333333333332,"x":3179.9999999999973,"y":518.8888888888889,"color":"white","obstacle":true},
{"name":"","width":16.666666666666856,"height":120,"x":3040.000000000001,"y":476.6666666666667,"color":"white","obstacle":true},
];

objects.push({
	width: 50,
	height: 50,
	obstacle: true,
	onCollide: () => {
    flags.showChat = true

    flags.heroPaused = true
    current.chat = [
      ["They call me unstoppable joe because I kind"],
      ["of have a reputation around here."],
      ["I’ve never been beaten in a fight"],
      ["Because I am both strong and agile."],
      ["What’s that, punk? You don’t believe me!?"],
      ["You think you have what it takes?"],
      ["Hope you like delis..."],
      ["cuz I’m about to give you a knuckle sandwich"],
      ["extra ham"]
    ]
    current.chat.onChatEnd = function(){
      battle.start(game, 20, 1000)
    }
  },
  x: 3290 , y: 580,
  name: 'unstoppable joe',
})

export default objects
