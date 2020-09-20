const mongoose = require("mongoose")
const Schema = mongoose.Schema

// const GameItemSchema = new Schema({
//   name: { type: String, required: true, unique: true },
//   flags: { type: Object, required: true, default : {} },
//   tags: { type: Array, required: true, default : [] },
// })

const GameSchema = new Schema({
  itemList: { type: [], default: [] },
  deadItemList: { type: [], default: [] },
  logs: { type: Array },
}, {
  usePushEach: true
})

const GameState = mongoose.model("GameState", GameSchema)

module.exports = GameState
