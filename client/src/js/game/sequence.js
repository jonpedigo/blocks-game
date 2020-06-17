function startSequence(sequence, context) {
  const { pauseGame, items } = sequence
  if(pauseGame) {
    GAME.gameState.paused = true
  }

  sequence.mainObject = context.mainObject
  sequence.otherObject = context.otherObject
  sequence.remoteObject = context.remoteObject

  if(!GAME.gameState.sequenceQueue) GAME.gameState.sequenceQueue = []
  GAME.gameState.sequenceQueue.push(sequence)
}

function processSequence(sequence) {
  const item = sequence.items[0]

  if(item.type === 'dialogue') {
    //?
  }

  if(item.type === 'choice') {

  }
}

function endSequence(sequence) {
  const { pauseGame, items } = sequence

  if(pauseGame) {
    GAME.gameState.paused = false
  }
}
