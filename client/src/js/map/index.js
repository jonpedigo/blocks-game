import render from './render'
import cameraTool from './camera.js'
import constellation from './constellation.js'
import modals from './modals.js'

window.MAP = {
  canvas: null,
  ctx: null,
  camera: new cameraTool()
}

MAP.onPageLoaded = function() {
  document.getElementById("play-editor").style = 'display:none';

  // Canvas SETUP
  MAP.canvas = document.createElement("canvas");
  MAP.ctx = MAP.canvas.getContext("2d");
  if(PAGE.role.isPlayer) {
    function onResize() {
      MAP.canvasMultiplier = window.innerWidth/640;
      MAP.canvas.width = 640 * MAP.canvasMultiplier;
      MAP.canvas.height = 320 * MAP.canvasMultiplier;
      constellation.onResize(MAP.ctx)
    }
    window.addEventListener("resize", onResize);
    onResize()
  }

  MAP.canvas.id = 'game-canvas'
  document.body.appendChild(MAP.canvas);

  MAPEDITOR.set(MAP.ctx, MAP.canvas, MAP.camera)
}

MAP.onStartQuest = function(hero, questId) {
  const quest = hero.quests[questId]
  if(hero.id === HERO.id && quest) {
    if(quest.startMessage.length) {
      modals.openModal(quest.id + ' Started!', quest.startMessage)
    } else {
      modals.openQuestToast(quest.id + ' started')
    }
  }
}

MAP.onCompleteQuest = function(hero, questId) {
  const quest = hero.quests[questId]
  if(hero.id === HERO.id && quest) {
    if(quest.completionMessage.length) {
      modals.openModal(quest.id + ' Complete!', quest.completionMessage)
    } else {
      modals.openQuestToast(quest.id + ' completed')
    }
  }
}

MAP.onRender = function(delta) {
  render.update()
  if(PAGE.role.isPlayer && GAME.heros[HERO.id].animationZoomMultiplier) {
    constellation.onRender()
  }
}
