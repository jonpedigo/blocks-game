const objectCompendium = {
  spawnZone: {
    tags: {
      spawnZone: true,
    },
    spawnLimit: 1,
    spawnPoolInitial: null,
    spawnPool: null,
    spawnObject: {
      tags: {
        obstacle: true,
        pacer: true,
        monster:true,
      }
    },
  },
  "coinman":{"velocityX":0,"velocityY":0,"velocityMax":100,"speed":100,"color":"#999","tags":{"obstacle":true,"stationary":false,"monster":false,"coin":true,"heroUpdate":false,"objectUpdate":false,"gameUpdate":false,"deleteAfter":false,"revertAfterTimeout":false,"gravity":false,"movingPlatform":false,"child":false,"onlyHeroAllowed":false,"noHeroAllowed":false,"chatter":false,"glowing":false,"flashing":false,"filled":false,"jittery":false,"invisible":false,"pacer":false,"lemmings":false,"wander":false,"goomba":false,"goombaSideways":false,"homing":false,"zombie":false,"spawnZone":false,"fresh":false},"spawnLimit":3,"spawnPoolInitial":10,"spawnPool":10,"spawnObject":{"tags":{"obstacle":true,"lemmings":true}},"width":10,"height":10,"x":0,"y":0,"spawnPointX":720,"spawnPointY":1160,"_initialX":720,"_initialY":1160,"compendiumId":"coinman"},"cheese-coin":{"width":5,"height":5,"velocityMax":100,"speed":100,"color":"yellow","tags":{"obstacle":false,"stationary":false,"monster":false,"coin":true,"heroUpdate":false,"objectUpdate":false,"gameUpdate":false,"deleteAfter":true,"revertAfterTimeout":false,"gravity":false,"movingPlatform":false,"onlyHeroAllowed":false,"noHeroAllowed":false,"chatter":false,"glowing":false,"filled":false,"invisible":false,"pacer":false,"lemmings":false,"wander":false,"goomba":false,"goombaSideways":false,"homing":false,"zombie":false,"spawnZone":false,"fresh":false},"compendiumId":"cheese-coin"},"cheese-powerup":{"velocityMax":100,"speed":100,"color":"yellow","tags":{"obstacle":false,"stationary":false,"monster":false,"coin":false,"heroUpdate":true,"objectUpdate":false,"gameUpdate":false,"deleteAfter":true,"revertAfterTimeout":true,"gravity":false,"movingPlatform":false,"onlyHeroAllowed":false,"noHeroAllowed":false,"chatter":false,"glowing":false,"filled":true,"invisible":false,"pacer":false,"lemmings":false,"wander":false,"goomba":false,"goombaSideways":false,"homing":false,"zombie":false,"spawnZone":false,"fresh":false},"width":20,"height":20,"compendiumId":"cheese-powerup","heroUpdate":{"color":"yellow","tags":{"monsterDestroyer":true}}},"ghost-homing":{"velocityMax":100,"speed":100,"color":"#999","tags":{"obstacle":false,"stationary":false,"monster":true,"coin":false,"heroUpdate":false,"objectUpdate":false,"gameUpdate":false,"deleteAfter":false,"revertAfterTimeout":false,"gravity":false,"movingPlatform":false,"onlyHeroAllowed":false,"noHeroAllowed":false,"chatter":false,"glowing":false,"filled":false,"invisible":false,"pacer":false,"spelunker":false,"lemmings":false,"wander":false,"goomba":false,"goombaSideways":false,"homing":true,"zombie":false,"spawnZone":false,"fresh":false},"compendiumId":"ghost-homing"},"ghost-spelunker":{"velocityMax":100,"speed":100,"color":"#999","tags":{"obstacle":false,"stationary":false,"monster":true,"coin":false,"heroUpdate":false,"objectUpdate":false,"gameUpdate":false,"deleteAfter":false,"revertAfterTimeout":false,"gravity":false,"movingPlatform":false,"onlyHeroAllowed":false,"noHeroAllowed":false,"chatter":false,"glowing":false,"filled":false,"invisible":false,"pacer":false,"spelunker":true,"lemmings":false,"wander":false,"goomba":false,"goombaSideways":false,"homing":false,"zombie":false,"spawnZone":false,"fresh":false},"compendiumId":"ghost-spelunker"}
}

export default objectCompendium
