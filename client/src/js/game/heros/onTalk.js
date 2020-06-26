export default function onTalk(hero, collider, result, options) {
  if(collider.id !== hero.lastDialogueId) {
    if(!options.fromInteractButton) hero.lastDialogueId = collider.id
    hero.dialogue = collider.mod().heroDialogue.slice()
    hero.flags.showDialogue = true
    hero.flags.paused = true
    if(collider.name) {
      hero.dialogueName = collider.mod().name
    } else {
      hero.dialogueName = null
    }
    if(collider.mod().tags['oneTimeTalker']) collider.tags['talker'] = false
    GAME.addOrResetTimeout(hero.id+'.lastDialogueId', 3, () => {
      hero.lastDialogueId = null
    })
  }
}
