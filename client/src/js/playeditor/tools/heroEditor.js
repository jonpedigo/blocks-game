import heroModifiers from '../../games/default/compendium/heroCompendium.js'
import camera from '../camera.js'
import collisions from '../../collisions'
import gridTool from '../../grid.js'
import JSONEditor from 'jsoneditor'

function init() {
  window.editingHero = {
    id: null,
  }
  var herojsoneditor = document.createElement("div")
  herojsoneditor.id = 'herojsoneditor'
  document.getElementById('tool-'+TOOLS.HERO_EDITOR).appendChild(herojsoneditor);
  window.heroeditor = new JSONEditor(herojsoneditor, { modes: ['tree', 'code'], search: false, onChangeJSON: (object) => {
    // this is what sync should mean. Does every edit send immediately?
    sendHeroUpdate({ tags: object.tags, flags: object.flags })
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
          let editorState = window.objecteditor.get()
          window.objecteditor.saved = false
          window.objecteditor.update( window.mergeDeep( editorState, { tags: { heroUpdate: true }}, { heroUpdate: JSON.parse(JSON.stringify(heroModifiers[modifierName])) } ) )
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
  window.syncHeroToggle = document.getElementById('sync-hero')
  window.syncHeroToggle.onclick = (e) => {
    if(e.srcElement.checked) {
      window.socket.emit('updateWorld', { syncHero: true })
    } else {
      window.socket.emit('updateWorld', { syncHero: false })
    }
  }
  var zoomOutButton = document.getElementById("hero-zoomOut");
  zoomOutButton.addEventListener('click', () => window.socket.emit('updateHero', { id: window.editingHero.id, zoomMultiplier: window.editingHero.zoomMultiplier + .0625 }))
  var zoomInButton = document.getElementById("hero-zoomIn");
  zoomInButton.addEventListener('click', () => window.socket.emit('updateHero', { id: window.editingHero.id, zoomMultiplier: window.editingHero.zoomMultiplier - .0625 }))

  function sendHeroUpdate(update) {
    window.mergeDeep(window.editingHero, update)
    window.socket.emit('updateHero', window.editingHero)
  }
  window.sendHeroUpdate = sendHeroUpdate

  function sendEditorHeroOther(update) {
    // get the hero from the editor, everything except for the x, y values
    let hero = window.heroeditor.get()
    const heroCopy = Object.assign({}, hero)
    delete heroCopy.x
    delete heroCopy.y
    window.socket.emit('updateHero', heroCopy)
  }

  function sendEditorHeroPos() {
    let hero = window.heroeditor.get()
    window.socket.emit('updateHero', { id: hero.id, x: hero.x, y: hero.y })
  }

  function respawnHero() {
    window.socket.emit('respawnHero', editingHero)
    // let hero = heroeditor.get()
    // window.socket.emit('updateHero', { id: hero.id, x: hero.spawnPointX, y: hero.spawnPointY })
  }
  function resetHeroToDefault() {
    window.socket.emit('resetHeroToDefault', editingHero)
  }

  window.setEditingHero = function(hero) {
    window.editingHero = hero
    window.heroeditor.set(window.editingHero)
    window.heroeditor.expandAll()
  }

  window.getEditingHero = function() {
    window.heroeditor.set(window.heros[window.editingHero.id])
    window.heroeditor.expandAll()
  }

  window.findHero = function() {
    camera.setCamera(ctx, window.heros[window.editingHero.id])
  }

  window.setEditorToAnyHero = function () {
    // init to any hero
    if(window.heros.undefined) {
      window.socket.emit('deleteHero', 'undefined')
      delete window.heros.undefined
    }

    if(window.heros.null) {
      window.socket.emit('deleteHero', 'null')
      delete window.heros.null
    }

    for(var heroId in window.heros) {
      if(window.heros[heroId].tags && window.heros[heroId].tags.isPlayer) {
        window.setEditingHero(window.heros[heroId])
        break;
      }
    }
  }

}

function loaded() {
  if(window.world.syncHero) {
    window.syncHeroToggle.checked = true;
  }
}

export default {
  init
}
