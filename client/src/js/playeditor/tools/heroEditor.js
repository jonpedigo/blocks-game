import heroModifiers from '../../arcade/default/compendium/heroCompendium.js'
import camera from '../camera.js'
import collisions from '../../utils/collisions'
import gridTool from '../../utils/grid.js'
import JSONEditor from 'jsoneditor'

function init() {
  window.editingHero = {
    id: null,
  }
  var herojsoneditor = document.createElement("div")
  herojsoneditor.id = 'herojsoneditor'
  document.getElementById('tool-'+TOOLS.HERO_EDITOR).appendChild(herojsoneditor);
  w.heroeditor = new JSONEditor(herojsoneditor, { modes: ['tree', 'code'], search: false, onChangeJSON: (object) => {
    if(window.editingGame.branch) {
      w.editingGame.hero = object
    } else {
      sendHeroUpdate({ tags: object.tags, flags: object.flags })
    }
  }});

  let el =document.getElementsByClassName("hero-modifier-select");  // Find the elements
  for(var i = 0; i < el.length; i++){
    for(let modifierName in heroModifiers) {
      let modEl = document.createElement('button')
      modEl.innerHTML = modifierName
      modEl.onclick= function() {
        if(window.currentTool === window.TOOLS.HERO_EDITOR) {
          let editorState = window.objecteditor.get()
          window.objecteditor.update( window.mergeDeep( editorState, JSON.parse(JSON.stringify(heroModifiers[modifierName])) ) )
          sendHeroUpdate(heroModifiers[modifierName])
        } else {
          let heroMod = heroModifiers[modifierName]
          let editorState = window.objecteditor.get()
          window.objecteditor.saved = false
          if(heroMod.objectMod) {
            window.objecteditor.update( window.mergeDeep( editorState, heroMod.objectMod, { heroUpdate: JSON.parse(JSON.stringify(heroMod.update)) } ) )
          } else {
            window.objecteditor.update( window.mergeDeep( editorState, { tags: { heroUpdate: true }}, { heroUpdate: JSON.parse(JSON.stringify(heroMod)) } ) )
          }
          window.updateObjectEditorNotifier()
        }
      }
      el[i].appendChild(modEl)
    }
  }

  var sendHeroButton = document.getElementById("send-hero")
  sendHeroButton.addEventListener('click', sendEditorHeroOther)
  var sendHeroPosButton = document.getElementById("send-hero-pos")
  sendHeroPosButton.addEventListener('click', sendEditorHeroPos)
  var findHeroButton = document.getElementById("find-hero");
  findHeroButton.addEventListener('click', () => {
    window.findHero()
  })
  var respawnHeroButton = document.getElementById("respawn-hero");
  respawnHeroButton.addEventListener('click', respawnHero)
  var resetHeroButton = document.getElementById("reset-hero");
  resetHeroButton.addEventListener('click', resetHeroToDefault)
  var deleteButton = document.getElementById("delete-hero");
  deleteButton.addEventListener('click', () => {
    window.socket.emit('deleteHero', window.editingHero.id)
  })

  window.clickToSetHeroSpawnToggle = document.getElementById('click-to-set-spawn-hero')
  window.clickToSetHeroParentToggle = document.getElementById('click-to-set-parent-hero')
  window.clickToSetHeroRelativeToggle = document.getElementById('click-to-set-relative-hero')

  window.syncHeroToggle = document.getElementById('sync-hero')
  window.syncHeroToggle.onclick = (e) => {
    if(e.srcElement.checked) {
      window.socket.emit('updateWorld', { syncHero: true })
    } else {
      window.socket.emit('updateWorld', { syncHero: false })
    }
  }
  var zoomOutButton = document.getElementById("hero-zoomOut");
  zoomOutButton.addEventListener('click', () => window.socket.emit('editHero', { id: window.editingHero.id, zoomMultiplier: window.editingHero.zoomMultiplier + .1250 }))
  var zoomInButton = document.getElementById("hero-zoomIn");
  zoomInButton.addEventListener('click', () => window.socket.emit('editHero', { id: window.editingHero.id, zoomMultiplier: window.editingHero.zoomMultiplier - .1250 }))

  function sendHeroUpdate(update) {
    if(window.editingGame.branch) {
      window.mergeDeep(window.editingHero, update)
      window.mergeDeep(w.editingGame.heros[window.editingHero.id], update)
    } else {
      window.socket.emit('editHero', { id: window.editingHero.id, ...update})
    }
  }
  window.sendHeroUpdate = sendHeroUpdate

  function sendEditorHeroOther(update) {
    // get the hero from the editor, everything except for the x, y values
    let hero = w.heroeditor.get()
    const heroCopy = Object.assign({}, hero)
    delete heroCopy.x
    delete heroCopy.y
    if(window.editingGame.branch) {
      window.mergeDeep(w.editingGame.heros[heroCopy.id], heroCopy)
    } else {
      window.socket.emit('editHero', heroCopy)
    }
  }

  function sendEditorHeroPos() {
    let hero = w.heroeditor.get()
    if(window.editingGame.branch) {
      window.mergeDeep(w.editingGame.heros[hero.id], { id: hero.id, x: hero.x, y: hero.y })
    } else {
      window.socket.emit('editHero', { id: hero.id, x: hero.x, y: hero.y })
    }
  }

  function respawnHero() {
    if(window.editingGame.branch) {
      window.respawnHero(window.editingHero)
    } else {
      window.socket.emit('respawnHero', window.editingHero)
    }
    // let hero = heroeditor.get()
    // window.socket.emit('updateHero', { id: hero.id, x: hero.spawnPointX, y: hero.spawnPointY })
  }
  function resetHeroToDefault() {
    if(window.editingGame.branch) {
      window.editingHero = window.resetHeroToDefault(window.editingHero)
      window.editingGame.heros[window.editingHero.id] = window.editingHero
    } else {
      window.socket.emit('resetHeroToDefault', window.editingHero)
    }
  }

  window.setEditingHero = function(hero) {
    window.editingHero = hero
    w.heroeditor.update(window.editingHero)
    w.heroeditor.expandAll()
  }

  window.getEditingHero = function() {
    w.heroeditor.update(w.editingGame.heros[window.editingHero.id])
    w.heroeditor.expandAll()
  }

  window.findHero = function() {
    camera.setCamera(ctx, w.editingGame.heros[window.editingHero.id])
  }

  window.setEditorToAnyHero = function () {
    // init to any hero
    if(w.editingGame.heros.undefined) {
      window.socket.emit('deleteHero', 'undefined')
      delete w.editingGame.heros.undefined
    }

    if(w.editingGame.heros.null) {
      window.socket.emit('deleteHero', 'null')
      delete w.editingGame.heros.null
    }

    for(var heroId in w.editingGame.heros) {
      if(w.editingGame.heros[heroId].tags && w.editingGame.heros[heroId].tags.isPlayer) {
        window.setEditingHero(w.editingGame.heros[heroId])
        break;
      }
    }
  }

}

function loaded() {
  if(w.editingGame.world.syncHero) {
    window.syncHeroToggle.checked = true;
  }
}

export default {
  init
}
