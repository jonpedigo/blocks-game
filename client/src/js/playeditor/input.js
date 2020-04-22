const keysDown = {}
window.keysDown = {}

let justChangedHerosLeft = false
let justChangedHerosRight = false

function init(hero){
  window.addEventListener("keydown", function (e) {
    if([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
    }

    delete keysDown['83']
    delete keysDown['67']
    keysDown[e.keyCode] = true

    //if you press escape, cancel a drag
    if(e.keyCode === 27) {
      window.clickStart.x = null
      window.clickStart.y = null
      window.gridHighlight = null
      window.childObjectGroup = null

      if(window.currentTool === window.TOOLS.CUSTOM_GAME) {
        window.onChangeTool(window.TOOLS.ADD_OBJECT)
      }
    }

    if(keysDown['18']) {
      if(keysDown['32']){
        console.log('x: ' + window.mousePos.x, ', y: ' + window.mousePos.y)
        return
      }

      //s
      if(keysDown['83']){
        if(window.currentTool === window.TOOLS.CUSTOM_GAME) {
          window.saveCodeEditor()
          document.getElementById("is-code-editor-saved").innerHTML = "Saved"
        } else if((window.currentTool === window.TOOLS.ADD_OBJECT || window.currentTool == window.TOOLS.SIMPLE_EDITOR)) {
          let editorState = window.objecteditor.get()
          if(editorState.id && !editorState.parent) {
            let update = editorState
            window.removeObjectState(update)
            window.sendObjectUpdateOther(update)
          } else if(editorState.compendiumId){
            window.saveCompendiumObject(window.objecteditor.get())
          }

        }
        e.preventDefault()
      }

      //c
      if(keysDown['67']){
        if(window.currentTool === window.TOOLS.ADD_OBJECT || window.currentTool == window.TOOLS.SIMPLE_EDITOR) {
          window.addToCompendium(window.objecteditor.get())
        }
      }

      //n
      if(keysDown['78']){
        let oe = window.objecteditor.get()
        window.openNameObjectModal(oe, (result) => {
          if(result.value[0] && result.value[0].length) {
            oe.name = result.value[0]
            if(result.value[1]) oe.nameCenter = true
            if(result.value[2]) oe.nameAbove = true
            window.objecteditor.saved = false
            window.objecteditor.update(oe)
            window.updateObjectEditorNotifier()
          }
        })
        e.preventDefault()
      }

      //n
      if(keysDown['66']){
        let oe = window.objecteditor.get()
        window.openWriteChatModal(oe, (result) => {
          if(result.value && result.value.length) {
            oe.tags.chatter = true
            oe.heroUpdate = {
              chat: [result.value],
              flags : {
                showChat: true,
                paused: true,
              }
            }
            window.objecteditor.saved = false
            window.objecteditor.update(oe)
            window.updateObjectEditorNotifier()
          }
        })
        e.preventDefault()
      }

      // q and a zoom in and out
      if(e.keyCode === 81) {
        window.scaleMultiplier = window.scaleMultiplier * 1.1
      }
      if(e.keyCode === 65) {
        window.scaleMultiplier = window.scaleMultiplier * .9
      }

      //, .
      if(keysDown['188'] || keysDown['190']){
        if(Object.keys(w.editingGame.heros).length === 1 || !window.editingHero.id) {
          for(var heroId in w.editingGame.heros) {
            window.setEditingHero(w.editingGame.heros[heroId])
            window.findHero()
          }
          return
        }
      }

      //select left
      if(keysDown['188']){
        let heroNames = Object.keys(w.editingGame.heros)
        for(let i = 0; i < heroNames.length; i++) {
          // console.log(w.editingGame.heros[heroNames[i]].id, window.editingHero.id, i)
          if(w.editingGame.heros[heroNames[i]].id === window.editingHero.id) {
            if(i === 0) {
              console.log(i, heroNames.length-1)
              console.log(w.editingGame.heros[heroNames[heroNames.length-1]])
              window.setEditingHero(w.editingGame.heros[heroNames[heroNames.length-1]])
            } else {
              window.setEditingHero(w.editingGame.heros[heroNames[i-1]])
            }
            window.findHero()

            break;
          }
        }
        return
      }

      //select right
      if(keysDown['190']){
        let heroNames = Object.keys(w.editingGame.heros)
        for(let i = 0; i < heroNames.length; i++) {
          if(w.editingGame.heros[heroNames[i]].id === window.editingHero.id) {
            if(i === heroNames.length - 1) {
              window.setEditingHero(w.editingGame.heros[heroNames[0]])
            } else {
              window.setEditingHero(w.editingGame.heros[heroNames[i+1]])
            }
            window.findHero()

            break;
          }
        }
        return
      }

      // right
      if(keysDown['222']){
        let editorState = window.objecteditor.get()

        if(w.editingGame.objects.length == 0) return
        let newI = editorState.i
        if(editorState.i === w.editingGame.objects.length -1 || editorState.i == null) {
          newI = 0
        } else {
          newI += 1
        }
        let editingObject = w.editingGame.objects[newI]
        editingObject.i = newI
        window.objecteditor.saved = true
        window.objecteditor.update(editingObject)
        window.updateObjectEditorNotifier()
        window.findObject(editingObject)
      }

      //left
      if(keysDown['186']){
        let editorState = window.objecteditor.get()
        if(w.editingGame.objects.length == 0) return
        let newI = editorState.i
        if(!editorState.i) {
          newI = w.editingGame.objects.length - 1
        } else {
          newI -= 1
        }
        let editingObject = w.editingGame.objects[newI]
        editingObject.i = newI
        window.objecteditor.saved = true
        window.objecteditor.update(editingObject)
        window.updateObjectEditorNotifier()
        window.findObject(editingObject)
      }
    }

  }, false)

  window.addEventListener("keyup", function (e) {
     delete keysDown[e.keyCode]
  }, false)
}

function update(delta) {
  if (38 in keysDown) { // Player holding up
    window.camera.y -= (40 * window.scaleMultiplier)
  }
  if (40 in keysDown) { // Player holding down
    window.camera.y += (40 * window.scaleMultiplier)
  }
  if (37 in keysDown) { // Player holding left
    window.camera.x -= (40 * window.scaleMultiplier)
  }
  if (39 in keysDown) { // Player holding right
    window.camera.x += (40 * window.scaleMultiplier)
  }
}

export default {
  init,
  update,
}
